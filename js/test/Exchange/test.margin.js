"use strict";

// ----------------------------------------------------------------------------

const assert = require("assert");

// ----------------------------------------------------------------------------

module.exports = (exchange, margin) => {
    const format = {
        info: {},
        type: "add",
        amount: 0.1,
        total: 0.29934828,
        code: "USDT",
        symbol: "ADA/USDT:USDT",
        status: "ok",
    };
    const keys = Object.keys(format);
    for (let i = 0; i < keys.length; i++) {
        assert (keys[i] in margin);
    }
    assert (typeof margin["info"] === "object");
    if (margin["type"] !== undefined) {
        assert (type === "add" || type === "reduce");
    }
    if (margin["ampunt"] !== undefined) {
        assert (typeof margin["amount"] === "number");
    }
    if (margin["total"] !== undefined) {
        assert (typeof margin["total"] === "number");
    }
    if (margin["code"] !== undefined) {
        assert (typeof margin["code"] === "string");
    }
    if (margin["symbol"] !== undefined) {
        assert (typeof margin["symbol"] === "string");
    }
    if (margin["status"] !== undefined) {
        assert ([ "ok", "pending", "canceled", "failed" ].includes (margin["status"]));
    }
};
