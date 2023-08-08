declare class BaseError extends Error {
    constructor(message: any);
}
declare class ExchangeError extends Error {
    constructor(message: any);
}
declare class AuthenticationError extends ExchangeError {
    constructor(message: any);
}
declare class PermissionDenied extends ExchangeError {
    constructor(message: any);
}
declare class AccountNotEnabled extends ExchangeError {
    constructor(message: any);
}
declare class AccountSuspended extends ExchangeError {
    constructor(message: any);
}
declare class ArgumentsRequired extends ExchangeError {
    constructor(message: any);
}
declare class BadRequest extends ExchangeError {
    constructor(message: any);
}
declare class BadSymbol extends BadRequest {
    constructor(message: any);
}
declare class NoChange extends BadRequest {
    constructor(message: any);
}
declare class MarginModeAlreadySet extends NoChange {
    constructor(message: any);
}
declare class BadResponse extends ExchangeError {
    constructor(message: any);
}
declare class NullResponse extends ExchangeError {
    constructor(message: any);
}
declare class InsufficientFunds extends ExchangeError {
    constructor(message: any);
}
declare class InvalidAddress extends ExchangeError {
    constructor(message: any);
}
declare class AddressPending extends InvalidAddress {
    constructor(message: any);
}
declare class InvalidOrder extends ExchangeError {
    constructor(message: any);
}
declare class ContractUnavailable extends InvalidOrder {
    constructor(message: any);
}
declare class OrderNotFound extends InvalidOrder {
    constructor(message: any);
}
declare class OrderNotCached extends InvalidOrder {
    constructor(message: any);
}
declare class CancelPending extends InvalidOrder {
    constructor(message: any);
}
declare class OrderImmediatelyFillable extends InvalidOrder {
    constructor(message: any);
}
declare class OrderNotFillable extends InvalidOrder {
    constructor(message: any);
}
declare class DuplicateOrderId extends InvalidOrder {
    constructor(message: any);
}
declare class NotSupported extends ExchangeError {
    constructor(message: any);
}
declare class NetworkError extends BaseError {
    constructor(message: any);
}
declare class DDoSProtection extends NetworkError {
    constructor(message: any);
}
declare class RateLimitExceeded extends DDoSProtection {
    constructor(message: any);
}
declare class ExchangeNotAvailable extends NetworkError {
    constructor(message: any);
}
declare class OnMaintenance extends ExchangeNotAvailable {
    constructor(message: any);
}
declare class InvalidNonce extends NetworkError {
    constructor(message: any);
}
declare class RequestTimeout extends NetworkError {
    constructor(message: any);
}
declare const errors: {
    BaseError: typeof BaseError;
    ExchangeError: typeof ExchangeError;
    PermissionDenied: typeof PermissionDenied;
    AccountNotEnabled: typeof AccountNotEnabled;
    AccountSuspended: typeof AccountSuspended;
    ArgumentsRequired: typeof ArgumentsRequired;
    BadRequest: typeof BadRequest;
    BadSymbol: typeof BadSymbol;
    MarginModeAlreadySet: typeof MarginModeAlreadySet;
    BadResponse: typeof BadResponse;
    NullResponse: typeof NullResponse;
    InsufficientFunds: typeof InsufficientFunds;
    InvalidAddress: typeof InvalidAddress;
    InvalidOrder: typeof InvalidOrder;
    OrderNotFound: typeof OrderNotFound;
    OrderNotCached: typeof OrderNotCached;
    CancelPending: typeof CancelPending;
    OrderImmediatelyFillable: typeof OrderImmediatelyFillable;
    OrderNotFillable: typeof OrderNotFillable;
    DuplicateOrderId: typeof DuplicateOrderId;
    NotSupported: typeof NotSupported;
    NetworkError: typeof NetworkError;
    DDoSProtection: typeof DDoSProtection;
    RateLimitExceeded: typeof RateLimitExceeded;
    ExchangeNotAvailable: typeof ExchangeNotAvailable;
    OnMaintenance: typeof OnMaintenance;
    InvalidNonce: typeof InvalidNonce;
    RequestTimeout: typeof RequestTimeout;
    AuthenticationError: typeof AuthenticationError;
    AddressPending: typeof AddressPending;
    ContractUnavailable: typeof ContractUnavailable;
};
export { BaseError, ExchangeError, PermissionDenied, AccountNotEnabled, AccountSuspended, ArgumentsRequired, BadRequest, BadSymbol, MarginModeAlreadySet, BadResponse, NullResponse, InsufficientFunds, InvalidAddress, InvalidOrder, OrderNotFound, OrderNotCached, CancelPending, OrderImmediatelyFillable, OrderNotFillable, DuplicateOrderId, NotSupported, NetworkError, DDoSProtection, RateLimitExceeded, ExchangeNotAvailable, OnMaintenance, InvalidNonce, RequestTimeout, AuthenticationError, AddressPending, ContractUnavailable };
export default errors;
