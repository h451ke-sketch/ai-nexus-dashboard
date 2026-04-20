---
name: incident-response
description: Lead the response to a production incident using the company's runbook. Use when the user reports an outage, a paging alert, an SLO burn, a customer-impacting bug, or asks for an incident commander walkthrough.
version: 1.0.0
license: Internal
tags:
  - oncall
  - incident
  - operations
---

# incident-response

The minimum set of steps to take when something is on fire in production.

## When to use

- A page from the alerting system (`#alerts-prod`).
- A customer report of degraded behaviour, confirmed reproducible.
- An SLO burn warning (`error_budget_remaining < 25%` over a 1h window).

## Procedure

### 1. Acknowledge (within 5 minutes)

- Click **Ack** in the pager. This stops re-pages.
- Post the incident's permalink in `#incidents`.

### 2. Open an incident channel

```bash
co incident open --severity <sev> --summary "<one line>"
```

`<sev>` is one of `sev1` (full outage / data loss), `sev2` (major degraded function), `sev3` (minor / internal only).

The CLI creates a Slack channel and a Notion page, and assigns you as **Incident Commander (IC)**.

### 3. Stabilise before investigating

In order:

1. **Roll back** the most recent deploy if the timing matches.
2. **Failover** to the secondary region if a single region is impacted.
3. **Disable the feature flag** that wraps the affected code path, if one exists.

It is acceptable — and often correct — to stabilise first and find root cause later.

### 4. Communicate

- Update the incident channel topic every 30 minutes even if there is no progress.
- For sev1/sev2, post a customer-facing status page update via `co status post`.

### 5. Resolve

- Confirm metrics are back to baseline for at least 15 minutes.
- Close with `co incident close --root-cause "<short>"`.

### 6. Postmortem (within 5 business days)

- Use `references/postmortem-template.md`.
- Schedule a 30-minute review with the team.
- File at least one action item in the relevant repo.

## Validation

You are done when:

- The incident is marked **Resolved** in the tracker.
- A draft postmortem exists in Notion.
- Action items have owners and target dates.

## Common pitfalls

- Do not skip step 1 to "save time". Acknowledging is what stops the noise.
- Do not investigate root cause while users are still impacted. Stabilise first.
- Do not assign blame in the postmortem. Focus on the system, not the person.
