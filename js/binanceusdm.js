'use strict';

//  ---------------------------------------------------------------------------

const binance = require ('./binance.js');
const { BadRequest } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class binanceusdm extends binance {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'binanceusdm',
            'name': 'Binance USDⓈ-M',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/117738721-668c8d80-b205-11eb-8c49-3fad84c4a07f.jpg',
            },
            'has': {
                'fetchPositions': true,
                'fetchIsolatedPositions': true,
                'fetchFundingRate': true,
                'fetchFundingHistory': true,
                'setLeverage': true,
                'setMarginMode': true,
            },
            'options': {
                'defaultType': 'future',
                // https://www.binance.com/en/support/faq/360033162192
                // tier amount, maintenance margin, initial margin
                'leverageBrackets': undefined,
                'marginTypes': {},
            },
            // https://www.binance.com/en/fee/futureFee
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': this.parseNumber ('0.000400'),
                    'maker': this.parseNumber ('0.000200'),
                    'tiers': {
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.000400') ],
                            [ this.parseNumber ('250'), this.parseNumber ('0.000400') ],
                            [ this.parseNumber ('2500'), this.parseNumber ('0.000350') ],
                            [ this.parseNumber ('7500'), this.parseNumber ('0.000320') ],
                            [ this.parseNumber ('22500'), this.parseNumber ('0.000300') ],
                            [ this.parseNumber ('50000'), this.parseNumber ('0.000270') ],
                            [ this.parseNumber ('100000'), this.parseNumber ('0.000250') ],
                            [ this.parseNumber ('200000'), this.parseNumber ('0.000220') ],
                            [ this.parseNumber ('400000'), this.parseNumber ('0.000200') ],
                            [ this.parseNumber ('750000'), this.parseNumber ('0.000170') ],
                        ],
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.000200') ],
                            [ this.parseNumber ('250'), this.parseNumber ('0.000160') ],
                            [ this.parseNumber ('2500'), this.parseNumber ('0.000140') ],
                            [ this.parseNumber ('7500'), this.parseNumber ('0.000120') ],
                            [ this.parseNumber ('22500'), this.parseNumber ('0.000100') ],
                            [ this.parseNumber ('50000'), this.parseNumber ('0.000080') ],
                            [ this.parseNumber ('100000'), this.parseNumber ('0.000060') ],
                            [ this.parseNumber ('200000'), this.parseNumber ('0.000040') ],
                            [ this.parseNumber ('400000'), this.parseNumber ('0.000020') ],
                            [ this.parseNumber ('750000'), this.parseNumber ('0') ],
                        ],
                    },
                },
            },
        });
    }

    async fetchTradingFees (params = {}) {
        await this.loadMarkets ();
        const marketSymbols = Object.keys (this.markets);
        const fees = {};
        const accountInfo = await this.fapiPrivateGetAccount (params);
        // {
        //     "feeTier": 0,       // account commisssion tier
        //     "canTrade": true,   // if can trade
        //     "canDeposit": true,     // if can transfer in asset
        //     "canWithdraw": true,    // if can transfer out asset
        //     "updateTime": 0,
        //     "totalInitialMargin": "0.00000000",    // total initial margin required with current mark price (useless with isolated positions), only for USDT asset
        //     "totalMaintMargin": "0.00000000",     // total maintenance margin required, only for USDT asset
        //     "totalWalletBalance": "23.72469206",     // total wallet balance, only for USDT asset
        //     "totalUnrealizedProfit": "0.00000000",   // total unrealized profit, only for USDT asset
        //     "totalMarginBalance": "23.72469206",     // total margin balance, only for USDT asset
        //     "totalPositionInitialMargin": "0.00000000",    // initial margin required for positions with current mark price, only for USDT asset
        //     "totalOpenOrderInitialMargin": "0.00000000",   // initial margin required for open orders with current mark price, only for USDT asset
        //     "totalCrossWalletBalance": "23.72469206",      // crossed wallet balance, only for USDT asset
        //     "totalCrossUnPnl": "0.00000000",      // unrealized profit of crossed positions, only for USDT asset
        //     "availableBalance": "23.72469206",       // available balance, only for USDT asset
        //     "maxWithdrawAmount": "23.72469206"     // maximum amount for transfer out, only for USDT asset
        //     ...
        // }
        const feeTier = this.safeInteger (accountInfo, 'feeTier');
        const feeTiers = this.fees['trading']['tiers'];
        const maker = feeTiers['maker'][feeTier][1];
        const taker = feeTiers['taker'][feeTier][1];
        for (let i = 0; i < marketSymbols.length; i++) {
            const symbol = marketSymbols[i];
            fees[symbol] = {
                'info': {
                    'feeTier': feeTier,
                },
                'symbol': symbol,
                'maker': maker,
                'taker': taker,
            };
        }
        return fees;
    }

    async transferIn (code, amount, params = {}) {
        // transfer from spot wallet to usdm futures wallet
        return await this.futuresTransfer (code, amount, 1, params);
    }

    async transferOut (code, amount, params = {}) {
        // transfer from usdm futures wallet to spot wallet
        return await this.futuresTransfer (code, amount, 2, params);
    }

    async fetchFundingRate (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.fapiPublicGetPremiumIndex (this.extend (request, params));
        //
        //   {
        //     "symbol": "BTCUSDT",
        //     "markPrice": "45802.81129892",
        //     "indexPrice": "45745.47701915",
        //     "estimatedSettlePrice": "45133.91753671",
        //     "lastFundingRate": "0.00063521",
        //     "interestRate": "0.00010000",
        //     "nextFundingTime": "1621267200000",
        //     "time": "1621252344001"
        //  }
        //
        return this.parseFundingRate (response);
    }

    async fetchFundingRates (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.fapiPublicGetPremiumIndex (params);
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const parsed = this.parseFundingRate (entry);
            result.push (parsed);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async loadLeverageBrackets (reload = false, params = {}) {
        await this.loadMarkets ();
        // by default cache the leverage bracket
        // it contains useful stuff like the maintenance margin and initial margin for positions
        const leverageBrackets = this.safeValue (this.options, 'leverageBrackets');
        if ((leverageBrackets === undefined) || (reload)) {
            const response = await this.fapiPrivateGetLeverageBracket (params);
            this.options['leverageBrackets'] = {};
            for (let i = 0; i < response.length; i++) {
                const entry = response[i];
                const marketId = this.safeString (entry, 'symbol');
                const symbol = this.safeSymbol (marketId);
                const brackets = this.safeValue (entry, 'brackets');
                const result = [];
                for (let j = 0; j < brackets.length; j++) {
                    const bracket = brackets[j];
                    // we use floats here internally on purpose
                    const notionalFloor = this.safeFloat (bracket, 'notionalFloor');
                    const maintenanceMarginPercentage = this.safeString (bracket, 'maintMarginRatio');
                    result.push ([ notionalFloor, maintenanceMarginPercentage ]);
                }
                this.options['leverageBrackets'][symbol] = result;
            }
        }
        return this.options['leverageBrackets'];
    }

    async fetchPositions (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadLeverageBrackets ();
        const account = await this.fapiPrivateGetAccount (params);
        const result = this.parseAccountPositions (account);
        return this.filterByArray (result, 'symbol', symbols, false);
    }

    async fetchIsolatedPositions (symbol = undefined, params = {}) {
        // only supported in usdm futures
        await this.loadMarkets ();
        await this.loadLeverageBrackets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.fapiPrivateGetPositionRisk (this.extend (request, params));
        if (symbol === undefined) {
            const result = [];
            for (let i = 0; i < response.length; i++) {
                const parsed = this.parsePositionRisk (response[i], market);
                if (parsed['marginType'] === 'isolated') {
                    result.push (parsed);
                }
            }
            return result;
        } else {
            return this.parsePositionRisk (this.safeValue (response, 0), market);
        }
    }

    async fetchFundingHistory (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        // "TRANSFER"，"WELCOME_BONUS", "REALIZED_PNL"，"FUNDING_FEE", "COMMISSION" and "INSURANCE_CLEAR"
        const request = {
            'incomeType': 'FUNDING_FEE',
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.fapiPrivateGetIncome (this.extend (request, params));
        return this.parseIncomes (response, market, since, limit);
    }

    async setLeverage (symbol, leverage, params = {}) {
        // WARNING: THIS WILL INCREASE LIQUIDATION PRICE FOR OPEN ISOLATED LONG POSITIONS
        // AND DECREASE LIQUIDATION PRICE FOR OPEN ISOLATED SHORT POSITIONS
        if ((leverage < 1) || (leverage > 125)) {
            throw new BadRequest (this.id + ' leverage should be between 1 and 125');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'leverage': leverage,
        };
        return await this.fapiPrivatePostLeverage (this.extend (request, params));
    }

    async setMarginMode (symbol, marginType, params = {}) {
        //
        // { "code": -4048 , "msg": "Margin type cannot be changed if there exists position." }
        //
        // or
        //
        // { "code": 200, "msg": "success" }
        //
        marginType = marginType.toUpperCase ();
        if ((marginType !== 'ISOLATED') && (marginType !== 'CROSSED')) {
            throw new BadRequest (this.id + ' marginType must be either isolated or crossed');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'marginType': marginType,
        };
        return await this.fapiPrivatePostMarginType (this.extend (request, params));
    }
};
