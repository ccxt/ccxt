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

namespace ccxt {

class Exchange : public ExchangeBase {
public:
    Exchange () { this->initialiseDefaults (std::any {}); }

    explicit Exchange (std::any config) { this->initialiseDefaults (config); }

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

    // GENERATED — do not edit; regenerate with `npm run transpileCpp -- --baseClass`.
    #include "Exchange.BaseMethods.inc"
    #include "Exchange.TradingMethods.inc"
};

} // namespace ccxt
