from .base import (
    BaseAccount,
)


class LocalAccount(BaseAccount):
    r"""
    A collection of convenience methods to sign and encrypt, with an
    embedded private key.

    :var bytes key: the 32-byte private key data

    .. code-block:: python

        >>> my_local_account.address
        "0xF0109fC8DF283027b6285cc889F5aA624EaC1F55"
        >>> my_local_account.key
        b"\x01\x23..."

    You can also get the private key by casting the account to :class:`bytes`:

    .. code-block:: python

        >>> bytes(my_local_account)
        b"\\x01\\x23..."
    """

    def __init__(self, key, account):
        """
        Initialize a new account with the given private key.

        :param eth_keys.PrivateKey key: to prefill in private key execution
        :param ~eth_account.account.Account account: the key-unaware management API
        """
        self._publicapi = account

        self._address = key.public_key.to_checksum_address()

        key_raw = key.to_bytes()
        self._private_key = key_raw

        self._key_obj = key

    @property
    def address(self):
        return self._address

    @property
    def key(self):
        """
        Get the private key.
        """
        return self._private_key

    def encrypt(self, password, kdf=None, iterations=None):
        """
        Generate a string with the encrypted key.

        This uses the same structure as in
        :meth:`~eth_account.account.Account.encrypt`, but without a
        private key argument.
        """
        return self._publicapi.encrypt(
            self.key, password, kdf=kdf, iterations=iterations
        )

    def signHash(self, message_hash):
        return self._publicapi.signHash(
            message_hash,
            private_key=self.key,
        )

    def sign_message(self, signable_message):
        """
        Generate a string with the encrypted key.

        This uses the same structure as in
        :meth:`~eth_account.account.Account.sign_message`, but without a
        private key argument.
        """
        return self._publicapi.sign_message(signable_message, private_key=self.key)

    def sign_transaction(self, transaction_dict):
        return self._publicapi.sign_transaction(transaction_dict, self.key)

    def __bytes__(self):
        return self.key
