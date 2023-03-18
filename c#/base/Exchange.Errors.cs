using System.Net.Http.Headers;
using System.Text.Json.Serialization;
using System.Text;
using System.Text.Json;
using System;
using System.Collections.Generic;
using System.Net.NetworkInformation;
using System.Net.Http;
using System.Threading.Tasks;
using System.Text.RegularExpressions;

namespace Main;

using dict = Dictionary<string, object>;

public partial class Exchange
{

    // generate these automatically
    public class ExchangeError : Exception
    {
        public ExchangeError() : base() { }
        public ExchangeError(string message) : base(message) { }
        public ExchangeError(string message, Exception inner) : base(message, inner) { }
    }

    // public class ExchangeError : Exception
    // {
    //     public ExchangeError() : base() { }
    //     public ExchangeError(string message) : base(message) { }
    //     public ExchangeError(string message, Exception inner) : base(message, inner) { }
    // }

    public class ArgumentsRequired : Exception
    {
        public ArgumentsRequired() : base() { }
        public ArgumentsRequired(string message) : base(message) { }
        public ArgumentsRequired(string message, Exception inner) : base(message, inner) { }
    }

    public class NullResponse : Exception
    {
        public NullResponse() : base() { }
        public NullResponse(string message) : base(message) { }
        public NullResponse(string message, Exception inner) : base(message, inner) { }
    }

    public class NotSupported : Exception
    {
        public NotSupported() : base() { }
        public NotSupported(string message) : base(message) { }
        public NotSupported(string message, Exception inner) : base(message, inner) { }
    }

    public class AuthenticationError : Exception
    {
        public AuthenticationError() : base() { }
        public AuthenticationError(string message) : base(message) { }
        public AuthenticationError(string message, Exception inner) : base(message, inner) { }
    }

    public class PermissionDenied : Exception
    {
        public PermissionDenied() : base() { }
        public PermissionDenied(string message) : base(message) { }
        public PermissionDenied(string message, Exception inner) : base(message, inner) { }
    }

    public class BadSymbol : Exception
    {
        public BadSymbol() : base() { }
        public BadSymbol(string message) : base(message) { }
        public BadSymbol(string message, Exception inner) : base(message, inner) { }
    }
    public class RateLimitExceeded : Exception
    {
        public RateLimitExceeded() : base() { }
        public RateLimitExceeded(string message) : base(message) { }
        public RateLimitExceeded(string message, Exception inner) : base(message, inner) { }
    }

    public class ExchangeNotAvailable : Exception
    {
        public ExchangeNotAvailable() : base() { }
        public ExchangeNotAvailable(string message) : base(message) { }
        public ExchangeNotAvailable(string message, Exception inner) : base(message, inner) { }
    }

    public class DDoSProtection : Exception
    {
        public DDoSProtection() : base() { }
        public DDoSProtection(string message) : base(message) { }
        public DDoSProtection(string message, Exception inner) : base(message, inner) { }
    }

    public class BadResponse : Exception
    {
        public BadResponse() : base() { }
        public BadResponse(string message) : base(message) { }
        public BadResponse(string message, Exception inner) : base(message, inner) { }
    }

    public class BadRequest : Exception
    {
        public BadRequest() : base() { }
        public BadRequest(string message) : base(message) { }
        public BadRequest(string message, Exception inner) : base(message, inner) { }
    }

    public class RequestTimeout : Exception
    {
        public RequestTimeout() : base() { }
        public RequestTimeout(string message) : base(message) { }
        public RequestTimeout(string message, Exception inner) : base(message, inner) { }
    }

    public class InvalidOrder : Exception
    {
        public InvalidOrder() : base() { }
        public InvalidOrder(string message) : base(message) { }
        public InvalidOrder(string message, Exception inner) : base(message, inner) { }
    }

    public class InvalidNonce : Exception
    {
        public InvalidNonce() : base() { }
        public InvalidNonce(string message) : base(message) { }
        public InvalidNonce(string message, Exception inner) : base(message, inner) { }
    }

    public class OrderNotFound : Exception
    {
        public OrderNotFound() : base() { }
        public OrderNotFound(string message) : base(message) { }
        public OrderNotFound(string message, Exception inner) : base(message, inner) { }
    }


    public class InsufficientFunds : Exception
    {
        public InsufficientFunds() : base() { }
        public InsufficientFunds(string message) : base(message) { }
        public InsufficientFunds(string message, Exception inner) : base(message, inner) { }
    }

    public class InvalidAddress : Exception
    {
        public InvalidAddress() : base() { }
        public InvalidAddress(string message) : base(message) { }
        public InvalidAddress(string message, Exception inner) : base(message, inner) { }
    }

    public class OrderNotFillable : Exception
    {
        public OrderNotFillable() : base() { }
        public OrderNotFillable(string message) : base(message) { }
        public OrderNotFillable(string message, Exception inner) : base(message, inner) { }
    }


    public class AccountSuspended : Exception
    {
        public AccountSuspended() : base() { }
        public AccountSuspended(string message) : base(message) { }
        public AccountSuspended(string message, Exception inner) : base(message, inner) { }
    }

    public class OrderImmediatelyFillable : Exception
    {
        public OrderImmediatelyFillable() : base() { }
        public OrderImmediatelyFillable(string message) : base(message) { }
        public OrderImmediatelyFillable(string message, Exception inner) : base(message, inner) { }
    }

    public class OnMaintenance : Exception
    {
        public OnMaintenance() : base() { }
        public OnMaintenance(string message) : base(message) { }
        public OnMaintenance(string message, Exception inner) : base(message, inner) { }
    }

    public class MarginModeAlreadySet : Exception
    {
        public MarginModeAlreadySet() : base() { }
        public MarginModeAlreadySet(string message) : base(message) { }
        public MarginModeAlreadySet(string message, Exception inner) : base(message, inner) { }
    }


    public class dDoSProtection : Exception { }
    public class rateLimitExceeded : Exception { }
    public class exchangeNotAvailable : Exception { }
    public class requestTimeout : Exception { }
    public class authenticationError : Exception { }
    public class badSymbol : Exception { }
    public class permissionDenied : Exception { }
    public class argumentsRequired : Exception { }
    // public class permissionDenied : Exception { }

    // public Type ExchangeError = typeof(exchangeError);
    // public Type DoSProtection = typeof(dDoSProtection);
    // public Type RateLimitExceeded = typeof(rateLimitExceeded);
    // public Type ExchangeNotAvailable = typeof(exchangeNotAvailable);
    // public Type RequestTimeout = typeof(requestTimeout);
    // public Type BadSymbol = typeof(badSymbol);
    // public Type AuthenticationError = typeof(authenticationError);
    // public Type InsufficientFunds = typeof(authenticationError);
    // public Type PermissionDenied = typeof(authenticationError);
    // public Type BadRequest = typeof(authenticationError);
    // public Type InvalidOrder = typeof(authenticationError);
    // public Type ArgumentsRequired = typeof(argumentsRequired);
}