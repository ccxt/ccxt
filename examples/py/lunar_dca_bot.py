# -*- coding: utf-8 -*-

"""
Lunar-based DCA (Dollar Cost Averaging) Execution Algorithm

This script demonstrates how to integrate external alternative data (Lunar Calendar)
to gate trade execution. It implements a 'Feng Shui' constraint on standard DCA logic.

Dependencies:
    pip install ccxt lunar_python

Usage:
    Set your API keys as environment variables:
        export BINANCE_API_KEY="your_api_key"
        export BINANCE_SECRET="your_secret"

    Then run:
        python lunar_dca_bot.py

Note: This script uses Binance sandbox/testnet mode by default.
"""

import asyncio
import os
import sys
from datetime import datetime

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt.async_support as ccxt  # noqa: E402

# lunar_python is required for Lunar calendar calculations
# pip install lunar_python
from lunar_python import Lunar, Solar  # noqa: E402


# =============================================================================
# Configuration
# =============================================================================

EXCHANGE_ID = 'binance'
SYMBOL = 'BTC/USDT'
BUY_AMOUNT = 0.001  # Amount of BTC to buy per execution
CHECK_INTERVAL_SECONDS = 60  # Check every minute

# Auspicious activities for trading (Traditional Chinese)
AUSPICIOUS_ACTIVITIES = ['交易', '纳财']  # Trading, Wealth accumulation
INAUSPICIOUS_ACTIVITIES = ['交易']  # Trading (when in avoid list)


# =============================================================================
# Lunar Calendar Analysis
# =============================================================================

def get_lunar_time_info(dt: datetime) -> dict:
    """
    Convert a datetime to Lunar calendar and extract metaphysical data.

    Args:
        dt: The datetime to analyze

    Returns:
        Dictionary containing lunar time analysis
    """
    solar = Solar.fromDate(dt)
    lunar = solar.getLunar()

    # Get the Eight Characters (BaZi) - Four Pillars of Destiny
    bazi = {
        'year': lunar.getYearInGanZhi(),
        'month': lunar.getMonthInGanZhi(),
        'day': lunar.getDayInGanZhi(),
        'hour': lunar.getTimeInGanZhi(),
    }

    # Get Yi (宜 - Suitable/Auspicious activities) and Ji (忌 - Avoid activities)
    day_yi = lunar.getDayYi()  # List of suitable activities for the day
    day_ji = lunar.getDayJi()  # List of activities to avoid for the day

    # Get zodiac clash information
    day_chong = lunar.getDayChongDesc()  # What zodiac the day clashes with

    return {
        'lunar_date': lunar.toString(),
        'bazi': bazi,
        'yi': day_yi,
        'ji': day_ji,
        'clash': day_chong,
        'lunar': lunar,
    }


def is_auspicious_for_trading(lunar_info: dict) -> tuple[bool, str]:
    """
    Determine if the current time is auspicious for trading.

    The algorithm checks:
    1. If 'Trading' (交易) is in the avoid list -> NOT auspicious
    2. If 'Trading' (交易) or 'Wealth' (纳财) is in the suitable list -> auspicious

    Args:
        lunar_info: Dictionary from get_lunar_time_info()

    Returns:
        Tuple of (is_auspicious: bool, reason: str)
    """
    yi_list = lunar_info['yi']
    ji_list = lunar_info['ji']

    # Check if trading is explicitly forbidden
    for activity in INAUSPICIOUS_ACTIVITIES:
        if activity in ji_list:
            return False, f"Trading (交易) is in the avoid list (忌)"

    # Check if trading or wealth activities are suitable
    for activity in AUSPICIOUS_ACTIVITIES:
        if activity in yi_list:
            return True, f"Auspicious activity detected: {activity}"

    return False, "No auspicious trading signals in today's Yi (宜) list"


def format_bazi(bazi: dict) -> str:
    """Format BaZi (Eight Characters) for display."""
    return f"Year: {bazi['year']} | Month: {bazi['month']} | Day: {bazi['day']} | Hour: {bazi['hour']}"


# =============================================================================
# Trading Logic
# =============================================================================

async def execute_buy_order(exchange, symbol: str, amount: float) -> dict:
    """
    Execute a market buy order.

    Args:
        exchange: CCXT exchange instance
        symbol: Trading pair symbol
        amount: Amount to buy

    Returns:
        Order response dictionary
    """
    try:
        order = await exchange.create_market_buy_order(symbol, amount)
        return {'success': True, 'order': order}
    except Exception as e:
        return {'success': False, 'error': str(e)}


async def run_bot():
    """
    Main bot loop implementing Lunar-based DCA strategy.

    The bot checks lunar calendar conditions every minute and executes
    trades only when the time is auspicious according to traditional
    Chinese metaphysics.
    """
    print("=" * 70)
    print("  LUNAR DCA BOT - Feng Shui Dollar Cost Averaging")
    print("=" * 70)
    print(f"  Exchange: {EXCHANGE_ID} (Sandbox Mode)")
    print(f"  Symbol: {SYMBOL}")
    print(f"  Buy Amount: {BUY_AMOUNT}")
    print(f"  Check Interval: {CHECK_INTERVAL_SECONDS}s")
    print("=" * 70)
    print()

    # Initialize exchange in sandbox mode
    exchange = getattr(ccxt, EXCHANGE_ID)({
        'apiKey': os.environ.get('BINANCE_API_KEY', 'YOUR_API_KEY'),
        'secret': os.environ.get('BINANCE_SECRET', 'YOUR_SECRET'),
        'enableRateLimit': True,
    })

    # Enable sandbox/testnet mode
    exchange.set_sandbox_mode(True)

    try:
        # Load markets
        print("[INIT] Loading markets...")
        await exchange.load_markets()
        print(f"[INIT] Markets loaded. {len(exchange.markets)} pairs available.")
        print()

        execution_count = 0

        while True:
            now = datetime.now()
            timestamp = now.strftime("%Y-%m-%d %H:%M:%S")

            print("-" * 70)
            print(f"[CHECK] {timestamp}")

            # Get lunar calendar analysis
            lunar_info = get_lunar_time_info(now)

            # Display BaZi (Eight Characters)
            print(f"[BAZI] {format_bazi(lunar_info['bazi'])}")
            print(f"[LUNAR] {lunar_info['lunar_date']}")

            # Check if time is auspicious
            is_auspicious, reason = is_auspicious_for_trading(lunar_info)

            if not is_auspicious:
                # The stars are not aligned
                clash_info = lunar_info['clash']
                print(f"[WAITING] The stars are not aligned. {reason}")
                print(f"[WAITING] Current day clashes with: {clash_info}")
                print(f"[WAITING] Yi (宜): {', '.join(lunar_info['yi'][:5])}...")
                print(f"[WAITING] Ji (忌): {', '.join(lunar_info['ji'][:5])}...")
            else:
                # Auspicious time detected!
                print(f"[SIGNAL] {reason}")
                print(f"[EXECUTION] Auspicious time detected! Buying {BUY_AMOUNT} {SYMBOL}...")

                result = await execute_buy_order(exchange, SYMBOL, BUY_AMOUNT)

                if result['success']:
                    execution_count += 1
                    order = result['order']
                    print(f"[SUCCESS] Order executed successfully!")
                    print(f"[SUCCESS] Order ID: {order.get('id', 'N/A')}")
                    print(f"[SUCCESS] Total executions: {execution_count}")
                else:
                    print(f"[ERROR] Order failed: {result['error']}")

            print()

            # Wait for next check
            await asyncio.sleep(CHECK_INTERVAL_SECONDS)

    except KeyboardInterrupt:
        print("\n[SHUTDOWN] Bot stopped by user.")
    except Exception as e:
        print(f"\n[ERROR] Unexpected error: {type(e).__name__}: {e}")
    finally:
        await exchange.close()
        print("[SHUTDOWN] Exchange connection closed.")


# =============================================================================
# Entry Point
# =============================================================================

if __name__ == '__main__':
    print()
    print("Starting Lunar DCA Bot...")
    print("Press Ctrl+C to stop.")
    print()
    asyncio.run(run_bot())
