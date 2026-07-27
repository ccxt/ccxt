package io.github.ccxt.types;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

// Native dedicated prediction-market type. Hierarchy: Event -> Market -> Outcome.
// Mirrors the `PredictionMarket` interface in ts/src/base/types.ts and the Go/C# structs.
public final class PredictionMarket {
    public String id;              // raw exchange market id
    public String market;          // unified handle "TRUMP_WIN_2024"
    public String eventId;
    public String marketType;      // 'binary' | 'categorical' | 'scalar'
    public String executionModel;  // 'clob' | 'amm' | 'parimutuel'
    public String title;
    public String description;
    public List<PredictionOutcome> outcomes; // 1..N (categorical can be > 2)
    public String underlying;      // scalar only
    public Double floorStrike;     // scalar only
    public Double capStrike;       // scalar only
    public String strikeType;      // scalar only
    public String collateral;      // quote currency symbol (USDC / USD1 / USD / ...)
    public Boolean active;
    public Boolean closed;
    public Boolean resolved;
    public String resolvedOutcome; // winning outcome handle
    public Double settlementValue; // scalar: the realized number
    public Long created;
    public String createdDatetime;
    public Long end;
    public String endDatetime;
    public Double volume;
    public Double liquidity;
    public Double openInterest;
    public Double tickSize;
    public Limits limits;
    public PredictionFees fees;
    public String resolutionSource;
    public String image;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public PredictionMarket(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.id = TypeHelper.safeString(data, "id");
        this.market = TypeHelper.safeString(data, "market");
        this.eventId = TypeHelper.safeString(data, "event");
        this.marketType = TypeHelper.safeString(data, "marketType");
        this.executionModel = TypeHelper.safeString(data, "executionModel");
        this.title = TypeHelper.safeString(data, "title");
        this.description = TypeHelper.safeString(data, "description");
        Object outcomesRaw = TypeHelper.safeValue(data, "outcomes");
        if (outcomesRaw instanceof List<?> outcomesList) {
            this.outcomes = ((List<Object>) outcomesList).stream().map(PredictionOutcome::new).collect(Collectors.toList());
        }
        this.underlying = TypeHelper.safeString(data, "underlying");
        this.floorStrike = TypeHelper.safeFloat(data, "floorStrike");
        this.capStrike = TypeHelper.safeFloat(data, "capStrike");
        this.strikeType = TypeHelper.safeString(data, "strikeType");
        this.collateral = TypeHelper.safeString(data, "collateral");
        this.active = TypeHelper.safeBool(data, "active");
        this.closed = TypeHelper.safeBool(data, "closed");
        this.resolved = TypeHelper.safeBool(data, "resolved");
        this.resolvedOutcome = TypeHelper.safeString(data, "resolvedOutcome");
        this.settlementValue = TypeHelper.safeFloat(data, "settlementValue");
        this.created = TypeHelper.safeInteger(data, "created");
        this.createdDatetime = TypeHelper.safeString(data, "createdDatetime");
        this.end = TypeHelper.safeInteger(data, "end");
        this.endDatetime = TypeHelper.safeString(data, "endDatetime");
        this.volume = TypeHelper.safeFloat(data, "volume");
        this.liquidity = TypeHelper.safeFloat(data, "liquidity");
        this.openInterest = TypeHelper.safeFloat(data, "openInterest");
        this.tickSize = TypeHelper.safeFloat(data, "tickSize");
        Object limitsRaw = TypeHelper.safeValue(data, "limits");
        this.limits = limitsRaw != null ? new Limits(limitsRaw) : null;
        Object feesRaw = TypeHelper.safeValue(data, "fees");
        this.fees = feesRaw != null ? new PredictionFees(feesRaw) : null;
        this.resolutionSource = TypeHelper.safeString(data, "resolutionSource");
        this.image = TypeHelper.safeString(data, "image");
        this.info = TypeHelper.getInfo(data);
    }
}
