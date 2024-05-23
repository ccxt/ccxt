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
                complete, pending = done.result()
                # check for exceptions
                for i, f in enumerate(complete):
                    try:
                        f.result()
                    except ExchangeClosedByUser as e:
                        if len(pending) == 0 and i == len(complete) - 1:
                            future.reject(e)
                        # wait for all the sub promises to be reject before rejecting future
                        continue
                    except asyncio.CancelledError as e:
                        continue
                    except Exception as e:
                        future.reject(e)
                        return
                # no exceptions return first result
                futures_list = list(complete)

                are_all_canceled = all([f.cancelled() for f in futures_list])
                if are_all_canceled:
                    future.reject(ExchangeClosedByUser('Connection closed by the user'))
                    return

                first = futures_list[0]

                first_result = first.result()
                future.resolve(first_result)
            except asyncio.CancelledError as e:
                future.reject(e)
            except Exception as e:
                future.reject(e)
        task.add_done_callback(callback)
        return future
