const ccxt = require ('../../ccxt')

const bitpanda = new ccxt.bitpanda ({
    "apiKey": "eyJvcmciOiJiaXRwYW5kYS1nZSIsImFsZyI6IlJTMjU2Iiwia2lkIjoiZXhjaGFuZ2UtbGl2ZSJ9.eyJhdWQiOlsiaHR0cHM6XC9cL2FwaS5leGNoYW5nZS5iaXRwYW5kYS5jb20iLCJ3c3M6XC9cL3N0cmVhbXMuZXhjaGFuZ2UuYml0cGFuZGEuY29tIl0sInN1YiI6ImFjYzpjYjk2Y2RjNS1hZjY3LTQyNzMtOGUwNi05NjYwMTU3NjcxZmYiLCJzY3AiOlsiV0lUSERSQVciLCJSRUFEX09OTFkiLCJUUkFERSJdLCJuYmYiOjE2MjY5NTcyODEsImlzcyI6Imh0dHBzOlwvXC9hcGkuZXhjaGFuZ2UuYml0cGFuZGEuY29tXC9vYXV0aDIiLCJpcHMiOltdLCJpYXQiOjE2MjY5NTcyODEsImp0aSI6IjVkOWYwOThmLWZlNmEtNDg3YS1hMmM1LWNiMTE4MmZjN2FkYiJ9.AdhVvyBidRIOHsi0FUuKhybCSDdhZe3e420IctPsLPKVDS-BbnaTQtNZv18AXwvNkVm1F4bD_Y7V_wyGIRkTKf2zqlJwFH_N7kB0nJwWn_p12UJ4QygjERHFV0QiOFFbujjoUmO7afvSTqPnWjynjjCao7tDvEGXcjYglGrLma9IcLmzKh3TjwqXIjdXiofjsx8kJ7nHWmXsk91tx1e-HZ2c6sM0XQ8UG3-dugUluO-Y7bppL2ZwQqNkq9mN-uancer7lmMpBzKIGcVtktSIXeS3txwpVuh5NxglSX9lwf0judZxZLggqg69oYJIX_vBL8P8zenTtxv68G9D9M-gdohqKU8gEZN8NYHIh_PJa2MFPkyrLiiryj7XZNTbXAbw3jYhw-sY1nN8tlMhPRMrMAOqpFVgJvihnYBz26YlRXNq5sFMIKSl0tQB0LMbRiwRlPo4kVKY2sPADetKJk3ZlbX4MsUDBgR7MAYaM2bSx7V-WNeCaykIGMrUdMf1uzGXHAtRg1h9Vlb_BmlmnoghCcgiEdMOxmKIdgJ1uUUOrM8q8UQ6uqZvLJb_lAqZzljMcx2QMccESarOb7aRuBJGjZZzAC7QfP-ggHRJy8O06zANGuoSCHz3PNZNg883j-9_85AC1Vbw4KFHTMtwZd0jnMEzPGFVtdw08gGVk1HJph8"
})

;(async () => {
    const market = {
        symbol: 'USDT/EUR',
        base: 'USDT',
        quote: 'EUR',
    }
    console.log ('fetching', market.symbol, 'trades on bitpanda')
    console.log ('---------------------------------------------')
    const trades = await bitpanda.fetchMyTrades ('USDT/EUR')
    const makers = trades.filter (x => x.takerOrMaker === 'maker')
    const takers = trades.filter (x => x.takerOrMaker === 'taker')
    console.log ('maker volume', makers.reduce ((a, b) => a + b.amount, 0).toFixed (2), market.base, 'maker fee', makers.reduce ((a, b) => a + b.fee['cost'], 0).toFixed (2), market.base)
    console.log ('taker volume', takers.reduce ((a, b) => a + b.amount, 0).toFixed (2), market.base, 'taker fee', takers.reduce ((a, b) => a + b.fee['cost'], 0).toFixed (2), market.base)
    const sells = trades.filter (x => x.side === 'sell')
    const buys = trades.filter (x => x.side === 'buy')
    console.log ('\nsold', sells.reduce ((a, b) => a + b.amount, 0).toFixed (2), market.base, 'for', sells.reduce ((a, b) => a + b.cost, 0).toFixed (2), market.quote)
    console.log ('bought', buys.reduce ((a, b) => a + b.amount, 0).toFixed (2), market.base, 'for', buys.reduce ((a, b) => a + b.cost, 0).toFixed (2), market.quote)
}) ()