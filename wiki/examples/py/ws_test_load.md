- [Ws_test_load](./examples/py/)


 ```python
 import asyncio
import os
import sys
import psutil
import time
from collections import defaultdict
from datetime import datetime

import ccxt.pro as ccxt

class PerformanceMetrics:
    def __init__(self):
        self.message_count = defaultdict(int)
        self.error_count = defaultdict(int)
        self.start_time = time.time()
        self.process = psutil.Process()
        self.last_print_time = time.time()
        self.print_interval = 5  # Print metrics every 5 seconds

    def increment_message_count(self, symbol):
        self.message_count[symbol] += 1

    def increment_error_count(self, symbol):
        self.error_count[symbol] += 1

    def get_metrics(self):
        current_time = time.time()
        elapsed = current_time - self.start_time
        
        # Calculate messages per second
        total_messages = sum(self.message_count.values())
        total_errors = sum(self.error_count.values())
        messages_per_second = total_messages / elapsed if elapsed > 0 else 0
        
        # Get system metrics
        memory_info = self.process.memory_info()
        cpu_percent = self.process.cpu_percent()
        
        return {
            'elapsed_time': elapsed,
            'total_messages': total_messages,
            'total_errors': total_errors,
            'messages_per_second': messages_per_second,
            'memory_usage_mb': memory_info.rss / (1024 * 1024),  # Convert to MB
            'cpu_percent': cpu_percent,
            'symbols_subscribed': len(self.message_count)
        }

    def should_print_metrics(self):
        current_time = time.time()
        if current_time - self.last_print_time >= self.print_interval:
            self.last_print_time = current_time
            return True
        return False

async def watch_orderbook(binance, symbol, metrics):
    while True:
        try:
            await binance.watch_order_book(symbol)
            metrics.increment_message_count(symbol)
            
            if metrics.should_print_metrics():
                current_metrics = metrics.get_metrics()
                print(f"\nPerformance Metrics at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}:")
                print(f"Symbols subscribed: {current_metrics['symbols_subscribed']}")
                print(f"Messages per second: {current_metrics['messages_per_second']:.2f}")
                print(f"Total messages: {current_metrics['total_messages']}")
                print(f"Total errors: {current_metrics['total_errors']}")
                print(f"Memory usage: {current_metrics['memory_usage_mb']:.2f} MB")
                print(f"CPU usage: {current_metrics['cpu_percent']:.1f}%")
                print(f"Elapsed time: {current_metrics['elapsed_time']:.1f} seconds")
                print("-" * 50)
        except Exception as e:
            print(f"Error in {symbol}: {str(e)}")
            metrics.increment_error_count(symbol)
            await asyncio.sleep(1)  # Wait before retrying

async def main():
    binance = ccxt.binance({})
    await binance.load_markets()
    symbols = binance.symbols
    metrics = PerformanceMetrics()
    
    print(f"Starting to monitor {len(symbols)} symbols...")
    
    tasks = []
    for symbol in symbols[:500]:
        await asyncio.sleep(0.1)
        task = asyncio.create_task(watch_orderbook(binance, symbol, metrics))
        tasks.append(task)
    

    await asyncio.gather(*tasks)

if __name__ == '__main__':
    asyncio.run(main())

# Results Using asyncio 3.12^
# Performance Metrics at 2025-05-18 20:24:04:
# Symbols subscribed: 100
# Messages per second: 358.01
# Total messages: 174240
# Memory usage: 73.94 MB
# CPU usage: 6.6%
# Elapsed time: 486.7 seconds

# Results using current version using asyncio 3.10
# Performance Metrics at 2025-05-18 20:41:31:
# Symbols subscribed: 100
# Messages per second: 297.41
# Total messages: 119353
# Memory usage: 79.78 MB
# CPU usage: 7.5%
# Elapsed time: 401.3 seconds
 
```