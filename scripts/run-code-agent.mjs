import { spawnSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";

const checks = [
  ["ESLint", ["run", "lint"]],
  ["TypeScript", ["run", "typecheck"]],
  ["Next.js production build", ["run", "build"]],
];
const results = [];
for (const [name, args] of checks) {
  console.log(`\n\n========== Code agent: ${name} ==========`);
  const run = spawnSync("npm", args, { stdio: "inherit", env: process.env, shell: process.platform === "win32" });
  results.push({ name, status: run.status === 0 ? "passed" : "failed", exitCode: run.status ?? 1, signal: run.signal ?? null });
  if (run.error) console.error(run.error.message);
}
await mkdir("test-results", { recursive: true });
await writeFile("test-results/code-agent.json", JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2));
for (const result of results) console.log(`${result.status === "passed" ? "PASS" : "FAIL"}  ${result.name}`);
console.log("Code-agent summary: test-results/code-agent.json");
if (results.some((result) => result.status !== "passed")) process.exitCode = 1;
