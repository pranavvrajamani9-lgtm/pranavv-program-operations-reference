import { DomainError, transitionLead } from "../domain/lead.js";

export class ApplicationError extends Error {
  constructor(code, message, status) { super(message); this.code = code; this.status = status; }
}

export function createLeadService({ store, now = () => new Date().toISOString() }) {
  function assertOperator(actor) {
    if (!actor?.id || !["admin", "operator"].includes(actor.role)) {
      throw new ApplicationError("forbidden", "This action requires an operator role", 403);
    }
  }

  return {
    list(tenantId) { return store.listLeads(tenantId); },
    transition({ tenantId, actor, leadId, targetStatus, idempotencyKey }) {
      assertOperator(actor);
      if (!idempotencyKey) throw new ApplicationError("missing_idempotency_key", "Idempotency-Key is required", 400);
      const replay = store.getIdempotent(tenantId, idempotencyKey);
      if (replay) return { lead: replay, replayed: true };
      const lead = store.getLead(tenantId, leadId);
      if (!lead) throw new ApplicationError("not_found", "Lead not found in this tenant", 404);
      try {
        const next = transitionLead(lead, { to: targetStatus, actorId: actor.id, requestId: idempotencyKey, at: now() });
        const saved = store.saveLead(next);
        store.saveIdempotent(tenantId, idempotencyKey, saved);
        return { lead: saved, replayed: false };
      } catch (error) {
        if (error instanceof DomainError) throw new ApplicationError(error.code, error.message, 409);
        throw error;
      }
    },
  };
}
