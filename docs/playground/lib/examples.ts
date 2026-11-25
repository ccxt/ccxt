// Starter snippets shown in the playground, one per (example, language).
// These are full, runnable programs against PUBLIC exchange endpoints.

import { getLanguage, type RunnableLanguageId } from "./languages";

export type Example = {
  id: string;
  label: string;
  description: string;
  // Rich snippets exist for the interpreted trio (TypeScript, Python, PHP) plus
  // Java and Rust; Go/C# fall back to their language defaultCode.
  code: Partial<Record<RunnableLanguageId, string>>;
};

export const examples: Example[] = [
  {
    id: "fetchTicker",
    label: "Fetch ticker",
    description: "Latest price snapshot for one symbol on one exchange.",
    code: {
      ts: `import ccxt from 'ccxt';

const exchange = new ccxt.binance ();
const ticker = await exchange.fetchTicker ('BTC/USDT');
console.log (\`\${ticker.symbol}  last=\${ticker.last}  bid=\${ticker.bid}  ask=\${ticker.ask}\`);
`,
      python: `import ccxt

exchange = ccxt.binance()
ticker = exchange.fetch_ticker('BTC/USDT')
print(ticker['symbol'], 'last=', ticker['last'], 'bid=', ticker['bid'], 'ask=', ticker['ask'])
`,
      php: `<?php
$exchange = new \\ccxt\\binance();
$ticker = $exchange->fetch_ticker('BTC/USDT');
echo $ticker['symbol'] . '  last=' . $ticker['last'] . '  bid=' . $ticker['bid'] . '  ask=' . $ticker['ask'] . "\\n";
`,
      java: `import io.github.ccxt.exchanges.Binance;
import io.github.ccxt.types.Ticker;

public class Main {
    public static void main(String[] args) throws Exception {
        Binance exchange = new Binance();
        Ticker ticker = exchange.fetchTicker("BTC/USDT");
        System.out.println(ticker.symbol + "  last=" + ticker.last + "  bid=" + ticker.bid + "  ask=" + ticker.ask);
    }
}
`,
      rust: `use ccxt::{Binance, Params};

#[tokio::main]
async fn main() -> Result<(), ccxt::ExchangeError> {
    let mut exchange = Binance::new(None);
    let ticker = exchange.fetch_ticker("BTC/USDT", Params::none()).await?;
    println!("{}  last={:?}  bid={:?}  ask={:?}", ticker.symbol, ticker.last, ticker.bid, ticker.ask);
    Ok(())
}
`,
    },
  },
  {
    id: "fetchOrderBook",
    label: "Fetch order book",
    description: "Top bids and asks for a symbol.",
    code: {
      ts: `import ccxt from 'ccxt';

const exchange = new ccxt.kraken ();
const ob = await exchange.fetchOrderBook ('BTC/USD', 5);
console.log ('bids', ob.bids);
console.log ('asks', ob.asks);
`,
      python: `import ccxt

exchange = ccxt.kraken()
ob = exchange.fetch_order_book('BTC/USD', 5)
print('bids', ob['bids'])
print('asks', ob['asks'])
`,
      php: `<?php
$exchange = new \\ccxt\\kraken();
$ob = $exchange->fetch_order_book('BTC/USD', 5);
echo "bids:\\n";
foreach ($ob['bids'] as $bid) { echo '  ' . $bid[0] . ' x ' . $bid[1] . "\\n"; }
echo "asks:\\n";
foreach ($ob['asks'] as $ask) { echo '  ' . $ask[0] . ' x ' . $ask[1] . "\\n"; }
`,
      rust: `use ccxt::{Kraken, Params};

#[tokio::main]
async fn main() -> Result<(), ccxt::ExchangeError> {
    let mut exchange = Kraken::new(None);
    let ob = exchange.fetch_order_book("BTC/USD", Some(5), Params::none()).await?;
    println!("bids:");
    for [price, amount] in &ob.bids {
        println!("  {price} x {amount}");
    }
    println!("asks:");
    for [price, amount] in &ob.asks {
        println!("  {price} x {amount}");
    }
    Ok(())
}
`,
    },
  },
  {
    id: "fetchOHLCV",
    label: "Fetch OHLCV candles",
    description: "Recent hourly candlesticks for charting / analysis.",
    code: {
      ts: `import ccxt from 'ccxt';

const exchange = new ccxt.binance ();
const candles = await exchange.fetchOHLCV ('ETH/USDT', '1h', undefined, 5);
for (const [ts, o, h, l, c, v] of candles) {
    console.log (new Date (ts).toISOString (), 'O', o, 'H', h, 'L', l, 'C', c);
}
`,
      python: `import ccxt
from datetime import datetime, timezone

exchange = ccxt.binance()
candles = exchange.fetch_ohlcv('ETH/USDT', '1h', limit=5)
for ts, o, h, l, c, v in candles:
    print(datetime.fromtimestamp(ts / 1000, tz=timezone.utc).isoformat(), 'O', o, 'H', h, 'L', l, 'C', c)
`,
      php: `<?php
$exchange = new \\ccxt\\binance();
$candles = $exchange->fetch_ohlcv('ETH/USDT', '1h', null, 5);
foreach ($candles as $c) {
    echo gmdate('c', intval($c[0] / 1000)) . '  O ' . $c[1] . '  H ' . $c[2] . '  L ' . $c[3] . '  C ' . $c[4] . "\\n";
}
`,
      rust: `use ccxt::{Binance, Params};

#[tokio::main]
async fn main() -> Result<(), ccxt::ExchangeError> {
    let mut exchange = Binance::new(None);
    // timeframe, since and limit are positional Options: None means "unset".
    let candles = exchange.fetch_ohlcv("ETH/USDT", Some("1h"), None, Some(5), Params::none()).await?;
    for [ts, o, h, l, c, _v] in candles {
        let datetime = exchange.iso8601(ccxt::Value::Int(ts as i64));
        println!("{datetime}  O {o}  H {h}  L {l}  C {c}");
    }
    Ok(())
}
`,
    },
  },
  {
    id: "fetchMarkets",
    label: "List markets",
    description: "Load every market an exchange offers.",
    code: {
      ts: `import ccxt from 'ccxt';

const exchange = new ccxt.coinbase ();
const markets = await exchange.loadMarkets ();
const symbols = Object.keys (markets);
console.log (\`\${exchange.id} lists \${symbols.length} markets\`);
console.log (symbols.slice (0, 20).join (', '));
`,
      python: `import ccxt

exchange = ccxt.coinbase()
markets = exchange.load_markets()
symbols = list(markets.keys())
print(f'{exchange.id} lists {len(symbols)} markets')
print(', '.join(symbols[:20]))
`,
      php: `<?php
$exchange = new \\ccxt\\coinbase();
$markets = $exchange->load_markets();
$symbols = array_keys($markets);
echo $exchange->id . ' lists ' . count($symbols) . " markets\\n";
echo implode(', ', array_slice($symbols, 0, 20)) . "\\n";
`,
      rust: `use ccxt::Coinbase;

#[tokio::main]
async fn main() -> Result<(), ccxt::ExchangeError> {
    let mut exchange = Coinbase::new(None);
    let markets = exchange.try_load_markets(false).await?;
    let symbols: Vec<&str> = markets.iter().map(|m| m.symbol.as_str()).collect();
    println!("{} lists {} markets", exchange.id(), symbols.len());
    println!("{}", symbols[..symbols.len().min(20)].join(", "));
    Ok(())
}
`,
    },
  },
  {
    id: "compareExchanges",
    label: "Compare prices across exchanges",
    description: "Fan out the same query across several exchanges at once.",
    code: {
      ts: `import ccxt from 'ccxt';

const ids = ['binance', 'kraken', 'coinbase', 'bitfinex', 'okx'];
const rows = await Promise.all (ids.map (async (id) => {
    const exchange = new ccxt[id] ();
    try {
        const ticker = await exchange.fetchTicker ('BTC/USDT');
        return id.padEnd (10) + ' ' + ticker.last;
    } catch (e) {
        return id.padEnd (10) + ' (no BTC/USDT: ' + e.constructor.name + ')';
    }
}));
console.log (rows.join ('\\n'));
`,
      python: `import ccxt

for id in ['binance', 'kraken', 'coinbase', 'bitfinex', 'okx']:
    exchange = getattr(ccxt, id)()
    try:
        ticker = exchange.fetch_ticker('BTC/USDT')
        print(f'{id:<10} {ticker["last"]}')
    except Exception as e:
        print(f'{id:<10} (no BTC/USDT: {type(e).__name__})')
`,
      php: `<?php
$ids = ['binance', 'kraken', 'coinbase', 'bitfinex', 'okx'];
foreach ($ids as $id) {
    $class = '\\\\ccxt\\\\' . $id;
    $exchange = new $class();
    try {
        $ticker = $exchange->fetch_ticker('BTC/USDT');
        echo str_pad($id, 10) . ' ' . $ticker['last'] . "\\n";
    } catch (\\Exception $e) {
        echo str_pad($id, 10) . ' (no BTC/USDT: ' . get_class($e) . ")\\n";
    }
}
`,
      rust: `use ccxt::{ExchangeVisitor, Params, TypedExchange};

// with_exchange builds the exchange named by an id and hands the concrete type here.
struct Last(&'static str);

impl ExchangeVisitor for Last {
    type Output = String;
    async fn visit<E: TypedExchange + 'static>(self, mut exchange: E) -> String {
        let id = self.0;
        match exchange.fetch_ticker("BTC/USDT", Params::none()).await {
            Ok(ticker) => format!("{id:<10} {:?}", ticker.last),
            Err(e) => format!("{id:<10} (no BTC/USDT: {})", e.kind),
        }
    }
}

#[tokio::main]
async fn main() {
    let ids = ["binance", "kraken", "coinbase", "bitfinex", "okx"];
    // Fan out all five requests concurrently, like Promise.all.
    let rows = futures::future::join_all(ids.iter().map(|&id| async move {
        ccxt::exchanges::with_exchange(id, None, Last(id)).await.expect("unknown exchange id")
    }))
    .await;
    println!("{}", rows.join("\\n"));
}
`,
    },
  },
  {
    id: "predictionTicker",
    label: "Prediction market (Polymarket)",
    description: "Search Polymarket events by keyword, then fetch an outcome's ticker.",
    code: {
      ts: `import ccxt from 'ccxt';

// Prediction markets live under the ccxt.prediction namespace (Polymarket,
// Kalshi, Limitless, Myriad, Hyperliquid). Requires ccxt >= 4.5.66.
const exchange = new ccxt.prediction.polymarket ();

// 1) search events by keyword (fetchEvents must be scoped — by query, queries, tags, eventId or slug)
const events = await exchange.fetchEvents ({ query: 'Bitcoin', limit: 5 });
console.log (\`found \${events.length} events for "Bitcoin"\`);

// 2) collect the outcome tokens of still-open markets (resolved ones have no book)
const outcomes = [];
for (const event of events) {
    for (const market of (event.markets || [])) {
        if (market.resolved) continue;
        for (const outcome of (market.outcomes || [])) {
            outcomes.push ({ event: event.title, market: market.market, outcome });
        }
    }
}

// 3) fetch the ticker of the first outcome that has a live order book —
//    its price is the market-implied probability of that outcome.
for (const candidate of outcomes) {
    try {
        const ticker = await exchange.fetchTicker (candidate.outcome.outcome);
        console.log ('event:  ', candidate.event);
        console.log ('market: ', candidate.market);
        console.log ('outcome:', candidate.outcome.label, '->', candidate.outcome.outcome);
        console.log (\`bid=\${ticker.bid}  ask=\${ticker.ask}  last=\${ticker.last}\`);
        const prob = (ticker.last !== undefined) ? ticker.last : ticker.bid;
        if (prob !== undefined) {
            console.log (\`implied probability: \${(prob * 100).toFixed (1)}%\`);
        }
        break;
    } catch (e) {
        continue; // no order book for this outcome — try the next one
    }
}
`,
      python: `import asyncio
import ccxt.prediction  # prediction markets are async-only in Python (ccxt >= 4.5.66)

async def main():
    exchange = ccxt.prediction.polymarket()
    # 1) search events by keyword (fetch_events must be scoped — by query, queries, tags, eventId or slug)
    events = await exchange.fetch_events({'query': 'Bitcoin', 'limit': 5})
    print(f'found {len(events)} events for "Bitcoin"')
    # 2) collect the outcome tokens of still-open markets (resolved ones have no book)
    outcomes = []
    for event in events:
        for market in (event['markets'] or []):
            if market.get('resolved'):
                continue
            for outcome in (market['outcomes'] or []):
                outcomes.append({'event': event['title'], 'market': market['market'], 'outcome': outcome})
    # 3) fetch the ticker of the first outcome that has a live order book —
    #    its price is the market-implied probability of that outcome.
    for candidate in outcomes:
        try:
            ticker = await exchange.fetch_ticker(candidate['outcome']['outcome'])
            print('event:  ', candidate['event'])
            print('market: ', candidate['market'])
            print('outcome:', candidate['outcome']['label'], '->', candidate['outcome']['outcome'])
            print('bid=', ticker['bid'], 'ask=', ticker['ask'], 'last=', ticker['last'])
            prob = ticker['last'] if ticker['last'] is not None else ticker['bid']
            if prob is not None:
                print(f'implied probability: {prob * 100:.1f}%')
            break
        except Exception:
            continue  # no order book for this outcome — try the next one
    await exchange.close(True)

asyncio.run(main())
`,
      php: `<?php
use React\\Async;

// Prediction markets live under the ccxt\\prediction namespace (Polymarket,
// Kalshi, Limitless, Myriad, Hyperliquid). They are async-only in PHP
// (ReactPHP), so every call is wrapped in Async\\await. Requires ccxt >= 4.5.66.
$exchange = new \\ccxt\\prediction\\polymarket();

// 1) search events by keyword (fetch_events must be scoped — by query, queries, tags, eventId or slug)
$events = Async\\await($exchange->fetch_events(array('query' => 'Bitcoin', 'limit' => 5)));
echo 'found ' . count($events) . " events for \\"Bitcoin\\"\\n";

// 2) collect the outcome tokens of still-open markets (resolved ones have no book)
$outcomes = array();
foreach ($events as $event) {
    foreach (($event['markets'] ?? array()) as $market) {
        if ($market['resolved'] ?? false) {
            continue;
        }
        foreach (($market['outcomes'] ?? array()) as $outcome) {
            $outcomes[] = array('event' => $event['title'], 'market' => $market['market'], 'outcome' => $outcome);
        }
    }
}

// 3) fetch the ticker of the first outcome that has a live order book —
//    its price is the market-implied probability of that outcome.
foreach ($outcomes as $candidate) {
    try {
        $ticker = Async\\await($exchange->fetch_ticker($candidate['outcome']['outcome']));
        echo 'event:   ' . $candidate['event'] . "\\n";
        echo 'market:  ' . $candidate['market'] . "\\n";
        echo 'outcome: ' . $candidate['outcome']['label'] . ' -> ' . $candidate['outcome']['outcome'] . "\\n";
        echo 'bid=' . $ticker['bid'] . '  ask=' . $ticker['ask'] . '  last=' . $ticker['last'] . "\\n";
        $prob = $ticker['last'] ?? $ticker['bid'];
        if ($prob !== null) {
            echo 'implied probability: ' . number_format($prob * 100, 1) . "%\\n";
        }
        break;
    } catch (\\Exception $e) {
        continue; // no order book for this outcome — try the next one
    }
}
$exchange->close(true);
`,
      go: `package main

import (
	"fmt"

	ccxt "github.com/ccxt/ccxt/go/v4"
	ccxtprediction "github.com/ccxt/ccxt/go/v4/prediction"
)

func main() {
	// Prediction markets live in the go/v4/prediction package (Polymarket,
	// Kalshi, Limitless, Myriad, Hyperliquid). Requires ccxt >= 4.5.66.
	exchange := ccxtprediction.NewPolymarket(nil)

	// 1) search events by keyword (FetchEvents must be scoped — by query, queries, tags, eventId or slug)
	events, err := exchange.FetchEvents(map[string]interface{}{"query": "Bitcoin", "limit": 5})
	if err != nil {
		fmt.Println("error:", err)
		return
	}
	fmt.Printf("found %d events for \\"Bitcoin\\"\\n", len(events))

	// 2) collect the outcome tokens of still-open markets (resolved ones have no book)
	type candidate struct {
		event   *string
		market  *string
		outcome ccxt.PredictionOutcome
	}
	candidates := []candidate{}
	for _, event := range events {
		for _, market := range event.Markets {
			if market.Resolved != nil && *market.Resolved {
				continue
			}
			for _, outcome := range market.Outcomes {
				if outcome.Outcome == nil {
					continue
				}
				candidates = append(candidates, candidate{event.Title, market.Market, outcome})
			}
		}
	}

	// 3) fetch the ticker of the first outcome that has a live order book —
	//    its price is the market-implied probability of that outcome.
	for _, c := range candidates {
		ticker, err := exchange.FetchTicker(*c.outcome.Outcome)
		if err != nil {
			continue // no order book for this outcome — try the next one
		}
		fmt.Println("event:  ", show(c.event))
		fmt.Println("market: ", show(c.market))
		fmt.Println("outcome:", show(c.outcome.Label), "->", *c.outcome.Outcome)
		fmt.Printf("bid=%v  ask=%v  last=%v\\n", show(ticker.Bid), show(ticker.Ask), show(ticker.Last))
		prob := ticker.Last
		if prob == nil {
			prob = ticker.Bid
		}
		if prob != nil {
			fmt.Printf("implied probability: %.1f%%\\n", *prob*100)
		}
		break
	}
}

// Prediction structs use pointer fields, so an absent value is nil (not 0 / "").
func show[T any](p *T) any {
	if p == nil {
		return "n/a"
	}
	return *p
}
`,
      csharp: `using ccxt;
using ccxt.prediction;

// Prediction markets live under the ccxt.prediction namespace (Polymarket,
// Kalshi, Limitless, Myriad, Hyperliquid). Requires ccxt >= 4.5.66.
var exchange = new Polymarket();

// 1) search events by keyword (FetchEvents must be scoped — by query, queries, tags, eventId or slug)
List<PredictionEvent> events = await exchange.FetchEvents(new Dictionary<string, object>() {
    { "query", "Bitcoin" },
    { "limit", 5 },
});
Console.WriteLine($"found {events.Count} events for \\"Bitcoin\\"");

// 2) collect the outcome tokens of still-open markets (resolved ones have no book)
var candidates = new List<(string? ev, string? mkt, string? label, string handle)>();
foreach (PredictionEvent ev in events) {
    foreach (PredictionMarket market in ev.markets ?? new List<PredictionMarket>()) {
        if (market.resolved == true) continue;
        foreach (PredictionOutcome outcome in market.outcomes ?? new List<PredictionOutcome>()) {
            if (outcome.outcome == null) continue;
            candidates.Add((ev.title, market.market, outcome.label, outcome.outcome));
        }
    }
}

// 3) fetch the ticker of the first outcome that has a live order book —
//    its price is the market-implied probability of that outcome.
foreach (var candidate in candidates) {
    try {
        PredictionTicker ticker = await exchange.FetchTicker(candidate.handle);
        Console.WriteLine("event:   " + candidate.ev);
        Console.WriteLine("market:  " + candidate.mkt);
        Console.WriteLine("outcome: " + candidate.label + " -> " + candidate.handle);
        Console.WriteLine($"bid={ticker.bid}  ask={ticker.ask}  last={ticker.last}");
        double? prob = ticker.last ?? ticker.bid;
        if (prob != null) {
            Console.WriteLine($"implied probability: {(prob * 100):F1}%");
        }
        break;
    } catch (Exception) {
        continue; // no order book for this outcome — try the next one
    }
}
`,
      java: `import io.github.ccxt.exchanges.prediction.Polymarket;
import io.github.ccxt.types.PredictionEvent;
import io.github.ccxt.types.PredictionMarket;
import io.github.ccxt.types.PredictionOutcome;
import io.github.ccxt.types.PredictionTicker;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Main {
    public static void main(String[] args) throws Exception {
        // Prediction markets live under io.github.ccxt.exchanges.prediction
        // (Polymarket, Kalshi, Limitless, Myriad, Hyperliquid). Requires ccxt >= 4.5.66.
        Polymarket exchange = new Polymarket();

        // 1) search events by keyword (fetchEvents must be scoped — by query, queries, tags, eventId or slug)
        Map<String, Object> params = new HashMap<>();
        params.put("query", "Bitcoin");
        params.put("limit", 5);
        List<PredictionEvent> events = exchange.fetchEvents(params);
        System.out.println("found " + events.size() + " events for \\"Bitcoin\\"");

        // 2) collect the outcome tokens of still-open markets (resolved ones have no book)
        List<Object[]> candidates = new ArrayList<>();
        for (PredictionEvent event : events) {
            if (event.markets == null) continue;
            for (PredictionMarket market : event.markets) {
                if (Boolean.TRUE.equals(market.resolved) || market.outcomes == null) continue;
                for (PredictionOutcome outcome : market.outcomes) {
                    candidates.add(new Object[] { event.title, market.market, outcome });
                }
            }
        }

        // 3) fetch the ticker of the first outcome that has a live order book —
        //    its price is the market-implied probability of that outcome.
        for (Object[] candidate : candidates) {
            PredictionOutcome outcome = (PredictionOutcome) candidate[2];
            try {
                PredictionTicker ticker = exchange.fetchTicker(outcome.outcome);
                System.out.println("event:   " + candidate[0]);
                System.out.println("market:  " + candidate[1]);
                System.out.println("outcome: " + outcome.label + " -> " + outcome.outcome);
                System.out.println("bid=" + ticker.bid + "  ask=" + ticker.ask + "  last=" + ticker.last);
                Double prob = (ticker.last != null) ? ticker.last : ticker.bid;
                if (prob != null) {
                    System.out.printf("implied probability: %.1f%%%n", prob * 100);
                }
                break;
            } catch (Exception e) {
                continue; // no order book for this outcome — try the next one
            }
        }
    }
}
`,
      rust: `use ccxt::{safe_bool, safe_string, Params, Value};
use ccxt_prediction::{Polymarket, TypedExchange};

// Prediction markets live in the ccxt-prediction crate (Polymarket, Kalshi,
// Limitless, Myriad, Hyperliquid, ...).
#[tokio::main]
async fn main() -> Result<(), ccxt::ExchangeError> {
    let mut exchange = Polymarket::new(None);

    // 1) search events by keyword (fetch_events must be scoped — by query, queries, tags, eventId or slug).
    //    It has no typed wrapper yet, so call it through call_raw and walk the returned Value.
    let query = Params::new().with_str("query", "Bitcoin").with_int("limit", 5);
    let events = exchange.call_raw("fetch_events", vec![query.into_value()]).await?;
    let events = events.as_array().cloned().unwrap_or_default();
    println!("found {} events for \\"Bitcoin\\"", events.len());

    // 2) collect the outcome tokens of still-open markets (resolved ones have no book)
    let list = |v: &Value, key: &str| ccxt::value::get_value_k(v, key).as_array().cloned().unwrap_or_default();
    let mut candidates = Vec::new();
    for event in &events {
        for market in list(event, "markets") {
            if safe_bool(&market, "resolved", None) == Some(true) {
                continue;
            }
            for outcome in list(&market, "outcomes") {
                if let Some(handle) = safe_string(&outcome, "outcome", None) {
                    candidates.push((
                        safe_string(event, "title", None),
                        safe_string(&market, "market", None),
                        safe_string(&outcome, "label", None),
                        handle,
                    ));
                }
            }
        }
    }

    // 3) fetch the ticker of the first outcome that has a live order book —
    //    its price is the market-implied probability of that outcome.
    for (event, market, label, handle) in candidates {
        let Ok(ticker) = exchange.fetch_ticker(&handle, Params::none()).await else {
            continue; // no order book for this outcome — try the next one
        };
        println!("event:   {}", event.unwrap_or_default());
        println!("market:  {}", market.unwrap_or_default());
        println!("outcome: {} -> {}", label.unwrap_or_default(), handle);
        println!("bid={:?}  ask={:?}  last={:?}", ticker.bid, ticker.ask, ticker.last);
        if let Some(prob) = ticker.last.or(ticker.bid) {
            println!("implied probability: {:.1}%", prob * 100.0);
        }
        break;
    }
    Ok(())
}
`,
    },
  },
  {
    id: "watchTicker",
    label: "Watch ticker (WebSocket)",
    description: "Stream live ticker updates with CCXT Pro (ccxt.pro / watch*).",
    code: {
      ts: `import ccxt from 'ccxt';

// ccxt.pro = WebSockets. Use the .pro namespace for watch* methods.
const exchange = new ccxt.pro.binance ();
// Stream a few live updates, then close the socket so the run finishes.
for (let i = 0; i < 5; i++) {
    const ticker = await exchange.watchTicker ('BTC/USDT');
    console.log (ticker['datetime'], ticker['symbol'], 'last=' + ticker['last']);
}
await exchange.close ();
`,
      python: `import asyncio
import ccxt.pro as ccxtpro  # ccxt.pro = WebSockets (async)

async def main():
    exchange = ccxtpro.binance()
    # Stream a few live updates, then close the socket so the run finishes.
    for _ in range(5):
        ticker = await exchange.watch_ticker('BTC/USDT')
        print(ticker['datetime'], ticker['symbol'], 'last=', ticker['last'])
    await exchange.close()

asyncio.run(main())
`,
      java: `import io.github.ccxt.exchanges.pro.Binance;
import io.github.ccxt.types.Ticker;

public class Main {
    public static void main(String[] args) throws Exception {
        // ccxt.pro = WebSockets. Netty ignores the JVM proxy flags, so wrap the
        // exchange with Playground.proxy to tunnel watch* through the sandbox's
        // egress proxy (a no-op outside the playground).
        Binance exchange = Playground.proxy(new Binance());
        // Stream a few live updates, then close the socket so the run finishes.
        for (int i = 0; i < 5; i++) {
            Ticker ticker = exchange.watchTicker("BTC/USDT");
            System.out.println(ticker.datetime + "  " + ticker.symbol + "  last=" + ticker.last);
        }
        exchange.close();
    }
}
`,
      rust: `use ccxt::Params;
use ccxt_pro::Binance; // ccxt-pro = WebSockets (watch_* methods)

#[tokio::main]
async fn main() -> Result<(), ccxt::ExchangeError> {
    let mut exchange = Binance::new(None);
    // ccxt-rust dials WebSockets directly, ignoring proxy env vars, so tunnel
    // watch_* through the sandbox's egress proxy (empty = no proxy elsewhere).
    exchange.set_ws_proxy(&std::env::var("HTTPS_PROXY").unwrap_or_default());
    // Stream a few live updates, then return so the run finishes.
    for _ in 0..5 {
        let ticker = exchange.watch_ticker("BTC/USDT", Params::none()).await?;
        println!("{}  {}  last={:?}", ticker.datetime.unwrap_or_default(), ticker.symbol, ticker.last);
    }
    Ok(())
}
`,
    },
  },
];

export const defaultExample = examples[0];

// Resolve the snippet to show for an example in a given language:
// explicit snippet → the language's defaultCode.
export function codeFor(example: Example, lang: RunnableLanguageId): string {
  const explicit = example.code[lang];
  if (explicit !== undefined) return explicit;
  return getLanguage(lang)?.defaultCode ?? "";
}
