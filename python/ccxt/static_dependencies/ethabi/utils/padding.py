from eth_utils.toolz import (
    curry,
)


@curry
def zpad(value: bytes, length: int) -> bytes:
    return value.rjust(length, b"\x00")


zpad32 = zpad(length=32)


@curry
def zpad_right(value: bytes, length: int) -> bytes:
    return value.ljust(length, b"\x00")


zpad32_right = zpad_right(length=32)


@curry
def fpad(value: bytes, length: int) -> bytes:
    return value.rjust(length, b"\xff")


fpad32 = fpad(length=32)
