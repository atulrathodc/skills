---
name: infrastructure-as-code
description: Write, plan, and apply Terraform, OpenTofu, and Pulumi infrastructure safely — remote state and locking, plan review before apply, drift detection, prevent_destroy on stateful resources, module boundaries, and secret hygiene.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Infrastructure as Code

IaC turns a one-line typo into a deleted production database if applied carelessly. Treat infrastructure state with the same rigor as production data, and inspect every plan line before applying.

1. **Always use remote state with locking — never commit `terraform.tfstate`** — store state in an encrypted remote backend (S3 + native/DynamoDB locking, GCS, Terraform Cloud, or Pulumi Cloud) with versioning enabled. Local state breaks teams and loses track of live cloud resources; committed state leaks secrets in plaintext.
2. **Never run `apply` without reviewing a saved `plan` first** — run `terraform plan -out=tfplan`, inspect every `+ create`, `~ update`, and especially `-/+ destroy and then create` (replacement) line, then apply that exact plan (`terraform apply tfplan`). Never blindly pass `-auto-approve` against production.
3. **Protect stateful resources against accidental replacement** — put `lifecycle { prevent_destroy = true }` on databases, S3 buckets with user data, KMS keys, and DNS zones. Renaming a resource block in code without a `moved {}` block (or `terraform state mv`) will destroy and recreate the live resource.
4. **Isolate blast radius by environment and lifecycle layer** — separate `dev`, `staging`, and `prod` into distinct state files (separate directories/backends rather than a single giant state) and separate slow-changing foundational infra (VPC, IAM, RDS) from fast-changing app services so an app deploy cannot touch the network or DB.
5. **Keep secrets out of `.tf` files, `.tfvars` in git, and state wherever possible** — mark sensitive variables/outputs `sensitive = true`, create the secret *container* (AWS Secrets Manager / GCP Secret Manager) in IaC, and populate secret *values* out-of-band or via ephemeral/write-only attributes so plaintext passwords are not persisted in state.
6. **Pin provider and module versions strictly** — set `required_providers` with explicit version constraints (`~> 5.0`), commit `.terraform.lock.hcl`, and pin third-party modules to immutable git tags or registry versions so a Friday `terraform init` never pulls a breaking provider upgrade.
7. **Import existing cloud resources rather than recreating or leaving them unmanaged** — use `import {}` blocks (Terraform 1.5+) or `terraform import` to bring click-ops resources under IaC control, and verify `terraform plan` shows zero diff afterward.
8. **Detect and resolve drift explicitly** — run scheduled read-only `terraform plan -detailed-exitcode` in CI to catch manual console changes early. Reconcile drift intentionally (update code to match desired reality or revert the console edit) before applying unrelated changes.
9. **Keep modules small, composable, and opinionated** — wrap repeated resource bundles (e.g., an ECS service + ALB target group + IAM role + log group) into clean modules with typed variables and validation blocks; avoid thin wrapper modules that just mirror every argument of one provider resource.
10. **Validate formatting, linting, and security before every PR** — run `terraform fmt -check -recursive`, `terraform validate`, and a static scanner (`tflint` / `checkov` / `trivy config`) to catch open `0.0.0.0/0` security groups, unencrypted buckets, and wildcard IAM policies before plan time.

## Related skills

- `aws-deployment` — AWS primitives, IAM, and service boundaries.
- `gcp-azure-deployment` — GCP and Azure managed services.
- `kubernetes-deployment` — cluster workloads managed alongside IaC.
- `ci-cd-pipeline` — running plan-on-PR and gated apply-on-merge with OIDC.
- `env-secrets-management` — keeping cloud credentials and runtime secrets out of state.
