import asyncio


class Future(asyncio.Future):

    def resolve(self, result=None):
        if not self.done():
            self.set_result(result)

    def reject(self, error=None):
        if not self.done():
            self.set_exception(error)

    @classmethod
    def race(cls, futures):
        future = Future()
        coro = asyncio.wait(futures, return_when=asyncio.FIRST_COMPLETED)
        task = asyncio.create_task(coro)

        def callback(done):
            exception = done.exception()
            if exception is None:
                complete, _ = done.result()
                first_result = list(complete)[0].result()
                future.set_result(first_result)
            else:
                future.set_exception(exception)
        task.add_done_callback(callback)
        return future
