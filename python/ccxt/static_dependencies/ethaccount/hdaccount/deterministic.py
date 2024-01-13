"""
Generate Heirarchical Deterministic Wallets (HDWallet).

Partially implements the BIP-0032, BIP-0043, and BIP-0044 specifications:
BIP-0032: https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
BIP-0043: https://github.com/bitcoin/bips/blob/master/bip-0043.mediawiki
BIP-0044: https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki

Skips serialization and public key derivation as unnecssary for this library's purposes.

Notes
-----

* Integers are modulo the order of the curve (referred to as n).
* Addition (+) of two coordinate pair is defined as application of
  the EC group operation.
* Concatenation (||) is the operation of appending one byte sequence onto another.


Definitions
-----------

* point(p): returns the coordinate pair resulting from EC point multiplication
  (repeated application of the EC group operation) of the secp256k1 base point
  with the integer p.
* ser_32(i): serialize a 32-bit unsigned integer i as a 4-byte sequence,
  most significant byte first.
* ser_256(p): serializes the integer p as a 32-byte sequence, most significant
  byte first.
* ser_P(P): serializes the coordinate pair P = (x,y) as a byte sequence using SEC1's
  compressed form: (0x02 or 0x03) || ser_256(x), where the header byte depends on the
  parity of the omitted y coordinate.
* parse_256(p): interprets a 32-byte sequence as a 256-bit number, most significant
  byte first.

"""
# Additional notes:
# - This module currently only implements private parent key => private child key
#   CKD function, as it is not necessary to the HD key derivation functions used
#   in this library to implement the other functions yet (as this module is only
#   used for derivation of private keys). That could change, but wasn't deemed
#   necessary at the time this module was introduced.
# - Unlike other libraries, this library does not use Bitcoin key serialization,
#   because it is not intended to be ultimately used for Bitcoin key derivations.
#   This presents a simplified API, and no expectation is given for `xpub/xpriv`
#   key derivation.
from typing import (
    Tuple,
    Type,
    Union,
)

from eth_utils import (
    ValidationError,
    to_int,
)

from ._utils import (
    SECP256K1_N,
    ec_point,
    hmac_sha512,
)

BASE_NODE_IDENTIFIERS = {"m", "M"}
HARD_NODE_SUFFIXES = {"'", "H"}


class Node(int):
    """
    A base node class.
    """

    TAG = ""  # No tag
    OFFSET = 0x0  # No offset
    index: int

    def __new__(cls, index):
        if 0 > index or index > 2**31:
            raise ValidationError(f"{cls} cannot be initialized with value {index}")

        obj = int.__new__(cls, index + cls.OFFSET)
        obj.index = index
        return obj

    def __repr__(self):
        return f"{self.__class__.__name__}({self.index})"

    def __add__(self, other: int) -> "Node":
        return self.__class__(self.index + other)

    def serialize(self) -> bytes:
        return self.to_bytes(4, byteorder="big")

    def encode(self) -> str:
        return str(self.index) + self.TAG

    @staticmethod
    def decode(node: str) -> Union["SoftNode", "HardNode"]:
        if len(node) < 1:
            raise ValidationError("Cannot use empty string")

        node_class: Union[Type["SoftNode"], Type["HardNode"]]
        if node[-1] in HARD_NODE_SUFFIXES:
            node_class = HardNode
            node_index = node[:-1]
        else:
            node_class = SoftNode
            node_index = node

        try:
            node_value = int(node_index)
        except ValueError as err:
            raise ValidationError(f"'{node_index}' is not a valid node index.") from err

        return node_class(node_value)


class SoftNode(Node):
    """
    Soft node (unhardened), where value = index .
    """

    TAG = ""  # No tag
    OFFSET = 0x0  # No offset


class HardNode(Node):
    """
    Hard node, where value = index + BIP32_HARDENED_CONSTANT .
    """

    TAG = "H"  # "H" (or "'") means hard node (but use "H" for clarity)
    OFFSET = 0x80000000  # 2**31, BIP32 "Hardening constant"


def derive_child_key(
    parent_key: bytes,
    parent_chain_code: bytes,
    node: Node,
) -> Tuple[bytes, bytes]:
    """
    Compute a derivitive key from the parent key.

    From BIP32:

    The function CKDpriv((k_par, c_par), i) → (k_i, c_i) computes a child extended
    private key from the parent extended private key:

    1. Check whether the child is a hardened key (i ≥ 2**31).
       If the child is a hardened key,
       let I = HMAC-SHA512(Key = c_par, Data = 0x00 || ser_256(k_par) || ser_32(i)).
       (Note: The 0x00 pads the private key to make it 33 bytes long.)
       If it is not a hardened key, then
       let I = HMAC-SHA512(Key = c_par, Data = ser_P(point(k_par)) || ser_32(i)).
    2. Split I into two 32-byte sequences, I_L and I_R.
    3. The returned child key k_i is parse_256(I_L) + k_par (mod n).
    4. The returned chain code c_i is I_R.
    5. In case parse_256(I_L) ≥ n or k_i = 0, the resulting key is invalid,
       and one should proceed with the next value for i.
       (Note: this has probability lower than 1 in 2**127.)

    """
    assert len(parent_chain_code) == 32
    if isinstance(node, HardNode):
        # NOTE Empty byte is added to align to SoftNode case
        assert len(parent_key) == 32  # Should be guaranteed here in return statment
        child = hmac_sha512(parent_chain_code, b"\x00" + parent_key + node.serialize())

    elif isinstance(node, SoftNode):
        assert len(ec_point(parent_key)) == 33  # Should be guaranteed by Account class
        child = hmac_sha512(parent_chain_code, ec_point(parent_key) + node.serialize())

    else:
        raise ValidationError(f"Cannot process: {node}")

    assert len(child) == 64

    if to_int(child[:32]) >= SECP256K1_N:
        # Invalid key, compute using next node (< 2**-127 probability)
        return derive_child_key(parent_key, parent_chain_code, node + 1)

    child_key = (to_int(child[:32]) + to_int(parent_key)) % SECP256K1_N
    if child_key == 0:
        # Invalid key, compute using next node (< 2**-127 probability)
        return derive_child_key(parent_key, parent_chain_code, node + 1)

    child_key_bytes = child_key.to_bytes(32, byteorder="big")
    child_chain_code = child[32:]
    return child_key_bytes, child_chain_code


class HDPath:
    def __init__(self, path: str):
        """
        Create a new Hierarchical Deterministic path by decoding the given path.

        Initializes an hd account generator using the
        given path string (from BIP-0032). The path is decoded into nodes of the
        derivation key tree, which define a pathway from a given master seed to
        the child key that is used for a given purpose. Please also reference BIP-
        0043 (which definites the first level as the "purpose" field of an HD path)
        and BIP-0044 (which defines a commonly-used, 5-level scheme for BIP32 paths)
        for examples of how this object may be used. Please note however that this
        object makes no such assumptions of the use of BIP43 or BIP44, or later BIPs.
        :param path             : BIP32-compatible derivation path
        :type path              : str as "m/idx_0/.../idx_n" or "m/idx_0/.../idx_n"
                                  where idx_* is either an integer value (soft node)
                                  or an integer value followed by either the "'" char
                                  or the "H" char (hardened node)
        """
        if len(path) < 1:
            raise ValidationError("Cannot parse path from empty string.")

        nodes = path.split("/")  # Should at least make 1 entry in resulting list
        if nodes[0] not in BASE_NODE_IDENTIFIERS:
            raise ValidationError(f'Path is not valid: "{path}". Must start with "m"')

        decoded_path = []
        for _idx, node in enumerate(nodes[1:]):  # We don't need the root node 'm'
            try:
                decoded_path.append(Node.decode(node))
            except ValidationError as err:
                raise ValidationError(
                    f'Path "{path}" is not valid. Issue with node "{node}": {err}'
                ) from err

        self._path = decoded_path

    def __repr__(self) -> str:
        return f'{self.__class__.__name__}(path="{self.encode()}")'

    def encode(self) -> str:
        """
        Encodes this class to a string (reversing the decoding in the constructor).
        """
        encoded_path = ("m",) + tuple(node.encode() for node in self._path)
        return "/".join(encoded_path)

    def derive(self, seed: bytes) -> bytes:
        """
        Perform the BIP32 Heirarchical Derivation recursive loop with the given Path.

        Note that the key and chain_code are initialized with the master seed, and that
        the key that is returned is the child key at the end of derivation process (and
        the chain code is discarded)
        """
        master_node = hmac_sha512(b"Bitcoin seed", seed)
        key = master_node[:32]
        chain_code = master_node[32:]
        for node in self._path:
            key, chain_code = derive_child_key(key, chain_code, node)
        return key
