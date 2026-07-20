export const leadStatuses = ["new", "qualified", "package_ready", "completed", "archived"];

const allowedTransitions = {
  new: ["qualified", "archived"],
  qualified: ["package_ready", "archived"],
  package_ready: ["completed", "archived"],
  completed: [],
  archived: [],
};

export class DomainError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

export function assertTransition(from, to) {
  if (!leadStatuses.includes(to)) {
    throw new DomainError("invalid_status", "Unknown target status");
  }

  if (!allowedTransitions[from]?.includes(to)) {
    throw new DomainError("invalid_transition", `Cannot move from ${from} to ${to}`);
  }
}

export function transitionLead(lead, { to, actorId, at, requestId }) {
  assertTransition(lead.status, to);

  return {
    ...lead,
    status: to,
    updatedAt: at,
    audit: [
      ...lead.audit,
      {
        type: "lead.transitioned",
        from: lead.status,
        to,
        actorId,
        requestId,
        at,
      },
    ],
  };
}
