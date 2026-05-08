from collections.abc import (
    Mapping,
)
from typing import (
    Any,
    Dict,
    NamedTuple,
)
import warnings

from ..typing import (
    Address,
)
from ..utils.curried import (
    ValidationError,
)
from ..hexbytes import (
    HexBytes,
)

from .encode_typed_data.encoding_and_hashing import (
    hash_domain,
    hash_eip712_message,
)

# watch for updates to signature format
class SignableMessage(NamedTuple):
    """
    A message compatible with EIP-191_ that is ready to be signed.

    The properties are components of an EIP-191_ signable message. Other message formats
    can be encoded into this format for easy signing. This data structure doesn't need
    to know about the original message format. For example, you can think of
    EIP-712 as compiling down to an EIP-191 message.

    In typical usage, you should never need to create these by hand. Instead, use
    one of the available encode_* methods in this module, like:

        - :meth:`encode_typed_data`

    .. _EIP-191: https://eips.ethereum.org/EIPS/eip-191
    """

    version: bytes  # must be length 1
    header: bytes  # aka "version specific data"
    body: bytes  # aka "data to sign"

def encode_typed_data(
    domain_data: Dict[str, Any] = None,
    message_types: Dict[str, Any] = None,
    message_data: Dict[str, Any] = None,
    full_message: Dict[str, Any] = None,
) -> SignableMessage:
    r"""
    Encode an EIP-712_ message in a manner compatible with other implementations
    in use, such as the Metamask and Ethers ``signTypedData`` functions.

    See the `EIP-712 spec <https://eips.ethereum.org/EIPS/eip-712>`_ for more information.

    You may supply the information to be encoded in one of two ways:

    As exactly three arguments:

        - ``domain_data``, a dict of the EIP-712 domain data
        - ``message_types``, a dict of custom types (do not include a ``EIP712Domain``
          key)
        - ``message_data``, a dict of the data to be signed

    Or as a single argument:

        - ``full_message``, a dict containing the following keys:
            - ``types``, a dict of custom types (may include a ``EIP712Domain`` key)
            - ``primaryType``, (optional) a string of the primary type of the message
            - ``domain``, a dict of the EIP-712 domain data
            - ``message``, a dict of the data to be signed

    .. WARNING:: Note that this code has not gone through an external audit, and
        the test cases are incomplete.

    Type Coercion:
        - For fixed-size bytes types, smaller values will be padded to fit in larger
          types, but values larger than the type will raise ``ValueOutOfBounds``.
          e.g., an 8-byte value will be padded to fit a ``bytes16`` type, but 16-byte
          value provided for a ``bytes8`` type will raise an error.
        - Fixed-size and dynamic ``bytes`` types will accept ``int``s. Any negative
          values will be converted to ``0`` before being converted to ``bytes``
        - ``int`` and ``uint`` types will also accept strings. If prefixed with ``"0x"``
          , the string will be interpreted as hex. Otherwise, it will be interpreted as
          decimal.

    Noteable differences from ``signTypedData``:
        - Custom types that are not alphanumeric will encode differently.
        - Custom types that are used but not defined in ``types`` will not encode.

    :param domain_data: EIP712 domain data
    :param message_types: custom types used by the `value` data
    :param message_data: data to be signed
    :param full_message: a dict containing all data and types
    :returns: a ``SignableMessage``, an encoded message ready to be signed


    .. doctest:: python

        >>> # examples of basic usage
        >>> from eth_account import Account
        >>> from .messages import encode_typed_data
        >>> # 3-argument usage

        >>> # all domain properties are optional
        >>> domain_data = {
        ...     "name": "Ether Mail",
        ...     "version": "1",
        ...     "chainId": 1,
        ...     "verifyingContract": "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
        ...     "salt": b"decafbeef",
        ... }
        >>> # custom types
        >>> message_types = {
        ...     "Person": [
        ...         {"name": "name", "type": "string"},
        ...         {"name": "wallet", "type": "address"},
        ...     ],
        ...     "Mail": [
        ...         {"name": "from", "type": "Person"},
        ...         {"name": "to", "type": "Person"},
        ...         {"name": "contents", "type": "string"},
        ...     ],
        ... }
        >>> # the data to be signed
        >>> message_data = {
        ...     "from": {
        ...         "name": "Cow",
        ...         "wallet": "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
        ...     },
        ...     "to": {
        ...         "name": "Bob",
        ...         "wallet": "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
        ...     },
        ...     "contents": "Hello, Bob!",
        ... }
        >>> key = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        >>> signable_message = encode_typed_data(domain_data, message_types, message_data)
        >>> signed_message = Account.sign_message(signable_message, key)
        >>> signed_message.messageHash
        HexBytes('0xc5bb16ccc59ae9a3ad1cb8343d4e3351f057c994a97656e1aff8c134e56f7530')
        >>> # the message can be signed in one step using Account.sign_typed_data
        >>> signed_typed_data = Account.sign_typed_data(key, domain_data, message_types, message_data)
        >>> signed_typed_data == signed_message
        True

        >>> # 1-argument usage

        >>> # all domain properties are optional
        >>> full_message = {
        ...     "types": {
        ...         "EIP712Domain": [
        ...             {"name": "name", "type": "string"},
        ...             {"name": "version", "type": "string"},
        ...             {"name": "chainId", "type": "uint256"},
        ...             {"name": "verifyingContract", "type": "address"},
        ...             {"name": "salt", "type": "bytes32"},
        ...         ],
        ...         "Person": [
        ...             {"name": "name", "type": "string"},
        ...             {"name": "wallet", "type": "address"},
        ...         ],
        ...         "Mail": [
        ...             {"name": "from", "type": "Person"},
        ...             {"name": "to", "type": "Person"},
        ...             {"name": "contents", "type": "string"},
        ...         ],
        ...     },
        ...     "primaryType": "Mail",
        ...     "domain": {
        ...         "name": "Ether Mail",
        ...         "version": "1",
        ...         "chainId": 1,
        ...         "verifyingContract": "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
        ...         "salt": b"decafbeef"
        ...     },
        ...     "message": {
        ...         "from": {
        ...             "name": "Cow",
        ...             "wallet": "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826"
        ...         },
        ...         "to": {
        ...             "name": "Bob",
        ...             "wallet": "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB"
        ...         },
        ...         "contents": "Hello, Bob!",
        ...     },
        ... }
        >>> signable_message_2 = encode_typed_data(full_message=full_message)
        >>> signed_message_2 = Account.sign_message(signable_message_2, key)
        >>> signed_message_2.messageHash
        HexBytes('0xc5bb16ccc59ae9a3ad1cb8343d4e3351f057c994a97656e1aff8c134e56f7530')
        >>> signed_message_2 == signed_message
        True
        >>> # the full_message can be signed in one step using Account.sign_typed_data
        >>> signed_typed_data_2 = Account.sign_typed_data(key, domain_data, message_types, message_data)
        >>> signed_typed_data_2 == signed_message_2
        True

    .. _EIP-712: https://eips.ethereum.org/EIPS/eip-712
    """  # noqa: E501
    if full_message is not None:
        if (
            domain_data is not None
            or message_types is not None
            or message_data is not None
        ):
            raise ValueError(
                "You may supply either `full_message` as a single argument or "
                "`domain_data`, `message_types`, and `message_data` as three arguments,"
                " but not both."
            )

        full_message_types = full_message["types"].copy()
        full_message_domain = full_message["domain"].copy()

        # If EIP712Domain types were provided, check that they match the domain data
        if "EIP712Domain" in full_message_types:
            domain_data_keys = list(full_message_domain.keys())
            domain_types_keys = [
                field["name"] for field in full_message_types["EIP712Domain"]
            ]

            if set(domain_data_keys) != (set(domain_types_keys)):
                raise ValidationError(
                    "The fields provided in `domain` do not match the fields provided"
                    " in `types.EIP712Domain`. The fields provided in `domain` were"
                    f" `{domain_data_keys}`, but the fields provided in "
                    f"`types.EIP712Domain` were `{domain_types_keys}`."
                )

        full_message_types.pop("EIP712Domain", None)

        # If primaryType was provided, check that it matches the derived primaryType
        if "primaryType" in full_message:
            derived_primary_type = get_primary_type(full_message_types)
            provided_primary_type = full_message["primaryType"]
            if derived_primary_type != provided_primary_type:
                raise ValidationError(
                    "The provided `primaryType` does not match the derived "
                    "`primaryType`. The provided `primaryType` was "
                    f"`{provided_primary_type}`, but the derived `primaryType` was "
                    f"`{derived_primary_type}`."
                )

        parsed_domain_data = full_message_domain
        parsed_message_types = full_message_types
        parsed_message_data = full_message["message"]

    else:
        parsed_domain_data = domain_data
        parsed_message_types = message_types
        parsed_message_data = message_data

    return SignableMessage(
        HexBytes(b"\x01"),
        hash_domain(parsed_domain_data),
        hash_eip712_message(parsed_message_types, parsed_message_data),
    )
