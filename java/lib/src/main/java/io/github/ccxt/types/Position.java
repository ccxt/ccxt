package io.github.ccxt.types;

import java.util.Map;

public final class Position {
    public String symbol;
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
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public Position(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.symbol = TypeHelper.safeString(data, "symbol");
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
        this.info = TypeHelper.getInfo(data);
    }
}
