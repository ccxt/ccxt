from typing import Optional, Union

from net.client_models import Hash, Tag
from net.models import AddressRepresentation


class ClientError(Exception):
    """
    Base class for all errors raised while attempting to communicate with Starknet through Client.
    """

    def __init__(
        self, message: str, code: Optional[str] = None, data: Optional[str] = None
    ):
        self.code = code
        self.data = data
        self.message = (
            f"Client failed{f' with code {code}' if code is not None else ''}. "
            f"Message: {message}.{f' Data: {data}' if data is not None else ''}"
        )

        super().__init__(self.message)


class ContractNotFoundError(ClientError):
    """
    Requested contract was not found.
    """

    def __init__(
        self,
        address: AddressRepresentation,
        block_hash: Optional[Hash] = None,
        block_number: Optional[Union[int, Tag]] = None,
    ):
        is_identifier = block_hash is not None or block_number is not None
        identifier = block_hash or block_number
        identifier_name = "block_hash" if block_hash else "block_number"

        message = f"No contract with address {address} found"
        block_info = (
            f" for block with {identifier_name}: {identifier}" if is_identifier else ""
        )
        full_message = message + block_info

        super().__init__(message=full_message)
