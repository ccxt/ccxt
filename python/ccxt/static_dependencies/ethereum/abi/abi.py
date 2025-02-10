from .codec import (
    ABICodec,
)
from .registry import (
    registry,
)

default_codec = ABICodec(registry)

encode = default_codec.encode
encode_abi = default_codec.encode_abi  # deprecated
encode_single = default_codec.encode_single  # deprecated

decode = default_codec.decode
decode_abi = default_codec.decode_abi  # deprecated
decode_single = default_codec.decode_single  # deprecated

is_encodable = default_codec.is_encodable
is_encodable_type = default_codec.is_encodable_type
