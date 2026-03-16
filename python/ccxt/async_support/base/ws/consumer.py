import asyncio
from typing import List, Dict, Any
from collections import deque
from ....base.types import Message, ConsumerFunction
from ....base.errors import ConsumerFunctionError
import logging

logger = logging.getLogger(__name__)

class Consumer:
    DEFAULT_MAX_BACKLOG_SIZE = 1000  # Default maximum number of messages in backlog - higher number means less messages are dropped but can cause higher latency

    def __init__(self, fn: ConsumerFunction, current_index: int = 0, options: Dict[str, Any] = None):
        if options is None:
            options = {}
        self.fn = fn
        self.synchronous = options.get('synchronous', True)
        self.current_index = current_index
        self.running = False
        self.max_backlog_size = options.get('maxBacklogSize') or Consumer.DEFAULT_MAX_BACKLOG_SIZE
        self.backlog: deque[Message] = deque()
        self.tasks: List[asyncio.Task] = []

    def publish(self, message: Message) -> None:
        self.backlog.append(message)
        if len(self.backlog) > self.max_backlog_size:
            logger.warning(f"WebSocket consumer backlog is too large ({len(self.backlog)} messages). This might indicate a performance issue or message processing bottleneck. Dropping oldest message.")
            self.backlog.popleft()
        if self.running:
            return
        asyncio.ensure_future(self._run())

    async def _run(self) -> None:
        if self.running:
            return
        self.running = True
        while len(self.backlog) > 0:
            message = self.backlog.popleft()
            await self._handle_message(message)
        self.running = False

    async def _handle_message(self, message: Message):
        if message.metadata.index <= self.current_index:
            return
        self.current_index = message.metadata.index

        async def handle_fn(msg):
            try:
                if asyncio.iscoroutinefunction(self.fn):
                    await self.fn(msg)
                else:
                    self.fn(msg)
            except Exception as e:
                error = ConsumerFunctionError(str(e))
                msg.metadata.stream.produce('errors', msg, error=error)

        if self.synchronous:
            await handle_fn(message)
        else:
            task = asyncio.create_task(handle_fn(message))
            self.tasks.append(task)
            def task_done_callback(task: asyncio.Task) -> None:
                self.tasks.remove(task)
            task.add_done_callback(task_done_callback)

    async def close (self) -> None:
        self.running = False
        for task in self.tasks:
            task.cancel()
        await asyncio.gather(*self.tasks, return_exceptions=True)

