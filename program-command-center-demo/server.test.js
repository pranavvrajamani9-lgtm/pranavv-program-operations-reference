import assert from "node:assert/strict";
import test from "node:test";
import { createLeadStore } from "./server.js";

test("accepts an ordered transition and records audit evidence", () => {
  const store = createLeadStore();
  const result = store.transition("lead_demo_01", { to: "Qualified", actor: "demo_admin", requestId: "request_01" });
  assert.equal(result.status, 200);
  assert.equal(result.lead.status, "Qualified");
  assert.equal(result.lead.audit.at(-1).type, "lead.transitioned");
});

test("rejects a transition that skips a required workflow state", () => {
  const result = createLeadStore().transition("lead_demo_01", { to: "Completed", actor: "demo_admin", requestId: "request_01" });
  assert.equal(result.status, 409);
  assert.equal(result.error, "invalid_transition");
});

test("returns the same result for a replayed idempotency key", () => {
  const store = createLeadStore();
  const input = { to: "Qualified", actor: "demo_admin", requestId: "request_01" };
  const first = store.transition("lead_demo_01", input);
  const retry = store.transition("lead_demo_01", input);
  assert.equal(first.duplicate, false);
  assert.equal(retry.duplicate, true);
  assert.equal(retry.lead.status, "Qualified");
});
