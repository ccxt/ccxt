// AUTO_TRANSPILE_ENABLED

import assert from 'assert';
import Precise from '../../base/Precise.js';
import ccxt from '../../../ccxt.js';

function preciseEqualPositionStr (exchange: any, result: any, key: string, expected: string) {
    return Precise.stringEq (exchange.safeString (result, key), expected);
}

function testSafePosition () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    // CASE 1 - isolated linear long: derive maintenanceMargin
    // entryMargin = 100, entryPrice = 1000, liquidationPrice = 910, contracts = 2, contractSize = 0.5
    // lossFromEntry = (1000 - 910) * 2 * 0.5 = 90 -> maintenanceMargin = 100 - 90 = 10
    const pos1 = {
        'marginMode': 'isolated',
        'side': 'long',
        'entryPrice': 1000,
        'liquidationPrice': 910,
        'contracts': 2,
        'contractSize': 0.5,
        'collateral': 100,
        'initialMargin': 100,
    };
    const res1 = exchange.safePosition (pos1);
    assert (preciseEqualPositionStr (exchange, res1, 'maintenanceMargin', '10'));

    // CASE 2 - isolated linear short: derive liquidationPrice
    // entryMargin = 100, maintenanceMargin = 10, entryPrice = 1000, contracts = 2, contractSize = 0.5
    // bufferPerUnit = (100 - 10) / (2 * 0.5) = 90 -> liquidationPrice = 1000 + 90 = 1090
    const pos2 = {
        'marginMode': 'isolated',
        'side': 'short',
        'entryPrice': 1000,
        'contracts': 2,
        'contractSize': 0.5,
        'collateral': 100,
        'initialMargin': 100,
        'maintenanceMargin': 10,
    };
    const res2 = exchange.safePosition (pos2);
    assert (preciseEqualPositionStr (exchange, res2, 'liquidationPrice', '1090'));

    // CASE 3 - isolated linear long: derive entryPrice
    const pos3 = {
        'marginMode': 'isolated',
        'side': 'long',
        'liquidationPrice': 910,
        'contracts': 2,
        'contractSize': 0.5,
        'collateral': 100,
        'initialMargin': 100,
        'maintenanceMargin': 10,
    };
    const res3 = exchange.safePosition (pos3);
    assert (preciseEqualPositionStr (exchange, res3, 'entryPrice', '1000'));

    // CASE 4 - isolated linear long: derive contracts
    const pos4 = {
        'marginMode': 'isolated',
        'side': 'long',
        'entryPrice': 1000,
        'liquidationPrice': 910,
        'contractSize': 0.5,
        'collateral': 100,
        'initialMargin': 100,
        'maintenanceMargin': 10,
    };
    const res4 = exchange.safePosition (pos4);
    assert (preciseEqualPositionStr (exchange, res4, 'contracts', '2'));

    // CASE 5 - isolated linear long: derive contractSize
    const pos5 = {
        'marginMode': 'isolated',
        'side': 'long',
        'entryPrice': 1000,
        'liquidationPrice': 910,
        'contracts': 2,
        'collateral': 100,
        'initialMargin': 100,
        'maintenanceMargin': 10,
    };
    const res5 = exchange.safePosition (pos5);
    assert (preciseEqualPositionStr (exchange, res5, 'contractSize', '0.5'));

    // CASE 6 - isolated linear long: derive collateral and initialMargin
    const pos6 = {
        'marginMode': 'isolated',
        'side': 'long',
        'entryPrice': 1000,
        'liquidationPrice': 910,
        'contracts': 2,
        'contractSize': 0.5,
        'maintenanceMargin': 10,
    };
    const res6 = exchange.safePosition (pos6);
    assert (preciseEqualPositionStr (exchange, res6, 'initialMargin', '100'));
    assert (preciseEqualPositionStr (exchange, res6, 'collateral', '100'));

    // CASE 7 - isolated linear with unrealizedPnl included in collateral
    // collateral = 115, unrealizedPnl = 15 -> entryMargin = 100 -> maintenanceMargin = 10
    const pos7 = {
        'marginMode': 'isolated',
        'side': 'long',
        'entryPrice': 1000,
        'liquidationPrice': 910,
        'contracts': 2,
        'contractSize': 0.5,
        'collateral': 115,
        'unrealizedPnl': 15,
    };
    const res7 = exchange.safePosition (pos7);
    assert (preciseEqualPositionStr (exchange, res7, 'maintenanceMargin', '10'));

    // CASE 8 - cross margin position must not derive isolated maintenanceMargin
    const pos8 = {
        'marginMode': 'cross',
        'side': 'long',
        'entryPrice': 1000,
        'liquidationPrice': 910,
        'contracts': 2,
        'contractSize': 0.5,
        'collateral': 100,
        'initialMargin': 100,
    };
    const res8 = exchange.safePosition (pos8);
    assert (exchange.safeValue (res8, 'maintenanceMargin') === undefined);

    // CASE 9 - cross margin linear position derives notional, unrealizedPnl, initialMarginPercentage, initialMargin, maintenanceMargin, marginRatio, percentage
    const pos9 = {
        'marginMode': 'cross',
        'side': 'long',
        'entryPrice': 1000,
        'markPrice': 1050,
        'contracts': 2,
        'contractSize': 0.5,
        'leverage': 10,
        'maintenanceMarginPercentage': 0.01,
        'collateral': 210,
    };
    const res9 = exchange.safePosition (pos9);
    assert (preciseEqualPositionStr (exchange, res9, 'notional', '1050'));
    assert (preciseEqualPositionStr (exchange, res9, 'unrealizedPnl', '50'));
    assert (preciseEqualPositionStr (exchange, res9, 'initialMarginPercentage', '0.1'));
    assert (preciseEqualPositionStr (exchange, res9, 'initialMargin', '105'));
    assert (preciseEqualPositionStr (exchange, res9, 'maintenanceMargin', '10.5'));
    assert (preciseEqualPositionStr (exchange, res9, 'marginRatio', '0.05'));
    assert (preciseEqualPositionStr (exchange, res9, 'percentage', '47.61'));

    // CASE 10 - cross margin position derives leverage, maintenanceMarginPercentage, and markPrice
    const pos10 = {
        'marginMode': 'cross',
        'side': 'short',
        'notional': 2000,
        'contracts': 4,
        'contractSize': 0.5,
        'initialMarginPercentage': 0.05,
        'maintenanceMargin': 20,
    };
    const res10 = exchange.safePosition (pos10);
    assert (preciseEqualPositionStr (exchange, res10, 'markPrice', '1000'));
    assert (preciseEqualPositionStr (exchange, res10, 'leverage', '20'));
    assert (preciseEqualPositionStr (exchange, res10, 'initialMargin', '100'));
    assert (preciseEqualPositionStr (exchange, res10, 'maintenanceMarginPercentage', '0.01'));
}

export default testSafePosition;
