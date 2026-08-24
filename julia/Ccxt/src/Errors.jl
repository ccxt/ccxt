# CCXT error hierarchy for Julia.
# Exception subtypes (not CcxtExchange) because errors are thrown and caught,
# not used as exchange instances. Each is a simple struct with a message field
# matching `throw new SomeError("message")`.

macro def_err(name)
    return quote
        struct $(esc(name)) <: Exception
            message::String
        end
        $(esc(name))(msg="") = $(esc(name))(string(msg))
    end
end

@def_err BaseError
@def_err ExchangeError
@def_err AuthenticationError
@def_err PermissionDenied
@def_err AccountNotEnabled
@def_err AccountSuspended
@def_err ArgumentsRequired
@def_err BadRequest
@def_err BadSymbol
@def_err OperationRejected
@def_err NoChange
@def_err MarginModeAlreadySet
@def_err MarketClosed
@def_err ManualInteractionNeeded
@def_err RestrictedLocation
@def_err InsufficientFunds
@def_err InvalidAddress
@def_err AddressPending
@def_err InvalidOrder
@def_err OrderNotFound
@def_err OrderNotCached
@def_err OrderImmediatelyFillable
@def_err OrderNotFillable
@def_err DuplicateOrderId
@def_err ContractUnavailable
@def_err NotSupported
@def_err InvalidProxySettings
@def_err ExchangeClosedByUser
@def_err OperationFailed
@def_err NetworkError
@def_err DDoSProtection
@def_err RateLimitExceeded
@def_err ExchangeNotAvailable
@def_err OnMaintenance
@def_err InvalidNonce
@def_err ChecksumError
@def_err RequestTimeout
@def_err BadResponse
@def_err NullResponse
@def_err CancelPending
@def_err UnsubscribeError

export BaseError, ExchangeError, AuthenticationError, PermissionDenied, AccountNotEnabled, AccountSuspended, ArgumentsRequired, BadRequest, BadSymbol, OperationRejected, NoChange, MarginModeAlreadySet, MarketClosed, ManualInteractionNeeded, RestrictedLocation, InsufficientFunds, InvalidAddress, AddressPending, InvalidOrder, OrderNotFound, OrderNotCached, OrderImmediatelyFillable, OrderNotFillable, DuplicateOrderId, ContractUnavailable, NotSupported, InvalidProxySettings, ExchangeClosedByUser, OperationFailed, NetworkError, DDoSProtection, RateLimitExceeded, ExchangeNotAvailable, OnMaintenance, InvalidNonce, ChecksumError, RequestTimeout, BadResponse, NullResponse, CancelPending, UnsubscribeError
