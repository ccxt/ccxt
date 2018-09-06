# -*- coding: utf-8 -*-

from asyncio import Queue, sleep, Future, ensure_future, get_event_loop
from time import time

__all__ = [
    'throttle',
]


def throttle(config=None):

    cfg = {
        'lastTimestamp': time(),
        'numTokens': 0,
        'running': False,
        'queue': Queue(),
        'loop': get_event_loop(),
        'delay': 0.001,
        'refillRate': 0.001,
        'defaultCost': 1.000,
        'capacity': 1.000,
    }

    cfg.update(config)

    async def run():
        if not cfg['running']:
            cfg['running'] = True
            while not cfg['queue'].empty():
                now = time()
                elapsed = (now - cfg['lastTimestamp'])
                cfg['lastTimestamp'] = now
                cfg['numTokens'] = min(cfg['capacity'], cfg['numTokens'] + elapsed * cfg['refillRate'] * 1000)
                if cfg['numTokens'] > 0:
                    if not cfg['queue'].empty():
                        cost, future = cfg['queue'].get_nowait()
                        cfg['numTokens'] -= (cost if cost else cfg['defaultCost'])
                        if not future.done():
                            future.set_result(None)
                await sleep(cfg['delay'])
            cfg['running'] = False

    def throttle(cost=None):
        future = Future()
        cfg['queue'].put_nowait((cost, future))
        ensure_future(run())
        return future

    return throttle
