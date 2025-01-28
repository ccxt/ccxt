import asyncio
from typing import List
from ....base.types import Message, ConsumerFunction

class Consumer:
    def __init__(self, fn: ConsumerFunction, synchronous: bool, current_index: int):
        self.fn = fn
        self.synchronous = synchronous
        self.current_index = current_index
        self.running = False
        self.backlog: List[Message] = []
        self.tasks: List[asyncio.Task] = []

    def publish(self, message: Message) -> None:
        self.backlog.append(message)
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
        if self.synchronous and asyncio.iscoroutinefunction(self.fn):
            await self.fn(message)
        elif asyncio.iscoroutinefunction(self.fn):
            task = asyncio.create_task(self.fn(message))
            self.tasks.append(task)
            def task_done_callback(task: asyncio.Task) -> None:
                self.tasks.remove(task)
            task.add_done_callback(task_done_callback)
        else:
            self.fn(message)

    async def close (self) -> None:
        self.running = False
        for task in self.tasks:
            task.cancel()
        await asyncio.gather(*self.tasks, return_exceptions=True)

