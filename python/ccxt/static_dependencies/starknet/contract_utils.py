from typing import Optional, Tuple, Union

from common import create_casm_class
from hash.casm_class_hash import compute_casm_class_hash
from net.account.base_account import BaseAccount
from net.client import Client


def _extract_compiled_class_hash(
    compiled_contract_casm: Optional[str] = None,
    compiled_class_hash: Optional[int] = None,
) -> int:
    if compiled_class_hash is None and compiled_contract_casm is None:
        raise ValueError(
            "For Cairo 1.0 contracts, either the 'compiled_class_hash' or the 'compiled_contract_casm' "
            "argument must be provided."
        )

    if compiled_class_hash is None:
        assert compiled_contract_casm is not None
        compiled_class_hash = compute_casm_class_hash(
            create_casm_class(compiled_contract_casm)
        )

    return compiled_class_hash


def _unpack_provider(
    provider: Union[BaseAccount, Client]
) -> Tuple[Client, Optional[BaseAccount]]:
    """
    Get the client and optional account to be used by Contract.

    If provided with Client, returns this Client and None.
    If provided with BaseAccount, returns underlying Client and the account.
    """
    if isinstance(provider, Client):
        return provider, None

    if isinstance(provider, BaseAccount):
        return provider.client, provider

    raise ValueError("Argument provider is not of accepted type.")
