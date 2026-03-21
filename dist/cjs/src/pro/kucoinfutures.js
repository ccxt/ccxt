'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var kucoin = require('./kucoin.js');
var errors = require('../base/errors.js');

// ----------------------------------------------------------------------------
// ---------------------------------------------------------------------------
class kucoinfutures extends kucoin["default"] {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'kucoinfutures',
            'name': 'KuCoin Futures',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/147508995-9e35030a-d046-43a1-a006-6fabd981b554.jpg',
                'www': 'https://futures.kucoin.com/',
                'referral': 'https://futures.kucoin.com/?rcode=E5wkqe',
            },
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': true,
                'option': undefined,
                'fetchBidsAsks': true,
            },
            'options': {
                'fetchMarkets': {
                    'types': ['swap', 'future', 'contract'],
                    'fetchTickersFees': false,
                },
                'defaultType': 'swap',
                'defaultAccountType': 'contract',
                'uta': false,
            },
        });
    }
    /**
     * @method
     * @name kucoinfutures#fetchBidsAsks
     * @description fetches the bid and ask price and volume for multiple markets
     * @param {string[]} [symbols] unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async fetchBidsAsks(symbols = undefined, params = {}) {
        const request = {
            'method': 'futuresPublicGetAllTickers',
        };
        return await this.fetchTickers(symbols, this.extend(request, params));
    }
    /**
     * @method
     * @name kucoinfutures#transfer
     * @description transfer currency internally between wallets on the same account
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    async transfer(code, amount, fromAccount, toAccount, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const amountToPrecision = this.currencyToPrecision(code, amount);
        const request = {
            'currency': this.safeString(currency, 'id'),
            'amount': amountToPrecision,
        };
        const toAccountString = this.parseTransferType(toAccount);
        let response = undefined;
        if (toAccountString === 'TRADE' || toAccountString === 'MAIN') {
            request['recAccountType'] = toAccountString;
            response = await this.futuresPrivatePostTransferOut(this.extend(request, params));
            //
            //     {
            //         "code": "200000",
            //         "data": {
            //             "applyId": "6738754373ceee00011ec3f8",
            //             "bizNo": "6738754373ceee00011ec3f7",
            //             "payAccountType": "CONTRACT",
            //             "payTag": "DEFAULT",
            //             "remark": "",
            //             "recAccountType": "MAIN",
            //             "recTag": "DEFAULT",
            //             "recRemark": "",
            //             "recSystem": "KUCOIN",
            //             "status": "PROCESSING",
            //             "currency": "USDT",
            //             "amount": "5",
            //             "fee": "0",
            //             "sn": 1519769124846692,
            //             "reason": "",
            //             "createdAt": 1731753283000,
            //             "updatedAt": 1731753283000
            //         }
            //     }
            //
        }
        else if (toAccount === 'future' || toAccount === 'swap' || toAccount === 'contract') {
            request['payAccountType'] = this.parseTransferType(fromAccount);
            response = await this.futuresPrivatePostTransferIn(this.extend(request, params));
            //
            //    {
            //        "code": "200000",
            //        "data": {
            //            "applyId": "5bffb63303aa675e8bbe18f9" // Transfer-out request ID
            //        }
            //    }
            //
        }
        else {
            throw new errors.BadRequest(this.id + ' transfer() only supports transfers between future/swap, spot and funding accounts');
        }
        const data = this.safeDict(response, 'data', {});
        return this.extend(this.parseTransfer(data, currency), {
            'amount': this.parseNumber(amountToPrecision),
            'fromAccount': fromAccount,
            'toAccount': toAccount,
        });
    }
    parseTransferType(transferType) {
        const transferTypes = {
            'spot': 'TRADE',
            'funding': 'MAIN',
        };
        return this.safeStringUpper(transferTypes, transferType, transferType);
    }
}

exports["default"] = kucoinfutures;
