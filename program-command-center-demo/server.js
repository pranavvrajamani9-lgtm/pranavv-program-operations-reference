import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const directory = path.dirname(fileURLToPath(import.meta.url));
const transitionMap = {
  "New inquiry": ["Qualified"],
  Qualified: ["Package ready"],
  "Package ready": ["Completed"],
  Completed: [],
};

export function createLeadStore() {
  const leads = new Map([["lead_demo_01", {
    id: "lead_demo_01", name: "Jordan Patel", program: "Summer Skills Clinic",
    source: "Referral", status: "New inquiry", audit: [{ type: "lead.created", actor: "system", at: "2026-07-19T12:00:00.000Z" }],
  }]]);
  const idempotency = new Map();

  return {
    list: () => [...leads.values()].map((lead) => ({ ...lead, audit: [...lead.audit] })),
    transition(id, { to, actor, requestId }) {
      const lead = leads.get(id);
      if (!lead) return { error: "not_found", status: 404 };
      if (!to || !actor || !requestId) return { error: "invalid_input", status: 400 };
      if (idempotency.has(requestId)) return { lead: idempotency.get(requestId), duplicate: true, status: 200 };
      if (!transitionMap[lead.status].includes(to)) return { error: "invalid_transition", status: 409 };
      const next = { ...lead, status: to, audit: [...lead.audit, { type: "lead.transitioned", from: lead.status, to, actor, at: new Date().toISOString(), requestId }] };
      leads.set(id, next);
      idempotency.set(requestId, next);
      return { lead: next, duplicate: false, status: 200 };
    },
  };
}

function json(response, status, payload) {
  response.writeHead(status, { "content-type": "application/json", "cache-control": "no-store" });
  response.end(JSON.stringify(payload));
}

async function body(request) {
  let content = "";
  for await (const chunk of request) content += chunk;
  return content ? JSON.parse(content) : {};
}

export function createApp(store = createLeadStore()) {
  return createServer(async (request, response) => {
    const url = new URL(request.url, "http://localhost");
    if (request.method === "GET" && url.pathname === "/api/leads") return json(response, 200, { leads: store.list() });
    const match = url.pathname.match(/^\/api\/leads\/(lead_demo_01)\/transition$/);
    if (request.method === "POST" && match) {
      try { const result = store.transition(match[1], await body(request)); return json(response, result.status, result.error ? { error: result.error } : result); }
      catch { return json(response, 400, { error: "invalid_json" }); }
    }
    const requested = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
    if (requested === "shared.css") {
      response.writeHead(200, { "content-type": "text/css" });
      return response.end(await readFile(path.join(directory, "..", "shared.css")));
    }
    if (!["index.html", "app.js", "README.md"].includes(requested)) return json(response, 404, { error: "not_found" });
    const contentType = requested.endsWith(".js") ? "text/javascript" : "text/html";
    try { response.writeHead(200, { "content-type": contentType }); response.end(await readFile(path.join(directory, requested))); }
    catch { json(response, 404, { error: "not_found" }); }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createApp().listen(4173, () => console.log("Program Command Center demo: http://localhost:4173"));
}
