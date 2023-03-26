#pragma once

#include <stdexcept>
#include <locale>
#include <codecvt>

namespace {
    
std::wstring s2ws(const std::string& str)
{
    using convert_typeX = std::codecvt_utf8<wchar_t>;
    std::wstring_convert<convert_typeX, wchar_t> converterX;

    return converterX.from_bytes(str);
}

std::string ws2s(const std::wstring& wstr)
{
    using convert_typeX = std::codecvt_utf8<wchar_t>;
    std::wstring_convert<convert_typeX, wchar_t> converterX;

    return converterX.to_bytes(wstr);
}

}

namespace ccxt
{

struct runtime_error : public std::runtime_error
{
    runtime_error(const std::wstring& what = L"") : std::runtime_error(ws2s(what)) {}
};

struct BaseError : public runtime_error
{
public:
    BaseError(const std::wstring& what = L"") : runtime_error(what) {}
};

struct ExchangeError : public BaseError
{ 
public:
    ExchangeError(const std::wstring& what = L"") : BaseError(what) {}
};

struct AuthenticationError : public ExchangeError
{
public:
    AuthenticationError(const std::wstring& what = L"") : ExchangeError(what) {}
};

struct PermissionDenied : public AuthenticationError
{
 public:
    PermissionDenied(const std::wstring& what = L"") : AuthenticationError(what) {}
};

struct AccountNotEnabled : public PermissionDenied
{
 public:
    AccountNotEnabled(const std::wstring& what = L"") : PermissionDenied(what) {}
};

struct AccountSuspended : public AuthenticationError
{
 public:
    AccountSuspended(const std::wstring& what = L"") : AuthenticationError(what) {}
};

struct ArgumentsRequired : public ExchangeError
{
 public:
    ArgumentsRequired(const std::wstring& what = L"") : ExchangeError(what) {}
};

struct BadRequest : public ExchangeError
{
 public:
    BadRequest(const std::wstring& what = L"") : ExchangeError(what) {}
};

struct BadSymbol : public BadRequest
{
 public:
    BadSymbol(const std::wstring& what = L"") : BadRequest(what) {}
};

struct MarginModeAlreadySet : public BadRequest
{
 public:
    MarginModeAlreadySet(const std::wstring& what = L"") : BadRequest(what) {}
};

struct BadResponse : public ExchangeError
{
 public:
    BadResponse(const std::wstring& what = L"") : ExchangeError(what) {}
};

struct NullResponse : public BadResponse
{
 public:
    NullResponse(const std::wstring& what = L"") : BadResponse(what) {}
};

struct InsufficientFunds : public ExchangeError
{
 public:
    InsufficientFunds(const std::wstring& what = L"") : ExchangeError(what) {}
};

struct InvalidAddress : public ExchangeError
{
 public:
    InvalidAddress(const std::wstring& what = L"") : ExchangeError(what) {}
};

struct AddressPending : public InvalidAddress
{
 public:
    AddressPending(const std::wstring& what = L"") : InvalidAddress(what) {}
};

struct InvalidOrder : public ExchangeError
{
 public:
    InvalidOrder(const std::wstring& what = L"") : ExchangeError(what) {}
};

struct OrderNotFound : public InvalidOrder
{
 public:
    OrderNotFound(const std::wstring& what = L"") : InvalidOrder(what) {}
};

struct OrderNotCached : public InvalidOrder
{
 public:
    OrderNotCached(const std::wstring& what = L"") : InvalidOrder(what) {}
};

struct CancelPending : public InvalidOrder
{
 public:
    CancelPending(const std::wstring& what = L"") : InvalidOrder(what) {}
};

struct OrderImmediatelyFillable : public InvalidOrder
{
 public:
    OrderImmediatelyFillable(const std::wstring& what = L"") : InvalidOrder(what) {}
};

struct OrderNotFillable : public InvalidOrder
{
 public:
    OrderNotFillable(const std::wstring& what = L"") : InvalidOrder(what) {}
};

struct DuplicateOrderId : public InvalidOrder
{
 public:
    DuplicateOrderId(const std::wstring& what = L"") : InvalidOrder(what) {}
};

struct NotSupported : public ExchangeError
{
 public:
    NotSupported(const std::wstring& what = L"") : ExchangeError(what) {}
};

struct NetworkError : public BaseError
{
 public:
    NetworkError(const std::wstring& what = L"") : BaseError(what) {}
};

struct DDoSProtection : public NetworkError
{
 public:
    DDoSProtection(const std::wstring& what = L"") : NetworkError(what) {}
};

struct RateLimitExceeded : public DDoSProtection
{
 public:
    RateLimitExceeded(const std::wstring& what = L"") : DDoSProtection(what) {}
};

struct ExchangeNotAvailable : public NetworkError
{
 public:
    ExchangeNotAvailable(const std::wstring& what = L"") : NetworkError(what) {}
};

struct OnMaintenance : public ExchangeNotAvailable
{
 public:
    OnMaintenance(const std::wstring& what = L"") : ExchangeNotAvailable(what) {}
};

struct InvalidNonce : public NetworkError
{
 public:
    InvalidNonce(const std::wstring& what = L"") : NetworkError(what) {}
};

struct RequestTimeout : public NetworkError
{
 public:
    RequestTimeout(const std::wstring& what = L"") : NetworkError(what) {}
};

}