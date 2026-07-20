export function createStore(seed = []) {
  const leads = new Map(seed.map((lead) => [lead.id, structuredClone(lead)]));
  const idempotentResponses = new Map();

  return {
    getLead(tenantId, id) {
      const lead = leads.get(id);
      return lead?.tenantId === tenantId ? structuredClone(lead) : null;
    },

    listLeads(tenantId) {
      return [...leads.values()]
        .filter((lead) => lead.tenantId === tenantId)
        .map((lead) => structuredClone(lead));
    },

    saveLead(lead) {
      leads.set(lead.id, structuredClone(lead));
      return structuredClone(lead);
    },

    getIdempotent(tenantId, key) {
      return idempotentResponses.get(`${tenantId}:${key}`);
    },

    saveIdempotent(tenantId, key, value) {
      idempotentResponses.set(`${tenantId}:${key}`, structuredClone(value));
    },
  };
}
