# Architecture notes

## Intent

This repository is deliberately split between lightweight browser demos and one runnable full-stack reference in `program-command-center-demo/`. The split keeps each example small enough to inspect while still showing backend-oriented engineering practices.

## Full-stack reference: Program Command Center

```text
Browser UI
  └── GET /api/leads
  └── POST /api/leads/:id/transition
          └── ordered transition guard
          └── request-id idempotency store
          └── append-only audit event
          └── JSON response boundary
```

The API is intentionally local and dependency-free. Production systems would replace the in-memory store with an authenticated, tenant-scoped durable data layer and would add validation, observability, rate limits, and provider-specific delivery adapters. Those production details are not copied here.

## Public boundary

All demos use invented data. No demo imports production code, credentials, database schemas, client records, family/parent data, research data, outreach content, model prompts, or external-provider configuration.
