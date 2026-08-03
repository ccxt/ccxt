package io.github.ccxt.types;

public final class OHLCV {
    public Long timestamp;
    public Double open;
    public Double high;
    public Double low;
    public Double close;
    public Double volume;

    public OHLCV(Object raw) {
        this.timestamp = TypeHelper.safeIntegerAt(raw, 0);
        this.open = TypeHelper.safeFloatAt(raw, 1);
        this.high = TypeHelper.safeFloatAt(raw, 2);
        this.low = TypeHelper.safeFloatAt(raw, 3);
        this.close = TypeHelper.safeFloatAt(raw, 4);
        this.volume = TypeHelper.safeFloatAt(raw, 5);
    }
}
