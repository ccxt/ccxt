package io.github.ccxt;

// ----------------------------------------------------------------------------
// Exchange is the thin concrete tier over BaseExchange (which holds all shared
// infrastructure). Regular crypto exchanges extend Exchange; the prediction tier
// (PredictionExchange) extends BaseExchange as an independent sibling — so a
// prediction instance is NOT `instanceof Exchange`, while still reusing every base
// helper via BaseExchange. Mirrors ts/src/base/Exchange.ts
// (`class Exchange extends BaseExchange {}`).
//
// Java subclasses do not inherit constructors, so the public constructor
// signatures of BaseExchange are mirrored here as thin delegating constructors.
// ----------------------------------------------------------------------------

public class Exchange extends BaseExchange {

    public Exchange() {
        super();
    }

    public Exchange(Object userConfig) {
        super(userConfig);
    }
}
