package io.github.ccxt.types;

import java.util.Map;

// Native dedicated prediction-market type. Mirrors the `PredictionFees`
// interface in ts/src/base/types.ts and the Go/C# structs.
public final class PredictionFees {
    public Double trading;    // per-trade taker/maker rate (fraction, e.g. 0.02 = 2%)
    public Double resolution; // fee taken from winnings at settlement (fraction)

    public PredictionFees(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.trading = TypeHelper.safeFloat(data, "trading");
        this.resolution = TypeHelper.safeFloat(data, "resolution");
    }
}
