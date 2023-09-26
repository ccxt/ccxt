'''
RFC 6979:
    Deterministic Usage of the Digital Signature Algorithm (DSA) and
    Elliptic Curve Digital Signature Algorithm (ECDSA)

    http://tools.ietf.org/html/rfc6979

Many thanks to Coda Hale for his implementation in Go language:
    https://github.com/codahale/rfc6979
'''

import hmac
from binascii import hexlify
from .util import number_to_string, number_to_string_crop
from six import b


def bit_length(num):
    # http://docs.python.org/dev/library/stdtypes.html#int.bit_length
    s = bin(num)  # binary representation:  bin(-37) --> '-0b100101'
    s = s.lstrip('-0b')  # remove leading zeros and minus sign
    return len(s)  # len('100101') --> 6


def bits2int(data, qlen):
    x = int(hexlify(data), 16)
    l = len(data) * 8

    if l > qlen:
        return x >> (l - qlen)
    return x


def bits2octets(data, order):
    z1 = bits2int(data, bit_length(order))
    z2 = z1 - order

    if z2 < 0:
        z2 = z1

    return number_to_string_crop(z2, order)


# https://tools.ietf.org/html/rfc6979#section-3.2
def generate_k(order, secexp, hash_func, data, retry_gen=0, extra_entropy=b''):
    '''
        order - order of the DSA generator used in the signature
        secexp - secure exponent (private key) in numeric form
        hash_func - reference to the same hash function used for generating hash
        data - hash in binary form of the signing data
        retry_gen - int - how many good 'k' values to skip before returning
        extra_entropy - extra added data in binary form as per section-3.6 of
            rfc6979
    '''

    qlen = bit_length(order)
    holen = hash_func().digest_size
    rolen = (qlen + 7) / 8
    bx = number_to_string(secexp, order) + bits2octets(data, order) + \
        extra_entropy

    # Step B
    v = b('\x01') * holen

    # Step C
    k = b('\x00') * holen

    # Step D

    k = hmac.new(k, v + b('\x00') + bx, hash_func).digest()

    # Step E
    v = hmac.new(k, v, hash_func).digest()

    # Step F
    k = hmac.new(k, v + b('\x01') + bx, hash_func).digest()

    # Step G
    v = hmac.new(k, v, hash_func).digest()

    # Step H
    while True:
        # Step H1
        t = b('')

        # Step H2
        while len(t) < rolen:
            v = hmac.new(k, v, hash_func).digest()
            t += v

        # Step H3
        secret = bits2int(t, qlen)

        if secret >= 1 and secret < order:
            if retry_gen <= 0:
                return secret
            else:
                retry_gen -= 1

        k = hmac.new(k, v + b('\x00'), hash_func).digest()
        v = hmac.new(k, v, hash_func).digest()
