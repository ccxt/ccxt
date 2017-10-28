"use strict";

const btce = require ('./btce.js')

module.exports = Object.assign ({}, btce, {

    'id': 'liqui',
    'name': 'Liqui',
    'countries': 'UA',
    'rateLimit': 2500,
    'version': '3',
    'hasCORS': false,
    'hasFetchOrder': true,
    'hasFetchOrders': true,
    'hasFetchOpenOrders': true,
    'hasFetchClosedOrders': true,
    'hasFetchTickers': true,
    'hasFetchMyTrades': true,
    'hasWithdraw': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27982022-75aea828-63a0-11e7-9511-ca584a8edd74.jpg',
        'api': {
            'public': 'https://api.liqui.io/api',
            'private': 'https://api.liqui.io/tapi',
        },
        'www': 'https://liqui.io',
        'doc': 'https://liqui.io/api',
        'fees': 'https://liqui.io/fee',
    },
    'api': {
        'public': {
            'get': [
                'info',
                'ticker/{pair}',
                'depth/{pair}',
                'trades/{pair}',
            ],
        },
        'private': {
            'post': [
                'getInfo',
                'Trade',
                'ActiveOrders',
                'OrderInfo',
                'CancelOrder',
                'TradeHistory',
                'TransHistory',
                'CoinDepositAddress',
                'WithdrawCoin',
                'CreateCoupon',
                'RedeemCoupon',
            ],
        },
    },
    'fees': {
        'trading': {
            'maker': 0.001,
            'taker': 0.0025,
        },
        'funding': 0.0,
    },

    async withdraw (currency, amount, address, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostWithdrawCoin (this.extend ({
            'coinName': currency,
            'amount': parseFloat (amount),
            'address': address,
        }, params));
        return {
            'info': response,
            'id': response['return']['tId'],
        };
    },
})