from struct import pack, unpack

from ..curve import Curve
from ..point import Point
from .util import int_bytelen, int_to_bytes

INTEGER = b'\x02'
BIT_STRING = b'\x03'
OCTET_STRING = b'\x04'
OBJECT_IDENTIFIER = b'\x06'
SEQUENCE = b'\x30'
PARAMETERS = b'\xa0'
PUBLIC_KEY = b'\xa1'


class ASN1EncodingError(Exception):
    pass


def _asn1_len(data: bytes) -> bytes:
    # https://www.itu.int/ITU-T/studygroups/com17/languages/X.690-0207.pdf
    # section 8.1.3.3
    dlen = len(data)

    if dlen < 0x80:
        return pack('=B', dlen)
    else:
        encoded = b''

        while dlen:
            len_byte = pack('=B', dlen & 0xff)
            encoded = len_byte + encoded
            dlen >>= 8

        return pack('=B', 0x80 | len(encoded)) + encoded


def asn1_structure(data_type: bytes, data: bytes) -> bytes:
    return data_type + _asn1_len(data) + data


def asn1_private_key(d: int, curve: Curve) -> bytes:
    d_bytes = int_to_bytes(d)
    padding = b'\x00' * (int_bytelen(curve.q) - len(d_bytes))
    return asn1_structure(OCTET_STRING, padding + d_bytes)


def asn1_ecversion(version=1) -> bytes:
    version_bytes = int_to_bytes(version)
    return asn1_structure(INTEGER, version_bytes)


def asn1_ecpublickey() -> bytes:
    # via RFC 5480 - The "unrestricted" algorithm identifier is:
    # id-ecPublicKey OBJECT IDENTIFIER ::= {
    #   iso(1) member-body(2) us(840) ansi-X9-62(10045) keyType(2) 1 }
    return asn1_structure(OBJECT_IDENTIFIER, b'\x2A\x86\x48\xCE\x3D\x02\x01')


def asn1_oid(curve: Curve) -> bytes:
    oid_bytes = curve.oid
    return asn1_structure(OBJECT_IDENTIFIER, oid_bytes)


def asn1_public_key(Q: Point) -> bytes:
    p_len = int_bytelen(Q.curve.p)

    x_bytes = int_to_bytes(Q.x)
    x_padding = b'\x00' * (p_len - len(x_bytes))

    y_bytes = int_to_bytes(Q.y)
    y_padding = b'\x00' * (p_len - len(y_bytes))

    key_bytes = b'\x00\x04' + x_padding + x_bytes + y_padding + y_bytes
    return asn1_structure(BIT_STRING, key_bytes)


def parse_asn1_length(data: bytes) -> (int, bytes, bytes):
    """
    Parse an ASN.1 encoded structure.

    Args:
        data (bytes): A sequence of bytes representing an ASN.1 encoded structure

    Returns:
        (int, bytes, bytes): A tuple of the integer length in bytes, the byte representation of the integer,
                             and the remaining bytes after the integer bytes in the sequence
    """
    (initial_byte,) = unpack('=B', data[:1])
    data = data[1:]

    if not (initial_byte & 0x80):
        length = initial_byte
    else:
        count = initial_byte & 0x7f
        fmt = {1: '=B', 2: '=H', 3: '=L', 4: '=L', 5: '=Q', 6: '=Q', 7: '=Q', 8: '=Q'}
        zero_padding = b'\x00' * ((1 << (count.bit_length() - 1)) - count)

        (length,) = unpack(fmt[count], zero_padding + data[:count])
        data = data[count:]

    if length > len(data):
        raise ASN1EncodingError("Parsed length of ASN.1 structure to be {} bytes but only {} bytes"
                                "remain in the provided data".format(length, len(data)))

    return length, data[:length], data[length:]


def parse_asn1_int(data: bytes) -> (int, bytes, bytes):
    """
    Parse an ASN.1 encoded integer.

    Args:
        data (bytes): A sequence of bytes whose start is an ASN.1 integer encoding

    Returns:
        (int, bytes, bytes): A tuple of the integer length in bytes, the byte representation of the integer,
                             and the remaining bytes after the integer bytes in the sequence
    """

    # encoding needs at least the type, length and data
    if len(data) < 3:
        raise ASN1EncodingError("ASN.1 encoded integer must be at least 3 bytes long")
    # integer should be identified as ASN.1 integer
    if data[0] != ord(INTEGER):
        raise ASN1EncodingError("Value should be a ASN.1 INTEGER")

    length, data, remaining = parse_asn1_length(data[1:])

    # integer length should match length indicated
    if length != len(data):
        raise ASN1EncodingError("Expected ASN.1 INTEGER to be {} bytes, got {} bytes".format(length, len(data)))

    return length, data, remaining
