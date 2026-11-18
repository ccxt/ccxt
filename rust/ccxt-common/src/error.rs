// Native Rust – hand-written error types for CCXT.
//
// The hierarchy mirrors errorHierarchy.js. ExchangeError wraps all runtime
// failures with a `kind` string so that exchange code and the generated
// exchange_errors.rs can construct typed errors without a huge enum.

/// A runtime exchange error. `kind` is the class name from the TS hierarchy
/// (e.g. "AuthenticationError", "InsufficientFunds"). `message` is the
/// human-readable description.
#[derive(Debug, Clone)]
pub struct ExchangeError {
    /// Error class name, e.g. "NetworkError", "AuthenticationError"
    pub kind: String,
    /// Human-readable message
    pub message: String,
}

impl std::fmt::Display for ExchangeError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "[{}] {}", self.kind, self.message)
    }
}

impl std::error::Error for ExchangeError {}

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

/// A caught error object: the payload of a `catch (e)` arm (transpiled
/// `catch_unwind`), kept as the raw `[Kind] message` text the panic carried so
/// re-throwing it (`panic!("{}", e)`), rejecting a ws future with it, or boxing
/// it into a `Value` gives byte-for-byte the same string the old `Value::Str`
/// binding did. Class tests walk the same hierarchy as `runtime::is_instance`.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CaughtError {
    raw: String,
}

impl CaughtError {
    /// Takes a `catch_unwind` payload (`String` / `&str` panics; anything else
    /// reads as `"panic"`, as `runtime::panic_to_value` does).
    pub fn from_panic(payload: Box<dyn std::any::Any + Send>) -> Self {
        let raw = payload.downcast_ref::<String>().cloned()
            .or_else(|| payload.downcast_ref::<&str>().map(|s| (*s).to_string()))
            .unwrap_or_else(|| "panic".to_string());
        Self { raw }
    }
    /// The full `[Kind] message` text.
    pub fn message(&self) -> &str { &self.raw }
    /// `e instanceof <Class>` for a class with no subclass: `[Class]` appears in the text.
    pub fn names(&self, class: &str) -> bool { self.raw.contains(&format!("[{class}]")) }
    /// `e instanceof <Class>` with the error hierarchy walk (`runtime::is_instance`).
    pub fn is_instance_of(&self, class: &str) -> bool {
        crate::runtime::is_instance(&crate::Value::from(self), &crate::Value::from(class))
    }
    /// The typed `ExchangeError` the text encodes (`runtime::panic_msg_to_error`).
    pub fn to_exchange_error(&self) -> ExchangeError { crate::runtime::panic_msg_to_error(&self.raw) }
}

impl std::fmt::Display for CaughtError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result { f.write_str(&self.raw) }
}

impl From<CaughtError> for crate::Value {
    fn from(e: CaughtError) -> Self { crate::Value::Str(e.raw.into()) }
}

impl From<&CaughtError> for crate::Value {
    fn from(e: &CaughtError) -> Self { crate::Value::Str(e.raw.as_str().to_owned().into()) }
}

#[cfg(test)]
mod caught_error_tests {
    use super::CaughtError;
    use crate::Value;

    fn caught(p: Box<dyn std::any::Any + Send>) -> CaughtError { CaughtError::from_panic(p) }

    #[test]
    fn payload_text_is_kept_as_the_value_binding_had_it() {
        let cases: [(Box<dyn std::any::Any + Send>, &str); 3] = [
            (Box::new(String::from("[BadSymbol] x not found")), "[BadSymbol] x not found"),
            (Box::new("plain"), "plain"),
            (Box::new(7_i32), "panic"),
        ];
        for (p, want) in cases {
            let e = caught(p);
            assert_eq!(e.message(), want);
            assert_eq!(format!("{}", e), want);
            assert_eq!(Value::from(&e), Value::Str(want.to_string().into()));
            assert_eq!(Value::from(e), crate::runtime::panic_to_value(Box::new(want.to_string())));
        }
    }

    #[test]
    fn class_tests_match_the_value_helpers() {
        let e = caught(Box::new(String::from("[RateLimitExceeded] slow down")));
        let v = Value::from(&e);
        for cls in ["RateLimitExceeded", "NetworkError", "OperationFailed", "BadSymbol", "AuthenticationError"] {
            assert_eq!(e.is_instance_of(cls), crate::runtime::is_instance(&v, &Value::from(cls)), "{cls}");
            assert_eq!(e.names(cls), matches!(&v, Value::Str(__s) if __s.contains(&format!("[{cls}]"))), "{cls}");
        }
        assert!(e.is_instance_of("NetworkError") && !e.names("NetworkError"));
        assert_eq!(e.to_exchange_error().kind, "RateLimitExceeded");
        assert_eq!(e.to_exchange_error().message, "slow down");
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
