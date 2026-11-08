---
name: aws-deployment
description: Deploy to AWS — ECS Fargate task definition/service/ALB health checks, Elastic Beanstalk, Lambda zip vs container image, S3+CloudFront static, EC2/Lightsail with a systemd unit, IAM least-privilege and aws sts get-caller-identity, security groups vs the listening port, RDS reachability and migrations, CloudWatch logs, SSM/Secrets Manager, and the 502-from-ALB causes.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# AWS Deployment

AWS is a bag of primitives, not a platform: you assemble the network path yourself, and every break in it looks like a 502 or a timeout.

1. **Prove which identity and region you are deploying as** — `aws sts get-caller-identity` and `aws configure list` (or `AWS_PROFILE`/`AWS_REGION`). Deploying with a stale profile into the wrong account is silent and expensive; the identity's IAM permissions decide what the next three commands can even do.
2. **ECS Fargate: task definition, service, and the port contract** — the task definition names the image digest (not `:latest`), `containerDefinitions[].portMappings` = the port the app binds, and `logConfiguration` → `awslogs` to a CloudWatch group. The service's target group health check path/port must match the app's real health endpoint. Then `aws ecs update-service --cluster <c> --service <s> --force-new-deployment` and `aws ecs wait services-stable --cluster <c> --services <s>`.
3. **The classic "works locally, 502 from the ALB" has exactly three causes** — (a) the container listens on a different port than the target group expects — set the app to read the platform contract and listen on the mapped port, and bind `0.0.0.0`; (b) the health-check PATH returns 401/404 (an auth-protected or nonexistent `/health`), so the target is marked unhealthy and the ALB returns 502/503 with no app log line; (c) the security group on the *service* does not allow inbound from the *ALB's* security group on that port. Check the target group's health tab before reading application code.
4. **Lambda: know zip vs container and the three settings that bite** — zip (≤50MB artifact, needs `handler` + a compatible runtime) vs container image (≤10GB, must implement the Lambda runtime API). `Timeout` (default 3s — a query that takes 6s dies with no stack), `MemorySize` (also scales CPU), and `Handler` path (`dist/index.handler`, not `index.js`). `aws lambda update-function-code` + `aws lambda invoke --function-name <fn> --payload '{}' out.json` and then read `out.json`.
5. **S3 + CloudFront for static** — `aws s3 sync ./dist s3://<bucket> --delete`, then `aws cloudfront create-invalidation --distribution-id <id> --paths '/*'`. Set the index document AND map 403/404 to `index.html` with 200 so SPA routes resolve. Without the invalidation the CDN keeps serving the previous build for the full TTL.
6. **EC2/Lightsail: a systemd unit, not a background `&`** — install the service as `/etc/systemd/system/app.service` (`ExecStart`, `WorkingDirectory`, `Restart=on-failure`, `EnvironmentFile=/etc/app.env`), `systemctl daemon-reload && systemctl enable --now app`, and read it with `journalctl -u app -n 100 --no-pager`. Put the instance in a security group open on 80/443 only, and terminate TLS at an ALB or with certbot.
7. **RDS reachability and migrations are a network problem first** — the RDS security group must allow the app's security group on 5432/3306 (not a CIDR), the DB must be in the same VPC/subnets, and `connection timeout` in prod usually means a missing route, not a bad password. Run migrations as an explicit deploy step (a one-off ECS task or a Lambda) against that environment's DB — never on container start in a multi-replica service, where two replicas race the same migration.
8. **Logs and secrets have one canonical home** — CloudWatch Logs (`aws logs tail /ecs/<service> --follow --since 10m`) is the only place a container's stdout exists after the task restarts; do not rely on `docker logs` on Fargate. Keep credentials in SSM Parameter Store (`/app/prod/DB_URL` SecureString) or Secrets Manager and inject them via `secrets`/`valueFrom` — plaintext env vars are readable in the task definition and console.
9. **Least privilege for the deploy identity** — the CI role needs push to one ECR repo, update on one ECS service/task-definition, and `iam:PassRole` on the execution role only. Broad `*` deploy policies are how a compromised pipeline becomes an account takeover.
10. **Verify the PUBLIC endpoint after deploy** — `curl -sS -o /dev/null -w '%{http_code} %{time_total}s\n' https://<domain>/health` and the real API path from outside the VPC; a healthy target group plus a passing `aws ecs wait` still does not prove the route, certificate, or env vars work. Then run the checklist in `deployment-verification`.

## Related skills

- `deployment-strategy` — choosing ECS vs Lambda vs static, and rollback paths.
- `deployment-verification` — proving the deployed endpoint serves the new build.
- `docker-container` — the image ECS/Fargate runs.
- `serverless-edge-deployment` — Lambda/API Gateway specifics for on-demand endpoints.
- `database-migration` — running schema changes as a controlled deploy step.
- `secret-management` — SSM/Secrets Manager over plaintext env vars.

───
