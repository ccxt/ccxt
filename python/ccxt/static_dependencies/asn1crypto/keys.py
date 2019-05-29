# coding: utf-8

"""
ASN.1 type classes for public and private keys. Exports the following items:

 - DSAPrivateKey()
 - ECPrivateKey()
 - EncryptedPrivateKeyInfo()
 - PrivateKeyInfo()
 - PublicKeyInfo()
 - RSAPrivateKey()
 - RSAPublicKey()

Other type classes are defined that help compose the types listed above.
"""

from __future__ import unicode_literals, division, absolute_import, print_function

import hashlib
import math

from ._elliptic_curve import (
    SECP192R1_BASE_POINT,
    SECP224R1_BASE_POINT,
    SECP256R1_BASE_POINT,
    SECP384R1_BASE_POINT,
    SECP521R1_BASE_POINT,
    PrimeCurve,
    PrimePoint,
)
from ._errors import unwrap
from ._types import type_name, str_cls, byte_cls
from .algos import _ForceNullParameters, DigestAlgorithm, EncryptionAlgorithm, RSAESOAEPParams
from .core import (
    Any,
    Asn1Value,
    BitString,
    Choice,
    Integer,
    IntegerOctetString,
    Null,
    ObjectIdentifier,
    OctetBitString,
    OctetString,
    ParsableOctetString,
    ParsableOctetBitString,
    Sequence,
    SequenceOf,
    SetOf,
)
from .util import int_from_bytes, int_to_bytes


class OtherPrimeInfo(Sequence):
    """
    Source: https://tools.ietf.org/html/rfc3447#page-46
    """

    _fields = [
        ('prime', Integer),
        ('exponent', Integer),
        ('coefficient', Integer),
    ]


class OtherPrimeInfos(SequenceOf):
    """
    Source: https://tools.ietf.org/html/rfc3447#page-46
    """

    _child_spec = OtherPrimeInfo


class RSAPrivateKeyVersion(Integer):
    """
    Original Name: Version
    Source: https://tools.ietf.org/html/rfc3447#page-45
    """

    _map = {
        0: 'two-prime',
        1: 'multi',
    }


class RSAPrivateKey(Sequence):
    """
    Source: https://tools.ietf.org/html/rfc3447#page-45
    """

    _fields = [
        ('version', RSAPrivateKeyVersion),
        ('modulus', Integer),
        ('public_exponent', Integer),
        ('private_exponent', Integer),
        ('prime1', Integer),
        ('prime2', Integer),
        ('exponent1', Integer),
        ('exponent2', Integer),
        ('coefficient', Integer),
        ('other_prime_infos', OtherPrimeInfos, {'optional': True})
    ]


class RSAPublicKey(Sequence):
    """
    Source: https://tools.ietf.org/html/rfc3447#page-44
    """

    _fields = [
        ('modulus', Integer),
        ('public_exponent', Integer)
    ]


class DSAPrivateKey(Sequence):
    """
    The ASN.1 structure that OpenSSL uses to store a DSA private key that is
    not part of a PKCS#8 structure. Reversed engineered from english-language
    description on linked OpenSSL documentation page.

    Original Name: None
    Source: https://www.openssl.org/docs/apps/dsa.html
    """

    _fields = [
        ('version', Integer),
        ('p', Integer),
        ('q', Integer),
        ('g', Integer),
        ('public_key', Integer),
        ('private_key', Integer),
    ]


class _ECPoint():
    """
    In both PublicKeyInfo and PrivateKeyInfo, the EC public key is a byte
    string that is encoded as a bit string. This class adds convenience
    methods for converting to and from the byte string to a pair of integers
    that are the X and Y coordinates.
    """

    @classmethod
    def from_coords(cls, x, y):
        """
        Creates an ECPoint object from the X and Y integer coordinates of the
        point

        :param x:
            The X coordinate, as an integer

        :param y:
            The Y coordinate, as an integer

        :return:
            An ECPoint object
        """

        x_bytes = int(math.ceil(math.log(x, 2) / 8.0))
        y_bytes = int(math.ceil(math.log(y, 2) / 8.0))

        num_bytes = max(x_bytes, y_bytes)

        byte_string = b'\x04'
        byte_string += int_to_bytes(x, width=num_bytes)
        byte_string += int_to_bytes(y, width=num_bytes)

        return cls(byte_string)

    def to_coords(self):
        """
        Returns the X and Y coordinates for this EC point, as native Python
        integers

        :return:
            A 2-element tuple containing integers (X, Y)
        """

        data = self.native
        first_byte = data[0:1]

        # Uncompressed
        if first_byte == b'\x04':
            remaining = data[1:]
            field_len = len(remaining) // 2
            x = int_from_bytes(remaining[0:field_len])
            y = int_from_bytes(remaining[field_len:])
            return (x, y)

        if first_byte not in set([b'\x02', b'\x03']):
            raise ValueError(unwrap(
                '''
                Invalid EC public key - first byte is incorrect
                '''
            ))

        raise ValueError(unwrap(
            '''
            Compressed representations of EC public keys are not supported due
            to patent US6252960
            '''
        ))


class ECPoint(OctetString, _ECPoint):

    pass


class ECPointBitString(OctetBitString, _ECPoint):

    pass


class SpecifiedECDomainVersion(Integer):
    """
    Source: http://www.secg.org/sec1-v2.pdf page 104
    """
    _map = {
        1: 'ecdpVer1',
        2: 'ecdpVer2',
        3: 'ecdpVer3',
    }


class FieldType(ObjectIdentifier):
    """
    Original Name: None
    Source: http://www.secg.org/sec1-v2.pdf page 101
    """

    _map = {
        '1.2.840.10045.1.1': 'prime_field',
        '1.2.840.10045.1.2': 'characteristic_two_field',
    }


class CharacteristicTwoBasis(ObjectIdentifier):
    """
    Original Name: None
    Source: http://www.secg.org/sec1-v2.pdf page 102
    """

    _map = {
        '1.2.840.10045.1.2.1.1': 'gn_basis',
        '1.2.840.10045.1.2.1.2': 'tp_basis',
        '1.2.840.10045.1.2.1.3': 'pp_basis',
    }


class Pentanomial(Sequence):
    """
    Source: http://www.secg.org/sec1-v2.pdf page 102
    """

    _fields = [
        ('k1', Integer),
        ('k2', Integer),
        ('k3', Integer),
    ]


class CharacteristicTwo(Sequence):
    """
    Original Name: Characteristic-two
    Source: http://www.secg.org/sec1-v2.pdf page 101
    """

    _fields = [
        ('m', Integer),
        ('basis', CharacteristicTwoBasis),
        ('parameters', Any),
    ]

    _oid_pair = ('basis', 'parameters')
    _oid_specs = {
        'gn_basis': Null,
        'tp_basis': Integer,
        'pp_basis': Pentanomial,
    }


class FieldID(Sequence):
    """
    Source: http://www.secg.org/sec1-v2.pdf page 100
    """

    _fields = [
        ('field_type', FieldType),
        ('parameters', Any),
    ]

    _oid_pair = ('field_type', 'parameters')
    _oid_specs = {
        'prime_field': Integer,
        'characteristic_two_field': CharacteristicTwo,
    }


class Curve(Sequence):
    """
    Source: http://www.secg.org/sec1-v2.pdf page 104
    """

    _fields = [
        ('a', OctetString),
        ('b', OctetString),
        ('seed', OctetBitString, {'optional': True}),
    ]


class SpecifiedECDomain(Sequence):
    """
    Source: http://www.secg.org/sec1-v2.pdf page 103
    """

    _fields = [
        ('version', SpecifiedECDomainVersion),
        ('field_id', FieldID),
        ('curve', Curve),
        ('base', ECPoint),
        ('order', Integer),
        ('cofactor', Integer, {'optional': True}),
        ('hash', DigestAlgorithm, {'optional': True}),
    ]


class NamedCurve(ObjectIdentifier):
    """
    Various named curves

    Original Name: None
    Source: https://tools.ietf.org/html/rfc3279#page-23,
            https://tools.ietf.org/html/rfc5480#page-5
    """

    _map = {
        # https://tools.ietf.org/html/rfc3279#page-23
        '1.2.840.10045.3.0.1': 'c2pnb163v1',
        '1.2.840.10045.3.0.2': 'c2pnb163v2',
        '1.2.840.10045.3.0.3': 'c2pnb163v3',
        '1.2.840.10045.3.0.4': 'c2pnb176w1',
        '1.2.840.10045.3.0.5': 'c2tnb191v1',
        '1.2.840.10045.3.0.6': 'c2tnb191v2',
        '1.2.840.10045.3.0.7': 'c2tnb191v3',
        '1.2.840.10045.3.0.8': 'c2onb191v4',
        '1.2.840.10045.3.0.9': 'c2onb191v5',
        '1.2.840.10045.3.0.10': 'c2pnb208w1',
        '1.2.840.10045.3.0.11': 'c2tnb239v1',
        '1.2.840.10045.3.0.12': 'c2tnb239v2',
        '1.2.840.10045.3.0.13': 'c2tnb239v3',
        '1.2.840.10045.3.0.14': 'c2onb239v4',
        '1.2.840.10045.3.0.15': 'c2onb239v5',
        '1.2.840.10045.3.0.16': 'c2pnb272w1',
        '1.2.840.10045.3.0.17': 'c2pnb304w1',
        '1.2.840.10045.3.0.18': 'c2tnb359v1',
        '1.2.840.10045.3.0.19': 'c2pnb368w1',
        '1.2.840.10045.3.0.20': 'c2tnb431r1',
        '1.2.840.10045.3.1.2': 'prime192v2',
        '1.2.840.10045.3.1.3': 'prime192v3',
        '1.2.840.10045.3.1.4': 'prime239v1',
        '1.2.840.10045.3.1.5': 'prime239v2',
        '1.2.840.10045.3.1.6': 'prime239v3',
        # https://tools.ietf.org/html/rfc5480#page-5
        '1.3.132.0.1': 'sect163k1',
        '1.3.132.0.15': 'sect163r2',
        '1.2.840.10045.3.1.1': 'secp192r1',
        '1.3.132.0.33': 'secp224r1',
        '1.3.132.0.26': 'sect233k1',
        '1.2.840.10045.3.1.7': 'secp256r1',
        '1.3.132.0.27': 'sect233r1',
        '1.3.132.0.16': 'sect283k1',
        '1.3.132.0.17': 'sect283r1',
        '1.3.132.0.34': 'secp384r1',
        '1.3.132.0.36': 'sect409k1',
        '1.3.132.0.37': 'sect409r1',
        '1.3.132.0.35': 'secp521r1',
        '1.3.132.0.38': 'sect571k1',
        '1.3.132.0.39': 'sect571r1',
    }


class ECDomainParameters(Choice):
    """
    Source: http://www.secg.org/sec1-v2.pdf page 102
    """

    _alternatives = [
        ('specified', SpecifiedECDomain),
        ('named', NamedCurve),
        ('implicit_ca', Null),
    ]


class ECPrivateKeyVersion(Integer):
    """
    Original Name: None
    Source: http://www.secg.org/sec1-v2.pdf page 108
    """

    _map = {
        1: 'ecPrivkeyVer1',
    }


class ECPrivateKey(Sequence):
    """
    Source: http://www.secg.org/sec1-v2.pdf page 108
    """

    _fields = [
        ('version', ECPrivateKeyVersion),
        ('private_key', IntegerOctetString),
        ('parameters', ECDomainParameters, {'explicit': 0, 'optional': True}),
        ('public_key', ECPointBitString, {'explicit': 1, 'optional': True}),
    ]


class DSAParams(Sequence):
    """
    Parameters for a DSA public or private key

    Original Name: Dss-Parms
    Source: https://tools.ietf.org/html/rfc3279#page-9
    """

    _fields = [
        ('p', Integer),
        ('q', Integer),
        ('g', Integer),
    ]


class Attribute(Sequence):
    """
    Source: https://www.itu.int/rec/dologin_pub.asp?lang=e&id=T-REC-X.501-198811-S!!PDF-E&type=items page 8
    """

    _fields = [
        ('type', ObjectIdentifier),
        ('values', SetOf, {'spec': Any}),
    ]


class Attributes(SetOf):
    """
    Source: https://tools.ietf.org/html/rfc5208#page-3
    """

    _child_spec = Attribute


class PrivateKeyAlgorithmId(ObjectIdentifier):
    """
    These OIDs for various public keys are reused when storing private keys
    inside of a PKCS#8 structure

    Original Name: None
    Source: https://tools.ietf.org/html/rfc3279
    """

    _map = {
        # https://tools.ietf.org/html/rfc3279#page-19
        '1.2.840.113549.1.1.1': 'rsa',
        # https://tools.ietf.org/html/rfc3279#page-18
        '1.2.840.10040.4.1': 'dsa',
        # https://tools.ietf.org/html/rfc3279#page-13
        '1.2.840.10045.2.1': 'ec',
    }


class PrivateKeyAlgorithm(_ForceNullParameters, Sequence):
    """
    Original Name: PrivateKeyAlgorithmIdentifier
    Source: https://tools.ietf.org/html/rfc5208#page-3
    """

    _fields = [
        ('algorithm', PrivateKeyAlgorithmId),
        ('parameters', Any, {'optional': True}),
    ]

    _oid_pair = ('algorithm', 'parameters')
    _oid_specs = {
        'dsa': DSAParams,
        'ec': ECDomainParameters,
    }


class PrivateKeyInfo(Sequence):
    """
    Source: https://tools.ietf.org/html/rfc5208#page-3
    """

    _fields = [
        ('version', Integer),
        ('private_key_algorithm', PrivateKeyAlgorithm),
        ('private_key', ParsableOctetString),
        ('attributes', Attributes, {'implicit': 0, 'optional': True}),
    ]

    def _private_key_spec(self):
        algorithm = self['private_key_algorithm']['algorithm'].native
        return {
            'rsa': RSAPrivateKey,
            'dsa': Integer,
            'ec': ECPrivateKey,
        }[algorithm]

    _spec_callbacks = {
        'private_key': _private_key_spec
    }

    _algorithm = None
    _bit_size = None
    _public_key = None
    _fingerprint = None

    @classmethod
    def wrap(cls, private_key, algorithm):
        """
        Wraps a private key in a PrivateKeyInfo structure

        :param private_key:
            A byte string or Asn1Value object of the private key

        :param algorithm:
            A unicode string of "rsa", "dsa" or "ec"

        :return:
            A PrivateKeyInfo object
        """

        if not isinstance(private_key, byte_cls) and not isinstance(private_key, Asn1Value):
            raise TypeError(unwrap(
                '''
                private_key must be a byte string or Asn1Value, not %s
                ''',
                type_name(private_key)
            ))

        if algorithm == 'rsa':
            if not isinstance(private_key, RSAPrivateKey):
                private_key = RSAPrivateKey.load(private_key)
            params = Null()
        elif algorithm == 'dsa':
            if not isinstance(private_key, DSAPrivateKey):
                private_key = DSAPrivateKey.load(private_key)
            params = DSAParams()
            params['p'] = private_key['p']
            params['q'] = private_key['q']
            params['g'] = private_key['g']
            public_key = private_key['public_key']
            private_key = private_key['private_key']
        elif algorithm == 'ec':
            if not isinstance(private_key, ECPrivateKey):
                private_key = ECPrivateKey.load(private_key)
            else:
                private_key = private_key.copy()
            params = private_key['parameters']
            del private_key['parameters']
        else:
            raise ValueError(unwrap(
                '''
                algorithm must be one of "rsa", "dsa", "ec", not %s
                ''',
                repr(algorithm)
            ))

        private_key_algo = PrivateKeyAlgorithm()
        private_key_algo['algorithm'] = PrivateKeyAlgorithmId(algorithm)
        private_key_algo['parameters'] = params

        container = cls()
        container._algorithm = algorithm
        container['version'] = Integer(0)
        container['private_key_algorithm'] = private_key_algo
        container['private_key'] = private_key

        # Here we save the DSA public key if possible since it is not contained
        # within the PKCS#8 structure for a DSA key
        if algorithm == 'dsa':
            container._public_key = public_key

        return container

    def _compute_public_key(self):
        """
        Computes the public key corresponding to the current private key.

        :return:
            For RSA keys, an RSAPublicKey object. For DSA keys, an Integer
            object. For EC keys, an ECPointBitString.
        """

        if self.algorithm == 'dsa':
            params = self['private_key_algorithm']['parameters']
            return Integer(pow(
                params['g'].native,
                self['private_key'].parsed.native,
                params['p'].native
            ))

        if self.algorithm == 'rsa':
            key = self['private_key'].parsed
            return RSAPublicKey({
                'modulus': key['modulus'],
                'public_exponent': key['public_exponent'],
            })

        if self.algorithm == 'ec':
            curve_type, details = self.curve

            if curve_type == 'implicit_ca':
                raise ValueError(unwrap(
                    '''
                    Unable to compute public key for EC key using Implicit CA
                    parameters
                    '''
                ))

            if curve_type == 'specified':
                if details['field_id']['field_type'] == 'characteristic_two_field':
                    raise ValueError(unwrap(
                        '''
                        Unable to compute public key for EC key over a
                        characteristic two field
                        '''
                    ))

                curve = PrimeCurve(
                    details['field_id']['parameters'],
                    int_from_bytes(details['curve']['a']),
                    int_from_bytes(details['curve']['b'])
                )
                base_x, base_y = self['private_key_algorithm']['parameters'].chosen['base'].to_coords()
                base_point = PrimePoint(curve, base_x, base_y)

            elif curve_type == 'named':
                if details not in ('secp192r1', 'secp224r1', 'secp256r1', 'secp384r1', 'secp521r1'):
                    raise ValueError(unwrap(
                        '''
                        Unable to compute public key for EC named curve %s,
                        parameters not currently included
                        ''',
                        details
                    ))

                base_point = {
                    'secp192r1': SECP192R1_BASE_POINT,
                    'secp224r1': SECP224R1_BASE_POINT,
                    'secp256r1': SECP256R1_BASE_POINT,
                    'secp384r1': SECP384R1_BASE_POINT,
                    'secp521r1': SECP521R1_BASE_POINT,
                }[details]

            public_point = base_point * self['private_key'].parsed['private_key'].native
            return ECPointBitString.from_coords(public_point.x, public_point.y)

    def unwrap(self):
        """
        Unwraps the private key into an RSAPrivateKey, DSAPrivateKey or
        ECPrivateKey object

        :return:
            An RSAPrivateKey, DSAPrivateKey or ECPrivateKey object
        """

        if self.algorithm == 'rsa':
            return self['private_key'].parsed

        if self.algorithm == 'dsa':
            params = self['private_key_algorithm']['parameters']
            return DSAPrivateKey({
                'version': 0,
                'p': params['p'],
                'q': params['q'],
                'g': params['g'],
                'public_key': self.public_key,
                'private_key': self['private_key'].parsed,
            })

        if self.algorithm == 'ec':
            output = self['private_key'].parsed
            output['parameters'] = self['private_key_algorithm']['parameters']
            output['public_key'] = self.public_key
            return output

    @property
    def curve(self):
        """
        Returns information about the curve used for an EC key

        :raises:
            ValueError - when the key is not an EC key

        :return:
            A two-element tuple, with the first element being a unicode string
            of "implicit_ca", "specified" or "named". If the first element is
            "implicit_ca", the second is None. If "specified", the second is
            an OrderedDict that is the native version of SpecifiedECDomain. If
            "named", the second is a unicode string of the curve name.
        """

        if self.algorithm != 'ec':
            raise ValueError(unwrap(
                '''
                Only EC keys have a curve, this key is %s
                ''',
                self.algorithm.upper()
            ))

        params = self['private_key_algorithm']['parameters']
        chosen = params.chosen

        if params.name == 'implicit_ca':
            value = None
        else:
            value = chosen.native

        return (params.name, value)

    @property
    def hash_algo(self):
        """
        Returns the name of the family of hash algorithms used to generate a
        DSA key

        :raises:
            ValueError - when the key is not a DSA key

        :return:
            A unicode string of "sha1" or "sha2"
        """

        if self.algorithm != 'dsa':
            raise ValueError(unwrap(
                '''
                Only DSA keys are generated using a hash algorithm, this key is
                %s
                ''',
                self.algorithm.upper()
            ))

        byte_len = math.log(self['private_key_algorithm']['parameters']['q'].native, 2) / 8

        return 'sha1' if byte_len <= 20 else 'sha2'

    @property
    def algorithm(self):
        """
        :return:
            A unicode string of "rsa", "dsa" or "ec"
        """

        if self._algorithm is None:
            self._algorithm = self['private_key_algorithm']['algorithm'].native
        return self._algorithm

    @property
    def bit_size(self):
        """
        :return:
            The bit size of the private key, as an integer
        """

        if self._bit_size is None:
            if self.algorithm == 'rsa':
                prime = self['private_key'].parsed['modulus'].native
            elif self.algorithm == 'dsa':
                prime = self['private_key_algorithm']['parameters']['p'].native
            elif self.algorithm == 'ec':
                prime = self['private_key'].parsed['private_key'].native
            self._bit_size = int(math.ceil(math.log(prime, 2)))
            modulus = self._bit_size % 8
            if modulus != 0:
                self._bit_size += 8 - modulus
        return self._bit_size

    @property
    def byte_size(self):
        """
        :return:
            The byte size of the private key, as an integer
        """

        return int(math.ceil(self.bit_size / 8))

    @property
    def public_key(self):
        """
        :return:
            If an RSA key, an RSAPublicKey object. If a DSA key, an Integer
            object. If an EC key, an ECPointBitString object.
        """

        if self._public_key is None:
            if self.algorithm == 'ec':
                key = self['private_key'].parsed
                if key['public_key']:
                    self._public_key = key['public_key'].untag()
                else:
                    self._public_key = self._compute_public_key()
            else:
                self._public_key = self._compute_public_key()

        return self._public_key

    @property
    def public_key_info(self):
        """
        :return:
            A PublicKeyInfo object derived from this private key.
        """

        return PublicKeyInfo({
            'algorithm': {
                'algorithm': self.algorithm,
                'parameters': self['private_key_algorithm']['parameters']
            },
            'public_key': self.public_key
        })

    @property
    def fingerprint(self):
        """
        Creates a fingerprint that can be compared with a public key to see if
        the two form a pair.

        This fingerprint is not compatible with fingerprints generated by any
        other software.

        :return:
            A byte string that is a sha256 hash of selected components (based
            on the key type)
        """

        if self._fingerprint is None:
            params = self['private_key_algorithm']['parameters']
            key = self['private_key'].parsed

            if self.algorithm == 'rsa':
                to_hash = '%d:%d' % (
                    key['modulus'].native,
                    key['public_exponent'].native,
                )

            elif self.algorithm == 'dsa':
                public_key = self.public_key
                to_hash = '%d:%d:%d:%d' % (
                    params['p'].native,
                    params['q'].native,
                    params['g'].native,
                    public_key.native,
                )

            elif self.algorithm == 'ec':
                public_key = key['public_key'].native
                if public_key is None:
                    public_key = self.public_key.native

                if params.name == 'named':
                    to_hash = '%s:' % params.chosen.native
                    to_hash = to_hash.encode('utf-8')
                    to_hash += public_key

                elif params.name == 'implicit_ca':
                    to_hash = public_key

                elif params.name == 'specified':
                    to_hash = '%s:' % params.chosen['field_id']['parameters'].native
                    to_hash = to_hash.encode('utf-8')
                    to_hash += b':' + params.chosen['curve']['a'].native
                    to_hash += b':' + params.chosen['curve']['b'].native
                    to_hash += public_key

            if isinstance(to_hash, str_cls):
                to_hash = to_hash.encode('utf-8')

            self._fingerprint = hashlib.sha256(to_hash).digest()

        return self._fingerprint


class EncryptedPrivateKeyInfo(Sequence):
    """
    Source: https://tools.ietf.org/html/rfc5208#page-4
    """

    _fields = [
        ('encryption_algorithm', EncryptionAlgorithm),
        ('encrypted_data', OctetString),
    ]


# These structures are from https://tools.ietf.org/html/rfc3279

class ValidationParms(Sequence):
    """
    Source: https://tools.ietf.org/html/rfc3279#page-10
    """

    _fields = [
        ('seed', BitString),
        ('pgen_counter', Integer),
    ]


class DomainParameters(Sequence):
    """
    Source: https://tools.ietf.org/html/rfc3279#page-10
    """

    _fields = [
        ('p', Integer),
        ('g', Integer),
        ('q', Integer),
        ('j', Integer, {'optional': True}),
        ('validation_params', ValidationParms, {'optional': True}),
    ]


class PublicKeyAlgorithmId(ObjectIdentifier):
    """
    Original Name: None
    Source: https://tools.ietf.org/html/rfc3279
    """

    _map = {
        # https://tools.ietf.org/html/rfc3279#page-19
        '1.2.840.113549.1.1.1': 'rsa',
        # https://tools.ietf.org/html/rfc3447#page-47
        '1.2.840.113549.1.1.7': 'rsaes_oaep',
        # https://tools.ietf.org/html/rfc3279#page-18
        '1.2.840.10040.4.1': 'dsa',
        # https://tools.ietf.org/html/rfc3279#page-13
        '1.2.840.10045.2.1': 'ec',
        # https://tools.ietf.org/html/rfc3279#page-10
        '1.2.840.10046.2.1': 'dh',
    }


class PublicKeyAlgorithm(_ForceNullParameters, Sequence):
    """
    Original Name: AlgorithmIdentifier
    Source: https://tools.ietf.org/html/rfc5280#page-18
    """

    _fields = [
        ('algorithm', PublicKeyAlgorithmId),
        ('parameters', Any, {'optional': True}),
    ]

    _oid_pair = ('algorithm', 'parameters')
    _oid_specs = {
        'dsa': DSAParams,
        'ec': ECDomainParameters,
        'dh': DomainParameters,
        'rsaes_oaep': RSAESOAEPParams,
    }


class PublicKeyInfo(Sequence):
    """
    Original Name: SubjectPublicKeyInfo
    Source: https://tools.ietf.org/html/rfc5280#page-17
    """

    _fields = [
        ('algorithm', PublicKeyAlgorithm),
        ('public_key', ParsableOctetBitString),
    ]

    def _public_key_spec(self):
        algorithm = self['algorithm']['algorithm'].native
        return {
            'rsa': RSAPublicKey,
            'rsaes_oaep': RSAPublicKey,
            'dsa': Integer,
            # We override the field spec with ECPoint so that users can easily
            # decompose the byte string into the constituent X and Y coords
            'ec': (ECPointBitString, None),
            'dh': Integer,
        }[algorithm]

    _spec_callbacks = {
        'public_key': _public_key_spec
    }

    _algorithm = None
    _bit_size = None
    _fingerprint = None
    _sha1 = None
    _sha256 = None

    @classmethod
    def wrap(cls, public_key, algorithm):
        """
        Wraps a public key in a PublicKeyInfo structure

        :param public_key:
            A byte string or Asn1Value object of the public key

        :param algorithm:
            A unicode string of "rsa"

        :return:
            A PublicKeyInfo object
        """

        if not isinstance(public_key, byte_cls) and not isinstance(public_key, Asn1Value):
            raise TypeError(unwrap(
                '''
                public_key must be a byte string or Asn1Value, not %s
                ''',
                type_name(public_key)
            ))

        if algorithm != 'rsa':
            raise ValueError(unwrap(
                '''
                algorithm must "rsa", not %s
                ''',
                repr(algorithm)
            ))

        algo = PublicKeyAlgorithm()
        algo['algorithm'] = PublicKeyAlgorithmId(algorithm)
        algo['parameters'] = Null()

        container = cls()
        container['algorithm'] = algo
        if isinstance(public_key, Asn1Value):
            public_key = public_key.untag().dump()
        container['public_key'] = ParsableOctetBitString(public_key)

        return container

    def unwrap(self):
        """
        Unwraps an RSA public key into an RSAPublicKey object. Does not support
        DSA or EC public keys since they do not have an unwrapped form.

        :return:
            An RSAPublicKey object
        """

        if self.algorithm == 'rsa':
            return self['public_key'].parsed

        key_type = self.algorithm.upper()
        a_an = 'an' if key_type == 'EC' else 'a'
        raise ValueError(unwrap(
            '''
            Only RSA public keys may be unwrapped - this key is %s %s public
            key
            ''',
            a_an,
            key_type
        ))

    @property
    def curve(self):
        """
        Returns information about the curve used for an EC key

        :raises:
            ValueError - when the key is not an EC key

        :return:
            A two-element tuple, with the first element being a unicode string
            of "implicit_ca", "specified" or "named". If the first element is
            "implicit_ca", the second is None. If "specified", the second is
            an OrderedDict that is the native version of SpecifiedECDomain. If
            "named", the second is a unicode string of the curve name.
        """

        if self.algorithm != 'ec':
            raise ValueError(unwrap(
                '''
                Only EC keys have a curve, this key is %s
                ''',
                self.algorithm.upper()
            ))

        params = self['algorithm']['parameters']
        chosen = params.chosen

        if params.name == 'implicit_ca':
            value = None
        else:
            value = chosen.native

        return (params.name, value)

    @property
    def hash_algo(self):
        """
        Returns the name of the family of hash algorithms used to generate a
        DSA key

        :raises:
            ValueError - when the key is not a DSA key

        :return:
            A unicode string of "sha1" or "sha2" or None if no parameters are
            present
        """

        if self.algorithm != 'dsa':
            raise ValueError(unwrap(
                '''
                Only DSA keys are generated using a hash algorithm, this key is
                %s
                ''',
                self.algorithm.upper()
            ))

        parameters = self['algorithm']['parameters']
        if parameters.native is None:
            return None

        byte_len = math.log(parameters['q'].native, 2) / 8

        return 'sha1' if byte_len <= 20 else 'sha2'

    @property
    def algorithm(self):
        """
        :return:
            A unicode string of "rsa", "dsa" or "ec"
        """

        if self._algorithm is None:
            self._algorithm = self['algorithm']['algorithm'].native
        return self._algorithm

    @property
    def bit_size(self):
        """
        :return:
            The bit size of the public key, as an integer
        """

        if self._bit_size is None:
            if self.algorithm == 'ec':
                self._bit_size = ((len(self['public_key'].native) - 1) / 2) * 8
            else:
                if self.algorithm == 'rsa':
                    prime = self['public_key'].parsed['modulus'].native
                elif self.algorithm == 'dsa':
                    prime = self['algorithm']['parameters']['p'].native
                self._bit_size = int(math.ceil(math.log(prime, 2)))
                modulus = self._bit_size % 8
                if modulus != 0:
                    self._bit_size += 8 - modulus

        return self._bit_size

    @property
    def byte_size(self):
        """
        :return:
            The byte size of the public key, as an integer
        """

        return int(math.ceil(self.bit_size / 8))

    @property
    def sha1(self):
        """
        :return:
            The SHA1 hash of the DER-encoded bytes of this public key info
        """

        if self._sha1 is None:
            self._sha1 = hashlib.sha1(byte_cls(self['public_key'])).digest()
        return self._sha1

    @property
    def sha256(self):
        """
        :return:
            The SHA-256 hash of the DER-encoded bytes of this public key info
        """

        if self._sha256 is None:
            self._sha256 = hashlib.sha256(byte_cls(self['public_key'])).digest()
        return self._sha256

    @property
    def fingerprint(self):
        """
        Creates a fingerprint that can be compared with a private key to see if
        the two form a pair.

        This fingerprint is not compatible with fingerprints generated by any
        other software.

        :return:
            A byte string that is a sha256 hash of selected components (based
            on the key type)
        """

        if self._fingerprint is None:
            key_type = self['algorithm']['algorithm'].native
            params = self['algorithm']['parameters']

            if key_type == 'rsa':
                key = self['public_key'].parsed
                to_hash = '%d:%d' % (
                    key['modulus'].native,
                    key['public_exponent'].native,
                )

            elif key_type == 'dsa':
                key = self['public_key'].parsed
                to_hash = '%d:%d:%d:%d' % (
                    params['p'].native,
                    params['q'].native,
                    params['g'].native,
                    key.native,
                )

            elif key_type == 'ec':
                key = self['public_key']

                if params.name == 'named':
                    to_hash = '%s:' % params.chosen.native
                    to_hash = to_hash.encode('utf-8')
                    to_hash += key.native

                elif params.name == 'implicit_ca':
                    to_hash = key.native

                elif params.name == 'specified':
                    to_hash = '%s:' % params.chosen['field_id']['parameters'].native
                    to_hash = to_hash.encode('utf-8')
                    to_hash += b':' + params.chosen['curve']['a'].native
                    to_hash += b':' + params.chosen['curve']['b'].native
                    to_hash += key.native

            if isinstance(to_hash, str_cls):
                to_hash = to_hash.encode('utf-8')

            self._fingerprint = hashlib.sha256(to_hash).digest()

        return self._fingerprint
