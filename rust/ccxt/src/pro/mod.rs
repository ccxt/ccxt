// CCXT Rust — WS (Pro) base types.
//
// Hand-written Rust port of `ts/src/base/ws/*.ts`. Mirrors the
// behaviour of the TypeScript classes while replacing JS Array
// subclassing with idiomatic Rust collections.
//
//   * `cache.rs`            — ArrayCache + variants
//   * `order_book_side.rs`  — Asks / Bids + Counted / Indexed variants
//   * `order_book.rs`       — OrderBook + variants

pub mod cache;
pub mod order_book_side;
pub mod order_book;

pub use cache::{
    ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById, ArrayCacheBySymbolBySide,
    BaseCache, NewUpdatesEntry,
};
pub use order_book_side::{
    Side, OrderBookSide, CountedOrderBookSide, IndexedOrderBookSide,
};
pub use order_book::{OrderBook, BookSides};
