// BLS12-381 F_r field arithmetics. F_r - the scalar field of the BLS12-381 elliptic curve (where r
// is the size of a subgroup of the curve).

from starkware.cairo.common.uint256 import Uint256

// The base of the representation (see BigInt3 below).
const BASE = 2 ** 86;

// BLS_PRIME = 0x73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001
//   = P0 + P1 * BASE + P2 * BASE**2.
const P0 = 75387840085786938186924033;
const P1 = 38837452686214984973159423;
const P2 = 8759297294429794443932573;

// Represents a BLS12-381 field element.
//
// The field element is represented as: d0 + d1 * BASE + d2 * BASE**2, and doesn't have to be
// reduced modulo BLS_PRIME.
// Each limb (d_i) is not restricted to the range [0, BASE), and in particular can be negative.
struct BigInt3 {
    d0: felt,
    d1: felt,
    d2: felt,
}

// Multiplies two field elements modulo the BLS12-381 curve subgroup size r.
// Arguments:
//   a, b - the two BigInt3 to operate on.
//
// Returns:
//   (a * b) % r as BigInt3.
//
// Assumption: each limb of a, b is in the range (-2**104, 2**104).
// Guarantee: each limb of the result is in the range [0, 3 * BASE).
func reduced_mul{range_check_ptr}(a: BigInt3, b: BigInt3) -> BigInt3 {
    alloc_locals;

    // Find res and q, such that:
    //   res = a * b (mod BLS_PRIME)
    //   q = a * b // BLS_PRIME.
    local q: BigInt3;
    local res: BigInt3;
    %{
        from starkware.starknet.core.os.data_availability.bls_utils import BLS_PRIME, pack, split

        a = pack(ids.a, PRIME)
        b = pack(ids.b, PRIME)

        q, r = divmod(a * b, BLS_PRIME)

        # By the assumption: |a|, |b| < 2**104 * ((2**86) ** 2 + 2**86 + 1) < 2**276.001.
        # Therefore |q| <= |ab| / BLS_PRIME < 2**299.
        # Hence the absolute value of the high limb of split(q) < 2**127.
        segments.write_arg(ids.q.address_, split(q))
        segments.write_arg(ids.res.address_, split(r))
    %}

    // Check that res.d0, res.d1, res.d2 are each is in the range [0, 3 * BASE):
    assert [range_check_ptr] = res.d0;
    assert [range_check_ptr + 1] = res.d1;
    assert [range_check_ptr + 2] = res.d2;
    // The maximal possible sum of the limbs, assuming each of them is in the range [0, BASE).
    const MAX_SUM = 3 * (BASE - 1);
    assert [range_check_ptr + 3] = (res.d0 + res.d1 + res.d2) + (2 ** 128 - 1 - MAX_SUM);

    // Check that q.d0, q.d1, q.d2 are each in the range [-2 ** 127, 2 ** 127).
    assert [range_check_ptr + 4] = q.d0 + 2 ** 127;
    assert [range_check_ptr + 5] = q.d1 + 2 ** 127;
    assert [range_check_ptr + 6] = q.d2 + 2 ** 127;

    // Verify that a*b - q*BLS_PRIME - res == 0 (as integers).
    // This is done by computing the limbs of (a*b - q*BLS_PRIME - res), and checking that all the
    // limbs are 0.

    tempvar r0 = (a.d0 * b.d0 - q.d0 * P0 - res.d0) / BASE;
    // Consider the dividend of the division above as d0. Therefore: limb_0 = d0 % BASE.
    // The following range check, combined with the previous checks on q and res and the assumption
    // regarding a and b, implies that r0 * BASE = d0 (as integers).
    // This means that d0 is divisible by BASE, and therefore limb_0 = 0.
    assert [range_check_ptr + 7] = r0 + 2 ** 127;

    tempvar r1 = (a.d1 * b.d0 + a.d0 * b.d1 - q.d1 * P0 - q.d0 * P1 - res.d1 + r0) / BASE;
    // Similarly, the next range check implies that limb_1 = 0 (and the same for the other
    // limbs below).
    assert [range_check_ptr + 8] = r1 + 2 ** 127;

    tempvar r2 = (
        a.d2 * b.d0 + a.d1 * b.d1 + a.d0 * b.d2 - q.d2 * P0 - q.d1 * P1 - q.d0 * P2 - res.d2 + r1
    ) / BASE;
    assert [range_check_ptr + 9] = r2 + 2 ** 127;

    tempvar r3 = (a.d2 * b.d1 + a.d1 * b.d2 - q.d2 * P1 - q.d1 * P2 + r2) / BASE;
    assert [range_check_ptr + 10] = r3 + 2 ** 127;

    // r4 = a.d2 * b.d2 - q.d2 * P2 + r3 is limb_4, which should be 0.
    assert a.d2 * b.d2 + r3 = q.d2 * P2;

    let range_check_ptr = range_check_ptr + 11;
    return res;
}

// Evaluates the polynomial f at the given point 'point', i.e.:
//   f(point) = c_0 + c_1*point + ... + c_{n-1}*(point**(n-1)). (c_i = coefficient[i]).
//
// Assumption: each limb of point is in the range [0, BASE).
// Guarantee: each limb of res is in the range [0, 4 * BASE).
func horner_eval{range_check_ptr}(
    n_coefficients: felt, coefficients: felt*, point: BigInt3
) -> BigInt3 {
    if (n_coefficients == 0) {
        return (BigInt3(0, 0, 0));
    }

    alloc_locals;

    let n_minus_one_res = horner_eval(
        n_coefficients=n_coefficients - 1, coefficients=&coefficients[1], point=point
    );
    let inter_product = reduced_mul(a=n_minus_one_res, b=point);
    let c0 = felt_to_bigint3(value=coefficients[0]);
    return (
        BigInt3(
            d0=inter_product.d0 + c0.d0, d1=inter_product.d1 + c0.d1, d2=inter_product.d2 + c0.d2
        )
    );
}

// Converts a felt to a BigInt3.
//
// Guarantee: each limb of res is in the range [0, BASE).
func felt_to_bigint3{range_check_ptr}(value: felt) -> BigInt3 {
    alloc_locals;

    // The high limb of the Cairo field prime.
    const PRIME_HIGH = (-1) / BASE ** 2;

    if (value == -1) {
        // This is the only case where the high limb of the result is exactly PRIME_HIGH.
        return (BigInt3(d0=0, d1=0, d2=PRIME_HIGH));
    }

    local res: BigInt3;
    %{
        from starkware.starknet.core.os.data_availability.bls_utils import split

        segments.write_arg(ids.res.address_, split(ids.value))
    %}

    // Verify that res == value (mod Cairo field prime).
    assert value = res.d2 * (BASE ** 2) + res.d1 * BASE + res.d0;

    // The following range checks ensure res does not overflow.

    // Check that res.d2 is in the range [0, PRIME_HIGH).
    assert [range_check_ptr] = res.d2;
    assert [range_check_ptr + 1] = res.d2 + 2 ** 128 - PRIME_HIGH;

    // Check that res.d1 and res.d0 are each in the range [0, BASE).
    assert [range_check_ptr + 2] = res.d1;
    assert [range_check_ptr + 3] = res.d1 + 2 ** 128 - BASE;
    assert [range_check_ptr + 4] = res.d0;
    assert [range_check_ptr + 5] = res.d0 + 2 ** 128 - BASE;
    let range_check_ptr = range_check_ptr + 6;

    return res;
}

// Converts a BigInt3 instance into a Uint256.
//
// Assumptions:
// * The limbs of value are in the range [0, BASE * 3).
// * value is in the range [0, 2 ** 256).
func bigint3_to_uint256{range_check_ptr}(value: BigInt3) -> Uint256 {
    let low = [range_check_ptr];
    let high = [range_check_ptr + 1];

    // Guess the low part of the result. This is done by taking the 128 LSB of value.
    %{ ids.low = (ids.value.d0 + ids.value.d1 * ids.BASE) & ((1 << 128) - 1) %}

    // Verify that low is indeed the 128 LSB of (value.d0 + value.d1 * BASE). This is done by
    // checking that the following division doesn't overflow.
    tempvar a = ((value.d0 + value.d1 * BASE) - low) / 2 ** 128;

    // 'a' should be in the range [0, 2 ** 46), since (value.d0 + value.d1 * BASE) < 2 ** 174.
    assert [range_check_ptr + 2] = a;
    assert [range_check_ptr + 3] = a + 2 ** 128 - 2 ** 46;
    let range_check_ptr = range_check_ptr + 4;

    const D2_SHIFT = BASE * BASE / 2 ** 128;
    with_attr error_message("value out of range") {
        assert high = a + value.d2 * D2_SHIFT;
    }

    return (Uint256(low=low, high=high));
}
