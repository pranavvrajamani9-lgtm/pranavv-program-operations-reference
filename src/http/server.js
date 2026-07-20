import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ApplicationError, createLeadService } from "../application/lead-service.js";
import { createStore } from "../infrastructure/in-memory-store.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const publicAssets = new Map([
  ["index.html", "text/html; charset=utf-8"],
  ["app.js", "text/javascript; charset=utf-8"],
  ["styles.css", "text/css; charset=utf-8"],
]);

export const seedLead = {
  id: "lead_northstar_01",
  tenantId: "tenant_northstar",
  name: "Jordan Patel",
  program: "Summer Skills Clinic",
  source: "Referral",
  status: "new",
  updatedAt: "2026-07-19T12:00:00.000Z",
  audit: [{ type: "lead.created", actorId: "system", at: "2026-07-19T12:00:00.000Z" }],
};

function sendJson(response, status, body) {
  response.writeHead(status, {
    "content-type": "application/json",
    "cache-control": "no-store",
  });
  response.end(JSON.stringify(body));
}

async function parseJson(request) {
  let value = "";
  for await (const chunk of request) value += chunk;
  return value ? JSON.parse(value) : {};
}

function requestContext(request) {
  return {
    tenantId: request.headers["x-tenant-id"],
    actor: {
      id: request.headers["x-actor-id"],
      role: request.headers["x-actor-role"],
    },
  };
}

async function serveAsset(pathname, response) {
  const assetName = pathname === "/" ? "index.html" : pathname.slice(1);
  const contentType = publicAssets.get(assetName);

  if (!contentType) return sendJson(response, 404, { error: "not_found" });

  const file = await readFile(path.join(root, "public", assetName));
  response.writeHead(200, { "content-type": contentType });
  response.end(file);
}

export function createApp({
  service = createLeadService({ store: createStore([seedLead]) }),
} = {}) {
  return createServer(async (request, response) => {
    const url = new URL(request.url, "http://localhost");

    try {
      if (request.method === "GET" && url.pathname === "/api/leads") {
        const { tenantId } = requestContext(request);
        if (!tenantId) return sendJson(response, 400, { error: "missing_tenant" });
        return sendJson(response, 200, { leads: service.list(tenantId) });
      }

      const transitionMatch = url.pathname.match(/^\/api\/leads\/([^/]+)\/transitions$/);
      if (request.method === "POST" && transitionMatch) {
        const { tenantId, actor } = requestContext(request);
        const body = await parseJson(request);
        const result = service.transition({
          tenantId,
          actor,
          leadId: transitionMatch[1],
          targetStatus: body.targetStatus,
          idempotencyKey: request.headers["idempotency-key"],
        });
        return sendJson(response, 200, result);
      }

      return serveAsset(url.pathname, response);
    } catch (error) {
      if (error instanceof ApplicationError) {
        return sendJson(response, error.status, { error: error.code, message: error.message });
      }
      if (error instanceof SyntaxError) return sendJson(response, 400, { error: "invalid_json" });
      return sendJson(response, 500, { error: "internal_error" });
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createApp().listen(4173, () => {
    console.log("Reference app running at http://localhost:4173");
  });
}
