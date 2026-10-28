---
name: ltx-video
description: Drive LTX-Video (Lightricks) — the DiT-based fast video model — for text-to-video, image-to-video and video extension; pick the right checkpoint and pipeline and get sane defaults.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# LTX-Video

LTX-Video is a Diffusion Transformer (DiT) video model from Lightricks that produces ~24 fps clips faster than real time on a good GPU. Most agent failures come from three drift traps: the `diffusers` integration changes between minor releases, checkpoint generations have very different step/CFG requirements, and the VAE rejects arbitrary frame counts and resolutions. This model is fast-moving — **treat every version number and default in this skill as a starting point and check the current model card on the Hub before committing to a run.** This skill is the companion to `video-generation-optimization` (make it fast) and `optimization-techniques` (the wider map).

1. **Understand what it is** — a 2B-parameter-class DiT video generator that samples latent frames and decodes them to ~24 fps video. Use it through the Hugging Face `diffusers` pipelines (`LTXPipeline` for text-to-video, `LTXImageToVideoPipeline` for image-to-video, `LTXConditionPipeline` for multi-condition control, and `LTXLatentUpsamplePipeline` for latent upscaling), or via the Lightricks `LTX-Video` research repo / ComfyUI nodes. **Pin your `diffusers` version** (`pip install "diffusers>=0.32"` or a specific hash) — the LTX API renames arguments and changes defaults between releases, and an unpinned environment silently breaks on a fresh checkout.
2. **Pick a checkpoint generation, stated carefully** — the **LTX-Video 0.9.x 2B family** (`0.9.0/0.9.1/0.9.2/0.9.3/0.9.5`) shares one architecture; the frequently-used base is `Lightricks/LTX-Video`. `.9.5` ships support for higher resolutions and multi-condition (text + image + audio) prompting. There are **distilled variants** (a `-distilled` suffix or a Turbo equivalent) that need far fewer steps. **LTX-2** is a newer, larger generation with synchronized audio+video, a different API, and its own model card. Do not assume everything below applies verbatim to LTX-2 — read its card. If the task says "LTX-Video", default to the 0.9.x 2B base; get an explicit model string when the user names "LTX-2".
3. **VAE constraints decide your shape first** — LTX's VAE compresses `8k+1` frames (temporal) and `32`-divisible spatial dims. A valid `num_frames` is `8k+1` (e.g. 9, 17, 25, 33, 41, 49, 65, 97, 121…), and width/height must be divisible by 32 (e.g. 768×512, 1280×768). Passing `num_frames=50` or `W=800` raises an `AssertionError` or silently rounds — pick values from the valid set before constructing the pipeline.
4. **Sane first run (text-to-video)** — a minimal, working baseline:
   ```python
   import torch
   from diffusers import LTXPipeline
   from diffusers.utils import export_to_video

   pipe = LTXPipeline.from_pretrained(
       "Lightricks/LTX-Video", torch_dtype=torch.bfloat16
   )
   pipe.enable_model_cpu_offload()            # fits in ~16 GB; drop for >24 GB

   prompt = "cinematic close-up of a lighthouse, golden-hour rim light, "
            "waves crashing, slow dolly-in camera movement"
   video, fps = pipe(
       prompt=prompt,
       negative_prompt="low quality, blurry, flicker, text",
       num_frames=49,        # 8k+1
       width=768, height=512,# % 32 == 0
       num_inference_steps=40,
       guidance_scale=3.0,
       generator=torch.Generator("cpu").manual_seed(0),
   ).frames[0]
   export_to_video(video, fps=fps, output_video_path="out.mp4")
   ```
   The `generator` is required for seeded runs; `enable_model_cpu_offload()` trades a little VRAM for a large memory saving and is the fastest path to a first clip.
5. **Prompt for motion explicitly** — video models reward explicit shot/camera language: state the shot type ("aerial", "close-up", "dolly-in", "pan left"), subject and action, scene, lighting, and camera movement. "A dog runs" is weak; "low-angle tracking shot, a golden retriever running through tall grass toward camera, motion blur, overcast sky, camera follows the dog" is strong. Keep the **negative prompt short and generic** ("low quality, blurry, flicker, watermark, text") — long negative lists fight the short-prompt tokenizer and introduce artifacts.
6. **Image-to-video** — use `LTXImageToVideoPipeline` and pass the source image; the image should match the target aspect ratio/resolution (the pipeline conditions on it, so a mismatched image is cropped/letterboxed). `strength` / noise level controls how much of the conditioning image shows through: low strength ≈ near-static, high strength ≈ more motion and drift from the source. Start with the model card's default and only raise strength if the clip is frozen, or lower it if the subject warps.
7. **Distilled vs base is the biggest quality/time trap** — a **distilled** checkpoint is trained to converge in single-digit steps with very low or no CFG (e.g. 4–8 steps, `guidance_scale≈1.0` or `0`); a **base** checkpoint wants tens of steps and `guidance_scale≈3`. Running base-model step counts and high CFG on a distilled checkpoint wastes compute and produces smeared, over-saturated, "double-exposure" frames. Read the card for the exact recipe; when unsure, prefer the base model with 30–50 steps.
8. **Budget memory with arithmetic** — latent + decode memory scales with `frames × resolution`; peaks live in the transformer (latents, bf16) and the VAE decode. Rough guide: `49` frames at `768×512` fits comfortably in ~16–24 GB with `enable_model_cpu_offload()` and may OOM at `1280×768` / `121` frames on a 16 GB card. Keep the pipeline in `torch.bfloat16` (fp32 roughly doubles transformer memory and slows it — but never run fp16 through the LTX VAE, see the next item). When VRAM is tight: cpu/sequential offload, VAE tiling (`pipe.vae.enable_tiling()`), or a pre-quantized checkpoint / `torchao` / bitsandbytes quantized load (see `quantization`, `fp8`).
9. **Watch the fp16 → black-frame failure** — casting the VAE to `fp16` and then decoding can produce NaN → **black or garbage frames with no error**. Keep the VAE (and text encoder) in `bf16`/fp32 precision and reserve fp8/fp16 quantization for the main DiT transformer. A "video decodes but every frame is black" symptom is almost always a precision/NaN issue, not a prompt issue.
10. **Attention and compile backends** — LTX runs through SDPA by default; enable FlashAttention where your GPU supports it (`torch.backends.cuda.enable_flash_sdp(True)` or set `attention_op` if exposed). `torch.compile(pipe.transformer, mode="reduce-overhead")` gives real speed-ups but has a **long first-call warmup** (minutes of Triton compilation) — pay it once and amortize across many generations, or skip it for a single throwaway clip. Dynamo recompiles when shapes change, so fix your resolution/frames for a batch of generations.
11. **Determinism** — pass an explicit `torch.Generator("cpu").manual_seed(seed)` per generation. Same seed + same script + same `diffusers`/`torch` versions → the same clip. The moment any version or dtype changes, the same seed produces a different clip — log package versions alongside each seed if you need reproducible outputs or regression baselines.
12. **Verify with a decoded artifact, not a status code** — generate a short clip, then assert the real output: the returned video has the requested frame count and resolution, and frames are not blank/identical. Load the MP4 with `imageio`/`cv2`, check `(N_frames, H, W, 3)` shape, and confirm non-degenerate motion via per-frame pixel std and inter-frame difference (a static or uniform-frame clip means the decode or the sampler failed even though `pipe(...)` returned). Report `seconds/clip` and peak VRAM (`torch.cuda.max_memory_allocated() / 1e9`) next to the generation parameters. A clip that "rendered" but is a single repeated frame is a failed generation, not a pass.

## Common failures
- **`num_frames` / dims assertion error** → you passed a non-`8k+1` frame count or non-`%32` width/height. Pick 49 (or 97/121) frames and 768×512 / 1280×768.
- **Smeared, over-saturated output** → distilled checkpoint run with base-model step count and high CFG. Cut to single-digit steps and `guidance_scale≈1`.
- **Black frames, no error** → the VAE ran in fp16 and hit NaN. Keep the VAE/text-encoder in bf16/fp32; quantize only the transformer.
- **Nearly static clip** → image-to-video `strength` too low, or a base checkpoint with too-few steps. Raise steps (base) or raise `strength` (i2v).
- **OOM at higher res / more frames** → 16 GB card with no offload. Add `enable_model_cpu_offload()`, VAE tiling, then quantization.
- **Different output every run for "the same" seed** → an un-pinned package version or missing per-run generator. Pin `diffusers`/`torch` and always pass the generator.

## Verify
- Run the §4 snippet (or a 25-frame subset to be quick) and assert: exported MP4 has the requested `num_frames` and `W×H`; `np.std(frame)` > 0 across frames and mean inter-frame difference > 0 (not static/blank); recorded `elapsed / 60` (or per-clip) and `torch.cuda.max_memory_allocated()/1e9` GB.
- Re-run with the same seed after pinning versions and confirm the byte-identical (or visually identical) clip for the determinism claim.
- For image-to-video, confirm the first frames match the conditioning image and the subject does not collapse to noise.

## Related skills
- `video-generation-optimization` — the performance counterpart: steps, resolution, precision, batching, decode cost.
- `optimization-techniques` — the umbrella survey of every ML optimization axis, with a decision table.
- `quantization` / `fp8` / `int8` — shrinking the quantized model when VRAM is tight; fp16 VAE caveat.
- `gpu-optimization` / `apple-silicon-optimization` — backend and memory tuning that governs generation speed.
- `mlx-multimodal` — running video/multimodal models on Apple unified memory.
- `game-assets-and-loading` — the asset-lifecycle mindset (budget, tiling, dispose) that applies to video decode/output.
- `benchmarking` — sound before/after measurement for any latency/VRAM claim.
