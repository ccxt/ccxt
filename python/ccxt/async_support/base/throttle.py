# -*- coding: utf-8 -*-

from asyncio import Future
from time import time
import collections

__all__ = [
    'throttle',
]


def throttle(config, loop):
    # {
    #    delay:       1,
    #    capacity:    1,
    #    defaultCost: 1,
    #    maxCapacity: 1000,
    # }
    last_timestamp = int(time() * 1000)
    running = False
    queue = collections.deque()
    tokens = config['capacity']

    def resolver(rate_limit):
        nonlocal running
        nonlocal tokens
        nonlocal last_timestamp
        if queue and not running:
            running = True
            cost = queue[0][0]
            if tokens >= min(cost, config['capacity']):
                cost, resolve = queue.popleft()
                tokens -= cost
                resolve()
            now = time() * 1000
            elapsed = now - last_timestamp
            last_timestamp = now
            tokens = min(config['capacity'], tokens + elapsed / rate_limit)

            loop.call_later(config['delay'], callback, rate_limit)

    def callback(rate_limit):
        nonlocal running
        running = False
        resolver(rate_limit)

    def inner(rate_limit, cost=None):
        if len(queue) > config['maxCapacity']:
            raise RuntimeError('Backlog is over max capacity of ' + config['maxCapacity'])

        future = Future()
        cost = cost if cost else config['defaultCost']
        queue.append([cost, lambda: future.set_result(True)])
        resolver(rate_limit)
        return future

    return inner
