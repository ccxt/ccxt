// Native Rust – hand-written error types for CCXT.
//
// The hierarchy mirrors errorHierarchy.js. ExchangeError wraps all runtime
// failures with a `kind` string so that exchange code and the generated
// exchange_errors.rs can construct typed errors without a huge enum.

use thiserror::Error;

/// A runtime exchange error. `kind` is the class name from the TS hierarchy
/// (e.g. "AuthenticationError", "InsufficientFunds"). `message` is the
/// human-readable description.
#[derive(Debug, Clone, Error)]
#[error("[{kind}] {message}")]
pub struct ExchangeError {
    /// Error class name, e.g. "NetworkError", "AuthenticationError"
    pub kind: String,
    /// Human-readable message
    pub message: String,
}

impl ExchangeError {
    /// Create a new error with the given kind and message.
    pub fn new(kind: impl Into<String>, message: impl Into<String>) -> Self {
        Self { kind: kind.into(), message: message.into() }
    }

    /// Returns `true` when this is the named error class *or* a sub-class of it,
    /// walking the CCXT error hierarchy (errorHierarchy.ts). E.g. a `BadSymbol`
    /// `is("BadRequest")` and a `RequestTimeout` `is("NetworkError")`.
    pub fn is(&self, kind: &str) -> bool {
        let mut current = self.kind.as_str();
        loop {
            if current == kind {
                return true;
            }
            match error_parent(current) {
                Some(p) => current = p,
                None => return false,
            }
        }
    }

    /// Alias for `is` — clearer at call sites asserting subclass membership.
    pub fn is_a(&self, kind: &str) -> bool {
        self.is(kind)
    }
}

/// Parent class of a CCXT error kind per `ts/src/base/errorHierarchy.ts`.
/// `None` for the root (`BaseError`) or an unknown kind.
fn error_parent(kind: &str) -> Option<&'static str> {
    Some(match kind {
        // BaseError → ExchangeError subtree
        "ExchangeError"            => "BaseError",
        "AuthenticationError"      => "ExchangeError",
        "PermissionDenied"         => "AuthenticationError",
        "AccountNotEnabled"        => "PermissionDenied",
        "AccountSuspended"         => "AuthenticationError",
        "ArgumentsRequired"        => "ExchangeError",
        "BadRequest"               => "ExchangeError",
        "BadSymbol"                => "BadRequest",
        "OperationRejected"        => "ExchangeError",
        "NoChange"                 => "OperationRejected",
        "MarginModeAlreadySet"     => "NoChange",
        "MarketClosed"             => "OperationRejected",
        "ManualInteractionNeeded"  => "OperationRejected",
        "RestrictedLocation"       => "OperationRejected",
        "InsufficientFunds"        => "ExchangeError",
        "InvalidAddress"           => "ExchangeError",
        "AddressPending"           => "InvalidAddress",
        "InvalidOrder"             => "ExchangeError",
        "OrderNotFound"            => "InvalidOrder",
        "OrderNotCached"           => "InvalidOrder",
        "OrderImmediatelyFillable" => "InvalidOrder",
        "OrderNotFillable"         => "InvalidOrder",
        "DuplicateOrderId"         => "InvalidOrder",
        "ContractUnavailable"      => "InvalidOrder",
        "NotSupported"             => "ExchangeError",
        "InvalidProxySettings"     => "ExchangeError",
        "ExchangeClosedByUser"     => "ExchangeError",
        // BaseError → OperationFailed subtree
        "OperationFailed"          => "BaseError",
        "NetworkError"             => "OperationFailed",
        "DDoSProtection"           => "NetworkError",
        "RateLimitExceeded"        => "NetworkError",
        "ExchangeNotAvailable"     => "NetworkError",
        "OnMaintenance"            => "ExchangeNotAvailable",
        "InvalidNonce"             => "NetworkError",
        "ChecksumError"            => "InvalidNonce",
        "RequestTimeout"           => "NetworkError",
        "BadResponse"              => "OperationFailed",
        "NullResponse"             => "BadResponse",
        "CancelPending"            => "OperationFailed",
        // BaseError → misc
        "UnsubscribeError"         => "BaseError",
        _ => return None,
    })
}

#[cfg(test)]
mod error_hierarchy_tests {
    use super::ExchangeError;

    #[test]
    fn subclass_membership() {
        let e = ExchangeError::new("BadSymbol", "x");
        assert!(e.is("BadSymbol"));
        assert!(e.is("BadRequest"));
        assert!(e.is("ExchangeError"));
        assert!(e.is("BaseError"));
        assert!(!e.is("NetworkError"));

        assert!(ExchangeError::new("RequestTimeout", "x").is("NetworkError"));
        assert!(ExchangeError::new("OnMaintenance", "x").is("OperationFailed"));
        assert!(!ExchangeError::new("AuthenticationError", "x").is("BadRequest"));
        assert!(!ExchangeError::new("Unknown", "x").is("ExchangeError"));
    }
}

// ── From conversions from common third-party error types ────────────────────

impl From<reqwest::Error> for ExchangeError {
    fn from(e: reqwest::Error) -> Self {
        Self::new("NetworkError", e.to_string())
    }
}

impl From<serde_json::Error> for ExchangeError {
    fn from(e: serde_json::Error) -> Self {
        Self::new("BadResponse", e.to_string())
    }
}

impl From<std::num::ParseFloatError> for ExchangeError {
    fn from(e: std::num::ParseFloatError) -> Self {
        Self::new("BadResponse", e.to_string())
    }
}

impl From<std::num::ParseIntError> for ExchangeError {
    fn from(e: std::num::ParseIntError) -> Self {
        Self::new("BadResponse", e.to_string())
    }
}

impl From<url::ParseError> for ExchangeError {
    fn from(e: url::ParseError) -> Self {
        Self::new("BadRequest", e.to_string())
    }
}
