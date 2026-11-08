import Exchange from './abstract/jupiter.js';
import { ArgumentsRequired, BadRequest, BadSymbol, ExchangeError, InvalidOrder, NotSupported } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { DECIMAL_PLACES, TRUNCATE } from './base/functions/number.js';
import type { Currencies, CurrencyInterface, Conversion, Dict, Int, Market, Num, Str, Ticker } from './base/types.js';

/**
 * @class jupiter
 * @augments Exchange
 */
export default class jupiter extends Exchange {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'jupiter',
            'name': 'Jupiter',
            'countries': [],
            'version': 'v2',
            'rateLimit': 2000,
            'certified': false,
            'pro': false,
            'dex': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addLiquidity': true,
                'borrowCurrency': true,
                'cancelDCAOrder': true,
                'cancelOrder': false,
                'claimPoolFees': true,
                'collectFees': true,
                'createConvertTrade': true,
                'createDCAOrder': true,
                'createOrder': false,
                'createPool': true,
                'depositCollateral': true,
                'depositStake': false,
                'fetchBalance': false,
                'fetchBorrowPositions': true,
                'fetchClosedOrders': false,
                'fetchConvertQuote': true,
                'fetchCurrencies': 'emulated',
                'fetchDCAOrder': true,
                'fetchDCAOrders': true,
                'fetchLiquidity': true,
                'fetchLiquidityPools': true,
                'fetchMarkets': false,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': false,
                'fetchOrders': false,
                'fetchPoolFees': true,
                'fetchPoolMintAddresses': true,
                'fetchStake': false,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTrades': false,
                'removeLiquidity': true,
                'repayCurrency': true,
                'sandbox': false,
                'submitPool': true,
                'withdrawCollateral': true,
                'withdrawStake': false,
            },
            'urls': {
                'logo': 'https://jup.ag/favicon.ico',
                'api': {
                    'public': 'https://api.jup.ag',
                    'trigger': 'https://api.jup.ag/trigger/v2',
                    'lend': 'https://api.jup.ag/lend/v1',
                    'studio': 'https://api.jup.ag/studio/v1',
                },
                'www': 'https://jup.ag',
                'doc': 'https://developers.jup.ag/docs',
                'fees': 'https://jup.ag/swap',
            },
            'api': {
                'public': {
                    'get': [
                        'tokens/v2/search',
                        'price/v3',
                        'swap/v2/order',
                        'swap/v2/build',
                    ],
                    'post': [
                        'swap/v2/execute',
                    ],
                },
                'trigger': {
                    'public': {
                        'post': [
                            'auth/challenge',
                        ],
                    },
                    'private': {
                        'get': [
                            'vault',
                            'vault/register',
                            'orders/history',
                            'orders/history/dca',
                            'orders/history/dca/{id}',
                        ],
                        'post': [
                            'auth/verify',
                            'auth/refresh',
                            'deposit/craft',
                            'orders/price',
                            'orders/dca',
                            'orders/price/cancel/{id}',
                            'orders/price/confirm-cancel/{id}',
                            'orders/dca/cancel/{id}',
                            'orders/dca/confirm-cancel/{id}',
                        ],
                        'patch': [
                            'orders/price/{id}',
                        ],
                    },
                },
                'lend': {
                    'public': {
                        'get': [
                            'earn/tokens',
                            'earn/positions',
                            'borrow/vaults',
                            'borrow/positions',
                        ],
                        'post': [
                            'earn/deposit',
                            'earn/withdraw',
                            'borrow/operate',
                            'borrow/operate-instructions',
                        ],
                    },
                },
                'studio': {
                    'public': {
                        'get': [
                            'dbc-pool/addresses/{mint}',
                        ],
                        'post': [
                            'dbc-pool/create-tx',
                            'dbc-pool/submit',
                            'dbc/fee',
                            'dbc/fee/create-tx',
                        ],
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
            },
            'precisionMode': DECIMAL_PLACES,
            'options': {
                'defaultType': 'spot',
            },
        });
    }

    /**
     * @method
     * @name jupiter#createPool
     * @description creates a Jupiter Studio DBC pool transaction and token metadata upload links
     * @see https://developers.jup.ag/docs/api-reference/studio/dbc-pool-create-tx
     * @param {object} params DBC curve, fee, token metadata, and creator configuration
     * @param {object} params.buildCurveByMarketCapParam bonding curve configuration
     * @param {boolean} params.antiSniping whether to enable anti-sniping protection
     * @param {object} params.fee pool fee configuration
     * @param {string} params.tokenName token name
     * @param {string} params.tokenSymbol token symbol
     * @param {string} params.tokenImageContentType token image MIME type
     * @param {string} params.creator creator wallet public key
     * @returns {object} unsigned transaction, token mint, and presigned metadata URLs
     */
    override async createPool (params: Dict = {}): Promise<Dict> {
        const required = [ 'buildCurveByMarketCapParam', 'antiSniping', 'fee', 'tokenName', 'tokenSymbol', 'tokenImageContentType', 'creator' ];
        for (let i = 0; i < required.length; i++) {
            const key = required[i];
            if (params[key] === undefined) {
                throw new ArgumentsRequired (this.id + ' createPool() requires params.' + key);
            }
        }
        return await this.studioPublicPostDbcPoolCreateTx (params);
    }

    /**
     * @method
     * @name jupiter#submitPool
     * @description submits a caller-signed Jupiter Studio DBC pool transaction
     * @see https://developers.jup.ag/docs/api-reference/studio/dbc-pool-submit
     * @param {object} params signed transaction and pool owner
     * @param {string} params.transaction base64-encoded signed Solana transaction
     * @param {string} [params.owner] wallet public key that owns the transaction
     * @param {string} [params.wallet] alias for owner
     * @param {string} [params.content] optional Studio page description
     * @param {object} [params.headerImage] unsupported binary file upload; upload it separately or omit it
     * @returns {object} common pool transaction result plus token mint and config key
     */
    override async submitPool (params: Dict = {}): Promise<Dict> {
        const transaction = this.safeString (params, 'transaction');
        const owner = this.safeString (params, 'owner', this.safeString (params, 'wallet'));
        if ((transaction === undefined) || (owner === undefined)) {
            throw new ArgumentsRequired (this.id + ' submitPool() requires params.transaction and params.owner or params.wallet');
        }
        if (params['headerImage'] !== undefined) {
            throw new NotSupported (this.id + ' submitPool() does not support binary headerImage uploads; upload the image separately');
        }
        const request: Dict = {
            'transaction': transaction,
            'owner': owner,
        };
        const content = this.safeString (params, 'content');
        if (content !== undefined) {
            request['content'] = content;
        }
        const response = await this.studioPublicPostDbcPoolSubmit (request);
        const data = this.safeDict (response, 'data', response);
        return this.parsePoolSubmission (data, owner);
    }

    /**
     * @method
     * @name jupiter#fetchPoolMintAddresses
     * @description fetches Jupiter DBC and graduated DAMM V2 pool addresses for a token mint
     * @see https://developers.jup.ag/docs/api-reference/studio/dbc-pool-addresses-by-mint
     * @param {string} id token mint address
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object} common pool-address structure plus DBC, DAMM V2, and config addresses
     */
    override async fetchPoolMintAddresses (id: string, params: Dict = {}): Promise<Dict> {
        const response = await this.studioPublicGetDbcPoolAddressesMint (this.extend ({ 'mint': id }, params));
        const data = this.safeDict (response, 'data', response);
        return this.parsePoolMintAddresses (this.extend ({ 'mint': id }, data));
    }

    /**
     * @method
     * @name jupiter#fetchPoolFees
     * @description fetches total and unclaimed creator fees for a Jupiter DBC pool
     * @see https://developers.jup.ag/docs/api-reference/studio/dbc-fee
     * @param {string} poolId Jupiter DBC pool address
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object[]} common fee structures; raw creator-fee values remain in info
     */
    override async fetchPoolFees (poolId: Str = undefined, params: Dict = {}): Promise<Dict[]> {
        if (poolId === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchPoolFees() requires a DBC pool id');
        }
        const response = await this.studioPublicPostDbcFee (this.extend ({ 'poolAddress': poolId }, params));
        return [ this.parsePoolFee (response, poolId, 'creator') ];
    }

    /**
     * @method
     * @name jupiter#collectFees
     * @description creates an unsigned Jupiter DBC creator-fee claim transaction
     * @see https://developers.jup.ag/docs/api-reference/studio/dbc-fee-create-tx
     * @param {string} poolId Jupiter DBC pool address
     * @param {object} params claim request including ownerWallet and maxQuoteAmount
     * @param {string} params.ownerWallet creator wallet public key
     * @param {number} params.maxQuoteAmount maximum quote-token amount in base units to claim
     * @returns {object} unsigned claim transaction that must be signed and submitted by the caller
     */
    override async collectFees (poolId: string, params: Dict = {}): Promise<Dict> {
        if (poolId === undefined) {
            throw new ArgumentsRequired (this.id + ' collectFees() requires a DBC pool id');
        }
        const ownerWallet = this.safeString (params, 'ownerWallet');
        const maxQuoteAmount = this.safeNumber (params, 'maxQuoteAmount');
        if ((ownerWallet === undefined) || (maxQuoteAmount === undefined)) {
            throw new ArgumentsRequired (this.id + ' collectFees() requires params.ownerWallet and params.maxQuoteAmount');
        }
        return await this.studioPublicPostDbcFeeCreateTx (this.extend (this.omit (params, [ 'ownerWallet', 'maxQuoteAmount' ]), {
            'ownerWallet': ownerWallet,
            'poolAddress': poolId,
            'maxQuoteAmount': maxQuoteAmount,
        }));
    }

    /**
     * @method
     * @name jupiter#claimPoolFees
     * @description creates an unsigned Jupiter DBC creator-fee claim transaction
     * @see https://developers.jup.ag/docs/api-reference/studio/dbc-fee-create-tx
     * @param {string} poolId Jupiter DBC pool address
     * @param {object} params claim request including ownerWallet and maxQuoteAmount
     * @param {string} params.ownerWallet creator wallet public key
     * @param {number} params.maxQuoteAmount maximum quote-token amount in base units to claim
     * @returns {object} unsigned claim transaction that must be signed and submitted by the caller
     */
    override async claimPoolFees (poolId: string, params: Dict = {}): Promise<Dict> {
        return await this.collectFees (poolId, params);
    }

    /**
     * @method
     * @name jupiter#fetchLiquidityPools
     * @description fetches Jupiter Earn assets and Borrow vaults
     * @see https://developers.jup.ag/docs/lend/earn
     * @see https://developers.jup.ag/docs/lend/borrow
     * @param {object} [params] extra parameters specific to the endpoint
     * @param {string} [params.type] filter by 'earn' or 'borrow'
     * @param {string} [params.market] Borrow market, 'main' or 'ethena'
     * @param {string} [params.rpcUrl] optional Solana RPC URL for Borrow vault data
     * @returns {object[]} common liquidity pool structures with protocol-specific fields in info
     */
    override async fetchLiquidityPools (params: Dict = {}): Promise<Dict[]> {
        const type = this.safeString (params, 'type');
        if ((type !== undefined) && (type !== 'earn') && (type !== 'borrow')) {
            throw new BadRequest (this.id + ' fetchLiquidityPools() params.type must be earn or borrow');
        }
        const request = this.omit (params, [ 'type' ]);
        const results: Dict[] = [];
        if (type !== 'borrow') {
            const response = await this.lendPublicGetEarnTokens ();
            const tokens = (Array.isArray (response)) ? response : this.safeList (response, 'data', []);
            for (let i = 0; i < tokens.length; i++) {
                const token = tokens[i] as Dict;
                results.push (this.parseLiquidityPool ({
                    'id': this.safeString (token, 'assetAddress'),
                    'type': 'earn',
                    'currency': this.safeString (token, 'assetAddress'),
                    'shareToken': this.safeString (token, 'address'),
                    'symbol': this.safeString (token, 'symbol'),
                    'name': this.safeString (token, 'name'),
                    'supplyRate': this.safeNumber (token, 'supplyRate'),
                    'rewardsRate': this.safeNumber (token, 'rewardsRate'),
                    'totalRate': this.safeNumber (token, 'totalRate'),
                    'info': token,
                }));
            }
        }
        if (type !== 'earn') {
            const response = await this.lendPublicGetBorrowVaults (request);
            const vaults = (Array.isArray (response)) ? response : this.safeList (response, 'data', []);
            for (let i = 0; i < vaults.length; i++) {
                const vault = vaults[i] as Dict;
                const supplyToken = this.safeDict (vault, 'supplyToken');
                const borrowToken = this.safeDict (vault, 'borrowToken');
                results.push (this.parseLiquidityPool ({
                    'id': this.safeString (vault, 'id'),
                    'type': 'borrow',
                    'address': this.safeString (vault, 'address'),
                    'collateralCurrency': this.safeString (supplyToken, 'address'),
                    'borrowCurrency': this.safeString (borrowToken, 'address'),
                    'supplyRate': this.safeNumber (vault, 'supplyRate'),
                    'borrowRate': this.safeNumber (vault, 'borrowRate'),
                    'borrowFee': this.safeNumber (vault, 'borrowFee'),
                    'info': vault,
                }));
            }
        }
        return results;
    }

    /**
     * @method
     * @name jupiter#fetchLiquidity
     * @description fetches Jupiter Earn or Borrow positions for a wallet
     * @see https://developers.jup.ag/docs/api-reference/lend/earn/positions
     * @see https://developers.jup.ag/docs/api-reference/lend/borrow/positions
     * @param {string} [poolId] asset mint for Earn or vault id for Borrow
     * @param {object} [params] extra parameters specific to the endpoint
     * @param {string} params.walletAddress Solana wallet address (or pass it as params.users)
     * @param {string} [params.type] 'earn' (default) or 'borrow'
     * @param {string} [params.market] Borrow market, 'main' or 'ethena'
     * @returns {object[]} common liquidity position structures with protocol-specific fields in info
     */
    override async fetchLiquidity (poolId: Str = undefined, params: Dict = {}): Promise<Dict[]> {
        const walletAddress = this.safeString2 (params, 'walletAddress', 'users');
        if (walletAddress === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchLiquidity() requires params.walletAddress');
        }
        const type = this.safeString (params, 'type', 'earn');
        if ((type !== 'earn') && (type !== 'borrow')) {
            throw new BadRequest (this.id + ' fetchLiquidity() params.type must be earn or borrow');
        }
        const request = this.omit (params, [ 'walletAddress', 'users', 'type', 'market' ]);
        request['users'] = walletAddress;
        const market = this.safeString (params, 'market');
        if ((type === 'borrow') && (market !== undefined)) {
            request['market'] = market;
        }
        let response = undefined;
        if (type === 'borrow') {
            response = await this.lendPublicGetBorrowPositions (request);
        } else {
            response = await this.lendPublicGetEarnPositions (request);
        }
        const positions = (Array.isArray (response)) ? response : this.safeList (response, 'data', []);
        const result: Dict[] = [];
        for (let i = 0; i < positions.length; i++) {
            const position = positions[i] as Dict;
            if (type === 'borrow') {
                const vault = this.safeDict (position, 'vault');
                const vaultId = this.safeString2 (position, 'vaultId', 'id');
                if ((poolId !== undefined) && (poolId !== vaultId)) {
                    continue;
                }
                const supplyToken = this.safeDict (vault, 'supplyToken');
                const borrowToken = this.safeDict (vault, 'borrowToken');
                const supplyDecimals = this.safeInteger (supplyToken, 'decimals');
                const borrowDecimals = this.safeInteger (borrowToken, 'decimals');
                if ((supplyDecimals === undefined) || (borrowDecimals === undefined)) {
                    throw new ExchangeError (this.id + ' Borrow position is missing token decimal precision');
                }
                const collateralAmount = this.safeString (position, 'supply');
                const debtAmount = this.safeString (position, 'borrow');
                result.push (this.parseLiquidity ({
                    'id': this.safeString (position, 'id'),
                    'poolId': vaultId,
                    'type': 'borrow',
                    'owner': this.safeString (position, 'ownerAddress'),
                    'collateral': (collateralAmount === undefined) ? undefined : this.parseNumber (Precise.stringDiv (collateralAmount, '1' + '0'.repeat (supplyDecimals), supplyDecimals)),
                    'collateralCurrency': this.safeString (supplyToken, 'address'),
                    'debt': (debtAmount === undefined) ? undefined : this.parseNumber (Precise.stringDiv (debtAmount, '1' + '0'.repeat (borrowDecimals), borrowDecimals)),
                    'borrowCurrency': this.safeString (borrowToken, 'address'),
                    'liquidated': this.safeBool (position, 'isLiquidated'),
                    'info': position,
                    'vault': vault,
                }));
            } else {
                const token = this.safeDict (position, 'token');
                const assetAddress = this.safeString (token, 'assetAddress');
                if ((poolId !== undefined) && (poolId !== assetAddress) && (poolId !== this.safeString (token, 'address'))) {
                    continue;
                }
                const decimals = this.safeInteger (token, 'decimals');
                if (decimals === undefined) {
                    throw new ExchangeError (this.id + ' Earn position is missing token decimal precision');
                }
                const scale = '1' + '0'.repeat (decimals);
                const shares = this.safeString (position, 'shares');
                const underlyingAssets = this.safeString (position, 'underlyingAssets');
                result.push (this.parseLiquidity ({
                    'id': assetAddress,
                    'poolId': assetAddress,
                    'type': 'earn',
                    'owner': this.safeString (position, 'ownerAddress'),
                    'shares': (shares === undefined) ? undefined : this.parseNumber (Precise.stringDiv (shares, scale, decimals)),
                    'amount': (underlyingAssets === undefined) ? undefined : this.parseNumber (Precise.stringDiv (underlyingAssets, scale, decimals)),
                    'currency': assetAddress,
                    'info': position,
                }));
            }
        }
        return result;
    }

    /**
     * @method
     * @name jupiter#addLiquidity
     * @description deposits an asset into a Jupiter Earn vault and returns an unsigned transaction
     * @see https://developers.jup.ag/docs/api-reference/lend/earn/deposit
     * @param {string} poolId underlying asset mint address
     * @param {number} amount amount to deposit in human-readable currency units
     * @param {object} params request fields including signer
     * @param {string} params.signer Solana wallet address that will sign the transaction
     * @returns {object} an unsigned transaction that must be signed and submitted by the caller
     */
    override async addLiquidity (poolId: string, amount: Num = undefined, params: Dict = {}): Promise<Dict> {
        return await this.createEarnTransaction ('deposit', poolId, amount, params);
    }

    /**
     * @method
     * @name jupiter#removeLiquidity
     * @description withdraws an asset from a Jupiter Earn vault and returns an unsigned transaction
     * @see https://developers.jup.ag/docs/api-reference/lend/earn/withdraw
     * @param {string} poolId underlying asset mint address
     * @param {number} amount amount to withdraw in human-readable currency units
     * @param {object} params request fields including signer
     * @param {string} params.signer Solana wallet address that will sign the transaction
     * @returns {object} an unsigned transaction that must be signed and submitted by the caller
     */
    override async removeLiquidity (poolId: string, amount: Num = undefined, params: Dict = {}): Promise<Dict> {
        return await this.createEarnTransaction ('withdraw', poolId, amount, params);
    }

    /**
     * @method
     * @name jupiter#depositCollateral
     * @description deposits collateral into a Jupiter Borrow position and returns an unsigned transaction
     * @see https://developers.jup.ag/docs/api-reference/lend/borrow/operate
     * @param {string} id Jupiter Borrow vault id
     * @param {number} amount collateral amount in human-readable currency units
     * @param {object} params operation parameters including signer and optional positionId
     * @param {string} params.signer Solana wallet address that will sign the transaction
     * @param {int} [params.positionId] existing position id; defaults to 0 to create a position
     * @param {string} [params.positionOwner] owner of an existing position when operating on behalf of another wallet
     * @param {string} [params.market] Borrow market, 'main' or 'ethena'
     * @param {string} [params.rpcUrl] optional Solana RPC URL for Borrow vault data
     * @param {boolean} [params.instructions] return raw instructions instead of a serialized transaction
     * @returns {object} an unsigned transaction that must be signed and submitted by the caller
     */
    override async depositCollateral (id: string, amount: Num = undefined, params: Dict = {}): Promise<Dict> {
        if ((amount === undefined) || (amount <= 0)) {
            throw new ArgumentsRequired (this.id + ' depositCollateral() requires a positive amount');
        }
        return await this.createBorrowOperation (id, amount, 0, params);
    }

    /**
     * @method
     * @name jupiter#withdrawCollateral
     * @description withdraws collateral from a Jupiter Borrow position and returns an unsigned transaction
     * @see https://developers.jup.ag/docs/api-reference/lend/borrow/operate
     * @param {string} id Jupiter Borrow vault id
     * @param {number} amount collateral amount in human-readable currency units
     * @param {object} params operation parameters including signer and positionId
     * @param {string} params.signer Solana wallet address that will sign the transaction
     * @param {int} params.positionId existing Borrow position id
     * @param {string} [params.positionOwner] owner of the position when operating on behalf of another wallet
     * @param {string} [params.market] Borrow market, 'main' or 'ethena'
     * @param {string} [params.rpcUrl] optional Solana RPC URL for Borrow vault data
     * @param {boolean} [params.instructions] return raw instructions instead of a serialized transaction
     * @returns {object} an unsigned transaction that must be signed and submitted by the caller
     */
    override async withdrawCollateral (id: string, amount: Num = undefined, params: Dict = {}): Promise<Dict> {
        if ((amount === undefined) || (amount <= 0)) {
            throw new ArgumentsRequired (this.id + ' withdrawCollateral() requires a positive amount');
        }
        const negativeAmount = -Math.abs (amount);
        return await this.createBorrowOperation (id, negativeAmount, 0, params);
    }

    /**
     * @method
     * @name jupiter#borrowCurrency
     * @description borrows against a Jupiter Borrow position and returns an unsigned transaction
     * @see https://developers.jup.ag/docs/api-reference/lend/borrow/operate
     * @param {string} id Jupiter Borrow vault id
     * @param {number} amount borrow amount in human-readable currency units
     * @param {object} params operation parameters including signer and optional positionId
     * @param {string} params.signer Solana wallet address that will sign the transaction
     * @param {int} [params.positionId] existing position id; defaults to 0 to create a position
     * @param {string} [params.positionOwner] owner of an existing position when operating on behalf of another wallet
     * @param {string} [params.market] Borrow market, 'main' or 'ethena'
     * @param {string} [params.rpcUrl] optional Solana RPC URL for Borrow vault data
     * @param {boolean} [params.instructions] return raw instructions instead of a serialized transaction
     * @returns {object} an unsigned transaction that must be signed and submitted by the caller
     */
    override async borrowCurrency (id: string, amount: Num = undefined, params: Dict = {}): Promise<Dict> {
        if ((amount === undefined) || (amount <= 0)) {
            throw new ArgumentsRequired (this.id + ' borrowCurrency() requires a positive amount');
        }
        return await this.createBorrowOperation (id, 0, amount, params);
    }

    /**
     * @method
     * @name jupiter#repayCurrency
     * @description repays a Jupiter Borrow position and returns an unsigned transaction
     * @see https://developers.jup.ag/docs/api-reference/lend/borrow/operate
     * @param {string} id Jupiter Borrow vault id
     * @param {number} amount repayment amount in human-readable currency units
     * @param {object} params operation parameters including signer and positionId
     * @param {string} params.signer Solana wallet address that will sign the transaction
     * @param {int} params.positionId existing Borrow position id
     * @param {boolean} [params.all] repay the full debt
     * @param {string} [params.positionOwner] owner of the position when operating on behalf of another wallet
     * @param {string} [params.market] Borrow market, 'main' or 'ethena'
     * @param {string} [params.rpcUrl] optional Solana RPC URL for Borrow vault data
     * @param {boolean} [params.instructions] return raw instructions instead of a serialized transaction
     * @returns {object} an unsigned transaction that must be signed and submitted by the caller
     */
    override async repayCurrency (id: string, amount: Num = undefined, params: Dict = {}): Promise<Dict> {
        const repayAll = this.safeBool (params, 'all');
        if (((amount === undefined) || (amount <= 0)) && !repayAll) {
            throw new ArgumentsRequired (this.id + ' repayCurrency() requires a positive amount or params.all');
        }
        const repayAmount = (amount === undefined) ? undefined : -Math.abs (amount);
        return await this.createBorrowOperation (id, 0, repayAmount, params);
    }

    /**
     * @method
     * @name jupiter#fetchBorrowPositions
     * @description fetches Jupiter Borrow positions for a wallet
     * @see https://developers.jup.ag/docs/api-reference/lend/borrow/positions
     * @param {string} walletAddress Solana wallet address
     * @param {object} [params] extra parameters specific to the endpoint
     * @param {string} [params.market] Jupiter Lend market, 'main' or 'ethena'
     * @returns {object[]} a list of Jupiter Borrow positions
     */
    override async fetchBorrowPositions (walletAddress: string, params: Dict = {}): Promise<Dict[]> {
        const request = this.omit (params, [ 'users', 'walletAddress', 'type' ]);
        request['walletAddress'] = walletAddress;
        request['type'] = 'borrow';
        return await this.fetchLiquidity (undefined, request);
    }

    /**
     * @ignore
     * @param {string} operation Earn operation
     * @param {string} asset underlying asset mint
     * @param {number} amount human-readable amount
     * @param {object} params request parameters
     * @returns {object} unsigned transaction response
     */
    async createEarnTransaction (operation: string, asset: string, amount: Num, params: Dict = {}): Promise<Dict> {
        if ((amount === undefined) || (amount <= 0)) {
            throw new ArgumentsRequired (this.id + ' ' + operation + ' requires a positive amount');
        }
        const signer = this.safeString (params, 'signer');
        if (signer === undefined) {
            throw new ArgumentsRequired (this.id + ' ' + operation + ' requires params.signer');
        }
        const response = await this.lendPublicGetEarnTokens ();
        const tokens = (Array.isArray (response)) ? response : this.safeList (response, 'data', []);
        let decimals: Int = undefined;
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i] as Dict;
            if (this.safeString (token, 'assetAddress') === asset) {
                decimals = this.safeInteger (token, 'decimals');
                break;
            }
        }
        if (decimals === undefined) {
            throw new BadSymbol (this.id + ' ' + operation + ' unknown Earn asset ' + asset);
        }
        const amountString = this.decimalToPrecision (this.numberToString (amount), TRUNCATE, decimals, DECIMAL_PLACES);
        const baseAmount = Precise.stringMul (amountString, '1' + '0'.repeat (decimals));
        if (baseAmount === undefined) {
            throw new ExchangeError (this.id + ' could not convert Earn amount to base units');
        }
        const request = this.omit (params, [ 'signer' ]);
        request['asset'] = asset;
        request['signer'] = signer;
        request['amount'] = baseAmount;
        if (operation === 'deposit') {
            return await this.lendPublicPostEarnDeposit (request);
        }
        return await this.lendPublicPostEarnWithdraw (request);
    }

    /**
     * @ignore
     * @param {string} id Borrow vault id
     * @param {number} collateralAmount human-readable collateral amount
     * @param {number} debtAmount human-readable debt amount
     * @param {object} params operation parameters
     * @returns {object} unsigned transaction response
     */
    async createBorrowOperation (id: string, collateralAmount: Num, debtAmount: Num, params: Dict = {}): Promise<Dict> {
        const signer = this.safeString (params, 'signer');
        if (signer === undefined) {
            throw new ArgumentsRequired (this.id + ' Borrow operation requires params.signer');
        }
        const vaultRequest: Dict = {};
        const market = this.safeString (params, 'market');
        const rpcUrl = this.safeString (params, 'rpcUrl');
        if (market !== undefined) {
            vaultRequest['market'] = market;
        }
        if (rpcUrl !== undefined) {
            vaultRequest['rpcUrl'] = rpcUrl;
        }
        const response = await this.lendPublicGetBorrowVaults (vaultRequest);
        const vaults = (Array.isArray (response)) ? response : this.safeList (response, 'data', []);
        let selectedVault: Dict = {};
        for (let i = 0; i < vaults.length; i++) {
            const vault = vaults[i] as Dict;
            if (this.safeString (vault, 'id') === id) {
                selectedVault = vault;
                break;
            }
        }
        if (Object.keys (selectedVault).length === 0) {
            throw new BadSymbol (this.id + ' unknown Borrow vault ' + id);
        }
        const supplyToken = this.safeDict (selectedVault, 'supplyToken');
        const borrowToken = this.safeDict (selectedVault, 'borrowToken');
        const supplyDecimals = this.safeInteger (supplyToken, 'decimals');
        const borrowDecimals = this.safeInteger (borrowToken, 'decimals');
        if ((supplyDecimals === undefined) || (borrowDecimals === undefined)) {
            throw new ExchangeError (this.id + ' Borrow vault is missing token decimal precision');
        }
        const colAmount = (collateralAmount === undefined) ? '0' : this.toBaseUnits (collateralAmount, supplyDecimals);
        let debtAmountString = '0';
        if (this.safeBool (params, 'all')) {
            debtAmountString = '-170141183460469231731687303715884105728';
        } else if (debtAmount !== undefined) {
            debtAmountString = this.toBaseUnits (debtAmount, borrowDecimals);
        }
        const requestedPositionId = this.safeInteger (params, 'positionId');
        const needsExistingPosition = ((collateralAmount !== undefined) && (collateralAmount < 0)) || ((debtAmount !== undefined) && (debtAmount < 0)) || this.safeBool (params, 'all');
        if (needsExistingPosition && (requestedPositionId === undefined)) {
            throw new ArgumentsRequired (this.id + ' Borrow withdrawals and repayments require params.positionId');
        }
        const positionId = (requestedPositionId === undefined) ? 0 : requestedPositionId;
        const request: Dict = {
            'market': market,
            'positionOwner': this.safeString (params, 'positionOwner'),
            'vaultId': this.parseToInt (id),
            'positionId': positionId,
            'signer': signer,
            'colAmount': colAmount,
            'debtAmount': debtAmountString,
        };
        if (this.safeBool (params, 'instructions')) {
            return await this.lendPublicPostBorrowOperateInstructions (request);
        }
        return await this.lendPublicPostBorrowOperate (request);
    }

    /**
     * @ignore
     * @param {number} amount human-readable token amount
     * @param {int} decimals token decimal precision
     * @returns {string} amount in base units
     */
    toBaseUnits (amount: Num, decimals: number): string {
        const amountString = this.decimalToPrecision (this.numberToString (amount), TRUNCATE, decimals, DECIMAL_PLACES);
        const baseUnits = Precise.stringMul (amountString, '1' + '0'.repeat (decimals));
        if (baseUnits === undefined) {
            throw new ExchangeError (this.id + ' could not convert token amount to base units');
        }
        return baseUnits;
    }

    /**
     * @ignore
     * @param {object} pool normalized pool input retaining venue data
     * @returns {object} common liquidity pool structure
     */
    parseLiquidityPool (pool: Dict): Dict {
        const info = this.safeDict (pool, 'info', pool);
        const poolId = this.safeString (pool, 'poolId', this.safeString (pool, 'id'));
        return this.extend ({}, pool, {
            'id': this.safeString (pool, 'id', poolId),
            'poolId': poolId,
            'type': this.safeString (pool, 'type'),
            'baseCurrency': this.safeString (pool, 'baseCurrency', this.safeString (pool, 'currency', this.safeString (pool, 'collateralCurrency'))),
            'quoteCurrency': this.safeString (pool, 'quoteCurrency', this.safeString (pool, 'borrowCurrency')),
            'lpCurrency': this.safeString (pool, 'lpCurrency', this.safeString (pool, 'shareToken')),
            'symbol': this.safeString (pool, 'symbol'),
            'name': this.safeString (pool, 'name'),
            'totalLiquidity': this.safeNumber2 (pool, 'totalLiquidity', 'tvl'),
            'totalLiquidityValue': this.safeNumber2 (pool, 'totalLiquidityValue', 'tvlUsd'),
            'volume24h': this.safeNumber2 (pool, 'volume24h', 'volume24hUsd'),
            'apr': this.safeNumber2 (pool, 'apr', 'totalRate'),
            'supplyRate': this.safeNumber (pool, 'supplyRate'),
            'borrowRate': this.safeNumber (pool, 'borrowRate'),
            'rewardsRate': this.safeNumber (pool, 'rewardsRate'),
            'feeRate': this.safeNumber (pool, 'feeRate', this.safeNumber (pool, 'borrowFee')),
            'active': this.safeBool (pool, 'active'),
            'info': info,
        });
    }

    /**
     * @ignore
     * @param {object} position normalized position input retaining venue data
     * @returns {object} common liquidity position structure
     */
    parseLiquidity (position: Dict): Dict {
        const info = this.safeDict (position, 'info', position);
        return this.extend ({}, position, {
            'id': this.safeString (position, 'id'),
            'poolId': this.safeString (position, 'poolId'),
            'owner': this.safeString (position, 'owner'),
            'type': this.safeString (position, 'type'),
            'currency': this.safeString (position, 'currency'),
            'amount': this.safeNumber (position, 'amount'),
            'shares': this.safeNumber (position, 'shares'),
            'collateral': this.safeNumber (position, 'collateral'),
            'collateralCurrency': this.safeString (position, 'collateralCurrency'),
            'debt': this.safeNumber (position, 'debt'),
            'borrowCurrency': this.safeString (position, 'borrowCurrency'),
            'liquidated': this.safeBool (position, 'liquidated'),
            'info': info,
        });
    }

    /**
     * @ignore
     * @param {object} fee raw pool fee data
     * @param {string} poolId pool identifier
     * @param {string} type fee category
     * @returns {object} common pool fee structure
     */
    parsePoolFee (fee: Dict, poolId: string, type: string): Dict {
        const info = this.safeDict (fee, 'info', fee);
        const amount = this.safeNumber2 (fee, 'unclaimedAmount', 'unclaimedFee');
        return this.extend ({}, fee, {
            'id': this.safeString (fee, 'id', poolId),
            'poolId': this.safeString (fee, 'poolId', poolId),
            'positionId': this.safeString (fee, 'positionId'),
            'type': type,
            'currency': this.safeString2 (fee, 'currency', 'quoteMint'),
            'amount': amount,
            'unclaimedAmount': amount,
            'totalAmount': this.safeNumber2 (fee, 'totalAmount', 'totalFee'),
            'info': info,
        });
    }

    /**
     * @ignore
     * @param {object} addresses raw pool-address data
     * @returns {object} common pool-address structure retaining venue-specific addresses
     */
    parsePoolMintAddresses (addresses: Dict): Dict {
        const info = this.safeDict (addresses, 'info', addresses);
        const poolId = this.safeString (addresses, 'poolId', this.safeString (addresses, 'id', this.safeString (addresses, 'dbcPool')));
        return this.extend ({}, addresses, {
            'id': this.safeString (addresses, 'id', poolId),
            'poolId': poolId,
            'baseCurrency': this.safeString (addresses, 'baseCurrency', this.safeString (addresses, 'mintA', this.safeString (addresses, 'mint'))),
            'quoteCurrency': this.safeString (addresses, 'quoteCurrency', this.safeString (addresses, 'mintB')),
            'lpCurrency': this.safeString (addresses, 'lpCurrency', this.safeString (addresses, 'lpMint')),
            'info': info,
        });
    }

    /**
     * @ignore
     * @param {object} submission raw transaction submission result
     * @param {string} [owner] wallet that submitted the transaction
     * @returns {object} common pool transaction result retaining venue-specific data
     */
    parsePoolSubmission (submission: Dict, owner: Str = undefined): Dict {
        const info = this.safeDict (submission, 'info', submission);
        const signature = this.safeString2 (submission, 'signature', 'transactionId', this.safeString (submission, 'txid'));
        return this.extend ({}, submission, {
            'id': this.safeString (submission, 'id', signature),
            'signature': signature,
            'poolId': this.safeString (submission, 'poolId', this.safeString (submission, 'poolAddress')),
            'owner': this.safeString (submission, 'owner', owner),
            'info': info,
        });
    }

    /**
     * @method
     * @name jupiter#fetchCurrencies
     * @description searches for Solana tokens and returns their currency metadata
     * @see https://developers.jup.ag/docs/api-reference/tokens/search
     * @param {object} [params] exchange-specific parameters
     * @param {string} params.query token name, symbol, or mint address to search for
     * @returns {object} a dictionary of [currency structures](https://docs.ccxt.com/#/?id=currency-structure) indexed by currency code
     */
    override async fetchCurrencies (params: Dict = {}): Promise<Currencies> {
        const query = this.safeString (params, 'query');
        if (query === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchCurrencies() requires a query parameter');
        }
        const response = await this.publicGetTokensV2Search (params);
        const tokens = Array.isArray (response) ? response : this.safeList (response, 'data', []);
        const result: Currencies = {};
        for (let i = 0; i < tokens.length; i++) {
            const currency = this.parseCurrency (tokens[i]);
            const code = currency['code'];
            if (result[code] === undefined) {
                result[code] = currency;
            } else if (result[code]['id'] !== currency['id']) {
                const suffix = currency['id'].slice (-4);
                currency['code'] = code + '-' + suffix;
                result[currency['code']] = currency;
            }
        }
        return result;
    }

    /**
     * @ignore
     * @param {object} currency the raw Jupiter token
     * @returns {object} a currency structure
     */
    override parseCurrency (currency: Dict): CurrencyInterface {
        const id = this.safeString2 (currency, 'id', 'address');
        const code = this.safeString (currency, 'symbol', id);
        const decimals = this.safeInteger (currency, 'decimals');
        if (id === undefined || code === undefined || decimals === undefined) {
            throw new ExchangeError (this.id + ' parseCurrency() received a token without its mint, symbol, or decimals');
        }
        return {
            'info': currency,
            'id': id,
            'code': code,
            'name': this.safeString (currency, 'name'),
            'active': true,
            'type': 'token',
            'precision': decimals,
            'limits': {
                'amount': { 'min': undefined, 'max': undefined },
                'withdraw': { 'min': undefined, 'max': undefined },
            },
            'networks': {},
        };
    }

    /**
     * @method
     * @name jupiter#requestTriggerChallenge
     * @description requests a wallet challenge for trigger api authentication
     * @see https://developers.jup.ag/docs/trigger/authentication
     * @param {string} walletPubkey solana wallet public key
     * @param {object} [params] extra parameters specific to the endpoint
     * @param {string} [params.type] challenge type, 'message' or 'transaction'
     * @returns {object} the challenge to sign with the wallet
     */
    async requestTriggerChallenge (walletPubkey: string, params: Dict = {}): Promise<Dict> {
        const request: Dict = this.omit (params, [ 'type' ]);
        request['walletPubkey'] = walletPubkey;
        request['type'] = this.safeString (params, 'type', 'message');
        return await this.triggerPublicPostAuthChallenge (request);
    }

    /**
     * @method
     * @name jupiter#verifyTriggerChallenge
     * @description verifies a signed wallet challenge and stores the returned trigger access token
     * @see https://developers.jup.ag/docs/trigger/authentication
     * @param {string} walletPubkey solana wallet public key
     * @param {object} params challenge response fields, including type and signature or signedTransaction
     * @param {string} params.type challenge type, 'message' or 'transaction'
     * @param {string} [params.signature] base58-encoded message signature
     * @param {string} [params.signedTransaction] base64-encoded signed challenge transaction
     * @param {string} [params.authMode] 'access_refresh' to obtain a refresh token
     * @returns {object} token response; accessToken is also stored in options.jwt
     */
    async verifyTriggerChallenge (walletPubkey: string, params: Dict = {}): Promise<Dict> {
        const request = this.omit (params, [ 'jwt' ]);
        request['walletPubkey'] = walletPubkey;
        const response = await this.triggerPrivatePostAuthVerify (request);
        const accessToken = this.safeString2 (response, 'accessToken', 'token');
        if (accessToken !== undefined) {
            this.options['jwt'] = accessToken;
        }
        return response;
    }

    /**
     * @method
     * @name jupiter#refreshTriggerToken
     * @description refreshes trigger api access and rotating refresh tokens
     * @see https://developers.jup.ag/docs/trigger/authentication
     * @param {string} refreshToken refresh token returned by verifyTriggerChallenge
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object} refreshed tokens; accessToken is stored in options.jwt
     */
    async refreshTriggerToken (refreshToken: string, params: Dict = {}): Promise<Dict> {
        const request = this.omit (params, [ 'jwt' ]);
        request['refreshToken'] = refreshToken;
        const response = await this.triggerPrivatePostAuthRefresh (request);
        const accessToken = this.safeString (response, 'accessToken');
        if (accessToken !== undefined) {
            this.options['jwt'] = accessToken;
        }
        return response;
    }

    /**
     * @method
     * @name jupiter#createTriggerDeposit
     * @description builds an unsigned deposit transaction for a trigger price or dca order
     * @see https://developers.jup.ag/docs/trigger/deposit
     * @param {object} params deposit request including inputMint, outputMint, userAddress, amount, and orderType
     * @param {string} params.inputMint input token mint
     * @param {string} params.outputMint output token mint
     * @param {string} params.userAddress wallet public key
     * @param {string} params.amount input amount in base units
     * @param {string} params.orderType 'price' or 'dca'
     * @param {string} [params.orderSubType] price order subtype: 'single', 'oco', or 'otoco'
     * @returns {object} unsigned transaction and request metadata
     */
    async createTriggerDeposit (params: Dict = {}): Promise<Dict> {
        return await this.triggerPrivatePostDepositCraft (params);
    }

    /**
     * @method
     * @name jupiter#createDCAOrder
     * @description creates a trigger dca order using a caller-signed deposit transaction
     * @see https://developers.jup.ag/docs/trigger/dca
     * @param {object} params dca order parameters required by the trigger api
     * @param {string} params.depositRequestId request id returned by createTriggerDeposit
     * @param {string} params.depositSignedTx base64-encoded signed deposit transaction
     * @param {string} params.userPubkey wallet public key
     * @param {string} params.inputMint input token mint
     * @param {string} params.outputMint output token mint
     * @returns {object} created dca order id and deposit transaction signature
     */
    override async createDCAOrder (params: Dict = {}): Promise<Dict> {
        const response = await this.triggerPrivatePostOrdersDca (params);
        return this.parseDCAOrder (response);
    }

    /**
     * @method
     * @name jupiter#fetchDCAOrders
     * @description fetches trigger dca order history
     * @see https://developers.jup.ag/docs/trigger/dca-history
     * @param {int} [since] unsupported by Jupiter; use params.offset
     * @param {int} [limit] maximum number of orders
     * @param {object} [params] extra parameters specific to the endpoint
     * @param {string} [params.state] 'active' or 'past'
     * @returns {object[]} dca order history entries
     */
    override async fetchDCAOrders (since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Dict[]> {
        const request = this.omit (params, [ 'since', 'limit' ]);
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.triggerPrivateGetOrdersHistoryDca (request);
        const orders = (Array.isArray (response)) ? response : this.safeList (response, 'orders', []);
        const result: Dict[] = [];
        for (let i = 0; i < orders.length; i++) {
            result.push (this.parseDCAOrder (orders[i]));
        }
        return result;
    }

    /**
     * @method
     * @name jupiter#fetchDCAOrder
     * @description fetches one trigger dca order by id
     * @see https://developers.jup.ag/docs/trigger/dca-history
     * @param {string} id dca order id
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object} dca order details
     */
    override async fetchDCAOrder (id: string, params: Dict = {}): Promise<Dict> {
        const response = await this.triggerPrivateGetOrdersHistoryDcaId (this.extend ({ 'id': id }, params));
        return this.parseDCAOrder (response);
    }

    /**
     * @ignore
     * @param {object} order raw Jupiter Trigger DCA order
     * @returns {object} normalized DCA order fields with the original response in info
     */
    parseDCAOrder (order: Dict): Dict {
        const data = this.safeDict (order, 'data', this.safeDict (order, 'order', order));
        const info = this.safeDict (order, 'info', order);
        return this.extend ({}, data, {
            'id': this.safeString (data, 'id', this.safeString (data, 'publicKey')),
            'owner': this.safeString (data, 'owner', this.safeString (data, 'user')),
            'inputCurrency': this.safeString (data, 'inputCurrency', this.safeString (data, 'inputMint')),
            'outputCurrency': this.safeString (data, 'outputCurrency', this.safeString (data, 'outputMint')),
            'status': this.safeString (data, 'status', this.safeString (data, 'state')),
            'info': info,
        });
    }

    /**
     * @method
     * @name jupiter#cancelDCAOrder
     * @description starts cancellation of a dca order and returns its unsigned withdrawal transaction
     * @see https://developers.jup.ag/docs/trigger/dca-cancel
     * @param {string} id dca order id
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object} unsigned withdrawal transaction and cancellation request id
     */
    override async cancelDCAOrder (id: string, params: Dict = {}): Promise<Dict> {
        return await this.triggerPrivatePostOrdersDcaCancelId (this.extend ({ 'id': id }, params));
    }

    /**
     * @method
     * @name jupiter#confirmCancelDCAOrder
     * @description confirms dca cancellation with a caller-signed withdrawal transaction
     * @see https://developers.jup.ag/docs/trigger/dca-cancel
     * @param {string} id dca order id
     * @param {object} params cancellation confirmation including signedTransaction and cancelRequestId
     * @param {string} params.signedTransaction base64-encoded signed withdrawal transaction
     * @param {string} params.cancelRequestId cancellation request id
     * @returns {object} cancellation confirmation and transaction signature
     */
    override async confirmCancelDCAOrder (id: string, params: Dict = {}): Promise<Dict> {
        return await this.triggerPrivatePostOrdersDcaConfirmCancelId (this.extend ({ 'id': id }, params));
    }

    /**
     * @method
     * @name jupiter#createTriggerOrder
     * @description creates a trigger price order from a caller-signed vault deposit
     * @see https://developers.jup.ag/docs/trigger/create-order
     * @param {object} params price order request required by the trigger api
     * @param {string} params.depositRequestId request id returned by createTriggerDeposit
     * @param {string} params.depositSignedTx base64-encoded signed deposit transaction
     * @param {string} params.userPubkey wallet public key
     * @param {string} params.inputMint input token mint
     * @param {string} params.outputMint output token mint
     * @param {string} params.orderType 'single', 'oco', or 'otoco'
     * @returns {object} created trigger order response
     */
    async createTriggerPriceOrder (params: Dict = {}): Promise<Dict> {
        return await this.triggerPrivatePostOrdersPrice (params);
    }

    /**
     * @method
     * @name jupiter#fetchTriggerOrders
     * @description fetches trigger price order history
     * @see https://developers.jup.ag/docs/trigger/order-history
     * @param {int} [since] unsupported by Jupiter; use params.offset
     * @param {int} [limit] maximum number of orders
     * @param {object} [params] extra parameters specific to the endpoint
     * @param {string} [params.state] 'active' or 'past'
     * @returns {object[]} trigger order history entries
     */
    async fetchTriggerOrders (since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Dict[]> {
        const request = this.omit (params, [ 'since', 'limit' ]);
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.triggerPrivateGetOrdersHistory (request);
        const orders = this.safeList (response, 'orders', []);
        return orders as Dict[];
    }

    /**
     * @method
     * @name jupiter#editTriggerOrder
     * @description updates a trigger price order without cancelling and recreating it
     * @see https://developers.jup.ag/docs/trigger/manage-orders
     * @param {string} id trigger order id
     * @param {object} params update fields required by the order type
     * @param {string} params.orderType 'single', 'oco', or 'otoco'
     * @returns {object} updated order response
     */
    async editTriggerOrder (id: string, params: Dict = {}): Promise<Dict> {
        return await this.triggerPrivatePatchOrdersPriceId (this.extend ({ 'id': id }, params));
    }

    /**
     * @method
     * @name jupiter#cancelTriggerOrder
     * @description initiates trigger order cancellation and returns an unsigned withdrawal transaction
     * @see https://developers.jup.ag/docs/trigger/manage-orders
     * @param {string} id trigger order id
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object} unsigned withdrawal transaction and cancellation request id
     */
    async cancelTriggerOrder (id: string, params: Dict = {}): Promise<Dict> {
        return await this.triggerPrivatePostOrdersPriceCancelId (this.extend ({ 'id': id }, params));
    }

    /**
     * @method
     * @name jupiter#confirmCancelTriggerOrder
     * @description confirms trigger order cancellation with a caller-signed withdrawal transaction
     * @see https://developers.jup.ag/docs/trigger/manage-orders
     * @param {string} id trigger order id
     * @param {object} params cancellation confirmation including signedTransaction and cancelRequestId
     * @param {string} params.signedTransaction base64-encoded signed withdrawal transaction
     * @param {string} params.cancelRequestId cancellation request id
     * @returns {object} cancellation confirmation and transaction signature
     */
    async confirmCancelTriggerOrder (id: string, params: Dict = {}): Promise<Dict> {
        return await this.triggerPrivatePostOrdersPriceConfirmCancelId (this.extend ({ 'id': id }, params));
    }

    /**
     * @method
     * @name jupiter#fetchTicker
     * @description fetches the USD price and 24-hour change for a Solana token
     * @see https://developers.jup.ag/docs/api-reference/price
     * @param {string} symbol currency code or Solana token mint address
     * @param {object} [params] exchange-specific parameters
     * @param {string} [params.mint] token mint address when it cannot be resolved from symbol
     * @returns {object} a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure) with a synthetic USD quote
     */
    override async fetchTicker (symbol: string, params: Dict = {}): Promise<Ticker> {
        let currency = this.safeDict (this.currencies, symbol) as CurrencyInterface;
        const mintOverride = this.safeString (params, 'mint');
        if (currency === undefined && mintOverride === undefined) {
            currency = await this.lookupJupiterCurrency (symbol);
        }
        let defaultMint = symbol;
        if (currency !== undefined) {
            defaultMint = currency['id'];
        }
        const mint = this.safeString (params, 'mint', defaultMint);
        const query = this.omit (params, [ 'mint' ]);
        query['ids'] = mint;
        const response = await this.publicGetPriceV3 (query);
        const tickerData = this.safeDict (response, mint);
        if (tickerData === undefined) {
            throw new ExchangeError (this.id + ' fetchTicker() returned no price for ' + mint);
        }
        const code = (currency === undefined) ? symbol : currency['code'];
        const ticker = this.extend (tickerData, { 'symbol': code + '/USD' });
        const parsed = this.parseTicker (ticker);
        return parsed;
    }

    /**
     * @ignore
     * @param {object} ticker the raw Jupiter price entry
     * @param {object} [market] unused by jupiter
     * @returns {object} a ticker structure
     */
    override parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        let defaultSymbol = undefined;
        if (market !== undefined) {
            defaultSymbol = market['symbol'];
        }
        const symbol = this.safeString (ticker, 'symbol', defaultSymbol);
        const parsed = this.safeTicker ({
            'info': ticker,
            'symbol': symbol,
            'last': this.safeString (ticker, 'usdPrice'),
            'percentage': this.safeString (ticker, 'priceChange24h'),
        });
        return parsed;
    }

    /**
     * @method
     * @name jupiter#fetchSwapInstructions
     * @description builds a custom Solana swap transaction using Jupiter's raw instruction endpoint
     * @see https://developers.jup.ag/docs/api-reference/swap/build
     * @param {object} params request parameters required by Jupiter, including inputMint, outputMint, and amount in base units
     * @param {string} params.inputMint mint address of the input token
     * @param {string} params.outputMint mint address of the output token
     * @param {string} params.amount input amount in the token's smallest unit
     * @returns {object} raw swap instructions and transaction metadata
     */
    async fetchSwapInstructions (params: Dict = {}): Promise<Dict> {
        const inputMint = this.safeString (params, 'inputMint');
        const outputMint = this.safeString (params, 'outputMint');
        const amount = this.safeString (params, 'amount');
        if (inputMint === undefined || outputMint === undefined || amount === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchSwapInstructions() requires inputMint, outputMint, and amount in token base units');
        }
        return await this.publicGetSwapV2Build (params);
    }

    /**
     * @method
     * @name jupiter#fetchConvertQuote
     * @description fetches a quote and a signable transaction for converting two Solana tokens
     * @see https://developers.jup.ag/docs/api-reference/swap/order
     * @param {string} fromCode currency code or mint address to convert from
     * @param {string} toCode currency code or mint address to convert to
     * @param {float} [amount] amount of the from currency to convert
     * @param {object} [params] exchange-specific parameters
     * @param {string} [params.taker] Solana wallet address that will sign the returned transaction
     * @param {string} [params.inputMint] input token mint address override
     * @param {string} [params.outputMint] output token mint address override
     * @param {int} [params.fromDecimals] input token decimal places when its metadata is not cached
     * @param {int} [params.toDecimals] output token decimal places when its metadata is not cached
     * @returns {object} a [conversion structure](https://docs.ccxt.com/#/?id=conversion-structure)
     */
    override async fetchConvertQuote (fromCode: string, toCode: string, amount: Num = undefined, params: Dict = {}): Promise<Conversion> {
        if (amount === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchConvertQuote() requires an amount');
        }
        if (amount <= 0) {
            throw new InvalidOrder (this.id + ' fetchConvertQuote() amount must be positive');
        }
        const fromCurrency = await this.lookupJupiterCurrency (fromCode);
        const toCurrency = await this.lookupJupiterCurrency (toCode);
        const fromDecimals = this.safeInteger (params, 'fromDecimals', fromCurrency['precision']);
        const toDecimals = this.safeInteger (params, 'toDecimals', toCurrency['precision']);
        if (fromDecimals === undefined || toDecimals === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchConvertQuote() requires token decimal metadata');
        }
        const inputMint = this.safeString (params, 'inputMint', fromCurrency['id']);
        const outputMint = this.safeString (params, 'outputMint', toCurrency['id']);
        const inputMultiplier = '1' + '0'.repeat (fromDecimals);
        const outputMultiplier = '1' + '0'.repeat (toDecimals);
        const rawAmount = Precise.stringMul (this.numberToString (amount), inputMultiplier);
        if (rawAmount === undefined) {
            throw new InvalidOrder (this.id + ' fetchConvertQuote() could not convert the input amount to token base units');
        }
        if (rawAmount.indexOf ('.') !== -1) {
            throw new InvalidOrder (this.id + ' fetchConvertQuote() amount has more decimal places than the input token supports');
        }
        const query = this.omit (params, [ 'inputMint', 'outputMint', 'fromDecimals', 'toDecimals' ]);
        query['inputMint'] = inputMint;
        query['outputMint'] = outputMint;
        query['amount'] = rawAmount;
        const response = await this.publicGetSwapV2Order (query);
        const inAmount = this.safeString (response, 'inAmount');
        const outAmount = this.safeString (response, 'outAmount');
        if (inAmount === undefined || outAmount === undefined) {
            throw new ExchangeError (this.id + ' fetchConvertQuote() response is missing inAmount or outAmount');
        }
        const fromAmount = Precise.stringDiv (inAmount, inputMultiplier);
        const toAmount = Precise.stringDiv (outAmount, outputMultiplier);
        return {
            'info': response,
            'id': this.safeString (response, 'requestId'),
            'fromCurrency': fromCode,
            'fromAmount': this.parseNumber (fromAmount),
            'toCurrency': toCode,
            'toAmount': this.parseNumber (toAmount),
            'price': this.parseNumber (Precise.stringDiv (toAmount, fromAmount)),
            'fee': undefined,
        };
    }

    /**
     * @method
     * @name jupiter#createConvertTrade
     * @description executes a quoted token conversion with a caller-signed Solana transaction
     * @see https://developers.jup.ag/docs/api-reference/swap/execute
     * @param {string} id request id returned by the quote
     * @param {string} fromCode currency code or mint address converted from
     * @param {string} toCode currency code or mint address converted to
     * @param {float} [amount] amount of the from currency converted
     * @param {object} [params] exchange-specific parameters
     * @param {string} params.signedTransaction base64-encoded transaction signed by the wallet
     * @param {string} [params.lastValidBlockHeight] block height from the quote transaction
     * @param {int} [params.fromDecimals] input token decimal places when metadata cannot be resolved
     * @param {int} [params.toDecimals] output token decimal places when metadata cannot be resolved
     * @returns {object} a [conversion structure](https://docs.ccxt.com/#/?id=conversion-structure)
     */
    override async createConvertTrade (id: string, fromCode: string, toCode: string, amount: Num = undefined, params: Dict = {}): Promise<Conversion> {
        if (amount !== undefined && amount <= 0) {
            throw new InvalidOrder (this.id + ' createConvertTrade() amount must be positive');
        }
        if (id.length === 0) {
            throw new ArgumentsRequired (this.id + ' createConvertTrade() requires a request id from the quote');
        }
        const signedTransaction = this.safeString (params, 'signedTransaction');
        if (signedTransaction === undefined) {
            throw new ArgumentsRequired (this.id + ' createConvertTrade() requires params.signedTransaction; Jupiter does not sign transactions');
        }
        const fromCurrency = await this.lookupJupiterCurrency (fromCode);
        const toCurrency = await this.lookupJupiterCurrency (toCode);
        const fromDecimals = this.safeInteger (params, 'fromDecimals', fromCurrency['precision']);
        const toDecimals = this.safeInteger (params, 'toDecimals', toCurrency['precision']);
        if (fromDecimals === undefined || toDecimals === undefined) {
            throw new ArgumentsRequired (this.id + ' createConvertTrade() requires token decimal metadata');
        }
        const request: Dict = {
            'requestId': id,
            'signedTransaction': signedTransaction,
        };
        const lastValidBlockHeight = this.safeString (params, 'lastValidBlockHeight');
        if (lastValidBlockHeight !== undefined) {
            request['lastValidBlockHeight'] = lastValidBlockHeight;
        }
        const response = await this.publicPostSwapV2Execute (request);
        const status = this.safeString (response, 'status');
        if (status !== 'Success') {
            const error = this.safeString (response, 'error', this.json (response));
            throw new ExchangeError (this.id + ' createConvertTrade() failed: ' + error);
        }
        const inputAmount = this.safeString (response, 'totalInputAmount');
        const outputAmount = this.safeString (response, 'totalOutputAmount');
        if (fromDecimals === undefined || toDecimals === undefined || inputAmount === undefined || outputAmount === undefined) {
            throw new ExchangeError (this.id + ' createConvertTrade() response is missing token amounts or decimal metadata');
        }
        const fromAmount = Precise.stringDiv (inputAmount, '1' + '0'.repeat (fromDecimals));
        const toAmount = Precise.stringDiv (outputAmount, '1' + '0'.repeat (toDecimals));
        return {
            'info': response,
            'id': this.safeString (response, 'signature'),
            'fromCurrency': fromCode,
            'fromAmount': this.parseNumber (fromAmount),
            'toCurrency': toCode,
            'toAmount': this.parseNumber (toAmount),
            'price': this.parseNumber (Precise.stringDiv (toAmount, fromAmount)),
            'fee': undefined,
        };
    }

    /**
     * @ignore
     * @param {string} code unified token code or mint address
     * @returns {object} currency metadata
     */
    async lookupJupiterCurrency (code: string): Promise<CurrencyInterface> {
        const cached = this.safeDict (this.currencies, code) as CurrencyInterface;
        if (cached !== undefined) {
            return cached;
        }
        const currencies = await this.fetchCurrencies ({ 'query': code });
        if (currencies[code] !== undefined) {
            return currencies[code];
        }
        const codes = Object.keys (currencies);
        for (let i = 0; i < codes.length; i++) {
            const currency = currencies[codes[i]];
            if (currency['id'] === code) {
                return currency;
            }
        }
        throw new BadSymbol (this.id + ' could not find token ' + code);
    }

    override sign (path: string, api: string[] = [ 'public' ], method: string = 'GET', params: Dict = {}): Dict {
        const url = this.urls['api'][api[0]] + '/' + path;
        const requestUrl = (method === 'GET' && Object.keys (params).length > 0) ? url + '?' + this.urlencode (params) : url;
        const requestHeaders: Dict = {
            'Accept': 'application/json',
        };
        if (this.apiKey !== undefined) {
            requestHeaders['x-api-key'] = this.apiKey;
        }
        if ((api[0] === 'trigger') && (api[1] === 'private') && (path !== 'auth/refresh')) {
            const jwtToken = this.safeString (this.options, 'jwt');
            if (jwtToken !== undefined) {
                requestHeaders['Authorization'] = 'Bearer ' + jwtToken;
            }
        }
        let requestBody: any = undefined;
        if (method !== 'GET') {
            if ((api[0] === 'studio') && (path === 'dbc-pool/submit')) {
                const boundary = '--------------------------' + this.randomBytes (12);
                const eol = '\r\n';
                requestHeaders['Content-Type'] = 'multipart/form-data; boundary=' + boundary;
                let multipartBody = '';
                const bodyKeys = Object.keys (params);
                for (let i = 0; i < bodyKeys.length; i++) {
                    const bodyKey = bodyKeys[i];
                    const fieldValue = params[bodyKey];
                    if (fieldValue === undefined || fieldValue === null) {
                        continue;
                    }
                    let encodedValue = fieldValue;
                    if (typeof fieldValue !== 'string') {
                        encodedValue = this.json (fieldValue);
                    }
                    multipartBody += '--' + boundary + eol + 'Content-Disposition: form-data; name="' + bodyKey + '"' + eol + eol + encodedValue + eol;
                }
                multipartBody += '--' + boundary + '--' + eol;
                requestBody = multipartBody;
            } else {
                requestHeaders['Content-Type'] = 'application/json';
                requestBody = this.json (params);
            }
        }
        return {
            'url': requestUrl,
            'method': method,
            'body': requestBody,
            'headers': requestHeaders,
        };
    }

    override handleErrors (httpCode: number, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): undefined {
        if (response === undefined || response === null) {
            return undefined;
        }
        const error = this.safeString2 (response, 'error', 'message');
        if (error !== undefined) {
            throw new ExchangeError (this.id + ' ' + error);
        }
        return undefined;
    }
}
