# Square Post Skill

Publish text, image, article, and video posts to Binance Square through the
local Node.js scripts in `scripts/`.

## Dependencies

### Runtime

- Node.js 18 or newer. The scripts use native ES modules and the built-in
  `fetch` API.
- Bash-capable shell for running the scripts through the agent tool.

### System Tools

- `ffmpeg` is required for video posts. `scripts/post-video.mjs` extracts the
  first frame from the source video and uploads it as the post cover.
- `ffprobe` is required when the user does not provide a video duration. The
  agent uses it to determine the duration before calling `post-video.mjs`.

### External Services

- Binance Square OpenAPI access through `BINANCE_SQUARE_OPENAPI_KEY` or the
  local saved key file.
- Network access to the Square OpenAPI endpoints and to presigned upload URLs
  returned by the API.

No npm package install is required for the current scripts; they only use
Node.js built-in modules.

## Authentication

Scripts read the OpenAPI key in this order:

1. `BINANCE_SQUARE_OPENAPI_KEY`
2. The saved key file at `~/.config/binance-square/openapi-key`

Do not pass API keys as CLI arguments. `--key` is rejected because command-line
arguments can appear in process listings and shell history.

To save a key for future runs, explicitly run:

```bash
BINANCE_SQUARE_OPENAPI_KEY=<apiKey> node scripts/save-key.mjs
```

The saved key file is written with `0600` permissions. To remove it, delete
`~/.config/binance-square/openapi-key`.

## Directory Structure

```
square-post/
├── SKILL.md              # Skill instructions and publishing workflow
├── README.md             # Directory overview
├── scripts/
│   ├── lib.mjs           # Shared API, upload, polling, and publish helpers
│   ├── save-key.mjs      # Saves the OpenAPI key to a local private config file
│   ├── post-text.mjs     # Text and article publishing script
│   ├── post-image.mjs    # Image post and article-with-cover publishing script
│   └── post-video.mjs    # Video publishing script with generated cover
```
