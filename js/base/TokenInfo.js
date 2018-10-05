'use strict';

const fs = require('fs');
const path = require('path');

module.exports = class TokenInfo {
    static getFromAddress(address) {
        if (!this.addressIndexed) {
            const file = path.join(__dirname, '..', '..', 'tokens.json');
            const data = fs.readFileSync(file);
            const tokens = JSON.parse(data.toString());
            const result = {};
            for (let i = 0; i < tokens.length; i++) {
                const token = tokens[i];
                result[token.address.toLowerCase()] = {
                    name: token.name,
                    address: token.address,
                    symbol: token.symbol,
                    decimals: token.decimals,
                };
            }
            this.addressIndexed = result;
        }
        return this.addressIndexed[address.toLowerCase()];
    }

    static getFromSymbol(symbol) {
        if (!this.symbolIndexed) {
            const file = path.join(__dirname, '..', '..', 'tokens.json');
            const data = fs.readFileSync(file);
            const tokens = JSON.parse(data.toString());
            const result = {};
            for (let i = 0; i < tokens.length; i++) {
                const token = tokens[i];
                result[token.symbol] = {
                    name: token.name,
                    address: token.address,
                    symbol: token.symbol,
                    decimals: token.decimals,
                };
            }
            this.symbolIndexed = result;
        }
        return this.symbolIndexed[symbol.toUpperCase()];
    }
};
