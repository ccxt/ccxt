from .codec import (
    ABIEncoder,
)
from .registry import (
    registry_packed,
)

default_encoder_packed = ABIEncoder(registry_packed)

encode_packed = default_encoder_packed.encode
is_encodable_packed = default_encoder_packed.is_encodable
encode_single_packed = default_encoder_packed.encode_single  # deprecated
encode_abi_packed = default_encoder_packed.encode_abi  # deprecated
