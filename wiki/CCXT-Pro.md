# CCXT Pro Wiki

- [Install](https://github.com/ccxt/ccxt/wiki/CCXT-Pro-Install.md)
- [User Manual](https://github.com/ccxt/ccxt/wiki/CCXT-Pro-Manual.md)
  - [Architecture Overview](https://github.com/ccxt/ccxt/wiki/CCXT-Pro-Manual#overview)
  - [Prerequisites](https://github.com/ccxt/ccxt/wiki/CCXT-Pro-Manual#prerequisites)
  - [Streaming Specifics](https://github.com/ccxt/ccxt/wiki/CCXT-Pro-Manual#streaming-specifics)
  - [Linking Against CCXT Pro](https://github.com/ccxt/ccxt/wiki/CCXT-Pro-Manual#linking-against-ccxt-pro)
  - [Instantiation](https://github.com/ccxt/ccxt/wiki/CCXT-Pro-Manual#instantiation)
  - [Exchange Properties](https://github.com/ccxt/ccxt/wiki/CCXT-Pro-Manual#exchange-properties)
  - [Unified API](https://github.com/ccxt/ccxt/wiki/CCXT-Pro-Manual#unified-api)
    - [Public Methods](https://github.com/ccxt/ccxt/wiki/CCXT-Pro-Manual#public-methods)
      - [Market Data](https://github.com/ccxt/ccxt/wiki/CCXT-Pro-Manual#market-data)
        - [`watchOrderBook (symbol, limit, params)`](https://github.com/ccxt/ccxt/wiki/CCXT-Pro-Manual#watchOrderBook)
        - [`watchTicker (symbol, limit, params)`](https://github.com/ccxt/ccxt/wiki/CCXT-Pro-Manual#watchTicker)
        - [`watchTickers (symbols, params)`](https://github.com/ccxt/ccxt/wiki/CCXT-Pro-Manual#watchTickers) <sup>wip</sup>
        - [`watchOHLCV (symbol, timeframe, since, limit, params)`](https://github.com/ccxt/ccxt/wiki/CCXT-Pro-Manual#watchOHLCV)
        - [`watchTrades (symbol, since, limit, params)`](https://github.com/ccxt/ccxt/wiki/CCXT-Pro-Manual#watchTrades)
    - [Private Methods](https://github.com/ccxt/ccxt/wiki/CCXT-Pro-Manual#private-methods)
      - [Authentication](https://github.com/ccxt/ccxt/wiki/CCXT-Pro-Manual#authentication)
      - [Trading](https://github.com/ccxt/ccxt/wiki/CCXT-Pro-Manual#trading) <sup>wip</sup>
        - [`watchBalance (params)`](https://github.com/ccxt/ccxt/wiki/CCXT-Pro-Manual#watchBalance)
        - [`watchOrders (symbol, since, limit, params)`](https://github.com/ccxt/ccxt/wiki/CCXT-Pro-Manual#watchOrders)
        - [`watchCreateOrder (symbol, type, side, amount, price, params)`](https://github.com/ccxt/ccxt/wiki/CCXT-Pro-Manual#watchCreateOrder)
        - [`watchCancelOrder (id, symbol, params)`](https://github.com/ccxt/ccxt/wiki/CCXT-Pro-Manual#watchCancelOrder)
        - [`watchMyTrades (symbol, since, limit, params)`](https://github.com/ccxt-dev/ccxt/wiki/CCXT-Pro-Manual#watchMyTrades)
      - [Funding](https://github.com/ccxt/ccxt/wiki/CCXT-Pro-Manual#funding) <sup>wip</sup>
        - [Deposit](https://github.com/ccxt/ccxt/wiki/Manual#deposit)
        - [Withdraw](https://github.com/ccxt/ccxt/wiki/Manual#withdraw)
        - [`watchTransactions (code, since, limit, params)`](https://github.com/ccxt/ccxt/wiki/Manual#watchTransactions)

## Troubleshooting

- [Error Handling](https://github.com/ccxt/ccxt/wiki/CCXT-Pro-Manual#error-handling)
- [Troubleshooting](https://github.com/ccxt/ccxt/wiki/Manual#troubleshooting)
- [How To Submit An Issue](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-submit-an-issue)

## Examples

- [Usage Examples](https://github.com/kroitor/ccxt.pro/tree/master/examples) <sup>wip</sup>
