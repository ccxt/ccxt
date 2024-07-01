import contextlib
import dataclasses
import logging
import operator
from enum import Enum, auto
from types import TracebackType
from typing import Any, Callable, Dict, List, Optional, Type

import marshmallow

symbol_to_function = {"!=": operator.ne, "==": operator.eq, ">": operator.gt, ">=": operator.ge}


class ErrorCode(Enum):
    """
    Base class of all error code enums.
    Do not add enum members to this class, only functionality.
    See: https://docs.python.org/3/library/enum.html#restricted-enum-subclassing.
    """


class StarkErrorCode(ErrorCode):
    #: Api function temporarily disabled.
    API_FUNCTION_TEMPORARILY_DISABLED = 0
    #: Batch was aborted.
    BATCH_ABORTED = auto()
    #: Batch creation failure; batch currently cannot be created.
    BATCH_CREATION_FAILURE = auto()
    #: Batch is full; there will be no additional attempt to insert any transactions.
    BATCH_FULL = auto()
    #: Batch not ready to be created; does not indicate an error.
    BATCH_NOT_READY = auto()
    #: Connection error with the node (for example, Infura too many requests).
    CONNECTION_ERROR = auto()
    #: Connection error with a client.
    CONNECTION_RESET_ERROR = auto()
    #: Duplicate order.
    DUPLICATE_ORDER = auto()
    #: Multi-Transaction with zero transactions.
    EMPTY_TRANSACTIONS_LIST_IN_MULTI_TRANSACTION = auto()
    #: Fact not registered in fact registry.
    FACT_NOT_REGISTERED = auto()
    #: Not enough onchain balance to complete deposit.
    INSUFFICIENT_ONCHAIN_BALANCE = auto()
    #: Invalid batch ID.
    INVALID_BATCH_ID = auto()
    #: Batch migration information is invalid.
    INVALID_BATCH_MIGRATION_INFO = auto()
    #: Invalid committee claim hash.
    INVALID_CLAIM_HASH = auto()
    #: Invalid committee member key.
    INVALID_COMMITTEE_MEMBER = auto()
    #: StarkEx contracts information missing or corrupt.
    INVALID_CONTRACT_ADDRESS = auto()
    #: StarkEx contracts returns invalid response.
    INVALID_CONTRACT_RESPONSE = auto()
    #: StarkEx deployment information missing or corrupt.
    INVALID_DEPLOYMENT_INFO = auto()
    #: Invalid eth address.
    INVALID_ETH_ADDRESS = auto()
    #: Fact is not 32 bytes length.
    INVALID_FACT = auto()
    #: Fee taken is too high.
    INVALID_FEE_TAKEN = auto()
    #: Invalid multi asset trade.
    INVALID_MULTI_ASSET_TRADE = auto()
    #: Invalid multi transaction.
    INVALID_MULTI_TRANSACTION = auto()
    #: Invalid order ID.
    INVALID_ORDER_ID = auto()
    #: Invalid order type.
    INVALID_ORDER_TYPE = auto()
    #: Invalid HTTP request.
    INVALID_REQUEST = auto()
    #: Invalid HTTP request parameters.
    INVALID_REQUEST_PARAMETERS = auto()
    #: Settlement trade amounts mismatch.
    INVALID_SETTLEMENT_INFO = auto()
    #: Settlement trade ratio not satisfied.
    INVALID_SETTLEMENT_RATIO = auto()
    #: Mismatching tokens for orders in settlement.
    INVALID_SETTLEMENT_TOKENS = auto()
    #: Invalid order signature.
    INVALID_SIGNATURE = auto()
    #: Invalid token type.
    INVALID_TOKEN_TYPE = auto()
    #: Invalid transaction.
    INVALID_TRANSACTION = auto()
    #: Invalid transaction ID.
    INVALID_TRANSACTION_ID = auto()
    #: Invalid vault.
    INVALID_VAULT = auto()
    #: Malformed request.
    MALFORMED_REQUEST = auto()
    #: Pipeline object is missing because it was migrated from an older version object.
    MIGRATED_PIPELINE_OBJECT_MISSING = auto()
    #: The chain ID does not exist in storage.
    MISSING_BLOCKCHAIN_ID = auto()
    #: The required endpoint configuration is not available in the DB.
    MISSING_ENDPOINT_CONFIGURATION = auto()
    #: One of the fee objects is missing while the other exists.
    MISSING_FEE_OBJECT = auto()
    #: Nested multi-transaction (multi-transaction inside multi-transaction)
    NESTED_MULTI_TRANSACTION = auto()
    #: The order is expired.
    ORDER_OVERDUE = auto()
    #: Amount value is out of range.
    OUT_OF_RANGE_AMOUNT = auto()
    #: Vault balance is out of range.
    OUT_OF_RANGE_BALANCE = auto()
    #: Batch ID value is out of range.
    OUT_OF_RANGE_BATCH_ID = auto()
    #: Ethereum address value is out of range.
    OUT_OF_RANGE_ETH_ADDRESS = auto()
    #: Expiration timestamp value is out of range.
    OUT_OF_RANGE_EXPIRATION_TIMESTAMP = auto()
    #: Field element value is out of range.
    OUT_OF_RANGE_FIELD_ELEMENT = auto()
    #: Forced trade nonce value is out of range.
    OUT_OF_RANGE_FORCED_TRADE_NONCE = auto()
    #: Nonce value is out of range.
    OUT_OF_RANGE_NONCE = auto()
    #: Oracle price quorum value is out of range.
    OUT_OF_RANGE_ORACLE_PRICE_QUORUM = auto()
    #: Order ID value is out of range.
    OUT_OF_RANGE_ORDER_ID = auto()
    #: Positive amount value is out of range.
    OUT_OF_RANGE_POSITIVE_AMOUNT = auto()
    #: Public key (Stark key) value is out of range.
    OUT_OF_RANGE_PUBLIC_KEY = auto()
    #: Risk factor segment upper bound is out of range.
    OUT_OF_RANGE_RISK_FACTOR_UPPER_BOUND = auto()
    #: Signature subfield is out of range.
    OUT_OF_RANGE_SIGNATURE_SUBFIELD = auto()
    #: System ID value is out of range.
    OUT_OF_RANGE_SYSTEM_ID = auto()
    #: Token ID value is out of range.
    OUT_OF_RANGE_TOKEN_ID = auto()
    #: Vault ID value is out of range.
    OUT_OF_RANGE_VAULT_ID = auto()
    #: Alternative transaction requested before for this transaction. Transaction is now valid.
    REPLACED_BEFORE = auto()
    #: Failed response for alternative transaction request.
    REQUEST_FAILED = auto()
    #: Object schema validation failed.
    SCHEMA_VALIDATION_ERROR = auto()
    #: Transaction is manually cancelled.
    TRANSACTION_CANCELLED = auto()
    #: Transaction received successfully by the gateway.
    TRANSACTION_PENDING = auto()
    TRANSACTION_RECEIVED = auto()


class WebFriendlyException(Exception):
    """
    Base class to exception classes that are exposed to the user, usually in a HTTP response body.
    """

    def __init__(self, status_code: int, body: Dict[str, Any]):
        self.status_code = status_code
        self.body = body
        super().__init__(status_code, body)


class StarkException(WebFriendlyException):
    """
    Base class to exceptions classes representing flows under the user's control (for example,
    an invalid transaction).
    """

    def __init__(self, code: ErrorCode, message: Optional[str] = None):
        self.code = code
        self.message = message
        super().__init__(status_code=400, body={"code": code, "message": message})

    def __repr__(self) -> str:
        return f"{type(self).__name__}(code={self.code}, message={self.message})"

    def __eq__(self, other: Any) -> bool:
        if not isinstance(other, StarkException):
            raise NotImplementedError

        return self.code == other.code and self.message == other.message


def stark_assert(expr: bool, *, code, message: Optional[str] = None):
    """
    Verifies that the given expression is True. If not, raises a StarkException with the given
    code and message.
    """
    if not expr:
        raise StarkException(code=code, message=message)


def stark_assert_eq(exp_val, actual_val, *, code, message: Optional[str] = None):
    """
    Verifies that the expected value is equal to the actual value, raising a StarkException with
    the appropriate code and message, where the expected and actual values are added to the message.
    """
    _stark_assert_not_symbol(exp_val, actual_val, symbol="!=", code=code, message=message)


def stark_assert_ne(exp_val, actual_val, *, code, message: Optional[str] = None):
    """
    Verifies that the expected value is not equal to the actual value, raising a StarkException
    with the appropriate code and message, where the expected and actual values are added to the
    message.
    """
    _stark_assert_not_symbol(exp_val, actual_val, symbol="==", code=code, message=message)


def stark_assert_le(exp_val, actual_val, *, code, message: Optional[str] = None):
    """
    Verifies that the expected value is less than or equal to the actual value, raising a
    StarkException with the appropriate code and message, where the expected and actual values are
    added to the message.
    """
    _stark_assert_not_symbol(exp_val, actual_val, symbol=">", code=code, message=message)


def stark_assert_lt(exp_val, actual_val, *, code, message: Optional[str] = None):
    """
    Verifies that the expected value is strictly less than the actual value, raising a
    StarkException with the appropriate code and message, where the expected and actual values are
    added to the message.
    """
    _stark_assert_not_symbol(exp_val, actual_val, symbol=">=", code=code, message=message)


def _stark_assert_not_symbol(exp_val, actual_val, symbol: str, code, message: Optional[str] = None):
    """
    Receives a symbol as a string that compares two values (e.g '==', '>') and verifies that:
    `not exp_val symbol actual_val`.

    Example:
        _stark_assert_not_symbol(3, 2, '==', code) -> Does nothing
        _stark_assert_not_symbol(3, 3, '==', code) -> Raises an exception

    the given symbol must be mapped by the dict `symbol_to_function` to a function that performs the
    symbol on two values.
    """
    MIN_HEX_SIZE = 1 << 128

    format_val = lambda val: hex(val) if isinstance(val, int) and val > MIN_HEX_SIZE else val
    if symbol_to_function[symbol](exp_val, actual_val):
        eq_log = f"{format_val(exp_val)} {symbol} {format_val(actual_val)}"
        message = f"{message}\n{eq_log}" if message else eq_log
        raise StarkException(code=code, message=message)


@contextlib.contextmanager
def wrap_with_stark_exception(
    code: ErrorCode,
    message: Optional[str] = None,
    logger: Optional[logging.Logger] = None,
    exception_types: Optional[List[Type[Exception]]] = None,
):
    """
    Wraps exceptions of types exception_types thrown in the context with StarkException.
    If exception_types are not provided, only AssertionError is wrapped.
    """
    if exception_types is None:
        exception_types = [AssertionError]

    try:
        yield
    except StarkException:
        # Raise StarkException-s as-is, so failure information is not lost.
        raise
    except tuple(exception_types) as exception:
        message = str(exception) if message is None else message
        if logger is not None:
            logger.error(message, exc_info=True)

        raise StarkException(code=code, message=message) from exception


@dataclasses.dataclass(frozen=True)
class ErrorByKey:
    key_error: str
    error: BaseException

    def __repr__(self) -> str:
        return f"{{{self.key_error}: {repr(self.error)}}}"


class ErrorCollector:
    """
    Context manager for collecting errors.

    For example:
        for tx in txs:
            with error_collector(key_error=tx.tx_id):
                # Do something that might raise an exception.
        assert len(error_collector.errors) == 0, str(error_collector.errors)
    """

    def __init__(self):
        self.errors: List[ErrorByKey] = []

    def __call__(self, key_error: str) -> "ErrorCollector":
        self._element = key_error
        return self

    def __enter__(self):
        pass

    def __exit__(
        self,
        exc_type: Optional[Type[BaseException]],
        exc_value: Optional[BaseException],
        traceback: Optional[TracebackType],
    ) -> bool:
        if exc_type is not None:
            assert exc_value is not None
            self.errors.append(ErrorByKey(key_error=self._element, error=exc_value))
        return True


def stark_exception_dominant_in_validation_error(
    stark_error_code: StarkErrorCode,
) -> Callable:
    """
    A custom error-handling function for a marshmallow schema. Raises StarkException with the given
    error code when either serialization or deserialization fails with any StarkException.
    """

    def handle_error(self, exc: marshmallow.ValidationError, data, **kwargs) -> None:
        if "StarkException" in str(exc.messages):
            raise StarkException(
                code=stark_error_code,
                message=f"Either serialization or deserialization error: {exc.messages}",
            )
        raise exc

    return handle_error
