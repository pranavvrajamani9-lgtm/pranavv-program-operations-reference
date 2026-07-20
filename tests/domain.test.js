import assert from "node:assert/strict";
import test from "node:test";
import { assertTransition, transitionLead, DomainError } from "../src/domain/lead.js";

test("allows an ordered lifecycle transition and emits an audit event", () => {
  const lead = { status: "new", audit: [] };
  const result = transitionLead(lead, { to: "qualified", actorId: "operator_01", requestId: "request_01", at: "2026-07-19T12:00:00.000Z" });
  assert.equal(result.status, "qualified");
  assert.equal(result.audit[0].type, "lead.transitioned");
  assert.equal(lead.status, "new");
});

test("rejects a lifecycle jump", () => {
  assert.throws(() => assertTransition("new", "completed"), (error) => error instanceof DomainError && error.code === "invalid_transition");
});
