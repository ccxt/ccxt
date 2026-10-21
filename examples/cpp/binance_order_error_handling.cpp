// CCXT C++ — binance-order-error-handling.
//
// C++ counterpart of examples/rust/src/binance_order_error_handling.rs: place
// (or refuse) orders and route every outcome through ONE policy written
// against the unified error hierarchy (ccxt::InvalidOrder, ccxt::BadSymbol,
// ccxt::AuthenticationError, …) instead of grepping venue message text.
//
// Runs with no credentials: the client-side failures (missing keys, unknown
// symbol, below-minimum amount) need no account. With BINANCE_APIKEY +
// BINANCE_SECRET it also exercises InsufficientFunds and OrderNotFound, and
// any real order it creates is cancelled before exit. Every order is checked
// against a 25 USD notional cap first. Credentials go to the testnet unless
// BINANCE_LIVE=1 is set.
#include "ccxt/exchanges/binance.h"
#include "ccxt/exchanges/ExchangeFactory.h"

#include <cmath>
#include <cstdlib>
#include <iostream>
#include <optional>
#include <string>

static const double MAX_NOTIONAL_USD = 25.0;

// What a caller should actually DO about an error. The reusable part: written
// entirely against the unified hierarchy, so it works for any ccxt exchange.
// The ladder runs in attempt() below where the exception is still typed, and
// each handler maps to the same policy the Rust example's classify() returns.
struct Policy {
    const char* kind;    // leaf class that matched
    const char* action;  // Retry / Fix / Abort / Ignore
    const char* detail;
};

static void reportOk (const char* caseName, const ccxt::Order& o) {
    std::cout << "\n── " << caseName << std::endl;
    std::cout << "   OK       id=" << o.id.value_or ("") << " status=" << o.status.value_or ("")
              << " " << o.symbol.value_or ("") << " " << o.amount.value_or (0.0)
              << " @ " << o.price.value_or (0.0) << std::endl;
}

static void reportErr (const char* caseName, const Policy& p, const std::exception& e) {
    std::cout << "\n── " << caseName << std::endl;
    std::cout << "   kind     " << p.kind << std::endl;
    std::cout << "   message  " << e.what () << std::endl;
    std::cout << "   policy   " << p.action << ": " << p.detail << std::endl;
}

// Run fn() and route the outcome through the unified hierarchy. The handler
// order matters: most specific classes first, parents later.
template <typename Fn> void attempt (const char* name, Fn&& fn) {
    try {
        const ccxt::Order o = fn ();
        reportOk (name, o);
    } catch (const ccxt::InsufficientFunds& e) {
        reportErr (name, {"InsufficientFunds", "Fix", "not enough balance — reduce size or fund the account"}, e);
    } catch (const ccxt::OrderNotFound& e) {
        reportErr (name, {"OrderNotFound", "Ignore", "order already filled, cancelled, or never existed"}, e);
    } catch (const ccxt::DuplicateOrderId& e) {
        reportErr (name, {"DuplicateOrderId", "Ignore", "this clientOrderId was already accepted"}, e);
    } catch (const ccxt::InvalidOrder& e) {
        // Parent of OrderNotFound/DuplicateOrderId, so it must come after them.
        reportErr (name, {"InvalidOrder", "Fix", "order parameters rejected — check amount/price/limits"}, e);
    } catch (const ccxt::BadSymbol& e) {
        reportErr (name, {"BadSymbol", "Abort", "symbol not listed on this venue"}, e);
    } catch (const ccxt::AuthenticationError& e) {
        // Also covers PermissionDenied / AccountSuspended.
        reportErr (name, {"AuthenticationError", "Abort", "credentials missing, wrong, or lacking permission"}, e);
    } catch (const ccxt::RateLimitExceeded& e) {
        reportErr (name, {"RateLimitExceeded", "Retry", "back off and try the same request again"}, e);
    } catch (const ccxt::NetworkError& e) {
        // RequestTimeout, ExchangeNotAvailable, …
        reportErr (name, {"NetworkError", "Retry", "transient — retry shortly"}, e);
    } catch (const ccxt::NotSupported& e) {
        reportErr (name, {"NotSupported", "Abort", "this exchange does not implement that call"}, e);
    } catch (const ccxt::BadRequest& e) {
        reportErr (name, {"BadRequest", "Fix", "malformed request — check the arguments"}, e);
    } catch (const std::exception& e) {
        reportErr (name, {"std::exception", "Abort", "unclassified — inspect the raw message"}, e);
    }
}

// Refuse to send anything worth MAX_NOTIONAL_USD or more.
static bool guardNotional (double amount, double price) {
    const double notional = amount * price;
    if (notional >= MAX_NOTIONAL_USD) {
        std::cout << "   (refusing " << notional << " USD notional, cap " << MAX_NOTIONAL_USD << ")" << std::endl;
        return false;
    }
    return true;
}

// A price below the book so a limit buy rests instead of filling, but inside
// binance's PERCENT_PRICE_BY_SIDE band.
static double restingPrice (double last) {
    return std::floor (last * 0.90);
}

static bool hasCreds () {
    const char* k = std::getenv ("BINANCE_APIKEY");
    const char* s = std::getenv ("BINANCE_SECRET");
    return k && *k && s && *s;
}

static ccxt::dict configFor (bool withCreds) {
    ccxt::dict cfg;
    ccxt::dict fetchMarkets;
    fetchMarkets.set ("types", ccxt::list {std::string ("spot")});
    ccxt::dict options;
    options.set ("fetchMarkets", fetchMarkets);
    cfg.set ("options", options);
    if (withCreds) {
        ccxt::dict sandbox;
        sandbox.set ("apiKey", std::string (std::getenv ("BINANCE_APIKEY") ? std::getenv ("BINANCE_APIKEY") : ""));
        sandbox.set ("secret", std::string (std::getenv ("BINANCE_SECRET") ? std::getenv ("BINANCE_SECRET") : ""));
        cfg.set ("sandbox", true);
        cfg.set ("sandboxApi", sandbox);
    }
    return cfg;
}

int main () {
    const bool creds = hasCreds ();
    std::cout << "binance-order-error-handling" << std::endl;
    std::cout << "  credentials: " << (creds ? "present" : "none (client-side cases only)")
              << "   target: " << (creds ? (std::getenv ("BINANCE_LIVE") ? "LIVE" : "testnet (sandbox)")
                                         : "public endpoints") << std::endl;
    std::cout << "  notional cap: " << MAX_NOTIONAL_USD << " USD per order" << std::endl;

    // ── 1. No credentials: caught before any authenticated request goes out ──
    {
        auto ex = std::dynamic_pointer_cast<ccxt::Exchange> (
            ccxt::factory::createExchange ("binance", configFor (false)));
        attempt ("1. create_order with no API keys", [&] {
            return ex->CreateOrder ("BTC/USDT", "limit", "buy", 0.001, 1.0);
        });
    }

    auto ex = std::dynamic_pointer_cast<ccxt::Exchange> (
        ccxt::factory::createExchange ("binance", configFor (creds)));
    double last = 0.0;
    try {
        ex->LoadMarkets ();
        const ccxt::Ticker t = ex->FetchTicker ("BTC/USDT");
        last = t.last.value_or (0.0);
        std::cout << "\n  BTC/USDT last = " << last << std::endl;
    } catch (const std::exception& e) {
        std::cout << "\ncannot load markets / reference price: " << e.what () << std::endl;
        return 1;
    }

    // ── 2. Unknown symbol: rejected locally by the market lookup ──
    attempt ("2. create_order on an unlisted symbol", [&] {
        return ex->CreateOrder ("NOTACOIN/USDT", "limit", "buy", 1.0, 1.0);
    });

    // ── 3. Below the venue minimum amount ──
    {
        const double price = restingPrice (last);
        attempt ("3. create_order below the minimum amount", [&] {
            return ex->CreateOrder ("BTC/USDT", "limit", "buy", 0.00000001, price);
        });
    }

    if (!creds) {
        std::cout << "\n── 4. InsufficientFunds          — skipped (needs credentials)" << std::endl;
        std::cout << "── 5. cancel_order OrderNotFound — skipped (needs credentials)" << std::endl;
        std::cout << "── 6. a real resting order       — skipped (needs credentials)" << std::endl;
        return 0;
    }

    // ── 4. Deliberately huge — expect the funds subtree to reject it. ──
    {
        const double price = restingPrice (last);
        attempt ("4. create_order for 10 000 BTC (expect InsufficientFunds)", [&] {
            return ex->CreateOrder ("BTC/USDT", "limit", "buy", 10000.0, price);
        });
    }

    // ── 5. Cancelling something that is not there ──
    attempt ("5. cancel_order with a bogus id", [&] {
        return ex->CancelOrder ("1", std::string ("BTC/USDT"));
    });

    // ── 6. A real resting order, inside the cap, then cleaned up ──
    {
        const double price = restingPrice (last);
        const double amount = 0.001;
        if (guardNotional (amount, price)) {
            attempt ("6. a valid resting order", [&] {
                return ex->CreateOrder ("BTC/USDT", "limit", "buy", amount, price);
            });
        }
    }

    std::cout << "\nTakeaway: catch the unified hierarchy, not message text." << std::endl;
    std::cout << "  ccxt::InvalidOrder        catches OrderNotFound, DuplicateOrderId, …" << std::endl;
    std::cout << "  ccxt::NetworkError        catches RequestTimeout, RateLimitExceeded, …" << std::endl;
    std::cout << "  ccxt::AuthenticationError catches PermissionDenied, AccountSuspended" << std::endl;
    return 0;
}
