---
name: square-post
description: |
  Use when the user wants to publish new content to Binance Square — short text, multi-image
  posts (up to 4), long-form articles with an optional cover, or videos with an auto-generated
  cover frame. Trigger on direct phrasings like "post to Square", "publish to Binance Square",
  "发广场", "发布到广场", and on near-miss intents where the user clearly wants to share or
  publish content on Square even without naming the skill: "share this analysis on Square",
  "把这篇文章发出去", "发个动态", "把这个视频上传到广场", "publish my chart to Square as an
  article". Also use when the user provides media (images, video) plus a caption and asks to
  push it to Square, or asks to turn a draft into a Square article. Do not use for reading,
  searching, commenting, liking, editing, deleting, scheduling, or managing existing Square
  posts — this skill only creates new posts.
allowed-tools:
  - Bash
metadata:
  author: binance-square
  version: "2.0.0"
---

# Square Post Skill

## Purpose

Publish new content to Binance Square by running the local scripts in `scripts/`.

Supported post types:
- Text-only short posts
- Image posts with up to 4 images
- Long articles with a title and optional cover image
- Video posts with an auto-generated cover image

Do not hand-code API requests for normal posting. The scripts own upload, polling, cover generation, and publish behavior.

## Runtime Dependencies

- Node.js 18 or newer. The scripts use native ES modules and the built-in `fetch` API.
- `ffmpeg` is required for video posts because `post-video.mjs` extracts the first frame as the cover image.
- `ffprobe` is required when a video duration is not provided by the user.
- Network access is required for Binance Square OpenAPI requests and presigned media uploads.

## Authentication

Posting requires a Binance Square OpenAPI key.

Before posting:
- Prefer `BINANCE_SQUARE_OPENAPI_KEY` from the user's environment if present.
- If it is not present, the scripts automatically check `~/.config/binance-square/openapi-key`.
- If no valid key is found, ask the user to provide an API key first.
- If the user wants to reuse the key in future requests, save it with `BINANCE_SQUARE_OPENAPI_KEY=<apiKey> node scripts/save-key.mjs`; otherwise use it only for the current command environment.
- Tell the user they can create an API key at: https://www.binance.com/square/creator-center/home

Pass the key only via `BINANCE_SQUARE_OPENAPI_KEY` (env or saved file). Never write it into command arguments or print the full key — CLI args appear in `ps` output and shell history. When mentioning a key, show only the first 5 and last 4 characters, such as `abc12...xyz9`.

## Scripts

All commands should be run from this skill directory.

### Text Or Article Post

Use for text-only short posts or long articles without images.

```bash
node scripts/post-text.mjs --text "Hello #crypto $BTC"
```

Long article with title and no cover:

```bash
node scripts/post-text.mjs --text "Full article body..." --title "Market Report"
```

Flags:
- `--text` required, post text content
- `--title` optional, sets article-style content

### Image Post

Use for short image posts or long articles with a cover image.

```bash
node scripts/post-image.mjs --text "Chart analysis" --images "./chart1.png,./chart2.png"
```

Long article with title and cover:

```bash
node scripts/post-image.mjs --text "Full analysis..." --title "Market Report" --cover "./chart.png"
```

Flags:
- `--text` required, post or article content
- `--images` required for short image posts only. Use comma-separated image paths with max 4.
- `--title` optional, sets article-style content. When present, do not pass `--images`.
- `--cover` required when `--title` is present for an article with media. Article mode supports exactly one cover image.

The script uploads each image, waits for processing, and publishes with the processed image URL returned by the backend. If `--title` is provided, it publishes `contentType=2`, requires `--cover`, and sends that uploaded image URL as `cover` only. If no `--title` is provided, it publishes `contentType=1` and sends all `--images` as `imageList`.

### Video Post

Use for video posts.

```bash
node scripts/post-video.mjs --video "./video.mp4" --duration 7.5 --text "My analysis"
```

Flags:
- `--video` required, local video path
- `--duration` required, video duration in seconds
- `--text` optional, post text content

The script uploads the video, waits for processing, extracts the first frame with `ffmpeg`, uploads that frame as the cover image, and publishes with `cover` included in the request.

If the user does not provide a duration, use `ffprobe` to determine it before running the script.

## Agent Workflow

1. Resolve the API key (see Authentication). If unresolved, stop and ask the user before doing anything else.

2. Pick the script from user intent using the table below. Then validate against Constraints — if a constraint is violated, explain it and do not run.

   | User intent | Script | Required flags |
   |---|---|---|
   | Short text post | `post-text.mjs` | `--text` |
   | Long article, no media | `post-text.mjs` | `--text --title` |
   | Image short post (1–4 imgs, no title) | `post-image.mjs` | `--text --images "<p1,p2,...>"` |
   | Article with cover | `post-image.mjs` | `--text --title --cover` |
   | Video post | `post-video.mjs` | `--video --duration` (+ optional `--text`) |

3. Disambiguate edge cases before running:
   - Title + exactly one image → that image is the cover (`--cover`, not `--images`).
   - Title + multiple images → stop and ask which single image is the cover.
   - Video without duration → run `ffprobe` first to get it.

4. Preserve user content exactly. Do not rewrite, translate, add hashtags/cashtags, or change punctuation. `$coin` and `#topic` text passes through verbatim — the backend parses them.

5. Run the script with `BINANCE_SQUARE_OPENAPI_KEY` injected into the command environment for one-time use (never as a CLI arg).

6. Report the result:
   - On success, return the `ID` and `Link` printed by the script.
   - If the script prints `Success!` with `ID: unavailable` and `Link: unavailable`, treat it as successful — `/content/add` returned 504 after submission, so no post ID or link is available.
   - On failure, surface the script error and any API code/message.

## Constraints

- Images: max 4 per post; article cover is exactly 1 image.
- Video: max 1 per post.
- Images and video are mutually exclusive in a single post.
- Only attach media the user explicitly provided; do not auto-attach.
- Do not modify user-provided text. `#topic` and `$coin` are parsed server-side.
- Daily limits: 100 posts/day, 400 uploads/day.

## Common Errors

- `220003`: API key not found.
- `220004`: API key expired.
- `220009`: Daily post limit exceeded for OpenAPI.
- `220014`: Daily upload limit exceeded.
- `20002` or `20022`: Sensitive words detected.
- `20013`: Content length is limited.
- `20020` or `220011`: Content body must not be empty.
- `30008`, `2000001`, or `2000002`: Account or device posting restriction.

## Scope

This skill only supports publishing new posts. It does not support:
- Reading, listing, or searching existing posts
- Editing or deleting posts
- Commenting, liking, or other interactions
- User profile or account management
- Scheduling or drafts
