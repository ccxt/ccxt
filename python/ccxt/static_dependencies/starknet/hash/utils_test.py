# pylint: disable=line-too-long
# fmt: off
import pytest

from hash.utils import (
    compute_hash_on_elements,
    encode_uint,
    encode_uint_list,
    keccak256,
    pedersen_hash,
)


@pytest.mark.parametrize(
    "data, calculated_hash",
    (
        ([1, 2, 3, 4, 5], 3442134774288875752012730520904650962184640568595562887119811371865001706826),
        ([28, 15, 39, 74], 1457535610401978056129941705021139155249904351968558303142914517100335003071),
    ),
)
def test_compute_hash_on_elements(data, calculated_hash):
    assert compute_hash_on_elements(data) == calculated_hash


@pytest.mark.parametrize(
    "first, second, hash_",
    [
        (0, 13289654017234601382751, 1606983897751845338544875557254529092665736388485573456407652201602816719974),
        (32108945712395, 0, 2286557865806578472402728224133061485859287443532833874408098272076626850762),
        (0, 0, 2089986280348253421170679821480865132823066470938446095505822317253594081284),
        (1, 1, 1321142004022994845681377299801403567378503530250467610343381590909832171180),
        (132490123765801925, 19324857132905126, 351268190682426987433778012669634681582518614860795408913953487271166523161),
        (
            1321142004022994845681377299801403567378503530250467610343381590909832171180,
            351268190682426987433778012669634681582518614860795408913953487271166523161,
            167060788452737184339236199176292038116565645273096529093530464707363566091
         ),
    ],
)
def test_pedersen_hash(first, second, hash_):
    assert pedersen_hash(first, second) == hash_


@pytest.mark.parametrize(
    "value, expected_encoded",
    [
        (0, b"\x00" * 32),
        (1, b"\x00" * 31 + b"\x01"),
        (123456789, b"\x00" * 28 + b"\x07\x5b\xcd\x15")
    ]
)
def test_encode_uint(value, expected_encoded):
    assert encode_uint(value) == expected_encoded


@pytest.mark.parametrize(
    "value, expected_encoded",
    [
        ([], b""),
        ([1, 2, 3], b"\x00" * 31 + b"\x01" + b"\x00" * 31 + b"\x02" + b"\x00" * 31 + b"\x03"),
    ]
)
def test_encode_uint_list(value, expected_encoded):
    assert encode_uint_list(value) == expected_encoded


@pytest.mark.parametrize(
    "string, expected_hash",
    [
        ("", 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470),
        ("test", 0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658),
        ("longer test string", 0x47bed17bfbbc08d6b5a0f603eff1b3e932c37c10b865847a7bc73d55b260f32a)
    ]
)
def test_keccak256_strings(string, expected_hash):
    assert keccak256(string.encode("utf-8")) == expected_hash


@pytest.mark.parametrize(
    "value, expected_hash",
    [
        (4, 0x8a35acfbc15ff81a39ae7d344fd709f28e8600b4aa8c65c6b64bfe7fe36bd19b),
        (5, 0x036b6384b5eca791c62761152d0c79bb0604c104a5fb6f4eb0703f3154bb3db0)
    ]
)
def test_keccak256_ints(value, expected_hash):
    assert keccak256(encode_uint(value)) == expected_hash
