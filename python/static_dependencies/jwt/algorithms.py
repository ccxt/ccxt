import hashlib
import hmac
import json


from .compat import constant_time_compare, string_types
from .exceptions import InvalidKeyError
from .utils import (
    base64url_decode, base64url_encode, der_to_raw_signature,
    force_bytes, force_unicode, from_base64url_uint, raw_to_der_signature,
    to_base64url_uint
)

try:
    from cryptography.hazmat.primitives import hashes
    from cryptography.hazmat.primitives.serialization import (
        load_pem_private_key, load_pem_public_key, load_ssh_public_key
    )
    from cryptography.hazmat.primitives.asymmetric.rsa import (
        RSAPrivateKey, RSAPublicKey, RSAPrivateNumbers, RSAPublicNumbers,
        rsa_recover_prime_factors, rsa_crt_dmp1, rsa_crt_dmq1, rsa_crt_iqmp
    )
    from cryptography.hazmat.primitives.asymmetric.ec import (
        EllipticCurvePrivateKey, EllipticCurvePublicKey
    )
    from cryptography.hazmat.primitives.asymmetric import ec, padding
    from cryptography.hazmat.backends import default_backend
    from cryptography.exceptions import InvalidSignature

    has_crypto = True
except ImportError:
    has_crypto = False

requires_cryptography = set(['RS256', 'RS384', 'RS512', 'ES256', 'ES384',
                             'ES521', 'ES512', 'PS256', 'PS384', 'PS512'])


def get_default_algorithms():
    """
    Returns the algorithms that are implemented by the library.
    """
    default_algorithms = {
        'none': NoneAlgorithm(),
        'HS256': HMACAlgorithm(HMACAlgorithm.SHA256),
        'HS384': HMACAlgorithm(HMACAlgorithm.SHA384),
        'HS512': HMACAlgorithm(HMACAlgorithm.SHA512)
    }

    if has_crypto:
        default_algorithms.update({
            'RS256': RSAAlgorithm(RSAAlgorithm.SHA256),
            'RS384': RSAAlgorithm(RSAAlgorithm.SHA384),
            'RS512': RSAAlgorithm(RSAAlgorithm.SHA512),
            'ES256': ECAlgorithm(ECAlgorithm.SHA256),
            'ES384': ECAlgorithm(ECAlgorithm.SHA384),
            'ES521': ECAlgorithm(ECAlgorithm.SHA512),
            'ES512': ECAlgorithm(ECAlgorithm.SHA512),  # Backward compat for #219 fix
            'PS256': RSAPSSAlgorithm(RSAPSSAlgorithm.SHA256),
            'PS384': RSAPSSAlgorithm(RSAPSSAlgorithm.SHA384),
            'PS512': RSAPSSAlgorithm(RSAPSSAlgorithm.SHA512)
        })

    return default_algorithms


class Algorithm(object):
    """
    The interface for an algorithm used to sign and verify tokens.
    """
    def prepare_key(self, key):
        """
        Performs necessary validation and conversions on the key and returns
        the key value in the proper format for sign() and verify().
        """
        raise NotImplementedError

    def sign(self, msg, key):
        """
        Returns a digital signature for the specified message
        using the specified key value.
        """
        raise NotImplementedError

    def verify(self, msg, key, sig):
        """
        Verifies that the specified digital signature is valid
        for the specified message and key values.
        """
        raise NotImplementedError

    @staticmethod
    def to_jwk(key_obj):
        """
        Serializes a given RSA key into a JWK
        """
        raise NotImplementedError

    @staticmethod
    def from_jwk(jwk):
        """
        Deserializes a given RSA key from JWK back into a PublicKey or PrivateKey object
        """
        raise NotImplementedError


class NoneAlgorithm(Algorithm):
    """
    Placeholder for use when no signing or verification
    operations are required.
    """
    def prepare_key(self, key):
        if key == '':
            key = None

        if key is not None:
            raise InvalidKeyError('When alg = "none", key value must be None.')

        return key

    def sign(self, msg, key):
        return b''

    def verify(self, msg, key, sig):
        return False


class HMACAlgorithm(Algorithm):
    """
    Performs signing and verification operations using HMAC
    and the specified hash function.
    """
    SHA256 = hashlib.sha256
    SHA384 = hashlib.sha384
    SHA512 = hashlib.sha512

    def __init__(self, hash_alg):
        self.hash_alg = hash_alg

    def prepare_key(self, key):
        key = force_bytes(key)

        invalid_strings = [
            b'-----BEGIN PUBLIC KEY-----',
            b'-----BEGIN CERTIFICATE-----',
            b'-----BEGIN RSA PUBLIC KEY-----',
            b'ssh-rsa'
        ]

        if any([string_value in key for string_value in invalid_strings]):
            raise InvalidKeyError(
                'The specified key is an asymmetric key or x509 certificate and'
                ' should not be used as an HMAC secret.')

        return key

    @staticmethod
    def to_jwk(key_obj):
        return json.dumps({
            'k': force_unicode(base64url_encode(force_bytes(key_obj))),
            'kty': 'oct'
        })

    @staticmethod
    def from_jwk(jwk):
        obj = json.loads(jwk)

        if obj.get('kty') != 'oct':
            raise InvalidKeyError('Not an HMAC key')

        return base64url_decode(obj['k'])

    def sign(self, msg, key):
        return hmac.new(key, msg, self.hash_alg).digest()

    def verify(self, msg, key, sig):
        return constant_time_compare(sig, self.sign(msg, key))


if has_crypto:

    class RSAAlgorithm(Algorithm):
        """
        Performs signing and verification operations using
        RSASSA-PKCS-v1_5 and the specified hash function.
        """
        SHA256 = hashes.SHA256
        SHA384 = hashes.SHA384
        SHA512 = hashes.SHA512

        def __init__(self, hash_alg):
            self.hash_alg = hash_alg

        def prepare_key(self, key):
            if isinstance(key, RSAPrivateKey) or \
               isinstance(key, RSAPublicKey):
                return key

            if isinstance(key, string_types):
                key = force_bytes(key)

                try:
                    if key.startswith(b'ssh-rsa'):
                        key = load_ssh_public_key(key, backend=default_backend())
                    else:
                        key = load_pem_private_key(key, password=None, backend=default_backend())
                except ValueError:
                    key = load_pem_public_key(key, backend=default_backend())
            else:
                raise TypeError('Expecting a PEM-formatted key.')

            return key

        @staticmethod
        def to_jwk(key_obj):
            obj = None

            if getattr(key_obj, 'private_numbers', None):
                # Private key
                numbers = key_obj.private_numbers()

                obj = {
                    'kty': 'RSA',
                    'key_ops': ['sign'],
                    'n': force_unicode(to_base64url_uint(numbers.public_numbers.n)),
                    'e': force_unicode(to_base64url_uint(numbers.public_numbers.e)),
                    'd': force_unicode(to_base64url_uint(numbers.d)),
                    'p': force_unicode(to_base64url_uint(numbers.p)),
                    'q': force_unicode(to_base64url_uint(numbers.q)),
                    'dp': force_unicode(to_base64url_uint(numbers.dmp1)),
                    'dq': force_unicode(to_base64url_uint(numbers.dmq1)),
                    'qi': force_unicode(to_base64url_uint(numbers.iqmp))
                }

            elif getattr(key_obj, 'verify', None):
                # Public key
                numbers = key_obj.public_numbers()

                obj = {
                    'kty': 'RSA',
                    'key_ops': ['verify'],
                    'n': force_unicode(to_base64url_uint(numbers.n)),
                    'e': force_unicode(to_base64url_uint(numbers.e))
                }
            else:
                raise InvalidKeyError('Not a public or private key')

            return json.dumps(obj)

        @staticmethod
        def from_jwk(jwk):
            try:
                obj = json.loads(jwk)
            except ValueError:
                raise InvalidKeyError('Key is not valid JSON')

            if obj.get('kty') != 'RSA':
                raise InvalidKeyError('Not an RSA key')

            if 'd' in obj and 'e' in obj and 'n' in obj:
                # Private key
                if 'oth' in obj:
                    raise InvalidKeyError('Unsupported RSA private key: > 2 primes not supported')

                other_props = ['p', 'q', 'dp', 'dq', 'qi']
                props_found = [prop in obj for prop in other_props]
                any_props_found = any(props_found)

                if any_props_found and not all(props_found):
                    raise InvalidKeyError('RSA key must include all parameters if any are present besides d')

                public_numbers = RSAPublicNumbers(
                    from_base64url_uint(obj['e']), from_base64url_uint(obj['n'])
                )

                if any_props_found:
                    numbers = RSAPrivateNumbers(
                        d=from_base64url_uint(obj['d']),
                        p=from_base64url_uint(obj['p']),
                        q=from_base64url_uint(obj['q']),
                        dmp1=from_base64url_uint(obj['dp']),
                        dmq1=from_base64url_uint(obj['dq']),
                        iqmp=from_base64url_uint(obj['qi']),
                        public_numbers=public_numbers
                    )
                else:
                    d = from_base64url_uint(obj['d'])
                    p, q = rsa_recover_prime_factors(
                        public_numbers.n, d, public_numbers.e
                    )

                    numbers = RSAPrivateNumbers(
                        d=d,
                        p=p,
                        q=q,
                        dmp1=rsa_crt_dmp1(d, p),
                        dmq1=rsa_crt_dmq1(d, q),
                        iqmp=rsa_crt_iqmp(p, q),
                        public_numbers=public_numbers
                    )

                return numbers.private_key(default_backend())
            elif 'n' in obj and 'e' in obj:
                # Public key
                numbers = RSAPublicNumbers(
                    from_base64url_uint(obj['e']), from_base64url_uint(obj['n'])
                )

                return numbers.public_key(default_backend())
            else:
                raise InvalidKeyError('Not a public or private key')

        def sign(self, msg, key):
            return key.sign(msg, padding.PKCS1v15(), self.hash_alg())

        def verify(self, msg, key, sig):
            try:
                key.verify(sig, msg, padding.PKCS1v15(), self.hash_alg())
                return True
            except InvalidSignature:
                return False

    class ECAlgorithm(Algorithm):
        """
        Performs signing and verification operations using
        ECDSA and the specified hash function
        """
        SHA256 = hashes.SHA256
        SHA384 = hashes.SHA384
        SHA512 = hashes.SHA512

        def __init__(self, hash_alg):
            self.hash_alg = hash_alg

        def prepare_key(self, key):
            if isinstance(key, EllipticCurvePrivateKey) or \
               isinstance(key, EllipticCurvePublicKey):
                return key

            if isinstance(key, string_types):
                key = force_bytes(key)

                # Attempt to load key. We don't know if it's
                # a Signing Key or a Verifying Key, so we try
                # the Verifying Key first.
                try:
                    if key.startswith(b'ecdsa-sha2-'):
                        key = load_ssh_public_key(key, backend=default_backend())
                    else:
                        key = load_pem_public_key(key, backend=default_backend())
                except ValueError:
                    key = load_pem_private_key(key, password=None, backend=default_backend())

            else:
                raise TypeError('Expecting a PEM-formatted key.')

            return key

        def sign(self, msg, key):
            der_sig = key.sign(msg, ec.ECDSA(self.hash_alg()))

            return der_to_raw_signature(der_sig, key.curve)

        def verify(self, msg, key, sig):
            try:
                der_sig = raw_to_der_signature(sig, key.curve)
            except ValueError:
                return False

            try:
                key.verify(der_sig, msg, ec.ECDSA(self.hash_alg()))
                return True
            except InvalidSignature:
                return False

    class RSAPSSAlgorithm(RSAAlgorithm):
        """
        Performs a signature using RSASSA-PSS with MGF1
        """

        def sign(self, msg, key):
            return key.sign(
                msg,
                padding.PSS(
                    mgf=padding.MGF1(self.hash_alg()),
                    salt_length=self.hash_alg.digest_size
                ),
                self.hash_alg()
            )

        def verify(self, msg, key, sig):
            try:
                key.verify(
                    sig,
                    msg,
                    padding.PSS(
                        mgf=padding.MGF1(self.hash_alg()),
                        salt_length=self.hash_alg.digest_size
                    ),
                    self.hash_alg()
                )
                return True
            except InvalidSignature:
                return False
