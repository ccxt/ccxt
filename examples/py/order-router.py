# -*- coding: utf-8 -*-

# OrderRouter — ask the router how to convert one asset into another.
#
# The router holds live L2 books from many venues and answers "what is the
# cheapest way to turn X into Y right now, and on which venues" — book-walked
# to your actual size, fee-adjusted, and split across venues when that beats
# any single one.
#
# This example is READ-ONLY: it asks for a recommendation and prints it. It
# never places an order. Execution lives behind router.execute(plan, venues),
# which defaults to dry_run and refuses to trade unless explicitly told to.
#
# Usage:
#   ORDER_ROUTER_API_KEY=or_live_... python examples/py/order-router.py
#
# Get a key from https://docs.ccxt.com/router

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402


def main():
    api_key = os.environ.get('ORDER_ROUTER_API_KEY')
    if not api_key:
        print('set ORDER_ROUTER_API_KEY (get one at https://docs.ccxt.com/router)')
        return

    router = ccxt.OrderRouter({
        'apiKey': api_key,
        # 'baseUrl': 'https://docs.ccxt.com/router/api',  # the default
    })

    # Exactly one of amountIn or amountOut — never both, and never neither.
    # They are different book traversals, not a unit conversion: amountIn walks
    # until the money runs out, amountOut walks until the size is reached.
    route = router.fetch_route('USDT', 'BTC', {
        'amountIn': 20,
        'strategy': 'split_optimal',
    })

    # An unroutable pair comes back as a result with a reason, NOT an exception.
    # Refusing to quote is a deliberate outcome, not an error.
    if route.get('unroutableReason'):
        print('unroutable:', route['unroutableReason'])
        return

    print(route['amountIn'], route['from'], '->', route['amountOut'], route['to'])
    print('effective rate  ', route['effectiveRate'])
    print('price impact    ', route['impactBps'], 'bps')  # positive is worse
    print('fill ratio      ', route['fillRatio'])

    # One hop is a direct conversion; more than one means it was bridged
    # (e.g. SOL -> USDT -> BTC), and each hop is a separate order.
    for i, hop in enumerate(route['hops']):
        print('hop', i + 1, hop['pair'], hop['side'], '-', len(hop['legs']), 'venue(s)')
        for leg in hop['legs']:
            print('   ', leg['exchangeId'], leg['amount'], '@', leg['effectivePrice'])


if __name__ == '__main__':
    main()
