import assert from "node:assert/strict";
import test from "node:test";
import { createApp } from "../src/http/server.js";

async function withServer(run) { const app = createApp(); await new Promise((resolve) => app.listen(0, "127.0.0.1", resolve)); try { await run(`http://127.0.0.1:${app.address().port}`); } finally { await new Promise((resolve) => app.close(resolve)); } }
const headers = { "x-tenant-id": "tenant_northstar", "x-actor-id": "operator_01", "x-actor-role": "operator" };

test("returns tenant-scoped leads through the HTTP API", async () => withServer(async (base) => { const response = await fetch(`${base}/api/leads`, { headers }); const body = await response.json(); assert.equal(response.status, 200); assert.equal(body.leads[0].id, "lead_northstar_01"); }));

test("returns a conflict for an invalid state transition", async () => withServer(async (base) => { const response = await fetch(`${base}/api/leads/lead_northstar_01/transitions`, { method: "POST", headers: { ...headers, "content-type": "application/json", "idempotency-key": "request_01" }, body: JSON.stringify({ targetStatus: "completed" }) }); const body = await response.json(); assert.equal(response.status, 409); assert.equal(body.error, "invalid_transition"); }));
