package ccxt

import (
	"fmt"
)

// This file does some wannabe inheritage nonsense with error types,
// errors should probably be a simple struct{msg, type, detail} instead,
// but I went this road. todo

type BaseError string
type ExchangeError BaseError
type NotSupportedError ExchangeError
type AuthenticationError ExchangeError
type InvalidNonce ExchangeError
type InsufficientFunds ExchangeError
type InvalidOrder ExchangeError
type OrderNotFound InvalidOrder
type OrderNotCached InvalidOrder
type CancelPending InvalidOrder
type NetworkError BaseError
type DDoSProtection NetworkError
type RequestTimeout NetworkError
type ExchangeNotAvailable NetworkError

func (err BaseError) Error() string            { return ErrString("BaseError", string(err)) }
func (err ExchangeError) Error() string        { return ErrString("ExchangeError", string(err)) }
func (err NotSupportedError) Error() string    { return ErrString("NotSupportedError", string(err)) }
func (err AuthenticationError) Error() string  { return ErrString("AuthenticationError", string(err)) }
func (err InvalidNonce) Error() string         { return ErrString("InvalidNonce", string(err)) }
func (err InsufficientFunds) Error() string    { return ErrString("InsufficientFunds", string(err)) }
func (err InvalidOrder) Error() string         { return ErrString("InvalidOrder", string(err)) }
func (err OrderNotFound) Error() string        { return ErrString("OrderNotFound", string(err)) }
func (err OrderNotCached) Error() string       { return ErrString("OrderNotCached", string(err)) }
func (err CancelPending) Error() string        { return ErrString("CancelPending", string(err)) }
func (err NetworkError) Error() string         { return ErrString("NetworkError", string(err)) }
func (err DDoSProtection) Error() string       { return ErrString("DDoSProtection", string(err)) }
func (err RequestTimeout) Error() string       { return ErrString("RequestTimeout", string(err)) }
func (err ExchangeNotAvailable) Error() string { return ErrString("ExchangeNotAvailable", string(err)) }

func ErrString(t, msg string) string {
	if msg != "" {
		return fmt.Sprintf("%s: %s", t, msg)
	}
	return t
}

// TypedError creates a typed error from type t and message, if type does
// not match a known error type, fmt.Errorf will be used
func TypedError(t string, msg string) error {
	switch t {
	case "ExchangeError":
		return ExchangeError(msg)
	case "NotSupportedError":
		return NotSupportedError(msg)
	case "AuthenticationError":
		return AuthenticationError(msg)
	case "InvalidNonce":
		return InvalidNonce(msg)
	case "InsufficientFunds":
		return InsufficientFunds(msg)
	case "InvalidOrder":
		return InvalidOrder(msg)
	case "OrderNotFound":
		return OrderNotFound(msg)
	case "OrderNotCached":
		return OrderNotCached(msg)
	case "CancelPending":
		return CancelPending(msg)
	case "NetworkError":
		return NetworkError(msg)
	case "DDoSProtection":
		return DDoSProtection(msg)
	case "RequestTimeout":
		return RequestTimeout(msg)
	case "ExchangeNotAvailable":
		return ExchangeNotAvailable(msg)
	default:
		return fmt.Errorf(msg)
	}
}
