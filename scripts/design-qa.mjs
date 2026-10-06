/**
 * Design QA harness.
 *
 * Drives the locally installed Chrome over the DevTools Protocol to screenshot
 * pages at a true emulated viewport and report horizontal overflow. Uses Node's
 * built-in WebSocket (Node 22+), so it needs no npm dependency and no Playwright
 * browser download.
 *
 * Note: `chrome --headless --screenshot --window-size=375,...` does NOT work for
 * this, because Chrome clamps its minimum window width on macOS and then crops
 * the capture, which looks exactly like a horizontal-overflow bug. Emulating
 * device metrics over CDP is what gives a truthful 375px render.
 *
 * Start the app first (npm run dev or npm start), then:
 *   node scripts/design-qa.mjs ./out '[{"name":"home-375","url":"http://localhost:3000/","width":375,"height":900,"mobile":true}]'
 */
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9333;
const OUT = process.argv[2];
const targets = JSON.parse(process.argv[3]); // [{name,url,width,height,mobile}]

const chrome = spawn(CHROME, [
  "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run",
  `--remote-debugging-port=${PORT}`, "--user-data-dir=/tmp/cdp-profile-bloodlink",
  "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function wsUrl() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      return (await r.json()).webSocketDebuggerUrl;
    } catch { await sleep(250); }
  }
  throw new Error("Chrome did not expose a debugging port");
}

const ws = new WebSocket(await wsUrl());
await new Promise((res) => (ws.onopen = res));

let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
};
function send(method, params = {}, sessionId) {
  const msgId = ++id;
  return new Promise((res, rej) => {
    pending.set(msgId, (m) => (m.error ? rej(new Error(method + ": " + m.error.message)) : res(m.result)));
    ws.send(JSON.stringify({ id: msgId, method, params, sessionId }));
  });
}

const { targetId } = await send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
await send("Page.enable", {}, sessionId);
await send("Runtime.enable", {}, sessionId);

const report = [];
for (const t of targets) {
  await send("Emulation.setDeviceMetricsOverride", {
    width: t.width, height: t.height, deviceScaleFactor: 2, mobile: !!t.mobile,
  }, sessionId);
  await send("Page.navigate", { url: t.url }, sessionId);
  await sleep(1400);

  const { result } = await send("Runtime.evaluate", {
    returnByValue: true,
    expression: `(() => {
      const d = document.documentElement;
      const over = [...document.querySelectorAll('*')]
        .filter(el => el.getBoundingClientRect().right > d.clientWidth + 1)
        .slice(0, 6)
        .map(el => el.tagName.toLowerCase() + '.' + (el.className?.toString?.().slice(0,60) || ''));
      return { scrollWidth: d.scrollWidth, clientWidth: d.clientWidth, overflowing: over };
    })()`,
  }, sessionId);

  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true }, sessionId);
  writeFileSync(`${OUT}/${t.name}.png`, Buffer.from(data, "base64"));
  report.push({ name: t.name, ...result.value });
}

console.log(JSON.stringify(report, null, 2));
ws.close();
chrome.kill();
