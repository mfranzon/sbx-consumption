// 15-minute talk: Docker Sandboxes, and where the tokens go.
// Dark, one accent for the way out (green), one for the traps (amber).
// Slides carry pictures. The words live in the notes.

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.defineLayout({ name: "WIDE", width: 20, height: 11.25 });
pres.layout = "WIDE";
pres.author = "Marco";
pres.title = "Docker Sandboxes, and where the tokens go";
pres.subject = "15-minute talk";

const C = {
  bg: "0B0B0A",
  ink: "ECE8E1",
  muted: "A8A49B",
  dim: "6B6760",
  faint: "2A2A27",
  panel: "151513",
  bar: "1E1E1B",
  code: "0F0F0D",
  green: "C5DD97",
  greenDeep: "222A17",
  amber: "E8B46A",
  amberDeep: "2C2416",
};

const FONT = "Helvetica Neue";
const MONO = "Menlo";
const MONO_W = 0.602 / 72; // Menlo advance, inches per point of font size
const TOTAL = 12;

// ── primitives ────────────────────────────────────────────────────────────

function txt(slide, text, x, y, w, h, o) {
  slide.addText(text, { x, y, w, h, fontFace: FONT, fontSize: 18, color: C.ink, margin: 0, ...o });
}

function mono(slide, text, x, y, w, h, o) {
  txt(slide, text, x, y, w, h, { fontFace: MONO, ...o });
}

function box(slide, x, y, w, h, o = {}) {
  slide.addShape(o.square ? pres.shapes.RECTANGLE : pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h,
    rectRadius: o.r == null ? 0.14 : o.r,
    fill: { color: o.fill || C.panel },
    line: o.line ? { color: o.line, width: o.lw || 1.25, dashType: o.dash ? "dash" : "solid" } : { type: "none" },
  });
}

function rect(slide, x, y, w, h, color) {
  slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color }, line: { type: "none" } });
}

function line(slide, x1, y1, x2, y2, o = {}) {
  slide.addShape(pres.shapes.LINE, {
    x: Math.min(x1, x2), y: Math.min(y1, y2),
    w: Math.abs(x2 - x1), h: Math.abs(y2 - y1),
    flipH: x2 < x1,
    flipV: y2 < y1,
    line: {
      color: o.color || C.faint, width: o.w || 1.5,
      dashType: o.dash ? "dash" : "solid",
      endArrowType: o.arrow ? "triangle" : undefined,
    },
  });
}

function dot(slide, x, y, d, color) {
  slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color }, line: { type: "none" } });
}

function pill(slide, text, x, y, o = {}) {
  const size = o.size || 14;
  const w = o.w || text.length * size * MONO_W + 0.5;
  box(slide, x, y, w, 0.46, { fill: o.fill || C.bar, line: o.line, r: 0.23 });
  mono(slide, text, x, y, w, 0.46, { fontSize: size, color: o.color || C.muted, align: "center", valign: "middle" });
  return w;
}

function label(slide, text, x, y, w, color) {
  txt(slide, text.toUpperCase(), x, y, w, 0.32, { fontSize: 13, color: color || C.dim, charSpacing: 2.4 });
}

// A terminal window. Returns the inner content origin.
function term(slide, x, y, w, h, title) {
  box(slide, x, y, w, h, { fill: C.code, line: C.faint, lw: 1 });
  box(slide, x + 0.02, y + 0.02, w - 0.04, 0.5, { fill: C.bar, r: 0.12 });
  rect(slide, x + 0.02, y + 0.36, w - 0.04, 0.16, C.bar);
  ["D9695F", "D9B45F", "8DBF6A"].forEach((c, i) => dot(slide, x + 0.25 + i * 0.3, y + 0.17, 0.17, c));
  mono(slide, title, x + 1.3, y + 0.02, w - 2.6, 0.5, { fontSize: 13, color: C.dim, align: "center", valign: "middle" });
  return { x: x + 0.35, y: y + 0.8 };
}

function title(slide, runs) {
  const parts = runs.map(([t, accent]) => ({ text: t, options: { color: accent ? C.green : C.ink } }));
  txt(slide, parts, 1.05, 1.15, 17.9, 0.95, { fontSize: 44, valign: "middle" });
}

function newSlide(section, n) {
  const s = pres.addSlide();
  s.background = { color: C.bg };
  mono(s, "SBX", 1.05, 0.45, 2, 0.36, { fontSize: 14, color: C.ink, charSpacing: 3, valign: "middle" });
  txt(s, section, 15.2, 0.45, 3.75, 0.36, { fontSize: 13, color: C.dim, charSpacing: 2.4, align: "right", valign: "middle" });
  // Footer progress: one segment per slide, filled up to this one.
  const seg = 17.9 / TOTAL;
  for (let i = 0; i < TOTAL; i++) {
    rect(s, 1.05 + i * seg, 10.42, seg - 0.06, 0.05, i < n ? (i === n - 1 ? C.green : C.dim) : C.faint);
  }
  mono(s, String(n).padStart(2, "0") + " / " + TOTAL, 16.95, 10.62, 2, 0.3, { fontSize: 12, color: C.dim, align: "right" });
  return s;
}

// ── 1. Title ──────────────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  mono(s, "SBX", 1.05, 0.55, 2, 0.36, { fontSize: 14, color: C.ink, charSpacing: 3 });
  txt(s, "15 MINUTES", 14.2, 0.55, 4.75, 0.36, { fontSize: 13, color: C.dim, charSpacing: 2.4, align: "right" });

  txt(s, "Docker Sandboxes,", 1.05, 3.0, 10.2, 1.2, { fontSize: 62 });
  txt(s, [
    { text: "and where the ", options: { color: C.ink } },
    { text: "tokens", options: { color: C.green } },
    { text: " go.", options: { color: C.ink } },
  ], 1.05, 4.15, 10.2, 1.2, { fontSize: 62, italic: true });
  line(s, 1.1, 6.0, 2.6, 6.0, { color: C.green, w: 3 });
  txt(s, "The key stays on the host.\nThe usage object walks back out.", 1.05, 6.35, 9, 1.2, { fontSize: 24, color: C.muted, lineSpacingMultiple: 1.3 });

  // Laptop holding a microVM; one green line escapes through a door.
  box(s, 11.4, 1.7, 7.55, 7.9, { fill: "111110", line: C.faint });
  label(s, "laptop", 11.75, 1.95, 3);
  box(s, 12.0, 2.65, 4.2, 4.0, { fill: C.code, line: C.green, lw: 1.5 });
  label(s, "microVM", 12.3, 2.9, 3, C.green);
  box(s, 12.4, 3.55, 3.4, 1.15, { fill: C.panel });
  txt(s, "agent", 12.7, 3.55, 3, 1.15, { fontSize: 30, valign: "middle" });
  mono(s, "statusline.py", 12.4, 5.0, 3.4, 0.4, { fontSize: 14, color: C.green });
  mono(s, "activity.py", 12.4, 5.45, 3.4, 0.4, { fontSize: 14, color: C.green });
  // The door: a gap in the VM wall.
  rect(s, 16.1, 5.0, 0.2, 0.7, "111110");
  line(s, 15.4, 5.35, 17.4, 5.35, { color: C.green, w: 2.5 });
  line(s, 17.4, 5.35, 17.4, 7.2, { color: C.green, w: 2.5, arrow: true });
  box(s, 16.1, 7.35, 2.6, 0.8, { fill: C.greenDeep, line: C.green, lw: 1 });
  mono(s, ".jsonl", 16.1, 7.35, 2.6, 0.8, { fontSize: 20, color: C.green, align: "center", valign: "middle" });
  pill(s, "watch.py", 12.0, 7.52, { color: C.ink });
  line(s, 16.0, 7.75, 13.7, 7.75, { color: C.dim, w: 1.5, dash: true, arrow: true });
  mono(s, "~/.claude", 12.0, 8.6, 3, 0.4, { fontSize: 14, color: C.dim, strike: "sngStrike" });
  mono(s, "API key", 15.0, 8.6, 3, 0.4, { fontSize: 14, color: C.amber });

  s.addNotes("Open on the thesis. The sandbox hides the transcript. It does not hide two doors: the workspace mount, and host.docker.internal. A status line writes one usage line through those doors. Fifteen seconds, then the two bills.");
}

// ── 2. Two meters ─────────────────────────────────────────────────────────
{
  const s = newSlide("TWO METERS", 2);
  title(s, [["One agent. "], ["Two bills.", true]]);

  // Sandbox meter: seconds ticking.
  box(s, 1.05, 2.45, 8.7, 7.2);
  label(s, "sandbox", 1.55, 2.85, 4);
  txt(s, "Free", 1.5, 3.3, 7.5, 1.7, { fontSize: 96 });
  txt(s, "on your laptop", 1.55, 5.0, 7.5, 0.5, { fontSize: 22, color: C.muted });
  for (let i = 0; i < 24; i++) {
    const hgt = i % 6 === 0 ? 0.7 : 0.4;
    rect(s, 1.55 + i * 0.31, 6.75 - hgt, 0.08, hgt, i < 15 ? C.ink : C.faint);
  }
  txt(s, [
    { text: "Cloud  ", options: { color: C.ink } },
    { text: "seconds × size", options: { color: C.muted, fontFace: MONO } },
  ], 1.55, 7.05, 7.6, 0.5, { fontSize: 22 });
  txt(s, "Docker credits do not pay the model.", 1.55, 8.65, 7.6, 0.5, { fontSize: 18, color: C.amber });

  // Model meter: one real turn, as a stacked bar.
  box(s, 10.2, 2.45, 8.75, 7.2);
  label(s, "model provider", 10.7, 2.85, 5, C.green);
  txt(s, "Tokens", 10.65, 3.3, 7.5, 1.7, { fontSize: 96 });
  txt(s, "a separate invoice", 10.7, 5.0, 7.5, 0.5, { fontSize: 22, color: C.muted });
  const turn = [["cache read", 148900, C.green], ["input", 800, C.ink], ["cache write", 500, C.muted], ["output", 88, C.amber]];
  const sum = turn.reduce((a, t) => a + t[1], 0);
  let bx = 10.7;
  turn.forEach((t) => {
    const w = Math.max(0.07, (t[1] / sum) * 7.6);
    rect(s, bx, 6.0, w, 0.75, t[2]);
    bx += w + 0.03;
  });
  turn.forEach((t, i) => {
    const x = 10.7 + (i % 2) * 3.9, y = 7.15 + Math.floor(i / 2) * 0.6;
    rect(s, x, y + 0.13, 0.22, 0.22, t[2]);
    txt(s, [
      { text: t[0] + "  ", options: { color: C.muted } },
      { text: t[1].toLocaleString("en-US"), options: { color: C.ink, fontFace: MONO } },
    ], x + 0.4, y, 3.4, 0.48, { fontSize: 17, valign: "middle" });
  });
  txt(s, "One turn. 99% of it is cache read.", 10.7, 8.65, 7.6, 0.5, { fontSize: 18, color: C.green });

  s.addNotes("Say both meters, then leave them. Local sbx is free. Cloud bills VM-seconds by size. The model provider bills tokens. Docker credits do not cover inference. The bar on the right is one real turn: almost all of it is cache read, which is cheap. The network panel counts connections. A cache hit and a 200k turn look the same there.");
}

// ── 3. Diagram ────────────────────────────────────────────────────────────
{
  const s = newSlide("THE SANDBOX", 3);
  title(s, [["The repo goes in. "], ["Home stays out.", true]]);

  box(s, 1.05, 2.4, 17.9, 6.65, { fill: "111110", line: C.faint });
  label(s, "laptop", 1.4, 2.65, 3);

  // Left column: what lives on the laptop.
  const left = [
    ["~/.claude", "not loaded", C.dim, C.amber, true],
    ["API key", "stays here", C.amber, C.muted, false],
    ["repo/", "your project", C.ink, C.muted, false],
  ];
  left.forEach((r, i) => {
    const y = 3.3 + i * 1.85;
    box(s, 1.45, y, 4.4, 1.45, { fill: C.panel });
    mono(s, r[0], 1.75, y + 0.22, 3.9, 0.55, { fontSize: 22, color: r[2], strike: r[4] ? "sngStrike" : undefined });
    txt(s, r[1], 1.75, y + 0.82, 3.9, 0.4, { fontSize: 17, color: r[3] });
  });

  // The VM.
  box(s, 9.0, 3.05, 6.4, 5.65, { fill: C.code, line: C.green, lw: 1.75 });
  label(s, "microVM · own kernel", 9.35, 3.3, 5.5, C.green);
  txt(s, "agent", 9.35, 3.8, 5.7, 0.9, { fontSize: 40 });
  box(s, 9.35, 5.0, 5.7, 0.95, { fill: C.panel });
  mono(s, "ANTHROPIC_API_KEY=placeholder", 9.65, 5.0, 5.3, 0.95, { fontSize: 14, color: C.dim, valign: "middle" });
  box(s, 9.35, 6.25, 5.7, 1.25, { fill: C.panel });
  mono(s, "/workspace", 9.65, 6.37, 5.2, 0.5, { fontSize: 18, color: C.ink });
  mono(s, ".claude/settings.json  ✓", 9.65, 6.85, 5.2, 0.45, { fontSize: 15, color: C.green });

  // Arrows across the wall.
  line(s, 5.85, 4.02, 8.4, 4.02, { color: C.amber, w: 2, dash: true });
  mono(s, "✕", 8.35, 3.7, 0.6, 0.6, { fontSize: 26, color: C.amber, align: "center", valign: "middle" });
  line(s, 5.85, 5.88, 7.0, 5.88, { color: C.amber, w: 2 });
  pill(s, "proxy", 7.0, 5.65, { color: C.amber, line: C.amber, fill: C.amberDeep, w: 1.4 });
  line(s, 8.4, 5.88, 8.7, 5.88, { color: C.amber, w: 2 });
  line(s, 8.7, 5.88, 8.7, 5.47, { color: C.amber, w: 2 });
  line(s, 8.7, 5.47, 9.3, 5.47, { color: C.amber, w: 2, arrow: true });
  line(s, 5.85, 7.72, 8.4, 7.72, { color: C.green, w: 2.5 });
  line(s, 8.4, 7.72, 8.4, 6.87, { color: C.green, w: 2.5 });
  line(s, 8.4, 6.87, 9.3, 6.87, { color: C.green, w: 2.5, arrow: true });
  mono(s, "mount / clone", 6.0, 7.3, 2.6, 0.4, { fontSize: 13, color: C.green });

  // Right: the four walls.
  const chips = [["kernel", "own"], ["network", "allowlist"], ["workspace", "3 modes"], ["key", "proxy"]];
  chips.forEach((c, i) => {
    const y = 3.3 + i * 1.32;
    line(s, 16.0, y, 16.0, y + 1.0, { color: C.green, w: 3 });
    txt(s, c[0], 16.3, y - 0.05, 2.5, 0.5, { fontSize: 20 });
    mono(s, c[1], 16.3, y + 0.48, 2.5, 0.4, { fontSize: 15, color: C.green });
  });

  s.addNotes("Do not tour the layers. Point at the picture. Left of the VM: home config and the real key, both on the laptop. ~/.claude never crosses. The key crosses only as a placeholder through the proxy. The repo crosses, so project .claude crosses with it. sbx does not load ~/.claude or ~/.codex. Clone mode copies the repo in and still does not mount your home. Four walls if someone asks: own kernel, deny-then-allow network, mountless or direct or clone, credential proxy.");
}

// ── 4. Three wrong instruments ────────────────────────────────────────────
{
  const s = newSlide("THE TRAP", 4);
  title(s, [["Three ways to look in the wrong place."]]);
  const traps = [
    ["0", "ccusage", "reads ~/.claude on the host", ["$ ccusage", "", "  no sessions found"], "blind"],
    ["93", "sbx policy log", "one row per allowed host", ["allow  api.anthropic.com", "allow  registry.npmjs.org", "allow  github.com", "  … 90 more"], "not tokens"],
    ["$?", "/usage", "client-side list price", ["Total cost:  $0.61", "", "  resets on /clear"], "a gauge"],
  ];
  traps.forEach((t, i) => {
    const x = 1.05 + i * 6.05;
    const accent = i === 2 ? C.green : C.amber;
    box(s, x, 2.45, 5.75, 7.2);
    rect(s, x + 0.4, 2.45, 1.2, 0.07, accent);
    txt(s, t[0], x + 0.38, 2.75, 5, 1.8, { fontSize: 110, color: accent });
    mono(s, t[1], x + 0.4, 4.6, 5, 0.55, { fontSize: 22 });
    txt(s, t[2], x + 0.4, 5.15, 5, 0.45, { fontSize: 17, color: C.muted });
    box(s, x + 0.4, 5.85, 4.95, 2.15, { fill: C.code });
    mono(s, t[3].join("\n"), x + 0.65, 6.05, 4.5, 1.8, { fontSize: 14, color: C.dim, lineSpacingMultiple: 1.35 });
    pill(s, t[4].toUpperCase(), x + 0.4, 8.6, { color: accent, fill: i === 2 ? C.greenDeep : C.amberDeep, size: 13 });
  });
  s.addNotes("Pause on the zero. Host dashboards read ~/.claude. The session is in the VM, and sbx rm deletes it. 93 is a real shape of sbx policy log: hosts allowed, no token fields. A cache hit and a huge turn look identical. The dollar figure inside Claude Code is client-side list price. It resets on /clear. On Max or Pro it is the wrong unit. We will still use it, as a gauge the host can see. The terminal snippets are illustrations, not exact output.");
}

// ── 5. Two doors ──────────────────────────────────────────────────────────
{
  const s = newSlide("THE WAY OUT", 5);
  title(s, [["Make the usage object "], ["leave.", true]]);

  box(s, 1.05, 2.45, 5.6, 7.2, { fill: C.code, line: C.green, lw: 1.75 });
  label(s, "microVM", 1.45, 2.8, 4, C.green);
  txt(s, "agent", 1.45, 3.25, 4.8, 0.8, { fontSize: 34 });
  box(s, 1.45, 4.35, 4.8, 1.1, { fill: C.panel });
  label(s, "status line", 1.75, 4.48, 4);
  mono(s, "statusline.py", 1.75, 4.85, 4.4, 0.45, { fontSize: 17, color: C.green });
  box(s, 1.45, 6.6, 4.8, 1.1, { fill: C.panel });
  label(s, "hooks", 1.75, 6.73, 4);
  mono(s, "activity.py", 1.75, 7.1, 4.4, 0.45, { fontSize: 17, color: C.green });
  txt(s, "already has the numbers", 1.45, 8.6, 4.8, 0.5, { fontSize: 18, color: C.muted });

  box(s, 13.75, 2.45, 5.2, 7.2, { fill: "111110", line: C.faint });
  label(s, "laptop", 14.15, 2.8, 4);
  mono(s, "watch.py", 14.15, 3.25, 4.5, 0.8, { fontSize: 32 });
  mono(s, ".sbx/usage.jsonl\n.sbx/activity.jsonl", 14.15, 4.55, 4.6, 1.0, { fontSize: 15, color: C.muted, lineSpacingMultiple: 1.4 });
  mono(s, "listen.py  :8787", 14.15, 6.95, 4.6, 0.45, { fontSize: 15, color: C.muted });

  const doors = [
    [4.95, "DOOR 1", "direct mount", "same directory, append a line"],
    [7.2, "DOOR 2", "clone · mountless", "POST host.docker.internal:8787"],
  ];
  doors.forEach(([y, tag, mode, how], i) => {
    rect(s, 6.55, y - 0.4, 0.2, 0.8, C.bg);
    line(s, 6.25, y, 13.65, y, { color: C.green, w: 3, arrow: true });
    mono(s, tag, 7.1, y - 0.95, 2, 0.45, { fontSize: 14, color: C.green, charSpacing: 2, valign: "middle" });
    txt(s, mode, 8.7, y - 0.95, 4.8, 0.45, { fontSize: 22, valign: "middle" });
    txt(s, how, 7.1, y + 0.2, 6.4, 0.45, { fontSize: 16, color: C.muted, fontFace: i ? MONO : FONT });
  });
  pill(s, "sbx policy allow network localhost:8787", 7.1, 8.25, { color: C.amber, fill: C.amberDeep, size: 13 });
  txt(s, "Neither door carries the key or the prompt.", 1.05, 9.85, 17.9, 0.45, { fontSize: 16, color: C.dim });

  s.addNotes("The status line is a documented Claude Code feature. JSON in, one bar out, no extra model call. Hooks are the other half: they fire after each tool call. Door 1: a direct mount is the same directory on both sides, so appending .sbx/usage.jsonl lands on the laptop. Door 2: clone mode and a mountless VM do not share that file. POST the same line to host.docker.internal. The proxy rewrites that name to localhost before the policy check, so the allow rule is localhost:8787. Neither door carries the API key or the prompt.");
}

// ── 6. Pipeline ───────────────────────────────────────────────────────────
{
  const s = newSlide("THE TAP", 6);
  title(s, [["In the repo. "], ["Not in your home.", true]]);

  const rows = [
    ["TOKENS", "status line", "session JSON", "statusline.py", [["the bar", C.muted], [".sbx/usage.jsonl", C.green], ["POST :8787", C.green]]],
    ["TOOLS", "PostToolUse · Stop", "hook JSON", "activity.py", [[".sbx/activity.jsonl", C.green], ["POST /activity", C.green]]],
  ];
  rows.forEach(([tag, src, via, script, outs], r) => {
    const y = 2.55 + r * 3.1, mid = y + 1.2;
    label(s, tag, 1.05, y - 0.05, 3, C.green);
    box(s, 1.05, y + 0.45, 3.9, 1.5);
    txt(s, "Claude Code", 1.35, y + 0.6, 3.4, 0.55, { fontSize: 22 });
    mono(s, src, 1.35, y + 1.2, 3.5, 0.45, { fontSize: 14, color: C.dim });
    line(s, 4.95, mid, 7.3, mid, { color: C.dim, w: 2, arrow: true });
    mono(s, via, 5.0, y + 0.7, 2.3, 0.4, { fontSize: 13, color: C.dim, align: "center" });
    box(s, 7.4, y + 0.45, 4.3, 1.5, { fill: C.greenDeep, line: C.green, lw: 1.5 });
    mono(s, script, 7.4, y + 0.45, 4.3, 1.5, { fontSize: 22, color: C.green, align: "center", valign: "middle" });
    line(s, 11.7, mid, 12.5, mid, { color: C.green, w: 2 });
    outs.forEach(([o, c], j) => {
      const oy = mid + (j - (outs.length - 1) / 2) * 0.72;
      line(s, 12.5, mid, 12.5, oy, { color: C.green, w: 2 });
      line(s, 12.5, oy, 13.3, oy, { color: C.green, w: 2, arrow: true });
      pill(s, o, 13.4, oy - 0.23, { color: c, size: 15, w: 4.4 });
    });
  });
  box(s, 1.05, 8.85, 17.9, 1.0, { fill: C.code });
  txt(s, [
    { text: "No tokens spent.   ", options: { color: C.ink } },
    { text: "A refresh is not a new row.   ", options: { color: C.muted } },
    { text: "Tool name only, never the command.", options: { color: C.muted } },
  ], 1.4, 8.85, 17.3, 1.0, { fontSize: 20, valign: "middle" });

  s.addNotes("Point at usage-tap/statusline.py. Wire it from project .claude/settings.json, statusLine.command. The full settings fragment is usage-tap/settings.fragment.json. cost.total_cost_usd is the session estimate. current_usage is the last main-loop response: input, output, cache read, cache write. The script dedupes on those fields. A refused POST is ignored, so the bar still renders. The status line itself spends no tokens. The second script, usage-tap/activity.py, is an async PostToolUse, PostToolUseFailure, SubagentStop and Stop hook. It keeps the tool name and drops tool_input, so no command or path leaves the VM. Tokens tell you how much. The hook tells you what for.");
}

// ── 7. The picture on the host ────────────────────────────────────────────
{
  const s = newSlide("ON THE HOST", 7);
  title(s, [["Same session. "], ["Watch the cache.", true]]);

  const a = term(s, 1.05, 2.4, 7.2, 3.9, "inside the sandbox");
  mono(s, "> refactor the parser", a.x, a.y, 6.5, 0.4, { fontSize: 15, color: C.muted });
  mono(s, "⏺ Edit src/parse.ts", a.x, a.y + 0.5, 6.5, 0.4, { fontSize: 15, color: C.dim });
  box(s, 1.25, 5.3, 6.8, 0.75, { fill: C.bar, r: 0.08 });
  mono(s, "claude-sonnet   $0.61   ctx 34%", 1.5, 5.3, 6.4, 0.75, { fontSize: 17, color: C.green, valign: "middle" });

  const b = term(s, 8.6, 2.4, 10.35, 3.9, "host · tail -f .sbx/usage.jsonl");
  mono(s, [
    { text: '{"usd":0.42,"output":190,', options: { color: C.dim } },
    { text: '"cache_read":140220', options: { color: C.muted } },
    { text: ",…}", options: { color: C.dim, breakLine: true } },
    { text: '{"usd":0.61,"output":88,', options: { color: C.ink } },
    { text: '"cache_read":148900', options: { color: C.green } },
    { text: ",…}", options: { color: C.ink } },
  ], b.x, b.y + 0.2, 9.7, 1.4, { fontSize: 16, lineSpacingMultiple: 1.7 });
  mono(s, "▍", b.x, b.y + 1.75, 0.5, 0.4, { fontSize: 16, color: C.green });

  // Before → after, each metric on its own scale.
  const beats = [
    ["cache_read", 140220, 148900, "up", C.green],
    ["output", 190, 88, "down", C.ink],
    ["usd", 0.42, 0.61, "barely", C.ink],
    ["hosts", 93, 93, "same", C.dim],
  ];
  beats.forEach(([k, v0, v1, verdict, c], i) => {
    const x = 1.05 + i * 4.55, top = 6.65, base = 9.3, max = Math.max(v0, v1);
    box(s, x, top, 4.3, 3.0);
    mono(s, k, x + 0.3, top + 0.25, 3.7, 0.4, { fontSize: 15, color: C.dim });
    [[v0, C.faint], [v1, c]].forEach(([v, col], j) => {
      const h = (v / max) * 1.7;
      rect(s, x + 0.3 + j * 0.75, base - h, 0.6, h, col);
    });
    txt(s, verdict, x + 2.0, top + 1.0, 2.2, 0.6, { fontSize: 28, color: c === C.dim ? C.muted : c });
    mono(s, `${v0.toLocaleString("en-US")} → ${v1.toLocaleString("en-US")}`, x + 2.0, top + 1.7, 2.3, 0.4, { fontSize: 12, color: C.dim });
  });

  s.addNotes("Demo if you pre-staged it. Terminal inside shows the bar. Terminal on the host tails the jsonl. Narrate the picture: cache read grew, output shrank, dollars barely moved, the host count did not move at all. That is a warm prompt cache. For clone mode the jsonl stays in the private clone. Run python3 usage-tap/listen.py and sbx policy allow network localhost:8787, then tail .sbx/usage-from-vm.jsonl. Do not debug policy on stage.");
}

// ── 8. The monitor ────────────────────────────────────────────────────────
{
  const s = newSlide("THE MONITOR", 8);
  title(s, [["Watch every sandbox, "], ["not one tail.", true]]);

  const FS = 16, cw = FS * MONO_W;
  const t = term(s, 1.05, 2.35, 17.9, 4.1, "host · python3 usage-tap/watch.py --budget 2");
  const screen = [
    ["session   model              usd  $/min  cache   ctx    5h  idle  tools", C.dim],
    ["a41f09c2  claude-sonnet     0.61   0.04    97%   34%     -    4s  Read×12 Edit×5 Bash×3", C.ink],
    ["7be2d118  claude-opus       2.37   0.31    41%   78%     -   12s  Bash×40 WebFetch×9  over $2", C.amber],
    ["c09e7a55  claude-haiku      0.03   0.00    88%    6%     -   14m  Grep×2", C.dim],
  ];
  box(s, 1.25, t.y + 0.1 + 2 * 0.62, 17.5, 0.58, { fill: C.amberDeep, r: 0.06 });
  screen.forEach((l, i) => {
    mono(s, l[0], t.x, t.y + 0.1 + i * 0.62, 17.2, 0.58, { fontSize: FS, color: l[1], valign: "middle" });
  });

  // Underline the four columns the cards below explain.
  const head = screen[0][0];
  const reads = [
    ["$/min", "burn rate", "catch the runaway"],
    ["cache", "read / all input", "cold cache costs"],
    ["5h", "plan limit", "the Pro / Max unit"],
    ["tools", "from the hook", "what it is doing"],
  ];
  reads.forEach((r, i) => {
    rect(s, t.x + head.indexOf(r[0]) * cw, t.y + 0.58, r[0].length * cw, 0.05, C.green);
    const x = 1.05 + i * 4.55;
    box(s, x, 6.85, 4.3, 2.8);
    rect(s, x + 0.3, 6.85, 0.9, 0.06, C.green);
    mono(s, r[0], x + 0.3, 7.15, 3.7, 0.7, { fontSize: 30, color: C.green });
    txt(s, r[1], x + 0.3, 8.0, 3.7, 0.5, { fontSize: 22 });
    txt(s, r[2], x + 0.3, 8.6, 3.7, 0.45, { fontSize: 17, color: C.muted });
  });

  s.addNotes("This is what the audience takes home. watch.py runs on the laptop, stdlib only, and reads every .sbx/usage and activity file from both doors. One line per session, most recent first. Read the amber row: opus, 2.37 dollars, burning 31 cents a minute, cache at 41 percent, 40 Bash calls and 9 fetches. That is a session to look at now, not on the invoice. The budget flag turns it red and rings the terminal bell. On Pro or Max ignore usd and read the 5h column, the plan limit from the status line JSON. It is blank on an API key. Same rule as the row: usd is taken from the latest row, never summed.");
}

// ── 9. How to read a row ──────────────────────────────────────────────────
{
  const s = newSlide("ONE ROW", 9);
  title(s, [["Two scopes. "], ["Don't add them up.", true]]);

  const cols = [["usd", "0.61"], ["input", "800"], ["output", "88"], ["cache_read", "148,900"], ["cache_write", "500"]];
  const xs = [1.05, 4.75, 7.75, 10.75, 15.0];
  box(s, 1.05, 2.5, 17.9, 2.6, { fill: C.code });
  cols.forEach(([k, v], i) => {
    mono(s, k, xs[i] + 0.35, 2.75, 4, 0.45, { fontSize: 18, color: C.dim });
    txt(s, v, xs[i] + 0.3, 3.3, 4, 1.3, { fontSize: 60, color: i === 0 ? C.green : C.ink });
  });
  const bracket = (x1, x2, color, head, sub) => {
    line(s, x1, 5.45, x1, 5.75, { color, w: 2 });
    line(s, x1, 5.75, x2, 5.75, { color, w: 2 });
    line(s, x2, 5.45, x2, 5.75, { color, w: 2 });
    txt(s, head, x1, 6.0, x2 - x1, 0.6, { fontSize: 26, color });
    txt(s, sub, x1, 6.6, x2 - x1, 0.9, { fontSize: 18, color: C.muted });
  };
  bracket(1.4, 4.3, C.green, "session total", "cumulative,\nlist price");
  bracket(5.1, 18.6, C.ink, "last call", "each new row is a new response. Sum cache_read if you want reads.");

  box(s, 1.05, 8.0, 8.7, 1.65, { fill: C.amberDeep });
  txt(s, [{ text: "Σ usd  ", options: { color: C.amber, fontFace: MONO } }, { text: "double-counts", options: { color: C.ink } }], 1.45, 8.0, 8, 1.65, { fontSize: 30, valign: "middle" });
  box(s, 10.25, 8.0, 8.7, 1.65, { fill: C.amberDeep });
  txt(s, [{ text: "Σ input  ", options: { color: C.amber, fontFace: MONO } }, { text: "is not the day", options: { color: C.ink } }], 10.65, 8.0, 8, 1.65, { fontSize: 30, valign: "middle" });

  s.addNotes("usd is cumulative for the session, at list price. The token fields are the last main-loop response, not a running sum. Each new row is a new response, so you can sum cache_read if you want tokens billed as reads. You cannot sum usd. Subagent spend may sit inside the dollar figure and be absent from the token columns. Say that only if asked.");
}

// ── 10. Not a billing system ──────────────────────────────────────────────
{
  const s = newSlide("WHAT IT IS NOT", 10);
  title(s, [["A gauge. "], ["Not the bill.", true]]);
  const pairs = [
    ["jsonl", "invoice", "reconcile weekly with the console"],
    ["tokens", "prompts", "gitignore .sbx/"],
    ["Claude", "Codex", "same pattern, other file"],
    ["tokens", "seconds", "two columns, never one sum"],
  ];
  pairs.forEach((p, i) => {
    const y = 2.55 + i * 1.8;
    if (i) line(s, 1.05, y - 0.15, 18.95, y - 0.15, { color: C.faint, w: 1 });
    txt(s, p[0], 1.05, y, 4.6, 1.4, { fontSize: 56, valign: "middle" });
    txt(s, "≠", 5.6, y, 1.5, 1.4, { fontSize: 60, color: C.green, align: "center", valign: "middle" });
    txt(s, p[1], 7.2, y, 5, 1.4, { fontSize: 56, color: C.dim, valign: "middle" });
    txt(s, p[2], 12.6, y, 6.35, 1.4, { fontSize: 20, color: C.muted, valign: "middle", align: "right" });
  });
  s.addNotes("Do not oversell. The client dollar figure can drift from discounts and data-residency multipliers. Anthropic says the invoice is the Console or the Usage and Cost API. The tap is how you notice a runaway session this afternoon. Gitignore .sbx/ so a session id never lands in the repo. Codex has no status line like this. The pattern is the same: read the agent's own usage object inside the VM and write it out a door. Docker's cloud usage page is VM-seconds. Leave it in another column.");
}

// ── 11. Monday ────────────────────────────────────────────────────────────
{
  const s = newSlide("MONDAY", 11);
  title(s, [["Once per repo."]]);
  const steps = [
    ["Copy", "usage-tap/"],
    ["Ignore", ".sbx/"],
    ["Watch", "watch.py"],
    ["Allow", "localhost:8787"],
    ["Trust", "the console"],
  ];
  const cy = 3.6, gap = 3.55;
  line(s, 1.6, cy, 1.6 + 4 * gap, cy, { color: C.faint, w: 2 });
  steps.forEach(([verb, arg], i) => {
    const cx = 1.6 + i * gap;
    const live = i === 2;
    s.addShape(pres.shapes.OVAL, {
      x: cx - 0.5, y: cy - 0.5, w: 1.0, h: 1.0,
      fill: { color: live ? C.green : C.bg }, line: { color: live ? C.green : C.dim, width: 1.5 },
    });
    mono(s, String(i + 1), cx - 0.5, cy - 0.5, 1.0, 1.0, { fontSize: 22, color: live ? C.bg : C.ink, align: "center", valign: "middle" });
    txt(s, verb, cx - 0.55, cy + 0.85, 3.2, 0.7, { fontSize: 32 });
    mono(s, arg, cx - 0.55, cy + 1.6, 3.2, 0.45, { fontSize: 15, color: live ? C.green : C.muted });
  });
  pill(s, "LIVE DEMO", 1.6 + 2 * gap - 0.6, cy - 1.2, { color: C.green, fill: C.greenDeep, size: 12, w: 1.2 + 0.0 });

  const end = [["Free", "laptop", C.dim], ["Seconds", "cloud", C.muted], ["Tokens", "provider", C.green]];
  end.forEach(([big, small, c], i) => {
    const x = 1.05 + i * 6.05;
    rect(s, x, 6.95, 5.75, 0.07, c);
    txt(s, big, x, 7.25, 5.6, 1.1, { fontSize: 48 });
    txt(s, small, x, 8.4, 5.6, 0.5, { fontSize: 20, color: C.dim });
  });
  s.addNotes("Leave this up. The live beat is step 3, on a direct mount, sandbox already created. If watch.py says no rows yet, send one short prompt. For clone, step 4. When a session looks expensive, open the provider console. That number is the one you pay.");
}

// ── 12. Off the record ────────────────────────────────────────────────────
{
  const s = newSlide("OFF THE RECORD", 12);
  title(s, [["Leave these "], ["unsaid.", true]]);
  const nos = [
    ["sbx counts tokens", "it counts hosts"],
    ["jsonl is the invoice", "list price"],
    ["sum the usd column", "already cumulative"],
    ["clone writes the host", "it writes the clone"],
    ["~/.claude applies", "project .claude does"],
    ["OTel from the repo", "ignored in project settings"],
  ];
  nos.forEach(([no, yes], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 1.05 + col * 9.15, y = 2.5 + row * 2.4;
    box(s, x, y, 8.85, 2.1);
    txt(s, no, x + 0.4, y + 0.3, 8.05, 0.7, { fontSize: 26, color: C.dim, strike: "sngStrike" });
    txt(s, "→  " + yes, x + 0.4, y + 1.1, 8.05, 0.6, { fontSize: 22, color: C.green });
  });
  s.addNotes("Backup slide. Sources checked 23 Oct 2026. Status line fields: code.claude.com/docs/en/statusline. Costs and the invoice: code.claude.com/docs/en/costs. Host reachability and the localhost policy rewrite: Docker Sandboxes development docs. Hooks and async: code.claude.com/docs/en/hooks. OpenTelemetry: code.claude.com/docs/en/monitoring-usage. Claude Code ignores OTEL exporter variables in a repo's .claude/settings.json, so do not promise telemetry from the repo. Also leave out a price per vCPU-hour; look it up that morning. The product is the sbx microVM CLI, not the older docker sandbox container flow.");
}

pres.writeFile({ fileName: "/Users/marco/idee/talk-sbx-fri/docker-sandboxes-tokens.pptx" })
  .then(() => console.log("wrote pptx"))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
