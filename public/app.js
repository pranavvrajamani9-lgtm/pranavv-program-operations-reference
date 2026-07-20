const elements = {
  lead: document.querySelector("#lead"),
  audit: document.querySelector("#audit"),
  actions: document.querySelector("#actions"),
  notice: document.querySelector("#notice"),
  status: document.querySelector("#status"),
  auditCount: document.querySelector("#auditCount"),
};

const statusLabels = {
  new: "New",
  qualified: "Qualified",
  package_ready: "Package ready",
  completed: "Completed",
  archived: "Archived",
};

const nextStatus = {
  new: "qualified",
  qualified: "package_ready",
  package_ready: "completed",
};

let lead;

function apiHeaders() {
  return {
    "content-type": "application/json",
    "x-tenant-id": "tenant_northstar",
    "x-actor-id": "operator_demo",
    "x-actor-role": "operator",
  };
}

function leadMarkup(record) {
  return `
    <h2>${record.name}</h2>
    <p>${record.program} · ${record.source}</p>
    <dl>
      <div><dt>Tenant</dt><dd>${record.tenantId}</dd></div>
      <div><dt>State</dt><dd>${statusLabels[record.status]}</dd></div>
      <div><dt>Last changed</dt><dd>${new Date(record.updatedAt).toLocaleString()}</dd></div>
    </dl>`;
}

function auditMarkup(event) {
  const transition = event.from
    ? `${statusLabels[event.from]} → ${statusLabels[event.to]} · `
    : "";
  return `
    <div class="event">
      <b>${event.type}</b>
      <span>${transition}${event.actorId} · ${new Date(event.at).toLocaleTimeString()}</span>
    </div>`;
}

function render() {
  const targetStatus = nextStatus[lead.status];

  elements.status.textContent = lead.status.replace("_", " ").toUpperCase();
  elements.auditCount.textContent = lead.audit.length;
  elements.lead.innerHTML = leadMarkup(lead);
  elements.audit.innerHTML = lead.audit.slice().reverse().map(auditMarkup).join("");
  elements.actions.innerHTML = targetStatus
    ? `<button id="advance">Advance to ${statusLabels[targetStatus]}</button>`
    : "<button disabled>Workflow complete</button>";
  elements.notice.textContent = targetStatus
    ? "The client can request only the next stage; server-side policy independently enforces the same rule."
    : "No additional transition is allowed from this terminal state.";

  document.querySelector("#advance")?.addEventListener("click", transition);
}

async function transition() {
  const targetStatus = nextStatus[lead.status];
  if (!targetStatus) return;

  const response = await fetch(`/api/leads/${lead.id}/transitions`, {
    method: "POST",
    headers: {
      ...apiHeaders(),
      "idempotency-key": crypto.randomUUID(),
    },
    body: JSON.stringify({ targetStatus }),
  });
  const result = await response.json();

  if (!response.ok) {
    elements.notice.textContent = result.message ?? "The request could not be completed.";
    return;
  }

  lead = result.lead;
  render();
}

async function load() {
  const response = await fetch("/api/leads", { headers: apiHeaders() });
  const result = await response.json();
  lead = result.leads[0];
  render();
}

load().catch(() => {
  elements.notice.textContent = "Start the reference app with npm start, then reload.";
});
