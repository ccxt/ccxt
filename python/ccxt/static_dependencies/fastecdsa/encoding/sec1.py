from . import KeyEncoder
from .util import bytes_to_int, int_bytelen, int_to_bytes
from ..curve import Curve
from ..point import Point
from ..util import mod_sqrt


class InvalidSEC1PublicKey(Exception):
    pass


class SEC1Encoder(KeyEncoder):
    binary_data = True

    @staticmethod
    def encode_public_key(point: Point, compressed: bool = True) -> bytes:
        """ Encode a public key as described in http://www.secg.org/SEC1-Ver-1.0.pdf
            in sections 2.3.3/2.3.4
                uncompressed:   04 + x_bytes + y_bytes
                compressed:     02 or 03 + x_bytes
        Args:
            point (fastecdsa.point.Point): Public key to encode
            compressed (bool): Set to False if you want an uncompressed format

        Returns:
            bytes: The SEC1 encoded public key
        """
        bytelen = int_bytelen(point.curve.q)
        if compressed:
            if point.y & 1:  # odd root
                return b'\x03' + int_to_bytes(point.x).rjust(bytelen, b'\x00')
            else:           # even root
                return b'\x02' + int_to_bytes(point.x).rjust(bytelen, b'\x00')
        return b'\x04' + int_to_bytes(point.x).rjust(bytelen, b'\x00') + int_to_bytes(point.y).rjust(bytelen, b'\x00')

    @staticmethod
    def decode_public_key(key: bytes, curve: Curve) -> Point:
        """ Decode a public key as described in http://www.secg.org/SEC1-Ver-1.0.pdf
            in sections 2.3.3/2.3.4

                uncompressed:   04 + x_bytes + y_bytes
                compressed:     02 or 03 + x_bytes

        Args:
            key (bytes): public key encoded using the SEC1 format
            curve (fastecdsa.curve.Curve): Curve to use when decoding the public key

        Returns:
            Point: The decoded public key

        Raises:
            InvalidSEC1PublicKey
        """
        bytelen = int_bytelen(curve.q)
        if key.startswith(b'\x04'):        # uncompressed key
            if len(key) != bytelen * 2 + 1:
                raise InvalidSEC1PublicKey('An uncompressed public key must be %d bytes long' % (bytelen * 2 + 1))
            x, y = bytes_to_int(key[1:bytelen + 1]), bytes_to_int(key[bytelen + 1:])
        else:                              # compressed key
            if len(key) != bytelen + 1:
                raise InvalidSEC1PublicKey('A compressed public key must be %d bytes long' % (bytelen + 1))
            x = bytes_to_int(key[1:])
            root = mod_sqrt(curve.evaluate(x), curve.p)[0]
            if key.startswith(b'\x03'):    # odd root
                y = root if root % 2 == 1 else -root % curve.p
            elif key.startswith(b'\x02'):  # even root
                y = root if root % 2 == 0 else -root % curve.p
            else:
                raise InvalidSEC1PublicKey('Wrong key format')
        return Point(x, y, curve=curve)

    @staticmethod
    def encode_private_key(d):
        raise NotImplementedError('SEC1Encoder only encodes public keys')

    @staticmethod
    def decode_private_key(data):
        raise NotImplementedError('SEC1Encoder only decodes public keys')
