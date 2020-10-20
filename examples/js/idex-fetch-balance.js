const ccxt = require ('../../ccxt');

const idex = ccxt.idex ({
    'apiKey': 'YOUR_IDEX_API_KEY',
    'secret': 'YOUR_IDEX_SECRET',
    'walletAddress': '0xYOUR_ETHEREUM_WALLET_ADDRESS',
    'privateKey': '0xYOUR_ETHEREUM_PRIVATE_KEY',
    'verbose': 0,
})

;(async () => {
    console.log (await idex.fetchBalance ())
}) ()
