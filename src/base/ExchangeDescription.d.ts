import { BaseError } from './errors'
import { Market, Currency, MinMax } from './ExchangeBase'

declare abstract class ExchangeDescription {
    id: string
    name: string
    version: string
    countries: string[]
    enableRateLimit: boolean
    rateLimit: number // milliseconds = seconds * 1000
    certified: boolean

    has: {
        cancelAllOrders: boolean
        cancelOrder: boolean
        cancelOrders: boolean
        CORS: boolean
        createDepositAddress: boolean
        createLimitOrder: boolean
        createMarketOrder: boolean
        createOrder: boolean
        deposit: boolean
        editOrder: boolean | 'emulated'
        fetchBalance: boolean
        fetchBidsAsks: boolean
        fetchClosedOrders: boolean
        fetchCurrencies: boolean
        fetchDepositAddress: boolean
        fetchDeposits: boolean
        fetchFundingFees: boolean
        fetchL2OrderBook: boolean
        fetchLedger: boolean
        fetchMarkets: boolean
        fetchMyTrades: boolean
        fetchOHLCV: boolean | 'emulated'
        fetchOpenOrders: boolean
        fetchOrder: boolean
        fetchOrderBook: boolean
        fetchOrderBooks: boolean
        fetchOrders: boolean
        fetchOrderTrades: boolean
        fetchStatus: boolean | 'emulated'
        fetchTicker: boolean
        fetchTickers: boolean
        fetchTime: boolean
        fetchTrades: boolean
        fetchTradingFee: boolean
        fetchTradingFees: boolean
        fetchTradingLimits: boolean
        fetchTransactions: boolean
        fetchWithdrawals: boolean
        privateAPI: boolean
        publicAPI: boolean
        withdraw: boolean
    }

    urls: {
        [key: string]: any;
        logo: string
        api: string | Dictionary<string>
        test?: string | Dictionary<string>
        www: string
        doc: string[]
        api_management?: string
        fees: string
        referral?: string
    }

    api: any
    
    requiredCredentials: {
        [key: string]: any;
        apiKey: boolean;
        secret: boolean;
        uid: boolean;
        login: boolean;
        password: boolean;
        twofa: boolean; // 2-factor authentication (one-time password key)
        privateKey: boolean; // a "0x"-prefixed hexstring private key for a wallet
        walletAddress: boolean; // the wallet address "0x"-prefixed hexstring
        token: boolean; // reserved for HTTP auth in some cases
    }

    options: {
        [key: string]: any;
        fetchTradesMethod: 'publicGetAggTrades' | string;
        fetchTickersMethod: 'publicGetTicker24hr' | string;
        defaultTimeInForce: 'GTC' | string;
        defaultLimitOrderType: 'limit' | 'market' | string;
        hasAlreadyAuthenticatedSuccessfully: boolean;
        warnOnFetchOpenOrdersWithoutSymbol: boolean;
        recvWindow: number;
        timeDifference: number;
        adjustForTimeDifference: boolean;
        parseOrderToPrecision: boolean;
        newOrderRespType: {
            market: 'FULL' | string;
            limit: 'RESULT' | string;
        };
    }

    markets: Dictionary<Market> // to be filled manually or by fetchMarkets
    currencies: Dictionary<Currency> // to be filled manually or by fetchMarkets
    timeframes: Dictionary<number | string> // redefine if the exchange has.fetchOHLCV
    
    fees: {
        trading: {
            tierBased: boolean
            percentage: boolean
            taker: number
            maker: number
        }
        funding: {
            tierBased: boolean
            percentage: boolean
            withdraw: Dictionary<number>
            deposit: Dictionary<number>
        }
    }

    status: {
        status: 'ok' | string
        updated: number
        eta: number
        url: string
    }

    exceptions: Dictionary<typeof BaseError> | {
        exact: Dictionary<typeof BaseError>
        broad: Dictionary<typeof BaseError>
    }

    httpExceptions: Dictionary<typeof BaseError>

    // httpExceptions: Dictionary<typeof BaseError>
    // some exchanges report only free on `fetchBlance` call (i.e. report no used funds)
    // in this case ccxt will try to infer used funds from open order cache which might be stale
    // still some exchanges report number of open orders together with balance
    // if you set the following flag to boolean ccxt will leave used funds undefined in case of discrepancy
    dontGetUsedBalanceFromStaleCache: boolean

    commonCurrencies: Dictionary<string> // gets extended/overwritten in subclasses

    precisionMode: number
    
    limits: {
        amount: MinMax
        price: MinMax
        cost: MinMax
    }
}
