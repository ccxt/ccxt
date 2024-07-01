import dataclasses
from dataclasses import field
from typing import Any, Dict, List, Optional

import marshmallow_dataclass
from marshmallow.decorators import pre_load

from starkware.cairo.lang.version import __version__ as STARKNET_VERSION
from starkware.starknet.definitions import fields
from starkware.starknet.definitions.error_codes import StarknetErrorCode
from starkware.starknet.definitions.general_config import (
    DEFAULT_DEPRECATED_L1_DATA_GAS_PRICE,
    DEFAULT_DEPRECATED_L1_GAS_PRICE,
    DEFAULT_MIN_FRI_L1_DATA_GAS_PRICE,
    DEFAULT_MIN_FRI_L1_GAS_PRICE,
    DEFAULT_SEQUENCER_ADDRESS,
    DEFAULT_USE_KZG_DA,
)
from starkware.starkware_utils.error_handling import stark_assert_eq, stark_assert_le
from starkware.starkware_utils.validated_dataclass import ValidatedMarshmallowDataclass


def rename_old_gas_price_fields(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Pre-0.13.0, there was a "gas_price" field, with the current gas price in Wei.
    Pre-0.13.1, there were "eth_l1_gas_price" and "strk_l1_gas_price" fields, with the current
    gas prices in Wei and Fri respectively.
    Post-0.13.1, there are "l1_gas_price" and "l1_data_gas_price" fields, each with the current
    gas or data gas prices in Wei and Fri respectively.
    """

    def _add_default_data_gas_prices(data: Dict[str, Any]):
        data["l1_data_gas_price"] = dict(price_in_wei=hex(1), price_in_fri=hex(1))

    if "gas_price" in data:
        # Pre-0.13.0 block (no STRK price, no data gas).
        data["l1_gas_price"] = dict(price_in_wei=data.pop("gas_price"), price_in_fri=hex(0))
        _add_default_data_gas_prices(data=data)
    elif "eth_l1_gas_price" in data:
        # Pre-0.13.1 block (no data gas).
        assert "strk_l1_gas_price" in data, "Malformed pre-0.13.1 block."
        data["l1_gas_price"] = dict(
            price_in_wei=data.pop("eth_l1_gas_price"),
            price_in_fri=data.pop("strk_l1_gas_price"),
        )
        _add_default_data_gas_prices(data=data)
    elif "l1_gas_price" in data:
        # 0.13.1 blocks. No need to change the fields.
        pass
    else:
        # Older blocks.
        assert "strk_l1_gas_price" not in data, "Malformed pre-0.13.1 block."
        data["l1_gas_price"] = dict(price_in_wei=hex(1), price_in_fri=hex(1))
        _add_default_data_gas_prices(data=data)

    return data


@marshmallow_dataclass.dataclass(frozen=True)
class ResourcePrice:
    price_in_wei: int = field(metadata=fields.gas_price_metadata)
    price_in_fri: int = field(metadata=fields.gas_price_metadata)


@dataclasses.dataclass(frozen=True)
class GasPrices:
    """
    Values of all gas prices.
    """

    l1_gas_price_wei: int
    l1_gas_price_fri: int
    l1_data_gas_price_wei: int
    l1_data_gas_price_fri: int


@marshmallow_dataclass.dataclass(frozen=True)
class BlockInfo(ValidatedMarshmallowDataclass):
    # The sequence number of the last block created.
    block_number: int = field(metadata=fields.block_number_metadata)

    # Timestamp of the beginning of the last block creation attempt.
    block_timestamp: int = field(metadata=fields.timestamp_metadata)

    # L1 gas price measured at the beginning of the last block creation attempt.
    l1_gas_price: ResourcePrice

    # L1 data gas price measured at the beginning of the last block creation attempt.
    l1_data_gas_price: ResourcePrice

    # The sequencer address of this block.
    sequencer_address: Optional[int] = field(metadata=fields.optional_sequencer_address_metadata)

    # The version of Starknet system (e.g., "0.13.1").
    starknet_version: Optional[str] = field(metadata=fields.starknet_version_metadata)

    # Indicates whether to use KZG commitment scheme for the block's Data Avilability.
    use_kzg_da: bool = field(metadata=fields.use_kzg_da_metadata)

    @pre_load
    def rename_old_gas_price_fields(
        self, data: Dict[str, Any], many: bool, **kwargs
    ) -> Dict[str, List[str]]:
        return rename_old_gas_price_fields(data=data)

    @classmethod
    def empty(cls, sequencer_address: Optional[int], use_kzg_da: bool) -> "BlockInfo":
        """
        Returns an empty BlockInfo object; i.e., the one before the first in the chain.
        """
        return cls(
            block_number=-1,
            block_timestamp=0,
            # As gas prices must be non-zero, just use 1 for all prices.
            l1_gas_price=ResourcePrice(price_in_wei=1, price_in_fri=1),
            l1_data_gas_price=ResourcePrice(price_in_wei=1, price_in_fri=1),
            sequencer_address=sequencer_address,
            starknet_version=STARKNET_VERSION,
            use_kzg_da=use_kzg_da,
        )

    @classmethod
    def create_for_testing(
        cls,
        block_number: int,
        block_timestamp: int,
        eth_l1_gas_price: int = DEFAULT_DEPRECATED_L1_GAS_PRICE,
        strk_l1_gas_price: int = DEFAULT_MIN_FRI_L1_GAS_PRICE,
        eth_l1_data_gas_price: int = DEFAULT_DEPRECATED_L1_DATA_GAS_PRICE,
        strk_l1_data_gas_price: int = DEFAULT_MIN_FRI_L1_DATA_GAS_PRICE,
        sequencer_address: int = DEFAULT_SEQUENCER_ADDRESS,
        starknet_version: str = STARKNET_VERSION,
        use_kzg_da: bool = DEFAULT_USE_KZG_DA,
    ) -> "BlockInfo":
        """
        Returns a BlockInfo object with default gas_price.
        """
        return cls(
            block_number=block_number,
            block_timestamp=block_timestamp,
            l1_gas_price=ResourcePrice(
                price_in_wei=eth_l1_gas_price, price_in_fri=strk_l1_gas_price
            ),
            l1_data_gas_price=ResourcePrice(
                price_in_wei=eth_l1_data_gas_price, price_in_fri=strk_l1_data_gas_price
            ),
            sequencer_address=sequencer_address,
            starknet_version=starknet_version,
            use_kzg_da=use_kzg_da,
        )

    def validate_legal_progress(self, next_block_info: "BlockInfo"):
        """
        Validates that next_block_info is a legal progress of self.
        """
        # Check that the block number increases by 1.
        stark_assert_eq(
            next_block_info.block_number,
            self.block_number + 1,
            code=StarknetErrorCode.INVALID_BLOCK_NUMBER,
            message="Block number must increase by 1.",
        )

        # Check that block timestamp in not decreasing.
        stark_assert_le(
            self.block_timestamp,
            next_block_info.block_timestamp,
            code=StarknetErrorCode.INVALID_BLOCK_TIMESTAMP,
            message="Block timestamp must not decrease.",
        )

    def gas_prices(self) -> GasPrices:
        return GasPrices(
            l1_gas_price_wei=self.l1_gas_price.price_in_wei,
            l1_gas_price_fri=self.l1_gas_price.price_in_fri,
            l1_data_gas_price_wei=self.l1_data_gas_price.price_in_wei,
            l1_data_gas_price_fri=self.l1_data_gas_price.price_in_fri,
        )
