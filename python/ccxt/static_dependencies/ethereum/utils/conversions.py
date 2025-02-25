from typing import (
    Callable,
    Optional,
    TypeVar,
    Union,
    cast,
)

from ..typing import (
    HexStr,
    Primitives,
)

from .decorators import (
    validate_conversion_arguments,
)
from .encoding import (
    big_endian_to_int,
    int_to_big_endian,
)
from .hexadecimal import (
    add_0x_prefix,
    decode_hex,
    encode_hex,
    is_hexstr,
    remove_0x_prefix,
)
from .types import (
    is_boolean,
    is_integer,
    is_string,
)

T = TypeVar("T")


@validate_conversion_arguments
def to_hex(
    primitive: Optional[Primitives] = None,
    hexstr: Optional[HexStr] = None,
    text: Optional[str] = None,
) -> HexStr:
    """
    Auto converts any supported value into its hex representation.
    Trims leading zeros, as defined in:
    https://github.com/ethereum/wiki/wiki/JSON-RPC#hex-value-encoding
    """
    if hexstr is not None:
        return add_0x_prefix(HexStr(hexstr.lower()))

    if text is not None:
        return encode_hex(text.encode("utf-8"))

    if is_boolean(primitive):
        return HexStr("0x1") if primitive else HexStr("0x0")

    if isinstance(primitive, (bytes, bytearray)):
        return encode_hex(primitive)
    elif is_string(primitive):
        raise TypeError(
            "Unsupported type: The primitive argument must be one of: bytes,"
            "bytearray, int or bool and not str"
        )

    if is_integer(primitive):
        return HexStr(hex(cast(int, primitive)))

    raise TypeError(
        f"Unsupported type: '{repr(type(primitive))}'. Must be one of: bool, str, "
        "bytes, bytearray or int."
    )


@validate_conversion_arguments
def to_int(
    primitive: Optional[Primitives] = None,
    hexstr: Optional[HexStr] = None,
    text: Optional[str] = None,
) -> int:
    """
    Converts value to its integer representation.
    Values are converted this way:

     * primitive:

       * bytes, bytearrays: big-endian integer
       * bool: True => 1, False => 0
     * hexstr: interpret hex as integer
     * text: interpret as string of digits, like '12' => 12
    """
    if hexstr is not None:
        return int(hexstr, 16)
    elif text is not None:
        return int(text)
    elif isinstance(primitive, (bytes, bytearray)):
        return big_endian_to_int(primitive)
    elif isinstance(primitive, str):
        raise TypeError("Pass in strings with keyword hexstr or text")
    elif isinstance(primitive, (int, bool)):
        return int(primitive)
    else:
        raise TypeError(
            "Invalid type. Expected one of int/bool/str/bytes/bytearray. Got "
            f"{type(primitive)}"
        )


@validate_conversion_arguments
def to_bytes(
    primitive: Optional[Primitives] = None,
    hexstr: Optional[HexStr] = None,
    text: Optional[str] = None,
) -> bytes:
    if is_boolean(primitive):
        return b"\x01" if primitive else b"\x00"
    elif isinstance(primitive, bytearray):
        return bytes(primitive)
    elif isinstance(primitive, bytes):
        return primitive
    elif is_integer(primitive):
        return to_bytes(hexstr=to_hex(primitive))
    elif hexstr is not None:
        if len(hexstr) % 2:
            hexstr = cast(HexStr, "0x0" + remove_0x_prefix(hexstr))
        return decode_hex(hexstr)
    elif text is not None:
        return text.encode("utf-8")
    raise TypeError(
        "expected a bool, int, byte or bytearray in first arg, "
        "or keyword of hexstr or text"
    )


@validate_conversion_arguments
def to_text(
    primitive: Optional[Primitives] = None,
    hexstr: Optional[HexStr] = None,
    text: Optional[str] = None,
) -> str:
    if hexstr is not None:
        return to_bytes(hexstr=hexstr).decode("utf-8")
    elif text is not None:
        return text
    elif isinstance(primitive, str):
        return to_text(hexstr=primitive)
    elif isinstance(primitive, (bytes, bytearray)):
        return primitive.decode("utf-8")
    elif is_integer(primitive):
        byte_encoding = int_to_big_endian(cast(int, primitive))
        return to_text(byte_encoding)
    raise TypeError("Expected an int, bytes, bytearray or hexstr.")


def text_if_str(
    to_type: Callable[..., T], text_or_primitive: Union[bytes, int, str]
) -> T:
    """
    Convert to a type, assuming that strings can be only unicode text (not a hexstr).

    :param to_type function: takes the arguments (primitive, hexstr=hexstr, text=text),
        eg~ to_bytes, to_text, to_hex, to_int, etc
    :param text_or_primitive bytes, str, int: value to convert
    """
    if isinstance(text_or_primitive, str):
        return to_type(text=text_or_primitive)
    else:
        return to_type(text_or_primitive)


def hexstr_if_str(
    to_type: Callable[..., T], hexstr_or_primitive: Union[bytes, int, str]
) -> T:
    """
    Convert to a type, assuming that strings can be only hexstr (not unicode text).

    :param to_type function: takes the arguments (primitive, hexstr=hexstr, text=text),
        eg~ to_bytes, to_text, to_hex, to_int, etc
    :param hexstr_or_primitive bytes, str, int: value to convert
    """
    if isinstance(hexstr_or_primitive, str):
        if remove_0x_prefix(HexStr(hexstr_or_primitive)) and not is_hexstr(
            hexstr_or_primitive
        ):
            raise ValueError(
                "when sending a str, it must be a hex string. "
                f"Got: {repr(hexstr_or_primitive)}"
            )
        return to_type(hexstr=hexstr_or_primitive)
    else:
        return to_type(hexstr_or_primitive)
