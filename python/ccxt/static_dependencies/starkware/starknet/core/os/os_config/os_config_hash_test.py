from starkware.cairo.common.cairo_function_runner import CairoFunctionRunner
from starkware.cairo.common.structs import CairoStructFactory
from starkware.python.random_test_utils import random_test
from starkware.starknet.core.os.os_config.os_config_hash import (
    STARKNET_OS_CONFIG_HASH_VERSION,
    calculate_starknet_config_hash,
)
from starkware.starknet.core.os.os_config.test_utils import run_starknet_os_config_hash_test
from starkware.starknet.core.os.os_program import get_os_program
from starkware.starknet.definitions import fields
from starkware.starknet.definitions.general_config import STARKNET_LAYOUT_INSTANCE, StarknetOsConfig


@random_test()
def test_get_starknet_config_hash(seed: int):
    """
    Tests the consistency between the Cairo implementation and the python one.
    """
    os_program = get_os_program()

    config_version = os_program.get_const(
        name="starkware.starknet.core.os.os_config.os_config.STARKNET_OS_CONFIG_VERSION",
        full_name_lookup=True,
    )
    assert config_version == STARKNET_OS_CONFIG_HASH_VERSION

    runner = CairoFunctionRunner(os_program, layout=STARKNET_LAYOUT_INSTANCE.layout_name)
    starknet_os_config = StarknetOsConfig(
        deprecated_fee_token_address=fields.AddressField.get_random_value(),
        fee_token_address=fields.AddressField.get_random_value(),
    )
    structs = CairoStructFactory(
        identifiers=os_program.identifiers,
        additional_imports=[
            "starkware.starknet.core.os.os_config.os_config.StarknetOsConfig",
        ],
    ).structs
    runner.run(
        "starkware.starknet.core.os.os_config.os_config.get_starknet_os_config_hash",
        hash_ptr=runner.pedersen_builtin.base,
        starknet_os_config=structs.StarknetOsConfig(
            chain_id=starknet_os_config.chain_id,
            deprecated_fee_token_address=starknet_os_config.deprecated_fee_token_address,
            fee_token_address=starknet_os_config.fee_token_address,
        ),
        use_full_name=True,
        verify_secure=True,
    )
    pedersen_ptr, starknet_config_hash = runner.get_return_values(2)
    assert pedersen_ptr == runner.pedersen_builtin.base + (
        (2 + structs.StarknetOsConfig.size) * runner.pedersen_builtin.cells_per_instance
    )
    assert starknet_config_hash == calculate_starknet_config_hash(
        starknet_os_config=starknet_os_config
    )


def test_reference_config_hash():
    run_starknet_os_config_hash_test(fix=False)


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Create or test the StarkNet OS config hash.")
    parser.add_argument(
        "--fix", action="store_true", help="Fix the value of the StarkNet OS config hash."
    )

    args = parser.parse_args()
    run_starknet_os_config_hash_test(fix=args.fix)


if __name__ == "__main__":
    main()
