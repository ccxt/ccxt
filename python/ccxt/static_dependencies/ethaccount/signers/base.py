from abc import (
    ABC,
    abstractmethod,
)

from ..datastructures import (
    SignedMessage,
)
from ..messages import (
    SignableMessage,
)


class BaseAccount(ABC):
    """
    Specify convenience methods to sign transactions and message hashes.
    """

    @property
    @abstractmethod
    def address(self):
        """
        The checksummed public address for this account.

        .. code-block:: python

            >>> my_account.address # doctest: +SKIP
            "0xF0109fC8DF283027b6285cc889F5aA624EaC1F55"

        """
        pass

    @abstractmethod
    def sign_message(self, signable_message: SignableMessage) -> SignedMessage:
        """
        Sign the EIP-191_ message.

        This uses the same structure
        as in :meth:`~eth_account.account.Account.sign_message`
        but without specifying the private key.

        :param signable_message: The encoded message, ready for signing

        .. _EIP-191: https://eips.ethereum.org/EIPS/eip-191
        """
        pass

    @abstractmethod
    def signHash(self, message_hash):
        """
        Sign the hash of a message.

        This uses the same structure
        as in :meth:`~eth_account.account.Account.signHash`
        but without specifying the private key.

        .. CAUTION:: Deprecated for
            :meth:`~eth_account.signers.base.BaseAccount.sign_message`.
            To be removed in v0.6

        :param bytes message_hash: 32 byte hash of the message to sign
        """
        pass

    @abstractmethod
    def sign_transaction(self, transaction_dict):
        """
        Sign a transaction dict.

        This uses the same structure as in
        :meth:`~eth_account.account.Account.sign_transaction`
        but without specifying the private key.

        :param dict transaction_dict: transaction with all fields specified
        """
        pass

    def __eq__(self, other):
        """
        Equality test between two accounts.

        Two accounts are considered the same if they are exactly the same type,
        and can sign for the same address.
        """
        return type(self) == type(other) and self.address == other.address

    def __hash__(self):
        return hash((type(self), self.address))
