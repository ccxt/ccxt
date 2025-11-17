#!/usr/bin/env python3
"""
Comprehensive AsterDEX Test Suite - Python

Tests all public and private methods for AsterDEX exchange
Safe for testing - uses small amounts and includes dry-run options
"""

import sys
import os
import time
import json
from datetime import datetime

# Add parent directory to path for ccxt import
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import ccxt

# ============================================================================
# CONFIGURATION - SET YOUR CREDENTIALS HERE
# ============================================================================

CONFIG = {
    # Required: Your wallet address
    'wallet_address': '0x06964466831ac13f351bD84fc2669572A59E0F24',

    # Required for private methods: Your private key (without 0x prefix)
    # ⚠️  WARNING: NEVER commit this file with your real private key!
    # ⚠️  Use environment variables in production: os.getenv('PRIVATE_KEY')
    'private_key': 'YOUR_PRIVATE_KEY_HERE',

    # Test configuration
    'test_private_methods': False,  # Set to True when you add your private key
    'test_order_placement': False,  # Set to True to test order creation (uses real funds!)

    # Trading parameters for order tests (if enabled)
    'test_symbol': 'BTC/USDT',     # Symbol to use for order tests
    'test_amount': 0.001,          # Small amount for testing
    'test_price': 20000,           # Limit price (set safely below/above market)

    # API options
    'enable_rate_limit': True,
    'timeout': 30000,
}

# ============================================================================
# TEST SUITE
# ============================================================================

class AsterDEXTestSuite:
    def __init__(self, config):
        self.config = config
        self.exchange = None
        self.results = {
            'total': 0,
            'passed': 0,
            'failed': 0,
            'skipped': 0,
            'tests': []
        }

    def init(self):
        """Initialize exchange"""
        print('╔═══════════════════════════════════════════════════════════════╗')
        print('║     AsterDEX Comprehensive Test Suite - Python               ║')
        print('╚═══════════════════════════════════════════════════════════════╝')
        print('')

        credentials = {
            'enableRateLimit': self.config['enable_rate_limit'],
            'timeout': self.config['timeout'],
        }

        if self.config['test_private_methods']:
            if not self.config['private_key'] or self.config['private_key'] == 'YOUR_PRIVATE_KEY_HERE':
                print('❌ ERROR: Private key not configured!')
                print('   Set CONFIG["private_key"] to test private methods.')
                print('   Or set CONFIG["test_private_methods"] = False to skip.')
                sys.exit(1)
            credentials['walletAddress'] = self.config['wallet_address']
            credentials['privateKey'] = self.config['private_key']
            print('🔐 Authentication: ENABLED')
            print(f'   Wallet: {self.config["wallet_address"]}')
        else:
            print('📖 Authentication: DISABLED (public methods only)')
            print(f'   Wallet: {self.config["wallet_address"]}')

        print('')
        self.exchange = ccxt.asterdex(credentials)

        # Load markets first
        print('📥 Loading markets...')
        try:
            self.exchange.load_markets()
            print('✅ Markets loaded successfully')
            print('')
        except Exception as e:
            print(f'❌ Failed to load markets: {e}')
            print('   The exchange API may be offline or unreachable.')
            print('')

    def run_test(self, name, fn, requires_auth=False, category='General'):
        """Test runner helper"""
        self.results['total'] += 1
        test_num = self.results['total']

        print(f'[{test_num}] {category} → {name}')

        if requires_auth and not self.config['test_private_methods']:
            print('    ⏭️  SKIPPED (requires authentication)\n')
            self.results['skipped'] += 1
            self.results['tests'].append({'name': name, 'status': 'skipped', 'category': category})
            return None

        try:
            start_time = time.time()
            result = fn()
            duration = int((time.time() - start_time) * 1000)

            print(f'    ✅ PASSED ({duration}ms)')
            self.display_result(result)
            print('')

            self.results['passed'] += 1
            self.results['tests'].append({
                'name': name,
                'status': 'passed',
                'category': category,
                'duration': duration,
                'result': result
            })
            return result
        except Exception as error:
            print(f'    ❌ FAILED: {error}')
            if hasattr(error, '__traceback__'):
                import traceback
                tb_lines = traceback.format_tb(error.__traceback__)
                if tb_lines:
                    print(f'    Stack: {tb_lines[-1].strip()}')
            print('')

            self.results['failed'] += 1
            self.results['tests'].append({
                'name': name,
                'status': 'failed',
                'category': category,
                'error': str(error)
            })
            return None

    def display_result(self, result):
        """Display result helper"""
        if result is None:
            print('    Result: None')
            return

        if isinstance(result, dict):
            keys = list(result.keys())
            if len(keys) <= 5:
                formatted = json.dumps(result, indent=2, default=str)
                print('    Result:', formatted.replace('\n', '\n           '))
            else:
                print(f'    Result: Dict with {len(keys)} keys')
                sample = {k: result[k] for k in keys[:3]}
                formatted = json.dumps(sample, indent=2, default=str)
                print('      Sample:', formatted.replace('\n', '\n           '))
        elif isinstance(result, list):
            print(f'    Result: List[{len(result)}]')
            if 0 < len(result) <= 3:
                for idx, item in enumerate(result):
                    formatted = json.dumps(item, indent=2, default=str)
                    print(f'      [{idx}]:', formatted.replace('\n', '\n           '))
            elif len(result) > 0:
                formatted = json.dumps(result[0], indent=2, default=str)
                print('      First item:', formatted.replace('\n', '\n           '))
        else:
            print(f'    Result: {result}')

    # ========================================================================
    # PUBLIC METHOD TESTS
    # ========================================================================

    def test_public_methods(self):
        """Test public API methods"""
        print('═══════════════════════════════════════════════════════════════')
        print('PUBLIC API TESTS (No Authentication Required)')
        print('═══════════════════════════════════════════════════════════════\n')

        # Test fetch_time
        self.run_test(
            'fetch_time()',
            lambda: self.exchange.fetch_time(),
            False,
            'Public'
        )

        # Test fetch_status
        self.run_test(
            'fetch_status()',
            lambda: self.exchange.fetch_status(),
            False,
            'Public'
        )

        # Test fetch_markets
        markets = self.run_test(
            'fetch_markets()',
            lambda: self.exchange.fetch_markets(),
            False,
            'Public'
        )

        # Get a sample symbol for subsequent tests
        sample_symbol = self.config['test_symbol']
        if markets and len(markets) > 0:
            sample_symbol = markets[0]['symbol']
            print(f'    ℹ️  Using {sample_symbol} for subsequent tests\n')

        # Test fetch_ticker
        self.run_test(
            f'fetch_ticker(\'{sample_symbol}\')',
            lambda: self.exchange.fetch_ticker(sample_symbol),
            False,
            'Public'
        )

        # Test fetch_tickers
        self.run_test(
            'fetch_tickers()',
            lambda: f'{len(self.exchange.fetch_tickers())} tickers',
            False,
            'Public'
        )

        # Test fetch_order_book
        self.run_test(
            f'fetch_order_book(\'{sample_symbol}\', 10)',
            lambda: self.exchange.fetch_order_book(sample_symbol, 10),
            False,
            'Public'
        )

        # Test fetch_trades
        self.run_test(
            f'fetch_trades(\'{sample_symbol}\', limit=5)',
            lambda: self.exchange.fetch_trades(sample_symbol, limit=5),
            False,
            'Public'
        )

        # Test fetch_ohlcv
        self.run_test(
            f'fetch_ohlcv(\'{sample_symbol}\', \'1h\', limit=5)',
            lambda: self.exchange.fetch_ohlcv(sample_symbol, '1h', limit=5),
            False,
            'Public'
        )

        # Test fetch_funding_rate
        if markets and any(m.get('swap') or m.get('future') for m in markets):
            swap_symbol = next((m['symbol'] for m in markets if m.get('swap') or m.get('future')), sample_symbol)
            self.run_test(
                f'fetch_funding_rate(\'{swap_symbol}\')',
                lambda: self.exchange.fetch_funding_rate(swap_symbol),
                False,
                'Public'
            )

        # Test fetch_funding_rates
        self.run_test(
            'fetch_funding_rates()',
            lambda: self.exchange.fetch_funding_rates(),
            False,
            'Public'
        )

        # Test fetch_funding_rate_history
        self.run_test(
            f'fetch_funding_rate_history(\'{sample_symbol}\', limit=5)',
            lambda: self.exchange.fetch_funding_rate_history(sample_symbol, limit=5),
            False,
            'Public'
        )

    # ========================================================================
    # PRIVATE METHOD TESTS (REQUIRE AUTHENTICATION)
    # ========================================================================

    def test_private_methods(self):
        """Test private API methods"""
        print('═══════════════════════════════════════════════════════════════')
        print('PRIVATE API TESTS (Require Authentication)')
        print('═══════════════════════════════════════════════════════════════\n')

        if not self.config['test_private_methods']:
            print('⏭️  SKIPPED - Set CONFIG["test_private_methods"] = True to enable')
            print('')
            return

        # Test fetch_balance
        balance = self.run_test(
            'fetch_balance()',
            lambda: self.exchange.fetch_balance(),
            True,
            'Account'
        )

        # Test fetch_accounts (if supported)
        if self.exchange.has.get('fetchAccounts'):
            self.run_test(
                'fetch_accounts()',
                lambda: self.exchange.fetch_accounts(),
                True,
                'Account'
            )

        # Get markets for trading tests
        markets = self.exchange.markets
        sample_symbol = list(markets.keys())[0] if markets else self.config['test_symbol']

        # Test fetch_open_orders
        self.run_test(
            f'fetch_open_orders(\'{sample_symbol}\')',
            lambda: self.exchange.fetch_open_orders(sample_symbol),
            True,
            'Orders'
        )

        # Test fetch_orders
        self.run_test(
            f'fetch_orders(\'{sample_symbol}\', limit=10)',
            lambda: self.exchange.fetch_orders(sample_symbol, limit=10),
            True,
            'Orders'
        )

        # Test fetch_my_trades
        self.run_test(
            f'fetch_my_trades(\'{sample_symbol}\', limit=10)',
            lambda: self.exchange.fetch_my_trades(sample_symbol, limit=10),
            True,
            'Trades'
        )

        # Test fetch_positions (for futures/swap)
        swap_markets = [m for m in markets.values() if m.get('swap') or m.get('future')]
        if swap_markets:
            self.run_test(
                'fetch_positions()',
                lambda: self.exchange.fetch_positions(),
                True,
                'Positions'
            )

            swap_symbol = swap_markets[0]['symbol']
            self.run_test(
                f'fetch_position(\'{swap_symbol}\')',
                lambda: self.exchange.fetch_position(swap_symbol),
                True,
                'Positions'
            )

        # Test fetch_position_mode
        if self.exchange.has.get('fetchPositionMode'):
            self.run_test(
                'fetch_position_mode()',
                lambda: self.exchange.fetch_position_mode(),
                True,
                'Positions'
            )

        # Test fetch_leverage (if available)
        if self.exchange.has.get('fetchLeverage'):
            self.run_test(
                f'fetch_leverage(\'{sample_symbol}\')',
                lambda: self.exchange.fetch_leverage(sample_symbol),
                True,
                'Margin'
            )

        # Test fetch_leverage_tiers
        if self.exchange.has.get('fetchLeverageTiers'):
            self.run_test(
                'fetch_leverage_tiers()',
                lambda: self.exchange.fetch_leverage_tiers(),
                True,
                'Margin'
            )

    # ========================================================================
    # ORDER MANAGEMENT TESTS (USE WITH CAUTION!)
    # ========================================================================

    def test_order_management(self):
        """Test order management"""
        print('═══════════════════════════════════════════════════════════════')
        print('ORDER MANAGEMENT TESTS ⚠️  (Uses Real Funds!)')
        print('═══════════════════════════════════════════════════════════════\n')

        if not self.config['test_order_placement']:
            print('⏭️  SKIPPED - Set CONFIG["test_order_placement"] = True to enable')
            print('⚠️  WARNING: These tests place REAL orders with REAL funds!')
            print('')
            return

        if not self.config['test_private_methods']:
            print('❌ Cannot test order management without authentication')
            print('')
            return

        print('⚠️  WARNING: The following tests will place REAL orders!')
        print('⚠️  Make sure you have set safe test parameters in CONFIG')
        print('')

        symbol = self.config['test_symbol']
        amount = self.config['test_amount']
        price = self.config['test_price']

        # Test create_order (limit buy - far from market)
        order = self.run_test(
            f'create_order(\'{symbol}\', \'limit\', \'buy\', {amount}, {price})',
            lambda: self.exchange.create_order(symbol, 'limit', 'buy', amount, price),
            True,
            'Trading'
        )

        if order and order.get('id'):
            order_id = order['id']

            # Test fetch_order
            self.run_test(
                f'fetch_order(\'{order_id}\', \'{symbol}\')',
                lambda: self.exchange.fetch_order(order_id, symbol),
                True,
                'Trading'
            )

            # Test cancel_order
            self.run_test(
                f'cancel_order(\'{order_id}\', \'{symbol}\')',
                lambda: self.exchange.cancel_order(order_id, symbol),
                True,
                'Trading'
            )

        # Test cancel_all_orders
        if self.exchange.has.get('cancelAllOrders'):
            self.run_test(
                f'cancel_all_orders(\'{symbol}\')',
                lambda: self.exchange.cancel_all_orders(symbol),
                True,
                'Trading'
            )

    # ========================================================================
    # MARGIN & LEVERAGE TESTS
    # ========================================================================

    def test_margin_and_leverage(self):
        """Test margin and leverage"""
        print('═══════════════════════════════════════════════════════════════')
        print('MARGIN & LEVERAGE TESTS')
        print('═══════════════════════════════════════════════════════════════\n')

        if not self.config['test_private_methods']:
            print('⏭️  SKIPPED - Requires authentication')
            print('')
            return

        markets = self.exchange.markets
        swap_markets = [m for m in markets.values() if m.get('swap') or m.get('future')]

        if not swap_markets:
            print('⏭️  SKIPPED - No futures/swap markets available')
            print('')
            return

        symbol = swap_markets[0]['symbol']

        # Note: Uncomment these if you want to actually change leverage/margin mode
        # These methods MODIFY your account settings!

        # self.run_test(
        #     f'set_leverage(10, \'{symbol}\')',
        #     lambda: self.exchange.set_leverage(10, symbol),
        #     True,
        #     'Margin'
        # )

        # self.run_test(
        #     f'set_margin_mode(\'isolated\', \'{symbol}\')',
        #     lambda: self.exchange.set_margin_mode('isolated', symbol),
        #     True,
        #     'Margin'
        # )

        print('ℹ️  Leverage/Margin modification tests commented out for safety')
        print('   Uncomment in source if you want to test these methods')
        print('')

    # ========================================================================
    # SUMMARY AND REPORTING
    # ========================================================================

    def print_summary(self):
        """Print test summary"""
        print('═══════════════════════════════════════════════════════════════')
        print('TEST SUMMARY')
        print('═══════════════════════════════════════════════════════════════\n')

        print(f'Total Tests:   {self.results["total"]}')
        print(f'✅ Passed:     {self.results["passed"]}')
        print(f'❌ Failed:     {self.results["failed"]}')
        print(f'⏭️  Skipped:    {self.results["skipped"]}')
        print('')

        if self.results['failed'] > 0:
            print('Failed Tests:')
            for test in self.results['tests']:
                if test['status'] == 'failed':
                    print(f'  ❌ [{test["category"]}] {test["name"]}')
                    print(f'     Error: {test["error"]}')
            print('')

        if self.results['total'] > 0 and (self.results['total'] - self.results['skipped']) > 0:
            success_rate = (self.results['passed'] / (self.results['total'] - self.results['skipped'])) * 100
            print(f'Success Rate: {success_rate:.1f}% (excluding skipped)')
        else:
            print('Success Rate: N/A')
        print('')

        if not self.config['test_private_methods']:
            print('💡 TIP: Set CONFIG["test_private_methods"] = True to test private methods')
            print('   (requires valid wallet_address and private_key)')
            print('')

        if self.config['test_private_methods'] and not self.config['test_order_placement']:
            print('💡 TIP: Set CONFIG["test_order_placement"] = True to test order creation')
            print('   ⚠️  WARNING: This uses real funds! Set safe test parameters first.')
            print('')

        print('═══════════════════════════════════════════════════════════════')

    # Main test runner
    def run(self):
        """Run all tests"""
        self.init()
        self.test_public_methods()
        self.test_private_methods()
        self.test_order_management()
        self.test_margin_and_leverage()
        self.print_summary()

        # Exit with error code if tests failed
        sys.exit(1 if self.results['failed'] > 0 else 0)


# ============================================================================
# RUN TESTS
# ============================================================================

if __name__ == '__main__':
    suite = AsterDEXTestSuite(CONFIG)
    try:
        suite.run()
    except Exception as e:
        print(f'Fatal error: {e}')
        import traceback
        traceback.print_exc()
        sys.exit(1)
