# Trade the World Cup Final with CCXT 🏆⚽

*A fun, hands-on tour of CCXT's prediction-market support — where the whole planet's opinion becomes a live order book, and one API trades every venue at once.*

---

The final is set. Ninety minutes (or, let's be honest, probably a hundred and twenty and then penalties) stand between two nations and the trophy. Half the planet has already picked a winner in a group chat. The other half is arguing about it.

Here's the thing the group chat can't do: **quote a price.**

A prediction market can. On Polymarket, Kalshi, Limitless and Myriad, "will Argentina win the World Cup?" isn't a hot take — it's a share that trades between **0.00 and 1.00 USDC** and pays out **exactly 1.00** if it comes true. The current price *is* the crowd's probability. A YES share at `0.63` means the market thinks that team wins ~63% of the time.

And as of the latest release, CCXT speaks all of them through the **same unified API** you already use for Binance and Kraken. Same `fetchTicker`, same `createOrder`, same `fetchPositions` — just addressed by an **outcome** instead of a symbol.

Let's make some (paper) money.

> **The one rule.** These are real markets with real money. Every snippet below caps risk, and the trading examples rest orders that *can't fill* so you can run them safely. Prediction markets have fees, slippage, and settlement risk — treat "make money" as "find an edge," not "print cash." Bet responsibly.

---

## 30-second primer: prices are probabilities

Forget candles and market cap for a second. In a prediction market:

| Concept | Crypto exchange | Prediction exchange |
|---|---|---|
| What you trade | a `symbol` (`BTC/USDT`) | an **`outcome`** (`ARGENTINA_WINS:YES`) |
| Price | dollars per coin | **probability, 0.00–1.00** per share |
| Payout | whatever you sell it for | **1.00 USDC** if the outcome happens, else **0** |
| "amount" | coins | **shares** |
| "cost" | quote spent | **collateral** spent |

Buy 10 YES shares of "France wins" at `0.28` → you spend `2.80` USDC. If France lifts the trophy, those 10 shares pay `10.00`. That's a 3.5× on a coin flip you thought was more like a coin flip. If they lose, they're worth zero. Simple, brutal, honest.

The data model has three layers:

```
event      "Who wins the 2026 World Cup?"     ← fetchEvents / fetchEvent
  └─ market   "Will Argentina win?"            ← a ccxt Market row (type: 'prediction')
       └─ outcome  YES / NO                     ← the tradeable unit, has an `outcome` handle
```

Every price and trade method takes that **outcome handle**. That's the whole trick.

---

## Part 1 — Read the odds in three lines

No keys, no wallet. Public order books are open to everyone.

```typescript
import ccxt from 'ccxt';

const poly = new ccxt.prediction.polymarket ();

// search the event, grab the first market's YES outcome, price it
const events  = await poly.fetchEvents ({ 'query': 'World Cup Winner', 'limit': 10 });
const outcome = events[0].markets[0].outcomes.find ((o) => o.label === 'Yes');
const ticker  = await poly.fetchTicker (outcome.outcome);

console.log (`market prices this at ~${(ticker.last * 100).toFixed (1)}%`);
```

That's it. `ticker.last` is a number between 0 and 1 — multiply by 100 and you've got the crowd's live probability. Want the depth? `fetchOrderBook(outcome.outcome)` gives you bids and asks in the exact same `[price, shares]` shape you already know.

You don't even have to call `fetchEvents` first if you know the handle — outcome-addressed methods auto-resolve and cache the outcome on first use, exactly like `loadMarkets()` + `market(symbol)` in regular CCXT.

---

## Part 2 — The superpower: one code path, every venue

Here's what no single prediction site can give you. The final is listed on **more than one** exchange. Polymarket, Kalshi, Limitless, Myriad — each has its own book, its own crowd, and therefore **its own price** for the exact same real-world event.

With CCXT, comparing them isn't four integrations. It's a loop.

```typescript
const VENUES = [ 'polymarket', 'kalshi', 'limitless', 'myriad' ];

async function bestYesAsk (venueId: string, query: string) {
    const ex = new ccxt.prediction[venueId] ();
    try {
        const events = await ex.fetchEvents ({ 'query': query, 'limit': 10, 'sort': 'volume' });
        const market = events[0]?.markets?.[0];
        const yes = market?.outcomes?.find ((o) => o.label?.toUpperCase () === 'YES');
        if (!yes) return undefined;
        const ob = await ex.fetchOrderBook (yes.outcome);
        return { venueId, ask: ob.asks[0]?.[0], bid: ob.bids[0]?.[0] };
    } finally {
        await ex.close ();
    }
}

const board = await Promise.all (VENUES.map ((v) => bestYesAsk (v, 'World Cup Winner')));
console.table (board.filter (Boolean));
```

```
┌─────────┬──────────────┬──────┬──────┐
│ (index) │   venueId    │ ask  │ bid  │
├─────────┼──────────────┼──────┼──────┤
│    0    │ 'polymarket' │ 0.30 │ 0.29 │
│    1    │   'kalshi'   │ 0.34 │ 0.32 │
│    2    │ 'limitless'  │ 0.31 │ 0.30 │
└─────────┴──────────────┴──────┴──────┘
```

The exact same eight lines, pointed at four different companies, in four different regulatory regimes, settling in different ways — and you get one clean table. **That** is the CCXT advantage. You write the strategy once; the library normalizes the venues.

---

## Part 3 — Actually making money: the free lunch

Look at that table again. Kalshi is paying more for YES than Polymarket is charging for it. When venues disagree, a door opens.

### The dutch book (a.k.a. the risk-free arb)

A binary market has two shares — YES and NO — and **exactly one of them pays 1.00 USDC** at settlement. So if you can buy *one of each* for a combined cost **under 1.00**, you've locked in a guaranteed profit no matter who wins the final.

A NO share is just `1 − (YES bid)`. So scan every venue pair:

```typescript
// buy YES on venue A, buy the NO leg on venue B
for (const a of board) {
    for (const b of board) {
        if (a.venueId === b.venueId) continue;
        const noAskB = 1 - b.bid;              // the NO leg on B
        const cost   = a.ask + noAskB;         // one YES + one NO
        const edge   = 1 - cost;               // guaranteed payout is 1.00
        if (edge > 0) {
            console.log (
                `ARB: YES @ ${a.ask} on ${a.venueId} + NO @ ${noAskB.toFixed (2)} on ${b.venueId} ` +
                `→ cost ${cost.toFixed (3)} → +${(edge * 100).toFixed (1)}% risk-free`
            );
        }
    }
}
```

If YES trades at `0.30` on Polymarket and the NO leg is `0.66` on Kalshi, you pay `0.96` for a bundle that pays `1.00` when the final whistle blows. That's **+4.2%**, and it doesn't care about the score. Every human watching the match is guessing; you're collecting the spread between two crowds who haven't noticed they disagree.

> The catch (there's always a catch): fees and slippage eat thin edges, the two legs must actually fill, and your capital is tied up until the market resolves. Real arbs are usually smaller and rarer than the toy numbers here — but a bot scanning all four venues in a `Promise.all` finds them faster than you can refresh a tab.

### The simpler play: just have an opinion

Think the underdog is mispriced? The market says 22%, you've watched every one of their matches and you'd say 35%? Buy YES. If you're right about the *probability* — not even the outcome, just the probability — you have positive expected value. Prediction markets are the only place your football knowledge has a literal price tag.

---

## Part 4 — Place the bet, then watch it settle

Trading needs credentials (a wallet + private key on the on-chain venues, API keys on Kalshi). Placing an order is one call — `amount` in shares, `price` as a probability:

```typescript
const poly = new ccxt.prediction.polymarket ({ privateKey, walletAddress });

// "I'll buy 10 shares of Argentina-wins, but only at 0.25 or better"
const order = await poly.createOrder (outcome, 'limit', 'buy', 10, 0.25);
console.log ('resting at', order.price, '— status', order.status);
```

After the match, `fetchPositions` tells you how it went — including the fields that only exist in a world where markets *resolve*:

```typescript
const positions = await poly.fetchPositions ([ outcome ]);
const p = positions[0];
console.log (p.resolved ? (p.won ? `WON — payout ${p.payout} USDC` : 'lost') : `open, PnL ${p.unrealizedPnl}`);
```

`resolved`, `won`, `payout` — a normal exchange has no concept of these, because a BTC position never "comes true." A prediction position does, and CCXT gives you a unified `PredictionPosition` and `fetchSettlements()` to close the loop and book the realized result.

---

## Part 5 — React to a goal before the crowd does

The moment the ball hits the net, every book on earth reprices in seconds. WebSocket (`ccxt.pro`) lets your code see it happening:

```typescript
while (true) {
    const t = await poly.watchTicker (outcome);   // pushes on every move
    console.log (new Date ().toISOString (), 'YES now', t.last);
    // ... a goal just swung the price? act on it before the manual traders finish celebrating
}
```

Same `watchTicker` you'd use to stream `BTC/USDT`. The edge in live sports betting is *latency* — and a program that's already subscribed reacts while everyone else is still finding the remote.

---

## It's not just TypeScript

The same unified surface transpiles to every CCXT language. Python, for the data scientists modeling xG:

```python
import ccxt.prediction   # async-only: ccxt.prediction.<id> IS the async class

async def main ():
    ex = ccxt.prediction.polymarket ()
    events = await ex.fetch_events ({ 'query': 'World Cup Winner' })
    outcome = events[0]['markets'][0]['outcomes'][0]['outcome']
    ticker = await ex.fetch_ticker (outcome)
    print (f"implied probability: {ticker['last'] * 100:.1f}%")
    await ex.close ()
```

…and PHP, C#, Go and Java all get the identical `fetchEvents → outcome → fetchTicker/createOrder` flow. Prototype your model in Python, ship the bot in Go, no API to relearn.

Prefer the terminal? Every CLI takes `-p` / `--prediction`:

```bash
npm run cli.ts -- -p polymarket fetchEvents '{"query":"world cup winner"}'
npm run cli.py -- --prediction kalshi fetchTicker <OUTCOME> --sandbox
```

---

## Run it yourself

The companion script — [`prediction-world-cup-final.ts`](./prediction-world-cup-final.ts) — does everything above in one file: it fans out across all four venues, prints the odds board, scans for a cross-venue dutch book, and (only with `--trade` + credentials) rests a tiny, non-filling test order under the 25 USD cap.

```bash
# read-only: odds board + arbitrage scan, no keys needed
npx tsx examples/ts/prediction/prediction-world-cup-final.ts "World Cup Winner"

# isolate one team
npx tsx examples/ts/prediction/prediction-world-cup-final.ts "World Cup Winner" "Argentina"
```

---

## The final whistle

Prediction markets turn "who do you think will win?" from a bar argument into a tradeable, priced, settleable position. CCXT turns *every* prediction market into one interface — so your strategy sees all of them at once, spots where they disagree, and acts in whatever language you already write.

The crowd has an opinion. Now you can quote it, compare it across four venues, and put a number on exactly how confident everyone really is.

Kick-off is soon. May your outcomes settle YES. ⚽

---

*Further reading: the [Prediction Markets guide](../../../wiki/Prediction-Markets.md) for the full unified API (`fetchEvents`, the events → markets → outcomes model, every structure), and the other runnable [`prediction-*-end-to-end.ts`](.) examples for per-venue auth and trading flows.*
