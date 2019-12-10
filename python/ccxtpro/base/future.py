import asyncio


class Future(asyncio.Future):

    def resolve(self, result=None):
        self.set_result(result)

    def reject(self, error=None):
        self.set_exception(error)
