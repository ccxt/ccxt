# -*- coding: utf-8 -*-

import argparse
import os
import re
import sys
import json
import platform
from pprint import pprint
import asyncio

# ------------------------------------------------------------------------------

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

# ------------------------------------------------------------------------------
import ccxt.pro as ccxtpro
import ccxt.async_support as ccxt  # noqa: E402

# ------------------------------------------------------------------------------

print('Python v' + platform.python_version())
print('CCXT v' + ccxt.__version__)

# ------------------------------------------------------------------------------


class Argv(object):

    table = False
    verbose = False
    sandbox = False
    testnet = False
    test = False
    nonce = None
    exchange_id = ''
    debug = False
    cors = False
    method = None
    symbol = None
    spot = False
    swap = False
    future = False
    args = []


argv = Argv()

parser = argparse.ArgumentParser()

parser.add_argument('--table', action='store_true', help='output as table')
parser.add_argument('--cors', action='store_true', help='enable CORS proxy')
parser.add_argument('--verbose', action='store_true', help='enable verbose output')
parser.add_argument('--debug', action='store_true', help='enable debug output')
parser.add_argument('--sandbox', action='store_true', help='enable sandbox/testnet')
parser.add_argument('--testnet', action='store_true', help='enable sandbox/testnet')
parser.add_argument('--test', action='store_true', help='enable sandbox/testnet')
parser.add_argument('--spot', action='store_true', help='enable spot markets')
parser.add_argument('--swap', action='store_true', help='enable swap markets')
parser.add_argument('--future', action='store_true', help='enable future markets')
parser.add_argument('exchange_id', type=str, help='exchange id in lowercase', nargs='?')
parser.add_argument('method', type=str, help='method or property', nargs='?')
parser.add_argument('args', type=str, help='arguments', nargs='*')

parser.parse_args(namespace=argv)

# ------------------------------------------------------------------------------


def table(values):
    first = values[0]
    keys = list(first.keys()) if isinstance(first, dict) else range(0, len(first))
    widths = [max([len(str(v[k])) for v in values]) for k in keys]
    string = ' | '.join(['{:<' + str(w) + '}' for w in widths])
    return "\n".join([string.format(*[str(v[k]) for k in keys]) for v in values])


# ------------------------------------------------------------------------------


def print_supported_exchanges():
    print('Supported exchanges: ' + ', '.join(ccxt.exchanges) + '\n')


# ------------------------------------------------------------------------------

def print_usage():
    print('\nThis is an example of a basic command-line interface to all exchanges\n')
    print('Usage:\n')
    print('python ' + sys.argv[0] + ' exchange_id method "param1" param2 "param3" param4 ...\n')
    print('Examples:\n')
    print('python ' + sys.argv[0] + ' okcoin fetch_ohlcv BTC/USD 15m')
    print('python ' + sys.argv[0] + ' bitfinex fetch_balance')
    print('python ' + sys.argv[0] + ' kraken fetch_order_book ETH/BTC\n')
    print_supported_exchanges()


# ------------------------------------------------------------------------------

async def main():
    # prefer local testing keys to global keys
    keys_global = root + '/keys.json'
    keys_local = root + '/keys.local.json'
    keys_file = keys_local if os.path.exists(keys_local) else keys_global

    # load the api keys and other settings from a JSON config
    with open(keys_file) as file:
        keys = json.load(file)

    config = {
        # 'verbose': argv.verbose,  # set later, after load_markets
        'timeout': 30000,
    }

    if not argv.exchange_id:
        print_usage()
        sys.exit()

    # ------------------------------------------------------------------------------

    if argv.exchange_id not in ccxt.exchanges:
        print_usage()
        raise Exception('Exchange "' + argv.exchange_id + '" not found.')

    if argv.exchange_id in keys:
        config.update(keys[argv.exchange_id])

    exchange = None
    if (argv.exchange_id in ccxtpro.exchanges):
        exchange = getattr(ccxtpro, argv.exchange_id)(config)
    else:
        exchange = getattr(ccxt, argv.exchange_id)(config)

    if argv.spot:
        exchange.options['defaultType'] = 'spot'
    elif argv.swap:
        exchange.options['defaultType'] = 'swap'
    elif argv.future:
        exchange.options['defaultType'] = 'future'

    # check auth keys in env var
    requiredCredentials = exchange.requiredCredentials
    for credential, isRequired in requiredCredentials.items():
        if isRequired and credential and not getattr(exchange, credential, None):
            credentialEnvName = (argv.exchange_id + '_' + credential).upper()  # example: KRAKEN_APIKEY
            if credentialEnvName in os.environ:
                credentialValue = os.environ[credentialEnvName]
                setattr(exchange, credential, credentialValue)

    if argv.cors:
        exchange.proxy = 'https://cors-anywhere.herokuapp.com/'
        exchange.origin = exchange.uuid()

    # pprint(dir(exchange))

    # ------------------------------------------------------------------------------

    args = []

    for arg in argv.args:

        # unpack json objects (mostly for extra params)
        if arg[0] == '{' or arg[0] == '[':
            args.append(json.loads(arg))
        elif arg == 'None':
            args.append(None)
        elif re.match(r'^[0-9+-]+$', arg):
            args.append(int(arg))
        elif re.match(r'^[.eE0-9+-]+$', arg):
            args.append(float(arg))
        elif re.match(r'^[0-9]{4}[-]?[0-9]{2}[-]?[0-9]{2}[T\s]?[0-9]{2}[:]?[0-9]{2}[:]?[0-9]{2}', arg):
            args.append(exchange.parse8601(arg))
        else:
            args.append(arg)

    if argv.testnet or argv.sandbox or argv.test:
        exchange.set_sandbox_mode(True)

    if argv.verbose and argv.debug:
        exchange.verbose = argv.verbose

    markets_path = '.cache/' + exchange.id + '-markets.json'
    if os.path.exists(markets_path):
        with open(markets_path, 'r') as f:
            exchange.markets = json.load(f)
    else:
        await exchange.load_markets()

    exchange.verbose = argv.verbose  # now set verbose mode

    is_ws_method = False

    if argv.method:
        method = getattr(exchange, argv.method)
        # if it is a method, call it
        if callable(method):
            if argv.method.startswith('watch'):
                is_ws_method = True # handle ws methods
            print(f"{argv.exchange_id}.{argv.method}({','.join(map(str, args))})")
            while True:
                result = await method(*args)
                if argv.table:
                    result = list(result.values()) if isinstance(result, dict) else result
                    print(table([exchange.omit(v, 'info') for v in result]))
                else:
                    pprint(result)
                if not is_ws_method:
                    await exchange.close()
                    return
        else:  # otherwise it's a property, print it
            result = method
        if argv.table:
            result = list(result.values()) if isinstance(result, dict) else result
            print(table([exchange.omit(v, 'info') for v in result]))
        else:
            pprint(result)
    else:
        pprint(dir(exchange))


if __name__ ==  '__main__':
    asyncio.run(main())