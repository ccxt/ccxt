from typing import Dict

from web3 import Web3, eth  # Noqa.

web3_api_new_to_old: Dict[str, str] = {
    "to_checksum_address": "toChecksumAddress",
    "is_checksum_address": "isChecksumAddress",
    "is_connected": "isConnected",
    "solidity_keccak": "solidityKeccak",
    "client_version": "clientVersion",
    "toJSON": "to_json",
    "toWei": "to_wei",
}


def web3_type_fix():
    web3_type_fix_over_version6_generic()


def web3_type_fix_over_version6_generic():
    for api in web3_api_new_to_old.keys():
        if not hasattr(Web3, api):
            setattr(Web3, api, getattr(Web3, web3_api_new_to_old[api]))


def web3_contract_event_fix(event):
    if not hasattr(event, "create_filter"):
        event.create_filter = event.createFilter
    if not hasattr(event, "process_receipt"):
        event.process_receipt = event.processReceipt


web3_type_fix()
