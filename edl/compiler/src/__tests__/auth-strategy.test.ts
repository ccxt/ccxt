/**
 * Authentication Strategy Tests
 *
 * Tests for the comprehensive authentication strategy enum and related utilities
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
    type AuthStrategy,
    type AuthStrategyConfig,
    getAuthStrategyConfig,
    getAllAuthStrategies,
    strategyToMode,
    strategyRequiresSecret,
    strategyRequiresPrivateKey,
    getStrategiesForMode,
    findAuthStrategy,
    isStrategyCompatibleWithMode,
    getStrategyCredentials,
} from '../schemas/auth-modes.js';

describe('Auth Strategy Enum', () => {
    it('should have all expected strategies', () => {
        const strategies = getAllAuthStrategies();

        assert.ok(strategies.includes('HMAC_SHA256'));
        assert.ok(strategies.includes('HMAC_SHA512'));
        assert.ok(strategies.includes('HMAC_SHA384'));
        assert.ok(strategies.includes('JWT_RS256'));
        assert.ok(strategies.includes('JWT_ES256'));
        assert.ok(strategies.includes('EDDSA_ED25519'));
        assert.ok(strategies.includes('ECDSA_SECP256K1'));
        assert.ok(strategies.includes('RSA_SHA256'));
        assert.ok(strategies.includes('API_KEY_ONLY'));
        assert.ok(strategies.includes('BEARER_TOKEN'));
        assert.ok(strategies.includes('BASIC_AUTH'));
        assert.ok(strategies.includes('NONE'));
        assert.ok(strategies.includes('CUSTOM'));
    });

    it('should get config for HMAC_SHA256', () => {
        const config = getAuthStrategyConfig('HMAC_SHA256');

        assert.equal(config.strategy, 'HMAC_SHA256');
        assert.equal(config.hashAlgorithm, 'SHA256');
        assert.equal(config.encoding, 'hex');
        assert.ok(config.placement.includes('header'));
        assert.equal(config.requiresTimestamp, true);
        assert.ok(config.metadata?.examples?.includes('Binance'));
    });

    it('should get config for JWT_RS256', () => {
        const config = getAuthStrategyConfig('JWT_RS256');

        assert.equal(config.strategy, 'JWT_RS256');
        assert.equal(config.hashAlgorithm, 'SHA256');
        assert.equal(config.encoding, 'base64url');
        assert.equal(config.requiresPrivateKey, true);
        assert.ok(config.metadata?.examples?.includes('Coinbase Cloud'));
    });

    it('should get config for EDDSA_ED25519', () => {
        const config = getAuthStrategyConfig('EDDSA_ED25519');

        assert.equal(config.strategy, 'EDDSA_ED25519');
        assert.equal(config.encoding, 'hex');
        assert.equal(config.requiresPrivateKey, true);
        assert.equal(config.requiresTimestamp, true);
        assert.ok(config.metadata?.examples?.includes('Backpack'));
    });

    it('should map strategy to correct mode', () => {
        assert.equal(strategyToMode('HMAC_SHA256'), 'signature');
        assert.equal(strategyToMode('HMAC_SHA512'), 'signature');
        assert.equal(strategyToMode('JWT_RS256'), 'oauth');
        assert.equal(strategyToMode('JWT_HS256'), 'oauth');
        assert.equal(strategyToMode('EDDSA_ED25519'), 'signature');
        assert.equal(strategyToMode('ECDSA_SECP256K1'), 'signature');
        assert.equal(strategyToMode('RSA_SHA256'), 'signature');
        assert.equal(strategyToMode('API_KEY_ONLY'), 'apiKey');
        assert.equal(strategyToMode('BEARER_TOKEN'), 'bearer');
        assert.equal(strategyToMode('BASIC_AUTH'), 'basic');
        assert.equal(strategyToMode('NONE'), 'none');
        assert.equal(strategyToMode('CUSTOM'), 'custom');
    });

    it('should identify strategies that require secret', () => {
        assert.equal(strategyRequiresSecret('HMAC_SHA256'), true);
        assert.equal(strategyRequiresSecret('HMAC_SHA512'), true);
        assert.equal(strategyRequiresSecret('JWT_HS256'), true);
        assert.equal(strategyRequiresSecret('JWT_RS256'), false);
        assert.equal(strategyRequiresSecret('EDDSA_ED25519'), false);
        assert.equal(strategyRequiresSecret('ECDSA_SECP256K1'), false);
    });

    it('should identify strategies that require private key', () => {
        assert.equal(strategyRequiresPrivateKey('HMAC_SHA256'), false);
        assert.equal(strategyRequiresPrivateKey('JWT_RS256'), true);
        assert.equal(strategyRequiresPrivateKey('JWT_ES256'), true);
        assert.equal(strategyRequiresPrivateKey('EDDSA_ED25519'), true);
        assert.equal(strategyRequiresPrivateKey('ECDSA_SECP256K1'), true);
        assert.equal(strategyRequiresPrivateKey('RSA_SHA256'), true);
    });

    it('should get strategies for signature mode', () => {
        const strategies = getStrategiesForMode('signature');

        assert.ok(strategies.includes('HMAC_SHA256'));
        assert.ok(strategies.includes('HMAC_SHA512'));
        assert.ok(strategies.includes('HMAC_SHA384'));
        assert.ok(strategies.includes('ECDSA_SECP256K1'));
        assert.ok(strategies.includes('EDDSA_ED25519'));
        assert.ok(strategies.includes('RSA_SHA256'));
    });

    it('should find strategy by name (case-insensitive)', () => {
        assert.equal(findAuthStrategy('hmac-sha256'), 'HMAC_SHA256');
        assert.equal(findAuthStrategy('hmac_sha256'), 'HMAC_SHA256');
        assert.equal(findAuthStrategy('HMAC_SHA256'), 'HMAC_SHA256');
        assert.equal(findAuthStrategy('jwt rs256'), 'JWT_RS256');
        assert.equal(findAuthStrategy('eddsa-ed25519'), 'EDDSA_ED25519');
        assert.equal(findAuthStrategy('invalid-strategy'), undefined);
    });

    it('should validate strategy compatibility with mode', () => {
        assert.equal(isStrategyCompatibleWithMode('HMAC_SHA256', 'signature'), true);
        assert.equal(isStrategyCompatibleWithMode('HMAC_SHA256', 'oauth'), false);
        assert.equal(isStrategyCompatibleWithMode('JWT_RS256', 'oauth'), true);
        assert.equal(isStrategyCompatibleWithMode('JWT_RS256', 'signature'), false);
        assert.equal(isStrategyCompatibleWithMode('API_KEY_ONLY', 'apiKey'), true);
    });

    it('should get credential requirements for HMAC strategies', () => {
        const creds = getStrategyCredentials('HMAC_SHA256');

        assert.equal(creds.apiKey, true);
        assert.equal(creds.secret, true);
        assert.equal(creds.privateKey, undefined);
    });

    it('should get credential requirements for JWT_RS256', () => {
        const creds = getStrategyCredentials('JWT_RS256');

        assert.equal(creds.apiKey, true);
        assert.equal(creds.privateKey, true);
        assert.equal(creds.secret, undefined);
    });

    it('should get credential requirements for EDDSA_ED25519', () => {
        const creds = getStrategyCredentials('EDDSA_ED25519');

        assert.equal(creds.apiKey, true);
        assert.equal(creds.privateKey, true);
        assert.equal(creds.secret, undefined);
    });

    it('should get credential requirements for BASIC_AUTH', () => {
        const creds = getStrategyCredentials('BASIC_AUTH');

        assert.equal(creds.login, true);
        assert.equal(creds.password, true);
        assert.equal(creds.apiKey, undefined);
    });

    it('should get credential requirements for BEARER_TOKEN', () => {
        const creds = getStrategyCredentials('BEARER_TOKEN');

        assert.equal(creds.token, true);
        assert.equal(creds.apiKey, undefined);
    });

    it('should get credential requirements for NONE', () => {
        const creds = getStrategyCredentials('NONE');

        assert.deepEqual(creds, {});
    });
});

describe('Auth Strategy Config Details', () => {
    it('should have correct placement for all strategies', () => {
        const strategies = getAllAuthStrategies();

        for (const strategy of strategies) {
            const config = getAuthStrategyConfig(strategy);
            assert.ok(Array.isArray(config.placement));

            if (strategy !== 'NONE') {
                assert.ok(config.placement.length > 0, `${strategy} should have at least one placement`);
            }
        }
    });

    it('should have metadata for major strategies', () => {
        const majorStrategies: AuthStrategy[] = [
            'HMAC_SHA256',
            'HMAC_SHA512',
            'HMAC_SHA384',
            'JWT_RS256',
            'JWT_ES256',
            'EDDSA_ED25519',
            'ECDSA_SECP256K1',
        ];

        for (const strategy of majorStrategies) {
            const config = getAuthStrategyConfig(strategy);
            assert.ok(config.metadata?.description, `${strategy} should have description`);
        }
    });

    it('should have consistent hash algorithms for same family', () => {
        // HMAC family
        assert.equal(getAuthStrategyConfig('HMAC_SHA256').hashAlgorithm, 'SHA256');
        assert.equal(getAuthStrategyConfig('HMAC_SHA512').hashAlgorithm, 'SHA512');
        assert.equal(getAuthStrategyConfig('HMAC_SHA384').hashAlgorithm, 'SHA384');

        // JWT-RS family
        assert.equal(getAuthStrategyConfig('JWT_RS256').hashAlgorithm, 'SHA256');
        assert.equal(getAuthStrategyConfig('JWT_RS384').hashAlgorithm, 'SHA384');
        assert.equal(getAuthStrategyConfig('JWT_RS512').hashAlgorithm, 'SHA512');

        // RSA family
        assert.equal(getAuthStrategyConfig('RSA_SHA256').hashAlgorithm, 'SHA256');
        assert.equal(getAuthStrategyConfig('RSA_SHA384').hashAlgorithm, 'SHA384');
        assert.equal(getAuthStrategyConfig('RSA_SHA512').hashAlgorithm, 'SHA512');
    });

    it('should have correct encoding for JWT strategies', () => {
        assert.equal(getAuthStrategyConfig('JWT_HS256').encoding, 'base64url');
        assert.equal(getAuthStrategyConfig('JWT_RS256').encoding, 'base64url');
        assert.equal(getAuthStrategyConfig('JWT_ES256').encoding, 'base64url');
    });

    it('should have correct encoding for HMAC strategies', () => {
        assert.equal(getAuthStrategyConfig('HMAC_SHA256').encoding, 'hex');
        assert.equal(getAuthStrategyConfig('HMAC_SHA512').encoding, 'hex');
    });
});
