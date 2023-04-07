const ccxt = require ('../../ccxt');

const exchange = new ccxt.gateio ({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET_KEY',
    'enableRateLimit': true,
})

// IMPORTANT: To test without losing assets, add an asset you don't have on the account
const tokenWithdrawData = {
    tokenSymbol: "ADA",
    amount: "0.51829369992939",
    chain: "ADA",
    recipientAddress: "YOUR_WALLET_ADDRESS",
};

const params = {
    network: 'ADA', // 'ERC20', 'TRC20', 'BSC', default is ERC20
    code: 'ADA',
};

;(async () => {
    try {
        const result = await exchange.withdraw(tokenWithdrawData.tokenSymbol, tokenWithdrawData.amount, tokenWithdrawData.recipientAddress, undefined, params);
        console.log(result);
    } catch (e) {
        console.log (e.constructor.name, e.message)
    }
}) ()