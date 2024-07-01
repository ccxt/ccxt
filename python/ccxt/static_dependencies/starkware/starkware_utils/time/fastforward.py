import asyncio
from selectors import DefaultSelector
from typing import Optional


class FFSelector(DefaultSelector):
    def __init__(self, start_time: float):
        super().__init__()
        self._current_time = start_time

    def select(self, timeout: Optional[float] = None):
        # There are tasks to be scheduled. Continue simulating.
        if timeout is None:
            # If timeout is infinity, just wait without increasing _current_time.
            return DefaultSelector.select(self, timeout)
        self._current_time += timeout
        return DefaultSelector.select(self, 0)


class FFEventLoop(asyncio.SelectorEventLoop):
    # SelectorEventLoop is platform-dependent; on unix systems the _selector field exists. To make
    # mypy happy, also define a class variable (overridden by instance variable in supertype
    # constructor) with the type annotation.
    # See https://docs.python.org/3.6/library/asyncio-eventloops.html#asyncio.SelectorEventLoop for
    # details.
    _selector: FFSelector

    def __init__(self, start_time: float = 0):
        super().__init__(selector=FFSelector(start_time=start_time))

    def time(self) -> float:
        return self._selector._current_time
