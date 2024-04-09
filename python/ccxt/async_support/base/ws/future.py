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
            try:
                exception = done.exception()
                if exception is None:
                    complete, _ = done.result()
                    # check for exceptions
                    exceptions = []
                    for f in complete:
                        if f.cancelled():
                            continue  # was canceled internally
                        err = f.exception()
                        if err:
                            exceptions.append(err)
                    # if any exceptions return with first exception
                    if len (exceptions) > 0:
                        future.reject(exceptions[0])
                        return future
                    # else return first result
                    else:
                        futures_list = list(complete)
                        are_all_canceled = all(f.cancelled() for f in futures_list)
                        if are_all_canceled:
                            future.reject(ExchangeClosedByUser('Connection closed by the user'))
                            return future

                        # handle wait_for scenario
                        if are_all_canceled and future.cancelled():
                            return future

                        first = futures_list[0]

                        first_result = first.result()
                        future.resolve(first_result)
                else:
                    future.reject(exception)
            except asyncio.CancelledError:
                return future
            except Exception as e:
                future.reject(e)
        task.add_done_callback(callback)
        return future
