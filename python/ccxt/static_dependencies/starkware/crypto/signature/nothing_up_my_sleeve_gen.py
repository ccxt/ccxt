###############################################################################
# Copyright 2019 StarkWare Industries Ltd.                                    #
#                                                                             #
# Licensed under the Apache License, Version 2.0 (the "License").             #
# You may not use this file except in compliance with the License.            #
# You may obtain a copy of the License at                                     #
#                                                                             #
# https://www.starkware.co/open-source-license/                               #
#                                                                             #
# Unless required by applicable law or agreed to in writing,                  #
# software distributed under the License is distributed on an "AS IS" BASIS,  #
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.    #
# See the License for the specific language governing permissions             #
# and limitations under the License.                                          #
###############################################################################


"""
Running this script is a heavy process, and it is provided only
for verification of the hash and signature scheme parameters generation process integrity.
The output of this file is kept in 'pedersen_params.json', and 'signature.py' uses it.
"""

import json
import math
import os

from math_utils import ec_double, is_quad_residue, pi_as_string, sqrt_mod

# Field parameters.
# Field prime chosen to be an arbitrary prime which is:
# (a) large,
# (b) has a big multiplicative subgroup of size which is a power of two,
# (c) sparse representation for efficient modular arithmetics.
FIELD_PRIME = 2**251 + 17 * 2**192 + 1

# Generator of the multiplicative group of the field.
FIELD_GEN = 3

# Elliptic curve parameters.
ALPHA = 1
EC_ORDER = 0x800000000000010FFFFFFFFFFFFFFFFB781126DCAE7B2321E66A241ADC64D2F


############################
# Parameters and constants #
############################


def generate_constant_points(n_points):
    """
    Generates points from the curve y^2 = x^3 + x + beta over GF(FIELD_PRIME) where beta and the
    points are generated from the digits of pi.
    """
    # The required number of decimal digits is 76 * (1 + n_points). Add 100 digits to avoid
    # rounding.
    pi_str = pi_as_string(digits=76 * (1 + n_points) + 100)
    # Choose the first beta, starting from a "random" number, which gives a valid curve.
    # A curve is valid if: it's order is prime and it is not singular.
    # A sage code to reproduce 379 (the lowest number producing a valid beta):
    # ```
    # FIELD_PRIME = 2**251 + 17 * 2**192 + 1
    # F = GF(FIELD_PRIME)
    # alpha = 1
    # for i in range(1000):
    #     beta = int(str(pi.n(digits=100)).replace('.', '')[:76]) + i
    #     E = EllipticCurve([F(alpha), F(beta)])
    #     if is_prime(E.order()):
    #         print i
    #         break
    # ```
    beta = int(pi_str[:76]) + 379
    constant_points = []
    i = 0
    while len(constant_points) < n_points:
        i += 1
        x = int(pi_str[i * 76 : (i + 1) * 76])
        while True:
            y_squared = x**3 + ALPHA * x + beta
            if is_quad_residue(y_squared, FIELD_PRIME):
                y = sqrt_mod(y_squared, FIELD_PRIME)
                break
            x += 1
        P = [x % FIELD_PRIME, y % FIELD_PRIME]
        if i <= 2:
            constant_points.append(P)
            continue
        for _ in range(248 if i % 2 == 1 else 4):
            constant_points.append(P)
            P = list(ec_double(P, ALPHA, FIELD_PRIME))
    return beta, constant_points


N_INPUTS = 2
N_ELEMENT_BITS = math.ceil(math.log(FIELD_PRIME, 2))
assert N_ELEMENT_BITS == 252

N_SHIFT_POINTS = 1  # The same shift point is used in the hash and ECDSA.
N_ECDSA_POINTS = 1
N_HASH_POINTS = N_INPUTS * N_ELEMENT_BITS

print("Generating points, this may take a while...")
BETA, CONSTANT_POINTS = generate_constant_points(N_SHIFT_POINTS + N_ECDSA_POINTS + N_HASH_POINTS)
assert BETA == 0x6F21413EFBE40DE150E596D72F7A8C5609AD26C15C915C1F4CDFCB99CEE9E89

COPYRIGHT_STRING = """\
###############################################################################
# Copyright 2019 StarkWare Industries Ltd.                                    #
#                                                                             #
# Licensed under the Apache License, Version 2.0 (the 'License').             #
# You may not use this file except in compliance with the License.            #
# You may obtain a copy of the License at                                     #
#                                                                             #
# https://www.starkware.co/open-source-license/                               #
#                                                                             #
# Unless required by applicable law or agreed to in writing,                  #
# software distributed under the License is distributed on an 'AS IS' BASIS,  #
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.    #
# See the License for the specific language governing permissions             #
# and limitations under the License.                                          #
###############################################################################
"""

AUTO_GENERATED_STRING = "The following data was auto-generated. PLEASE DO NOT EDIT."

# Write generated parameters to file.
PEDERSEN_HASH_POINT_FILENAME = os.path.join(os.path.dirname(__file__), "pedersen_params.json")
open(PEDERSEN_HASH_POINT_FILENAME, "w").write(
    json.dumps(
        {
            "_license": COPYRIGHT_STRING.splitlines(),
            "_comment": AUTO_GENERATED_STRING,
            "FIELD_PRIME": FIELD_PRIME,
            "FIELD_GEN": FIELD_GEN,
            "EC_ORDER": EC_ORDER,
            "ALPHA": ALPHA,
            "BETA": BETA,
            "CONSTANT_POINTS": CONSTANT_POINTS,
        },
        indent=4,
    )
)
