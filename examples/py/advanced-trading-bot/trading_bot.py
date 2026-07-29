# -*- coding: utf-8 -*-

"""
Advanced Trading Bot Example for CCXT

This module demonstrates a production-ready algorithmic trading bot with
complete order lifecycle management, risk controls, and safety features.

Features:
    - Dry-run mode for safe testing
    - Risk management with position limits
    - Market condition validation
    - Comprehensive error handling
    - Real-time order monitoring
    - Graceful shutdown

Usage:
    python trading_bot.py --dry-run

Author: ccxt contributors
License: MIT
"""

import argparse
import json
import logging
import random
import signal
import sys
import time
import traceback
from functools import wraps
from logging.handlers import RotatingFileHandler
from typing import Any, Callable, Dict, List, Optional, Tuple, Union

import ccxt

# Global state for dry-run simulation
_dry_run_order_state = {}

# Setup logging
def setup_logging(log_level: str = 'INFO', log_file: str = 'trading_bot.log') -> logging.Logger:
    """
    Configures logging to both console and file.

    Sets up a logger with a rotating file handler and a console handler with colored output.

    Args:
        log_level: The logging level to use for the console (e.g., 'INFO', 'DEBUG').
        log_file: The path to the log file.

    Returns:
        The configured logger instance.
    """
    logger = logging.getLogger('trading_bot')
    
    # Remove existing handlers to avoid duplicates
    if logger.hasHandlers():
        logger.handlers.clear()
        
    logger.setLevel(logging.DEBUG)

    # Create handlers
    c_handler = logging.StreamHandler()
    f_handler = RotatingFileHandler(
        log_file,
        maxBytes=5 * 1024 * 1024,
        backupCount=3,
        encoding='utf-8',
    )

    # Set levels
    level_num = getattr(logging, log_level.upper(), logging.INFO)
    c_handler.setLevel(level_num)
    f_handler.setLevel(logging.DEBUG)

    class ColorFormatter(logging.Formatter):
        COLORS = {
            logging.ERROR: "\033[91m",   # red
            logging.WARNING: "\033[93m", # yellow
            logging.INFO: "\033[97m",    # white
        }
        RESET = "\033[0m"

        def format(self, record):
            log_fmt = f"{self.COLORS.get(record.levelno, self.RESET)}[%(asctime)s] %(levelname)s - %(message)s{self.RESET}"
            formatter = logging.Formatter(log_fmt, datefmt="%Y-%m-%d %H:%M:%S")
            return formatter.format(record)

    # Create formatters and add it to handlers
    file_format = logging.Formatter(
        "[%(asctime)s] %(levelname)s - %(message)s", datefmt="%Y-%m-%d %H:%M:%S"
    )
    c_handler.setFormatter(ColorFormatter())
    f_handler.setFormatter(file_format)

    # Add handlers to the logger
    logger.addHandler(c_handler)
    logger.addHandler(f_handler)

    return logger


logger = setup_logging()


# Global configuration
_config = {}

def handle_exchange_error(error: Exception, context: str = "") -> Tuple[str, bool, int]:
    """
    Centralized error handling for exchange-related exceptions.

    Analyzes the CCXT exception type and provides informative messages, retry directives,
    and appropriate wait times.

    Args:
        error: The exception caught during an exchange operation.
        context: Optional context string (e.g., function name) where the error occurred.

    Returns:
        A tuple containing (error_message, should_retry, wait_seconds).
    """
    error_msg = f"Error in {context}: {str(error)}"
    
    if isinstance(error, ccxt.NetworkError):
        return ("Network connectivity issue. Check your internet connection.", True, 5)
    elif isinstance(error, ccxt.ExchangeNotAvailable):
        return ("Exchange is currently unavailable or under maintenance.", True, 5)
    elif isinstance(error, ccxt.RequestTimeout):
        return ("Request timed out. Retrying...", True, 3)
    elif isinstance(error, ccxt.InsufficientFunds):
        return ("Insufficient balance to place order.", False, 0)
    elif isinstance(error, ccxt.InvalidOrder):
        return (f"Invalid order parameters: {str(error)}", False, 0)
    elif isinstance(error, ccxt.OrderNotFound):
        return ("Order not found. It may have been filled or canceled.", False, 0)
    elif isinstance(error, ccxt.RateLimitExceeded):
        wait_time = _config.get('rate_limit_cooldown_seconds', 60)
        return ("Rate limit exceeded. Waiting before retry...", True, wait_time)
    elif isinstance(error, ccxt.AuthenticationError):
        return ("Authentication failed. Check your API keys.", False, 0)
    elif isinstance(error, ccxt.ExchangeError):
        return (f"Exchange error: {str(error)}", False, 0)
    else:
        return (f"Unexpected error: {str(error)}", False, 0)

def retry_with_backoff(max_retries: int = 3, base_delay: int = 2) -> Callable[..., Any]:
    """
    Decorator to retry functions with exponential backoff on specific errors.

    Args:
        max_retries: The maximum number of retry attempts.
        base_delay: The base delay in seconds before the first retry.

    Returns:
        A decorator function that wraps the original function.
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            attempts = 0
            while attempts <= max_retries:
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    # Get error handling directive
                    msg, should_retry, wait_time = handle_exchange_error(e, context=func.__name__)
                    
                    if should_retry and attempts < max_retries:
                        delay = wait_time if wait_time > base_delay else base_delay * (2 ** attempts)
                        # If specific wait time (like rate limit) is longer, use that
                        if isinstance(e, ccxt.RateLimitExceeded):
                            delay = wait_time
                            
                        logger.error(f"{msg}")
                        logger.warning(f"Attempt {attempts+1}/{max_retries} failed: {str(e)}")
                        logger.info(f"⏳ Waiting {delay}s before retry...")
                        time.sleep(delay)
                        attempts += 1
                    else:
                        # Log final error if we gave up or shouldn't retry
                        if should_retry:
                            logger.error(f"Max retries exceeded. Last error: {msg}")
                        else:
                            logger.error(f"{msg}")
                        raise e  # Re-raise so caller knows it failed
            return None
        return wrapper
    return decorator

def load_config(config_path: str = 'config.json') -> Dict[str, Any]:
    """
    Loads proper setting from the json file.
    
    Handles comments in JSON (which is not standard but useful for config files).

    Args:
        config_path: The file path to the configuration JSON.

    Returns:
        A dictionary containing the loaded configuration settings.
        
    Raises:
        SystemExit: If the file is not found or parsing fails.
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
            
            # Set global config
            global _config
            _config = config
                
            return config
            
    except FileNotFoundError:
        logger.error(f"Config file '{config_path}' not found! Please create it by copying config.json.example to {config_path}.")
        sys.exit(1)
    except json.JSONDecodeError:
        logger.error(f"Error parsing '{config_path}'. Strict JSON format expected (trailing commas not allowed).")
        sys.exit(1)

def validate_config(config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validates the provided configuration dictionary.

    Ensures that all required fields are present and hold appropriate values/types.

    Args:
        config: The configuration dictionary to validate.

    Returns:
        The validated configuration dictionary.

    Raises:
        ValueError: If a required field is missing or has an invalid value.
    """
    required_fields = [
        'exchange', 'api_key', 'secret', 'symbol', 'trade_amount_usd',
        'order_type', 'price_offset_percent', 'max_wait_seconds', 'dry_run'
    ]
    for field in required_fields:
        if field not in config:
            raise ValueError(f"Missing required config field: {field}")
            
    if not isinstance(config['trade_amount_usd'], (int, float)) or config['trade_amount_usd'] <= 0:
        raise ValueError("trade_amount_usd must be a float > 0")
        
    if not isinstance(config['price_offset_percent'], (int, float)) or not (0.01 <= config['price_offset_percent'] <= 5.0):
        raise ValueError("price_offset_percent must be a float between 0.01 and 5.0")
        
    if not isinstance(config['max_wait_seconds'], int) or config['max_wait_seconds'] <= 0:
        raise ValueError("max_wait_seconds must be an int > 0")
        
    if not isinstance(config['dry_run'], bool):
        raise ValueError("dry_run must be a boolean")
        
    if "/" not in config['symbol']:
        raise ValueError("Symbol must contain '/' (e.g., BTC/USDT)")
        
    return config

def print_config_summary(config: Dict[str, Any]) -> None:
    """
    Prints a formatted summary of the bot's configuration.

    Outputs key settings and indicates whether the bot is running in dry-run or live mode.

    Args:
        config: The configuration dictionary containing bot settings.

    Returns:
        None
    """
    logger = logging.getLogger('trading_bot')
    logger.info("════════════════════════════════════")
    logger.info("TRADING BOT CONFIGURATION")
    logger.info("════════════════════════════════════")
    logger.info(f"Exchange:      {config.get('exchange')}")
    logger.info(f"Symbol:        {config.get('symbol')}")
    logger.info(f"Trade Amount:  ${float(config.get('trade_amount_usd')):.2f}")
    logger.info(f"Order Type:    {config.get('order_type')}")
    logger.info(f"Price Offset:  {config.get('price_offset_percent')}%")
    logger.info(f"Max Wait:      {config.get('max_wait_seconds')} seconds")
    
    if config.get('dry_run'):
        logger.info("Mode:          🟢 DRY RUN (SAFE)")
    else:
        logger.info("\033[91mMode:          🔴 LIVE TRADING (REAL MONEY)\033[0m")
    
    logger.info("════════════════════════════════════")

def initialize_exchange(config: Dict[str, Any]) -> ccxt.Exchange:
    """
    Initializes the exchange instance with API keys and testing connection.

    Dynamically loads the requested exchange class from CCXT, applies credentials,
    and performs a test connection by loading markets.

    Args:
        config: The configuration dictionary containing exchange and API details.

    Returns:
        An initialized CCXT exchange instance.

    Raises:
        SystemExit: If the exchange is unsupported, authentication fails, or network errors occur.
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
        
        # Check for placeholder keys
        if api_key == 'YOUR_API_KEY' or secret == 'YOUR_SECRET_KEY':
            logger.warning("Placeholder API keys detected. Connecting in PUBLIC mode (no trading/balances).")
            exchange = exchange_class({
                'enableRateLimit': True,
            })
        else:
            exchange = exchange_class({
                'apiKey': api_key,
                'secret': secret,
                'enableRateLimit': True,
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

@retry_with_backoff(max_retries=3)
def fetch_ticker(exchange: ccxt.Exchange, symbol: str) -> Optional[Dict[str, Any]]:
    """
    Fetches the latest ticker data for a symbol.

    Args:
        exchange: The initialized CCXT exchange instance.
        symbol: The trading pair symbol (e.g., 'BTC/USDT').

    Returns:
        A dictionary containing ticker data (bid, ask, last, etc.) or None if fetching fails.
    """
    ticker = exchange.fetch_ticker(symbol)
    logger.info(f"Ticker for {symbol}: Bid={ticker['bid']}, Ask={ticker['ask']}, Last={ticker['last']}")
    return ticker

def fetch_order_book(exchange: ccxt.Exchange, symbol: str, limit: int = 5) -> Optional[Dict[str, Any]]:
    """
    Fetches the order book for a symbol.

    Args:
        exchange: The initialized CCXT exchange instance.
        symbol: The trading pair symbol (e.g., 'BTC/USDT').
        limit: The maximum number of order book entries to return.

    Returns:
        A dictionary containing the order book (bids and asks) or None if fetching fails.
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

def calculate_limit_price(ticker: Dict[str, Any], side: str, offset_percent: float) -> Optional[float]:
    """
    Calculates a limit price based on the current ticker and an offset percentage.

    For a buy order, the price is set below the bid (or last) price.
    For a sell order, the price is set above the ask (or last) price.

    Args:
        ticker: The ticker data dictionary.
        side: The order side ('buy' or 'sell').
        offset_percent: The percentage offset to apply to the base price.

    Returns:
        The calculated limit price rounded to 8 decimal places, or None if ticker is invalid.
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


@retry_with_backoff(max_retries=3)
def fetch_balance(exchange: ccxt.Exchange) -> Optional[Dict[str, Any]]:
    """
    Fetches the account balance from the exchange.
    
    Returns a mocked balance when running in dry-run mode with public API keys.

    Args:
        exchange: The initialized CCXT exchange instance.

    Returns:
        A dictionary containing balance information, or None if fetching fails.
    """
    # If we are in dry_run and have no keys, we might want to return mock balance.
    # But retry_with_backoff will run first. 
    # To keep the mock behavior, we need to check keys before calling API.
    if not exchange.apiKey or exchange.apiKey == 'YOUR_API_KEY':
            logger.warning(f"Using MOCK balance for dry-run (public keys).")
            return {
                'USDT': {'free': 1000.0, 'used': 0.0, 'total': 1000.0},
                'BTC': {'free': 0.0, 'used': 0.0, 'total': 0.0},
                'ETH': {'free': 0.0, 'used': 0.0, 'total': 0.0},
                'info': {'msg': 'Mock balance'}
            }

    balance = exchange.fetch_balance()
    
    # Log balances for major assets
    currencies = ['USDT', 'BTC', 'ETH']
    log_msg = "Balances: "
    for currency in currencies:
        if currency in balance:
                total = balance[currency]['total']
                free = balance[currency]['free']
                used = balance[currency]['used']
                log_msg += f"{currency}: Total={total}, Free={free}, Used={used} | "
    
    logger.info(log_msg)
    return balance

def check_sufficient_balance(balance: Dict[str, Any], currency: str, required_amount: float) -> Tuple[bool, str]:
    """
    Checks if the free balance is sufficient for the required amount.
    
    Adds a 1% buffer for fees to ensure the order can be fully executed.

    Args:
        balance: The account balance dictionary.
        currency: The quote currency ticker (e.g., 'USDT').
        required_amount: The target amount required in the quote currency.

    Returns:
        A tuple of (is_sufficient, message) indicating the result of the check.
    """
    if not balance or currency not in balance:
        return False, f"Balance information for {currency} not available."
        
    free_balance = balance[currency]['free']
    
    # 1% buffer for fees
    required_with_buffer = required_amount * 1.01
    
    if free_balance >= required_with_buffer:
        return True, "Sufficient balance."
    else:
        return False, f"Insufficient {currency} balance. Available: {free_balance}, Required (w/ 1% buffer): {required_with_buffer:.6f}"

def calculate_order_amount(exchange: ccxt.Exchange, symbol: str, amount_usd: float, price: float) -> Tuple[float, bool, str]:
    """
    Calculates the order amount in base currency.
    
    Rounds the calculated amount according to market precision and verifies it 
    against the exchange's min/max market limits.

    Args:
        exchange: The initialized CCXT exchange instance.
        symbol: The trading pair symbol (e.g., 'BTC/USDT').
        amount_usd: The desired trade value in the quote currency.
        price: The limit price for the order.

    Returns:
        A tuple of (amount, is_valid, validation_message).
    """
    try:
        if not symbol or not price or price <= 0:
             return 0, False, "Invalid symbol or price."

        # Parse symbol
        base_currency, quote_currency = symbol.split('/')
        
        # Calculate tentative amount
        amount = amount_usd / price
        
        # Get market info for precision and limits
        market = exchange.market(symbol)
        
        # Apply limits
        limits = market.get('limits', {})
        amount_limits = limits.get('amount', {})
        min_amount = amount_limits.get('min')
        max_amount = amount_limits.get('max')
        
        if min_amount and amount < min_amount:
            return 0, False, f"Amount {amount:.8f} is below minimum limit {min_amount}."
        if max_amount and amount > max_amount:
            return 0, False, f"Amount {amount:.8f} exceeds maximum limit {max_amount}."
            
        # Round to precision
        amount = exchange.amount_to_precision(symbol, amount)
        amount = float(amount) # Ensure it's a float for comparisons
        
        logger.info(f"Calculated order amount: {amount} {base_currency} (approx ${amount_usd})")
        
        return amount, True, "Amount calculated successfully."

    except Exception as e:
        logger.error(f"Error calculating order amount: {e}")
        return 0, False, str(e)

def place_limit_order(exchange: ccxt.Exchange, symbol: str, side: str, amount: float, price: float, dry_run: bool = True) -> Optional[Dict[str, Any]]:
    """
    Places a limit order safely.
    
    If dry_run is True, skips actual exchange interaction and returns a simulated order object.

    Args:
        exchange: The initialized CCXT exchange instance.
        symbol: The trading pair symbol (e.g., 'BTC/USDT').
        side: The order side ('buy' or 'sell').
        amount: The order amount in base currency.
        price: The limit price for the order.
        dry_run: Boolean flag indicating if this is a safe simulation.

    Returns:
        The created order dictionary, or None if the operation failed.
    """
    try:
        if dry_run:
            logger.info(f"[DRY RUN] Would place LIMIT {side.upper()} order: {amount} {symbol} @ {price}")
            # Return a fake order object for testing
            return {
                'id': f'dry_run_{int(time.time())}',
                'symbol': symbol,
                'type': 'limit',
                'side': side,
                'amount': amount,
                'price': price,
                'status': 'open (simulated)',
                'timestamp': int(time.time() * 1000),
                'info': {'msg': 'This is a dry run order'}
            }
            
        # Real Order Placement
        logger.info(f"Placing REAL {side.upper()} limit order: {amount} {symbol} @ {price}")
        order = exchange.create_limit_order(symbol, side, amount, price)
        logger.info(f"Order placed successfully! ID: {order['id']}")
        return order

    except ccxt.InsufficientFunds as e:
        logger.error(f"Insufficient funds: {e}")
        # Try to print more info if possible
        logger.error(f"Check your account balance and open orders.")
        return None
    except ccxt.InvalidOrder as e:
        logger.error(f"Invalid order parameters: {e}")
        return None
    except ccxt.RateLimitExceeded as e:
        logger.warning(f"Rate limit exceeded during order placement. Backing off...")
        time.sleep(5) # Simple sleep, though main retry logic is better
        return None
    except ccxt.ExchangeError as e:
        logger.error(f"Exchange error during order placement: {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error placing order: {e}")
        logger.error(traceback.format_exc())
        return None

def calculate_risk_metrics(config: Dict[str, Any], balance: Dict[str, Any], current_price: float) -> Dict[str, Any]:
    """
    Calculates risk metrics and checks if proposed position exceeds limits.

    Args:
        config: The configuration dictionary.
        balance: The current account balance dictionary.
        current_price: The current price of the target asset.

    Returns:
        A dictionary containing calculated risk metrics and safety status.
    """
    portfolio_value_usd = 0.0
    for currency, details in balance.items():
        if isinstance(details, dict) and 'total' in details:
            amt = details['total']
            if currency in ['USDT', 'USD']:
                portfolio_value_usd += amt
            elif currency == config.get('symbol', 'BTC/USDT').split('/')[0]:
                portfolio_value_usd += amt * current_price

    max_position_percent = config.get('max_position_percent', 5.0)
    max_position_usd = portfolio_value_usd * (max_position_percent / 100)
    proposed_position_usd = config.get('trade_amount_usd', 10)
    
    is_safe = proposed_position_usd <= max_position_usd
    position_percent = (proposed_position_usd / portfolio_value_usd) * 100 if portfolio_value_usd > 0 else 0.0
    
    warnings = []
    if not is_safe:
        warnings.append(f"Proposed position ({proposed_position_usd:.2f} USD) exceeds max ({max_position_percent}% = {max_position_usd:.2f} USD)")

    metrics = {
        'is_safe': is_safe,
        'portfolio_value_usd': portfolio_value_usd,
        'max_position_usd': max_position_usd,
        'proposed_position_usd': proposed_position_usd,
        'position_percent': position_percent,
        'warnings': warnings
    }
    
    logger.info("--- Risk Metrics ---")
    logger.info(f"Portfolio Value: ${portfolio_value_usd:.2f}")
    logger.info(f"Max Position ({max_position_percent}%): ${max_position_usd:.2f}")
    logger.info(f"Proposed Position: ${proposed_position_usd:.2f} ({position_percent:.2f}%)")
    
    return metrics

def check_market_conditions(exchange: ccxt.Exchange, symbol: str, config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Checks market conditions (spread and volume) for safety.

    Args:
        exchange: The initialized CCXT exchange instance.
        symbol: The trading pair symbol.
        config: The configuration dictionary containing market condition limits.

    Returns:
        A dictionary containing market metrics, warnings, and a boolean indicating
        if conditions are favorable.
    """
    ticker = fetch_ticker(exchange, symbol)
    if not ticker or 'bid' not in ticker or 'ask' not in ticker or not ticker['bid'] or not ticker['ask']:
        return {'is_favorable': False, 'spread_percent': 0.0, 'volume_24h_usd': 0.0, 'warnings': ['Could not fetch ticker']}
        
    bid = ticker['bid']
    ask = ticker['ask']
    spread_percent = ((ask - bid) / bid) * 100
    max_spread_percent = config.get('max_spread_percent', 0.5)
    
    volume_24h_usd = ticker.get('quoteVolume')
    if volume_24h_usd is None:  
        base_volume = ticker.get('baseVolume')
        last_price = ticker.get('last')
        if base_volume and last_price:
            volume_24h_usd = base_volume * last_price
        else:
            volume_24h_usd = 0.0

    min_24h_volume_usd = config.get('min_24h_volume_usd', 1000000)
    
    warnings = []
    if spread_percent > max_spread_percent:
        warnings.append(f"Low liquidity warning: Spread is {spread_percent:.3f}%, which is > max allowed {max_spread_percent}%")
    if volume_24h_usd < min_24h_volume_usd:
        warnings.append(f"Inactive market warning: 24h Volume is ${volume_24h_usd:.2f}, which is < min allowed ${min_24h_volume_usd:.2f}")
        
    is_favorable = len(warnings) == 0
    
    metrics = {
        'is_favorable': is_favorable,
        'spread_percent': spread_percent,
        'volume_24h_usd': volume_24h_usd,
        'warnings': warnings
    }
    
    if not is_favorable:
        for w in warnings:
            logger.warning(w)
            
    return metrics

def confirm_trade(side: str, amount: float, price: float, symbol: str, dry_run: bool) -> bool:
    """
    Prints a confirmation summary and prompts the user if live trading.

    Args:
        side: The order side ('buy' or 'sell').
        amount: The order amount.
        price: The order limit price.
        symbol: The trading pair symbol.
        dry_run: Boolean indicating if dry-run mode is active.

    Returns:
        True if the user confirms or if dry_run is active, False otherwise.
    """
    total_cost = amount * price
    mode_text = "🟢 DRY RUN (SAFE)" if dry_run else "🔴 LIVE TRADING (REAL MONEY)"
    
    print("═══════════════════════════════════════")
    print("         TRADE CONFIRMATION")
    print("═══════════════════════════════════════")
    print(f"Symbol:      {symbol}")
    print(f"Side:        {side.upper()}")
    base_currency = symbol.split('/')[0] if '/' in symbol else symbol
    print(f"Amount:      {amount} {base_currency}")
    print(f"Price:       ${price:,.2f}")
    print(f"Total Cost:  ${total_cost:,.2f}")
    print(f"Mode:        {mode_text}")
    print("═══════════════════════════════════════")
    
    if dry_run:
        return True
        
    print("⚠️  LIVE TRADING MODE - REAL MONEY AT RISK")
    print("⚠️  This trade will execute on the exchange")
    print("⚠️  Make sure you understand the risks")
    user_input = input("Type 'CONFIRM' to proceed: ").strip()
    
    if user_input == 'CONFIRM':
        logger.info("User confirmed trade.")
        return True
    else:
        logger.info(f"User failed confirmation (input was '{user_input}').")
        return False

def create_order_params(exchange: ccxt.Exchange, config: Dict[str, Any], ticker: Dict[str, Any], balance: Dict[str, Any]) -> Optional[Tuple[str, float, float]]:
    """
    Calculates and validates order parameters (side, amount, price).

    Args:
        exchange: The CCXT exchange instance.
        config: The configuration dictionary.
        ticker: The current ticker data.
        balance: The current account balance.

    Returns:
        A tuple of (side, amount, price) if valid, or None if validation fails.
    """
    symbol = config.get('symbol', 'BTC/USDT')
    amount_usd = config.get('trade_amount_usd', 10)
    price_offset_pct = config.get('price_offset_percent', 0.1)
    
    # 1. Determine Side (Simulated strategy: Always Buy for now)
    side = 'buy'
    
    # 2. Calculate Price
    price = calculate_limit_price(ticker, side, price_offset_pct)
    if not price:
        logger.error("Could not calculate limit price.")
        return None

    # 3. Calculate Amount
    amount, is_valid, msg = calculate_order_amount(exchange, symbol, amount_usd, price)
    if not is_valid:
        logger.error(f"Order validation failed: {msg}")
        return None
        
    # 4. Check Balance (Double check before returning)
    quote_currency = symbol.split('/')[1]
    has_funds, funds_msg = check_sufficient_balance(balance, quote_currency, amount_usd)
    
    if not has_funds:
        logger.warning(funds_msg)
        # We might still return params in a dry_run, but generally we should stop.
        # For this function, let's return None to be safe.
        return None
    
    logger.info(funds_msg) # Log sufficient balance
    
    return side, amount, price

def log_order_summary(order: Optional[Dict[str, Any]]) -> None:
    """
    Pretty prints the order details.

    Args:
        order: The order dictionary to display.
    """
    if not order:
        return

    logger.info("-" * 40)
    logger.info(f"ORDER SUMMARY ({order.get('status', 'unknown').upper()})")
    logger.info("-" * 40)
    logger.info(f"ID:       {order.get('id')}")
    logger.info(f"Symbol:   {order.get('symbol')}")
    logger.info(f"Side:     {order.get('side', '').upper()}")
    logger.info(f"Type:     {order.get('type', '').upper()}")
    logger.info(f"Amount:   {order.get('amount')}")
    logger.info(f"Price:    {order.get('price')}")
    logger.info(f"Status:   {order.get('status')}")
    logger.info(f"Filled:   {order.get('filled', 0.0)}")
    logger.info("-" * 40)

@retry_with_backoff(max_retries=2)
def fetch_order_status(exchange: ccxt.Exchange, order_id: str, symbol: str, dry_run: bool = False) -> Optional[Dict[str, Any]]:
    """
    Fetches the current status of an order.
    
    Simulates status changes progressively when in dry_run mode.

    Args:
        exchange: The CCXT exchange instance.
        order_id: The ID of the order to check.
        symbol: The trading pair symbol.
        dry_run: Boolean flag indicating if this is a simulation.

    Returns:
        A dictionary containing the latest order status and details, or None if fetching fails.
    """
    if dry_run:
        # Initialize state if first check
        if order_id not in _dry_run_order_state:
            _dry_run_order_state[order_id] = {'checks': 0, 'filled': 0.0}
        
        state = _dry_run_order_state[order_id]
        state['checks'] += 1
        
        # Simulate progressive filling
        if state['checks'] <= 2:
            state['filled'] = 0.0
        elif state['checks'] <= 4:
            # Simulate partial fill (30% to 70%)
            if state['filled'] == 0.0:
                    state['filled'] = random.uniform(0.3, 0.7)
        else:
            state['filled'] = 1.0  # Fully filled
        
        logger.info("[DRY RUN] Simulating order status check")
        
        # Create simulated order
        is_closed = state['filled'] >= 1.0
        return {
            'id': order_id,
            'symbol': symbol,
            'status': 'closed' if is_closed else 'open',
            'filled': state['filled'],
            'amount': 1.0, # Dummy total amount for simulation calculation
            'remaining': 0.0 if is_closed else (1.0 - state['filled']),
            'info': {'msg': 'Simulated order status'}
        }
        
    order = exchange.fetch_order(order_id, symbol)
    fill_pct = (order.get('filled', 0) / order.get('amount', 1)) * 100
    logger.info(f"Order Status: {order['status'].upper()} | Filled: {fill_pct:.2f}%")
    return order

def wait_for_order_fill(exchange: ccxt.Exchange, order_id: str, symbol: str, max_wait_seconds: int, check_interval: int = 5, dry_run: bool = False) -> Tuple[bool, Optional[Dict[str, Any]]]:
    """
    Monitors an order until it is filled or the timeout is reached.

    Args:
        exchange: The CCXT exchange instance.
        order_id: The ID of the order to monitor.
        symbol: The trading pair symbol.
        max_wait_seconds: Maximum time to wait for the order to fill.
        check_interval: Delay in seconds between polling attempts.
        dry_run: Boolean flag indicating if this is a simulation.

    Returns:
        A tuple containing (is_filled_boolean, final_order_state_dictionary).
    """
    start_time = time.time()
    elapsed = 0
    
    logger.info(f"⏳ Monitoring order {order_id} for {max_wait_seconds} seconds...")
    
    try:
        while elapsed < max_wait_seconds:
            order = fetch_order_status(exchange, order_id, symbol, dry_run)
            
            if not order:
                time.sleep(check_interval)
                elapsed = time.time() - start_time
                continue
            
            # Calculate fill percentage
            filled = order.get('filled', 0.0)
            amount = order.get('amount', 1.0)
            fill_percent = (filled / amount) * 100
            
            logger.info(f"⏳ Waiting... {int(elapsed)}s elapsed | Fill: {fill_percent:.1f}%")
            
            if order['status'] == 'closed':
                logger.info("✅ Order filled completely!")
                return True, order
                
            if order['status'] == 'canceled':
                logger.info("❌ Order was canceled.")
                return False, order
                
            time.sleep(check_interval)
            elapsed = time.time() - start_time
            
        logger.info("⏱️ Timeout reached. Order not filled.")
        return False, order

    except KeyboardInterrupt:
        logger.warning("⚠️ Monitoring interrupted by user")
        return False, None

def cancel_order(exchange: ccxt.Exchange, order_id: str, symbol: str, dry_run: bool = True) -> Dict[str, Any]:
    """
    Cancels an open order.

    Args:
        exchange: The CCXT exchange instance.
        order_id: The ID of the order to cancel.
        symbol: The trading pair symbol.
        dry_run: Boolean flag indicating if this is a simulation.

    Returns:
        A dictionary indicating the success or failure of the cancellation.
    """
    if dry_run:
        logger.info(f"[DRY RUN] Would cancel order {order_id}")
        return {'success': True, 'message': 'Simulated cancellation'}
    
    try:
        logger.info(f"Attempting to cancel order {order_id}...")
        exchange.cancel_order(order_id, symbol)
        logger.info("✅ Order canceled successfully")
        return {'success': True}
    except ccxt.OrderNotFound:
        logger.warning("Order already filled or canceled.")
        return {'success': False}
    except ccxt.ExchangeError as e:
        logger.error(f"Exchange error canceling order: {e}")
        return {'success': False}
    except Exception as e:
        logger.error(f"Unexpected error canceling order: {e}")
        return {'success': False}

def graceful_shutdown(exchange: ccxt.Exchange, logger: logging.Logger) -> None:
    """
    Handles graceful shutdown by checking for and optionally cancelling open orders.

    Args:
        exchange: The CCXT exchange instance.
        logger: The logging instance to use for messages.
    """
    print("\n")
    logger.info("🛑 Initiating graceful shutdown...")
    
    try:
        # Check for open orders
        logger.info("Checking for open orders...")
        open_orders = exchange.fetch_open_orders()
        
        if open_orders:
            logger.warning(f"⚠️ You have {len(open_orders)} open order(s):")
            for order in open_orders:
                logger.info(f"  - Order ID: {order['id']} | {order['symbol']} | {order['side'].upper()} | {order['amount']} @ {order['price']}")
            
            # Ask user for confirmation (with timeout or default to yes/no? Prompt says ask user)
            # In a real bot, we might just cancel. Here we ask.
            # However, if this is a signal handler, input() might be tricky if not careful.
            # But the requirement says: Ask user: "Cancel all orders? (yes/no): "
            
            choice = input("Cancel all orders? (yes/no): ").lower()
            if choice == 'yes' or choice == 'y':
                for order in open_orders:
                    cancel_order(exchange, order['id'], order['symbol'], dry_run=False) # Force cancel even if dry_run config was on? 
                    # The prompt says "If yes: cancel each order and log results". 
                    # Note: cancel_order has a dry_run param. We should probably respect global dry_run setting, 
                    # but if we are shutting down, maybe we want to really cancel?
                    # The prompt implies real cancellation "Cancel all orders?". 
                    # But for safety in this example, I'll pass dry_run based on context or assume real if user says yes.
                    # Since global 'dry_run' isn't easily accessible here without passing it, I'll assume real cancellation is intended if orders exist.
                    # Wait, if we are in dry_run mode, there are no real orders on exchange (except simulated ones in memory, which fetch_open_orders won't find on real exchange).
                    # So if fetch_open_orders returns anything, it MUST be real orders (or we are in dry_run and simulating fetch_open_orders, which we aren't).
                    # So safe to assume we should cancel.
                    pass 
        else:
            logger.info("No open orders found.")
            
    except Exception as e:
        logger.error(f"Error during shutdown checks: {e}")
        logger.error("Detailed error during shutdown:")
        logger.error(traceback.format_exc())
    
    logger.info("✅ Shutdown complete")

def signal_handler(sig: int, frame: Any) -> None:
    """
    Handles system signals (like Ctrl+C).
    
    Triggers the graceful shutdown process before exiting.

    Args:
        sig: The signal number.
        frame: The current stack frame.
    """
    print("\n")
    logger = logging.getLogger('trading_bot')
    logger.warning("⚠️ Interrupt received (Ctrl+C)")
    
    # We need access to 'exchange' here. 
    # Since signal handler signature is fixed, we might need a global variable or 
    # handle the shutdown inside main's try-catch block for KeyboardInterrupt instead?
    # The requirement says:
    # "Add function: signal_handler(sig, frame) ... Call graceful_shutdown() ... sys.exit(0)"
    
    # Issue: 'exchange' is local to main().
    # Solution: We can declare 'exchange' as global in main or assign it to a module-level variable.
    # OR, better: The prompt also says in Step 8: "Wrap entire main logic in try-except-finally ... except KeyboardInterrupt: graceful_shutdown(exchange, logger)"
    # If we catch KeyboardInterrupt in main, we effectively handle Ctrl+C there.
    # The signal_handler might be for other signals or redundant if we catch KeyboardInterrupt.
    # However, Step 7 explicitly asks for signal_handler REGISTERING.
    # If we register signal_handler, it will be called on SIGINT. 
    # If signal_handler calls sys.exit(0), main's except KeyboardInterrupt might NOT be caught? 
    # Actually, sys.exit(0) raises SystemExit.
    
    # If we use signal_handler, we need access to 'exchange'.
    # A common pattern is to have a global 'bot_instance' or similar.
    # But for this simple script, maybe we can skip signal_handler if main catch handles it?
    # No, I must follow prompt.
    # "Register handler: signal.signal(signal.SIGINT, signal_handler)"
    
    # To pass exchange to signal_handler, I can use a global variable.
    global exchange_instance
    if 'exchange_instance' in globals() and exchange_instance:
        graceful_shutdown(exchange_instance, logger)
    else:
        logger.info("Exiting before exchange was initialized.")
    sys.exit(0)

# Global variable to hold exchange for signal handler
exchange_instance = None

def main() -> None:
    """
    Main execution entry point for the trading bot.
    
    Parses command-line arguments, sets up logging, validates the configuration,
    connects to the exchange, and executes the predefined trading logic.
    """
    parser = argparse.ArgumentParser(description='Advanced Trading Bot')
    parser.add_argument('--config', type=str, default='config.json', help='path to config file')
    parser.add_argument('--dry-run', action='store_true', help='force dry-run mode')
    parser.add_argument('--log-level', choices=['DEBUG', 'INFO', 'WARNING'], help='set log level')
    args = parser.parse_args()

    # Register signal handler for Ctrl+C
    signal.signal(signal.SIGINT, signal_handler)
    
    # Global exchange instance for signal handler
    global exchange_instance

    try:
        # 1. Get our settings
        config = load_config(args.config)
        
        # Override with command line arguments
        if args.dry_run:
            config['dry_run'] = True
            
        if args.log_level:
            config['log_level'] = args.log_level
            
        # Re-initialize logging with config values
        global logger
        logger = setup_logging(
            log_level=config.get('log_level', 'INFO'), 
            log_file=config.get('log_file', 'trading_bot.log')
        )
        
        logger.info("Starting the Trading Bot...")
        
        try:
            config = validate_config(config)
        except ValueError as e:
            logger.error(f"Configuration Error: {e}")
            sys.exit(1)
            
        print_config_summary(config)
        
        if not config.get('dry_run'):
            print("⚠️  WARNING: DRY RUN MODE IS DISABLED")
            print("⚠️  WARNING: THIS BOT WILL PLACE REAL ORDERS")
            print("⚠️  WARNING: YOU COULD LOSE REAL MONEY")
            time.sleep(2)
        
        # 2. Connect to the exchange
        exchange = initialize_exchange(config)
        exchange_instance = exchange # Set global for signal handler
        
        # Extract other config variables
        symbol = config.get('symbol', 'BTC/USDT')
        amount_usd = config.get('trade_amount_usd', 10)
        price_offset_pct = config.get('price_offset_percent', 0.1)
        dry_run = config.get('dry_run', True)
        
        # Verify symbol exists
        if symbol not in exchange.markets:
            logger.error(f"Symbol {symbol} not supported on {exchange.id}")
            return

        # 4. Fetch Market Data & Balance
        logger.info("Fetching market data and balance...")
        ticker = fetch_ticker(exchange, symbol)
        balance = fetch_balance(exchange)
        
        if not ticker or not balance:
            logger.error("Failed to fetch necessary data. Aborting.")
            return
            
        # Optional: Fetch Order Book to show depth (not used in logic yet)
        fetch_order_book(exchange, symbol)
        
        # 5. Prepare Order Parameters
        logger.info("Calculating order parameters...")
        order_params = create_order_params(exchange, config, ticker, balance)
        
        start_order_execution = False
        if order_params:
            side, amount, price = order_params
            
            # a) Calculate risk metrics
            risk_metrics = calculate_risk_metrics(config, balance, ticker['last'])
            if not risk_metrics['is_safe']:
                for w in risk_metrics['warnings']:
                    logger.error(w)
                print("❌ Trade blocked due to risk limits")
                return
            
            # b) Check market conditions
            market_cond = check_market_conditions(exchange, symbol, config)
            if not market_cond['is_favorable']:
                for w in market_cond['warnings']:
                    logger.warning(w)
                if input("Market conditions not ideal. Continue anyway? (yes/no): ").strip().lower() != 'yes':
                    return
            
            # c) Confirm trade
            if not confirm_trade(side, amount, price, symbol, config.get('dry_run', True)):
                logger.info("Trade cancelled by user")
                return
                
            start_order_execution = True
        else:
            logger.warning("Could not generate valid order parameters.")

        # 6. Place Order (with Dry Run Safety)
        if start_order_execution:
            # SAFETY CHECK: DRY RUN IS ENABLED BY DEFAULT
            if dry_run:
                logger.info(">> DRY RUN MODE ENABLED: No real funds will be used. <<")
            
            order = place_limit_order(exchange, symbol, side, amount, price, dry_run)
            
            # 7. Log Summary & Monitor
            if order:
                log_order_summary(order)
                
                logger.info("Starting order monitoring...")
                
                # Get max wait time from config, default to 60s
                max_wait = config.get('max_wait_seconds', 60)
                
                # Start monitoring loop
                filled, final_order = wait_for_order_fill(
                    exchange, 
                    order['id'], 
                    symbol, 
                    max_wait,
                    dry_run=dry_run
                )
                
                if filled:
                    logger.info("🎉 Trade completed successfully!")
                    log_order_summary(final_order)
                else:
                    logger.info("Order not filled in time (or canceled), attempting cancellation...")
                    cancel_result = cancel_order(exchange, order['id'], symbol, dry_run=dry_run)
                    
                    # Fetch final status one last time to be sure
                    if final_order:
                         final_status = final_order.get('status', 'unknown')
                         filled_amount = final_order.get('filled', 0)
                         logger.info(f"Final status: {final_status.upper()} (Filled: {filled_amount})")

    except KeyboardInterrupt:
        logger.warning("⚠️ User interrupted execution")
        if 'exchange' in locals():
            graceful_shutdown(exchange, logger)
    except ccxt.ExchangeError as e:
        logger.error(f"Exchange error: {e}")
        logger.error("Please check your API keys and permissions in config.json")
    except Exception as e:
        logger.error("❌ Unexpected error occurred")
        logger.error(traceback.format_exc())
        logger.info("Please report this issue to the developer.")
    finally:
        logger.info("Bot execution finished")

if __name__ == "__main__":
    main()

"""
TESTING CHECKLIST (Run in dry-run mode):

Basic Functionality:
[ ] Config loads successfully from config.json
[ ] Exchange connection works with valid credentials
[ ] Market data fetches correctly (ticker, orderbook)
[ ] Balance fetching works
[ ] Order amount calculation is correct
[ ] Limit price calculation is accurate
[ ] Order placement succeeds (dry-run)
[ ] Order monitoring displays status updates
[ ] Order cancellation works (dry-run)

Error Handling:
[ ] Invalid config file shows clear error
[ ] Missing API credentials show helpful message
[ ] Network errors trigger retry logic
[ ] Rate limit errors are handled gracefully
[ ] Insufficient balance is detected
[ ] Invalid symbol shows error

Safety Features:
[ ] Risk metrics calculate correctly
[ ] Position limits are enforced
[ ] Market condition checks work
[ ] Spread warnings trigger when needed
[ ] Volume warnings trigger when needed
[ ] User confirmation required in live mode
[ ] Dry-run mode clearly indicated

User Experience:
[ ] Logging outputs to console clearly
[ ] Log file is created (trading_bot.log)
[ ] Config summary displays correctly
[ ] Command-line args work (--dry-run, --config, --log-level)
[ ] Ctrl+C triggers graceful shutdown
[ ] Error messages are user-friendly

Edge Cases:
[ ] Handles partial order fills
[ ] Works with different exchanges (test 2-3)
[ ] Works with different symbols
[ ] Handles API downtime
[ ] Handles rapid price changes

Code Quality:
[ ] All functions have type hints
[ ] All functions have docstrings
[ ] No unused imports or variables
[ ] Code follows PEP 8 style guide
[ ] Line length < 100 characters
[ ] No TODO or FIXME comments remaining
"""

"""
MANUAL TESTING PROCEDURE:

Test 1: Basic Dry-Run
----------------------
1. Copy config.json.example to config.json
2. Add valid API credentials
3. Ensure dry_run=true
4. Run: python trading_bot.py
5. Verify: Bot runs without errors, simulates order

Test 2: Invalid Config
----------------------
1. Remove api_key from config.json
2. Run: python trading_bot.py
3. Verify: Clear error message about missing API key

Test 3: Risk Limits
--------------------
1. Set trade_amount_usd very high (e.g., 10000)
2. Set max_position_percent to 5.0
3. Run: python trading_bot.py
4. Verify: Trade blocked due to risk limits

Test 4: Market Conditions
-------------------------
1. Set max_spread_percent to 0.01 (very strict)
2. Run: python trading_bot.py
3. Verify: Warning about spread too wide

Test 5: Graceful Shutdown
-------------------------
1. Run: python trading_bot.py
2. Press Ctrl+C during execution
3. Verify: Clean shutdown message, no errors

Test 6: Command-Line Args
-------------------------
1. Run: python trading_bot.py --help
2. Verify: Help message displays
3. Run: python trading_bot.py --log-level DEBUG
4. Verify: More detailed logs appear

Test 7: Log File
----------------
1. Run the bot
2. Check: trading_bot.log file is created
3. Verify: Contains detailed logs
"""
