# code modified from https://github.com/zambonin/alice-and-bob
# thank you @zambonin for your contributions to the open source code that is used by ccxt!

"""keccakf1600.py

Keccak is a family of hash functions based on the sponge construction. It was
chosen by NIST to become the SHA-3 standard. This code implements the
Keccak-f[1600] permutation. Detailed information about this function can be
found on the official site [1]. Original implementation [2] by the Keccak Team.

Some caveats about the implementation:
    * width `b` of permutation is fixed as 1600 (5 * 5 * 64), which means
    the number of rounds is 24 (12 + 2ℓ, ℓ = log_2(b / 25))
    * ρ step could have its offsets pre-computed as the array `r`.
    * ι step could have its round constants pre-computed as the array `RC`.

[1] http://keccak.noekeon.org/
[2] https://git.io/vKfkb
"""


def keccak_f_1600(state):
    """The inner permutation for the Keccak sponge function.

    The Keccak-f permutation is an iterated construction consisting of a
    sequence of almost identical rounds. It operates on a state array with
    each of the twenty-four rounds performing five steps, described below
    with detail.

    The loops above and below the core of the permutation are used to save and
    restore the state array to a stream of bytes, used outside the permutation.
    The original state array has three dimensions, whereas this characteristic
    can be cleverly optimized to a 5x5 matrix with 64-bit words. As such, this
    implementation makes use of this trick and stores an entire lane (a z-axis
    set of bits within the state) as a single word.

    The θ step diffuses the bits alongside the state array by calculating the
    parity of nearby columns relative to a lane.

    The ρ and π steps are merged; together, they move more bits around
    according to two alike recurrence relations.

    The χ step is similar to an S-box permutation; it makes the whole round
    non-linear with a few logic operations on bits inside a line.

    The ι step is a simple LFSR that breaks the symmetry of the rounds. It
    generates constants by doing computations according to the round number
    and its previous output, modulo polynomials over GF(2)[x].

    Args:
        state:  square matrix of order 5 that holds the input bytes.

    Returns:
        state:  bytes permuted by Keccak-f[1600].
    """

    def load64(b):
        """
        Saves each byte on its respective position within a 64-bit word.

        Args:
            b:  partial list of bytes from input.

        Returns:
            Sum of list with numbers shifted.
        """
        return sum((b[i] << (8 * i)) for i in range(8))

    def store64(a):
        """
        Transforms a 64-bit word into a list of bytes.

        Args:
            a:  64-bit word.

        Returns:
            List of bytes separated by position on the word.
        """
        return list((a >> (8 * i)) % 256 for i in range(8))

    def rotate(a, n):
        """
        Denotes the bitwise cyclic shift operation, moving bit at position
        `i` into position `i + n` (modulo the lane size).

        Args:
            a:  lane with a 64-bit word, or elements from the state array.
            n:  offset for rotation.

        Returns:
            The rotated lane.
        """
        return ((a >> (64 - (n % 64))) + (a << (n % 64))) % (1 << 64)

    A = [[0 for _ in range(5)] for _ in range(5)]
    for x in range(5):
        for y in range(5):
            i = 8 * (x + 5 * y)
            A[x][y] = load64(state[i : i + 8])

    R = 1
    for _ in range(24):
        C = [A[x][0] ^ A[x][1] ^ A[x][2] ^ A[x][3] ^ A[x][4] for x in range(5)]
        D = [C[(x - 1) % 5] ^ rotate(C[(x + 1) % 5], 1) for x in range(5)]
        A = [[A[x][y] ^ D[x] for y in range(5)] for x in range(5)]

        x, y, current = 1, 0, A[1][0]
        for t in range(24):
            x, y = y, (2 * x + 3 * y) % 5
            offset = ((t + 1) * (t + 2)) // 2
            current, A[x][y] = A[x][y], rotate(current, offset)

        for y in range(5):
            T = [A[x][y] for x in range(5)]
            for x in range(5):
                A[x][y] = T[x] ^ ((~T[(x + 1) % 5]) & T[(x + 2) % 5])

        for j in range(7):
            R = ((R << 1) ^ ((R >> 7) * 0x71)) % 256
            if R & 2:
                A[0][0] ^= 1 << ((1 << j) - 1)

    for x in range(5):
        for y in range(5):
            i = 8 * (x + 5 * y)
            state[i : i + 8] = store64(A[x][y])

    return state


def Keccak(r, c, _input, suffix, output_len):
    """
    The general sponge function, consisting of the inner permutation and a
    padding rule (`pad10*1`). It consists of three main parts.
        * absorbing, where the input will be permuted repeatedly every time
            it is divided into a block of size `r + c`.
        * padding, where an oddly sized last block will be filled with bits
            until it can be fed into the permutation.
        * squeezing, where the output's blocks will be permuted more times
            until they are concatenated to the desired size.

    Args:
        r:          rate, or the number of input bits processed or output bits
                    generated per invocation of the underlying function
        c:          capacity, or the width of the underlying function minus
                    the rate
        _input:     list of bytes containing the desired object to be hashed
        suffix:     distinguishes the inputs arising from SHA-3/SHAKE functions
        output_len: length of hash output.

    Returns:
        Hash of the input bytes.
    """
    state = bytearray((r + c) // 8)
    rate_bytes, block, offset = r // 8, 0, 0

    while offset < len(_input):
        block = min(len(_input) - offset, rate_bytes)
        for i in range(block):
            state[i] ^= _input[i + offset]
        offset += block
        if block == rate_bytes:
            state = keccak_f_1600(state)
            block = 0

    state[block] ^= suffix
    if (suffix & 0x80) and (block == (rate_bytes - 1)):
        state = keccak_f_1600(state)
    state[rate_bytes - 1] ^= 0x80
    state = keccak_f_1600(state)

    output = bytearray()
    while output_len:
        block = min(output_len, rate_bytes)
        output += state[:block]
        output_len -= block
        if output_len:
            state = keccak_f_1600(state)

    return output


def SHA3(_input):
    """
    FIPS 202 generalized instance of the SHA-3 hash function.

    Args:
        size:   instance of desired SHA3 algorithm.
        _input: list of bytes to compute a hash from.

    Returns:
        Instance of the Keccak permutation that calculates the hash.
    """
    size = 256
    # https://www.cybertest.com/blog/keccak-vs-sha3
    padding = 0x01  # change this to 0x06 for NIST sha3
    return Keccak(1600 - size * 2, size * 2, _input, padding, size // 8)
