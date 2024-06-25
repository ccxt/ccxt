from typing import Optional


class TransactionFailedError(Exception):
    """
    Base exception for transaction failure.
    """

    def __init__(
        self,
        message: Optional[str] = None,
    ):
        if message is None:
            message = "Unknown Starknet error."
        self.message = message
        super().__init__(self.message)

    def __str__(self):
        return f"Transaction failed with following Starknet error: {self.message}."


class TransactionRevertedError(TransactionFailedError):
    """
    Exception for transactions reverted by Starknet.
    """

    def __str__(self):
        return (
            "Transaction was reverted with following Starknet error: "
            f"{self.message}."
        )


class TransactionRejectedError(TransactionFailedError):
    """
    Exception for transactions rejected by Starknet.
    """

    def __str__(self):
        return "Transaction was rejected on Starknet."


class TransactionNotReceivedError(TransactionFailedError):
    """
    Exception for transactions not received on Starknet.
    """

    def __init__(self):
        super().__init__(message="Transaction not received.")

    def __str__(self):
        return "Transaction was not received on Starknet."
