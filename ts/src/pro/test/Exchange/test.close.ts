
import { Exchange } from '../../../../ccxt.js';

async function closeAfter (exchange: Exchange, ms: number) {
    await exchange.sleep (ms);
    await exchange.close ();
}

async function watchTickerLoop (exchange: Exchange, symbol: string) {
    // Bounded so the transpiled languages don't trip over `while(true)` with
    // unreachable post-loop code (Java's strict reachability check). 10s is
    // well past the 3s schedule for closeAfter, so close() interrupts first.
    const deadline = exchange.milliseconds () + 10000;
    while (exchange.milliseconds () < deadline) {
        await exchange.watchTicker (symbol);
    }
}

async function testClose (exchange: Exchange, skippedProperties: object, symbol: string) {
    const method = 'close';

    // -----------------------------------------------------------------
    // Scenario 1: close on an exchange with no active subscriptions —
    // must complete without error.
    // -----------------------------------------------------------------
    await exchange.close ();

    // The remaining scenarios drive a watchTicker stream; skip when the
    // exchange doesn't expose one (e.g. WS-only feeds for orderbook/trades).
    const supportsWatchTicker = (exchange.has['watchTicker'] === true);
    if (!supportsWatchTicker) {
        return true;
    }

    // -----------------------------------------------------------------
    // Scenario 2: open one watch, drain it, close — no error.
    // The point here is the close, not the watch — swallow any watch-side
    // failure (network drop, channel reset) so close() still gets exercised.
    // -----------------------------------------------------------------
    try {
        await exchange.watchTicker (symbol);
    } catch (e) {
        // intentional: see comment above. Self-assignment keeps the catch
        // block non-empty after Python transpile (empty `except:` is a
        // SyntaxError; TS lets us elide the body, Python doesn't).
        const ignored = e;
    }
    await exchange.close ();

    // -----------------------------------------------------------------
    // Scenario 3: close() while a watch is awaiting must terminate the
    // awaiter (no infinite hang, no uncaught crash). The exact rejection
    // type is locked down by the Java-side unit test ExchangeCloseTest;
    // here we just exercise the path end-to-end across every language.
    // -----------------------------------------------------------------
    try {
        exchange.spawn (closeAfter, exchange, 3000);
        await watchTickerLoop (exchange, symbol);
    } catch (e) {
        // Expected: any rejection terminates the loop. The point is that
        // close() doesn't deadlock; whether the rejection is
        // ExchangeClosedByUser or a network-layer exception depends on
        // which fires first under live conditions. Self-assignment keeps
        // the catch non-empty for Python.
        const ignored = e;
    }

    return true;
}

export default testClose;
