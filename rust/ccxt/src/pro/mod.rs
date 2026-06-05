// CCXT Rust — WS (Pro) base types.
//
// Value-shaped Rust port of `ts/src/base/ws/*.ts`. Each TS class is
// represented as a `Value::Dict` marker map; the factories live in
// this module and the runtime methods (`append`, `clear`, `store`,
// `store_array`, `limit`, `reset`, `update`, `get_limit`) live on
// `Value` itself (see `value.rs` and `runtime.rs`).
//
// The transpiled WS base tests in `rust/tests/base_ws/` operate on
// Value-typed locals throughout — making the factories return Value
// keeps the call sites the AST transpiler emits valid without any
// post-processing of the test bodies.

pub mod cache;
pub mod order_book;

pub use cache::{
    ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById, ArrayCacheBySymbolBySide,
    KIND_ARRAY_CACHE, KIND_ARRAY_CACHE_BY_TIMESTAMP,
    KIND_ARRAY_CACHE_BY_SYMBOL_ID, KIND_ARRAY_CACHE_BY_SYMBOL_SIDE,
};
pub use order_book::{
    OrderBook, IndexedOrderBook, CountedOrderBook,
    BOOK_PLAIN, BOOK_INDEXED, BOOK_COUNTED,
    SIDE_PLAIN, SIDE_INDEXED, SIDE_COUNTED,
};
