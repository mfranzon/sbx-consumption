# Following the tokens out of a Docker Sandbox

15 minutes, no live demo. The deck is `docker-sandboxes-tokens.html`: open it in a browser, press **P** for the presenter window (timer, pace against the plan below, current and next slide, notes), and put the deck itself fullscreen (**F**) on the projector. Speaker notes are on the slides. This file is the same talk, in reading order.

**Thesis.** The sandbox hides `~/.claude`. It does not hide two doors you already have: the workspace mount, and `host.docker.internal`. A Claude Code status line can write one usage line through either door. The host watches tokens without copying the transcript, and without reading the network log as a bill.

The status line is `usage-tap/statusline.py`. The activity hook is `usage-tap/activity.py`. The host listener is `usage-tap/listen.py`. The host monitor is `usage-tap/watch.py`. The code is public at [github.com/mfranzon/usage-tap](https://github.com/mfranzon/usage-tap), MIT licensed. Wire it from project `.claude/settings.json`, using `usage-tap/settings.fragment.json`. Sandboxes do not load host `~/.claude`.

| Time | # | Slide |
| --- | --- | --- |
| 0:00 | 1 | Following the tokens out of a Docker Sandbox |
| 0:45 | 2 | Only the repo crosses into the sandbox |
| 2:30 | 3 | Three ways to look in the wrong place |
| 4:30 | 4 | Two doors let the usage object leave the VM |
| 7:00 | 5 | Demo 1: Each prompt writes one row on the laptop |
| 8:30 | 6 | Demo 2: One monitor watches every sandbox at once |
| 10:30 | 7 | These numbers are an estimate and not a bill |
| 12:00 | 8 | Five steps set it up once per repo |
| 13:30 | 9 | Thanks (questions, link) |
| backup | 10 | Six claims to leave out of the talk |

## Script

What to say on each slide. The same text is in the deck's speaker notes (P or N).

### 1. Following the tokens out of a Docker Sandbox (0:00)

Hi, I'm Marco. When you run a coding agent inside a Docker Sandbox, you get a lot of safety. But you lose sight of one thing: how many tokens the agent is spending. Today I'll show you how to get that number back, without weakening the sandbox. The trick is small. The agent already knows its own usage. We just let one line of it walk out.

### 2. Only the repo crosses into the sandbox (0:45)

Here's the sandbox. The agent runs in a small VM with its own kernel. Your project goes in, mounted or cloned. Your home folder does not. So your personal Claude settings in ~/.claude stay on the laptop. Your API key stays there too. The agent only sees a placeholder, and a proxy swaps in the real key on the way out. Great for safety. But it also means any tool that reads ~/.claude to count your usage is now looking at an empty folder.

### 3. Three ways to look in the wrong place (2:30)

So where do people look? Three places, and all three mislead you. First, tools like ccusage. They read ~/.claude on the host, the session isn't there, so they show zero. Second, the sandbox network log. It tells you the agent talked to 93 hosts. But a connection is not a token: a tiny request and a huge one look the same. Third, the cost Claude Code shows inside the session. It's a list-price estimate and it resets when you clear. That one is actually useful as a gauge. We just need to get it out of the VM.

### 4. Two doors let the usage object leave the VM (4:30)

Good news: the agent already has the numbers. Claude Code has a status line, a tiny script that gets the usage after every response. Ours is statusline.py, and it costs zero tokens because it runs locally. There's also a hook, activity.py, that records which tool ran, just the name. Both live in the repo, wired in the project's .claude/settings.json. Now, how do the numbers get out? Two doors. Door one is the direct mount: the project folder is the same folder on both sides, so a line written there is already on your laptop. Door two is for clone mode, where nothing is shared: the script sends the line over HTTP to a small listener on your laptop. You allow one address, localhost:8787, and that's it. Neither door carries your key or your prompts. Just numbers.

### 5. Each prompt writes one row on the laptop (7:00)

Let me show you how it looks. This is a replay, so we don't depend on the Wi-Fi. On the left I'm inside the sandbox. I start Claude and ask it to refactor a parser. The status bar shows the model, 42 cents so far, and 31 percent of the context used. On the right, my laptop is watching the usage file. And there's the row. One prompt, one row, and the conversation itself never left the VM.

### 6. One monitor watches every sandbox at once (8:30)

One file is fine for one session. With several sandboxes you want a monitor. watch.py runs on the laptop and shows one line per session. Look at the opus row: 2.37 dollars, burning 31 cents a minute, and only 41 percent of its input comes from cache. I gave it a budget of two dollars, so the row lights up and the terminal beeps. That's a session to check now, not at the end of the month. On a Pro or Max plan, ignore the dollars and read the 5h column: how much of your plan limit you've used. And in clone mode the rows arrive through the listener instead, and the monitor reads both doors, so nothing changes.

### 7. These numbers are an estimate and not a bill (10:30)

Let's be honest about what this is. It's an estimate at list price. And the dollar column is already a running total for the session, so never add it up. Your real bill lives in the provider console, so check it once a week. The rows never contain your prompts, and you should still gitignore the .sbx folder. The same idea works for Codex, with a different file. And sandbox seconds and model tokens are two different bills, so keep them in two columns.

### 8. Five steps set it up once per repo (12:00)

So what do you do on Monday? Copy the usage-tap folder into your repo. Add .sbx to gitignore. Run watch.py on your laptop. If you use clone mode, allow localhost:8787. And when a number looks scary, open the provider console: that's the number you actually pay. Everything is on GitHub, the link is right there.

### 9. Thanks (13:30)

That's it: keep the keys in, and let the usage out. The code is on GitHub at mfranzon/usage-tap, MIT licensed, plain Python with no dependencies. Thank you! I'm happy to take questions.

### 10. Six claims to leave out of the talk (backup)

Backup for questions, don't present it. sbx counts hosts, not tokens. The file is an estimate, not the invoice. Never sum the dollar column. In clone mode the file stays in the clone. Project .claude settings apply, your home ~/.claude doesn't. OpenTelemetry can't be switched on from the repo settings. Sources, checked 23 Oct 2026: code.claude.com/docs/en/statusline, /costs, /hooks and /monitoring-usage, plus the Docker Sandboxes docs.

## Demo, on slides

There is no live demo. Slides 5 and 6 replay one: commands type themselves and rows appear in order when the slide opens. Wait for each step to finish before you talk over it. Press **R** to replay a step.

1. **One prompt, one row.** Direct mount. Inside the sandbox: `sbx run claude`, then "refactor the parser". The status bar reads `claude-sonnet  $0.42  ctx 31%`. On the host, `tail -f .sbx/usage.jsonl` prints the first row. The status line wrote it, with no extra model call.
2. **The monitor.** `python3 usage-tap/watch.py --budget 2`. One line per session: latest `usd`, `$/min` over the last five minutes, turns, output tokens, cache hit ratio, context %, the Pro/Max 5-hour limit, idle time, and the top tools from the hook. The opus session is past the budget, so its row is flagged and the bell rings. The idle haiku row is dimmed. `--once` prints one frame for a script or a cron job.

Clone mode is no longer a demo slide; it is covered in the notes of slides 4 and 6. If asked, on the laptop:

```bash
sbx policy allow network localhost:8787
python3 usage-tap/listen.py
tail -f .sbx/usage-from-vm.jsonl
```

The sandbox proxy rewrites `host.docker.internal` to `localhost` before the policy check, so the rule names `localhost`. Hook rows arrive on `POST /activity` and land in `.sbx/activity-from-vm.jsonl`. `watch.py` reads both doors and drops the duplicate copy when a direct mount writes both.

The numbers on the demo slides are illustrations, consistent with each other, not a captured session.

## What a row means

- `usd` is the session total so far, at list price. Cumulative. Do not sum it down the file.
- `input`, `output`, `cache_read`, `cache_write` are the last main-loop response, not a running sum.
- `wall_ms`, `api_ms`, `lines` are session totals, like `usd`. `ctx_pct` and `limit_5h_pct` are the latest reading. `limit_5h_pct` is null on an API key.
- The status line spends no tokens. It writes a row only when those numbers change.
- An activity row has `event`, `tool`, `ok`, and the session. No `tool_input`, no command, no path.
- Gitignore `.sbx/`. The row has no prompt. Leave it that way.
- Once a week, reconcile to the provider console. Docker's cloud usage page is VM-seconds, a different column.

## Do not claim

- That `sbx` records token counts.
- That the jsonl matches the invoice, or that `usd` is the right unit on a Max or Pro plan.
- That clone mode drops `.sbx/usage.jsonl` on the host.
- That host `~/.claude` settings apply inside the sandbox.
- A price per vCPU-hour.
- That OpenTelemetry can be switched on from the repo. Claude Code ignores OTEL exporter variables in a project `.claude/settings.json`.
- That the tools column counts subagent tool calls. It counts the hooks that fired in the session.
- That the demo slides are a live recording of a real session.
