# API contract

The public reference server exposes two intentionally small endpoints. All values are synthetic and stored in memory.

## List leads

`GET /api/leads`

Required header: `x-tenant-id`

Returns only records that match the supplied tenant ID. Missing tenant context returns `400`.

## Advance a lead

`POST /api/leads/:leadId/transitions`

Required headers:

- `x-tenant-id`
- `x-actor-id`
- `x-actor-role` (`admin` or `operator`)
- `idempotency-key`

Request body:

```json
{ "targetStatus": "qualified" }
```

The application service checks actor role, tenant ownership, request idempotency, and the lifecycle transition policy before saving the update and appending an audit event.

| Result | Response |
| --- | --- |
| Accepted transition | `200` with the updated lead and `replayed: false` |
| Replayed idempotency key | `200` with the original result and `replayed: true` |
| Missing/invalid operator | `403` |
| Lead outside active tenant | `404` |
| Skipped or terminal transition | `409` |

## Production boundary

This contract demonstrates the shape of a safe mutation. It intentionally omits authentication middleware, durable persistence, rate limiting, telemetry, abuse controls, and external providers; those belong to the private production implementation.
