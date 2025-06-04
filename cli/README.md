
# CCXT Command-Line Interface (CLI)


[![npm](https://img.shields.io/npm/v/ccxt.svg)](https://npmjs.com/package/ccxt) [![Discord](https://img.shields.io/discord/690203284119617602?logo=discord&logoColor=white)](https://discord.gg/ccxt) [![Supported Exchanges](https://img.shields.io/badge/exchanges-106-blue.svg)](https://github.com/ccxt/ccxt/wiki/Exchange-Markets) [![Follow CCXT at x.com](https://img.shields.io/twitter/follow/ccxt_official.svg?style=social&label=CCXT)](https://x.com/ccxt_official)

The **CCXT CLI** is a lightweight command-line tool that enables you to interact directly with any supported cryptocurrency exchange using the [CCXT](https://github.com/ccxt/ccxt) library. It provides a convenient way to perform tasks such as checking balances, placing orders, and fetching market data — all from the terminal, with no need to write custom scripts.

---

## 🚀 Features

- Interact with any exchange supported by CCXT
- Call any CCXT method directly from the CLI
- Send authenticated requests (using API keys)
- Perform quick actions like fetching balances, trades, tickers, order books, and more
- Uses positional arguments

---

## 📦 Installation

You can install the CLI globally with `npm`.

```bash
npm install -g ccxt-cli
```

---

## DEMO

https://github.com/user-attachments/assets/5631e28c-4c82-4b04-840f-e1021ed42c93

## 🛠️ Usage

```bash
ccxt <exchange_id> <methodName> [...args] # if you're not sure about the args, use the `ccxt explain methodName` command
```

You can get a quick overview by using the `--help` flag:

```bash
ccxt --help
```

### Parameters

- `<exchange_id>`: The ID of the exchange (e.g., `binance`, `kraken`, `coinbasepro`)
- `<methodName>`: Any method name available in the CCXT API (e.g., `fetchBalance`, `createOrder`, `fetchTrades`)
- `args`: Any required method parameters

---

##  Authentication

To use private methods (e.g., `fetchBalance`, `createOrder`), you must provide API credentials. The CLI supports credentials via environment variables or config files.

### Environment variables:

```bash
export BINANCE_APIKEY=your_api_key
export BINANCE_SECRET=your_secret
```

### Config files

Inside `$CACHE/ccxt-cli/config.json` you can add an object with the `exchangeId` as the key and apikeys/options inside.

```Json
{
  "binance": {
    "apiKey": "your apiKey here",
    "secret": "your secret here",
    "options": {
      "customOptionKey": "customOptionValue"
    }
  }
}
```
`$CACHE` varies from OS to OS but by doing `--help` you can see which path is being used. You can also use the `config` command to set a different path for the config file.

---

## Examples

#### Fetch OHLCV with limit and no since

```bash
ccxt binance fetchOHLCV BTC/USDT 1h undefined 10 # we don't want to provide since but we want limit so undefined is provided as the placeholder for since
```

#### Fetch your balance

```bash
ccxt kraken fetchBalance
```

#### Create a market order

```bash
ccxt binance createOrder BTC/USDT market buy 0.01
```

#### Fetch recent private trades

```bash
ccxt coinbasepro fetchMyTrades BTC/USD
```


#### Create order (with params)

```bash
ccxt binance createOrder "BTC/USDT" market buy 0.01 undefined --param test=true --param clientOrderId=myOrderId # undefined is the place holder for price
```

#### Fetch your swap/perps balance

```bash
ccxt binance fetchBalance --swap
```

#### Check required args

If you are not sure which arguments should be provided you can always use the `explain` command.

```
ccxt explain createOrder
```

Result:

```
Method: createOrder
Usage:
  binance createOrder <symbol> <type> <side> <amount> [price] [params]

Arguments:
  - symbol       (required) — Market symbol e.g., BTC/USDT
  - type         (required) — (no description available)
  - side         (required) — order side e.g., buy or sell
  - amount       (required) — (no description available)
  - price        (optional) — Price per unit of asset e.g., 26000.50
  - params       (optional) — Extra parameters for the exchange e.g., { "recvWindow": 5000 }
```

If you don't want to provide a value for an optional argument, you should still provide `undefined` as the "placeholder".

---

## 📝 Tips

- Use `--verbose` flag to inspect raw request/response data.
- Use `--sandbox` to place the request using the testnet/sandbox environment
- Always test with small amounts when placing orders.
- Use `ccxt explain createOrder` to view the required arguments for createOrder or any other method
- Use `--param keyA=valueA keyB=valueB ...` to provide the `params` argument.

---

## 📚 Documentation

- Full CCXT API Reference: [https://docs.ccxt.com](https://docs.ccxt.com)
- Supported Exchanges: [https://github.com/ccxt/ccxt#supported-cryptocurrency-exchange-markets](https://github.com/ccxt/ccxt#supported-cryptocurrency-exchange-markets)

---

## 🛡 Disclaimer

Use this CLI at your own risk. Trading cryptocurrencies involves substantial risk. Always ensure your API keys are protected and never share them.

---

## 🧑‍💻 License

MIT — © [CCXT]
