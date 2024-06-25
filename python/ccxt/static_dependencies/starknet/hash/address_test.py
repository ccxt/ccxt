import pytest

from hash.address import (
    compute_address,
    get_checksum_address,
    is_checksum_address,
)


def test_compute_address():
    assert (
        compute_address(
            class_hash=951442054899045155353616354734460058868858519055082696003992725251069061570,
            constructor_calldata=[21, 37],
            salt=1111,
        )
        == 1357105550695717639826158786311415599375114169232402161465584707209611368775
    )


def test_compute_address_with_deployer_address():
    assert (
        compute_address(
            class_hash=951442054899045155353616354734460058868858519055082696003992725251069061570,
            constructor_calldata=[21, 37],
            salt=1111,
            deployer_address=1234,
        )
        == 3179899882984850239687045389724311807765146621017486664543269641150383510696
    )


@pytest.mark.parametrize(
    "address, checksum_address",
    [
        (
            "0x2fd23d9182193775423497fc0c472e156c57c69e4089a1967fb288a2d84e914",
            "0x02Fd23d9182193775423497fc0c472E156C57C69E4089A1967fb288A2d84e914",
        ),
        (
            "0x00abcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefab",
            "0x00AbcDefaBcdefabCDEfAbCDEfAbcdEFAbCDEfabCDefaBCdEFaBcDeFaBcDefAb",
        ),
        (
            "0xfedcbafedcbafedcbafedcbafedcbafedcbafedcbafedcbafedcbafedcbafe",
            "0x00fEdCBafEdcbafEDCbAFedCBAFeDCbafEdCBAfeDcbaFeDCbAfEDCbAfeDcbAFE",
        ),
        ("0xa", "0x000000000000000000000000000000000000000000000000000000000000000A"),
        (
            "0x0",
            "0x0000000000000000000000000000000000000000000000000000000000000000",
        ),
    ],
)
def test_get_checksum_address(address, checksum_address):
    assert get_checksum_address(address) == checksum_address


@pytest.mark.parametrize("address", ["", "0xx", "0123"])
def test_get_checksum_address_raises_on_invalid_address(address):
    with pytest.raises(ValueError):
        get_checksum_address(address)


@pytest.mark.parametrize(
    "address, is_checksum",
    [
        ("0x02Fd23d9182193775423497fc0c472E156C57C69E4089A1967fb288A2d84e914", True),
        ("0x000000000000000000000000000000000000000000000000000000000000000a", False),
    ],
)
def test_is_checksum_address(address, is_checksum):
    assert is_checksum_address(address) == is_checksum
