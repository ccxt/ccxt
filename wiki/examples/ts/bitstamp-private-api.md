```javascript
// @NO_AUTO_TRANSPILE



import ccxt from '../../js/ccxt.js';
import asTable from 'as-table';
import ololog from 'ololog'
import ansicolor from 'ansicolor';

const log = ololog.configure({ locate: false })

ansicolor.nice

    ;(async () => {
        let apiUrl = 'https://www.bitstamp.net/api';

        // instantiate the exchange
        let exchange = new ccxt.bitstamp({
            'apiKey': 'APIKEY',
            'secret': 'APISECRET',
            'uid': 'ACCOUNTID',
            'urls': {
                'api': {
                    'public': apiUrl,
                    'private': apiUrl,
                    'v1': apiUrl
                }
            }
        })

        try {
            // fetch account balance from the exchange
            let balance = await exchange.fetchBalance()
            log(('balance' as any).green, balance.total)

            // fetch fees
            let singleFee = await exchange.fetchTradingFee('BTC/USD')
            log(('fee' as any).green, 'BTC/USD', singleFee)
            let tradingFees = await exchange.fetchTradingFees()
            log(('tradingFees' as any).green, tradingFees)
            // @ts-expect-error
            let fundingFees = await exchange.fetchFundingFees()
            log(('fundingFees' as any).green, fundingFees)
            // @ts-expect-error
            let fees = await exchange.fetchFees()
            log(('fees' as any).green, fees)

            // my trades
            let myTrades = await exchange.fetchMyTrades('BTC/USD', undefined, 5)
            log(('myTrades' as any).green, asTable(myTrades))

            // user transactions
            let transactions = await exchange.fetchTransactions()
            log(('Transactions' as any).green, asTable(transactions))

            // ledger
            let ledger = await exchange.fetchLedger()
            log(('Ledger' as any).green, asTable(ledger))

            // deposits
            let deposits = await exchange.fetchDeposits()
            log(('Deposits' as any).green, asTable(deposits))

            // create new limit order
            let newOrder = await exchange.createOrder('BTC/USD', 'limit', 'buy', 0.01, 8000)
            console.log(('New limit order' as any).green, newOrder);

            // open orders
            let openOrders = await exchange.fetchOpenOrders()
            log(('Open orders' as any).green, asTable(openOrders))

            // order data
            let orderData = await exchange.fetchOrder(newOrder.id)
            console.log(('Order data' as any).green, orderData);

            // cancel order
            let canceledOrder = await exchange.cancelOrder(newOrder.id)
            console.log(('Canceled order' as any).green, canceledOrder);

            // create market order
            let marketOrder = await exchange.createOrder('BTC/USD', 'market', 'buy', 0.01)
            console.log(('New market order' as any).green, marketOrder);

            // open orders
            let secondOpenOrders = await exchange.fetchOpenOrders()
            log(('Open orders' as any).green, asTable(secondOpenOrders))

            // deposit address
            let paxDeposit = await exchange.fetchDepositAddress("XLM")
            log(('Pax deposit address' as any).green, paxDeposit)

            // withdrawal
            let ethWithdraw = await exchange.withdraw("ETH", 0.01, "0x6c28cb9dd2f4e3bb6f56c822bc306f3b8a3e7c08")
            log(('ETH withdrawal' as any).green, ethWithdraw)

            // withdrawals
            let withdrawals = await exchange.fetchWithdrawals()
            log(('Withdrawals' as any).green, asTable(withdrawals))

        } catch (e) {

            if (e instanceof ccxt.DDoSProtection || e.message.includes('ECONNRESET')) {
                log.bright.yellow('[DDoS Protection] ' + e.message)
            } else if (e instanceof ccxt.RequestTimeout) {
                log.bright.yellow('[Request Timeout] ' + e.message)
            } else if (e instanceof ccxt.AuthenticationError) {
                log.bright.yellow('[Authentication Error] ' + e.message)
            } else if (e instanceof ccxt.ExchangeNotAvailable) {
                log.bright.yellow('[Exchange Not Available Error] ' + e.message)
            } else if (e instanceof ccxt.ExchangeError) {
                log.bright.yellow('[Exchange Error] ' + e.message)
            } else if (e instanceof ccxt.NetworkError) {
                log.bright.yellow('[Network Error] ' + e.message)
            } else {
                throw e;
            }
        }

    })()
```
