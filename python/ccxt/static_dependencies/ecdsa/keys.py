import binascii

from . import ecdsa
from . import der
from . import rfc6979
from .curves import NIST192p, find_curve
from .ecdsa import RSZeroError
from .util import string_to_number, number_to_string, randrange
from .util import sigencode_string, sigdecode_string
from .util import oid_ecPublicKey, encoded_oid_ecPublicKey
from hashlib import sha1


class BadSignatureError(Exception):
    pass


class BadDigestError(Exception):
    pass


class VerifyingKey:
    def __init__(self, _error__please_use_generate=None):
        if not _error__please_use_generate:
            raise TypeError("Please use VerifyingKey.generate() to "
                            "construct me")

    @classmethod
    def from_public_point(klass, point, curve=NIST192p, hashfunc=sha1):
        self = klass(_error__please_use_generate=True)
        self.curve = curve
        self.default_hashfunc = hashfunc
        self.pubkey = ecdsa.Public_key(curve.generator, point)
        self.pubkey.order = curve.order
        return self

    @classmethod
    def from_string(klass, string, curve=NIST192p, hashfunc=sha1,
                    validate_point=True):
        order = curve.order
        assert (len(string) == curve.verifying_key_length), \
               (len(string), curve.verifying_key_length)
        xs = string[:curve.baselen]
        ys = string[curve.baselen:]
        assert len(xs) == curve.baselen, (len(xs), curve.baselen)
        assert len(ys) == curve.baselen, (len(ys), curve.baselen)
        x = string_to_number(xs)
        y = string_to_number(ys)
        if validate_point:
            assert ecdsa.point_is_valid(curve.generator, x, y)
        from . import ellipticcurve
        point = ellipticcurve.Point(curve.curve, x, y, order)
        return klass.from_public_point(point, curve, hashfunc)

    @classmethod
    def from_pem(klass, string):
        return klass.from_der(der.unpem(string))

    @classmethod
    def from_der(klass, string):
        # [[oid_ecPublicKey,oid_curve], point_str_bitstring]
        s1, empty = der.remove_sequence(string)
        if empty != b'':
            raise der.UnexpectedDER("trailing junk after DER pubkey: %s" %
                                    binascii.hexlify(empty))
        s2, point_str_bitstring = der.remove_sequence(s1)
        # s2 = oid_ecPublicKey,oid_curve
        oid_pk, rest = der.remove_object(s2)
        oid_curve, empty = der.remove_object(rest)
        if empty != b'':
            raise der.UnexpectedDER("trailing junk after DER pubkey objects: %s" %
                                    binascii.hexlify(empty))
        assert oid_pk == oid_ecPublicKey, (oid_pk, oid_ecPublicKey)
        curve = find_curve(oid_curve)
        point_str, empty = der.remove_bitstring(point_str_bitstring)
        if empty != b'':
            raise der.UnexpectedDER("trailing junk after pubkey pointstring: %s" %
                                    binascii.hexlify(empty))
        assert point_str.startswith(b'\x00\x04')
        return klass.from_string(point_str[2:], curve)

    @classmethod
    def from_public_key_recovery(klass, signature, data, curve, hashfunc=sha1, sigdecode=sigdecode_string):
        # Given a signature and corresponding message this function
        # returns a list of verifying keys for this signature and message

        digest = hashfunc(data).digest()
        return klass.from_public_key_recovery_with_digest(signature, digest, curve, hashfunc=sha1, sigdecode=sigdecode)

    @classmethod
    def from_public_key_recovery_with_digest(klass, signature, digest, curve, hashfunc=sha1, sigdecode=sigdecode_string):
        # Given a signature and corresponding digest this function
        # returns a list of verifying keys for this signature and message

        generator = curve.generator
        r, s = sigdecode(signature, generator.order())
        sig = ecdsa.Signature(r, s)

        digest_as_number = string_to_number(digest)
        pks = sig.recover_public_keys(digest_as_number, generator)

        # Transforms the ecdsa.Public_key object into a VerifyingKey
        verifying_keys = [klass.from_public_point(pk.point, curve, hashfunc) for pk in pks]
        return verifying_keys

    def to_string(self):
        # VerifyingKey.from_string(vk.to_string()) == vk as long as the
        # curves are the same: the curve itself is not included in the
        # serialized form
        order = self.pubkey.order
        x_str = number_to_string(self.pubkey.point.x(), order)
        y_str = number_to_string(self.pubkey.point.y(), order)
        return x_str + y_str

    def to_pem(self):
        return der.topem(self.to_der(), "PUBLIC KEY")

    def to_der(self):
        order = self.pubkey.order
        x_str = number_to_string(self.pubkey.point.x(), order)
        y_str = number_to_string(self.pubkey.point.y(), order)
        point_str = b'\x00\x04' + x_str + y_str
        return der.encode_sequence(der.encode_sequence(encoded_oid_ecPublicKey,
                                                       self.curve.encoded_oid),
                                   der.encode_bitstring(point_str))

    def verify(self, signature, data, hashfunc=None, sigdecode=sigdecode_string):
        hashfunc = hashfunc or self.default_hashfunc
        digest = hashfunc(data).digest()
        return self.verify_digest(signature, digest, sigdecode)

    def verify_digest(self, signature, digest, sigdecode=sigdecode_string):
        if len(digest) > self.curve.baselen:
            raise BadDigestError("this curve (%s) is too short "
                                 "for your digest (%d)" % (self.curve.name,
                                                           8 * len(digest)))
        number = string_to_number(digest)
        r, s = sigdecode(signature, self.pubkey.order)
        sig = ecdsa.Signature(r, s)
        if self.pubkey.verifies(number, sig):
            return True
        raise BadSignatureError


class SigningKey:
    def __init__(self, _error__please_use_generate=None):
        if not _error__please_use_generate:
            raise TypeError("Please use SigningKey.generate() to construct me")

    @classmethod
    def generate(klass, curve=NIST192p, entropy=None, hashfunc=sha1):
        secexp = randrange(curve.order, entropy)
        return klass.from_secret_exponent(secexp, curve, hashfunc)

    # to create a signing key from a short (arbitrary-length) seed, convert
    # that seed into an integer with something like
    # secexp=util.randrange_from_seed__X(seed, curve.order), and then pass
    # that integer into SigningKey.from_secret_exponent(secexp, curve)

    @classmethod
    def from_secret_exponent(klass, secexp, curve=NIST192p, hashfunc=sha1):
        self = klass(_error__please_use_generate=True)
        self.curve = curve
        self.default_hashfunc = hashfunc
        self.baselen = curve.baselen
        n = curve.order
        assert 1 <= secexp < n
        pubkey_point = curve.generator * secexp
        pubkey = ecdsa.Public_key(curve.generator, pubkey_point)
        pubkey.order = n
        self.verifying_key = VerifyingKey.from_public_point(pubkey_point, curve,
                                                            hashfunc)
        self.privkey = ecdsa.Private_key(pubkey, secexp)
        self.privkey.order = n
        return self

    @classmethod
    def from_string(klass, string, curve=NIST192p, hashfunc=sha1):
        assert len(string) == curve.baselen, (len(string), curve.baselen)
        secexp = string_to_number(string)
        return klass.from_secret_exponent(secexp, curve, hashfunc)

    @classmethod
    def from_pem(klass, string, hashfunc=sha1):
        # the privkey pem file has two sections: "EC PARAMETERS" and "EC
        # PRIVATE KEY". The first is redundant.
        if isinstance(string, str):
            string = string.encode()
        privkey_pem = string[string.index(b'-----BEGIN EC PRIVATE KEY-----'):]
        return klass.from_der(der.unpem(privkey_pem), hashfunc)

    @classmethod
    def from_der(klass, string, hashfunc=sha1):
        # SEQ([int(1), octetstring(privkey),cont[0], oid(secp224r1),
        #      cont[1],bitstring])
        s, empty = der.remove_sequence(string)
        if empty != b'':
            raise der.UnexpectedDER("trailing junk after DER privkey: %s" %
                                    binascii.hexlify(empty))
        one, s = der.remove_integer(s)
        if one != 1:
            raise der.UnexpectedDER("expected '1' at start of DER privkey,"
                                    " got %d" % one)
        privkey_str, s = der.remove_octet_string(s)
        tag, curve_oid_str, s = der.remove_constructed(s)
        if tag != 0:
            raise der.UnexpectedDER("expected tag 0 in DER privkey,"
                                    " got %d" % tag)
        curve_oid, empty = der.remove_object(curve_oid_str)
        if empty != b'':
            raise der.UnexpectedDER("trailing junk after DER privkey "
                                    "curve_oid: %s" % binascii.hexlify(empty))
        curve = find_curve(curve_oid)

        # we don't actually care about the following fields
        #
        # tag, pubkey_bitstring, s = der.remove_constructed(s)
        # if tag != 1:
        #     raise der.UnexpectedDER("expected tag 1 in DER privkey, got %d"
        #                             % tag)
        # pubkey_str = der.remove_bitstring(pubkey_bitstring)
        # if empty != "":
        #     raise der.UnexpectedDER("trailing junk after DER privkey "
        #                             "pubkeystr: %s" % binascii.hexlify(empty))

        # our from_string method likes fixed-length privkey strings
        if len(privkey_str) < curve.baselen:
            privkey_str = b'\x00' * (curve.baselen - len(privkey_str)) + privkey_str
        return klass.from_string(privkey_str, curve, hashfunc)

    def to_string(self):
        secexp = self.privkey.secret_multiplier
        s = number_to_string(secexp, self.privkey.order)
        return s

    def to_pem(self):
        # TODO: "BEGIN ECPARAMETERS"
        return der.topem(self.to_der(), "EC PRIVATE KEY")

    def to_der(self):
        # SEQ([int(1), octetstring(privkey),cont[0], oid(secp224r1),
        #      cont[1],bitstring])
        encoded_vk = b'\x00\x04' + self.get_verifying_key().to_string()
        return der.encode_sequence(der.encode_integer(1),
                                   der.encode_octet_string(self.to_string()),
                                   der.encode_constructed(0, self.curve.encoded_oid),
                                   der.encode_constructed(1, der.encode_bitstring(encoded_vk)),
                                   )

    def get_verifying_key(self):
        return self.verifying_key

    def sign_deterministic(self, data, hashfunc=None,
                           sigencode=sigencode_string,
                           extra_entropy=b''):
        hashfunc = hashfunc or self.default_hashfunc
        digest = hashfunc(data).digest()

        return self.sign_digest_deterministic(
            digest, hashfunc=hashfunc, sigencode=sigencode,
            extra_entropy=extra_entropy)

    def sign_digest_deterministic(self, digest, hashfunc=None,
                                  sigencode=sigencode_string,
                                  extra_entropy=b''):
        """
        Calculates 'k' from data itself, removing the need for strong
        random generator and producing deterministic (reproducible) signatures.
        See RFC 6979 for more details.
        """
        secexp = self.privkey.secret_multiplier

        def simple_r_s(r, s, order, v):
            return r, s, order, v

        retry_gen = 0
        while True:
            k = rfc6979.generate_k(
                self.curve.generator.order(), secexp, hashfunc, digest,
                retry_gen=retry_gen, extra_entropy=extra_entropy)
            try:
                r, s, order, v = self.sign_digest(digest, sigencode=simple_r_s, k=k)
                break
            except RSZeroError:
                retry_gen += 1

        return sigencode(r, s, order, v)

    def sign(self, data, entropy=None, hashfunc=None, sigencode=sigencode_string, k=None):
        """
        hashfunc= should behave like hashlib.sha1 . The output length of the
        hash (in bytes) must not be longer than the length of the curve order
        (rounded up to the nearest byte), so using SHA256 with nist256p is
        ok, but SHA256 with nist192p is not. (In the 2**-96ish unlikely event
        of a hash output larger than the curve order, the hash will
        effectively be wrapped mod n).

        Use hashfunc=hashlib.sha1 to match openssl's -ecdsa-with-SHA1 mode,
        or hashfunc=hashlib.sha256 for openssl-1.0.0's -ecdsa-with-SHA256.
        """

        hashfunc = hashfunc or self.default_hashfunc
        h = hashfunc(data).digest()
        return self.sign_digest(h, entropy, sigencode, k)

    def sign_digest(self, digest, entropy=None, sigencode=sigencode_string, k=None):
        if len(digest) > self.curve.baselen:
            raise BadDigestError("this curve (%s) is too short "
                                 "for your digest (%d)" % (self.curve.name,
                                                           8 * len(digest)))
        number = string_to_number(digest)
        r, s, v = self.sign_number(number, entropy, k)
        return sigencode(r, s, self.privkey.order, v)

    def sign_number(self, number, entropy=None, k=None):
        # returns a pair of numbers
        order = self.privkey.order
        # privkey.sign() may raise RuntimeError in the amazingly unlikely
        # (2**-192) event that r=0 or s=0, because that would leak the key.
        # We could re-try with a different 'k', but we couldn't test that
        # code, so I choose to allow the signature to fail instead.

        # If k is set, it is used directly. In other cases
        # it is generated using entropy function
        if k is not None:
            _k = k
        else:
            _k = randrange(order, entropy)

        assert 1 <= _k < order
        sig = self.privkey.sign(number, _k)
        return sig.r, sig.s, sig.recovery_param
