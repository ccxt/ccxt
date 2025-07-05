import asyncio
from typing import List, Dict, Any, Optional
from collections import deque
from ....base.types import Message, ConsumerFunction
from ....base.errors import ConsumerFunctionError
import logging

logger = logging.getLogger(__name__)

class Consumer:
    MAX_BACKLOG_SIZE = 10  # Maximum number of messages in backlog - higher number means less messages are dropped but can cause higher latency

    def __init__(self, fn: ConsumerFunction, current_index: int = 0, options: Optional[Dict[str, Any]] = None):
        if options is None:
            options = {}
        self.fn = fn
        self.synchronous = options.get('synchronous', False)
        self.current_index = current_index
        self.running = False
        self.backlog: deque[Message] = deque()
        self.tasks: List[asyncio.Task] = []

    def publish(self, message: Message) -> None:
        if len(self.backlog) >= self.MAX_BACKLOG_SIZE:
            # logger.warning(f"WebSocket consumer backlog is at maximum size ({self.MAX_BACKLOG_SIZE} messages). Replacing oldest message with newest to prioritize recent messages.")
            # Remove the oldest message (first in the deque) and add the new one
            self.backlog.popleft()
        self.backlog.append(message)
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

