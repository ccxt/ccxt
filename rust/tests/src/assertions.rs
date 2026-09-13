// Minimal assertion helpers for the hand-written base-tests suite.
// We deliberately don't pull in a test framework — this binary runs
// standalone, not via `cargo test`.

#[macro_export]
macro_rules! assert_eq_msg {
    ($actual:expr, $expected:expr, $label:expr) => {{
        let a = &$actual;
        let e = &$expected;
        if a != e {
            return Err(format!(
                "{}: expected {:?}, got {:?}",
                $label, e, a
            ));
        }
    }};
}

#[macro_export]
macro_rules! assert_true {
    ($cond:expr, $label:expr) => {{
        if !$cond {
            return Err(format!("{}: condition was false", $label));
        }
    }};
}
