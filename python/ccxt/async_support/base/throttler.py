import asyncio
import collections
from time import time


class Throttler:
    def __init__(self, config, loop=None):
        self.loop = loop
        self.config = {
            'refillRate': 1.0,
            'delay': 0.001,
            'cost': 1.0,
            'tokens': 0,
            'maxLimiterRequests': 2000,
            'capacity': 1.0,
            'algorithm': 'leakyBucket',
            'rateLimit': 0,
            'windowSize': 60000.0,
            'maxWeight': 0
        }
        self.config.update(config)
        self.queue = collections.deque()
        self.running = False
        self.timestamps = []

    async def leaky_bucket_loop(self):
        last_timestamp = time() * 1000
        while self.running:
            future, cost = self.queue[0]
            cost = self.config['cost'] if cost is None else cost
            if self.config['tokens'] >= 0:
                self.config['tokens'] -= cost
                if not future.done():
                    future.set_result(None)
                self.queue.popleft()
                # context switch
                await asyncio.sleep(0)
                if len(self.queue) == 0:
                    self.running = False
            else:
                await asyncio.sleep(self.config['delay'])
                now = time() * 1000
                elapsed = now - last_timestamp
                last_timestamp = now
                self.config['tokens'] = min(self.config['tokens'] + elapsed * self.config['refillRate'], self.config['capacity'])

    async def rolling_window_loop(self):
        while self.running:
            future, cost = self.queue[0]
            cost = self.config['cost'] if cost is None else cost
            now = time() * 1000
            cutoffTime = now - self.config['windowSize']
            totalCost = 0
            # Remove expired timestamps & sum the remaining requests
            timestamps = []
            for t in self.timestamps:
                if t['timestamp'] > cutoffTime:
                    totalCost += t['cost']
                    timestamps.append(t)
            self.timestamps = timestamps
            # handle current request
            if totalCost + cost <= self.config['maxWeight']:
                self.timestamps.append({'timestamp': now, 'cost': cost})
                if not future.done():
                    future.set_result(None)
                self.queue.popleft()
                # context switch
                await asyncio.sleep(0)
                if not self.queue:
                    self.running = False
            else:
                wait_time = (self.timestamps[0]['timestamp'] + self.config['windowSize']) - now
                if wait_time > 0:
                    await asyncio.sleep(wait_time / 1000)

    async def looper(self):
        if self.config['algorithm'] == 'leakyBucket':
            await self.leaky_bucket_loop()
        else:
            await self.rolling_window_loop()

    def __call__(self, cost=None):
        future = asyncio.Future()
        if len(self.queue) > self.config['maxLimiterRequests']:
            raise RuntimeError('throttle queue is over maxLimiterRequests (' + str(int(self.config['maxLimiterRequests'])) + '), see https://github.com/ccxt/ccxt/issues/11645#issuecomment-1195695526')
        self.queue.append((future, cost))
        if not self.running:
            self.running = True
            asyncio.ensure_future(self.looper(), loop=self.loop)
        return future
