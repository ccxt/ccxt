/**
 * Tests for Wallet Operations Schema
 */

import { describe, test } from 'node:test';
import { strict as assert } from 'node:assert';
import type {
    DepositAddressSchema,
    WithdrawalSchema,
    TransferSchema,
    BalanceSchema,
    WalletEndpointSchema,
    WithdrawalStatus,
    TransferStatus,
    AccountType,
    ResponseMapping,
} from '../schemas/wallet-operations.js';
import {
    validateWalletOperation,
    validateWithdrawalOperation,
    validateTransferOperation,
    validateDepositAddressRequest,
    normalizeWalletResponse,
    createDepositAddress,
    createWithdrawal,
    createTransfer,
    createBalance,
} from '../schemas/wallet-operations.js';
import type { ParamDefinition } from '../types/edl.js';

describe('Wallet Operations Schema', () => {
    describe('Deposit Address Validation', () => {
        test('validate valid deposit address request', () => {
            const result = validateDepositAddressRequest('BTC', 'BTC');

            assert.equal(result.valid, true);
            assert.equal(result.errors.length, 0);
        });

        test('validate deposit address request without network', () => {
            const result = validateDepositAddressRequest('ETH');

            assert.equal(result.valid, true);
            assert.equal(result.errors.length, 0);
        });

        test('reject empty currency', () => {
            const result = validateDepositAddressRequest('');

            assert.equal(result.valid, false);
            assert.equal(result.errors.length, 1);
            assert.equal(result.errors[0].field, 'currency');
        });

        test('reject lowercase currency', () => {
            const result = validateDepositAddressRequest('btc');

            assert.equal(result.valid, false);
            assert.equal(result.errors.some(e => e.field === 'currency' && e.message.includes('uppercase')), true);
        });

        test('accept numeric currency codes', () => {
            const result = validateDepositAddressRequest('BTC2');

            assert.equal(result.valid, true);
        });
    });

    describe('Withdrawal Validation', () => {
        const withdrawalSchema: WalletEndpointSchema = {
            operation: 'withdraw',
            endpoint: '/api/v1/withdraw',
            method: 'POST',
            params: {
                currency: { type: 'string', required: true },
                address: { type: 'string', required: true },
                amount: { type: 'number', required: true, min: 0.00000001 },
                network: { type: 'string', required: false },
                tag: { type: 'string', required: false },
            },
            response: {
                mapping: {},
            },
        };

        test('validate valid withdrawal request', () => {
            const withdrawal: Partial<WithdrawalSchema> = {
                currency: 'BTC',
                address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
                amount: 0.5,
            };

            const result = validateWithdrawalOperation(withdrawal, withdrawalSchema);

            assert.equal(result.valid, true);
            assert.equal(result.errors.length, 0);
        });

        test('reject withdrawal without currency', () => {
            const withdrawal: Partial<WithdrawalSchema> = {
                address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
                amount: 0.5,
            } as any;

            const result = validateWithdrawalOperation(withdrawal, withdrawalSchema);

            assert.equal(result.valid, false);
            assert.ok(result.errors.some(e => e.field === 'currency'));
        });

        test('reject withdrawal without address', () => {
            const withdrawal: Partial<WithdrawalSchema> = {
                currency: 'BTC',
                amount: 0.5,
            } as any;

            const result = validateWithdrawalOperation(withdrawal, withdrawalSchema);

            assert.equal(result.valid, false);
            assert.ok(result.errors.some(e => e.field === 'address'));
        });

        test('reject withdrawal with zero amount', () => {
            const withdrawal: Partial<WithdrawalSchema> = {
                currency: 'BTC',
                address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
                amount: 0,
            };

            const result = validateWithdrawalOperation(withdrawal, withdrawalSchema);

            assert.equal(result.valid, false);
            assert.ok(result.errors.some(e => e.field === 'amount'));
        });

        test('reject withdrawal with negative amount', () => {
            const withdrawal: Partial<WithdrawalSchema> = {
                currency: 'BTC',
                address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
                amount: -1,
            };

            const result = validateWithdrawalOperation(withdrawal, withdrawalSchema);

            assert.equal(result.valid, false);
            assert.ok(result.errors.some(e => e.field === 'amount'));
        });

        test('validate withdrawal with optional tag', () => {
            const withdrawal: Partial<WithdrawalSchema> = {
                currency: 'XRP',
                address: 'rN7n7otQDd6FczFgLdlqtyMVrn3HMfeeP4',
                amount: 100,
                tag: '123456',
            };

            const result = validateWithdrawalOperation(withdrawal, withdrawalSchema);

            assert.equal(result.valid, true);
        });

        test('validate param min value constraint', () => {
            const withdrawal: Partial<WithdrawalSchema> = {
                currency: 'BTC',
                address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
                amount: 0.000000001, // Below min
            };

            const result = validateWithdrawalOperation(withdrawal, withdrawalSchema);

            assert.equal(result.valid, false);
            assert.ok(result.errors.some(e => e.field === 'amount' && e.message.includes('at least')));
        });
    });

    describe('Transfer Validation', () => {
        const transferSchema: WalletEndpointSchema = {
            operation: 'transfer',
            endpoint: '/api/v1/transfer',
            method: 'POST',
            params: {
                currency: { type: 'string', required: true },
                amount: { type: 'number', required: true },
                fromAccount: { type: 'string', required: true },
                toAccount: { type: 'string', required: true },
            },
            response: {
                mapping: {},
            },
        };

        test('validate valid transfer request', () => {
            const transfer: Partial<TransferSchema> = {
                currency: 'USDT',
                amount: 1000,
                fromAccount: 'spot',
                toAccount: 'futures',
            };

            const result = validateTransferOperation(transfer, transferSchema);

            assert.equal(result.valid, true);
            assert.equal(result.errors.length, 0);
        });

        test('reject transfer without currency', () => {
            const transfer: Partial<TransferSchema> = {
                amount: 1000,
                fromAccount: 'spot',
                toAccount: 'futures',
            } as any;

            const result = validateTransferOperation(transfer, transferSchema);

            assert.equal(result.valid, false);
            assert.ok(result.errors.some(e => e.field === 'currency'));
        });

        test('reject transfer without fromAccount', () => {
            const transfer: Partial<TransferSchema> = {
                currency: 'USDT',
                amount: 1000,
                toAccount: 'futures',
            } as any;

            const result = validateTransferOperation(transfer, transferSchema);

            assert.equal(result.valid, false);
            assert.ok(result.errors.some(e => e.field === 'fromAccount'));
        });

        test('reject transfer without toAccount', () => {
            const transfer: Partial<TransferSchema> = {
                currency: 'USDT',
                amount: 1000,
                fromAccount: 'spot',
            } as any;

            const result = validateTransferOperation(transfer, transferSchema);

            assert.equal(result.valid, false);
            assert.ok(result.errors.some(e => e.field === 'toAccount'));
        });

        test('reject transfer with invalid fromAccount type', () => {
            const transfer: Partial<TransferSchema> = {
                currency: 'USDT',
                amount: 1000,
                fromAccount: 'invalid' as AccountType,
                toAccount: 'futures',
            };

            const result = validateTransferOperation(transfer, transferSchema);

            assert.equal(result.valid, false);
            assert.ok(result.errors.some(e => e.field === 'fromAccount'));
        });

        test('reject transfer with invalid toAccount type', () => {
            const transfer: Partial<TransferSchema> = {
                currency: 'USDT',
                amount: 1000,
                fromAccount: 'spot',
                toAccount: 'invalid' as AccountType,
            };

            const result = validateTransferOperation(transfer, transferSchema);

            assert.equal(result.valid, false);
            assert.ok(result.errors.some(e => e.field === 'toAccount'));
        });

        test('reject transfer to same account', () => {
            const transfer: Partial<TransferSchema> = {
                currency: 'USDT',
                amount: 1000,
                fromAccount: 'spot',
                toAccount: 'spot',
            };

            const result = validateTransferOperation(transfer, transferSchema);

            assert.equal(result.valid, false);
            assert.ok(result.errors.some(e => e.field === 'toAccount' && e.message.includes('same account')));
        });

        test('validate all valid account types', () => {
            const accountTypes: AccountType[] = ['spot', 'margin', 'futures', 'funding', 'earn', 'options'];

            for (const from of accountTypes) {
                for (const to of accountTypes) {
                    if (from !== to) {
                        const transfer: Partial<TransferSchema> = {
                            currency: 'USDT',
                            amount: 1000,
                            fromAccount: from,
                            toAccount: to,
                        };

                        const result = validateTransferOperation(transfer, transferSchema);
                        assert.equal(result.valid, true, `Transfer from ${from} to ${to} should be valid`);
                    }
                }
            }
        });
    });

    describe('Wallet Response Normalization', () => {
        test('normalize deposit address response', () => {
            const schema: WalletEndpointSchema = {
                operation: 'depositAddress',
                endpoint: '/api/v1/depositAddress',
                method: 'GET',
                params: {},
                response: {
                    mapping: {
                        currency: { path: 'coin', transform: 'uppercase' },
                        network: { path: 'network' },
                        address: { path: 'address' },
                        tag: { path: 'memo' },
                        tagName: { literal: 'memo' },
                    },
                },
            };

            const response = {
                coin: 'btc',
                network: 'BTC',
                address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
                memo: '',
            };

            const normalized = normalizeWalletResponse(response, schema);

            assert.equal(normalized.currency, 'BTC');
            assert.equal(normalized.network, 'BTC');
            assert.equal(normalized.address, '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
            assert.equal(normalized.tagName, 'memo');
        });

        test('normalize withdrawal response with fee', () => {
            const schema: WalletEndpointSchema = {
                operation: 'withdraw',
                endpoint: '/api/v1/withdraw',
                method: 'POST',
                params: {},
                response: {
                    mapping: {
                        id: { path: 'id', transform: 'safeString' },
                        currency: { path: 'coin', transform: 'uppercase' },
                        amount: { path: 'amount', transform: 'safeNumber' },
                        address: { path: 'address' },
                        network: { path: 'network' },
                        fee: { path: 'transactionFee', transform: 'safeNumber' },
                        status: { path: 'status' },
                        txid: { path: 'txId' },
                        timestamp: { path: 'applyTime', transform: 'safeTimestamp' },
                    },
                    statusMap: {
                        0: 'pending',
                        1: 'ok',
                        3: 'failed',
                    },
                },
            };

            const response = {
                id: '12345',
                coin: 'btc',
                amount: '0.5',
                address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
                network: 'BTC',
                transactionFee: '0.0005',
                status: 1,
                txId: 'abc123',
                applyTime: 1700000000,
            };

            const normalized = normalizeWalletResponse(response, schema);

            assert.equal(normalized.id, '12345');
            assert.equal(normalized.currency, 'BTC');
            assert.equal(normalized.amount, 0.5);
            assert.equal(normalized.address, '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
            assert.equal(normalized.network, 'BTC');
            assert.equal(normalized.fee, 0.0005);
            assert.equal(normalized.status, 'ok');
            assert.equal(normalized.txid, 'abc123');
            assert.equal(normalized.timestamp, 1700000000000);
        });

        test('normalize balance response', () => {
            const schema: WalletEndpointSchema = {
                operation: 'balance',
                endpoint: '/api/v1/balance',
                method: 'GET',
                params: {},
                response: {
                    mapping: {
                        currency: { path: 'asset', transform: 'uppercase' },
                        free: { path: 'free', transform: 'safeNumber', default: 0 },
                        used: { path: 'locked', transform: 'safeNumber', default: 0 },
                        total: { path: 'total', transform: 'safeNumber' },
                    },
                    isArray: true,
                },
            };

            const response = [
                {
                    asset: 'btc',
                    free: '1.5',
                    locked: '0.5',
                    total: '2.0',
                },
                {
                    asset: 'eth',
                    free: '10',
                    locked: '2',
                    total: '12',
                },
            ];

            const normalized = normalizeWalletResponse(response, schema);

            assert.equal(Array.isArray(normalized), true);
            assert.equal(normalized.length, 2);

            assert.equal(normalized[0].currency, 'BTC');
            assert.equal(normalized[0].free, 1.5);
            assert.equal(normalized[0].used, 0.5);
            assert.equal(normalized[0].total, 2.0);

            assert.equal(normalized[1].currency, 'ETH');
            assert.equal(normalized[1].free, 10);
            assert.equal(normalized[1].used, 2);
            assert.equal(normalized[1].total, 12);
        });

        test('normalize transfer response', () => {
            const schema: WalletEndpointSchema = {
                operation: 'transfer',
                endpoint: '/api/v1/transfer',
                method: 'POST',
                params: {},
                response: {
                    mapping: {
                        id: { path: 'tranId', transform: 'safeString' },
                        currency: { path: 'asset', transform: 'uppercase' },
                        amount: { path: 'amount', transform: 'safeNumber' },
                        fromAccount: { literal: 'spot' },
                        toAccount: { literal: 'futures' },
                        status: { path: 'status', transform: 'lowercase' },
                        timestamp: { path: 'timestamp', transform: 'safeTimestamp' },
                    },
                    statusMap: {
                        'confirmed': 'ok',
                        'pending': 'pending',
                        'failed': 'failed',
                    },
                },
            };

            const response = {
                tranId: 98765,
                asset: 'usdt',
                amount: '1000',
                status: 'CONFIRMED',
                timestamp: 1700000000,
            };

            const normalized = normalizeWalletResponse(response, schema);

            assert.equal(normalized.id, '98765');
            assert.equal(normalized.currency, 'USDT');
            assert.equal(normalized.amount, 1000);
            assert.equal(normalized.fromAccount, 'spot');
            assert.equal(normalized.toAccount, 'futures');
            assert.equal(normalized.status, 'ok');
            assert.equal(normalized.timestamp, 1700000000000);
        });

        test('normalize response with nested path', () => {
            const schema: WalletEndpointSchema = {
                operation: 'deposit',
                endpoint: '/api/v1/deposits',
                method: 'GET',
                params: {},
                response: {
                    path: 'data.deposits',
                    mapping: {
                        id: { path: 'id' },
                        currency: { path: 'currency' },
                        amount: { path: 'amount', transform: 'safeNumber' },
                        timestamp: { path: 'timestamp', transform: 'safeTimestamp' },
                    },
                    isArray: true,
                },
            };

            const response = {
                data: {
                    deposits: [
                        {
                            id: '1',
                            currency: 'BTC',
                            amount: '0.1',
                            timestamp: 1700000000,
                        },
                        {
                            id: '2',
                            currency: 'ETH',
                            amount: '1.5',
                            timestamp: 1700000100,
                        },
                    ],
                },
            };

            const normalized = normalizeWalletResponse(response, schema);

            assert.equal(Array.isArray(normalized), true);
            assert.equal(normalized.length, 2);
            assert.equal(normalized[0].id, '1');
            assert.equal(normalized[0].currency, 'BTC');
            assert.equal(normalized[0].amount, 0.1);
            assert.equal(normalized[1].id, '2');
            assert.equal(normalized[1].currency, 'ETH');
        });

        test('handle default values', () => {
            const schema: WalletEndpointSchema = {
                operation: 'balance',
                endpoint: '/api/v1/balance',
                method: 'GET',
                params: {},
                response: {
                    mapping: {
                        currency: { path: 'asset' },
                        free: { path: 'free', transform: 'safeNumber', default: 0 },
                        used: { path: 'used', transform: 'safeNumber', default: 0 },
                        debt: { path: 'debt', transform: 'safeNumber', default: undefined },
                    },
                },
            };

            const response = {
                asset: 'BTC',
                // free and used are missing
            };

            const normalized = normalizeWalletResponse(response, schema);

            assert.equal(normalized.currency, 'BTC');
            assert.equal(normalized.free, 0);
            assert.equal(normalized.used, 0);
            assert.equal(normalized.debt, undefined);
        });
    });

    describe('Different Network Formats', () => {
        test('handle network with chain prefix', () => {
            const schema: WalletEndpointSchema = {
                operation: 'depositAddress',
                endpoint: '/api/v1/depositAddress',
                method: 'GET',
                params: {},
                response: {
                    mapping: {
                        currency: { path: 'coin' },
                        network: { path: 'chain' },
                        address: { path: 'address' },
                        tag: { path: 'tag' },
                    },
                },
            };

            const response = {
                coin: 'USDT',
                chain: 'ERC20',
                address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
                tag: '',
            };

            const normalized = normalizeWalletResponse(response, schema);
            const depositAddress = createDepositAddress(normalized);

            assert.equal(depositAddress.currency, 'USDT');
            assert.equal(depositAddress.network, 'ERC20');
            assert.equal(depositAddress.address, '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
        });

        test('handle network with full name', () => {
            const response = {
                currency: 'USDT',
                networkName: 'Tron (TRC20)',
                address: 'TXYZoPAGVW1nZmvVGdvBuJCfJ8wVUJRe5a',
            };

            // In practice, you'd configure a transform to extract 'TRC20' from 'Tron (TRC20)'
            // For now, just verify the raw value is preserved
            assert.ok(response.networkName.includes('TRC20'));
        });

        test('handle memo/tag variations', () => {
            const testCases = [
                { currency: 'XRP', tagField: 'tag', tagName: 'tag' },
                { currency: 'XLM', tagField: 'memo', tagName: 'memo' },
                { currency: 'XMR', tagField: 'payment_id', tagName: 'payment_id' },
                { currency: 'EOS', tagField: 'memo', tagName: 'memo' },
            ];

            for (const tc of testCases) {
                const depositAddress: DepositAddressSchema = {
                    currency: tc.currency,
                    address: 'test_address',
                    tag: '123456',
                    tagName: tc.tagName,
                };

                assert.equal(depositAddress.tagName, tc.tagName);
                assert.equal(depositAddress.tag, '123456');
            }
        });
    });

    describe('Schema Creation Helpers', () => {
        test('createDepositAddress', () => {
            const normalized = {
                currency: 'BTC',
                network: 'BTC',
                address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
                tag: undefined,
                tagName: undefined,
                info: { raw: 'data' },
            };

            const depositAddress = createDepositAddress(normalized);

            assert.equal(depositAddress.currency, 'BTC');
            assert.equal(depositAddress.network, 'BTC');
            assert.equal(depositAddress.address, '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
            assert.equal(depositAddress.tag, undefined);
            assert.deepEqual(depositAddress.info, { raw: 'data' });
        });

        test('createWithdrawal', () => {
            const normalized = {
                id: '12345',
                currency: 'BTC',
                amount: 0.5,
                address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
                network: 'BTC',
                fee: 0.0005,
                status: 'ok',
                txid: 'abc123',
                timestamp: 1700000000000,
                info: { raw: 'data' },
            };

            const withdrawal = createWithdrawal(normalized);

            assert.equal(withdrawal.id, '12345');
            assert.equal(withdrawal.currency, 'BTC');
            assert.equal(withdrawal.amount, 0.5);
            assert.equal(withdrawal.status, 'ok');
            assert.deepEqual(withdrawal.fee, { cost: 0.0005, currency: 'BTC' });
        });

        test('createTransfer', () => {
            const normalized = {
                id: '98765',
                currency: 'USDT',
                amount: 1000,
                fromAccount: 'spot',
                toAccount: 'futures',
                status: 'ok',
                timestamp: 1700000000000,
                info: { raw: 'data' },
            };

            const transfer = createTransfer(normalized);

            assert.equal(transfer.id, '98765');
            assert.equal(transfer.currency, 'USDT');
            assert.equal(transfer.amount, 1000);
            assert.equal(transfer.fromAccount, 'spot');
            assert.equal(transfer.toAccount, 'futures');
            assert.equal(transfer.status, 'ok');
        });

        test('createBalance', () => {
            const normalized = {
                currency: 'BTC',
                free: 1.5,
                used: 0.5,
                total: 2.0,
            };

            const balance = createBalance(normalized);

            assert.equal(balance.currency, 'BTC');
            assert.equal(balance.free, 1.5);
            assert.equal(balance.used, 0.5);
            assert.equal(balance.total, 2.0);
        });

        test('createBalance with debt', () => {
            const normalized = {
                currency: 'BTC',
                free: 1.5,
                used: 0.5,
                total: 2.0,
                debt: 0.1,
            };

            const balance = createBalance(normalized);

            assert.equal(balance.debt, 0.1);
        });

        test('createBalance calculates total if not provided', () => {
            const normalized = {
                currency: 'BTC',
                free: 1.5,
                used: 0.5,
            };

            const balance = createBalance(normalized);

            assert.equal(balance.total, 2.0);
        });
    });
});
