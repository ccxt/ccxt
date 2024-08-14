'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/* eslint-disable max-classes-per-file */
class BaseError extends Error {
    constructor(message) {
        super(message);
        this.name = 'BaseError';
    }
}
class ExchangeError extends BaseError {
    constructor(message) {
        super(message);
        this.name = 'ExchangeError';
    }
}
class AuthenticationError extends ExchangeError {
    constructor(message) {
        super(message);
        this.name = 'AuthenticationError';
    }
}
class PermissionDenied extends AuthenticationError {
    constructor(message) {
        super(message);
        this.name = 'PermissionDenied';
    }
}
class AccountNotEnabled extends PermissionDenied {
    constructor(message) {
        super(message);
        this.name = 'AccountNotEnabled';
    }
}
class AccountSuspended extends AuthenticationError {
    constructor(message) {
        super(message);
        this.name = 'AccountSuspended';
    }
}
class ArgumentsRequired extends ExchangeError {
    constructor(message) {
        super(message);
        this.name = 'ArgumentsRequired';
    }
}
class BadRequest extends ExchangeError {
    constructor(message) {
        super(message);
        this.name = 'BadRequest';
    }
}
class BadSymbol extends BadRequest {
    constructor(message) {
        super(message);
        this.name = 'BadSymbol';
    }
}
class OperationRejected extends ExchangeError {
    constructor(message) {
        super(message);
        this.name = 'OperationRejected';
    }
}
class NoChange extends OperationRejected {
    constructor(message) {
        super(message);
        this.name = 'NoChange';
    }
}
class MarginModeAlreadySet extends NoChange {
    constructor(message) {
        super(message);
        this.name = 'MarginModeAlreadySet';
    }
}
class MarketClosed extends OperationRejected {
    constructor(message) {
        super(message);
        this.name = 'MarketClosed';
    }
}
class InsufficientFunds extends ExchangeError {
    constructor(message) {
        super(message);
        this.name = 'InsufficientFunds';
    }
}
class InvalidAddress extends ExchangeError {
    constructor(message) {
        super(message);
        this.name = 'InvalidAddress';
    }
}
class AddressPending extends InvalidAddress {
    constructor(message) {
        super(message);
        this.name = 'AddressPending';
    }
}
class InvalidOrder extends ExchangeError {
    constructor(message) {
        super(message);
        this.name = 'InvalidOrder';
    }
}
class OrderNotFound extends InvalidOrder {
    constructor(message) {
        super(message);
        this.name = 'OrderNotFound';
    }
}
class OrderNotCached extends InvalidOrder {
    constructor(message) {
        super(message);
        this.name = 'OrderNotCached';
    }
}
class OrderImmediatelyFillable extends InvalidOrder {
    constructor(message) {
        super(message);
        this.name = 'OrderImmediatelyFillable';
    }
}
class OrderNotFillable extends InvalidOrder {
    constructor(message) {
        super(message);
        this.name = 'OrderNotFillable';
    }
}
class DuplicateOrderId extends InvalidOrder {
    constructor(message) {
        super(message);
        this.name = 'DuplicateOrderId';
    }
}
class ContractUnavailable extends InvalidOrder {
    constructor(message) {
        super(message);
        this.name = 'ContractUnavailable';
    }
}
class NotSupported extends ExchangeError {
    constructor(message) {
        super(message);
        this.name = 'NotSupported';
    }
}
class InvalidProxySettings extends ExchangeError {
    constructor(message) {
        super(message);
        this.name = 'InvalidProxySettings';
    }
}
class ExchangeClosedByUser extends ExchangeError {
    constructor(message) {
        super(message);
        this.name = 'ExchangeClosedByUser';
    }
}
class OperationFailed extends BaseError {
    constructor(message) {
        super(message);
        this.name = 'OperationFailed';
    }
}
class NetworkError extends OperationFailed {
    constructor(message) {
        super(message);
        this.name = 'NetworkError';
    }
}
class DDoSProtection extends NetworkError {
    constructor(message) {
        super(message);
        this.name = 'DDoSProtection';
    }
}
class RateLimitExceeded extends NetworkError {
    constructor(message) {
        super(message);
        this.name = 'RateLimitExceeded';
    }
}
class ExchangeNotAvailable extends NetworkError {
    constructor(message) {
        super(message);
        this.name = 'ExchangeNotAvailable';
    }
}
class OnMaintenance extends ExchangeNotAvailable {
    constructor(message) {
        super(message);
        this.name = 'OnMaintenance';
    }
}
class InvalidNonce extends NetworkError {
    constructor(message) {
        super(message);
        this.name = 'InvalidNonce';
    }
}
class ChecksumError extends InvalidNonce {
    constructor(message) {
        super(message);
        this.name = 'ChecksumError';
    }
}
class RequestTimeout extends NetworkError {
    constructor(message) {
        super(message);
        this.name = 'RequestTimeout';
    }
}
class BadResponse extends OperationFailed {
    constructor(message) {
        super(message);
        this.name = 'BadResponse';
    }
}
class NullResponse extends BadResponse {
    constructor(message) {
        super(message);
        this.name = 'NullResponse';
    }
}
class CancelPending extends OperationFailed {
    constructor(message) {
        super(message);
        this.name = 'CancelPending';
    }
}
var errors = { BaseError, ExchangeError, AuthenticationError, PermissionDenied, AccountNotEnabled, AccountSuspended, ArgumentsRequired, BadRequest, BadSymbol, OperationRejected, NoChange, MarginModeAlreadySet, MarketClosed, InsufficientFunds, InvalidAddress, AddressPending, InvalidOrder, OrderNotFound, OrderNotCached, OrderImmediatelyFillable, OrderNotFillable, DuplicateOrderId, ContractUnavailable, NotSupported, InvalidProxySettings, ExchangeClosedByUser, OperationFailed, NetworkError, DDoSProtection, RateLimitExceeded, ExchangeNotAvailable, OnMaintenance, InvalidNonce, ChecksumError, RequestTimeout, BadResponse, NullResponse, CancelPending };

exports.AccountNotEnabled = AccountNotEnabled;
exports.AccountSuspended = AccountSuspended;
exports.AddressPending = AddressPending;
exports.ArgumentsRequired = ArgumentsRequired;
exports.AuthenticationError = AuthenticationError;
exports.BadRequest = BadRequest;
exports.BadResponse = BadResponse;
exports.BadSymbol = BadSymbol;
exports.BaseError = BaseError;
exports.CancelPending = CancelPending;
exports.ChecksumError = ChecksumError;
exports.ContractUnavailable = ContractUnavailable;
exports.DDoSProtection = DDoSProtection;
exports.DuplicateOrderId = DuplicateOrderId;
exports.ExchangeClosedByUser = ExchangeClosedByUser;
exports.ExchangeError = ExchangeError;
exports.ExchangeNotAvailable = ExchangeNotAvailable;
exports.InsufficientFunds = InsufficientFunds;
exports.InvalidAddress = InvalidAddress;
exports.InvalidNonce = InvalidNonce;
exports.InvalidOrder = InvalidOrder;
exports.InvalidProxySettings = InvalidProxySettings;
exports.MarginModeAlreadySet = MarginModeAlreadySet;
exports.MarketClosed = MarketClosed;
exports.NetworkError = NetworkError;
exports.NoChange = NoChange;
exports.NotSupported = NotSupported;
exports.NullResponse = NullResponse;
exports.OnMaintenance = OnMaintenance;
exports.OperationFailed = OperationFailed;
exports.OperationRejected = OperationRejected;
exports.OrderImmediatelyFillable = OrderImmediatelyFillable;
exports.OrderNotCached = OrderNotCached;
exports.OrderNotFillable = OrderNotFillable;
exports.OrderNotFound = OrderNotFound;
exports.PermissionDenied = PermissionDenied;
exports.RateLimitExceeded = RateLimitExceeded;
exports.RequestTimeout = RequestTimeout;
exports["default"] = errors;
