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

# Setup logging
def setup_logging():
    """
    Configures logging to both console and file.
    """
    logger = logging.getLogger('trading_bot')
    logger.setLevel(logging.INFO)

    # Create handlers
    c_handler = logging.StreamHandler()
    f_handler = logging.FileHandler('trading_bot.log')
    c_handler.setLevel(logging.INFO)
    f_handler.setLevel(logging.INFO)

    # Create formatters and add it to handlers
    log_format = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    c_handler.setFormatter(log_format)
    f_handler.setFormatter(log_format)

    # Add handlers to the logger
    logger.addHandler(c_handler)
    logger.addHandler(f_handler)

    return logger

logger = setup_logging()

def load_config(config_path='config.json'):
    """
    Loads proper setting from the json file.
    Handles comments in JSON (which is not standard but useful for config files).
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
            
            config = json.loads(clean_content)
            
            # Validate required fields
            required_fields = ['exchange', 'api_key', 'secret']
            missing_fields = [field for field in required_fields if field not in config]
            
            if missing_fields:
                logger.error(f"Missing required fields in config: {', '.join(missing_fields)}")
                sys.exit(1)
                
            return config
            
    except FileNotFoundError:
        logger.error(f"Config file '{config_path}' not found! Please create it by copying config.json.example to {config_path}.")
        sys.exit(1)
    except json.JSONDecodeError:
        logger.error(f"Error parsing '{config_path}'. Strict JSON format expected (trailing commas not allowed).")
        sys.exit(1)

def initialize_exchange(config):
    """
    Initializes the exchange instance with API keys and testing connection.
    """
    exchange_id = config.get('exchange', 'binance')
    api_key = config.get('api_key')
    secret = config.get('secret')
    
    logger.info(f"Connecting to {exchange_id}...")
    
    try:
        # Dynamic class loading from ccxt
        if not hasattr(ccxt, exchange_id):
            logger.error(f"Exchange '{exchange_id}' not found in ccxt library.")
            sys.exit(1)
            
        exchange_class = getattr(ccxt, exchange_id)
        exchange = exchange_class({
            'apiKey': api_key,
            'secret': secret,
            'enableRateLimit': True, # Important to avoid bans!
        })
        
        # Check if we have access / test connection
        # load_markets() is usually the first call to verify connection
        exchange.load_markets()
        logger.info(f"Successfully connected to {exchange_id}")
        return exchange
        
    except ccxt.NetworkError as e:
        logger.error(f"Network error connecting to {exchange_id}: {e}")
        sys.exit(1)
    except ccxt.AuthenticationError as e:
        logger.error(f"Authentication error. Check your API keys: {e}")
        sys.exit(1)
    except ccxt.ExchangeError as e:
        logger.error(f"Exchange error: {e}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Unexpected error initializing exchange: {e}")
        sys.exit(1)

def fetch_ticker(exchange, symbol):
    """
    Fetches the latest ticker data for a symbol.
    """
    try:
        ticker = exchange.fetch_ticker(symbol)
        logger.info(f"Ticker for {symbol}: Bid={ticker['bid']}, Ask={ticker['ask']}, Last={ticker['last']}")
        return ticker
    except ccxt.NetworkError as e:
        logger.error(f"Network error fetching ticker for {symbol}: {e}")
        return None
    except ccxt.ExchangeError as e:
        logger.error(f"Exchange error fetching ticker for {symbol}: {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error fetching ticker: {e}")
        return None

def fetch_order_book(exchange, symbol, limit=5):
    """
    Fetches the order book for a symbol.
    """
    try:
        order_book = exchange.fetch_order_book(symbol, limit)
        best_bid = order_book['bids'][0][0] if order_book['bids'] else None
        best_ask = order_book['asks'][0][0] if order_book['asks'] else None
        logger.info(f"Order Book for {symbol}: Best Bid={best_bid}, Best Ask={best_ask}")
        return order_book
    except Exception as e:
        logger.error(f"Error fetching order book for {symbol}: {e}")
        return None

def calculate_limit_price(ticker, side, offset_percent):
    """
    Calculates a limit price based on the current ticker and offset.
    """
    if not ticker:
        return None
        
    price = 0.0
    if side == 'buy':
        # Buy below average/bid
        base_price = ticker['bid'] if ticker['bid'] else ticker['last']
        price = base_price * (1 - offset_percent / 100)
    elif side == 'sell':
        # Sell above average/ask
        base_price = ticker['ask'] if ticker['ask'] else ticker['last']
        price = base_price * (1 + offset_percent / 100)
    
    # Round to 8 decimals (common for crypto)
    price = round(price, 8)
    logger.info(f"Calculated {side} limit price: {price} (Offset: {offset_percent}%)")
    return price

def main():
    logger.info("Starting the Trading Bot...")
    
    # 1. Get our settings
    config = load_config()
    
    # 2. Connect to the exchange
    exchange = initialize_exchange(config)
    
    # Extract other config variables
    symbol = config.get('symbol', 'BTC/USDT')
    amount_usd = config.get('trade_amount_usd', 10)
    price_offset_pct = config.get('price_offset_percent', 0.1)
    dry_run = config.get('dry_run', True)
    
    try:
        # Verify symbol exists
        if symbol not in exchange.markets:
            logger.error(f"Symbol {symbol} not supported on {exchange.id}")
            return

        # 4. Fetch Market Data
        logger.info("Fetching market data...")
        ticker = fetch_ticker(exchange, symbol)
        if not ticker:
            return
            
        # Optional: Fetch Order Book just to show we can
        fetch_order_book(exchange, symbol)

        # 5. Calculate order details
        target_price = calculate_limit_price(ticker, 'buy', price_offset_pct)
        if not target_price:
            logger.error("Could not calculate target price.")
            return
        
        # Calculate amount in base currency (e.g., BTC)
        # amount = USD_value / price
        amount = amount_usd / target_price
        
        logger.info(f"Amount to buy: {amount:.6f} (approx ${amount_usd})")

        # 6. Safety Checks before ordering
        # Using fetch_balance safely
        try:
            balance = exchange.fetch_balance()
            # Assuming we are trading USDT pairs, we check USDT balance
            # For robustness, handle different quote currencies if needed, but keeping it simple for now
            quote_currency = symbol.split('/')[1]
            free_balance = balance.get(quote_currency, {}).get('free', 0)
            
            logger.info(f"Free {quote_currency} balance: {free_balance:.2f}")
            
            if free_balance < amount_usd:
                logger.warning(f"Insufficient funds! Needed: {amount_usd}, Available: {free_balance}")
                if not dry_run:
                    return # Stop if not enough money and not testing
        except Exception as e:
            logger.warning(f"Could not fetch balance (check permissions): {e}")

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
            try:
                fetched_order = exchange.fetch_order(order['id'], symbol)
                logger.info(f"Order Status: {fetched_order['status']}")
            except Exception as e:
                logger.warning(f"Could not fetch order status: {e}")

    except ccxt.NetworkError as e:
        logger.error(f"Network error during trading: {e}")
    except ccxt.ExchangeError as e:
        logger.error(f"Exchange error during trading: {e}")
    except Exception as e:
        logger.error(f"Unexpected error in main loop: {e}")

if __name__ == "__main__":
    main()
