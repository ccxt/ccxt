import asyncio


class Future:
    def __init__(self):
        self._future = asyncio.Future()

    def resolve(self, result):
        self._future.set_result(result)

    def reject(self, error):
        self._future.set_exception(error)

    def promise(self):
        return self._future
