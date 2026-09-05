#pragma once

// The concrete base Exchange, assembled from two halves.
//
// C# writes this as `partial class BaseExchange` split across hand-written files and a
// generated one. C++ has no partial classes, so the generated halves are emitted
// WITHOUT their `class ... { };` wrapper (see transpileBaseMethods in
// build/cppTranspiler.ts) and included directly into this class body. Including a
// fragment inside a class is the closest C++ equivalent, and it keeps every method in
// one class — which matters, because the hand-written half calls into the generated
// half and vice versa. An inheritance chain would need a hand-maintained list of
// virtual stubs to make those base-to-derived calls dispatch.

#include "ExchangeBase.h"

#include <memory>

namespace ccxt {

class Exchange : public ExchangeBase {
public:
    Exchange () = default;

    // The config is remembered, NOT applied here. describe() is virtual and every
    // exchange overrides it, but a virtual call made during base-class construction
    // dispatches to the base override -- binance's describe() does not exist yet at
    // this point, so initialising from the constructor silently produced the *base*
    // descriptor for every derived exchange (no id, no api block, no exceptions).
    // Construction is therefore two-phase; use ccxt::newExchange<T>() rather than
    // calling this and forgetting init().
    explicit Exchange (std::any config) : pendingConfig (config) {
        // Applied here so a plain `ccxt::Exchange(config)` -- which the base tests
        // construct directly, and where Exchange IS the most-derived type -- is usable
        // straight away. For a DERIVED exchange this only ever runs the base
        // describe(), which is why init() exists and newExchange() calls it.
        this->initialiseDefaults (config);
    }

    std::any pendingConfig;

    // Re-applies describe() now that the object is fully constructed, so the virtual
    // call reaches the most-derived override. Idempotent: an exchange's describe()
    // deep-extends its parent's, so re-running it can only refine what the constructor
    // already put in place.
    void init () { this->initialiseDefaults (this->pendingConfig); }

    // Applies describe() and then the caller's overrides, mirroring what the TS
    // constructor does above the transpile delimiter.
    void initialiseDefaults (const std::any& config) {
        const std::any described = this->describe ();
        if (isDict (described)) {
            for (const auto& kv : std::any_cast<dict> (described).entries ()) {
                this->assign (kv.first, kv.second);
            }
        }
        if (isDict (config)) {
            for (const auto& kv : std::any_cast<dict> (config).entries ()) {
                this->assign (kv.first, kv.second);
            }
        }
    }

    // describe() returns a flat map of settings; route the ones that are real members
    // to their fields and keep the rest reachable through options.
    void assign (const std::string& key, const std::any& value) {
        if (key == "id")                 { this->id = value; return; }
        if (key == "name")               { this->name = value; return; }
        if (key == "alias")              { this->alias = value; return; }
        if (key == "countries")          { this->countries = value; return; }
        if (key == "version")            { this->version = value; return; }
        if (key == "hostname")           { this->hostname = value; return; }
        if (key == "certified")          { this->certified = value; return; }
        if (key == "pro")                { this->pro = value; return; }
        if (key == "has")                { this->has = value; return; }
        if (key == "features")           { this->features = value; return; }
        if (key == "urls")               { this->urls = value; return; }
        if (key == "api")                { this->api = value; return; }
        if (key == "options")            { this->options = value; return; }
        if (key == "timeframes")         { this->timeframes = value; return; }
        if (key == "fees")               { this->fees = value; return; }
        if (key == "limits")             { this->limits = value; return; }
        if (key == "precision")          { this->precision = value; return; }
        if (key == "precisionMode")      { this->precisionMode = value; return; }
        if (key == "paddingMode")        { this->paddingMode = value; return; }
        if (key == "requiredCredentials"){ this->requiredCredentials = value; return; }
        if (key == "commonCurrencies")   { this->commonCurrencies = value; return; }
        if (key == "exceptions")         { this->exceptions = value; return; }
        if (key == "twofa")              { this->twofa = value; return; }
        // credentials: checkRequiredCredentials() reads these fields directly, so they
        // must land on the members rather than falling through into options
        if (key == "apiKey")             { this->apiKey = value; return; }
        if (key == "secret")             { this->secret = value; return; }
        if (key == "password")           { this->password = value; return; }
        if (key == "uid")                { this->uid = value; return; }
        if (key == "login")              { this->login = value; return; }
        if (key == "walletAddress")      { this->walletAddress = value; return; }
        if (key == "privateKey")         { this->privateKey = value; return; }
        if (key == "token")              { this->token = value; return; }
        if (key == "verbose")            { this->verbose = value; return; }
        if (key == "enableRateLimit")    { this->enableRateLimit = value; return; }
        if (key == "rateLimit")          { this->rateLimit = value; return; }
        if (key == "timeout")            { this->timeout = value; return; }
        if (key == "markets")            { this->markets = value; return; }
        if (key == "currencies")         { this->currencies = value; return; }
        if (!isDict (this->options)) {
            this->options = std::any (dict {});
        }
        std::any_cast<dict> (this->options).set (key, value);
    }

    // Every endpoint in the `api` block becomes an implicit method on the generated
    // <id>Api class (build/generateImplicitAPI.ts --cpp), and they all funnel here.
    // It lives on Exchange rather than ExchangeBase because it calls sign(), which is
    // generated into the fragment below and overridden per exchange -- ExchangeBase
    // cannot see it. Offline this iteration: fetch() throws NotSupported, and the
    // static request tests read what sign() built out of last_request_url /
    // last_request_body instead of sending anything.
    virtual std::shared_future<std::any> callEndpoint (std::any name, std::any params = std::any {}) {
        return std::async (std::launch::deferred, [this, name, params] () -> std::any {
            if (!isDict (this->endpointRegistry)) {
                this->defineRestApi ();
            }
            const std::any endpoint = ::getValue (this->endpointRegistry, name);
            if (!endpoint.has_value ()) {
                throw NotSupported (str (this->id) + " has no endpoint " + str (name));
            }
            return awaitValue (this->request (::getValue (endpoint, std::string ("path")),
                                              ::getValue (endpoint, std::string ("api")),
                                              ::getValue (endpoint, std::string ("method")),
                                              params, std::any {}, std::any {},
                                              ::getValue (endpoint, std::string ("config"))));
        }).share ();
    }

    // camelCase endpoint name -> { path, api, method, config }, built once from the
    // describe().api tree. TS attaches a closure per endpoint in defineRestApi(); C++
    // cannot add members at runtime, so the same walk fills a lookup table that
    // callEndpoint() reads instead.
    std::any endpointRegistry;

    void defineRestApi () {
        this->endpointRegistry = std::any (dict {});
        this->defineRestApiTree (this->api, list {});
    }

    void defineRestApiTree (const std::any& node, const list& paths) {
        if (!isDict (node)) {
            return;
        }
        const dict branch = std::any_cast<dict> (node);
        for (const auto& kv : branch.entries ()) {
            const std::string key = kv.first;
            const std::string lower = str (toLowerCase (std::any (key)));
            const bool isHttpVerb = (lower == "get") || (lower == "post") || (lower == "put")
                || (lower == "delete") || (lower == "head") || (lower == "patch");
            if (isList (kv.second)) {
                // the array form lists bare paths under an http verb
                for (const auto& item : std::any_cast<list> (kv.second).items ()) {
                    this->defineRestApiEndpoint (paths, lower, str (trim (item)), std::any (dict {}));
                }
            } else if (isHttpVerb && isDict (kv.second)) {
                for (const auto& endpoint : std::any_cast<dict> (kv.second).entries ()) {
                    // the leaf is either a cost number or a per-endpoint config object
                    const std::any config = isDict (endpoint.second)
                        ? endpoint.second
                        : std::any (dict { { std::string ("cost"), endpoint.second } });
                    this->defineRestApiEndpoint (paths, lower, endpoint.first, config);
                }
            } else {
                list deeper (paths.items ());
                deeper.push (std::any (key));
                this->defineRestApiTree (kv.second, deeper);
            }
        }
    }

    void defineRestApiEndpoint (const list& paths, const std::string& httpMethod,
                                const std::string& path, const std::any& config) {
        // suffix: the path split on every non-alphanumeric run, each part capitalised
        std::string suffix;
        std::string part;
        for (char c : path) {
            const bool alnum = (c >= '0' && c <= '9') || (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
            if (alnum) {
                part += c;
            } else {
                suffix += str (this->capitalize (std::any (part)));
                part.clear ();
            }
        }
        suffix += str (this->capitalize (std::any (part)));
        // prefix: the api tier(s) this endpoint sits under, first one lower-cased
        std::string prefix;
        const std::vector<std::any>& tiers = paths.items ();
        for (std::size_t i = 0; i < tiers.size (); i++) {
            prefix += (i == 0) ? str (tiers[i]) : str (this->capitalize (tiers[i]));
        }
        const std::string name = prefix + str (this->capitalize (std::any (httpMethod)))
            + str (this->capitalize (std::any (suffix)));
        // TS passes the whole tier list when nested, otherwise the single tier name
        const std::any apiArgument = (tiers.size () > 1)
            ? std::any (paths)
            : (tiers.empty () ? std::any (std::string ("public")) : tiers[0]);
        std::any_cast<dict> (this->endpointRegistry).set (name, std::any (dict {
            { std::string ("path"),   std::any (path) },
            { std::string ("api"),    apiArgument },
            { std::string ("method"), toUpperCase (std::any (httpMethod)) },
            { std::string ("config"), config },
        }));
    }

    // GENERATED — do not edit; regenerate with `npm run transpileCpp -- --baseClass`.
    #include "Exchange.BaseMethods.inc"
    #include "Exchange.TradingMethods.inc"
};

// The supported way to build an exchange. It completes construction first, so the
// describe() that runs is the most-derived one, then applies it.
//
//     auto exchange = ccxt::newExchange<ccxt::binance> ();
//
template <class T>
std::shared_ptr<T> newExchange (std::any config = std::any {}) {
    auto exchange = std::make_shared<T> (config);
    exchange->init ();
    return exchange;
}

} // namespace ccxt
