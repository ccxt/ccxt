'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetGetmarketsUsa(params = {}) {
        return this.request('getmarkets/usa', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetGetmarketsEu(params = {}) {
        return this.request('getmarkets/eu', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetGetmarkets(params = {}) {
        return this.request('getmarkets', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetGetboard(params = {}) {
        return this.request('getboard', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetGetticker(params = {}) {
        return this.request('getticker', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetGetexecutions(params = {}) {
        return this.request('getexecutions', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetGethealth(params = {}) {
        return this.request('gethealth', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetGetboardstate(params = {}) {
        return this.request('getboardstate', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetGetchats(params = {}) {
        return this.request('getchats', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetGetfundingrate(params = {}) {
        return this.request('getfundingrate', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetGetfundingratehistory(params = {}) {
        return this.request('getfundingratehistory', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetGetpermissions(params = {}) {
        return this.request('getpermissions', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetGetbalance(params = {}) {
        return this.request('getbalance', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetGetbalancehistory(params = {}) {
        return this.request('getbalancehistory', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetGetcollateral(params = {}) {
        return this.request('getcollateral', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetGetcollateralhistory(params = {}) {
        return this.request('getcollateralhistory', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetGetcollateralaccounts(params = {}) {
        return this.request('getcollateralaccounts', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetGetaddresses(params = {}) {
        return this.request('getaddresses', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetGetcoinins(params = {}) {
        return this.request('getcoinins', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetGetcoinouts(params = {}) {
        return this.request('getcoinouts', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetGetbankaccounts(params = {}) {
        return this.request('getbankaccounts', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetGetdeposits(params = {}) {
        return this.request('getdeposits', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetGetwithdrawals(params = {}) {
        return this.request('getwithdrawals', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetGetchildorders(params = {}) {
        return this.request('getchildorders', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetGetparentorders(params = {}) {
        return this.request('getparentorders', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetGetparentorder(params = {}) {
        return this.request('getparentorder', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetGetexecutions(params = {}) {
        return this.request('getexecutions', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetGetpositions(params = {}) {
        return this.request('getpositions', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetGettradingcommission(params = {}) {
        return this.request('gettradingcommission', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostSendcoin(params = {}) {
        return this.request('sendcoin', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostWithdraw(params = {}) {
        return this.request('withdraw', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostSendchildorder(params = {}) {
        return this.request('sendchildorder', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCancelchildorder(params = {}) {
        return this.request('cancelchildorder', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostSendparentorder(params = {}) {
        return this.request('sendparentorder', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCancelparentorder(params = {}) {
        return this.request('cancelparentorder', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCancelallchildorders(params = {}) {
        return this.request('cancelallchildorders', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
}

exports["default"] = Exchange;
