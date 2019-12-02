import asyncio


class Future(asyncio.Future):

    def resolve(self, result):
        self.set_result(result)

    def reject(self, error):
        self.set_exception(error)
