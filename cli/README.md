
# CCXT Command-Line Interface (CLI)

The **CCXT CLI** is a lightweight command-line tool that enables you to interact directly with any supported cryptocurrency exchange using the [CCXT](https://github.com/ccxt/ccxt) library. It provides a convenient way to perform tasks such as checking balances, placing orders, and fetching market data — all from the terminal, with no need to write custom scripts.

---

## 🚀 Features

- Interact with any exchange supported by CCXT
- Call any CCXT method directly from the CLI
- Send authenticated requests (using API keys)
- Perform quick actions like fetching balances, trades, tickers, order books, and more

---

## 📦 Installation

You can install the CLI globally with `npm`.

```bash
npm install -g ccxt
```

---

## 🛠️ Usage

```bash
ccxt <exchange_id> <methodName> [...args]
```

You can get a quick overview by using the `--help` flag:

```bash
ccxt --help
```

### 🧠 Parameters

- `<exchange_id>`: The ID of the exchange (e.g., `binance`, `kraken`, `coinbasepro`)
- `<methodName>`: Any method name available in the CCXT API (e.g., `fetchBalance`, `createOrder`, `fetchTrades`)
- `args`: Any required method parameters

---

## 🔐 Authentication

To use private methods (e.g., `fetchBalance`, `createOrder`), you must provide API credentials. The CLI supports credentials via environment variables or config files.

### Environment variables:

```bash
export BINANCE_APIKEY=your_api_key
export BINANCE_SECRET=your_secret
```

### Config files

Inside `$CACHE/ccxt-cli/config.json` you can add an object with the exchangeId as the key and apikeys/options inside.

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
`$CACHE` varies from OS to OS but by doing `--help` you can see which path is being used.

---

## 🧪 Examples

### Fetch public ticker

```bash
ccxt binance fetchTicker BTC/USDT
```

### Fetch your balance

```bash
ccxt kraken fetchBalance
```

### Create a market order

```bash
ccxt binance createOrder BTC/USDT market buy 0.01
```

### Fetch recent private trades

```bash
ccxt coinbasepro fetchMyTrades BTC/USD
```

---

## 📝 Tips

- Use `--verbose` or `--debug` flags to inspect raw request/response data.
- Use `--sandbox` to place the request using the testnet/sandbox environment
- Always test with small amounts when placing orders.
- Use `ccxt explain createOrder` to view the required arguments for createOrder or any other method
- Use `ccxt <exchange_id> describe` to view supported capabilities and required credentials.

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
