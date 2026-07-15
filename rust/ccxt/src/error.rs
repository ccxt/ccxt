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

    /// Returns `true` when this is the named error class *or* a sub-class.
    pub fn is(&self, kind: &str) -> bool {
        self.kind == kind
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
