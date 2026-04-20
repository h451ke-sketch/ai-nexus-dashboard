---
name: internal-deploy
description: Deploy services to the company's staging or production clusters using the internal `co deploy` CLI. Use when the user asks to ship a service, push a release, roll back a deployment, or check deploy status against any internal environment.
version: 1.2.0
license: Internal
tags:
  - devops
  - deployment
  - internal
---

# internal-deploy

Procedural knowledge for shipping code through the company's internal deploy pipeline.

## When to use

- The user mentions a service name from `services.yaml` and asks to "deploy", "ship", "release", "promote", or "roll back".
- The user asks for the current deploy status of an environment.
- The user wants to compare what is on staging vs. production.

Do **not** use this skill for vendor cloud deployments (Vercel, AWS, etc.) — those are covered by their own skills.

## Required inputs

| Input | Where to get it |
| --- | --- |
| `service` | Name registered in `infra/services.yaml`. Confirm with the user if ambiguous. |
| `environment` | One of `dev`, `staging`, `prod`. Default to `staging` if unspecified. |
| `ref` | Git SHA, tag, or branch. Default to current `HEAD`. |

## Step-by-step procedure

1. **Sanity check the environment**
   ```bash
   co deploy status <service> --env <environment>
   ```
   Confirm the currently deployed ref and that the cluster is healthy.

2. **Plan the change**
   ```bash
   co deploy plan <service> --env <environment> --ref <ref>
   ```
   Review the diff. If it touches infra (Terraform), stop and route to `infra-change-review` skill.

3. **Apply**
   ```bash
   co deploy apply <service> --env <environment> --ref <ref> --reason "<short message>"
   ```
   The reason is required for prod and is recorded in the audit log.

4. **Verify**
   - Wait for the post-deploy smoke job: `co deploy wait <deployment-id>`
   - Check the service's `/healthz` endpoint via the gateway.

5. **Announce** (prod only)
   - Post the deployment ID to `#releases` on Slack via `co notify release <deployment-id>`.

## Rollback

```bash
co deploy rollback <service> --env <environment>
```

This reverts to the previous successful deployment. Always rollback before debugging in prod.

## Common failure modes

- **`error: stale plan`** — someone else deployed in between. Re-run `plan` then `apply`.
- **`error: pending migration`** — the service has DB migrations queued. Run `co db migrate <service> --env <environment>` first, then redeploy.
- **`error: budget locked`** — env is in a release freeze. Check `#release-freeze` for the schedule.

## Validation

You are done when:

- `co deploy status` shows the new ref as `active` with `healthy: true`.
- The smoke test job exited 0.
- Slack `#releases` shows the announcement (prod only).
