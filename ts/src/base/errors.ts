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
class BadResponse extends ExchangeError {
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
class CancelPending extends InvalidOrder {
    constructor (message: string) {
        super (message);
        this.name = 'CancelPending';
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
class ProxyError extends ExchangeError {
    constructor (message: string) {
        super (message);
        this.name = 'ProxyError';
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
class RequestTimeout extends NetworkError {
    constructor (message: string) {
        super (message);
        this.name = 'RequestTimeout';
    }
}

export { BaseError, ExchangeError, AuthenticationError, PermissionDenied, AccountNotEnabled, AccountSuspended, ArgumentsRequired, BadRequest, BadSymbol, OperationRejected, NoChange, MarginModeAlreadySet, MarketClosed, BadResponse, NullResponse, InsufficientFunds, InvalidAddress, AddressPending, InvalidOrder, OrderNotFound, OrderNotCached, CancelPending, OrderImmediatelyFillable, OrderNotFillable, DuplicateOrderId, ContractUnavailable, NotSupported, ProxyError, ExchangeClosedByUser, OperationFailed, NetworkError, DDoSProtection, RateLimitExceeded, ExchangeNotAvailable, OnMaintenance, InvalidNonce, RequestTimeout };

export default { BaseError, ExchangeError, AuthenticationError, PermissionDenied, AccountNotEnabled, AccountSuspended, ArgumentsRequired, BadRequest, BadSymbol, OperationRejected, NoChange, MarginModeAlreadySet, MarketClosed, BadResponse, NullResponse, InsufficientFunds, InvalidAddress, AddressPending, InvalidOrder, OrderNotFound, OrderNotCached, CancelPending, OrderImmediatelyFillable, OrderNotFillable, DuplicateOrderId, ContractUnavailable, NotSupported, ProxyError, ExchangeClosedByUser, OperationFailed, NetworkError, DDoSProtection, RateLimitExceeded, ExchangeNotAvailable, OnMaintenance, InvalidNonce, RequestTimeout };
