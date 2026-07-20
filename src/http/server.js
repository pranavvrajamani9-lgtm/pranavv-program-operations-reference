import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createLeadService, ApplicationError } from "../application/lead-service.js";
import { createStore } from "../infrastructure/in-memory-store.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export const seedLead = { id: "lead_northstar_01", tenantId: "tenant_northstar", name: "Jordan Patel", program: "Summer Skills Clinic", source: "Referral", status: "new", updatedAt: "2026-07-19T12:00:00.000Z", audit: [{ type: "lead.created", actorId: "system", at: "2026-07-19T12:00:00.000Z" }] };

function json(response, status, body) { response.writeHead(status, { "content-type": "application/json", "cache-control": "no-store" }); response.end(JSON.stringify(body)); }
async function parseJson(request) { let value = ""; for await (const chunk of request) value += chunk; return value ? JSON.parse(value) : {}; }
function context(request) { return { tenantId: request.headers["x-tenant-id"], actor: { id: request.headers["x-actor-id"], role: request.headers["x-actor-role"] } }; }

export function createApp({ service = createLeadService({ store: createStore([seedLead]) }) } = {}) {
  return createServer(async (request, response) => {
    const url = new URL(request.url, "http://localhost");
    try {
      if (request.method === "GET" && url.pathname === "/api/leads") {
        const { tenantId } = context(request); if (!tenantId) return json(response, 400, { error: "missing_tenant" });
        return json(response, 200, { leads: service.list(tenantId) });
      }
      const match = url.pathname.match(/^\/api\/leads\/([^/]+)\/transitions$/);
      if (request.method === "POST" && match) {
        const { tenantId, actor } = context(request);
        const result = service.transition({ tenantId, actor, leadId: match[1], targetStatus: (await parseJson(request)).targetStatus, idempotencyKey: request.headers["idempotency-key"] });
        return json(response, 200, result);
      }
      const asset = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
      const allowed = new Map([["index.html", "text/html; charset=utf-8"], ["app.js", "text/javascript; charset=utf-8"], ["styles.css", "text/css; charset=utf-8"]]);
      if (!allowed.has(asset)) return json(response, 404, { error: "not_found" });
      response.writeHead(200, { "content-type": allowed.get(asset) }); response.end(await readFile(path.join(root, "public", asset)));
    } catch (error) {
      if (error instanceof ApplicationError) return json(response, error.status, { error: error.code, message: error.message });
      if (error instanceof SyntaxError) return json(response, 400, { error: "invalid_json" });
      return json(response, 500, { error: "internal_error" });
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) createApp().listen(4173, () => console.log("Reference app running at http://localhost:4173"));
