#pragma once

#include <stdexcept>
#include <locale>
#include <codecvt>

namespace ccxt
{

struct BaseError : public std::runtime_error
{
public:
    BaseError(const std::string& what = "") : runtime_error(what) {}
};

struct ExchangeError : public BaseError
{ 
public:
    ExchangeError(const std::string& what = "") : BaseError(what) {}
};

struct AuthenticationError : public ExchangeError
{
public:
    AuthenticationError(const std::string& what = "") : ExchangeError(what) {}
};

struct PermissionDenied : public AuthenticationError
{
 public:
    PermissionDenied(const std::string& what = "") : AuthenticationError(what) {}
};

struct AccountNotEnabled : public PermissionDenied
{
 public:
    AccountNotEnabled(const std::string& what = "") : PermissionDenied(what) {}
};

struct AccountSuspended : public AuthenticationError
{
 public:
    AccountSuspended(const std::string& what = "") : AuthenticationError(what) {}
};

struct ArgumentsRequired : public ExchangeError
{
 public:
    ArgumentsRequired(const std::string& what = "") : ExchangeError(what) {}
};

struct BadRequest : public ExchangeError
{
 public:
    BadRequest(const std::string& what = "") : ExchangeError(what) {}
};

struct BadSymbol : public BadRequest
{
 public:
    BadSymbol(const std::string& what = "") : BadRequest(what) {}
};

struct MarginModeAlreadySet : public BadRequest
{
 public:
    MarginModeAlreadySet(const std::string& what = "") : BadRequest(what) {}
};

struct BadResponse : public ExchangeError
{
 public:
    BadResponse(const std::string& what = "") : ExchangeError(what) {}
};

struct NullResponse : public BadResponse
{
 public:
    NullResponse(const std::string& what = "") : BadResponse(what) {}
};

struct InsufficientFunds : public ExchangeError
{
 public:
    InsufficientFunds(const std::string& what = "") : ExchangeError(what) {}
};

struct InvalidAddress : public ExchangeError
{
 public:
    InvalidAddress(const std::string& what = "") : ExchangeError(what) {}
};

struct AddressPending : public InvalidAddress
{
 public:
    AddressPending(const std::string& what = "") : InvalidAddress(what) {}
};

struct InvalidOrder : public ExchangeError
{
 public:
    InvalidOrder(const std::string& what = "") : ExchangeError(what) {}
};

struct OrderNotFound : public InvalidOrder
{
 public:
    OrderNotFound(const std::string& what = "") : InvalidOrder(what) {}
};

struct OrderNotCached : public InvalidOrder
{
 public:
    OrderNotCached(const std::string& what = "") : InvalidOrder(what) {}
};

struct CancelPending : public InvalidOrder
{
 public:
    CancelPending(const std::string& what = "") : InvalidOrder(what) {}
};

struct OrderImmediatelyFillable : public InvalidOrder
{
 public:
    OrderImmediatelyFillable(const std::string& what = "") : InvalidOrder(what) {}
};

struct OrderNotFillable : public InvalidOrder
{
 public:
    OrderNotFillable(const std::string& what = "") : InvalidOrder(what) {}
};

struct DuplicateOrderId : public InvalidOrder
{
 public:
    DuplicateOrderId(const std::string& what = "") : InvalidOrder(what) {}
};

struct NotSupported : public ExchangeError
{
 public:
    NotSupported(const std::string& what = "") : ExchangeError(what) {}
};

struct NetworkError : public BaseError
{
 public:
    NetworkError(const std::string& what = "") : BaseError(what) {}
};

struct DDoSProtection : public NetworkError
{
 public:
    DDoSProtection(const std::string& what = "") : NetworkError(what) {}
};

struct RateLimitExceeded : public DDoSProtection
{
 public:
    RateLimitExceeded(const std::string& what = "") : DDoSProtection(what) {}
};

struct ExchangeNotAvailable : public NetworkError
{
 public:
    ExchangeNotAvailable(const std::string& what = "") : NetworkError(what) {}
};

struct OnMaintenance : public ExchangeNotAvailable
{
 public:
    OnMaintenance(const std::string& what = "") : ExchangeNotAvailable(what) {}
};

struct InvalidNonce : public NetworkError
{
 public:
    InvalidNonce(const std::string& what = "") : NetworkError(what) {}
};

struct RequestTimeout : public NetworkError
{
 public:
    RequestTimeout(const std::string& what = "") : NetworkError(what) {}
};

}