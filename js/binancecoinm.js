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
};
