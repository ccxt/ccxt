from starkware.starknet.public.abi import starknet_keccak


def test_starknet_keccak():
    value = starknet_keccak(b"hello")
    assert value == 0x8AFF950685C2ED4BC3174F3472287B56D9517B9C948127319A09A7A36DEAC8
    assert value < 2**250
