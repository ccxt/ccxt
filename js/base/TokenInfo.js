'use strict';

const fs = require ('fs');
const path = require ('path');

module.exports = class TokenInfo {
    static getFromAddress (address) {
        if (!this.tokenInfo) {
            const file = path.join (__dirname, '..', '..', 'tokens.json');
            const data = fs.readFileSync (file);
            const tokens = JSON.parse (data.toString ());
            const result = {};
            for (let i = 0; i < tokens.length; i++) {
                const token = tokens[i];
                result[token.address.toLowerCase ()] = {
                    name: token.name,
                    address: token.address,
                    symbol: token.symbol,
                    decimals: token.decimals,
                };
            }
            this.tokenInfo = result;
        }
        return this.tokenInfo[address.toLowerCase ()];
    }
};
