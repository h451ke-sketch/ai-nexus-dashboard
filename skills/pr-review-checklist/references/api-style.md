# API style guide (excerpt)

- URLs use `kebab-case`. Example: `/billing/annual-prorations`.
- JSON keys use `snake_case`. Example: `{"customer_id": "...", "created_at": "..."}`.
- Timestamps are RFC 3339 strings in UTC. Never Unix epochs.
- Errors follow the shape `{ "error": { "code": "<machine_code>", "message": "<human_text>" } }`.
- Pagination uses opaque `cursor` tokens, never offsets.
