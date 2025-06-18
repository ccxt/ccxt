import asyncio
from typing import List
from ....base.types import Message, ConsumerFunction
from ....base.errors import ConsumerFunctionError
import logging

logger = logging.getLogger(__name__)

class Consumer:
    MAX_BACKLOG_SIZE = 100  # Maximum number of messages in backlog

    def __init__(self, fn: ConsumerFunction, synchronous: bool, current_index: int):
        self.fn = fn
        self.synchronous = synchronous
        self.current_index = current_index
        self.running = False
        self.backlog: List[Message] = []
        self.tasks: List[asyncio.Task] = []

    def publish(self, message: Message) -> None:
        self.backlog.append(message)
        if len(self.backlog) > self.MAX_BACKLOG_SIZE:
            logger.warning(f"WebSocket consumer backlog is too large ({len(self.backlog)} messages). This might indicate a performance issue or message processing bottleneck.")
        asyncio.ensure_future(self._run())

    async def _run(self) -> None:
        if self.running:
            return
        self.running = True
        while len(self.backlog) > 0:
            message = self.backlog.pop(0)
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

