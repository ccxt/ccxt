# -*- coding: utf-8 -*-

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402

print('CCXT Version:', ccxt.__version__)

def table(values):
    first = values[0]
    keys = list(first.keys()) if isinstance(first, dict) else range(0, len(first))
    widths = [max([len(str(v[k])) for v in values]) for k in keys]
    string = ' | '.join(['{:<' + str(w) + '}' for w in widths])
    return "\n".join([string.format(*[str(v[k]) for k in keys]) for v in values])


exchange = ccxt.ftx({
    'enableRateLimit': True,
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
})

start = exchange.parse8601('2020-11-01T00:00:00Z')  # timestamp in milliseconds
end = exchange.milliseconds()  # current timestamp in milliseconds

request = {
    # 'start_time': int(start / 1000),  # unix timestamp in seconds, optional
    # 'end_time': int(end / 1000),  # unix timestamp in seconds, optional
    # 'future': 'BTC-PERP',  # optional
}

response = exchange.private_get_funding_payments(request)
#
#     {
#         "success": true,
#         "result": [
#             {
#                 "future": "ETH-PERP",
#                 "id": 33830,
#                 "payment": 0.0441342,
#                 "time": "2019-05-15T18:00:00+00:00",
#                 "rate": 0.0001
#             }
#         ]
#     }
#

result = exchange.safe_value(response, 'result', [])
print(table(result))
