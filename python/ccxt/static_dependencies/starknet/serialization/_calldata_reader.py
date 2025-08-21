from typing import List

from ..cairo.felt import CairoData


class OutOfBoundsError(Exception):
    def __init__(self, position: int, requested_size: int, remaining_size: int):
        super().__init__(
            f"Requested {requested_size} elements, {remaining_size} available."
        )
        self.position = position
        self.requested_size = requested_size
        self.remaining_len = remaining_size


class CalldataReader:
    _data: List[int]
    _position: int

    def __init__(self, data: List[int]):
        self._data = data
        self._position = 0

    @property
    def remaining_len(self) -> int:
        return len(self._data) - self._position

    def read(self, size: int) -> CairoData:
        if size < 1:
            raise ValueError("size must be greater than 0")

        if size > self.remaining_len:
            raise OutOfBoundsError(
                position=self._position,
                requested_size=size,
                remaining_size=self.remaining_len,
            )
        data = self._data[self._position : self._position + size]
        self._position += size
        return data
