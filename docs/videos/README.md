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
