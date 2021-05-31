const ccxt = require ('../../ccxt');

const dydx = ccxt.dydx ({
    'walletAddress': 'YOUR_ETH_WALLET_ADDRESS',
    'privateKey': 'YOUR_ETH_PRIVATE_KEY',
    'apiKey': 'YOUR_dYdX_API_KEY',
    'secret': 'YOUR_dYdX_API_SECRET',
    'passPhrase': 'YOUR_dYdX_API_PASSPHRASE',
    'starkPublicKey': 'YOUR_STARK_PUBLIC_KEY',
    'starkPrivateKey': 'YOUR_STARK_PRIVATE_KEY',
})

;(async () => {
    console.log (await idex.fetchBalance ())
}) ()
