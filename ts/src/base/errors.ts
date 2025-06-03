/* eslint-disable max-classes-per-file */

class BaseError extends Error {
    constructor (message: string) {
        super (message);
        this.name = 'BaseError';
    }
}
class ExchangeError extends BaseError {
    constructor (message: string) {
        super (message);
        this.name = 'ExchangeError';
    }
}
class AuthenticationError extends ExchangeError {
    constructor (message: string) {
        super (message);
        this.name = 'AuthenticationError';
    }
}
class PermissionDenied extends AuthenticationError {
    constructor (message: string) {
        super (message);
        this.name = 'PermissionDenied';
    }
}
class AccountNotEnabled extends PermissionDenied {
    constructor (message: string) {
        super (message);
        this.name = 'AccountNotEnabled';
    }
}
class AccountSuspended extends AuthenticationError {
    constructor (message: string) {
        super (message);
        this.name = 'AccountSuspended';
    }
}
class ArgumentsRequired extends ExchangeError {
    constructor (message: string) {
        super (message);
        this.name = 'ArgumentsRequired';
    }
}
class BadRequest extends ExchangeError {
    constructor (message: string) {
        super (message);
        this.name = 'BadRequest';
    }
}
class BadSymbol extends BadRequest {
    constructor (message: string) {
        super (message);
        this.name = 'BadSymbol';
    }
}
class OperationRejected extends ExchangeError {
    constructor (message: string) {
        super (message);
        this.name = 'OperationRejected';
    }
}
class NoChange extends OperationRejected {
    constructor (message: string) {
        super (message);
        this.name = 'NoChange';
    }
}
class MarginModeAlreadySet extends NoChange {
    constructor (message: string) {
        super (message);
        this.name = 'MarginModeAlreadySet';
    }
}
class MarketClosed extends OperationRejected {
    constructor (message: string) {
        super (message);
        this.name = 'MarketClosed';
    }
}
class ManualInteractionNeeded extends OperationRejected {
    constructor (message: string) {
        super (message);
        this.name = 'ManualInteractionNeeded';
    }
}
class InsufficientFunds extends ExchangeError {
    constructor (message: string) {
        super (message);
        this.name = 'InsufficientFunds';
    }
}
class InvalidAddress extends ExchangeError {
    constructor (message: string) {
        super (message);
        this.name = 'InvalidAddress';
    }
}
class AddressPending extends InvalidAddress {
    constructor (message: string) {
        super (message);
        this.name = 'AddressPending';
    }
}
class InvalidOrder extends ExchangeError {
    constructor (message: string) {
        super (message);
        this.name = 'InvalidOrder';
    }
}
class OrderNotFound extends InvalidOrder {
    constructor (message: string) {
        super (message);
        this.name = 'OrderNotFound';
    }
}
class OrderNotCached extends InvalidOrder {
    constructor (message: string) {
        super (message);
        this.name = 'OrderNotCached';
    }
}
class OrderImmediatelyFillable extends InvalidOrder {
    constructor (message: string) {
        super (message);
        this.name = 'OrderImmediatelyFillable';
    }
}
class OrderNotFillable extends InvalidOrder {
    constructor (message: string) {
        super (message);
        this.name = 'OrderNotFillable';
    }
}
class DuplicateOrderId extends InvalidOrder {
    constructor (message: string) {
        super (message);
        this.name = 'DuplicateOrderId';
    }
}
class ContractUnavailable extends InvalidOrder {
    constructor (message: string) {
        super (message);
        this.name = 'ContractUnavailable';
    }
}
class NotSupported extends ExchangeError {
    constructor (message: string) {
        super (message);
        this.name = 'NotSupported';
    }
}
class InvalidProxySettings extends ExchangeError {
    constructor (message: string) {
        super (message);
        this.name = 'InvalidProxySettings';
    }
}
class ExchangeClosedByUser extends ExchangeError {
    constructor (message: string) {
        super (message);
        this.name = 'ExchangeClosedByUser';
    }
}
class OperationFailed extends BaseError {
    constructor (message: string) {
        super (message);
        this.name = 'OperationFailed';
    }
}
class NetworkError extends OperationFailed {
    constructor (message: string) {
        super (message);
        this.name = 'NetworkError';
    }
}
class DDoSProtection extends NetworkError {
    constructor (message: string) {
        super (message);
        this.name = 'DDoSProtection';
    }
}
class RateLimitExceeded extends NetworkError {
    constructor (message: string) {
        super (message);
        this.name = 'RateLimitExceeded';
    }
}
class ExchangeNotAvailable extends NetworkError {
    constructor (message: string) {
        super (message);
        this.name = 'ExchangeNotAvailable';
    }
}
class OnMaintenance extends ExchangeNotAvailable {
    constructor (message: string) {
        super (message);
        this.name = 'OnMaintenance';
    }
}
class InvalidNonce extends NetworkError {
    constructor (message: string) {
        super (message);
        this.name = 'InvalidNonce';
    }
}
class ChecksumError extends InvalidNonce {
    constructor (message: string) {
        super (message);
        this.name = 'ChecksumError';
    }
}
class RequestTimeout extends NetworkError {
    constructor (message: string) {
        super (message);
        this.name = 'RequestTimeout';
    }
}
class BadResponse extends OperationFailed {
    constructor (message: string) {
        super (message);
        this.name = 'BadResponse';
    }
}
class NullResponse extends BadResponse {
    constructor (message: string) {
        super (message);
        this.name = 'NullResponse';
    }
}
class CancelPending extends OperationFailed {
    constructor (message: string) {
        super (message);
        this.name = 'CancelPending';
    }
}
class UnsubscribeError extends BaseError {
    constructor (message: string) {
        super (message);
        this.name = 'UnsubscribeError';
    }
}

export { BaseError, ExchangeError, AuthenticationError, PermissionDenied, AccountNotEnabled, AccountSuspended, ArgumentsRequired, BadRequest, BadSymbol, OperationRejected, NoChange, MarginModeAlreadySet, MarketClosed, ManualInteractionNeeded, InsufficientFunds, InvalidAddress, AddressPending, InvalidOrder, OrderNotFound, OrderNotCached, OrderImmediatelyFillable, OrderNotFillable, DuplicateOrderId, ContractUnavailable, NotSupported, InvalidProxySettings, ExchangeClosedByUser, OperationFailed, NetworkError, DDoSProtection, RateLimitExceeded, ExchangeNotAvailable, OnMaintenance, InvalidNonce, ChecksumError, RequestTimeout, BadResponse, NullResponse, CancelPending, UnsubscribeError };

export default { BaseError, ExchangeError, AuthenticationError, PermissionDenied, AccountNotEnabled, AccountSuspended, ArgumentsRequired, BadRequest, BadSymbol, OperationRejected, NoChange, MarginModeAlreadySet, MarketClosed, ManualInteractionNeeded, InsufficientFunds, InvalidAddress, AddressPending, InvalidOrder, OrderNotFound, OrderNotCached, OrderImmediatelyFillable, OrderNotFillable, DuplicateOrderId, ContractUnavailable, NotSupported, InvalidProxySettings, ExchangeClosedByUser, OperationFailed, NetworkError, DDoSProtection, RateLimitExceeded, ExchangeNotAvailable, OnMaintenance, InvalidNonce, ChecksumError, RequestTimeout, BadResponse, NullResponse, CancelPending, UnsubscribeError };
