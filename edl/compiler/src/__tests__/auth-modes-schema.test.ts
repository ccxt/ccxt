/**
 * Tests for Authentication Modes Schema
 */

import { describe, test } from 'node:test';
import { strict as assert } from 'node:assert';
import type {
    AuthMode,
    EndpointAuthConfig,
    AuthModeSchema,
    CredentialRequirements,
    CustomAuthConfig,
    EndpointWithAuthentication,
} from '../schemas/auth-modes.js';
import {
    requiresAuth,
    isSignatureBased,
    isTokenBased,
    isValidAuthConfig,
    getDefaultCredentials,
    resolveAuthConfig,
    resolveAuthenticationRequirement,
    attachAuthentication,
    mergeCredentials,
    validateAuthModeSchema,
    validateAuthConfig,
    validateCredentials,
    createAuthModeSchema,
    requiresCredential,
    getRequiredCredentials,
} from '../schemas/auth-modes.js';

describe('Auth Mode Types', () => {
    test('all auth modes are valid types', () => {
        const modes: AuthMode[] = ['none', 'apiKey', 'signature', 'oauth', 'basic', 'bearer', 'custom'];

        modes.forEach(mode => {
            const config: EndpointAuthConfig = { mode };
            assert.equal(config.mode, mode);
        });
    });

    test('endpoint auth config with mode only', () => {
        const config: EndpointAuthConfig = {
            mode: 'signature',
        };
        assert.equal(config.mode, 'signature');
        assert.equal(config.required, undefined);
        assert.equal(config.credentials, undefined);
    });

    test('endpoint auth config with all fields', () => {
        const config: EndpointAuthConfig = {
            mode: 'signature',
            required: true,
            credentials: {
                apiKey: true,
                secret: true,
            },
            permissions: ['trade', 'withdraw'],
            headers: {
                'X-Custom-Auth': 'value',
            },
        };

        assert.equal(config.mode, 'signature');
        assert.equal(config.required, true);
        assert.ok(config.credentials);
        assert.equal(config.credentials.apiKey, true);
        assert.equal(config.credentials.secret, true);
        assert.ok(config.permissions);
        assert.equal(config.permissions.length, 2);
        assert.ok(config.headers);
        assert.equal(config.headers['X-Custom-Auth'], 'value');
    });

    test('custom auth config structure', () => {
        const customConfig: CustomAuthConfig = {
            scheme: 'custom-hmac',
            template: 'HMAC {signature}',
            headerName: 'X-Custom-Signature',
            config: {
                algorithm: 'sha256',
            },
        };

        assert.equal(customConfig.scheme, 'custom-hmac');
        assert.equal(customConfig.template, 'HMAC {signature}');
        assert.equal(customConfig.headerName, 'X-Custom-Signature');
        assert.ok(customConfig.config);
        assert.equal(customConfig.config.algorithm, 'sha256');
    });
});

describe('Auth Mode Type Guards', () => {
    test('requiresAuth returns false for none mode', () => {
        assert.equal(requiresAuth('none'), false);
    });

    test('requiresAuth returns true for authenticated modes', () => {
        assert.equal(requiresAuth('apiKey'), true);
        assert.equal(requiresAuth('signature'), true);
        assert.equal(requiresAuth('oauth'), true);
        assert.equal(requiresAuth('basic'), true);
        assert.equal(requiresAuth('bearer'), true);
        assert.equal(requiresAuth('custom'), true);
    });

    test('isSignatureBased identifies signature mode', () => {
        assert.equal(isSignatureBased('signature'), true);
        assert.equal(isSignatureBased('apiKey'), false);
        assert.equal(isSignatureBased('oauth'), false);
    });

    test('isTokenBased identifies token-based modes', () => {
        assert.equal(isTokenBased('oauth'), true);
        assert.equal(isTokenBased('bearer'), true);
        assert.equal(isTokenBased('apiKey'), false);
        assert.equal(isTokenBased('signature'), false);
        assert.equal(isTokenBased('basic'), false);
    });

    test('isValidAuthConfig validates config with mode', () => {
        const config: EndpointAuthConfig = { mode: 'signature' };
        assert.equal(isValidAuthConfig(config), true);
    });

    test('isValidAuthConfig rejects none mode with credentials', () => {
        const config: EndpointAuthConfig = {
            mode: 'none',
            credentials: { apiKey: true },
        };
        assert.equal(isValidAuthConfig(config), false);
    });

    test('isValidAuthConfig rejects none mode with permissions', () => {
        const config: EndpointAuthConfig = {
            mode: 'none',
            permissions: ['read'],
        };
        assert.equal(isValidAuthConfig(config), false);
    });
});

describe('Credential Requirements', () => {
    test('credential requirements with standard fields', () => {
        const creds: CredentialRequirements = {
            apiKey: true,
            secret: true,
            uid: false,
        };

        assert.equal(creds.apiKey, true);
        assert.equal(creds.secret, true);
        assert.equal(creds.uid, false);
    });

    test('credential requirements with custom fields', () => {
        const creds: CredentialRequirements = {
            apiKey: true,
            custom: {
                accountId: true,
                subAccountId: false,
            },
        };

        assert.equal(creds.apiKey, true);
        assert.ok(creds.custom);
        assert.equal(creds.custom.accountId, true);
        assert.equal(creds.custom.subAccountId, false);
    });

    test('getDefaultCredentials for none mode', () => {
        const creds = getDefaultCredentials('none');
        assert.deepEqual(creds, {});
    });

    test('getDefaultCredentials for apiKey mode', () => {
        const creds = getDefaultCredentials('apiKey');
        assert.equal(creds.apiKey, true);
    });

    test('getDefaultCredentials for signature mode', () => {
        const creds = getDefaultCredentials('signature');
        assert.equal(creds.apiKey, true);
        assert.equal(creds.secret, true);
    });

    test('getDefaultCredentials for oauth mode', () => {
        const creds = getDefaultCredentials('oauth');
        assert.equal(creds.token, true);
        assert.equal(creds.refreshToken, false);
    });

    test('getDefaultCredentials for basic mode', () => {
        const creds = getDefaultCredentials('basic');
        assert.equal(creds.login, true);
        assert.equal(creds.password, true);
    });

    test('getDefaultCredentials for bearer mode', () => {
        const creds = getDefaultCredentials('bearer');
        assert.equal(creds.token, true);
    });

    test('getDefaultCredentials for custom mode', () => {
        const creds = getDefaultCredentials('custom');
        assert.deepEqual(creds, {});
    });
});

describe('Auth Config Resolution', () => {
    test('resolveAuthConfig returns endpoint-specific config', () => {
        const schema: AuthModeSchema = {
            default: { mode: 'signature' },
            endpoints: {
                'fetchMarkets': { mode: 'none' },
            },
        };

        const config = resolveAuthConfig(schema, 'fetchMarkets');
        assert.ok(config);
        assert.equal(config.mode, 'none');
    });

    test('resolveAuthConfig falls back to default', () => {
        const schema: AuthModeSchema = {
            default: { mode: 'signature' },
            endpoints: {
                'fetchMarkets': { mode: 'none' },
            },
        };

        const config = resolveAuthConfig(schema, 'createOrder');
        assert.ok(config);
        assert.equal(config.mode, 'signature');
    });

    test('resolveAuthConfig returns undefined when no config', () => {
        const schema: AuthModeSchema = {};
        const config = resolveAuthConfig(schema, 'fetchMarkets');
        assert.equal(config, undefined);
    });
});

describe('Credential Merging', () => {
    test('mergeCredentials combines multiple sources', () => {
        const creds1: CredentialRequirements = {
            apiKey: true,
            secret: true,
        };
        const creds2: CredentialRequirements = {
            uid: true,
        };

        const merged = mergeCredentials(creds1, creds2);
        assert.equal(merged.apiKey, true);
        assert.equal(merged.secret, true);
        assert.equal(merged.uid, true);
    });

    test('mergeCredentials later sources override earlier', () => {
        const creds1: CredentialRequirements = {
            apiKey: true,
            secret: false,
        };
        const creds2: CredentialRequirements = {
            secret: true,
        };

        const merged = mergeCredentials(creds1, creds2);
        assert.equal(merged.apiKey, true);
        assert.equal(merged.secret, true);
    });

    test('mergeCredentials merges custom fields', () => {
        const creds1: CredentialRequirements = {
            custom: {
                field1: true,
            },
        };
        const creds2: CredentialRequirements = {
            custom: {
                field2: true,
            },
        };

        const merged = mergeCredentials(creds1, creds2);
        assert.ok(merged.custom);
        assert.equal(merged.custom.field1, true);
        assert.equal(merged.custom.field2, true);
    });
});

describe('Schema Validation', () => {
    test('validateAuthModeSchema accepts valid schema', () => {
        const schema: AuthModeSchema = {
            default: {
                mode: 'signature',
                required: true,
                credentials: {
                    apiKey: true,
                    secret: true,
                },
            },
        };

        const errors = validateAuthModeSchema(schema);
        assert.equal(errors.length, 0);
    });

    test('validateAuthModeSchema validates endpoint configs', () => {
        const schema: AuthModeSchema = {
            endpoints: {
                'fetchMarkets': { mode: 'none' },
                'createOrder': { mode: 'signature' },
            },
        };

        const errors = validateAuthModeSchema(schema);
        assert.equal(errors.length, 0);
    });

    test('validateAuthConfig detects invalid mode', () => {
        const config: EndpointAuthConfig = {
            mode: 'invalid-mode' as AuthMode,
        };

        const errors = validateAuthConfig('test', config);
        assert.ok(errors.length > 0);
        assert.ok(errors[0].includes('Invalid authentication mode'));
    });

    test('validateAuthConfig detects none mode with credentials', () => {
        const config: EndpointAuthConfig = {
            mode: 'none',
            credentials: { apiKey: true },
        };

        const errors = validateAuthConfig('test', config);
        assert.ok(errors.length > 0);
        assert.ok(errors[0].includes('should not have credential requirements'));
    });

    test('validateAuthConfig detects none mode with permissions', () => {
        const config: EndpointAuthConfig = {
            mode: 'none',
            permissions: ['read'],
        };

        const errors = validateAuthConfig('test', config);
        assert.ok(errors.length > 0);
        assert.ok(errors[0].includes('should not have permission requirements'));
    });

    test('validateAuthConfig requires custom config for custom mode', () => {
        const config: EndpointAuthConfig = {
            mode: 'custom',
        };

        const errors = validateAuthConfig('test', config);
        assert.ok(errors.length > 0);
        assert.ok(errors[0].includes('must provide custom configuration'));
    });

    test('validateAuthConfig requires scheme for custom mode', () => {
        const config: EndpointAuthConfig = {
            mode: 'custom',
            custom: {
                scheme: '',
            },
        };

        const errors = validateAuthConfig('test', config);
        assert.ok(errors.length > 0);
        assert.ok(errors[0].includes('must specify a scheme name'));
    });

    test('validateCredentials detects invalid field types', () => {
        const creds: CredentialRequirements = {
            apiKey: 'yes' as any, // Invalid: should be boolean
        };

        const errors = validateCredentials('test', creds);
        assert.ok(errors.length > 0);
        assert.ok(errors[0].includes('must be boolean'));
    });
});

describe('Schema Creation', () => {
    test('createAuthModeSchema with default signature mode', () => {
        const schema = createAuthModeSchema();

        assert.ok(schema.default);
        assert.equal(schema.default.mode, 'signature');
        assert.equal(schema.default.required, true);
        assert.ok(schema.default.credentials);
        assert.equal(schema.default.credentials.apiKey, true);
        assert.equal(schema.default.credentials.secret, true);
    });

    test('createAuthModeSchema with custom default mode', () => {
        const schema = createAuthModeSchema('apiKey');

        assert.ok(schema.default);
        assert.equal(schema.default.mode, 'apiKey');
        assert.equal(schema.default.required, true);
        assert.ok(schema.default.credentials);
        assert.equal(schema.default.credentials.apiKey, true);
    });

    test('createAuthModeSchema with none mode', () => {
        const schema = createAuthModeSchema('none');

        assert.ok(schema.default);
        assert.equal(schema.default.mode, 'none');
        assert.equal(schema.default.required, false);
    });

    test('createAuthModeSchema with endpoint overrides', () => {
        const overrides = {
            'fetchMarkets': { mode: 'none' as AuthMode },
            'createOrder': { mode: 'signature' as AuthMode },
        };

        const schema = createAuthModeSchema('apiKey', overrides);

        assert.ok(schema.default);
        assert.equal(schema.default.mode, 'apiKey');
        assert.ok(schema.endpoints);
        assert.equal(schema.endpoints['fetchMarkets'].mode, 'none');
        assert.equal(schema.endpoints['createOrder'].mode, 'signature');
    });
});

describe('Credential Checking', () => {
    test('requiresCredential checks for specific credential', () => {
        const config: EndpointAuthConfig = {
            mode: 'signature',
            credentials: {
                apiKey: true,
                secret: true,
            },
        };

        assert.equal(requiresCredential(config, 'apiKey'), true);
        assert.equal(requiresCredential(config, 'secret'), true);
        assert.equal(requiresCredential(config, 'uid'), false);
    });

    test('requiresCredential uses defaults when no explicit credentials', () => {
        const config: EndpointAuthConfig = {
            mode: 'signature',
        };

        assert.equal(requiresCredential(config, 'apiKey'), true);
        assert.equal(requiresCredential(config, 'secret'), true);
        assert.equal(requiresCredential(config, 'token'), false);
    });

    test('requiresCredential checks custom credentials', () => {
        const config: EndpointAuthConfig = {
            mode: 'custom',
            credentials: {
                custom: {
                    accountId: true,
                },
            },
        };

        assert.equal(requiresCredential(config, 'custom'), true);
    });

    test('getRequiredCredentials lists all required credentials', () => {
        const config: EndpointAuthConfig = {
            mode: 'signature',
            credentials: {
                apiKey: true,
                secret: true,
                uid: false,
            },
        };

        const required = getRequiredCredentials(config);
        assert.ok(required.includes('apiKey'));
        assert.ok(required.includes('secret'));
        assert.ok(!required.includes('uid'));
    });

    test('getRequiredCredentials includes custom credentials', () => {
        const config: EndpointAuthConfig = {
            mode: 'custom',
            credentials: {
                apiKey: true,
                custom: {
                    accountId: true,
                    subAccountId: false,
                },
            },
        };

        const required = getRequiredCredentials(config);
        assert.ok(required.includes('apiKey'));
        assert.ok(required.includes('custom.accountId'));
        assert.ok(!required.includes('custom.subAccountId'));
    });

    test('getRequiredCredentials uses defaults', () => {
        const config: EndpointAuthConfig = {
            mode: 'oauth',
        };

        const required = getRequiredCredentials(config);
        assert.ok(required.includes('token'));
        assert.ok(!required.includes('refreshToken'));
    });
});

describe('Authentication resolution', () => {
    test('resolveAuthConfig applies defaults and global settings', () => {
        const schema: AuthModeSchema = {
            default: {
                mode: 'signature',
            },
            global: {
                credentials: {
                    uid: true,
                },
                headers: {
                    'X-Global': 'global',
                },
            },
            endpoints: {
                special: {
                    mode: 'apiKey',
                    headers: {
                        'X-Local': 'local',
                    },
                },
            },
        };

        const config = resolveAuthConfig(schema, 'special');
        assert.ok(config);
        assert.equal(config.required, true);
        assert.ok(config.credentials);
        assert.equal(config.credentials.apiKey, true);
        assert.equal(config.credentials.uid, true);
        assert.ok(config.headers);
        assert.equal(config.headers['X-Global'], 'global');
        assert.equal(config.headers['X-Local'], 'local');
    });

    test('resolveAuthenticationRequirement produces requirement shape', () => {
        const schema: AuthModeSchema = {
            default: {
                mode: 'signature',
            },
        };

        const requirement = resolveAuthenticationRequirement(schema, 'createOrder');
        assert.ok(requirement);
        assert.equal(requirement?.required, true);
        assert.ok(requirement?.schemes?.includes('signature'));
        assert.ok(requirement?.credentials?.includes('apiKey'));
        assert.ok(requirement?.credentials?.includes('secret'));
    });

    test('attachAuthentication augments endpoints', () => {
        const schema: AuthModeSchema = {
            endpoints: {
                privateMethod: { mode: 'apiKey' },
            },
        };

        const endpoints: EndpointWithAuthentication[] = [
            { id: 'privateMethod' },
            { id: 'publicMethod', authentication: { required: false } },
        ];

        const result = attachAuthentication(schema, endpoints);
        const privateEndpoint = result.find(ep => ep.id === 'privateMethod');
        assert.ok(privateEndpoint?.authentication);
        assert.equal(privateEndpoint?.authentication?.required, true);
        assert.ok(privateEndpoint?.authentication?.schemes?.includes('apiKey'));

        const publicEndpoint = result.find(ep => ep.id === 'publicMethod');
        assert.equal(publicEndpoint?.authentication, endpoints[1].authentication);
    });
});

describe('Auth Mode Schema Structure', () => {
    test('complete schema with all fields', () => {
        const schema: AuthModeSchema = {
            default: {
                mode: 'signature',
                required: true,
                credentials: {
                    apiKey: true,
                    secret: true,
                },
            },
            endpoints: {
                'fetchMarkets': {
                    mode: 'none',
                },
                'fetchTicker': {
                    mode: 'apiKey',
                    required: true,
                },
                'createOrder': {
                    mode: 'signature',
                    required: true,
                    permissions: ['trade'],
                },
            },
            global: {
                headers: {
                    'User-Agent': 'CCXT/1.0',
                },
                credentials: {
                    apiKey: true,
                },
            },
        };

        assert.ok(schema.default);
        assert.equal(schema.default.mode, 'signature');
        assert.ok(schema.endpoints);
        assert.equal(Object.keys(schema.endpoints).length, 3);
        assert.ok(schema.global);
        assert.ok(schema.global.headers);
        assert.ok(schema.global.credentials);
    });
});
