'use strict';

//  ---------------------------------------------------------------------------

const binance = require ('./binance.js');

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
};
