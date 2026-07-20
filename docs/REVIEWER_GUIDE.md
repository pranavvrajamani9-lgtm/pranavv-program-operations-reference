# Reviewer guide

## For nontechnical reviewers

Start with the `README.md`, then open a demo in a browser. Each demo answers three simple questions:

1. **What problem is this designed to solve?** The headline and short introduction explain it in plain language.
2. **What can a user do?** Interact with the visible controls using entirely synthetic data.
3. **Why is it public demo code instead of the real product?** The highlighted notice explains the privacy, security, and proprietary-information boundary.

No login, payment, API key, download, or setup is required for the browser-only demos.

## For technical reviewers

Start with `program-command-center-demo/` and run `npm run demo:command-center`.

The demo includes:

- a small dependency-free HTTP API;
- an explicit state transition map;
- idempotency keyed by request ID;
- append-only audit events;
- API-level tests for success, invalid state movement, and safe retry;
- a browser UI that consumes the local API.

Then review `docs/ARCHITECTURE.md` and the focused browser demos. The code is intentionally compact, original, and synthetic so the public implementation can be understood without granting access to a private production system.

## What is deliberately absent

These demos omit production source, data, infrastructure, credentials, authentication, billing, third-party providers, telemetry, private prompts, database schemas, and customer operations. Their absence is intentional and documented—not an attempt to make a static mockup look like a production service.
