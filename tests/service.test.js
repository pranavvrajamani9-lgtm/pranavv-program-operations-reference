import assert from "node:assert/strict";
import test from "node:test";
import { createLeadService, ApplicationError } from "../src/application/lead-service.js";
import { createStore } from "../src/infrastructure/in-memory-store.js";
import { seedLead } from "../src/http/server.js";

test("scopes reads to the active tenant", () => {
  const service = createLeadService({ store: createStore([seedLead]) });
  assert.equal(service.list("tenant_northstar").length, 1);
  assert.equal(service.list("tenant_other").length, 0);
});

test("replays a request id instead of applying the transition twice", () => {
  const service = createLeadService({ store: createStore([seedLead]), now: () => "2026-07-19T12:00:00.000Z" });
  const command = { tenantId: "tenant_northstar", actor: { id: "operator_01", role: "operator" }, leadId: seedLead.id, targetStatus: "qualified", idempotencyKey: "request_01" };
  assert.equal(service.transition(command).replayed, false);
  assert.equal(service.transition(command).replayed, true);
});

test("requires an authorized operator", () => {
  const service = createLeadService({ store: createStore([seedLead]) });
  assert.throws(() => service.transition({ tenantId: "tenant_northstar", actor: { id: "parent_01", role: "viewer" }, leadId: seedLead.id, targetStatus: "qualified", idempotencyKey: "request_01" }), (error) => error instanceof ApplicationError && error.code === "forbidden");
});
