import asyncio

# Test by running:
# - python python/ccxt/pro/test/base/test_close.py
# - python python/ccxt/pro/test/base/test_future.py
class Future(asyncio.Future):

    def resolve(self, result=None):
        if not self.done():
            self.set_result(result)

    def reject(self, error=None):
        if not self.done():
            self.set_exception(error)

    @classmethod
    def race(cls, futures):
        """
        Return a Future that resolves/rejects with the first completed input future.

        IMPORTANT:
        - No asyncio.create_task(asyncio.wait(...)) => avoids massive Task churn.
        - We attach done callbacks and detach them immediately once a winner is chosen.
        """

        out = cls()

        if not futures:
            out.set_exception(Exception("Future.race() called with empty futures"))
            return out

        callbacks = {}  # future -> callback

        def detach_all():
            for f, cb in list(callbacks.items()):
                try:
                    f.remove_done_callback(cb)
                except Exception:
                    pass
            callbacks.clear()

        def settle_from(f):
            if out.done():
                detach_all()
                return
            try:
                if f.cancelled():
                    out.cancel()
                    return
                err = f.exception()
                if err is not None:
                    out.set_exception(err)
                else:
                    out.set_result(f.result())
            finally:
                detach_all()

        # Fast path: if any future is already done, settle immediately.
        for f in futures:
            if f.done():
                settle_from(f)
                return out

        # Attach callbacks to settle on first completion.
        for f in futures:
            def _cb(ff, _settle=settle_from):
                _settle(ff)
            callbacks[f] = _cb
            f.add_done_callback(_cb)

        # If the returned future is cancelled externally, detach callbacks.
        def _out_done(_):
            detach_all()
        out.add_done_callback(_out_done)

        return out
