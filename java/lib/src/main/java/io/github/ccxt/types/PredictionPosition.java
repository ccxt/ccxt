package io.github.ccxt.types;

import java.util.Map;

// Native dedicated prediction-market type. Standalone typed mirror (does NOT extend Position); holds its own copy of the base
// fields (flat typed access) and adds the prediction identity
// and settlement fields. Mirrors the standalone `PredictionPosition`
// interface in ts/src/base/types.ts.
public final class PredictionPosition {
    public String id;
    public Long timestamp;
    public String datetime;
    public Double contracts;
    public Double contractSize;
    public String side;
    public Double notional;
    public Double leverage;
    public Double unrealizedPnl;
    public Double realizedPnl;
    public Double collateral;
    public Double entryPrice;
    public Double markPrice;
    public Double liquidationPrice;
    public String marginMode;
    public Boolean hedged;
    public Double maintenanceMargin;
    public Double maintenanceMarginPercentage;
    public Double initialMargin;
    public Double initialMarginPercentage;
    public Double marginRatio;
    public Long lastUpdateTimestamp;
    public Double lastPrice;
    public Double stopLossPrice;
    public Double takeProfitPrice;
    public Double percentage;
    // prediction-specific
    public String outcome;
    public String outcomeId;
    public String label;
    public String market;
    public String eventId;
    public String oppositeOutcome;
    public Boolean resolved;
    public Boolean won;
    public Double settleFraction;
    public Double payout;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public PredictionPosition(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.id = TypeHelper.safeString(data, "id");
        this.timestamp = TypeHelper.safeInteger(data, "timestamp");
        this.datetime = TypeHelper.safeString(data, "datetime");
        this.contracts = TypeHelper.safeFloat(data, "contracts");
        this.contractSize = TypeHelper.safeFloat(data, "contractSize");
        this.side = TypeHelper.safeString(data, "side");
        this.notional = TypeHelper.safeFloat(data, "notional");
        this.leverage = TypeHelper.safeFloat(data, "leverage");
        this.unrealizedPnl = TypeHelper.safeFloat(data, "unrealizedPnl");
        this.realizedPnl = TypeHelper.safeFloat(data, "realizedPnl");
        this.collateral = TypeHelper.safeFloat(data, "collateral");
        this.entryPrice = TypeHelper.safeFloat(data, "entryPrice");
        this.markPrice = TypeHelper.safeFloat(data, "markPrice");
        this.liquidationPrice = TypeHelper.safeFloat(data, "liquidationPrice");
        this.marginMode = TypeHelper.safeString(data, "marginMode");
        this.hedged = TypeHelper.safeBool(data, "hedged");
        this.maintenanceMargin = TypeHelper.safeFloat(data, "maintenanceMargin");
        this.maintenanceMarginPercentage = TypeHelper.safeFloat(data, "maintenanceMarginPercentage");
        this.initialMargin = TypeHelper.safeFloat(data, "initialMargin");
        this.initialMarginPercentage = TypeHelper.safeFloat(data, "initialMarginPercentage");
        this.marginRatio = TypeHelper.safeFloat(data, "marginRatio");
        this.lastUpdateTimestamp = TypeHelper.safeInteger(data, "lastUpdateTimestamp");
        this.lastPrice = TypeHelper.safeFloat(data, "lastPrice");
        this.stopLossPrice = TypeHelper.safeFloat(data, "stopLossPrice");
        this.takeProfitPrice = TypeHelper.safeFloat(data, "takeProfitPrice");
        this.percentage = TypeHelper.safeFloat(data, "percentage");
        this.outcome = TypeHelper.safeString(data, "outcome");
        this.outcomeId = TypeHelper.safeString(data, "outcomeId");
        this.label = TypeHelper.safeString(data, "label");
        this.market = TypeHelper.safeString(data, "market");
        this.eventId = TypeHelper.safeString(data, "event");
        this.oppositeOutcome = TypeHelper.safeString(data, "oppositeOutcome");
        this.resolved = TypeHelper.safeBool(data, "resolved");
        this.won = TypeHelper.safeBool(data, "won");
        this.settleFraction = TypeHelper.safeFloat(data, "settleFraction");
        this.payout = TypeHelper.safeFloat(data, "payout");
        this.info = TypeHelper.getInfo(data);
    }
}
