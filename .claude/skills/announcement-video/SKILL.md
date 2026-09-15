---
name: announcement-video
description: Produce a short social video (1920×1080 MP4, burned-in captions, original soundtrack) for a big CCXT release or a product announcement, using the Remotion project in docs/videos. Use on demand for launches and notable releases — not for routine releases. Covers pulling release data, choosing highlights, rendering, verifying frames, and drafting the post.
---

# Announcement & release videos

Renders a social-ready MP4 from the Remotion project in `docs/videos/`. Two paths:

| Path | When | Length | Effort |
|---|---|---|---|
| **Release video** | a notable release worth posting | ~11–21s (scales with content) | data script + you pick 1–4 highlights |
| **Announcement video** | a new product, server, or capability | ~20–45s | a new composition, modelled on `src/mcp-launch/` |

Routine releases don't get a video. Ask first if it isn't obvious the release is worth one.

## Setup (once per checkout)

```bash
cd docs/videos && npm install
```

Needs Node ≥18, `ffmpeg`/`ffprobe` on PATH, and `gh` authenticated (release notes). Optional but
recommended before editing compositions: `npx remotion skills add` (Remotion's own agent skills,
installed into `docs/videos/.agents/skills`, gitignored).

**Run every command from `docs/videos`** (or use `npm --prefix docs/videos run …`). Rendered videos,
frame grids and generated soundtracks land in `docs/videos/out/` and `public/music/`, both gitignored.

Remotion is free for individuals and companies of up to 3 people — check the licence before using
this commercially.

## Path A — release video

```bash
npm run release:data -- v4.5.76       # pulls the notes, writes src/releases/v4.5.76.json + index.ts
# edit src/releases/v4.5.76.json: fill in "highlights" (see below)
npm run release:render -- v4.5.76     # soundtrack + render + frame grid in out/
```

`release:data` fills `stats` (PRs, exchanges touched, contributors, first-time contributors) and
`changes` (every PR with its type). It never touches `highlights`, so re-running it on an existing
release is safe.

### Picking highlights (the only judgement call)

1–4 entries, most important first. Read the PRs before writing anything:

```bash
gh pr view 30048 --repo ccxt/ccxt --json title,body -q '.title + "\n" + .body[0:1200]'
gh pr diff 29762 --repo ccxt/ccxt | head -60      # when a PR has no description
```

Rules that keep the video honest:
- **Every number must come from the PR.** A speed-up figure belongs on screen only if the PR states
  it. If the PR gives none, describe the change without a number ("tuned", not "2× faster").
- **Say what changed for the user**, not the internal mechanism: "Race-free WebSocket login" beats
  "single-flight authenticate".
- Title ≤ ~30 characters (2 lines at 92px), detail ≤ ~60 characters (one line at 40px).
- `kind` sets the badge and colour: `feat` (New), `perf` (Faster), `fix` (Fixed), `core` (Under the hood).
- List every PR behind the card in `prs`; the card shows the first two and "+N".

Entry shape, one `visual` per card:

```jsonc
{
  "kind": "perf",
  "title": "Faster order books and math",
  "detail": "Tuned across JS, Python, Go, C# and Java",
  "prs": [30048, 30024],
  "visual": { "type": "metrics", "items": [
    { "value": "3.3×", "label": "JS order book updates" },      // counts up from 1.0×
    { "value": "−61%", "label": "C# order book bisect" }        // negative values count from 0
  ] }
}
```

| `visual.type` | Use for | Shape |
|---|---|---|
| `command` | something to install or run | `{ "text": "claude mcp add ccxt -- npx -y ccxt-mcp" }` — one line, ≤ ~40 chars |
| `metrics` | 1–2 measured figures | `{ "items": [{ "value": "3.3×", "label": "…" }] }` |
| `chips` | up to 8 exchanges or clients | `{ "items": ["LBank", "Bitstamp", …] }` |
| `code` | a before/after or new methods | `{ "lines": ["// before", "…"] }` — ≤6 lines, ≤48 chars |

### What the template does automatically

- **Version roll** from the previous tag, with the release date.
- **Full change list**: releases with ≥10 PRs get a 4s scene that scrolls every PR (highlighted ones
  marked) beside a features/fixes/performance/tests/docs/maintenance breakdown that counts up.
- **Stats**: singular labels at 1 ("1 pull request"), zero counters hidden, first-time contributors welcomed.
- **Install screen** held ~4s: npm, pip, composer, dotnet and go commands at the release version.
- Soundtrack and progress bar adapt to the number of cards.

## Path B — announcement video

Copy the structure of `src/mcp-launch/` (Video.tsx + timeline.ts + scenes/) into
`src/<slug>/`, register it in `src/Root.tsx` under the `Announcements` folder, and copy
`scripts/music-mcp-launch.mjs` to `scripts/music-<slug>.mjs` with hit points matching your timeline.
Reuse `src/components/` (Backdrop, CcxtMark, Captions) and `src/theme.ts`, plus the release
building blocks (`src/release/Visual.tsx` has the command/metrics/chips/code panels).

Storyboard that worked for the MCP launch:

1. **Hook (≤6s)** — 3 kinetic lines, then the logo and a tagline. Land the logo on a music hit.
2. **Show it working (~20s)** — a terminal doing the real thing: install command, a typed prompt, the
   tool calls, the result. Zoom in while text matters, pull back on a beat to reveal the result.
3. **Scale (~6s)** — a counter or wall of names for the "how much" claim.
4. **Call to action (≥4s static)** — install commands and the repo URL, held long enough to pause and copy.

Rules learned the hard way:
- **Use real data.** Capture it (ccxt MCP tools, `npm run cli.ts -- …`) and store it in a data file
  with a comment naming the source and UTC timestamp. Never invent prices or numbers.
- **Never place a real order for a demo.** Order flows are illustrative; keep sizes consistent with
  the repo's live-test rules (≤25 USD) so the story stays credible.
- **Mimic real UI, don't invent it.** If you show another tool's interface, keep it to what that tool
  actually does — an invented confirmation dialog reads as fake.
- **Stay agent-neutral** in anything MCP-related: show one client, list the others' install commands,
  and verify each command against that client's own docs. Don't claim clients that can't run a local
  stdio server (the ChatGPT app connects only to remote HTTPS servers).
- **Captions are burned in** (`<Captions cues={…} />` at the composition root, times in seconds) —
  Twitter and Telegram autoplay muted.
- **Commands must be copyable**: set `fontVariantLigatures: "none"` wherever a command is shown, or
  JetBrains Mono renders `==` as one glyph.
- Cut on the 2s bars of the 120 BPM soundtrack: `sec()` from `src/timeline.ts`, hit points mirrored in
  the music script. `scripts/synth.mjs` has kick/clap/hat/crash/riser/pad/bass/arp and `save()`.
- Exchange logos are typographic stand-ins (`src/mcp-launch/components/ExchangeLogo.tsx`). For real
  artwork, drop SVGs in `public/logos/` and render them with `<Img src={staticFile(…)} />`.

## Verify before sending (always)

```bash
npx tsc --noEmit && npx eslint src
npm run frames -- out/ccxt-v4.5.76.mp4          # 8-frame grid; --at 3,10.5 for specific moments
ffprobe -v error -show_entries format=duration:stream=codec_name -of compact out/ccxt-v4.5.76.mp4
```

Open the frame grid and check: no clipped or wrapped text, commands on one line, numbers correct,
the final frame is the call to action, and an `aac` audio stream exists. You cannot watch or hear the
render — say so when you hand it over, and name what you did check.

Preview interactively with `npm run dev` (Remotion Studio).

## Delivering

- Send the MP4 from `docs/videos/out/`.
- Offer a post: X ≤280 characters (links count as 23), and a longer Telegram version. Keep every claim
  to what the video shows.
- Don't commit the MP4s; `out/` is gitignored. Commit the data file and any code changes.

## Files

```
docs/videos/
  src/timeline.ts            FPS/size/sec helpers (120 BPM: 1 bar = 2s = 60 frames)
  src/theme.ts               colours + fonts        src/components/  Backdrop, CcxtMark, Captions
  src/mcp-launch/            reference announcement (scenes, timeline, data)
  src/release/               release template       src/releases/     per-release data + generated index
  scripts/release-data.mjs   notes -> release JSON  scripts/render-release.mjs  music + render + frames
  scripts/synth.mjs          soundtrack voices      scripts/contact-sheet.mjs   frame grid
  out/                       renders + frame grids (gitignored)
```
