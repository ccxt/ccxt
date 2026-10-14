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
}

export default testSafePosition;
