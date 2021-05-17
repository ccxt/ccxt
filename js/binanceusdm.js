'use strict';

//  ---------------------------------------------------------------------------

const binance = require ('./binance.js');

//  ---------------------------------------------------------------------------

module.exports = class binanceusdm extends binance {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'binanceusdm',
            'name': 'Binance USDⓈ-M',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/117738721-668c8d80-b205-11eb-8c49-3fad84c4a07f.jpg',
            },
            'options': {
                'defaultType': 'future',
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

    async fetchFundingRate (symbol = undefined, params = undefined) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
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
};
