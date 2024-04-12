declare class BaseError extends Error {
    constructor(message: any);
}
declare class ExchangeError extends BaseError {
    constructor(message: any);
}
declare class AuthenticationError extends ExchangeError {
    constructor(message: any);
}
declare class PermissionDenied extends AuthenticationError {
    constructor(message: any);
}
declare class AccountNotEnabled extends PermissionDenied {
    constructor(message: any);
}
declare class AccountSuspended extends AuthenticationError {
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
declare class OperationRejected extends ExchangeError {
    constructor(message: any);
}
declare class NoChange extends OperationRejected {
    constructor(message: any);
}
declare class MarginModeAlreadySet extends NoChange {
    constructor(message: any);
}
declare class BadResponse extends ExchangeError {
    constructor(message: any);
}
declare class NullResponse extends BadResponse {
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
declare class ContractUnavailable extends InvalidOrder {
    constructor(message: any);
}
declare class NotSupported extends ExchangeError {
    constructor(message: any);
}
declare class ProxyError extends ExchangeError {
    constructor(message: any);
}
declare class ExchangeClosedByUser extends ExchangeError {
    constructor(message: any);
}
declare class OperationFailed extends BaseError {
    constructor(message: any);
}
declare class NetworkError extends OperationFailed {
    constructor(message: any);
}
declare class DDoSProtection extends NetworkError {
    constructor(message: any);
}
declare class RateLimitExceeded extends NetworkError {
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
export { BaseError, ExchangeError, AuthenticationError, PermissionDenied, AccountNotEnabled, AccountSuspended, ArgumentsRequired, BadRequest, BadSymbol, OperationRejected, NoChange, MarginModeAlreadySet, BadResponse, NullResponse, InsufficientFunds, InvalidAddress, AddressPending, InvalidOrder, OrderNotFound, OrderNotCached, CancelPending, OrderImmediatelyFillable, OrderNotFillable, DuplicateOrderId, ContractUnavailable, NotSupported, ProxyError, ExchangeClosedByUser, OperationFailed, NetworkError, DDoSProtection, RateLimitExceeded, ExchangeNotAvailable, OnMaintenance, InvalidNonce, RequestTimeout };
declare const _default: {
    BaseError: typeof BaseError;
    ExchangeError: typeof ExchangeError;
    AuthenticationError: typeof AuthenticationError;
    PermissionDenied: typeof PermissionDenied;
    AccountNotEnabled: typeof AccountNotEnabled;
    AccountSuspended: typeof AccountSuspended;
    ArgumentsRequired: typeof ArgumentsRequired;
    BadRequest: typeof BadRequest;
    BadSymbol: typeof BadSymbol;
    OperationRejected: typeof OperationRejected;
    NoChange: typeof NoChange;
    MarginModeAlreadySet: typeof MarginModeAlreadySet;
    BadResponse: typeof BadResponse;
    NullResponse: typeof NullResponse;
    InsufficientFunds: typeof InsufficientFunds;
    InvalidAddress: typeof InvalidAddress;
    AddressPending: typeof AddressPending;
    InvalidOrder: typeof InvalidOrder;
    OrderNotFound: typeof OrderNotFound;
    OrderNotCached: typeof OrderNotCached;
    CancelPending: typeof CancelPending;
    OrderImmediatelyFillable: typeof OrderImmediatelyFillable;
    OrderNotFillable: typeof OrderNotFillable;
    DuplicateOrderId: typeof DuplicateOrderId;
    ContractUnavailable: typeof ContractUnavailable;
    NotSupported: typeof NotSupported;
    ProxyError: typeof ProxyError;
    ExchangeClosedByUser: typeof ExchangeClosedByUser;
    OperationFailed: typeof OperationFailed;
    NetworkError: typeof NetworkError;
    DDoSProtection: typeof DDoSProtection;
    RateLimitExceeded: typeof RateLimitExceeded;
    ExchangeNotAvailable: typeof ExchangeNotAvailable;
    OnMaintenance: typeof OnMaintenance;
    InvalidNonce: typeof InvalidNonce;
    RequestTimeout: typeof RequestTimeout;
};
export default _default;
