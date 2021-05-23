'use strict';

//  ---------------------------------------------------------------------------

const binance = require ('./binance.js');
const { BadRequest } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class binancecoinm extends binance {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'binancecoinm',
            'name': 'Binance COIN-M',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/117738721-668c8d80-b205-11eb-8c49-3fad84c4a07f.jpg',
            },
            'options': {
                'defaultType': 'delivery',
                'leverageBrackets': undefined,
            },
            'has': {
                'fetchPositions': true,
                'fetchIsolatedPositions': true,
                'fetchFundingRate': true,
                'fetchFundingHistory': true,
                'setLeverage': true,
                'setMode': true,
            },
            // https://www.binance.com/en/fee/deliveryFee
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': this.parseNumber ('0.000500'),
                    'maker': this.parseNumber ('0.000100'),
                    'tiers': {
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.000500') ],
                            [ this.parseNumber ('250'), this.parseNumber ('0.000450') ],
                            [ this.parseNumber ('2500'), this.parseNumber ('0.000400') ],
                            [ this.parseNumber ('7500'), this.parseNumber ('0.000300') ],
                            [ this.parseNumber ('22500'), this.parseNumber ('0.000250') ],
                            [ this.parseNumber ('50000'), this.parseNumber ('0.000240') ],
                            [ this.parseNumber ('100000'), this.parseNumber ('0.000240') ],
                            [ this.parseNumber ('200000'), this.parseNumber ('0.000240') ],
                            [ this.parseNumber ('400000'), this.parseNumber ('0.000240') ],
                            [ this.parseNumber ('750000'), this.parseNumber ('0.000240') ],
                        ],
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.000100') ],
                            [ this.parseNumber ('250'), this.parseNumber ('0.000080') ],
                            [ this.parseNumber ('2500'), this.parseNumber ('0.000050') ],
                            [ this.parseNumber ('7500'), this.parseNumber ('0.0000030') ],
                            [ this.parseNumber ('22500'), this.parseNumber ('0') ],
                            [ this.parseNumber ('50000'), this.parseNumber ('-0.000050') ],
                            [ this.parseNumber ('100000'), this.parseNumber ('-0.000060') ],
                            [ this.parseNumber ('200000'), this.parseNumber ('-0.000070') ],
                            [ this.parseNumber ('400000'), this.parseNumber ('-0.000080') ],
                            [ this.parseNumber ('750000'), this.parseNumber ('-0.000090') ],
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
        const accountInfo = await this.dapiPrivateGetAccount (params);
        //
        // {
        //      "canDeposit": true,
        //      "canTrade": true,
        //      "canWithdraw": true,
        //      "feeTier": 2,
        //      "updateTime": 0
        //      ...
        //  }
        //
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
        // transfer from spot wallet to coinm futures wallet
        return await this.futuresTransfer (code, amount, 3, params);
    }

    async transferOut (code, amount, params = {}) {
        // transfer from coinm futures wallet to spot wallet
        return await this.futuresTransfer (code, amount, 4, params);
    }

    async fetchFundingRate (symbol = undefined, params = undefined) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.dapiPublicGetPremiumIndex (this.extend (request, params));
        //
        //   {
        //     "symbol": "BTCUSD",
        //     "markPrice": "45802.81129892",
        //     "indexPrice": "45745.47701915",
        //     "estimatedSettlePrice": "45133.91753671",
        //     "lastFundingRate": "0.00063521",
        //     "interestRate": "0.00010000",
        //     "nextFundingTime": "1621267200000",
        //     "time": "1621252344001"
        //  }
        //
        if (Array.isArray (response)) {
            const result = [];
            const values = Object.values (response);
            for (let i = 0; i < values.length; i++) {
                const parsed = this.parseFundingRate (values[i]);
                result.push (parsed);
            }
            return result;
        } else {
            return this.parseFundingRate (response);
        }
    }

    async loadLeverageBrackets (reload = false, params = {}) {
        await this.loadMarkets ();
        // by default cache the leverage bracket
        // it contains useful stuff like the maintenance margin and initial margin for positions
        if ((this.options['leverageBrackets'] === undefined) || (reload)) {
            const response = await this.dapiPrivateV2GetLeverageBracket (params);
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
                    const qtyFloor = this.safeFloat (bracket, 'qtyFloor');
                    const maintenanceMarginPercentage = this.safeString (bracket, 'maintMarginRatio');
                    result.push ([ qtyFloor, maintenanceMarginPercentage ]);
                }
                this.options['leverageBrackets'][symbol] = result;
            }
        }
        return this.options['leverageBrackets'];
    }

    async fetchPositions (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadLeverageBrackets ();
        const account = await this.dapiPrivateGetAccount (params);
        const result = this.parseAccountPositions (account);
        if (symbols === undefined) {
            return result;
        } else {
            return this.filterByArray (result, 'symbol', symbols, false);
        }
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
        const response = await this.dapiPrivateGetPositionRisk (this.extend (request, params));
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

    async fetchFundingHistory (symbol = undefined, since = undefined, limit = undefined, params = undefined) {
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
        const response = await this.dapiPrivateGetIncome (this.extend (request, params));
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
        return await this.dapiPrivatePostLeverage (this.extend (request, params));
    }

    async setMode (symbol, marginType, params = {}) {
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
        return await this.dapiPrivatePostMarginType (this.extend (request, params));
    }
};
