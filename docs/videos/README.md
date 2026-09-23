# ccxt videos

[Remotion](https://remotion.dev) project for CCXT launch and release videos: 1920×1080 MP4, burned-in
captions, soundtrack generated from code. Used on demand for big releases and announcements, not for
every release.

The full workflow (picking highlights, accuracy rules, verification, post drafts) is the
`announcement-video` skill: [`.claude/skills/announcement-video/SKILL.md`](../../.claude/skills/announcement-video/SKILL.md).

```bash
cd docs/videos && npm install          # Node >= 18, ffmpeg and gh on PATH

npm run release:data -- v4.5.76        # release notes -> src/releases/v4.5.76.json (+ index.ts)
# fill in "highlights" in that file
npm run release:render -- v4.5.76      # -> out/ccxt-v4.5.76.mp4 + out/ccxt-v4.5.76-sheet.png

npm run mcp-launch:render              # the ccxt-mcp launch announcement
npm run dev                            # Remotion Studio
npm run frames -- out/ccxt-v4.5.76.mp4 # frame grid for reviewing a render
```

`out/`, `public/music/` and the installed Remotion agent skills are gitignored: every one of them is
reproducible from the scripts.

## Shared building blocks

`src/kit/` holds the components every announcement is assembled from — the
crossfade wrapper, typography, code panels, screen-recording panels, the
keynote reveal, and a few diagram primitives. `src/kit/beats.ts` builds the
timeline and refuses a scene table that cannot sit on the musical beat grid.

**Read [GOTCHAS.md](./GOTCHAS.md) before writing scene code.** It is the list of
failures those components encode, from crossfades that dip to black to captures
that contain the real OS pointer.

```bash
npm run check:music -- public/music/foo.wav 0,4,12 intro,reveal,body
```

prints per-section level and brightness, which is the only way to tell whether a
soundtrack's arc actually moves when you cannot hear the render.
