import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const input = resolve("test-results/results.json");
const outputDir = resolve("test-results");
const output = resolve(outputDir, "agent-dashboard.html");
let report;
try {
  report = JSON.parse(await readFile(input, "utf8"));
} catch {
  console.error("No Playwright JSON report found. Run `npm run test:agents` first.");
  process.exit(1);
}

const rows = [];
function walk(suites = []) {
  for (const suite of suites) {
    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests ?? []) {
        const results = test.results ?? [];
        const last = results.at(-1);
        const status = last?.status === "passed" ? "passed"
          : last?.status === "skipped" || test.expectedStatus === "skipped" ? "skipped"
          : last?.status === "failed" || last?.status === "timedOut" || last?.status === "interrupted" ? "failed"
          : "unknown";
        rows.push({ agent: suite.title || "Test agent", title: spec.title, status, duration: last?.duration ?? 0, error: last?.error?.message ?? "" });
      }
    }
    walk(suite.suites);
  }
}
walk(report.suites);
try {
  const code = JSON.parse(await readFile(resolve("test-results/code-agent.json"), "utf8"));
  for (const item of code.results ?? []) rows.push({ agent: "Code agent", title: item.name, status: item.status, duration: 0, error: item.status === "failed" ? `Exited with code ${item.exitCode}` : "" });
} catch {
  // Browser-only reports remain valid if the code agent has not been run.
}
const counts = { passed: 0, failed: 0, skipped: 0, unknown: 0 };
for (const row of rows) counts[row.status]++;
const total = rows.length;
const pct = (n) => total ? Math.round(n / total * 100) : 0;
const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const detailRows = rows.map((r) => `<tr><td>${esc(r.agent)}</td><td>${esc(r.title)}</td><td class="${r.status}">${esc(r.status.toUpperCase())}</td><td>${(r.duration / 1000).toFixed(2)}s</td><td>${esc(r.error)}</td></tr>`).join("\n");
const chart = (label, value, color) => `<div class="barrow"><span>${label}</span><div class="bar"><i style="width:${pct(value)}%;background:${color}"></i></div><b>${value} (${pct(value)}%)</b></div>`;
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>VETXUILT Test Agent Dashboard</title><style>
:root{color-scheme:dark;--bg:#080d17;--panel:#101a2a;--line:#26354c;--text:#f3f7fc;--muted:#9babc1;--cyan:#68e4e1;--amber:#ffc66d;--red:#ff8585;--green:#6de0a4}*{box-sizing:border-box}body{margin:0;background:radial-gradient(ellipse at 80% 0,#173047,transparent 40%),var(--bg);color:var(--text);font:14px system-ui,sans-serif}.wrap{max-width:1200px;margin:auto;padding:30px 20px 60px}.eyebrow{font:11px monospace;letter-spacing:.15em;color:var(--cyan)}h1{font-size:clamp(28px,4vw,44px);margin:12px 0}p,.muted{color:var(--muted)}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin:24px 0}.card,.panel{background:#101a2aee;border:1px solid var(--line);border-radius:14px;padding:18px}.num{font-size:30px;font-weight:800}.passed{color:var(--green)}.failed{color:var(--red)}.skipped{color:var(--amber)}.unknown{color:var(--muted)}.charts{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px}.barrow{display:grid;grid-template-columns:75px 1fr 80px;align-items:center;gap:9px;margin:15px 0;font-size:12px}.bar{height:10px;background:#26354c;border-radius:20px;overflow:hidden}.bar i{display:block;height:100%;border-radius:20px}.panel h2{font-size:18px;margin-top:0}table{border-collapse:collapse;width:100%;margin-top:12px}th,td{text-align:left;padding:11px;border-bottom:1px solid var(--line);vertical-align:top}th{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em}td{font-size:12px}td:last-child{max-width:340px;overflow-wrap:anywhere}.tablewrap{overflow:auto}.note{border-left:3px solid var(--amber);padding:12px 14px;background:#ffc66d0b;color:var(--muted);margin:20px 0}@media(max-width:600px){.wrap{padding:20px 12px}.barrow{grid-template-columns:60px 1fr 70px}th,td{padding:8px}}
</style></head><body><main class="wrap"><div class="eyebrow">VETXUILT / QUALITY CONTROL</div><h1>Automated Test Agent Dashboard</h1><p>Generated ${new Date().toLocaleString()} · Source: Playwright JSON results · This report only describes tests that actually ran.</p><section class="cards"><div class="card"><div class="muted">Total tests</div><div class="num">${total}</div></div><div class="card"><div class="muted">Passed</div><div class="num passed">${counts.passed}</div></div><div class="card"><div class="muted">Failed</div><div class="num failed">${counts.failed}</div></div><div class="card"><div class="muted">Skipped / unknown</div><div class="num skipped">${counts.skipped + counts.unknown}</div></div><div class="card"><div class="muted">Pass rate</div><div class="num">${pct(counts.passed)}%</div></div></section><section class="charts"><div class="panel"><h2>Result distribution</h2>${chart("Passed",counts.passed,"var(--green)")}${chart("Failed",counts.failed,"var(--red)")}${chart("Skipped",counts.skipped,"var(--amber)")}${chart("Unknown",counts.unknown,"#9babc1")}</div><div class="panel"><h2>Agent status</h2>${[...new Set(rows.map(r=>r.agent))].map(agent=>{const group=rows.filter(r=>r.agent===agent);const failed=group.filter(r=>r.status==="failed").length;const passed=group.filter(r=>r.status==="passed").length;return `<div class="barrow"><span>${esc(agent.replace(" agent",""))}</span><div class="bar"><i style="width:${group.length?Math.round(passed/group.length*100):0}%;background:${failed?'var(--red)':'var(--cyan)'}"></i></div><b>${passed}/${group.length}</b></div>`}).join("")}</div></section><div class="note">Coverage boundary: browser tests do not prove production security, real email delivery, real student-ID verification, database RLS correctness, payment settlement, or end-to-end messaging unless configured test accounts, Supabase test data and provider sandboxes are explicitly added. The current starter documents several of these as unfinished.</div><section class="panel"><h2>Individual test results</h2><div class="tablewrap"><table><thead><tr><th>Agent</th><th>Test</th><th>Status</th><th>Duration</th><th>Error</th></tr></thead><tbody>${detailRows || '<tr><td colspan="5">No tests were found in the JSON report.</td></tr>'}</tbody></table></div></section></main></body></html>`;
await mkdir(outputDir, { recursive: true });
await writeFile(output, html, "utf8");
console.log(`Dashboard generated: ${output}`);
console.log(`Tests: ${total}; passed: ${counts.passed}; failed: ${counts.failed}; skipped: ${counts.skipped}; pass rate: ${pct(counts.passed)}%`);
