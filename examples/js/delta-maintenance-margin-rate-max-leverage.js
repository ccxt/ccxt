const ccxt = require('../../ccxt');

console.log ('CCXT Version:', ccxt.version);

function getMaxLeverage (market, positionSize, price) {
    /**
     * Equation taken from https://www.delta.exchange/contracts/
     * @param market: CCXT market
     * @param positionSize: The value of the position in quote currency
     * @param price: The latest market price
     * @return: The maximum leverage available for the market for the given position size
     */
    const info = market['info'];
    const maxLeverageNotional = Number (info['max_leverage_notional']);
    const initialMarginScalingFactor = Number (info['initial_margin_scaling_factor']);
    let initialMargin = Number (info['initial_margin']);
    const positionSizeLimit = Number (info['position_size_limit']);

    if (positionSize <= maxLeverageNotional) {
        const initialMarginRatio = initialMargin / 100;
        return 1 / initialMarginRatio;
    } else if (positionSize <= (positionSizeLimit * market['contractSize'] * price)) {
        initialMargin = initialMargin + (initialMarginScalingFactor * (positionSize - maxLeverageNotional));
        const initialMarginRatio = initialMargin / 100;
        return 1 / initialMarginRatio;
    } else {
        throw new Error ('positionSize is too high for ' + market['symbol']);
    }
}

function getMaintenanceMarginRate (market, positionSize, price) {
    /**
     * Equation taken from https://www.delta.exchange/contracts/
     * @param market: CCXT market
     * @param positionSize: The value of the position in quote currency
     * @param price: The latest market price
     * @return: The maintenance margin rate as a percentage for the market with the given position size
     */
    const info = market['info'];
    const maxLeverageNotional = Number (info['max_leverage_notional']);
    const maintenanceMarginScalingFactor = Number (info['maintenance_margin_scaling_factor']);
    const maintenanceMargin = Number (info['maintenance_margin']);
    const positionSizeLimit = Number (info['position_size_limit']);

    if (positionSize <= maxLeverageNotional) {
        return maintenanceMargin;
    } else if (positionSize <= (positionSizeLimit * market['contractSize'] * price)) {
        return maintenanceMargin + (maintenanceMarginScalingFactor * (positionSize - maxLeverageNotional));
    } else {
        throw new Error ('positionSize is too high for ' + market['symbol']);
    }
}

async function main () {

    const exchange = new ccxt.delta();
    await exchange.loadMarkets ();
    
    const symbol = 'ADA/USDT:USDT';
    const market = exchange.market (symbol);
    const ticker = exchange.fetchTicker (symbol);

    // Gets the maximum leverage and maintenance margin rate for a position worth 100,000 USDT on the ADA/USDT:USDT market
    const maxLeverage = getMaxLeverage(market, 100000, ticker['close']);
    const maintenanceMarginRate = getMaintenanceMarginRate(market, 100000, ticker['close']);
    console.log(maxLeverage, maintenanceMarginRate);
}

main ()
