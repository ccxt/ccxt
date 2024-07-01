import os
from dataclasses import field

import marshmallow_dataclass

from services.everest.definitions.general_config import EverestGeneralConfig
from starkware.cairo.lang.instances import starknet_instance, starknet_with_keccak_instance
from starkware.python.utils import from_bytes
from starkware.starknet.definitions import fields
from starkware.starknet.definitions.chain_ids import StarknetChainId
from starkware.starknet.definitions.constants import VERSIONED_CONSTANTS
from starkware.starkware_utils.config_base import Config, load_config
from starkware.starkware_utils.marshmallow_dataclass_fields import (
    RequiredBoolean,
    additional_metadata,
    load_int_value,
)

GENERAL_CONFIG_FILE_NAME = "general_config.yml"
DOCKER_GENERAL_CONFIG_PATH = os.path.join("/", GENERAL_CONFIG_FILE_NAME)
GENERAL_CONFIG_PATH = os.path.join(os.path.dirname(__file__), GENERAL_CONFIG_FILE_NAME)
N_STEPS_RESOURCE = "n_steps"
N_STEPS_WITH_KECCAK_RESOURCE = "n_steps_with_keccak"
STATE_DIFF_SIZE_WEIGHT_NAME = "state_diff_size"
STATE_DIFF_SIZE_WITH_KZG_WEIGHT_NAME = "state_diff_size_with_kzg"
STARKNET_LAYOUT_INSTANCE_WITHOUT_KECCAK = starknet_instance
STARKNET_LAYOUT_INSTANCE = starknet_with_keccak_instance

# Reference to the default general config.
default_general_config = load_config(
    config_file_path=GENERAL_CONFIG_PATH, load_logging_config=False
)


# Fee token account constants.
TOKEN_NAME = from_bytes(b"Wrapped Ether")
TOKEN_SYMBOL = from_bytes(b"WETH")
TOKEN_DECIMALS = 18
ETH_TOKEN_SALT = 0
STRK_TOKEN_SALT = 1


# Default configuration values.

DEFAULT_CHAIN_ID = StarknetChainId.TESTNET.value
DEFAULT_DEPRECATED_FEE_TOKEN_ADDRESS = load_int_value(
    field_metadata=fields.fee_token_address_metadata,
    value=default_general_config["starknet_os_config"]["deprecated_fee_token_address"],
)
DEFAULT_FEE_TOKEN_ADDRESS = load_int_value(
    field_metadata=fields.fee_token_address_metadata,
    value=default_general_config["starknet_os_config"]["fee_token_address"],
)
DEFAULT_SEQUENCER_ADDRESS = load_int_value(
    field_metadata=fields.fee_token_address_metadata,
    value=default_general_config["sequencer_address"],
)
DEFAULT_ENFORCE_L1_FEE = True
DEFAULT_USE_KZG_DA = True

# Given in units of wei.
DEFAULT_DEPRECATED_L1_GAS_PRICE = 10**11
DEFAULT_DEPRECATED_L1_DATA_GAS_PRICE = 10**5

DEFAULT_ETH_IN_FRI = 10**21
DEFAULT_MIN_FRI_L1_GAS_PRICE = 10**6
DEFAULT_MAX_FRI_L1_GAS_PRICE = 10**18
DEFAULT_MIN_FRI_L1_DATA_GAS_PRICE = 10**5
DEFAULT_MAX_FRI_L1_DATA_GAS_PRICE = 10**17


# Configuration schema definition.


@marshmallow_dataclass.dataclass(frozen=True)
class StarknetOsConfig(Config):
    chain_id: int = field(default=DEFAULT_CHAIN_ID)

    deprecated_fee_token_address: int = field(
        metadata=additional_metadata(
            **fields.fee_token_address_metadata, description="Starknet old fee token L2 address."
        ),
        default=DEFAULT_DEPRECATED_FEE_TOKEN_ADDRESS,
    )

    fee_token_address: int = field(
        metadata=additional_metadata(
            **fields.fee_token_address_metadata, description="Starknet fee token L2 address."
        ),
        default=DEFAULT_FEE_TOKEN_ADDRESS,
    )


@marshmallow_dataclass.dataclass(frozen=True)
class GasPriceBounds:
    min_wei_l1_gas_price: int = field(
        metadata=fields.gas_price, default=DEFAULT_DEPRECATED_L1_GAS_PRICE
    )

    min_fri_l1_gas_price: int = field(
        metadata=fields.gas_price, default=DEFAULT_MIN_FRI_L1_GAS_PRICE
    )

    max_fri_l1_gas_price: int = field(
        metadata=fields.gas_price, default=DEFAULT_MAX_FRI_L1_GAS_PRICE
    )

    min_wei_l1_data_gas_price: int = field(
        metadata=fields.gas_price, default=DEFAULT_DEPRECATED_L1_DATA_GAS_PRICE
    )

    min_fri_l1_data_gas_price: int = field(
        metadata=fields.gas_price, default=DEFAULT_MIN_FRI_L1_DATA_GAS_PRICE
    )

    max_fri_l1_data_gas_price: int = field(
        metadata=fields.gas_price, default=DEFAULT_MAX_FRI_L1_DATA_GAS_PRICE
    )


@marshmallow_dataclass.dataclass(frozen=True)
class StarknetGeneralConfig(EverestGeneralConfig):
    starknet_os_config: StarknetOsConfig = field(default_factory=StarknetOsConfig)

    gas_price_bounds: GasPriceBounds = field(default_factory=GasPriceBounds)

    invoke_tx_max_n_steps: int = field(
        metadata=fields.invoke_tx_n_steps_metadata,
        default=VERSIONED_CONSTANTS.invoke_tx_max_n_steps,
    )

    # IMPORTANT: when editing this in production, make sure to only decrease the value.
    # Increasing it in production may cause issue to nodes during execution, so only increase it
    # during a new release.
    validate_max_n_steps: int = field(
        metadata=fields.validate_n_steps_metadata, default=VERSIONED_CONSTANTS.validate_max_n_steps
    )

    # The default price of one ETH (10**18 Wei) in STRK units. Used in case of oracle failure.
    default_eth_price_in_fri: int = field(
        metadata=fields.eth_price_in_fri, default=DEFAULT_ETH_IN_FRI
    )

    constant_gas_price: bool = field(
        metadata=additional_metadata(
            marshmallow_field=RequiredBoolean(),
            description=(
                "If true, sets ETH gas price and STRK gas price to their minimum price "
                "configurations, regardless of the sampled gas prices."
            ),
        ),
        default=False,
    )

    sequencer_address: int = field(
        metadata=additional_metadata(
            **fields.sequencer_address_metadata, description="Starknet sequencer address."
        ),
        default=DEFAULT_SEQUENCER_ADDRESS,
    )

    enforce_l1_handler_fee: bool = field(
        metadata=additional_metadata(
            marshmallow_field=RequiredBoolean(), description="Enabler for L1 fee enforcement."
        ),
        default=DEFAULT_ENFORCE_L1_FEE,
    )

    use_kzg_da: bool = field(
        metadata=additional_metadata(
            marshmallow_field=RequiredBoolean(),
            description="Enabler for using KZG commitment scheme in created blocks.",
        ),
        default=DEFAULT_USE_KZG_DA,
    )

    @property
    def chain_id(self) -> StarknetChainId:
        return StarknetChainId(self.starknet_os_config.chain_id)

    @property
    def deprecated_fee_token_address(self) -> int:
        return self.starknet_os_config.deprecated_fee_token_address

    @property
    def fee_token_address(self) -> int:
        return self.starknet_os_config.fee_token_address

    @property
    def min_wei_l1_gas_price(self) -> int:
        return self.gas_price_bounds.min_wei_l1_gas_price

    @property
    def min_fri_l1_gas_price(self) -> int:
        return self.gas_price_bounds.min_fri_l1_gas_price

    @property
    def max_fri_l1_gas_price(self) -> int:
        return self.gas_price_bounds.max_fri_l1_gas_price

    @property
    def min_wei_l1_data_gas_price(self) -> int:
        return self.gas_price_bounds.min_wei_l1_data_gas_price

    @property
    def min_fri_l1_data_gas_price(self) -> int:
        return self.gas_price_bounds.min_fri_l1_data_gas_price

    @property
    def max_fri_l1_data_gas_price(self) -> int:
        return self.gas_price_bounds.max_fri_l1_data_gas_price
