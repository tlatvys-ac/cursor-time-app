// node render.mjs <scene> <cssW> <cssH> <out.png>            one still
// node render.mjs hero <cssW> <cssH> <outDir> --frames 30     PNG frames of the 8 s loop
// Needs: python3 -m http.server 7498 (from ~/Documents/GitHub) and
// headless Chrome with --remote-debugging-port=9411.
const [, , scene, W, H, out, flag, fps] = process.argv;
const port = 9411;
const tab = await (await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent("http://127.0.0.1:7498/cursor-time-app/tools/shots/scene.html?scene=" + scene)}`, { method: "PUT" })).json();
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((ok) => ws.addEventListener("open", ok));
let id = 0; const pending = new Map();
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const call = (method, params = {}) => new Promise((ok) => { const i = ++id; pending.set(i, ok); ws.send(JSON.stringify({ id: i, method, params })); });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const evaluate = async (expression) => {
  const r = await call("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (r.result?.exceptionDetails) console.log("js error:", JSON.stringify(r.result.exceptionDetails.exception?.description));
  return r.result?.result?.value;
};
const fs = await import("node:fs");
await call("Emulation.setDeviceMetricsOverride", { width: +W, height: +H, deviceScaleFactor: +(process.env.DPR || 2), mobile: false });
if (process.env.TRANSPARENT) await call("Emulation.setDefaultBackgroundColorOverride", { color: { r: 0, g: 0, b: 0, a: 0 } });
await call("Page.reload");
for (let i = 0; i < 60 && !(await evaluate("!!window.ready")); i++) await sleep(100);
await sleep(700);
const shoot = async (file) => {
  const shot = await call("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(file, Buffer.from(shot.result.data, "base64"));
};
if (flag === "--frames") {
  fs.mkdirSync(out, { recursive: true });
  const n = 8 * +fps;
  for (let i = 0; i < n; i++) {
    await evaluate(`frame(${i / +fps})`);
    await shoot(`${out}/f${String(i).padStart(4, "0")}.png`);
  }
  console.log("wrote", n, "frames to", out);
} else {
  if (process.env.T) await evaluate(`frame(${process.env.T})`);
  await shoot(out);
  console.log("wrote", out);
}
await fetch(`http://127.0.0.1:${port}/json/close/${tab.id}`);
ws.close();
