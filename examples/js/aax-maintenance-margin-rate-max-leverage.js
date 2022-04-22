const ccxt = require('../../ccxt');

console.log ('CCXT Version:', ccxt.version);

function getMaxLeverage (market, leverage, positionSize, orderType, entryPrice = undefined, bid = undefined, ask = undefined) {
    /**
     * @description Equation taken from https://support.aax.com/en/articles/5295653-what-is-margin
     * @param {dict} market CCXT market
     * @param {float} leverage
     * @param {float} positionSize The number of contracts
     * @param {str} orderType 'limit' or 'market'
     * @param {float|undefined} entryPrice The average entry price for the position, required when orderType === 'limit', default is undefined
     * @param {float|undefined} bid The highest buying price on the order book, required when orderType === 'market', default is undefined
     * @param {float|undefined} ask The lowest selling price on the order book, required when orderType === 'market', default is undefined
     * @returns The maximum leverage available for the market for the given position size
     */
    const isLimit = orderType === 'limit';
    if (isLimit && entryPrice === undefined) { // limit order
        throw new Error ('getMaxLeverage argument entryPrice required when orderType === limit');
    } else if (!isLimit && (bid === undefined || ask === undefined)) { // market order
        throw new Error ('getMaxLeverage arguments bid and ask required when orderType === market');
    }
    const info = market['info'];
    const multiplier = Number (info['multiplier']);
    let price = isLimit ? entryPrice : ((bid + ask) / 2);
    price = market['inverse'] ? price : (price * multiplier);
    return positionSize / price / leverage;
}

function getMaintenanceMarginRate (market, leverage, positionSize, entryPrice, takerOrMaker = 'taker') {
    /**
     * @description Equation taken from https://support.aax.com/en/articles/5295653-what-is-margin
     * @param {dict} market CCXT market
     * @param {float} leverage
     * @param {float} positionSize The number of contracts
     * @param {float} entryPrice The average entry price for the position
     * @param {str} takerOrMaker Not required market is inverse, default 'taker'
     * @returns The maintenanceMargin rate as a percentage for the market with the given position size
     */
    const info = market['info'];
    const multiplier = Number (info['multiplier']);
    
    if (market['inverse']) {
        return positionSize / entryPrice / leverage;
    } else {
        const price = (entryPrice * multiplier);
        const positionValue = price * positionSize;
        const commissionFees = positionValue * market[takerOrMaker];
        return (positionSize / price / leverage) + commissionFees;
    }
}

function getMarginWhenAdjustingLeverage (market, leverage, positionSize, entryPrice, takerOrMaker, unrealizedPnl) {
    /**
     * @description Equation taken from https://support.aax.com/en/articles/5295653-what-is-margin
     * @param {dict} market CCXT market
     * @param {float} leverage
     * @param {float} positionSize The number of contracts
     * @param {float} entryPrice The average entry price for the position
     * @param {str} takerOrMaker default 'taker'
     * @param {float} unrealizedPnl Unrealized profit/loss for the position
     * @returns The maintenanceMargin rate as a percentage for the market with the given position size
     */

     const info = market['info'];
     const multiplier = Number (info['multiplier']);
     const price = market['inverse'] ? entryPrice : (entryPrice * multiplier);
     const positionValue = price * positionSize;
     const commissionFees = positionValue * market[takerOrMaker];
 
     if (market['inverse']) {
        return (positionValue * ((1 / leverage) + commissionFees)) - Math.min (0, unrealizedPnl);
    } else {
        return (positionValue * ((1 / leverage) + commissionFees)) - Math.min (0, unrealizedPnl);
    }
}

async function main () {

    const exchange = new ccxt.aax ();
    await exchange.loadMarkets ();
    
    const leverage = 10;
    const positionSize = 10;
    const bid = 1.0000;
    const ask = 1.0001;
    const unrealizedPnl = 0.1;
    
    // Linear markets
    let symbol = 'ADA/USDT:USDT';
    let market = exchange.market (symbol);

    let maxLeverage = getMaxLeverage (market, leverage, positionSize, 'limit', bid); // Max leverage for linear limit position, entryPrice=bid
    let maintenanceMarginRate = getMaintenanceMarginRate (market, leverage, positionSize, bid, 'maker'); // Maintenance margin rate for linear maker position, entryPrice=bid
    let marginWhenAdjustingLeverage = getMarginWhenAdjustingLeverage (market, leverage, positionSize, bid, 'maker', unrealizedPnl); // Margin when adjusting leverage for linear maker position, entryPrice=bid
    console.log (maxLeverage, maintenanceMarginRate, marginWhenAdjustingLeverage);
    
    maxLeverage = getMaxLeverage (market, leverage, positionSize, 'market', undefined, bid, ask); // Max leverage for linear market position
    maintenanceMarginRate = getMaintenanceMarginRate (market, leverage, positionSize, ask, 'taker'); // Maintenance margin rate for linear taker position, entryPrice=ask
    marginWhenAdjustingLeverage = getMarginWhenAdjustingLeverage (market, leverage, positionSize, ask, 'taker', unrealizedPnl); // Margin when adjusting leverage for linear taker position, entryPrice=ask
    console.log (maxLeverage, maintenanceMarginRate, marginWhenAdjustingLeverage);
    
    // Inverse markets
    symbol = 'BTC/USD:BTC';
    market = exchange.market (symbol);

    maxLeverage = getMaxLeverage (market, leverage, positionSize, 'limit', bid); // Max leverage for linear limit position, entryPrice=bid
    maintenanceMarginRate = getMaintenanceMarginRate (market, leverage, positionSize, bid, 'maker'); // Maintenance margin rate for linear maker position, entryPrice=bid
    marginWhenAdjustingLeverage = getMarginWhenAdjustingLeverage (market, leverage, positionSize, bid, 'maker', unrealizedPnl); // Margin when adjusting leverage for linear maker position, entryPrice=bid
    console.log (maxLeverage, maintenanceMarginRate, marginWhenAdjustingLeverage);
    
    maxLeverage = getMaxLeverage (market, leverage, positionSize, 'market', undefined, bid, ask); // Max leverage for linear market position
    maintenanceMarginRate = getMaintenanceMarginRate (market, leverage, positionSize, ask, 'taker'); // Maintenance margin rate for linear taker position, entryPrice=ask
    marginWhenAdjustingLeverage = getMarginWhenAdjustingLeverage (market, leverage, positionSize, ask, 'taker', unrealizedPnl); // Margin when adjusting leverage for linear taker position, entryPrice=ask
    console.log (maxLeverage, maintenanceMarginRate, marginWhenAdjustingLeverage);
}

main ()
