import asyncio
import psutil
import time
import logging
import sys
from prometheus_client import start_http_server
from metrics import process_cpu_usage, process_memory_usage

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    force=True
)
logger = logging.getLogger(__name__)

async def monitor_system():
    try:
        process = psutil.Process()
        while True:
            cpu = process.cpu_percent()
            mem = process.memory_info().rss
            process_cpu_usage.labels(language='Python').set(cpu)
            process_memory_usage.labels(language='Python').set(mem)
            logger.info(f"System metrics - CPU: {cpu}%, Memory: {mem/1024/1024:.1f}MB")
            await asyncio.sleep(1)
    except Exception as e:
        logger.error(f"System monitoring error: {e}", exc_info=True)

async def main():
    try:
        logger.info("Starting application...")
        start_http_server(3000)
        logger.info('Metrics server running on port 3000')
        
        # Start system monitoring as a background task
        asyncio.create_task(monitor_system())
        
        from benchmark import start_benchmarks
        await start_benchmarks()
    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)
        sys.exit(1)

if __name__ == '__main__':
    asyncio.run(main())
