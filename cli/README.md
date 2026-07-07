
# CCXT Command-Line Interface (CLI)


[![npm](https://img.shields.io/npm/v/ccxt-cli.svg)](https://npmjs.com/package/ccxt-cli) [![Discord](https://img.shields.io/discord/690203284119617602?logo=discord&logoColor=white)](https://discord.gg/ccxt) [![Supported Exchanges](https://img.shields.io/badge/exchanges-106-blue.svg)](https://github.com/ccxt/ccxt/wiki/Exchange-Markets) [![Follow CCXT at x.com](https://img.shields.io/twitter/follow/ccxt_official.svg?style=social&label=CCXT)](https://x.com/ccxt_official)

The **CCXT CLI** is a lightweight command-line tool that enables you to interact directly with any supported cryptocurrency exchange using the [CCXT](https://github.com/ccxt/ccxt) library. It provides a convenient way to perform tasks such as checking balances, placing orders, and fetching market data — all from the terminal, with no need to write custom scripts.

---

## 🚀 Features

- Interact with any exchange supported by CCXT
- Call any CCXT method directly from the CLI
- Send authenticated requests (using API keys)
- Perform quick actions like fetching balances, trades, tickers, order books, and more
- Plot interactive OHLCV charts
- Render live ticker/orderbook updates from one or more exchanges
---

## 📦 Install

You can install the CLI globally with `npm`.

```bash
npm install -g ccxt-cli
```

---

## Demo

https://github.com/user-attachments/assets/09999217-07ee-4a0d-8bd9-715d4fe7f5a4

## 🛠️ Usage

```bash
ccxt <exchange_id> <methodName> [...args] # if you're not sure about the args, use the `ccxt explain methodName` command
```

You can get a quick overview by using the `--help` flag:

```bash
ccxt --help
```

### Parameters for calling a ccxt method

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


## 📈 Plot Interactive OHLCV Charts

You can generate and open interactive candlestick charts with volume in your browser using:

```bash
ccxt ohlcv binance BTC/USDT 1h
```

- Uses `fetchOHLCV` from the exchange's REST API
- Automatically generates a self-contained HTML file

🔍 Ideal for visualizing recent price action.

<details>
  <summary>Result</summary>

  ![OHLCV](https://github.com/user-attachments/assets/ee550b73-75a9-42dd-86ce-0fb6717dd944)

</details>

## 📟 Live Ticker

You can stream live ticker updates (websockets) from one or more exchanges:

```bash
ccxt ticker binance BTC/USDT
ccxt ticker binance,bybit,okx BTC/USDT
```

<details>
  <summary>Result</summary>

  ![ticker](https://github.com/user-attachments/assets/1406b1e1-e80f-4f69-9017-178be84b0a67)

</details>

## 📊 Live OrderBook

Render a live orderbook (websockets) for one or more exchanges:

```bash
ccxt orderbook binance BTC/USDT
ccxt orderbook binance,bybit,okx BTC/USDT
```

<details>
  <summary>Result</summary>

  ![orderbook](https://github.com/user-attachments/assets/9436b1c2-0b0d-43c4-ac91-847be84edb14)

</details>

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

- CLI supports automatic conversions from ISO8601 datetime to milliseconds, users can specify datetimes in command-line arguments in ISO8601 format in quotes like `"2025-05-01T01:23:45Z"` (where a method argument requires milliseconds)
- Use `--verbose` flag to inspect raw request/response data.
- Use `--sandbox` to place the request using the testnet/sandbox environment
- Always test with small amounts when placing orders.
- Use `ccxt explain createOrder` to view the required arguments for createOrder or any other method
- Use `--param keyA=valueA keyB=valueB ...` to provide the `params` argument.
- Arguments must follow the correct order. Use `undefined` to skip optional values

---

## 📚 Documentation

- Full CCXT API Reference: [https://docs.ccxt.com](https://docs.ccxt.com)
- Supported Exchanges: [https://github.com/ccxt/ccxt#supported-cryptocurrency-exchange-markets](https://github.com/ccxt/ccxt#supported-cryptocurrency-exchange-markets)

---

## 💡 Found a bug or have a feature in mind?
We’d love to hear from you! Open an issue or suggestion on GitHub and help us improve the CLI for everyone.

---

## 🛡 Disclaimer

Use this CLI at your own risk. Trading cryptocurrencies involves substantial risk. Always ensure your API keys are protected and never share them.

---

## 🧑‍💻 License

MIT — © [CCXT]
