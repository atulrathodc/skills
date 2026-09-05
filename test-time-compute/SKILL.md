---
name: test-time-compute
description: Scale compute at inference: best-of-N, self-consistency, search, or longer CoT.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---
# Test Time Compute

**When:** One greedy sample is wrong; you can afford more inference compute.

1. Choose method: sample N and majority-vote (self-consistency), best-of-N with a verifier/RM, or beam/search over reasoning.
2. Budget tokens/latency; pick N or depth by the accuracy-vs-cost curve.
3. Combine a verifier to select, not just vote, where answers are checkable.
4. Eval accuracy as a function of compute; stop when gains flatten.
Verify: accuracy↑ vs samples/cost; measured, not assumed.
