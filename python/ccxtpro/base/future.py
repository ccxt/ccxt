import asyncio


class Future(asyncio.Future):

    def resolve(self, result=None):
        if not self.done():
            self.set_result(result)
            # ignore future was not awaited errors
            self.cancel()

    def reject(self, error=None):
        if not self.done():
            self.set_exception(error)
            self.cancel()
