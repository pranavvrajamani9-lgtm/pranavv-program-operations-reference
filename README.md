# Product Demos — Pranavv Rajamani

## Why these are demos

These are **sanitized, public demonstrations** of the product and engineering patterns behind private work. They are not copies of the production applications.

The exact repositories remain private because they contain proprietary product logic, internal operating workflows, security-sensitive access controls, third-party integration boundaries, and—in some products—client, parent/family, prospect, or research data models. Publishing those systems would expose information that is not mine to distribute and would weaken the security boundary around real products.

Each demo is intentionally built with:

- synthetic names, records, metrics, and activity;
- local browser-only state—no API keys, database, analytics, or provider calls;
- original public code that demonstrates UI, state, validation, and workflow patterns;
- a clear separation from the corresponding private production product.

That distinction is a professional feature, not a limitation: reviewers can inspect runnable code and product judgment without requiring access to client or production systems.

## Demos

**Use the demos in your browser:** [Open the live interactive demo hub](https://pranavv-rajamani-portfolio.pranavvrajamani9.chatgpt.site/demos)

| Demo | What it demonstrates |
| --- | --- |
| [Hoop Nest](./hoop-nest-demo) | Role-aware sports-program dashboard, events, and attendance interaction. |
| [Program Command Center](./program-command-center-demo) | Runnable full-stack reference: local API, guarded transitions, idempotency, and audit evidence. |
| [SignalDesk](./signaldesk-demo) | Evidence-first research review with explicit confidence and counterarguments. |
| [Outreach Research Engine](./outreach-research-demo) | Readiness gates that stop incomplete research becoming send-ready outreach. |
| [Dial AI](./dial-ai-demo) | Simulated sales-practice feedback with no external AI or account data. |

## Run locally

Open any `index.html` in a browser. Each demo is dependency-free and runs entirely in the browser. Or use the hosted [interactive demo hub](https://pranavv-rajamani-portfolio.pranavvrajamani9.chatgpt.site/demos) without downloading code.

For the full-stack Program Command Center reference, run:

```bash
npm run demo:command-center
```

Then open `http://localhost:4173`.

## Engineering details

Read [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for the local API boundary, the transition and idempotency model, and the explicit distinction between these demos and private production systems.

Read [`docs/REVIEWER_GUIDE.md`](./docs/REVIEWER_GUIDE.md) for a clear nontechnical and technical review path.

## Contact

[pranavv@prsm360.com](mailto:pranavv@prsm360.com) · [Portfolio](https://pranavv-rajamani-portfolio.pranavvrajamani9.chatgpt.site) · [GitHub](https://github.com/pranavvrajamani9-lgtm)
