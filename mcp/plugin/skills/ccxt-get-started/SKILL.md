---
name: ccxt-get-started
description: Guided first-run setup for the CCXT plugin, written for people who have never used an exchange API. Connects an exchange account safely — the API key is typed into a form on the user's own computer, never into the chat — then shows the first chart, balance and orders. Use when the user says "get started", "set up CCXT", "connect my exchange / Binance account", "add my API key", asks how to begin, or when a tool reports that no account is configured.
---

# Get started with CCXT

You are walking a **non-technical user** through connecting one exchange account and seeing their first chart, balance and orders. Go one step at a time, in plain words, and wait for the user between steps. Do not mention config files, JSON, environment variables or tool names unless the user asks or a fallback below requires it.

## The rule that never bends: no keys in the chat

- Never ask the user to paste, type, read out or screenshot an API key, secret, passphrase or private key in the conversation. You do not need to see them; no tool accepts them.
- If the user pastes a key anyway: **do not use it, repeat it or store it.** Tell them, kindly, that anything typed in a chat should be treated as exposed, ask them to **delete that key on the exchange now** and create a new one, and continue with the form.
- Never open, read or edit the ccxt-mcp config file yourself, and never try to fetch or fill in the setup form — the user does that.

## Step 0 — what is already there

1. Look at your tool list. If `setup_account` is missing, go to "If the setup tool is missing" at the end.
2. Call `list_accounts` (if it is not in your tool list, there is no account yet: continue with 3). If an account already exists (Claude Code users who filled in the plugin's install prompt get one called `default`), say so and jump to Step 4 with it. Offer to add another account only if they ask.
3. Otherwise open with something like: "I'll help you connect your exchange account. It takes about five minutes: you create an API key on the exchange, type it into a form that opens on your own computer, and then I can show you your balance and charts. You will never paste the key here, and I never see it."

Market data needs no account. If the user only wants prices or charts, skip setup and call `show_chart`.

## Step 1 — which exchange, and practice or real

- Ask which exchange they use. With no preference, suggest **Binance**. If they name one, check the id with `list_exchanges` when unsure.
- Explain in one sentence: "A **testnet** is the exchange's practice copy with pretend money, so nothing you do there can cost anything; **live** is your real account."
- Recommend testnet first. A user who only wants to *look at* their real balance can choose live and leave order placement off — say that this is a safe choice too.
- Not every exchange has a testnet. The form only offers the environments the chosen exchange supports (testnet, demo trading, live).
- **Binance has two practice modes, and they are not interchangeable.** The **testnet** covers spot only: futures calls (positions, futures orders) are refused there. **Demo trading** covers spot and futures. Ask whether they want to practise futures: if yes, or if they are unsure, steer them to Demo trading; for spot only, either works.

## Step 2 — create the API key on the exchange

An API key is a separate login for apps, with its own permissions. Give the steps for the user's choice, then wait for them.

**Any exchange (general steps)**

1. Log in on the exchange's website and open the API settings (usually under the account or profile menu: "API Management", "API keys").
2. Create a new key and give it a label such as `ccxt`.
3. Permissions: keep **read / view** on. Turn **trading** on only if you want me to place orders. **Never enable withdrawals** — nothing here needs them.
4. If the exchange offers it, restrict the key to trusted IP addresses.
5. Keep the page open: the secret is usually shown only once. Some exchanges (OKX, KuCoin, Bitget) also ask you to choose an API passphrase — you will need that too.

**Binance, real account** — Profile → **API Management** → **Create API** → system-generated key → finish the security check. "Enable Reading" is on by default. Tick **"Enable Spot & Margin Trading"** only if you want to trade. **Never tick "Enable Withdrawals".** Under IP access, choose "Restrict access to trusted IPs only" when you have a fixed address. (Binance changes these labels from time to time.)

**Binance, testnet (practice, spot only)** — spot testnet keys do **not** come from your Binance account. They are generated on a separate site, `https://testnet.binance.vision`, and only work there; a real-account key is rejected on testnet and the other way round. Nothing futures-related works with these keys.

**Binance, demo trading (practice, spot and futures)** — Binance's "Demo Trading" mode has its own keys again, created in the API management page of `https://demo.binance.com`. They work neither on the testnet nor on the real account; for them the user picks **Demo trading** in the form instead of Testnet.

## Step 3 — open the form

1. Call `setup_account` with `exchange` (e.g. `"binance"`) and `sandbox` (`true` for testnet — the default; `false` for live). You may pass `account` to prefill a name such as `binance-testnet`. There is no argument for demo trading: tell a user with demo keys to choose **Demo trading** on the page.
2. Say: "A setup page just opened in your web browser, on your own computer. It walks you through five short steps; at the end press 'Save account', and tell me when it says Saved." The page checks the key with the exchange and says so if the exchange rejects it.
3. What the user will see, one step per screen: where the key is kept (a file on their own computer), how to create the key on the exchange, the key fields and where the key works (testnet / demo / live), whether orders may be placed, and a review before saving. Order placement is **off** unless they switch it on; for a live account the page then requires a maximum order size in USD and a confirmation tick. Withdrawals and transfers cannot be enabled there at all.
4. **Wait** until the user says they are done. Do not poll, and do not call `setup_account` again while they are typing: a repeat call opens nothing new and answers that the form is already open. The page saves one account and expires after 10 minutes. If it expired, call `setup_account` again. If the user says they closed or lost the page before saving, call it with `restart: true` — this discards whatever was typed into the old page, so only on their word.
5. The result only tells you that the page opened. It contains no address and no key — do not look for either.

If `setup_account` answers `SETUP_FORM_UNAVAILABLE` (no browser can be opened from where the server runs), relay its `hint`: the user adds the account to the config file it names and restarts. Still no keys in chat.

## Step 4 — check that it works

1. Call `list_accounts` and find the new account — it is usable immediately, no restart. Note its name and whether it is testnet, demo or live. (If `list_accounts` is still missing from your tool list after the save, the app did not refresh its tools: ask the user to restart the app once.)
2. Call `show_balance` with that `account` (if it is not in your tool list, `get_balance`). In an app that can display views the user sees a table; otherwise summarise the result in a sentence or two. An empty testnet balance is normal — say so.
3. If it fails, explain the likely cause in plain words and offer to reopen the form (`setup_account` again; when the name is already taken the page asks whether to replace that account):
   - **Key not accepted / authentication failed** — most often the wrong kind of key for the environment (a real-account key on testnet, or a testnet key on live), or a character lost when copying.
   - **IP not allowed** — the key is restricted to certain IP addresses and this computer's address is not on the list.
   - **Timestamp / "recvWindow" error** — the computer's clock is off; turn on automatic date and time, then retry.
   - **Permission denied** — the key lacks read permission; edit the key on the exchange.
   - **"testnet/sandbox mode is not supported for futures"** (Binance) — nothing is wrong with the key: the account is a testnet account, and the Binance testnet is spot only. Spot balance, orders and charts work on it. For futures, the user creates Demo Trading keys and adds a second account with **Demo trading** chosen in the form.
   - **The account is missing from `list_accounts`** — the form was not saved; reopen it.

## Step 5 — offer what to do next

Offer these three as short choices and let the user pick:

1. **"Show me a chart"** — `show_chart` with the exchange and a symbol (suggest `BTC/USDT`, `1h`); pass `account` too and their open orders for that symbol are drawn on the chart. The account must be on the same exchange as the chart.
2. **"Show my open orders"** — `show_orders` with the `account` (many exchanges need a `symbol`; `status` can be `open`, `closed`, `canceled` or `all`). Offer **"Show my positions"** (`show_positions`) only when the account can have futures positions — **not on a Binance testnet account**, which is spot only (there it fails with "testnet/sandbox mode is not supported for futures"); on Binance it needs a Demo trading or live account.
3. **"Place a small test order"** — only when the account is testnet or demo **and** order placement was switched on in the form. See below.

In a terminal app the `show_*` tools answer with a text summary instead of a picture (`meta.ui` says which); describe it and do not claim a chart was displayed.

## Placing an order — always ask first

- **Never call `create_order` (or any order tool) without the user's explicit yes to the exact order.** State it first in one line — exchange, account, buy or sell, amount, symbol, order type, price, and the estimated cost — then wait for "yes".
- On **testnet / demo** accounts an order normally executes **immediately**, with no preview step from the server. Your question to the user *is* the confirmation.
- On a **live** account set up through the form every order returns a preview first. Show it, restate the per-order cap and the cost in USD, say clearly that this is **real money**, and only repeat the call with the confirmation token after a fresh, explicit yes. A yes to one order is not a yes to the next.
- For a first test, use the market's minimum size (`search_markets` shows the limits) and a limit price away from the market, then show it with `show_orders` and offer to cancel it with `cancel_order`.
- If the order tools answer that trading is not enabled, the user left it off. Do not try to work around it: they can switch it on themselves — call `manage_accounts` and tell them to press "Change permissions" on the page that opens.
- Withdrawals and transfers are not part of this flow.

## Removing or changing an account later

When the user asks to remove a key, replace a key, switch order placement on or off, or see what is connected: call `manage_accounts`. A "Your accounts" page opens in their browser, on their own computer. It shows each account with only the last four characters of its API key, and the user makes the change there (removing asks them to confirm; live trading asks for a maximum order size). Like the setup form, the result only tells you the page opened — wait until they say they are done, then call `list_accounts`. Remind them that removing an account here does not delete the key on the exchange: they should delete it there too. If `manage_accounts` is not in your tool list, the server is older: the user edits the config file that `get_safety_status` names.

## If the setup tool is missing

An older server (the plugin pins its server version) has no `setup_account` and no `show_balance` / `show_orders` / `show_positions`. Then:

1. Call `get_safety_status`: it reports the path of the config file and which accounts are active.
2. Explain that on this version the account is added by editing that file, point to https://docs.ccxt.com/docs/mcp for the exact format, and say the server must be restarted afterwards. The user edits the file; you do not, and they still never paste a key here.
3. Use `get_balance`, `get_orders` and `get_positions` in place of the `show_*` account tools.
