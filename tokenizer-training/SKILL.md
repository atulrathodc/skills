---
name: tokenizer-training
description: Train a tokenizer (BPE/Unigram) for LLM pretraining or fine-tuning — vocab size, data sample, special tokens, quality checks.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Tokenizer Training

Train a tokenizer on the data you will actually train on (not a random default).

1. **Sample data** — take a representative sample of YOUR final training mix (web + code + domain) large enough to be stable (hundreds of MB–GBs for big vocabs). Never train a tokenizer on data that leaks through eval sets.
2. **Choose algorithm + vocab** — BPE or Unigram; vocab size from your budget/architecture (≈32k for small models up to 128–256k for large/multilingual). Pick `vocab_size` and decide byte-fallback vs pre-tokenization.
3. **Special tokens** — reserve and order specials (pad/bos/eos/unk + your chat/control tokens) BEFORE training so ids are stable.
4. **Train** — HF `tokenizers` (BPE/Unigram trainers) or `sentencepiece` (`--model_type=bpe/unigram --vocab_size=...`). Keep the pre-tokenizer consistent with your model family (whitespace/byte-level).
5. **Verify quality** — tokens/s and average tokens per word on your domain; no excessive ids; round-trip decode works; special-token ids fixed. A bad tokenizer silently inflates your effective token budget.

Reference: Hugging Face `tokenizers`, `sentencepiece` docs; mlx-lm uses HF tokenizers under the hood.
