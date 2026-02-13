# -*- coding: utf-8 -*-

"""
Advanced Trading Bot Example
---------------------------
A simple, configurable trading bot for cryptocurrency exchanges using CCXT.
This bot demonstrates how to:
1. Connect to an exchange
2. Load configuration
3. Check balances
4. Place limit orders (with safety checks)

Disclaimer: This is for educational purposes only. 
Always use 'dry_run': true when testing!
"""

import ccxt
import json
import time
import logging
import sys

# Setup simple logging to see what's happening
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def load_config(config_path='config.json'):
    """
    Loads proper setting from the json file.
    We need this because we don't want to hardcode API keys!
    """
    try:
        with open(config_path, 'r') as f:
            content = f.read()
            # Handwritten touch: strip comments so we can have a readable config
            lines = []
            for line in content.splitlines():
                if "//" in line:
                    line = line.split("//")[0]
                lines.append(line)
            clean_content = "\n".join(lines)
            
            return json.loads(clean_content)
    except FileNotFoundError:
        logger.error(f"Config file '{config_path}' not found! Please create it.")
        sys.exit(1)
    except json.JSONDecodeError:
        logger.error(f"Error parsing '{config_path}'. strict json format expected (trailing commas not allowed).")
        sys.exit(1)

def main():
    logger.info("Starting the Trading Bot...")
    
    # 1. Get our settings
    config = load_config()
    
    # Extract config variables for easier use
    exchange_id = config.get('exchange', 'binance')
    api_key = config.get('api_key')
    secret = config.get('secret')
    symbol = config.get('symbol', 'BTC/USDT')
    amount_usd = config.get('trade_amount_usd', 10)
    price_offset_pct = config.get('price_offset_percent', 0.1)
    dry_run = config.get('dry_run', True)
    
    # 2. Connect to the exchange
    logger.info(f"Connecting to {exchange_id}...")
    
    # Dynamic class loading from ccxt
    exchange_class = getattr(ccxt, exchange_id)
    exchange = exchange_class({
        'apiKey': api_key,
        'secret': secret,
        'enableRateLimit': True, # Important to avoid bans!
    })

    try:
        # 3. Check if we have access
        # load_markets() is usually the first call to verify connection
        exchange.load_markets()
        logger.info(f"Successfully connected to {exchange_id}")
        
        # Verify symbol exists
        if symbol not in exchange.markets:
            logger.error(f"Symbol {symbol} not supported on {exchange_id}")
            return

        # 4. Fetch current market price (ticker)
        ticker = exchange.fetch_ticker(symbol)
        last_price = ticker['last']
        logger.info(f"Current price for {symbol}: {last_price}")

        # 5. Calculate order details
        # We want to buy a bit below current price (limit order)
        target_price = last_price * (1 - price_offset_pct / 100)
        
        # Calculate amount in base currency (e.g., BTC)
        # amount = USD_value / price
        amount = amount_usd / target_price
        
        logger.info(f"Target Buy Price: {target_price:.2f}")
        logger.info(f"Amount to buy: {amount:.6f} (approx ${amount_usd})")

        # 6. Safety Checks before ordering
        balance = exchange.fetch_balance()
        # Assuming we are trading USDT pairs, we check USDT balance
        quote_currency = symbol.split('/')[1]
        free_balance = balance.get(quote_currency, {}).get('free', 0)
        
        logger.info(f"Free {quote_currency} balance: {free_balance:.2f}")
        
        if free_balance < amount_usd:
            logger.warning(f"Insufficient funds! Needed: {amount_usd}, Available: {free_balance}")
            if not dry_run:
                return # Stop if not enough money and not testing

        # 7. Place the order
        if dry_run:
            logger.info("[DRY RUN] Simulation mode active. No real order placed.")
            logger.info(f"[DRY RUN] Would buy {amount} {symbol} @ {target_price}")
        else:
            logger.info("Placing REAL limit buy order...")
            # create_order(symbol, type, side, amount, price)
            order = exchange.create_order(symbol, 'limit', 'buy', amount, target_price)
            logger.info(f"Order placed successfully! ID: {order['id']}")
            
            # Simple wait logic to check if it fills (optional)
            logger.info("Waiting a moment to see status...")
            time.sleep(2)
            fetched_order = exchange.fetch_order(order['id'], symbol)
            logger.info(f"Order Status: {fetched_order['status']}")

    except ccxt.NetworkError as e:
        logger.error(f"Network error: {e}")
    except ccxt.ExchangeError as e:
        logger.error(f"Exchange error: {e}")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")

if __name__ == "__main__":
    main()
