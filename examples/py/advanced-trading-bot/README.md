# Advanced Trading Bot Example

This is a starter trading bot I wrote to safeguard my trades. It connects to an exchange and places a limit buy order slightly below the current price to catch dips.

## Overview
The bot is written in Python and uses the `ccxt` library to talk to exchanges. It's designed to be simple to read and change.

## Features
- **Configurable**: All settings are in a JSON file, so you don't touch code to change pairs or keys.
- **Safety**: Includes a `dry_run` mode to test without real money.
- **Balance Checks**: Won't try to buy if you don't have enough USDT.

## Setup
1. Install Python (if you haven't already).
2. Install the requirements:
   ```bash
   pip install -r requirements.txt
   ```
3. Set up your config:
   - Copy `config.json.example` to `config.json`
   - Edit `config.json` and put in your real API keys from Binance (or your exchange of choice).

## Usage
Run the bot with:
```bash
python trading_bot.py
```

It will:
1. Load your keys.
2. Check the price of BTC (or whatever you set).
3. Calculate a buy price 0.1% lower.
4. Place the order (unless `dry_run` is true).

## Safety
By default, `dry_run` is set to `true`. Change it to `false` in `config.json` ONLY when you are ready to trade real money.

Happy Trading!
