import { spawnSync } from "node:child_process";
import { mkdir } from "node:fs/promises";

await mkdir("test-results", { recursive: true });
const commands = [
  ["Code agent", ["run", "test:code"]],
  ["Browser agents", ["run", "test:agents"]],
  ["HTML chart dashboard", ["run", "test:report"]],
];
let failed = false;
for (const [name, args] of commands) {
  console.log(`\n\n========== ${name} ==========`);
  const result = spawnSync("npm", args, { stdio: "inherit", env: process.env, shell: process.platform === "win32" });
  if (result.status !== 0) failed = true;
}
if (failed) {
  console.error("One or more agents failed. Open playwright-report/index.html and test-results/agent-dashboard.html to inspect results.");
  process.exitCode = 1;
}
