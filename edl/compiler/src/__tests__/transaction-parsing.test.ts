/**
 * Tests for Transaction Parsing Logic
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
    TransactionParser,
    validateTransactionId,
    validateTxid,
    validateCurrency,
    validateAmount,
    validateStatus,
    validateTimestamp,
    validateFee,
    createBinanceParser,
    createKrakenParser,
    createGenericParser,
} from '../parsing/transactions.js';
import type { TransactionDefinition, TransactionStatus } from '../types/edl.js';

// ============================================================
// Field Validation Tests
// ============================================================

test('validateTransactionId - valid string ID', () => {
    const result = validateTransactionId('txn-12345');
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
});

test('validateTransactionId - valid numeric ID', () => {
    const result = validateTransactionId(12345);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
});

test('validateTransactionId - reject null', () => {
    const result = validateTransactionId(null);
    assert.equal(result.valid, false);
    assert.equal(result.errors.length, 1);
    assert.equal(result.errors[0].field, 'id');
});

test('validateTransactionId - reject empty string', () => {
    const result = validateTransactionId('  ');
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.field === 'id'));
});

test('validateTxid - valid txid', () => {
    const result = validateTxid('0x1234567890abcdef');
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
});

test('validateTxid - optional txid can be null', () => {
    const result = validateTxid(null, false);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
});

test('validateTxid - required txid cannot be null', () => {
    const result = validateTxid(null, true);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.field === 'txid'));
});

test('validateTxid - reject non-string txid', () => {
    const result = validateTxid(12345);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.field === 'txid'));
});

test('validateCurrency - valid currency code', () => {
    const result = validateCurrency('BTC');
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
});

test('validateCurrency - accept alphanumeric codes', () => {
    const result = validateCurrency('USDT');
    assert.equal(result.valid, true);
});

test('validateCurrency - reject empty currency', () => {
    const result = validateCurrency('');
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.field === 'currency'));
});

test('validateCurrency - reject non-string currency', () => {
    const result = validateCurrency(123);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.field === 'currency'));
});

test('validateAmount - valid positive amount', () => {
    const result = validateAmount(100.5);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
});

test('validateAmount - valid zero amount', () => {
    const result = validateAmount(0);
    assert.equal(result.valid, true);
});

test('validateAmount - reject negative amount', () => {
    const result = validateAmount(-10);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.field === 'amount'));
});

test('validateAmount - reject NaN', () => {
    const result = validateAmount('not-a-number');
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.field === 'amount'));
});

test('validateAmount - reject null', () => {
    const result = validateAmount(null);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.field === 'amount'));
});

test('validateStatus - valid pending status', () => {
    const result = validateStatus('pending');
    assert.equal(result.valid, true);
});

test('validateStatus - valid ok status', () => {
    const result = validateStatus('ok');
    assert.equal(result.valid, true);
});

test('validateStatus - valid failed status', () => {
    const result = validateStatus('failed');
    assert.equal(result.valid, true);
});

test('validateStatus - valid canceled status', () => {
    const result = validateStatus('canceled');
    assert.equal(result.valid, true);
});

test('validateStatus - reject invalid status', () => {
    const result = validateStatus('invalid-status');
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.field === 'status'));
});

test('validateStatus - reject null status', () => {
    const result = validateStatus(null);
    assert.equal(result.valid, false);
});

test('validateTimestamp - valid timestamp in milliseconds', () => {
    const result = validateTimestamp(1672531200000); // 2023-01-01
    assert.equal(result.valid, true);
});

test('validateTimestamp - valid timestamp in seconds', () => {
    const result = validateTimestamp(1672531200); // 2023-01-01 in seconds
    assert.equal(result.valid, true);
});

test('validateTimestamp - optional timestamp can be null', () => {
    const result = validateTimestamp(null, false);
    assert.equal(result.valid, true);
});

test('validateTimestamp - required timestamp cannot be null', () => {
    const result = validateTimestamp(null, true);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.field === 'timestamp'));
});

test('validateTimestamp - reject negative timestamp', () => {
    const result = validateTimestamp(-1000);
    assert.equal(result.valid, false);
});

test('validateFee - valid fee object', () => {
    const result = validateFee({ cost: 0.5, currency: 'BTC' });
    assert.equal(result.valid, true);
});

test('validateFee - optional fee can be null', () => {
    const result = validateFee(null, false);
    assert.equal(result.valid, true);
});

test('validateFee - required fee cannot be null', () => {
    const result = validateFee(null, true);
    assert.equal(result.valid, false);
});

test('validateFee - reject fee without cost', () => {
    const result = validateFee({ currency: 'BTC' });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.field === 'fee.cost'));
});

test('validateFee - reject fee without currency', () => {
    const result = validateFee({ cost: 0.5 });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.field === 'fee.currency'));
});

test('validateFee - reject negative fee cost', () => {
    const result = validateFee({ cost: -0.5, currency: 'BTC' });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.field === 'fee.cost'));
});

// ============================================================
// TransactionParser Tests
// ============================================================

test('TransactionParser - parse basic deposit transaction', () => {
    const parser = new TransactionParser();
    const data = {
        id: 'dep-123',
        txid: '0xabc123',
        currency: 'BTC',
        amount: 1.5,
        status: 'ok',
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        timestamp: 1672531200000,
    };

    const result = parser.parse(data, 'deposit');

    assert.equal(result.id, 'dep-123');
    assert.equal(result.txid, '0xabc123');
    assert.equal(result.type, 'deposit');
    assert.equal(result.currency, 'BTC');
    assert.equal(result.amount, 1.5);
    assert.equal(result.status, 'ok');
    assert.equal(result.address, '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
    assert.equal(result.timestamp, 1672531200000);
});

test('TransactionParser - parse withdrawal transaction', () => {
    const parser = new TransactionParser();
    const data = {
        id: 'wth-456',
        currency: 'ETH',
        amount: 2.0,
        status: 'pending',
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5',
        network: 'ERC20',
    };

    const result = parser.parse(data, 'withdrawal');

    assert.equal(result.type, 'withdrawal');
    assert.equal(result.currency, 'ETH');
    assert.equal(result.amount, 2.0);
    assert.equal(result.status, 'pending');
    assert.equal(result.network, 'ERC20');
});

test('TransactionParser - parse transaction with fee', () => {
    const parser = new TransactionParser();
    const data = {
        id: 'txn-789',
        currency: 'BTC',
        amount: 0.5,
        status: 'ok',
        fee: {
            cost: 0.0001,
            currency: 'BTC',
        },
    };

    const result = parser.parse(data, 'deposit');

    assert.notEqual(result.fee, undefined);
    assert.equal(result.fee?.cost, 0.0001);
    assert.equal(result.fee?.currency, 'BTC');
});

test('TransactionParser - parse transaction with numeric fee', () => {
    const parser = new TransactionParser();
    const data = {
        id: 'txn-790',
        currency: 'ETH',
        amount: 1.0,
        status: 'ok',
        fee: 0.005,
    };

    const result = parser.parse(data, 'deposit');

    assert.notEqual(result.fee, undefined);
    assert.equal(result.fee?.cost, 0.005);
    assert.equal(result.fee?.currency, 'ETH');
});

test('TransactionParser - parse transaction with tag', () => {
    const parser = new TransactionParser();
    const data = {
        id: 'txn-800',
        currency: 'XRP',
        amount: 100,
        status: 'ok',
        address: 'rN7n7otQDd6FczFgLdlqtyMVrn3NnrcVcr',
        tag: '12345',
    };

    const result = parser.parse(data, 'deposit');

    assert.equal(result.tag, '12345');
});

test('TransactionParser - parse timestamp in seconds', () => {
    const parser = new TransactionParser();
    const data = {
        id: 'txn-900',
        currency: 'BTC',
        amount: 0.1,
        status: 'ok',
        timestamp: 1672531200, // Seconds
    };

    const result = parser.parse(data, 'deposit');

    assert.equal(result.timestamp, 1672531200000); // Converted to milliseconds
});

test('TransactionParser - parse multiple transactions', () => {
    const parser = new TransactionParser();
    const dataArray = [
        {
            id: 'txn-1',
            currency: 'BTC',
            amount: 1.0,
            status: 'ok',
        },
        {
            id: 'txn-2',
            currency: 'ETH',
            amount: 2.0,
            status: 'pending',
        },
    ];

    const results = parser.parseMultiple(dataArray, 'deposit');

    assert.equal(results.length, 2);
    assert.equal(results[0].id, 'txn-1');
    assert.equal(results[1].id, 'txn-2');
});

test('TransactionParser - validate valid transaction', () => {
    const parser = new TransactionParser();
    const transaction: TransactionDefinition = {
        id: 'txn-valid',
        txid: '0xabc',
        type: 'deposit',
        currency: 'BTC',
        amount: 1.0,
        status: 'ok',
        address: null,
        addressFrom: null,
        addressTo: null,
        tag: null,
        tagFrom: null,
        tagTo: null,
        network: null,
        timestamp: 1672531200000,
        datetime: null,
        updated: null,
        comment: null,
        internal: false,
        info: {},
    };

    const result = parser.validate(transaction);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
});

test('TransactionParser - detect invalid transaction type', () => {
    const parser = new TransactionParser();
    const transaction: any = {
        id: 'txn-invalid',
        type: 'invalid-type',
        currency: 'BTC',
        amount: 1.0,
        status: 'ok',
    };

    const result = parser.validate(transaction);

    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.field === 'type'));
});

test('TransactionParser - detect missing required fields', () => {
    const parser = new TransactionParser();
    const transaction: any = {
        id: 'txn-incomplete',
    };

    const result = parser.validate(transaction);

    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.field === 'currency'));
    assert.ok(result.errors.some(e => e.field === 'amount'));
    assert.ok(result.errors.some(e => e.field === 'status'));
});

test('TransactionParser - custom field mappings', () => {
    const parser = new TransactionParser({
        fieldMappings: {
            id: 'transactionId',
            currency: 'coin',
            amount: 'qty',
        },
    });

    const data = {
        transactionId: 'custom-123',
        coin: 'BTC',
        qty: 0.5,
        status: 'ok',
    };

    const result = parser.parse(data, 'deposit');

    assert.equal(result.id, 'custom-123');
    assert.equal(result.currency, 'BTC');
    assert.equal(result.amount, 0.5);
});

test('TransactionParser - custom status mappings', () => {
    const parser = new TransactionParser({
        statusMappings: {
            0: 'pending',
            1: 'ok',
            2: 'failed',
        },
    });

    const data = {
        id: 'txn-status',
        currency: 'BTC',
        amount: 1.0,
        status: 1,
    };

    const result = parser.parse(data, 'deposit');

    assert.equal(result.status, 'ok');
});

test('TransactionParser - parse status from string', () => {
    const parser = new TransactionParser();
    const testCases = [
        { input: 'success', expected: 'ok' },
        { input: 'complete', expected: 'ok' },
        { input: 'failed', expected: 'failed' },
        { input: 'failure', expected: 'failed' },
        { input: 'pending', expected: 'pending' },
        { input: 'processing', expected: 'pending' },
        { input: 'cancelled', expected: 'canceled' },
    ];

    for (const testCase of testCases) {
        const data = {
            id: 'test',
            currency: 'BTC',
            amount: 1,
            status: testCase.input,
        };
        const result = parser.parse(data, 'deposit');
        assert.equal(result.status, testCase.expected, `Failed for input: ${testCase.input}`);
    }
});

test('TransactionParser - nested field extraction', () => {
    const parser = new TransactionParser({
        fieldMappings: {
            currency: 'asset.code',
            amount: 'details.amount',
        },
    });

    const data = {
        id: 'nested-123',
        asset: {
            code: 'BTC',
        },
        details: {
            amount: 1.5,
        },
        status: 'ok',
    };

    const result = parser.parse(data, 'deposit');

    assert.equal(result.currency, 'BTC');
    assert.equal(result.amount, 1.5);
});

// ============================================================
// Exchange-Specific Parser Tests
// ============================================================

test('Binance parser - parse deposit', () => {
    const parser = createBinanceParser();
    const data = {
        id: 'bnb-dep-123',
        txId: '0xbinance123',
        coin: 'BTC',
        amount: '1.5',
        status: 1, // Success
        address: '1BinanceAddress',
        addressTag: 'memo123',
        network: 'BTC',
        transactionFee: '0.0001',
        insertTime: 1672531200000,
    };

    const result = parser.parse(data, 'deposit');

    assert.equal(result.id, 'bnb-dep-123');
    assert.equal(result.txid, '0xbinance123');
    assert.equal(result.currency, 'BTC');
    assert.equal(result.amount, 1.5);
    assert.equal(result.status, 'ok');
    assert.equal(result.tag, 'memo123');
    assert.equal(result.network, 'BTC');
    assert.equal(result.fee?.cost, 0.0001);
});

test('Binance parser - status code mapping', () => {
    const parser = createBinanceParser();
    const statusTests = [
        { code: 0, expected: 'pending' as TransactionStatus },
        { code: 1, expected: 'ok' as TransactionStatus },
        { code: 3, expected: 'failed' as TransactionStatus },
        { code: 6, expected: 'ok' as TransactionStatus },
    ];

    for (const test of statusTests) {
        const data = {
            id: 'test',
            coin: 'BTC',
            amount: '1',
            status: test.code,
        };
        const result = parser.parse(data, 'deposit');
        assert.equal(result.status, test.expected, `Failed for status code: ${test.code}`);
    }
});

test('Kraken parser - parse deposit', () => {
    const parser = createKrakenParser();
    const data = {
        refid: 'kraken-ref-456',
        txid: '0xkraken456',
        asset: 'XXBT',
        amount: '2.5',
        status: 'Success',
        info: '1KrakenAddress',
        method: 'Bitcoin',
        fee: '0.0002',
        time: 1672531200, // Kraken uses seconds
    };

    const result = parser.parse(data, 'deposit');

    assert.equal(result.id, 'kraken-ref-456');
    assert.equal(result.txid, '0xkraken456');
    assert.equal(result.currency, 'XXBT');
    assert.equal(result.amount, 2.5);
    assert.equal(result.status, 'ok');
    assert.equal(result.address, '1KrakenAddress');
    assert.equal(result.network, 'Bitcoin');
    assert.equal(result.timestamp, 1672531200000); // Converted to milliseconds
});

test('Kraken parser - status mapping', () => {
    const parser = createKrakenParser();
    const statusTests = [
        { status: 'Success', expected: 'ok' as TransactionStatus },
        { status: 'Pending', expected: 'pending' as TransactionStatus },
        { status: 'Failed', expected: 'failed' as TransactionStatus },
        { status: 'Failure', expected: 'failed' as TransactionStatus },
    ];

    for (const test of statusTests) {
        const data = {
            refid: 'test',
            asset: 'BTC',
            amount: '1',
            status: test.status,
            time: 1672531200,
        };
        const result = parser.parse(data, 'deposit');
        assert.equal(result.status, test.expected, `Failed for status: ${test.status}`);
    }
});

test('Generic parser - basic functionality', () => {
    const parser = createGenericParser();
    const data = {
        id: 'generic-123',
        currency: 'BTC',
        amount: 1.0,
        status: 'ok',
    };

    const result = parser.parse(data, 'deposit');

    assert.equal(result.id, 'generic-123');
    assert.equal(result.currency, 'BTC');
    assert.equal(result.amount, 1.0);
    assert.equal(result.status, 'ok');
});

// ============================================================
// Edge Cases and Error Handling
// ============================================================

test('TransactionParser - throw error for non-object data', () => {
    const parser = new TransactionParser();

    assert.throws(() => {
        parser.parse('not-an-object', 'deposit');
    }, {
        message: 'Transaction data must be an object',
    });
});

test('TransactionParser - throw error for non-array in parseMultiple', () => {
    const parser = new TransactionParser();

    assert.throws(() => {
        parser.parseMultiple('not-an-array' as any, 'deposit');
    }, {
        message: 'Transaction data must be an array',
    });
});

test('TransactionParser - handle missing optional fields gracefully', () => {
    const parser = new TransactionParser();
    const data = {
        id: 'minimal',
        currency: 'BTC',
        amount: 1.0,
        status: 'ok',
    };

    const result = parser.parse(data, 'deposit');

    assert.equal(result.txid, null);
    assert.equal(result.address, null);
    assert.equal(result.tag, null);
    assert.equal(result.network, null);
    assert.equal(result.fee, undefined);
});

test('TransactionParser - store original data in info field', () => {
    const parser = new TransactionParser();
    const data = {
        id: 'info-test',
        currency: 'BTC',
        amount: 1.0,
        status: 'ok',
        customField: 'custom-value',
    };

    const result = parser.parse(data, 'deposit');

    assert.deepEqual(result.info, data);
    assert.equal(result.info.customField, 'custom-value');
});
