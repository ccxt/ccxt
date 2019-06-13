module Ccxt

  # Base class for all exceptions
  class BaseError < StandardError; end

  # Raised when an exchange server replies with an error in JSON
  class ExchangeError < BaseError; end

  # Raised if the endpoint is not offered/not yet supported by the exchange API
  class NotSupported < ExchangeError; end

  # A generic exception raised by unified methods when required arguments are missing.
  class ArgumentsRequired < ExchangeError; end

  # A generic exception raised by the exchange if all or some of required parameters are invalid or missing in URL query or in request body
  class BadRequest < ExchangeError; end

  # Raised if the endpoint returns a bad response from the exchange API
  class BadResponse < ExchangeError; end

  # Raised if the endpoint returns a null response from the exchange API
  class NullResponse < BadResponse; end

  # Raised when API credentials are required but missing or wrong
  class AuthenticationError < ExchangeError; end

  # Raised when API credentials are required but missing or wrong
  class PermissionDenied < AuthenticationError; end

  # Raised when user account has been suspended or deactivated by the exchange
  class AccountSuspended < AuthenticationError; end

  # Raised when you don't have enough currency on your account balance to place an order
  class InsufficientFunds < ExchangeError; end

  # "Base class for all exceptions related to the unified order API
  class InvalidOrder < ExchangeError; end

  # Raised on invalid funding address
  class InvalidAddress < ExchangeError; end

  # Raised when the address requested is pending (not ready yet, retry again later)
  class AddressPending < InvalidAddress; end

  # Raised when you are trying to fetch or cancel a non-existent order
  class OrderNotFound < InvalidOrder; end

  # Raised when the order is not found in local cache (where applicable)
  class OrderNotCached < InvalidOrder; end

  # Raised when the order id set by client is not unique
  class DuplicateOrderId < InvalidOrder; end

  # Raised when an order that is already pending cancel is being canceled again
  class CancelPending < InvalidOrder; end

  # Raised when an order placed as a market order or a taker order is not fillable upon request
  class OrderNotFillable < InvalidOrder; end

  # Raised when an order placed as maker order is fillable immediately as a taker upon request
  class OrderImmediatelyFillable < InvalidOrder; end

  # Base class for all errors related to networking
  class NetworkError < BaseError; end

  # Raised whenever DDoS protection restrictions are enforced per user or region/location
  class DDoSProtection < NetworkError; end

  # Raised when the exchange fails to reply in .timeout time
  class RequestTimeout < NetworkError; end

  # Raised if a reply from an exchange contains keywords related to maintenance or downtime
  class ExchangeNotAvailable < NetworkError; end

  # Raised in case of a wrong or conflicting nonce number in private requests
  class InvalidNonce < NetworkError; end

end