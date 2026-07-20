import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";

const demos = ["hoop-nest-demo", "program-command-center-demo", "signaldesk-demo", "outreach-research-demo", "dial-ai-demo"];
for (const demo of demos) {
  test(`${demo} includes a runnable page and a public-boundary README`, async () => {
    await access(new URL(`../${demo}/index.html`, import.meta.url));
    await access(new URL(`../${demo}/README.md`, import.meta.url));
  });
}
