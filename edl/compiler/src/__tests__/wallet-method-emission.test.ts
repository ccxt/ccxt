/**
 * Tests for Wallet Method Code Emission
 */

import { describe, test } from 'node:test';
import { strict as assert } from 'node:assert';
import type { WalletEndpointSchema } from '../schemas/wallet-operations.js';
import {
    emitTransferMethod,
    emitWithdrawalMethod,
    validateTransferConfig,
    validateWithdrawalConfig,
    type TransferMethodConfig,
    type WithdrawalMethodConfig,
} from '../generator/wallet-methods.js';
import { emit } from '../generator/emitter.js';

describe('Wallet Method Emission', () => {
    // Sample transfer endpoint schema
    const transferSchema: WalletEndpointSchema = {
        operation: 'transfer',
        endpoint: '/api/v3/transfer',
        method: 'POST',
        params: {
            currency: { type: 'string', required: true },
            amount: { type: 'number', required: true },
            fromAccount: { type: 'string', required: true },
            toAccount: { type: 'string', required: true },
        },
        response: {
            mapping: {
                id: { path: 'transferId', transform: 'safeString' },
                currency: { path: 'coin', transform: 'uppercase' },
                amount: { path: 'amount', transform: 'safeNumber' },
                fromAccount: { path: 'from', transform: 'lowercase' },
                toAccount: { path: 'to', transform: 'lowercase' },
                status: { path: 'status', default: 'pending' },
                timestamp: { path: 'timestamp', transform: 'safeTimestamp' },
            },
        },
        requiresAuth: true,
        cost: 1,
    };

    describe('Basic Transfer Method Generation', () => {
        test('should generate transfer method with default config', () => {
            const result = emitTransferMethod(transferSchema);

            assert.ok(result, 'Result should be defined');
            assert.ok(result.method, 'Method should be generated');
            assert.equal(result.methodName, 'transfer', 'Default method name should be "transfer"');
            assert.ok(result.imports.length > 0, 'Should include required imports');
        });

        test('should generate method with custom name', () => {
            const config: TransferMethodConfig = {
                methodName: 'executeTransfer',
            };

            const result = emitTransferMethod(transferSchema, config);

            assert.equal(result.methodName, 'executeTransfer', 'Should use custom method name');
            assert.equal(result.method.name, 'executeTransfer', 'Method AST should have custom name');
        });

        test('should generate async method', () => {
            const result = emitTransferMethod(transferSchema);

            assert.equal(result.method.isAsync, true, 'Method should be async');
        });

        test('should generate public method', () => {
            const result = emitTransferMethod(transferSchema);

            assert.equal(result.method.visibility, 'public', 'Method should be public');
        });

        test('should have correct return type', () => {
            const result = emitTransferMethod(transferSchema);

            assert.ok(result.method.returnType, 'Return type should be defined');
            assert.equal((result.method.returnType as any).kind, 'reference');
            assert.equal((result.method.returnType as any).name, 'Promise');
        });
    });

    describe('Method Parameters', () => {
        test('should generate required parameters', () => {
            const result = emitTransferMethod(transferSchema);

            assert.equal(result.method.params.length, 5, 'Should have 5 parameters');

            const paramNames = result.method.params.map(p => p.name);
            assert.deepEqual(
                paramNames,
                ['currency', 'amount', 'fromAccount', 'toAccount', 'params'],
                'Should have correct parameter names'
            );
        });

        test('should type currency parameter as string', () => {
            const result = emitTransferMethod(transferSchema);

            const currencyParam = result.method.params.find(p => p.name === 'currency');
            assert.ok(currencyParam, 'Currency parameter should exist');
            assert.ok(currencyParam.type, 'Currency parameter should have type');
            assert.equal((currencyParam.type as any).kind, 'primitive');
            assert.equal((currencyParam.type as any).type, 'string');
        });

        test('should type amount parameter as number', () => {
            const result = emitTransferMethod(transferSchema);

            const amountParam = result.method.params.find(p => p.name === 'amount');
            assert.ok(amountParam, 'Amount parameter should exist');
            assert.ok(amountParam.type, 'Amount parameter should have type');
            assert.equal((amountParam.type as any).kind, 'primitive');
            assert.equal((amountParam.type as any).type, 'number');
        });

        test('should type account parameters as AccountType', () => {
            const result = emitTransferMethod(transferSchema);

            const fromParam = result.method.params.find(p => p.name === 'fromAccount');
            const toParam = result.method.params.find(p => p.name === 'toAccount');

            assert.ok(fromParam, 'fromAccount parameter should exist');
            assert.equal((fromParam.type as any).kind, 'reference');
            assert.equal((fromParam.type as any).name, 'AccountType');

            assert.ok(toParam, 'toAccount parameter should exist');
            assert.equal((toParam.type as any).kind, 'reference');
            assert.equal((toParam.type as any).name, 'AccountType');
        });

        test('should have params parameter with default value', () => {
            const result = emitTransferMethod(transferSchema);

            const paramsParam = result.method.params.find(p => p.name === 'params');
            assert.ok(paramsParam, 'params parameter should exist');
            assert.ok(paramsParam.default, 'params should have default value');
        });
    });

    describe('Method Body Generation', () => {
        test('should generate validation statements', () => {
            const result = emitTransferMethod(transferSchema);

            assert.ok(result.method.body.length > 0, 'Method body should not be empty');

            // Check for validation variable
            const validationStmt = result.method.body.find(
                stmt => stmt.kind === 'variable' && (stmt as any).name === 'validation'
            );
            assert.ok(validationStmt, 'Should include validation statement');
        });

        test('should generate balance check when enabled', () => {
            const config: TransferMethodConfig = {
                includeBalanceCheck: true,
            };

            const result = emitTransferMethod(transferSchema, config);

            // Check for balance fetch statement
            const balanceStmt = result.method.body.find(
                stmt => stmt.kind === 'variable' && (stmt as any).name === 'balance'
            );
            assert.ok(balanceStmt, 'Should include balance check statement');
        });

        test('should omit balance check when disabled', () => {
            const config: TransferMethodConfig = {
                includeBalanceCheck: false,
            };

            const result = emitTransferMethod(transferSchema, config);

            // Check for absence of balance fetch
            const balanceStmt = result.method.body.find(
                stmt => stmt.kind === 'variable' && (stmt as any).name === 'balance'
            );
            assert.ok(!balanceStmt, 'Should not include balance check statement');
        });

        test('should generate API request statement', () => {
            const result = emitTransferMethod(transferSchema);

            // Check for response variable
            const responseStmt = result.method.body.find(
                stmt => stmt.kind === 'variable' && (stmt as any).name === 'response'
            );
            assert.ok(responseStmt, 'Should include API request statement');
        });

        test('should generate response normalization', () => {
            const result = emitTransferMethod(transferSchema);

            // Check for normalized variable
            const normalizedStmt = result.method.body.find(
                stmt => stmt.kind === 'variable' && (stmt as any).name === 'normalized'
            );
            assert.ok(normalizedStmt, 'Should include response normalization');
        });

        test('should generate transfer creation', () => {
            const result = emitTransferMethod(transferSchema);

            // Check for transfer variable
            const transferStmt = result.method.body.find(
                stmt => stmt.kind === 'variable' && (stmt as any).name === 'transfer'
            );
            assert.ok(transferStmt, 'Should include transfer creation');
        });

        test('should generate transaction recording when enabled', () => {
            const config: TransferMethodConfig = {
                recordTransaction: true,
            };

            const result = emitTransferMethod(transferSchema, config);

            // Check for recordTransaction call in if statement
            const hasRecordCall = result.method.body.some(stmt => {
                if (stmt.kind === 'if') {
                    const ifStmt = stmt as any;
                    return ifStmt.consequent?.some((s: any) =>
                        s.kind === 'expression' &&
                        s.expression?.kind === 'call' &&
                        s.expression?.callee?.property === 'recordTransaction'
                    );
                }
                return false;
            });

            assert.ok(hasRecordCall, 'Should include transaction recording');
        });

        test('should omit transaction recording when disabled', () => {
            const config: TransferMethodConfig = {
                recordTransaction: false,
            };

            const result = emitTransferMethod(transferSchema, config);

            // Check for absence of recordTransaction call
            const hasRecordCall = result.method.body.some(stmt => {
                if (stmt.kind === 'if') {
                    const ifStmt = stmt as any;
                    return ifStmt.consequent?.some((s: any) =>
                        s.kind === 'expression' &&
                        s.expression?.kind === 'call' &&
                        s.expression?.callee?.property === 'recordTransaction'
                    );
                }
                return false;
            });

            assert.ok(!hasRecordCall, 'Should not include transaction recording');
        });

        test('should generate return statement', () => {
            const result = emitTransferMethod(transferSchema);

            const returnStmt = result.method.body.find(stmt => stmt.kind === 'return');
            assert.ok(returnStmt, 'Should include return statement');
        });
    });

    describe('JSDoc Generation', () => {
        test('should generate JSDoc comment', () => {
            const result = emitTransferMethod(transferSchema);

            assert.ok(result.method.jsDoc, 'Method should have JSDoc');
            assert.ok(result.method.jsDoc.description, 'JSDoc should have description');
        });

        test('should document all parameters', () => {
            const result = emitTransferMethod(transferSchema);

            const paramTags = result.method.jsDoc!.tags.filter(tag => tag.tag === 'param');
            assert.equal(paramTags.length, 5, 'Should document all 5 parameters');
        });

        test('should document return type', () => {
            const result = emitTransferMethod(transferSchema);

            const returnTag = result.method.jsDoc!.tags.find(tag => tag.tag === 'returns');
            assert.ok(returnTag, 'Should document return type');
            assert.ok(returnTag.description, 'Return tag should have description');
        });
    });

    describe('Required Imports', () => {
        test('should include TransferSchema import', () => {
            const result = emitTransferMethod(transferSchema);

            assert.ok(
                result.imports.includes('TransferSchema'),
                'Should import TransferSchema'
            );
        });

        test('should include AccountType import', () => {
            const result = emitTransferMethod(transferSchema);

            assert.ok(
                result.imports.includes('AccountType'),
                'Should import AccountType'
            );
        });

        test('should include validation function imports', () => {
            const result = emitTransferMethod(transferSchema);

            assert.ok(
                result.imports.includes('validateTransferOperation'),
                'Should import validateTransferOperation'
            );
        });

        test('should include normalization function imports', () => {
            const result = emitTransferMethod(transferSchema);

            assert.ok(
                result.imports.includes('normalizeWalletResponse'),
                'Should import normalizeWalletResponse'
            );
            assert.ok(
                result.imports.includes('createTransfer'),
                'Should import createTransfer'
            );
        });
    });

    describe('Configuration Validation', () => {
        test('should validate correct transfer schema', () => {
            const result = validateTransferConfig(transferSchema, {});

            assert.equal(result.valid, true, 'Should be valid');
            assert.equal(result.errors.length, 0, 'Should have no errors');
        });

        test('should reject schema with wrong operation type', () => {
            const invalidSchema: WalletEndpointSchema = {
                ...transferSchema,
                operation: 'withdraw',
            };

            const result = validateTransferConfig(invalidSchema, {});

            assert.equal(result.valid, false, 'Should be invalid');
            assert.ok(
                result.errors.some(e => e.includes('operation')),
                'Should have operation error'
            );
        });

        test('should reject schema without endpoint', () => {
            const invalidSchema: WalletEndpointSchema = {
                ...transferSchema,
                endpoint: '',
            };

            const result = validateTransferConfig(invalidSchema, {});

            assert.equal(result.valid, false, 'Should be invalid');
            assert.ok(
                result.errors.some(e => e.includes('endpoint')),
                'Should have endpoint error'
            );
        });

        test('should reject schema without method', () => {
            const invalidSchema: any = {
                ...transferSchema,
                method: undefined,
            };

            const result = validateTransferConfig(invalidSchema, {});

            assert.equal(result.valid, false, 'Should be invalid');
            assert.ok(
                result.errors.some(e => e.includes('method')),
                'Should have method error'
            );
        });

        test('should reject schema with invalid HTTP method', () => {
            const invalidSchema: any = {
                ...transferSchema,
                method: 'INVALID',
            };

            const result = validateTransferConfig(invalidSchema, {});

            assert.equal(result.valid, false, 'Should be invalid');
            assert.ok(
                result.errors.some(e => e.includes('HTTP method')),
                'Should have HTTP method error'
            );
        });

        test('should reject schema without response mapping', () => {
            const invalidSchema: any = {
                ...transferSchema,
                response: undefined,
            };

            const result = validateTransferConfig(invalidSchema, {});

            assert.equal(result.valid, false, 'Should be invalid');
            assert.ok(
                result.errors.some(e => e.includes('response mapping')),
                'Should have response mapping error'
            );
        });
    });

    describe('Edge Cases', () => {
        test('should handle schema with minimal response mapping', () => {
            const minimalSchema: WalletEndpointSchema = {
                operation: 'transfer',
                endpoint: '/transfer',
                method: 'POST',
                params: {},
                response: {
                    mapping: {
                        id: { path: 'id' },
                    },
                },
            };

            const result = emitTransferMethod(minimalSchema);

            assert.ok(result, 'Should handle minimal schema');
            assert.ok(result.method, 'Should generate method');
        });

        test('should handle schema with response path', () => {
            const schemaWithPath: WalletEndpointSchema = {
                ...transferSchema,
                response: {
                    path: 'data.transfer',
                    mapping: transferSchema.response.mapping,
                },
            };

            const result = emitTransferMethod(schemaWithPath);

            assert.ok(result, 'Should handle schema with response path');
        });

        test('should handle schema with array response', () => {
            const arraySchema: WalletEndpointSchema = {
                ...transferSchema,
                response: {
                    mapping: transferSchema.response.mapping,
                    isArray: true,
                },
            };

            const result = emitTransferMethod(arraySchema);

            assert.ok(result, 'Should handle array response schema');
        });

        test('should handle complex response mapping with transforms', () => {
            const complexSchema: WalletEndpointSchema = {
                ...transferSchema,
                response: {
                    mapping: {
                        id: { path: 'transferId', transform: 'safeString' },
                        amount: { path: 'amt', transform: 'safeNumber' },
                        currency: { literal: 'BTC' },
                        status: { path: 'state', default: 'pending' },
                    },
                },
            };

            const result = emitTransferMethod(complexSchema);

            assert.ok(result, 'Should handle complex mapping');
        });

        test('should handle all configuration options together', () => {
            const config: TransferMethodConfig = {
                methodName: 'customTransfer',
                includeBalanceCheck: true,
                recordTransaction: true,
                customValidation: 'custom validation logic',
            };

            const result = emitTransferMethod(transferSchema, config);

            assert.equal(result.methodName, 'customTransfer');
            assert.ok(result.method.body.length > 0);
        });
    });

    describe('Response Mapping Edge Cases', () => {
        test('should handle mapping with literal values', () => {
            const schema: WalletEndpointSchema = {
                ...transferSchema,
                response: {
                    mapping: {
                        id: { path: 'id' },
                        status: { literal: 'ok' },
                    },
                },
            };

            const result = emitTransferMethod(schema);
            assert.ok(result, 'Should handle literal values in mapping');
        });

        test('should handle mapping with default values', () => {
            const schema: WalletEndpointSchema = {
                ...transferSchema,
                response: {
                    mapping: {
                        id: { path: 'id' },
                        status: { path: 'status', default: 'pending' },
                    },
                },
            };

            const result = emitTransferMethod(schema);
            assert.ok(result, 'Should handle default values in mapping');
        });

        test('should handle mapping with multiple transforms', () => {
            const schema: WalletEndpointSchema = {
                ...transferSchema,
                response: {
                    mapping: {
                        id: { path: 'id', transform: 'safeString' },
                        amount: { path: 'amount', transform: 'safeNumber' },
                        timestamp: { path: 'time', transform: 'safeTimestamp' },
                        currency: { path: 'coin', transform: 'uppercase' },
                    },
                },
            };

            const result = emitTransferMethod(schema);
            assert.ok(result, 'Should handle multiple transforms');
        });
    });

    describe('Account Type Support', () => {
        test('should support spot to margin transfer', () => {
            const result = emitTransferMethod(transferSchema);

            // Method should be generic enough to handle any account type
            assert.ok(result.method.params.find(p => p.name === 'fromAccount'));
            assert.ok(result.method.params.find(p => p.name === 'toAccount'));
        });

        test('should support futures to spot transfer', () => {
            const result = emitTransferMethod(transferSchema);

            // Method supports all AccountType values
            assert.ok(result, 'Should support all account types');
        });

        test('should support funding account transfers', () => {
            const result = emitTransferMethod(transferSchema);

            // AccountType includes 'funding'
            assert.ok(result, 'Should support funding account');
        });
    });

    // ============================================================
    // Withdrawal Method Generation Tests
    // ============================================================

    describe('Withdrawal Method Generation', () => {
        const withdrawalSchema: WalletEndpointSchema = {
            operation: 'withdraw',
            endpoint: '/api/v3/capital/withdraw/apply',
            method: 'POST',
            params: {
                currency: { type: 'string', required: true, location: 'body' },
                amount: { type: 'number', required: true, location: 'body' },
                address: { type: 'string', required: true, location: 'body' },
                tag: { type: 'string', required: false, location: 'body' },
                network: { type: 'string', required: false, location: 'body' },
            },
            response: {
                mapping: {
                    id: { path: 'id', transform: 'safeString' },
                    currency: { path: 'coin', transform: 'uppercase' },
                    amount: { path: 'amount', transform: 'safeNumber' },
                    address: { path: 'address' },
                    tag: { path: 'addressTag' },
                    network: { path: 'network' },
                    status: { path: 'status', transform: 'parseOrderStatus' },
                    txid: { path: 'txId' },
                    timestamp: { path: 'applyTime', transform: 'safeTimestamp' },
                },
            },
            cost: 1,
            requiresAuth: true,
        };

        test('should generate basic withdrawal method', () => {
            const result = emitWithdrawalMethod(withdrawalSchema);

            assert.ok(result, 'Result should be defined');
            assert.ok(result.method, 'Method should be generated');
            assert.equal(result.methodName, 'withdraw', 'Default method name should be "withdraw"');
            assert.ok(result.imports.length > 0, 'Should include required imports');
        });

        test('should generate correct method signature', () => {
            const result = emitWithdrawalMethod(withdrawalSchema);
            const method = result.method;

            assert.equal(method.kind, 'method', 'Should be a method');
            assert.equal(method.name, 'withdraw', 'Method name should be withdraw');
            assert.equal(method.isAsync, true, 'Method should be async');
            assert.equal(method.visibility, 'public', 'Method should be public');
        });

        test('should include required parameters', () => {
            const result = emitWithdrawalMethod(withdrawalSchema);
            const params = result.method.params;

            assert.ok(params.length >= 4, 'Should have at least 4 parameters');

            const currencyParam = params.find(p => p.name === 'currency');
            assert.ok(currencyParam, 'Should have currency parameter');
            assert.equal(currencyParam.type?.kind, 'primitive');

            const amountParam = params.find(p => p.name === 'amount');
            assert.ok(amountParam, 'Should have amount parameter');

            const addressParam = params.find(p => p.name === 'address');
            assert.ok(addressParam, 'Should have address parameter');
        });

        test('should include optional tag parameter when schema has tag', () => {
            const result = emitWithdrawalMethod(withdrawalSchema);
            const params = result.method.params;

            const tagParam = params.find(p => p.name === 'tag');
            assert.ok(tagParam, 'Should have optional tag parameter');
            assert.equal(tagParam.isOptional, true, 'Tag should be optional');
        });

        test('should include optional network parameter when schema has network', () => {
            const result = emitWithdrawalMethod(withdrawalSchema);
            const params = result.method.params;

            const networkParam = params.find(p => p.name === 'network');
            assert.ok(networkParam, 'Should have optional network parameter');
            assert.equal(networkParam.isOptional, true, 'Network should be optional');
        });

        test('should include params object parameter', () => {
            const result = emitWithdrawalMethod(withdrawalSchema);
            const params = result.method.params;

            const paramsParam = params.find(p => p.name === 'params');
            assert.ok(paramsParam, 'Should have params parameter');
            assert.ok(paramsParam.default, 'Params should have default value');
        });

        test('should have correct return type', () => {
            const result = emitWithdrawalMethod(withdrawalSchema);
            const returnType = result.method.returnType;

            assert.ok(returnType, 'Should have return type');
            assert.equal(returnType.kind, 'reference', 'Return type should be reference');
            if (returnType.kind === 'reference') {
                assert.equal(returnType.name, 'Promise', 'Should return Promise');
                assert.ok(returnType.typeArgs, 'Promise should have type args');
                if (returnType.typeArgs && returnType.typeArgs[0].kind === 'reference') {
                    assert.equal(returnType.typeArgs[0].name, 'WithdrawalSchema', 'Promise should resolve to WithdrawalSchema');
                }
            }
        });

        test('should include comprehensive JSDoc', () => {
            const result = emitWithdrawalMethod(withdrawalSchema);
            const jsDoc = result.method.jsDoc;

            assert.ok(jsDoc, 'Should have JSDoc');
            assert.ok(jsDoc.description, 'Should have description');
            assert.ok(jsDoc.description.includes('Withdraw'), 'Description should mention withdrawal');

            const paramTags = jsDoc.tags.filter(t => t.tag === 'param');
            assert.ok(paramTags.length >= 5, 'Should document all parameters');

            const returnsTag = jsDoc.tags.find(t => t.tag === 'returns');
            assert.ok(returnsTag, 'Should have returns tag');
            assert.ok(returnsTag.type?.includes('WithdrawalSchema'), 'Returns should mention WithdrawalSchema');

            const throwsTag = jsDoc.tags.find(t => t.tag === 'throws');
            assert.ok(throwsTag, 'Should have throws tag');
        });

        test('should generate required imports', () => {
            const result = emitWithdrawalMethod(withdrawalSchema);

            assert.ok(result.imports.includes('WithdrawalSchema'), 'Should import WithdrawalSchema');
            assert.ok(result.imports.includes('validateWithdrawalOperation'), 'Should import validation');
            assert.ok(result.imports.includes('normalizeWalletResponse'), 'Should import normalization');
            assert.ok(result.imports.includes('createWithdrawal'), 'Should import creation function');
            assert.ok(result.imports.includes('TransactionParser'), 'Should import parser');
        });

        test('should generate validation logic in method body', () => {
            const result = emitWithdrawalMethod(withdrawalSchema);
            const body = result.method.body;

            assert.ok(body.length > 0, 'Method body should not be empty');

            const operationStmt = body.find(
                s => s.kind === 'variable' && (s as any).name === 'operation'
            );
            assert.ok(operationStmt, 'Should create operation object');

            const validationStmt = body.find(
                s => s.kind === 'variable' && (s as any).name === 'validation'
            );
            assert.ok(validationStmt, 'Should perform validation');

            const errorHandling = body.find(s => s.kind === 'if');
            assert.ok(errorHandling, 'Should have error handling');
        });

        test('should generate API request call', () => {
            const result = emitWithdrawalMethod(withdrawalSchema);
            const body = result.method.body;

            const responseStmt = body.find(
                s => s.kind === 'variable' && (s as any).name === 'response'
            );
            assert.ok(responseStmt, 'Should create API request');

            const value = (responseStmt as any).value;
            assert.equal(value.kind, 'await', 'Request should be awaited');
        });

        test('should generate transaction parser creation', () => {
            const result = emitWithdrawalMethod(withdrawalSchema);
            const body = result.method.body;

            const parserStmt = body.find(
                s => s.kind === 'variable' && (s as any).name === 'parser'
            );
            assert.ok(parserStmt, 'Should create transaction parser');
        });

        test('should generate response normalization', () => {
            const result = emitWithdrawalMethod(withdrawalSchema);
            const body = result.method.body;

            const normalizedStmt = body.find(
                s => s.kind === 'variable' && (s as any).name === 'normalized'
            );
            assert.ok(normalizedStmt, 'Should normalize response');
        });

        test('should generate return statement', () => {
            const result = emitWithdrawalMethod(withdrawalSchema);
            const body = result.method.body;

            const returnStmt = body.find(s => s.kind === 'return');
            assert.ok(returnStmt, 'Should have return statement');
        });

        test('should support custom method name', () => {
            const config: WithdrawalMethodConfig = {
                methodName: 'customWithdraw',
            };

            const result = emitWithdrawalMethod(withdrawalSchema, config);

            assert.equal(result.methodName, 'customWithdraw');
            assert.equal(result.method.name, 'customWithdraw');
        });

        test('should support historical matching when enabled', () => {
            const schemaWithArray: WalletEndpointSchema = {
                ...withdrawalSchema,
                response: {
                    ...withdrawalSchema.response,
                    isArray: true,
                },
            };

            const config: WithdrawalMethodConfig = {
                includeHistoricalMatching: true,
            };

            const result = emitWithdrawalMethod(schemaWithArray, config);

            assert.ok(result.imports.includes('matchHistoricalTransaction'), 'Should import matching function');

            const body = result.method.body;
            const matchedStmt = body.find(
                s => s.kind === 'variable' && (s as any).name === 'matched'
            );
            assert.ok(matchedStmt, 'Should include matching logic');
        });

        test('should emit valid TypeScript code', () => {
            const result = emitWithdrawalMethod(withdrawalSchema);

            const tsFile = {
                imports: [],
                statements: [{
                    kind: 'class' as const,
                    name: 'Exchange',
                    members: [result.method],
                    isExport: true,
                }],
            };

            const code = emit(tsFile);

            assert.ok(code, 'Should generate code');
            assert.ok(code.includes('async withdraw'), 'Should have async withdraw method');
            assert.ok(code.includes('currency'), 'Should include currency parameter');
            assert.ok(code.includes('amount'), 'Should include amount parameter');
            assert.ok(code.includes('address'), 'Should include address parameter');
            assert.ok(code.includes('Promise<WithdrawalSchema>'), 'Should have correct return type');
        });

        test('should handle schema without optional parameters', () => {
            const minimalSchema: WalletEndpointSchema = {
                operation: 'withdraw',
                endpoint: '/withdraw',
                method: 'POST',
                params: {
                    currency: { type: 'string', required: true },
                    amount: { type: 'number', required: true },
                    address: { type: 'string', required: true },
                },
                response: {
                    mapping: {
                        id: { path: 'id' },
                    },
                },
            };

            const result = emitWithdrawalMethod(minimalSchema);

            assert.ok(result.method);
            const params = result.method.params;

            // Should not have tag or network parameters
            const tagParam = params.find(p => p.name === 'tag');
            assert.ok(!tagParam, 'Should not include tag parameter');

            const networkParam = params.find(p => p.name === 'network');
            assert.ok(!networkParam, 'Should not include network parameter');
        });
    });

    // ============================================================
    // Withdrawal Configuration Validation Tests
    // ============================================================

    describe('Withdrawal Configuration Validation', () => {
        test('should validate correct withdrawal schema', () => {
            const schema: WalletEndpointSchema = {
                operation: 'withdraw',
                endpoint: '/withdraw',
                method: 'POST',
                params: {
                    currency: { type: 'string', required: true },
                    amount: { type: 'number', required: true },
                    address: { type: 'string', required: true },
                },
                response: {
                    mapping: {
                        id: { path: 'id' },
                    },
                },
            };

            const result = validateWithdrawalConfig(schema, {});

            assert.equal(result.valid, true, 'Schema should be valid');
            assert.equal(result.errors.length, 0, 'Should have no errors');
        });

        test('should reject schema with wrong operation type', () => {
            const schema: WalletEndpointSchema = {
                operation: 'transfer' as any,
                endpoint: '/withdraw',
                method: 'POST',
                params: {
                    currency: { type: 'string', required: true },
                    amount: { type: 'number', required: true },
                    address: { type: 'string', required: true },
                },
                response: {
                    mapping: {},
                },
            };

            const result = validateWithdrawalConfig(schema, {});

            assert.equal(result.valid, false, 'Schema should be invalid');
            assert.ok(result.errors.some(e => e.includes('withdraw')), 'Should mention correct operation');
        });

        test('should reject schema without endpoint', () => {
            const schema: WalletEndpointSchema = {
                operation: 'withdraw',
                endpoint: '',
                method: 'POST',
                params: {
                    currency: { type: 'string', required: true },
                    amount: { type: 'number', required: true },
                    address: { type: 'string', required: true },
                },
                response: {
                    mapping: {},
                },
            };

            const result = validateWithdrawalConfig(schema, {});

            assert.equal(result.valid, false);
            assert.ok(result.errors.some(e => e.includes('endpoint')));
        });

        test('should reject schema with invalid HTTP method', () => {
            const schema: WalletEndpointSchema = {
                operation: 'withdraw',
                endpoint: '/withdraw',
                method: 'INVALID' as any,
                params: {
                    currency: { type: 'string', required: true },
                    amount: { type: 'number', required: true },
                    address: { type: 'string', required: true },
                },
                response: {
                    mapping: {},
                },
            };

            const result = validateWithdrawalConfig(schema, {});

            assert.equal(result.valid, false);
            assert.ok(result.errors.some(e => e.includes('HTTP method')));
        });

        test('should reject schema missing required parameters', () => {
            const schema: WalletEndpointSchema = {
                operation: 'withdraw',
                endpoint: '/withdraw',
                method: 'POST',
                params: {
                    currency: { type: 'string', required: true },
                    // Missing amount and address
                },
                response: {
                    mapping: {},
                },
            };

            const result = validateWithdrawalConfig(schema, {});

            assert.equal(result.valid, false);
            assert.ok(result.errors.some(e => e.includes('amount')), 'Should report missing amount');
            assert.ok(result.errors.some(e => e.includes('address')), 'Should report missing address');
        });
    });

    // ============================================================
    // Integration Tests for Withdrawal Methods
    // ============================================================

    describe('Withdrawal Integration Tests', () => {
        test('should generate withdrawal method for Binance-style API', () => {
            const binanceWithdrawal: WalletEndpointSchema = {
                operation: 'withdraw',
                endpoint: '/sapi/v1/capital/withdraw/apply',
                method: 'POST',
                params: {
                    coin: { type: 'string', required: true },
                    address: { type: 'string', required: true },
                    amount: { type: 'number', required: true },
                    network: { type: 'string', required: false },
                    addressTag: { type: 'string', required: false },
                },
                response: {
                    mapping: {
                        id: { path: 'id' },
                        currency: { path: 'coin' },
                        amount: { path: 'amount', transform: 'safeNumber' },
                        address: { path: 'address' },
                        tag: { path: 'addressTag' },
                        network: { path: 'network' },
                        status: { literal: 'pending' },
                        timestamp: { compute: 'Date.now()' },
                    },
                },
            };

            const result = emitWithdrawalMethod(binanceWithdrawal, {
                exchangeName: 'binance',
            });

            assert.ok(result);
            assert.equal(result.methodName, 'withdraw');

            const code = emit({
                imports: [],
                statements: [{
                    kind: 'class' as const,
                    name: 'Exchange',
                    members: [result.method],
                    isExport: true,
                }],
            });
            assert.ok(code.length > 0);
            assert.ok(code.includes('withdraw'));
        });

        test('should generate complete compilable TypeScript code', () => {
            const schema: WalletEndpointSchema = {
                operation: 'withdraw',
                endpoint: '/v1/withdraw',
                method: 'POST',
                params: {
                    currency: { type: 'string', required: true },
                    amount: { type: 'number', required: true },
                    address: { type: 'string', required: true },
                    network: { type: 'string', required: false },
                },
                response: {
                    mapping: {
                        id: { path: 'id' },
                        currency: { path: 'currency' },
                        amount: { path: 'amount' },
                        address: { path: 'address' },
                        network: { path: 'network' },
                        status: { literal: 'pending' },
                        timestamp: { compute: 'Date.now()' },
                    },
                },
            };

            const result = emitWithdrawalMethod(schema);
            const code = emit({
                imports: [],
                statements: [{
                    kind: 'class' as const,
                    name: 'Exchange',
                    members: [result.method],
                    isExport: true,
                }],
            });

            // Verify complete code structure
            assert.ok(code.includes('async withdraw('), 'Should have async withdraw method');
            assert.ok(code.includes('currency: string'), 'Should have currency parameter');
            assert.ok(code.includes('amount: number'), 'Should have amount parameter');
            assert.ok(code.includes('address: string'), 'Should have address parameter');
            assert.ok(code.includes('Promise<WithdrawalSchema>'), 'Should have correct return type');
            assert.ok(code.includes('validateWithdrawalOperation'), 'Should include validation');
            assert.ok(code.includes('normalizeWalletResponse'), 'Should include normalization');
            assert.ok(code.includes('createWithdrawal'), 'Should include withdrawal creation');
            assert.ok(code.includes('return'), 'Should have return statement');
        });
    });
});
