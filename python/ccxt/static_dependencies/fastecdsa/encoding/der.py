from struct import pack

from . import SigEncoder
from .asn1 import ASN1EncodingError, INTEGER, SEQUENCE, asn1_structure, parse_asn1_int, parse_asn1_length
from .util import bytes_to_int, int_to_bytes


class InvalidDerSignature(Exception):
    pass


class DEREncoder(SigEncoder):
    @staticmethod
    def encode_signature(r: int, s: int) -> bytes:
        """Encode an EC signature in serialized DER format as described in
           https://tools.ietf.org/html/rfc2459 (section 7.2.2) and as detailed by
           bip-0066

        Args:
            r, s

        Returns:
            bytes: The DER encoded signature

        """
        r_bytes = int_to_bytes(r)
        if r_bytes[0] & 0x80:
            r_bytes = b"\x00" + r_bytes
        s_bytes = int_to_bytes(s)
        if s_bytes[0] & 0x80:
            s_bytes = b"\x00" + s_bytes

        r_asn1 = asn1_structure(INTEGER, r_bytes)
        s_asn1 = asn1_structure(INTEGER, s_bytes)
        return asn1_structure(SEQUENCE, r_asn1 + s_asn1)

    @staticmethod
    def decode_signature(sig: bytes) -> (int, int):
        """Decode an EC signature from serialized DER format as described in
           https://tools.ietf.org/html/rfc2459 (section 7.2.2) and as detailed by
           bip-0066

           Returns (r,s)
        """
        def _validate_int_bytes(data: bytes):
            # check for negative values, indicated by leading 1 bit
            if data[0] & 0x80:
                raise InvalidDerSignature("Signature contains a negative value")

            # check for leading 0x00s that aren't there to disambiguate possible negative values
            if data[0] == 0x00 and not data[1] & 0x80:
                raise InvalidDerSignature("Invalid leading 0x00 byte in ASN.1 integer")

        # overarching structure must be a sequence
        if not sig or sig[0] != ord(SEQUENCE):
            raise InvalidDerSignature("First byte should be ASN.1 SEQUENCE")

        try:
            seqlen, sequence, leftover = parse_asn1_length(sig[1:])
        except ASN1EncodingError as asn1_error:
            raise InvalidDerSignature(asn1_error)

        # sequence should be entirety remaining data
        if leftover:
            raise InvalidDerSignature("Expected a sequence of {} bytes, got {}".format(
                seqlen, len(sequence + leftover)))

        try:
            rlen, r, sdata = parse_asn1_int(sequence)
            slen, s, _ = parse_asn1_int(sdata)
        except ASN1EncodingError as asn1_error:
            raise InvalidDerSignature(asn1_error)

        _validate_int_bytes(r)
        _validate_int_bytes(s)
        return bytes_to_int(r), bytes_to_int(s)
