import assert from 'assert';
import { Exchange, Market, Str } from "../../../../ccxt.js";
import Precise from '../../../base/Precise.js';
import testSharedMethods from './test.sharedMethods.js';

function testPosition (exchange: Exchange, skippedProperties: object, method: string, entry: object, symbol: Str, now: number) {
    // a prediction position is a simple outcome-share holding keyed by an outcome handle (not a
    // `symbol`), with no opened-at timestamp and none of the derivatives semantics — skip the
    // leverage / margin / mark-price / liquidation / pnl fields that don't apply
    if (exchange.safeBool (exchange.has, 'prediction', false)) {
        skippedProperties = exchange.extend ({ 'symbol': true, 'timestamp': true, 'datetime': true, 'leverage': true, 'initialMargin': true, 'initialMarginPercentage': true, 'maintenanceMargin': true, 'maintenanceMarginPercentage': true, 'entryPrice': true, 'notional': true, 'unrealizedPnl': true, 'marginRatio': true, 'liquidationPrice': true, 'markPrice': true, 'positionMargin': true, 'collateral': true, 'percentage': true }, skippedProperties);
    }
    const format = {
        'info': {}, // or []
        'symbol': 'XYZ/USDT',
        'timestamp': 1504224000000,
        'datetime': '2017-09-01T00:00:00',
        'initialMargin': exchange.parseNumber ('1.234'),
        'initialMarginPercentage': exchange.parseNumber ('0.123'),
        'maintenanceMargin': exchange.parseNumber ('1.234'),
        'maintenanceMarginPercentage': exchange.parseNumber ('0.123'),
        'entryPrice': exchange.parseNumber ('1.234'),
        'notional': exchange.parseNumber ('1.234'),
        'leverage': exchange.parseNumber ('1.234'),
        'unrealizedPnl': exchange.parseNumber ('1.234'),
        'contracts': exchange.parseNumber ('1'),
        'contractSize': exchange.parseNumber ('1.234'),
        'marginRatio': exchange.parseNumber ('1.234'),
        'liquidationPrice': exchange.parseNumber ('1.234'),
        'markPrice': exchange.parseNumber ('1.234'),
        'positionMargin': exchange.parseNumber ('1.234'),
        'collateral': exchange.parseNumber ('1.234'),
        'marginMode': 'cross',
        'side': 'long',
        'percentage': exchange.parseNumber ('1.234'),
    };
    const emptyotAllowedFor = [ 'positionMargin', 'liquidationPrice', 'initialMargin', 'initialMarginPercentage', 'maintenanceMargin', 'maintenanceMarginPercentage', 'marginRatio' ];
    testSharedMethods.assertStructure (exchange, skippedProperties, method, entry, format, emptyotAllowedFor);
    testSharedMethods.assertTimestampAndDatetime (exchange, skippedProperties, method, entry, now);
    testSharedMethods.assertSymbol (exchange, skippedProperties, method, entry, 'symbol', symbol);
    testSharedMethods.assertInArray (exchange, skippedProperties, method, entry, 'side', [ 'long', 'short' ]);
    testSharedMethods.assertInArray (exchange, skippedProperties, method, entry, 'marginMode', [ 'cross', 'isolated' ]);
    testSharedMethods.assertGreater (exchange, skippedProperties, method, entry, 'leverage', '0');
    testSharedMethods.assertLessOrEqual (exchange, skippedProperties, method, entry, 'leverage', '200');
    testSharedMethods.assertGreater (exchange, skippedProperties, method, entry, 'initialMargin', '0');
    testSharedMethods.assertGreater (exchange, skippedProperties, method, entry, 'initialMarginPercentage', '0');
    testSharedMethods.assertGreater (exchange, skippedProperties, method, entry, 'maintenanceMargin', '0');
    testSharedMethods.assertGreater (exchange, skippedProperties, method, entry, 'maintenanceMarginPercentage', '0');
    testSharedMethods.assertGreater (exchange, skippedProperties, method, entry, 'entryPrice', '0');
    testSharedMethods.assertGreater (exchange, skippedProperties, method, entry, 'notional', '0');
    testSharedMethods.assertGreater (exchange, skippedProperties, method, entry, 'contracts', '0');
    testSharedMethods.assertGreater (exchange, skippedProperties, method, entry, 'contractSize', '0');
    testSharedMethods.assertGreater (exchange, skippedProperties, method, entry, 'marginRatio', '0');
    testSharedMethods.assertGreater (exchange, skippedProperties, method, entry, 'liquidationPrice', '0');
    testSharedMethods.assertGreater (exchange, skippedProperties, method, entry, 'markPrice', '0');
    testSharedMethods.assertGreater (exchange, skippedProperties, method, entry, 'collateral', '0');
    // testSharedMethods.assertGreaterOrEqual (exchange, skippedProperties, method, entry, 'percentage', '0'); // percentage might be < 0
    const marginMode = exchange.safeString (entry, 'marginMode');
    if (marginMode === 'isolated') {
        const logText = testSharedMethods.logTemplate (exchange, method, entry);
        const side = exchange.safeString (entry, 'side');
        const entryPriceString = exchange.safeString (entry, 'entryPrice');
        const liquidationPriceString = exchange.safeString (entry, 'liquidationPrice');
        const contractsString = exchange.safeString (entry, 'contracts');
        const contractSizeString = exchange.safeString (entry, 'contractSize');
        const maintenanceMarginString = exchange.safeString (entry, 'maintenanceMargin');
        const collateralString = exchange.safeString (entry, 'collateral');
        const initialMarginString = exchange.safeString (entry, 'initialMargin');
        const unrealizedPnlString = exchange.safeString (entry, 'unrealizedPnl');
        if ((entryPriceString !== undefined) && (liquidationPriceString !== undefined) && Precise.stringGt (entryPriceString, '0') && Precise.stringGt (liquidationPriceString, '0')) {
            if (side === 'long') {
                testSharedMethods.assertLess (exchange, skippedProperties, method, entry, 'liquidationPrice', entryPriceString);
            } else if (side === 'short') {
                testSharedMethods.assertGreater (exchange, skippedProperties, method, entry, 'liquidationPrice', entryPriceString);
            }
        }
        const marginString = exchange.safeString (entry, 'positionMargin');
        if ((marginString !== undefined) && (collateralString !== undefined) && (unrealizedPnlString !== undefined)) {
            // collateral is margin + unrealizedPnl
            const expectedCollateral = Precise.stringAdd (marginString, unrealizedPnlString);
            const collateralDiff = Precise.stringAbs (Precise.stringSub (collateralString, expectedCollateral));
            const collateralTolerance = Precise.stringMul (Precise.stringAbs (marginString), '0.05');
            assert (Precise.stringLe (collateralDiff, collateralTolerance), 'collateral should equal margin + unrealizedPnl' + logText);
        }
        let entryMarginString: Str = marginString;
        if ((entryMarginString === undefined) && (collateralString !== undefined)) {
            if ((unrealizedPnlString !== undefined) && !Precise.stringEq (collateralString, initialMarginString)) {
                entryMarginString = Precise.stringSub (collateralString, unrealizedPnlString);
            } else {
                entryMarginString = collateralString;
            }
        } else if ((entryMarginString === undefined) && (initialMarginString !== undefined)) {
            entryMarginString = initialMarginString;
        }
        const hasEntryMargin = (entryMarginString !== undefined) && Precise.stringGt (entryMarginString, '0');
        const hasEntryPrice = (entryPriceString !== undefined) && Precise.stringGt (entryPriceString, '0');
        const hasLiqPrice = (liquidationPriceString !== undefined) && Precise.stringGt (liquidationPriceString, '0');
        const hasContracts = (contractsString !== undefined) && Precise.stringGt (contractsString, '0');
        const hasContractSize = (contractSizeString !== undefined) && Precise.stringGt (contractSizeString, '0');
        const hasMm = (maintenanceMarginString !== undefined) && Precise.stringGt (maintenanceMarginString, '0');
        if (hasEntryMargin && hasEntryPrice && hasLiqPrice && hasContracts && hasContractSize && hasMm) {
            const symbolForMarket = (symbol !== undefined) ? symbol : exchange.safeString (entry, 'symbol');
            let market: Market = undefined;
            if ((symbolForMarket !== undefined) && (exchange.markets !== undefined) && (symbolForMarket in exchange.markets)) {
                market = exchange.market (symbolForMarket);
            }
            const isInverse = (market !== undefined) && exchange.safeBool (market, 'inverse', false);
            let priceDiff: Str = undefined;
            if (isInverse) {
                const invEntry = Precise.stringDiv ('1', entryPriceString);
                const invLiq = Precise.stringDiv ('1', liquidationPriceString);
                priceDiff = Precise.stringAbs (Precise.stringSub (invEntry, invLiq));
            } else {
                priceDiff = Precise.stringAbs (Precise.stringSub (entryPriceString, liquidationPriceString));
            }
            const lossFromEntry = Precise.stringMul (priceDiff, Precise.stringMul (contractsString, contractSizeString));
            const calculatedMm = Precise.stringSub (entryMarginString, lossFromEntry);
            assert (Precise.stringGt (calculatedMm, '0'), 'isolated position remaining collateral at liquidationPrice (' + calculatedMm + ') should be greater than 0' + logText);
            const mmDiff = Precise.stringAbs (Precise.stringSub (calculatedMm, maintenanceMarginString));
            const maxTolerance = Precise.stringMul (entryMarginString, '0.05');
            assert (Precise.stringLe (mmDiff, maxTolerance), 'isolated position maintenanceMargin (' + maintenanceMarginString + ') does not match remaining collateral at liquidationPrice (' + calculatedMm + ')' + logText);
        }
    }
}

export default testPosition;
