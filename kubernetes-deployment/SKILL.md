---
name: kubernetes-deployment
description: Deploy and debug container workloads on Kubernetes — Deployment replicas/strategy, resource requests and limits, liveness vs readiness vs startup probes, Service/Ingress, ConfigMap/Secret, kubectl rollout status/undo/restart, logs --previous for CrashLoopBackOff, ImagePullBackOff, OOMKilled, Pending pods, HPA, namespace/context mixups, and Helm.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Kubernetes Deployment

On Kubernetes the workload spec is the deployment: a pod that starts is not a pod that serves.

1. **Pin the context and namespace before anything else** — `kubectl config current-context` and `kubectl config view --minify | grep namespace`. The most common "my deploy did nothing" is applying to the wrong cluster or namespace; pass `-n <ns>` explicitly, or set it in the manifest.
2. **Write a Deployment with explicit resources and a real strategy** — `spec.replicas`, `spec.strategy.rollingUpdate.maxSurge/maxUnavailable`, and per-container `resources.requests` (what the scheduler reserves) and `limits` (what the kubelet enforces). No requests → the pod is scheduled anywhere and starves; no limits → one leak evicts neighbours. A CPU limit that is too low throttles silently and looks like a slow app.
3. **Use all three probes for their actual purposes** — `startupProbe` covers a slow boot (without it a slow start fails the liveness probe and the pod is killed in a loop); `readinessProbe` controls whether the Service sends traffic (too strict → pods never Ready → 503s; too lax → traffic to a pod that cannot serve); `livenessProbe` restarts a wedged process (pointing it at a dependency makes a DB blip restart the whole fleet). Probe `httpGet: path=/health, port`, never a path that requires auth.
4. **Wire Service → Ingress and match the container port** — `Service.spec.ports.targetPort` must equal the `containerPort` your app actually binds (and bind `0.0.0.0`, not `127.0.0.1`). Ingress annotates the ingress class and path; a 404 with a healthy pod means the Ingress `path`/`host` does not match, not that the app is broken.
5. **Config lives in ConfigMap/Secret, mounted or env-injected** — `envFrom: [configMapRef: {name: app-config}]`; edit + `kubectl rollout restart deployment/<name>` to pick up changes (env vars are read at pod start and never hot-reload — the classic "I changed the config and nothing happened"). Secrets should come from an external store or a sealed-secret mechanism, not a committed plaintext `Secret`.
6. **Roll out and read the result** — `kubectl apply -f k8s/` then `kubectl rollout status deployment/<name> --timeout=180s` (it BLOCKS until the new ReplicaSet is available and fails loudly on a stuck rollout). `kubectl rollout undo deployment/<name>` is your rollback; `kubectl rollout restart` cycles pods onto new config. `kubectl get pods -o wide` + `kubectl describe pod <pod>` is where every diagnosis starts — the Events tail names the cause.
7. **Diagnose by pod status** — `CrashLoopBackOff` → `kubectl logs <pod> --previous` (the current container has not produced output yet, the previous one has the crash). `ImagePullBackOff`/`ErrImagePull` → wrong tag, private registry without `imagePullSecrets`, or the node cannot reach the registry. `OOMKilled` (`describe` → Last State, exit 137) → the memory limit is below the app's real usage; raise it or fix the leak, do not just raise it blindly. `Pending` → `describe` shows `0/N nodes available: insufficient cpu/memory` or an unsatisfiable `nodeSelector`/taint.
8. **Scale with the HPA, but only after requests are set** — `kubectl autoscale deployment/<name> --cpu-percent=70 --min=2 --max=10`. The HPA computes utilisation as a percentage of `requests`; with no requests it reports `<unknown>` and never scales.
9. **Helm for anything repeated** — `helm upgrade --install <release> <chart> -f values-prod.yaml --namespace <ns> --wait --timeout 5m` gives atomic-ish upgrades and `helm rollback <release> <rev>`; `helm history` answers "what is running". `--wait` makes the command block on healthy pods instead of returning immediately.
10. **Verify inside the cluster, not only through the Ingress** — `kubectl rollout status` green first, then `kubectl port-forward svc/<name> 8080:<port>` and `curl -sS http://localhost:8080/health` to prove the POD serves independently of ingress/TLS/DNS. If port-forward works and the public URL 502s, the fault is Service/Ingress/controller. Then complete `deployment-verification`.

## Related skills

- `deployment-strategy` — whether Kubernetes is the right target and how to roll back.
- `deployment-verification` — proving the new ReplicaSet actually serves.
- `docker-container` — building the exact image the Deployment references.
- `runtime-crash-recovery` — why the process itself dies on boot.
- `observability` — logs/metrics that make a rollout failure visible.
- `secret-management` — getting credentials into the cluster safely.

───
