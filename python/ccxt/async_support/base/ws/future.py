import asyncio
from ccxt import ExchangeClosedByUser


class Future(asyncio.Future):

    is_race_future = False

    def resolve(self, result=None):
        if not self.done():
            self.set_result(result)

    def reject(self, error=None):
        if not self.done():
            self.set_exception(error)

    @classmethod
    def race(cls, futures):
        future = Future()
        for f in futures:
            f.is_race_future = True
        coro = asyncio.wait(futures, return_when=asyncio.FIRST_COMPLETED)
        task = asyncio.create_task(coro)

        def callback(done):
            exception = done.exception()
            if exception is None:
                complete, _ = done.result()
                # check for exceptions
                exceptions = []
                for f in complete:
                    if f._state == 'CANCELLED':
                        continue  # was canceled internally
                    err = f.exception()
                    if err:
                        exceptions.append(err)
                # if any exceptions return with first exception
                if len (exceptions) > 0:
                    future.set_exception(exceptions[0])
                    return
                # else return first result
                else:
                    futures_list = list(complete)
                    are_all_canceled = all(f._state == 'CANCELLED' for f in futures_list)
                    if are_all_canceled and future._state == 'PENDING':
                        future.set_exception(ExchangeClosedByUser('Connection closed by the user'))
                        return

                    # handle wait_for scenario
                    if are_all_canceled and future._state == 'CANCELLED':
                        return

                    first = futures_list[0]

                    first_result = first.result()
                    future.set_result(first_result)
            else:
                future.set_exception(exception)
        task.add_done_callback(callback)
        return future
