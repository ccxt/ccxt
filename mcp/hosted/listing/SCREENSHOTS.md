# Screenshots and demo video

What to capture for the two directories once `https://mcp.ccxt.com/mcp` is deployed. Nothing here can be captured before then: use the deployed server, not a local run, so the hosts load the views exactly as users will see them.

## Before capturing

- Use a clean account with no other connectors or plugins enabled, so no other tool appears in the shot.
- Add the server as a custom connector (Claude) and as a custom MCP server plugin (ChatGPT), as described in `wiki/MCP.md`.
- Use the light theme for the main set. Optionally make a dark set to check the views.
- Use only exchanges and markets from [REVIEW-CASES.md](REVIEW-CASES.md). They were checked live, and they avoid Binance and Bybit, which may leave the production allowlist.
- Hide personal details (account name, avatar, other conversations) in every frame.
- Record the date, the server build (`SERVER_BUILD` / `/readyz`) and the prompt for each capture next to the file.

## Claude: MCP Apps carousel

Specification ([submission](https://claude.com/docs/connectors/building/submission), "Carousel screenshots for MCP Apps"):

- **Format:** PNG.
- **Width:** at least 1000 px.
- **Count:** 3–5 images.
- **Crop:** to the app response only, without the prompt in the image.
- **Aspect ratio:** any.
- **Paired prompts:** provide the prompt text separately for each screenshot.
- **Mobile:** "no separate mobile assets are required, and one batch covers all surfaces".
- **Video or GIF:** not accepted.
- A template is in the [Anthropic MCP Apps Figma community file](https://www.figma.com/community/file/1597641111449594397/mcp-apps-for-claude).

Capture in claude.ai on the web, in a browser window wide enough that the view itself is at least 1000 px wide.

| # | File | Prompt (supplied separately) | Capture |
|---|---|---|---|
| 1 | `claude-1-chart.png` | Show the BTC/USDT 4h chart on Kraken. | The `show_chart` view: candlesticks, volume and the header with range and change. Hover over one candle so the crosshair and its price label show. |
| 2 | `claude-2-orderbook.png` | Show the order book for SOL/USDT on OKX. | The `show_orderbook` view: depth chart and ladder, with best bid, best ask and spread visible. |
| 3 | `claude-3-tickers.png` | Show a price board for BTC/USD, ETH/USD and SOL/USD on Kraken. | The `show_tickers` board, sorted by 24h change. |
| 4 (optional) | `claude-4-chart-timeframe.png` | Show the ETH/USDT 1d chart on OKX. | The chart after switching timeframe inside the view, to show the view is interactive. |

Check each image before uploading: PNG, width ≥ 1000 px (`file claude-*.png`), no prompt text inside the crop, and no other connector's UI.

## Claude: listing icon

`mcp/hosted/plugin/assets/logo.png` (1024 × 1024 PNG). The Claude Code validator notes that the portal takes the plugin icon "only once: the first time the plugin is saved or submitted in the developer portal", so check it before the first save.

## OpenAI: demo video

Requirement ([submission](https://developers.openai.com/plugins/deploy/submission)): "A video walkthrough. Demonstrate the test cases and plugin functionality, and provide an accessible recording URL." It goes in `review.demo_recording_url` in `plugin.json`, or in the dashboard. It is left out of `plugin.json` until the video exists.

Record in ChatGPT with the plugin installed:

1. **Setup (10–20 s):** the plugin's details page, showing it is installed and that it uses no authentication.
2. **The five positive cases from REVIEW-CASES.md, in order,** each from a fresh prompt, typed in full on screen:
   - `show_chart` on Kraken: wait for the view to render and interact with it once;
   - `get_tickers` across Coinbase, OKX and Kraken: expand one tool call to show its JSON input and output;
   - `show_orderbook` on OKX;
   - `search_markets` on OKX;
   - `show_tickers` on Kraken.
3. **The three negative cases:** the order request, the withdrawal and the balance request, showing the assistant declining and pointing to the local server.
4. **Mobile (§1.2.c, "must function reliably in ChatGPT on both desktop and mobile, including any UI components"):** repeat case 1 and case 3 in the ChatGPT mobile app, as a short second clip or in the same video.

Format notes:

- Keep it under about five minutes, with no music and no edits that hide latency. A reviewer should see real response times.
- Host it at a URL a reviewer can open without signing in (for example an unlisted video). Do not use a link that expires.

## OpenAI: listing images

The OpenAI submission reads `logo` (`./assets/logo.png`) and `composerIcon` (`./assets/icon.svg`, with `icon-dark.svg` for dark mode) from `plugin.json`. The submission docs read on 2026-11-25 asked for no separate listing screenshots, only the demo video. Check the dashboard when submitting, in case that has changed.
