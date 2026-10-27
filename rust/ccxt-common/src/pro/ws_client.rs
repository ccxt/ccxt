//! WebSocket transport for the pro (`watch*`) API.
//!
//! This is the Rust port of the runtime side of `ts/src/base/ws/{Client,WsClient}.ts`.
//! The transpiled `pro/<id>.rs` exchanges call — via the base `watch()` /
//! `watch_multiple()` — into a *client* object keyed by URL that:
//!   * owns the live `tokio-tungstenite` connection (one per URL),
//!   * exposes `resolve` / `reject` / `future` / `send` so the venue's
//!     `handle_message` can push parsed data back to the awaiting `watch`,
//!   * tracks `subscriptions` (so a subscribe frame is sent once per hash),
//!   * runs ping/pong keep-alive.
//!
//! Ownership model (why this is a global registry, not a field on `Exchange`):
//! the base `watch()` borrows `&mut self` to drive `handle_message`, which
//! itself needs the client. Keeping the connection + futures in a process-wide
//! registry keyed by URL keeps it disjoint from the `&mut Exchange` borrow, so
//! the drive loop can read the next frame and call `handle_message` without
//! aliasing. The registry has ONE owner thread: every other task hands it a
//! job over a channel and waits for the reply, so no client field is shared and
//! no lock is taken at a use site.

#![allow(dead_code)]

use std::collections::{HashMap, HashSet, VecDeque};
use std::sync::Arc;

use futures::{SinkExt, StreamExt};
use once_cell::sync::Lazy;
use tokio::sync::{mpsc, watch};
use tokio_tungstenite::tungstenite::Message;

use crate::Value;

/// Handle to one per-connection state. The state itself lives on the client
/// store's owner thread; a handle carries only the key (`url`) and the wakeup
/// channel its waiters await.
pub struct ClientState {
    pub url: String,
    /// Bumped by the owner on every observable state change.
    gen_rx: watch::Receiver<u64>,
}

/// Per-connection state. Created, mutated and dropped only on the client
/// store's owner thread, so nothing here is behind a lock.
struct ClientCore {
    handle: Arc<ClientState>,
    /// Frames queued for the writer task → socket.
    outgoing: mpsc::UnboundedSender<Message>,
    /// Receiver half handed to the writer task when the socket connects (a slot
    /// is pre-registered before connecting so `client.subscriptions` writes
    /// persist — upbit builds its subscribe frame before the socket is up).
    pending_rx: Option<mpsc::UnboundedReceiver<Message>>,
    /// Set while one caller is inside `ensure_client`'s dial for this url; the
    /// store decides the winner, so concurrent callers never open two sockets.
    connecting: bool,
    /// Parsed inbound messages awaiting dispatch to `handle_message`.
    incoming: VecDeque<Value>,
    /// messageHash → resolved value (set by `handle_message` via `resolve`).
    resolved: HashMap<String, Value>,
    /// messageHash → error (set by `reject`; delivered before/instead of value).
    rejections: HashMap<String, Value>,
    /// subscribeHash → subscription object (TS `client.subscriptions[hash]`).
    /// A subscribe frame is sent only the first time a hash is inserted.
    subscriptions: HashMap<String, Value>,
    /// messageHashes some `watch` call is currently waiting on. Mirrors TS
    /// `client.futures` (read by a few venues' `handle_message`).
    futures: HashSet<String>,
    /// In-flight single-flight slots keyed by messageHash — the registry behind
    /// TS's `client.future ()` / `client.reusableFuture ()` leader election
    /// (binance/bybit/kucoin/... `authenticate`). Separate from `resolved`
    /// because a flight has *many* waiters (all of whom must observe the
    /// settled value, not consume it) and because settling one must also clear
    /// its `futures` entry so the NEXT cycle can elect a fresh leader.
    flights: HashMap<String, FlightSlot>,
    connected: bool,
    closed: bool,
    last_pong_ms: i64,
    /// Static-WS-test mock transport. When `mock` is set, `send_text` records the
    /// (JSON-parsed) outgoing frame into `mock_sent` instead of relying on a
    /// socket, and no real connection is ever opened. `ws_test_completed` is the
    /// watch side's done-flag the frame injector's rejection loop polls.
    mock: bool,
    mock_sent: Vec<Value>,
    ws_test_completed: bool,
    /// Wakeup channel for this client's waiters (`next_message`,
    /// `ws_await_flight`, `ensure_client` joiners).
    gen_tx: watch::Sender<u64>,
}

/// One single-flight slot. `settled` stays populated after the flight closes so
/// waiters that poll late still observe the result, and so a caller that
/// re-awaits a hash nobody is working on any more gets the last value instead
/// of blocking (TS's already-resolved Future). `open` is what a concurrent
/// caller joins.
#[derive(Clone)]
struct FlightSlot {
    open: bool,
    settled: Option<Result<Value, Value>>,
}

/// All live clients, owned by one thread. Every other task hands this store a
/// job over a channel, so no core is ever shared and there is no lock to nest,
/// poison, or hold across an await. A job sees the whole store, so a decision
/// (who dials, who leads a flight, who takes a settled value) is atomic by
/// construction: the owner runs one job at a time.
#[derive(Default)]
struct WsClientStore {
    clients: HashMap<String, ClientCore>,
}

type ClientJob = Box<dyn FnOnce(&mut WsClientStore) + Send + 'static>;

// Marks the owner thread while a job runs: a job that calls back into the
// store would wait on its own reply forever, so `client_op` panics instead.
thread_local! {
    static IN_CLIENT_JOB: std::cell::Cell<bool> = std::cell::Cell::new(false);
}

struct InClientJob;

impl InClientJob {
    fn enter() -> Self {
        IN_CLIENT_JOB.with(|f| f.set(true));
        InClientJob
    }
}

impl Drop for InClientJob {
    fn drop(&mut self) { IN_CLIENT_JOB.with(|f| f.set(false)); }
}

/// Who dials a slot's socket: the store elects exactly one caller.
enum ConnectClaim {
    Connected,
    Wait,
    Claimed,
}

/// Wake this client's waiters. The generation is what `watch::Receiver::changed`
/// compares, so a waiter that armed before the change still sees it.
fn bump(c: &mut ClientCore) {
    let next = *c.gen_tx.borrow() + 1;
    let _ = c.gen_tx.send(next);
}

/// Settle an open single-flight and clear its `futures` entry, so the next
/// cycle elects a fresh leader. False when `hash` names no open flight.
fn core_flight_settle(c: &mut ClientCore, hash: &str, res: Result<Value, Value>) -> bool {
    match c.flights.get_mut(hash) {
        Some(slot) if slot.open => {
            slot.open = false;
            slot.settled = Some(res);
        }
        _ => return false,
    }
    c.futures.remove(hash);
    true
}

/// Hand `f` to the store's owner thread and return its result.
fn client_op<R, F>(f: F) -> R
where
    R: Send + 'static,
    F: FnOnce(&mut WsClientStore) -> R + Send + 'static,
{
    if IN_CLIENT_JOB.with(|flag| flag.get()) {
        panic!("ccxt: ws client job called back into the client store (would deadlock)");
    }
    let (tx, rx) = std::sync::mpsc::sync_channel::<Result<R, Box<dyn std::any::Any + Send>>>(1);
    let job: ClientJob = Box::new(move |store: &mut WsClientStore| {
        let _ = tx.send(std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| f(store))));
    });
    if WS_CLIENTS_TX.send(job).is_err() {
        panic!("ccxt: ws client owner is gone");
    }
    match rx.recv() {
        Ok(Ok(v)) => v,
        Ok(Err(payload)) => std::panic::resume_unwind(payload),
        Err(_) => panic!("ccxt: ws client owner dropped the reply"),
    }
}

static WS_CLIENTS_TX: Lazy<mpsc::UnboundedSender<ClientJob>> = Lazy::new(|| {
    let (tx, mut rx) = mpsc::unbounded_channel::<ClientJob>();
    std::thread::Builder::new()
        .name("ccxt-ws-clients".to_string())
        .spawn(move || {
            let mut store = WsClientStore::default();
            while let Some(job) = rx.blocking_recv() {
                let _in_job = InClientJob::enter();
                job(&mut store);
            }
        })
        .expect("ccxt: cannot start the ws client owner");
    tx
});

/// Monotonic-ish wall clock in ms. `SystemTime` is fine here (keep-alive only).
fn now_ms() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0)
}

/// Decode a text frame into a `Value` — JSON when it parses, else a raw string
/// (some venues send bare `"pong"` etc. that `handle_message` matches on).
fn parse_text(t: &str) -> Value {
    match serde_json::from_str::<serde_json::Value>(t) {
        Ok(j) => Value::from_json(&j),
        Err(_) => Value::Str(t.to_string().into()),
    }
}

/// Decode a binary frame: try raw-inflate then gzip (the two schemes venues
/// use), fall back to the bytes as UTF-8. Then parse as text.
fn parse_binary(b: &[u8]) -> Value {
    use std::io::Read;
    // gzip
    {
        let mut d = flate2::read::GzDecoder::new(b);
        let mut s = String::new();
        if d.read_to_string(&mut s).is_ok() && !s.is_empty() {
            return parse_text(&s);
        }
    }
    // raw deflate (no zlib header)
    {
        let mut d = flate2::read::DeflateDecoder::new(b);
        let mut s = String::new();
        if d.read_to_string(&mut s).is_ok() && !s.is_empty() {
            return parse_text(&s);
        }
    }
    // Uncompressed and valid UTF-8 → parse as text/JSON (covers venues that
    // send plain-JSON frames over the binary opcode).
    if let Ok(s) = std::str::from_utf8(b) {
        return parse_text(s);
    }
    // Genuine binary payload (e.g. mexc protobuf): carry the raw bytes through
    // as the port's byte-array form so `isBinaryMessage`/`decodeProtoMsg` see them.
    crate::exchange_stubs::bytes_to_value(b)
}

/// Decode a binary frame for a client with `decompressBinary` off (mexc
/// protobuf, paradex SBE): JSON is still read as text, as some venues send it
/// over the binary opcode, everything else is carried through as raw bytes.
/// No utf-8 fallback here: a binary payload can pass for utf-8 text.
fn parse_raw_binary(b: &[u8]) -> Value {
    match serde_json::from_slice::<serde_json::Value>(b) {
        Ok(j) => Value::from_json(&j),
        Err(_) => crate::exchange_stubs::bytes_to_value(b),
    }
}

impl ClientState {
    /// Read this client's core on the owner thread. The caller is the observer,
    /// so this does not wake waiters.
    fn with<R, F>(&self, f: F) -> R
    where
        R: Send + 'static,
        F: FnOnce(&mut ClientCore) -> R + Send + 'static,
    {
        let url = self.url.clone();
        client_op(move |s| match s.clients.get_mut(&url) {
            Some(c) => f(c),
            None => panic!("ccxt: no ws client state for {url}"),
        })
    }

    /// Mutate this client's core and wake everyone waiting on it.
    fn with_mut<R, F>(&self, f: F) -> R
    where
        R: Send + 'static,
        F: FnOnce(&mut ClientCore) -> R + Send + 'static,
    {
        let url = self.url.clone();
        client_op(move |s| {
            let c = match s.clients.get_mut(&url) {
                Some(c) => c,
                None => panic!("ccxt: no ws client state for {url}"),
            };
            let r = f(c);
            bump(c);
            r
        })
    }

    /// A receiver armed at the current generation: await `changed ()` on it and
    /// no change published after this call can be missed.
    fn waiter(&self) -> watch::Receiver<u64> {
        let mut rx = self.gen_rx.clone();
        rx.borrow_and_update();
        rx
    }

    fn push_incoming(&self, v: Value) {
        self.with_mut(move |c| c.incoming.push_back(v));
    }

    /// Await the next inbound message. `None` once the socket is closed and
    /// the backlog is drained. The waiter is armed before the queue is read, so
    /// a resolve/push racing the await is never lost.
    pub async fn next_message(&self) -> Option<Value> {
        let mock = self.with(|c| c.mock);
        let mut rx = self.waiter();
        loop {
            let next = self.with(|c| c.incoming.pop_front());
            if next.is_some() {
                return next;
            }
            if self.with(|c| c.closed) {
                return None;
            }
            if mock {
                // Static WS test: the mock queue is fed by the frame injector.
                // If nothing arrives within a short window the fixture is
                // finished (or under-feeds this watch) — stop instead of
                // blocking the drive loop forever, so the test completes.
                if tokio::time::timeout(std::time::Duration::from_millis(1500), rx.changed()).await.is_err() {
                    return None;
                }
            } else if rx.changed().await.is_err() {
                return None;
            }
        }
    }

    /// Store a resolved value for `hash` (TS `client.resolve`). Also settles an
    /// open single-flight on the same hash: TS's `client.resolve ()` settles
    /// the future AND removes it from `client.futures`, which is what lets the
    /// next cycle elect a fresh leader. Both paths run — a hash can in
    /// principle be someone's flight and someone else's `watch`, and only the
    /// waiter that exists will read its side.
    pub fn resolve(&self, hash: &str, value: Value) {
        let h = hash.to_string();
        self.with_mut(move |c| {
            core_flight_settle(c, &h, Ok(value.clone()));
            c.resolved.insert(h.clone(), value);
        });
    }

    /// Store an error for `hash` (TS `client.reject`), settling an open
    /// single-flight on the same hash — see `resolve`.
    pub fn reject(&self, hash: &str, err: Value) {
        let h = hash.to_string();
        self.with_mut(move |c| {
            core_flight_settle(c, &h, Err(err.clone()));
            c.rejections.insert(h.clone(), err);
        });
    }

    /// If any of `hashes` has a resolved value or rejection, remove and return
    /// it (`Ok` for value, `Err` for rejection). Rejections take priority.
    pub fn take_settled(&self, hashes: &[String]) -> Option<Result<Value, Value>> {
        let hs = hashes.to_vec();
        self.with(move |c| {
            for h in &hs {
                if let Some(e) = c.rejections.remove(h) {
                    return Some(Err(e));
                }
            }
            for h in &hs {
                if let Some(v) = c.resolved.remove(h) {
                    return Some(Ok(v));
                }
            }
            None
        })
    }

    /// Register interest in `hashes` (TS `client.future`). Returns true if the
    /// subscribe frame still needs sending for `subscribe_hash`.
    pub fn note_futures(&self, hashes: &[String]) {
        let hs = hashes.to_vec();
        self.with(move |c| {
            for h in hs {
                c.futures.insert(h);
            }
        });
    }

    /// Open a single-flight for `hash`, or join one already in progress. `true`
    /// means this caller is the leader and must do the work; `false` means a
    /// flight is already open and the caller should wait on it.
    ///
    /// The insert into `futures` is what makes the transpiled
    /// `if (messageHash in client.futures)` follower test observable, and it
    /// happens in the same store job as the check — TS's documented
    /// "atomic check-and-insert".
    pub fn flight_begin(&self, hash: &str) -> bool {
        let h = hash.to_string();
        self.with(move |c| match c.flights.get_mut(&h) {
            // Open flight — join it as a follower.
            Some(slot) if slot.open => false,
            // Closed: re-open, keeping the last value for anyone who re-awaits
            // without new work being done.
            Some(slot) => {
                slot.open = true;
                c.futures.insert(h.clone());
                true
            }
            None => {
                c.flights.insert(h.clone(), FlightSlot { open: true, settled: None });
                c.futures.insert(h);
                true
            }
        })
    }

    /// The flight's last outcome, if it has one. Does NOT consume it: every
    /// waiter must be able to observe the same result.
    pub fn flight_peek(&self, hash: &str) -> Option<Result<Value, Value>> {
        let h = hash.to_string();
        self.with(move |c| c.flights.get(&h).and_then(|s| s.settled.clone()))
    }

    /// Whether a flight for `hash` exists and is still open.
    pub fn flight_is_open(&self, hash: &str) -> bool {
        let h = hash.to_string();
        self.with(move |c| c.flights.get(&h).map(|s| s.open).unwrap_or(false))
    }

    /// Settle an open flight and wake its waiters. Returns false (and does
    /// nothing) when `hash` names no open flight, so `resolve`/`reject` can
    /// fall through to their normal watch-hash behaviour.
    pub fn flight_settle(&self, hash: &str, res: Result<Value, Value>) -> bool {
        let h = hash.to_string();
        self.with_mut(move |c| core_flight_settle(c, &h, res))
    }

    /// Record `subscribe_hash` → `subscription`; returns true the first time
    /// (so the caller sends the subscribe frame exactly once). Mirrors TS
    /// `client.subscriptions[subscribeHash] = subscription || true`.
    pub fn subscribe_once(&self, subscribe_hash: &str, subscription: Value) -> bool {
        let sh = subscribe_hash.to_string();
        self.with(move |c| {
            if c.subscriptions.contains_key(&sh) {
                return false;
            }
            let stored = if matches!(subscription, Value::Null) {
                Value::Bool(true)
            } else {
                subscription
            };
            c.subscriptions.insert(sh, stored);
            true
        })
    }

    /// Directly set a subscription entry (TS `client.subscriptions[h] = x`
    /// written from `handle_message`).
    pub fn set_subscription(&self, subscribe_hash: &str, subscription: Value) {
        let sh = subscribe_hash.to_string();
        self.with(move |c| {
            c.subscriptions.insert(sh, subscription);
        });
    }

    pub fn is_subscribed(&self, subscribe_hash: &str) -> bool {
        let sh = subscribe_hash.to_string();
        self.with(move |c| c.subscriptions.contains_key(&sh))
    }

    pub fn send_text(&self, s: String) -> bool {
        if std::env::var("CCXT_WS_DEBUG").is_ok() { eprintln!("[wssend] {}", s.chars().take(200).collect::<String>()); }
        // Static-WS-test mock transport: record the frame (JSON-parsed, like the
        // TS `client.connection.send` stub) instead of hitting a socket.
        self.with(move |c| {
            if c.mock {
                c.mock_sent.push(parse_text(&s));
                return true;
            }
            c.outgoing.send(Message::Text(s)).is_ok()
        })
    }

    /// Keep-alive frame straight onto the writer queue (false once it is gone).
    fn send_ping(&self) -> bool {
        self.with(|c| c.outgoing.send(Message::Ping(Vec::new())).is_ok())
    }

    /// Enable the mock transport: mark connected (so `ensure_client` never opens
    /// a socket) and route `send_text` to the capture buffer.
    pub fn mock_enable(&self) {
        self.with_mut(|c| {
            c.mock = true;
            c.connected = true;
        });
    }
    /// Injected inbound frame → the same queue the socket reader feeds.
    pub fn mock_inject(&self, msg: Value) {
        self.with_mut(move |c| c.incoming.push_back(msg));
    }
    pub fn is_mock(&self) -> bool { self.with(|c| c.mock) }
    /// The captured outgoing frames as a `Value::List`.
    pub fn mock_sent_value(&self) -> Value {
        self.with(|c| Value::Array(c.mock_sent.clone()))
    }
    pub fn has_pending_futures(&self) -> bool {
        self.with(|c| !c.futures.is_empty())
    }
    /// Whether the mock inbound queue still holds un-consumed frames.
    pub fn has_queued_messages(&self) -> bool {
        self.with(|c| !c.incoming.is_empty())
    }
    /// Pop the oldest un-consumed inbound frame (static-WS harness: replay the
    /// acks an unWatch* fixture holds beyond the one that resolved the call).
    pub fn pop_queued_message(&self) -> Option<Value> {
        self.with(|c| c.incoming.pop_front())
    }
    pub fn mark_ws_test_completed(&self) { self.with(|c| c.ws_test_completed = true); }
    pub fn is_ws_test_completed(&self) -> bool { self.with(|c| c.ws_test_completed) }
    /// Reject every pending future so a fixture whose frames don't resolve the
    /// watch fails (with a message) rather than hanging the drive loop.
    pub fn reject_pending_futures(&self, err: Value) {
        self.with_mut(move |c| {
            let hashes: Vec<String> = c.futures.iter().cloned().collect();
            for h in hashes {
                core_flight_settle(c, &h, Err(err.clone()));
                c.rejections.insert(h, err.clone());
            }
        });
    }

    pub fn is_closed(&self) -> bool {
        self.with(|c| c.closed)
    }

    pub fn is_connected(&self) -> bool {
        self.with(|c| c.connected)
    }

    pub fn on_pong(&self) {
        self.with(|c| c.last_pong_ms = now_ms());
    }

    /// Drop resolved/rejected/subscription/future state,
    /// e.g. after a reconnect so stale hashes don't resolve new waiters.
    /// Internal wipe only — the transpiled `client.reset(error)` goes through
    /// `reset_with_error` below, which delivers the error first.
    pub fn reset(&self) {
        self.with(|c| {
            c.resolved.clear();
            c.rejections.clear();
            c.subscriptions.clear();
            c.futures.clear();
            c.flights.clear();
        });
    }

    /// TS `client.reset(error)` — reject every pending future/flight with the
    /// error so waiters fail fast instead of hanging, then drop the pending
    /// future state. Mirrors the js/php/c#/go/java/python clients: rejections
    /// are kept (they carry the error to the waiters), delivered-but-not-taken
    /// `resolved` values are kept (in TS an already-resolved future is settled
    /// — `reject` on it is a no-op — so its waiter still gets the value), and
    /// subscriptions are left to the caller — the TS `Client.reset` does not
    /// clear them either.
    pub fn reset_with_error(&self, error: Value) {
        self.with_mut(move |c| {
            let hashes: Vec<String> = c.futures.iter().cloned().collect();
            for h in &hashes {
                if c.resolved.contains_key(h) {
                    continue;
                }
                core_flight_settle(c, h, Err(error.clone()));
                c.rejections.insert(h.clone(), error.clone());
            }
            c.futures.clear();
        });
    }

    /// Snapshot of `subscriptions` as a `Value::Map { hash: subscription }` —
    /// the shape the transpiled `get_value(&client, "subscriptions")` reads.
    /// Tagged with `__ws_subs_url` so that writes performed on the snapshot
    /// (`client.subscriptions[chanId] = …`, common in bitfinex/chan-id venues)
    /// route back to this live `ClientState` instead of a discarded clone.
    pub fn subscriptions_value(&self) -> Value {
        let url = self.url.clone();
        self.with(move |c| {
            let mut m = indexmap::IndexMap::new();
            m.insert("__ws_subs_url".to_string(), Value::Str(url.clone().into()));
            for (h, sub) in c.subscriptions.iter() {
                // Tag each subscription DICT with a back-reference so a field write
                // on it (`subscription['receivedSnapshot'] = true`) persists to this
                // live client — venues mutate a subscription retrieved from
                // client.subscriptions and rely on JS object identity.
                let tagged = match sub {
                    Value::Dict(d) => {
                        let mut inner = (**d).clone();
                        inner.insert("__ws_sub_ref".to_string(),
                            Value::Str(format!("{}\u{1}{}", url, h).into()));
                        Value::Dict(std::sync::Arc::new(inner))
                    }
                    other => other.clone(),
                };
                m.insert(h.clone(), tagged);
            }
            Value::Map(m)
        })
    }

    /// Set a field on a stored subscription dict (`client.subscriptions[hash]
    /// [key] = val`). Creates the entry if missing.
    pub fn set_subscription_field(&self, hash: &str, key: &str, val: Value) {
        let h = hash.to_string();
        let k = key.to_string();
        self.with(move |c| {
            if matches!(c.subscriptions.get(&h), Some(Value::Dict(_))) {
                if let Some(Value::Dict(d)) = c.subscriptions.get_mut(&h) {
                    std::sync::Arc::make_mut(d).insert(k, val);
                }
            } else {
                let mut inner = indexmap::IndexMap::new();
                inner.insert(k, val);
                c.subscriptions.insert(h, Value::Dict(std::sync::Arc::new(inner)));
            }
        });
    }

    /// Snapshot of `futures` as a `Value::Map { hash: true }`.
    pub fn futures_value(&self) -> Value {
        let url = self.url.clone();
        self.with(move |c| {
            let mut m = indexmap::IndexMap::new();
            for h in c.futures.iter() {
                // Each entry is a future *handle* carrying the url + its own hash, so
                // transpiled `client.futures[hash].resolve(x)` (bitget/cryptocom auth)
                // routes back to this client — see value_resolve/value_reject.
                let mut fh = indexmap::IndexMap::new();
                fh.insert("url".to_string(), Value::Str(url.clone().into()));
                fh.insert("__ws_future_hash".to_string(), Value::Str(h.clone().into()));
                m.insert(h.clone(), Value::Map(fh));
            }
            Value::Map(m)
        })
    }
}

/// Get the existing client for `url`, or `None` if not yet connected.
pub fn get_client(url: &str) -> Option<Arc<ClientState>> {
    let u = url.to_string();
    client_op(move |s| {
        s.clients.get(&u).filter(|c| !c.closed).map(|c| c.handle.clone())
    })
}

/// `client.subscriptions[key] = val` written on a tagged snapshot — persist it
/// to the live client so subsequent `handle_message` snapshots see it.
pub fn value_subs_insert(url: &str, key: &str, val: Value) {
    if let Some(c) = get_client(url) { c.set_subscription(key, val); }
}

/// `delete client.subscriptions[key]` on a tagged snapshot.
pub fn value_subs_remove(url: &str, key: &str) {
    let k = key.to_string();
    if let Some(c) = get_client(url) { c.with(move |core| { core.subscriptions.remove(&k); }); }
}

/// `client.subscriptions[hash][key] = val` written on a tagged subscription
/// dict (carrying `__ws_sub_ref` = "url\u{1}hash").
pub fn value_sub_field_write(subref: &str, key: &str, val: Value) {
    if let Some((url, hash)) = subref.split_once('\u{1}') {
        if let Some(c) = get_client(url) { c.set_subscription_field(hash, key, val); }
    }
}

/// Ensure a live connection to `url`, connecting (and spawning the reader /
/// writer / keep-alive tasks) if needed. Idempotent per URL.
/// Open an HTTP CONNECT tunnel to `proxy` and hand the raw stream to
/// tungstenite. `connect_async` has no proxy support of its own, so a venue
/// reached through `wsProxy` / `wssProxy` has to be dialed this way.
fn upgrade_request(
    url: &str,
    headers: &[(String, String)],
) -> Result<tokio_tungstenite::tungstenite::handshake::client::Request, String> {
    use tokio_tungstenite::tungstenite::client::IntoClientRequest;
    use tokio_tungstenite::tungstenite::http::{HeaderName, HeaderValue};
    let mut request = url
        .into_client_request()
        .map_err(|e| format!("[NetworkError] ws url {url}: {e}"))?;
    for (key, value) in headers {
        let name = HeaderName::from_bytes(key.as_bytes())
            .map_err(|e| format!("[BadRequest] ws header {key}: {e}"))?;
        let value = HeaderValue::from_str(value)
            .map_err(|e| format!("[BadRequest] ws header {key}: {e}"))?;
        request.headers_mut().insert(name, value);
    }
    Ok(request)
}

async fn connect_via_proxy(
    url: &str,
    headers: &[(String, String)],
    proxy: &str,
) -> Result<tokio_tungstenite::WebSocketStream<
        tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>>, String> {
    use tokio::io::{AsyncReadExt, AsyncWriteExt};
    let target = url::Url::parse(url).map_err(|e| format!("[NetworkError] ws url {url}: {e}"))?;
    let host = target.host_str().ok_or_else(|| format!("[NetworkError] ws url {url} has no host"))?;
    let port = target.port_or_known_default().unwrap_or(443);
    let p = url::Url::parse(proxy).map_err(|e| format!("[NetworkError] ws proxy {proxy}: {e}"))?;
    let p_host = p.host_str().ok_or_else(|| format!("[NetworkError] ws proxy {proxy} has no host"))?;
    let p_port = p.port_or_known_default().unwrap_or(8080);
    let mut stream = tokio::net::TcpStream::connect((p_host, p_port))
        .await
        .map_err(|e| format!("[NetworkError] ws proxy connect {proxy}: {e}"))?;
    let connect = format!(
        "CONNECT {host}:{port} HTTP/1.1\r\nHost: {host}:{port}\r\nProxy-Connection: Keep-Alive\r\n\r\n"
    );
    stream
        .write_all(connect.as_bytes())
        .await
        .map_err(|e| format!("[NetworkError] ws proxy CONNECT {proxy}: {e}"))?;
    let mut head = Vec::new();
    let mut byte = [0u8; 1];
    while !head.ends_with(b"\r\n\r\n") {
        let n = stream
            .read(&mut byte)
            .await
            .map_err(|e| format!("[NetworkError] ws proxy CONNECT {proxy}: {e}"))?;
        if n == 0 {
            return Err(format!("[NetworkError] ws proxy {proxy} closed during CONNECT"));
        }
        head.push(byte[0]);
        if head.len() > 8192 {
            return Err(format!("[NetworkError] ws proxy {proxy} sent an oversized CONNECT reply"));
        }
    }
    let status = String::from_utf8_lossy(&head);
    let first = status.lines().next().unwrap_or_default();
    if !first.contains(" 200") {
        return Err(format!("[NetworkError] ws proxy {proxy} refused CONNECT: {first}"));
    }
    let (ws, _resp) = tokio_tungstenite::client_async_tls(upgrade_request(url, headers)?, stream)
        .await
        .map_err(|e| format!("[NetworkError] ws connect {url} via {proxy}: {e}"))?;
    Ok(ws)
}

pub async fn ensure_client(url: &str, proxy: Option<String>, decompress_binary: bool) -> Result<Arc<ClientState>, String> {
    ensure_client_with_headers(url, &[], proxy, decompress_binary).await
}

/// `ensure_client` with extra upgrade-request headers (TS `options.ws.options.headers`).
pub async fn ensure_client_with_headers(
    url: &str,
    headers: &[(String, String)],
    proxy: Option<String>,
    decompress_binary: bool,
) -> Result<Arc<ClientState>, String> {
    let state = ensure_slot(url);
    // The store elects exactly one dialer per slot; a caller that loses the
    // election waits for that dial and then takes the claim itself, so two
    // callers never open two sockets.
    loop {
        let mut rx = state.waiter();
        match state.with(|c| {
            if c.connected {
                ConnectClaim::Connected
            } else if c.connecting {
                ConnectClaim::Wait
            } else {
                c.connecting = true;
                ConnectClaim::Claimed
            }
        }) {
            ConnectClaim::Connected => return Ok(state),
            ConnectClaim::Claimed => break,
            ConnectClaim::Wait => {
                if rx.changed().await.is_err() {
                    return Err(format!("[NetworkError] ws {url} client owner is gone"));
                }
            }
        }
    }
    let dialled = match proxy.as_deref().filter(|p| !p.is_empty()) {
        Some(p) => connect_via_proxy(url, headers, p).await,
        None => match upgrade_request(url, headers) {
            Ok(req) => tokio_tungstenite::connect_async(req)
                .await
                .map(|(ws, _resp)| ws)
                .map_err(|e| format!("[NetworkError] ws connect {url}: {e}")),
            Err(e) => Err(e),
        },
    };
    let ws = match dialled {
        Ok(ws) => ws,
        Err(e) => {
            state.with_mut(|c| c.connecting = false);
            return Err(e);
        }
    };
    let (mut write, mut read) = ws.split();
    let maybe_rx = state.with(|c| c.pending_rx.take());
    let mut rx = match maybe_rx {
        Some(rx) => rx,
        None => {
            let e = format!("[NetworkError] ws {url} slot has no writer channel");
            state.with_mut(|c| c.connecting = false);
            return Err(e);
        }
    };
    state.with_mut(|c| c.last_pong_ms = now_ms());

    // Writer task: drain the outgoing queue to the socket.
    tokio::spawn(async move {
        while let Some(msg) = rx.recv().await {
            if write.send(msg).await.is_err() {
                break;
            }
        }
        let _ = write.close().await;
    });

    // Reader task: decode frames → incoming queue.
    let st = state.clone();
    tokio::spawn(async move {
        while let Some(frame) = read.next().await {
            match frame {
                Ok(Message::Text(t)) => st.push_incoming(parse_text(&t)),
                Ok(Message::Binary(b)) => st.push_incoming(if decompress_binary { parse_binary(&b) } else { parse_raw_binary(&b) }),
                Ok(Message::Pong(_)) => st.on_pong(),
                // tungstenite answers Ping frames with Pong automatically.
                Ok(Message::Ping(_)) => {}
                Ok(Message::Close(_)) | Err(_) => break,
                _ => {}
            }
        }
        st.with_mut(|c| {
            c.connected = false;
            c.closed = true;
        });
    });

    // Keep-alive: an unsolicited Ping every 30s; the peer's Pong updates
    // last_pong. (Full miss-count RequestTimeout handling is a later refinement.)
    let st2 = state.clone();
    tokio::spawn(async move {
        let mut iv = tokio::time::interval(std::time::Duration::from_secs(30));
        iv.tick().await; // first tick fires immediately; skip it
        loop {
            iv.tick().await;
            if st2.is_closed() {
                break;
            }
            if !st2.send_ping() {
                break;
            }
        }
    });

    state.with_mut(|c| {
        c.connected = true;
        c.connecting = false;
    });
    Ok(state)
}

/// Live read of a client handle's `subscriptions` / `futures` field, straight
/// from the registry so a read after a write (upbit builds its subscribe frame
/// from subscriptions it just set) is coherent, not a stale embedded snapshot.
pub fn client_field_live(url: &str, field: &str) -> Value {
    match get_client(url) {
        Some(c) if field == "futures" => c.futures_value(),
        Some(c) => c.subscriptions_value(),
        None => Value::Map(indexmap::IndexMap::new()),
    }
}

/// Get-or-create the registry slot for `url` WITHOUT connecting the socket, so
/// `client.subscriptions` written before `watch()` connects still persist.
fn ensure_slot(url: &str) -> Arc<ClientState> {
    let u = url.to_string();
    client_op(move |s| {
        if let Some(c) = s.clients.get(&u) {
            if !c.closed {
                return c.handle.clone();
            }
        }
        let (out_tx, out_rx) = mpsc::unbounded_channel::<Message>();
        let (gen_tx, gen_rx) = watch::channel(0u64);
        let handle = Arc::new(ClientState { url: u.clone(), gen_rx });
        s.clients.insert(u.clone(), ClientCore {
            handle: handle.clone(),
            outgoing: out_tx,
            pending_rx: Some(out_rx),
            connecting: false,
            incoming: VecDeque::new(),
            resolved: HashMap::new(),
            rejections: HashMap::new(),
            subscriptions: HashMap::new(),
            futures: HashSet::new(),
            flights: HashMap::new(),
            connected: false,
            closed: false,
            last_pong_ms: now_ms(),
            mock: false,
            mock_sent: Vec::new(),
            ws_test_completed: false,
            gen_tx,
        });
        handle
    })
}

/// Remove (and thereby disconnect) the client for `url`. The core stays owned by
/// the store so a handle still in flight keeps addressing its own state, but it
/// is marked closed and no longer handed out.
pub fn drop_client(url: &str) {
    let u = url.to_string();
    client_op(move |s| {
        if let Some(c) = s.clients.get_mut(&u) {
            c.closed = true;
            c.connected = false;
            bump(c);
        }
    });
}

// ── `Value`-handle bridge ────────────────────────────────────────────────────
//
// The transpiled `handle_message(&mut self, client: Value, message: Value)`
// receives a *client* as a `Value`. We model it as `Value::Map { "url": <url>,
// "subscriptions": <snapshot>, "futures": <snapshot> }`. The `Value` methods
// `resolve`/`reject`/`send`/… (in value.rs) extract `url` and route here.

// ── Static-WS-test mock transport (url-keyed façade over ClientState) ────────

/// `setupWsMockTransport(url)` — register a connected, socket-less client whose
/// sends are captured. Clears any prior state so each fixture starts fresh.
pub fn mock_setup(url: &str) {
    let c = ensure_slot(url);
    c.with_mut(|core| {
        core.resolved.clear();
        core.rejections.clear();
        core.subscriptions.clear();
        core.futures.clear();
        core.flights.clear();
        core.mock = true;
        core.connected = true;
        core.mock_sent.clear();
        // Discard any messages left unconsumed by a prior test on the same URL
        // (e.g. a heartbeat a watchTrades drive loop returned past before
        // reading) so they don't leak an extra handler dispatch / sent frame.
        core.incoming.clear();
        core.ws_test_completed = false;
    });
}
pub fn mock_inject(url: &str, msg: Value) {
    if let Some(c) = get_client(url) { c.mock_inject(msg); }
}
pub fn mock_sent_messages(url: &str) -> Value {
    match get_client(url) { Some(c) => c.mock_sent_value(), None => Value::Array(vec![]) }
}
pub fn mock_has_pending_futures(url: &str) -> bool {
    get_client(url).map(|c| c.has_pending_futures()).unwrap_or(false)
}
pub fn mock_has_queued_messages(url: &str) -> bool {
    get_client(url).map(|c| c.has_queued_messages()).unwrap_or(false)
}
pub fn mock_pop_message(url: &str) -> Option<Value> {
    get_client(url).and_then(|c| c.pop_queued_message())
}
pub fn mock_mark_completed(url: &str) {
    if let Some(c) = get_client(url) { c.mark_ws_test_completed(); }
}
pub fn mock_is_completed(url: &str) -> bool {
    get_client(url).map(|c| c.is_ws_test_completed()).unwrap_or(true)
}
pub fn mock_reject_futures(url: &str) {
    if let Some(c) = get_client(url) {
        c.reject_pending_futures(Value::Str(
            "[ExchangeError] static ws test: the injected messages did not resolve the watch future".to_string().into()));
    }
}

/// Build the client-handle `Value` passed to `handle_message`: the URL plus
/// live snapshots of `subscriptions` / `futures` (the fields venues read via
/// `get_value(&client, "subscriptions")`).
pub fn client_value(url: &str) -> Value {
    // Pre-register the slot so subscriptions written on this handle (before the
    // socket connects) persist and read back — upbit-style subscribe building.
    let c = ensure_slot(url);
    let mut m = indexmap::IndexMap::new();
    m.insert("url".to_string(), Value::Str(url.to_string().into()));
    m.insert("subscriptions".to_string(), c.subscriptions_value());
    m.insert("futures".to_string(), c.futures_value());
    Value::Map(m)
}

/// Typed client handle for the ws drive loop (units R01/R10).
///
/// The loop owns one per frame and hands it to the venue's `handle_message`;
/// venues read the four fields it exposes instead of `get_value` on a box.
/// Writes to `subscriptions`/`futures` reach the live client by tag.
#[allow(dead_code)]
#[derive(Clone)]
pub struct ClientHandle {
    /// `client.url` — `Value::Str` when the handle names a url, else `Null`.
    pub url: Value,
    /// `client.subscriptions`, exactly what `get_value` used to read.
    pub subscriptions: Value,
    /// `client.futures` (open single-flights on this client).
    pub futures: Value,
    /// `client.rejections`.
    pub rejections: Value,
    value: Value,
}

#[allow(dead_code)]
impl ClientHandle {
    pub fn from_value(value: Value) -> ClientHandle {
        let read = |k: &str| crate::get_value(&value, &Value::Str(k.to_string().into()));
        ClientHandle {
            url: read("url"),
            subscriptions: read("subscriptions"),
            futures: read("futures"),
            rejections: read("rejections"),
            value,
        }
    }

    pub fn url(&self) -> Option<String> {
        match &self.url { Value::Str(s) => Some(s.to_string()), _ => None }
    }

    /// The `Value` handle the untyped generated handlers take.
    pub fn as_value(&self) -> Value { self.value.clone() }

    pub fn resolve(&self, args: &[Value]) -> Value { value_resolve(&self.value, args) }
    pub fn reject(&self, args: &[Value]) -> Value { value_reject(&self.value, args) }
    pub fn send(&self, args: &[Value]) -> Value { value_send(&self.value, args) }
    pub fn reset(&self, error: Value) -> Value { value_reset(&self.value, error) }
    pub fn on_pong(&self) -> Value { value_on_pong(&self.value) }
    pub fn as_map(&self) -> Option<&indexmap::IndexMap<String, Value>> {
        self.value.as_map()
    }

    /// `delete client.subscriptions[key]`: drops the live client's entry and
    /// the handle's snapshot entry (what `remove(&mut subscriptions, key)` did).
    pub fn remove_subscription(&mut self, key: &Value) {
        if let (Value::Dict(m), Value::Str(k)) = (&mut self.subscriptions, key) {
            crate::value::try_ws_subs_remove(m, k);
            Arc::make_mut(m).shift_remove(k.as_ref());
        }
    }

    /// `client.subscriptions[key] = val`: writes the live client and the
    /// handle's snapshot (what `add_element_to_object(&mut subscriptions, ..)` did).
    pub fn add_subscription(&mut self, key: &Value, val: Value) {
        match (&mut self.subscriptions, key) {
            (Value::Dict(m), Value::Str(k)) => {
                crate::value::try_ws_subs_write(m, k, &val);
                Arc::make_mut(m).insert(k.to_string(), val);
            }
            (other, _) => crate::runtime::add_element_to_object(other, key, val),
        }
    }
    pub fn future(&self, args: &[Value]) -> Value {
        self.value.future(args)
    }
    pub fn reusable_future(&self, msg_hash: Value) -> Value {
        self.value.reusable_future(msg_hash)
    }
}

/// Open-or-join the single-flight for `hash` on `url`, creating the registry
/// slot if the client has not been dialed yet (venue `authenticate` parks its
/// flights on a never-dialed pseudo-url, because the real user-data url embeds
/// the credential the flight is fetching).
pub fn begin_flight(url: &str, hash: &str) -> bool {
    ensure_slot(url).flight_begin(hash)
}


/// The `Value` a `client.future ()` / `client.reusableFuture ()` call hands
/// back: enough to find the flight again (its client's url + the hash). TS
/// returns a real Future object; a `Value` can't hold one, so the port returns
/// a handle and `ws_await_flight` does the awaiting.
pub fn flight_handle(url: &str, hash: &str, led: bool) -> Value {
    let mut m = indexmap::IndexMap::new();
    m.insert("url".to_string(), Value::Str(url.to_string().into()));
    m.insert("__ws_flight_hash".to_string(), Value::Str(hash.to_string().into()));
    // Whether the call that produced this handle opened the flight. A leader
    // settles its own flight (and TS's `await future` resolves the instant it
    // does), so it must never block on itself — including when the venue
    // decides, after taking the lead, that there is no work to do because it
    // is already subscribed (bitget's `authenticate`).
    m.insert("__ws_flight_led".to_string(), Value::Bool(led));
    Value::Map(m)
}

/// The hash a flight handle refers to. Accepts the `futures_value ()` handle
/// shape too, so `client.futures[hash]` entries can be awaited as well.
fn flight_hash_of(handle: &Value) -> Option<String> {
    for key in ["__ws_flight_hash", "__ws_future_hash"] {
        if let Value::Str(h) = crate::get_value(handle, &Value::Str(key.to_string().into())) {
            return Some(h.to_string());
        }
    }
    None
}

/// Await a flight handle — the port of TS's `await client.future (hash)` and
/// of the trailing `await future` a single-flight leader runs after settling.
///
/// Returns the resolved value; a rejected flight panics with the error, which
/// is how the port rethrows (the drive loop does the same with `take_settled`).
/// A handle that names no flight returns `Value::Null` rather than hanging.
pub async fn ws_await_flight(handle: &Value) -> Value {
    let (url, hash) = match (url_of(handle), flight_hash_of(handle)) {
        (Some(u), Some(h)) => (u, h),
        _ => return Value::Null,
    };
    let client = match get_client(&url) {
        Some(c) => c,
        None => return Value::Null,
    };
    let settled = client.flight_peek(&hash);
    // The leader: its own `client.resolve ()` has already run by the time it
    // reaches its trailing await, so take the value and go. Waiting here would
    // deadlock the (common) case where the venue took the lead and then found
    // it had nothing to do.
    let led = matches!(
        crate::get_value(handle, &Value::Str("__ws_flight_led".into())),
        Value::Bool(true)
    );
    if led || !client.flight_is_open(&hash) {
        return match settled {
            Some(Ok(v)) => v,
            Some(Err(e)) => panic!(
                "{}",
                match &e {
                    Value::Str(s) => s.clone(),
                    v => crate::runtime::stringify_param(v).into(),
                }
            ),
            // A flight that never opened is not an error — the value it would
            // have carried is already in the venue's own cache, which is what
            // the caller reads next.
            None => Value::Null,
        };
    }
    let budget = if client.is_mock() {
        std::time::Duration::from_millis(1500)
    } else {
        std::time::Duration::from_secs(60)
    };
    let deadline = tokio::time::Instant::now() + budget;
    loop {
        // Arm the wakeup before peeking, so a settle racing this loop is never
        // missed (same pattern as `next_message`).
        let mut rx = client.waiter();
        if let Some(res) = client.flight_peek(&hash) {
            return match res {
                Ok(v) => v,
                Err(e) => panic!(
                    "{}",
                    match &e {
                        Value::Str(s) => s.clone(),
                        v => crate::runtime::stringify_param(v).into(),
                    }
                ),
            };
        }
        if !client.flight_is_open(&hash) {
            // Closed without a value (reset between fixture cases).
            return Value::Null;
        }
        if tokio::time::timeout_at(deadline, rx.changed()).await.is_err() {
            panic!(
                "[NetworkError] timed out waiting for the in-flight '{}' on {}",
                hash, url
            );
        }
    }
}

/// Extract the `url` from a client-handle `Value` (`Map{"url": ...}`).
pub fn url_of(client: &Value) -> Option<String> {
    match crate::get_value(client, &Value::Str("url".into())) {
        Value::Str(s) => Some(s.to_string()),
        _ => None,
    }
}

fn hash_str(v: &Value) -> Option<String> {
    match v {
        Value::Str(s) => Some(s.to_string()),
        _ => None,
    }
}

/// `client.resolve(value, messageHash)` routed by URL. Returns `value`.
pub fn value_resolve(client: &Value, args: &[Value]) -> Value {
    let value = args.get(0).cloned().unwrap_or(Value::Null);
    // `client.futures[hash].resolve(value)` — the future handle carries its own
    // hash, so there is no second arg. Resolve that hash.
    if let Some(hash) = future_hash_of(client) {
        if let Some(url) = url_of(client) {
            if let Some(c) = get_client(&url) { c.resolve(&hash, value.clone()); }
        }
        return value;
    }
    if let (Some(url), Some(hash)) = (url_of(client), args.get(1).and_then(hash_str)) {
        if let Some(c) = get_client(&url) {
            c.resolve(&hash, value.clone());
        }
    }
    value
}

/// Extract the hash a future handle (`client.futures[hash]`) resolves/rejects.
fn future_hash_of(client: &Value) -> Option<String> {
    match crate::get_value(client, &Value::Str("__ws_future_hash".into())) {
        Value::Str(s) => Some(s.to_string()),
        _ => None,
    }
}

/// `client.reject(error, messageHash)` routed by URL.
pub fn value_reject(client: &Value, args: &[Value]) -> Value {
    let err = args.get(0).cloned().unwrap_or(Value::Null);
    // `client.futures[hash].reject(error)` — future handle carries its own hash.
    if let Some(hash) = future_hash_of(client) {
        if let Some(url) = url_of(client) {
            if let Some(c) = get_client(&url) { c.reject(&hash, err.clone()); }
        }
        return err;
    }
    if let Some(url) = url_of(client) {
        if let Some(c) = get_client(&url) {
            match args.get(1).and_then(hash_str) {
                Some(hash) => c.reject(&hash, err.clone()),
                // reject with no hash → reject every pending future.
                None => c.reject_pending_futures(err.clone()),
            }
        }
    }
    err
}

/// `client.send(message)` routed by URL. Serialises non-string payloads to JSON.
pub fn value_send(client: &Value, args: &[Value]) -> Value {
    if let Some(url) = url_of(client) {
        if let Some(c) = get_client(&url) {
            let payload = match args.get(0) {
                Some(Value::Str(s)) => s.to_string(),
                Some(v) => v.to_json().to_string(),
                None => String::new().into(),
            };
            c.send_text(payload);
        }
    }
    Value::Null
}

/// `client.reset(...)` routed by URL. An arg-less `client.reset()` reaches
/// here with `Value::Null` — there is no error to deliver, so fall back to
/// the internal wipe rather than rejecting every waiter with a null error.
pub fn value_reset(client: &Value, error: Value) -> Value {
    if let Some(url) = url_of(client) {
        if let Some(c) = get_client(&url) {
            if matches!(error, Value::Null) {
                c.reset();
            } else {
                c.reset_with_error(error);
            }
        }
    }
    Value::Null
}

/// `client.on_pong(...)` routed by URL.
pub fn value_on_pong(client: &Value) -> Value {
    if let Some(url) = url_of(client) {
        if let Some(c) = get_client(&url) {
            c.on_pong();
        }
    }
    Value::Null
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio_tungstenite::tungstenite::Message as WsMessage;

    // A minimal mock exchange WS server: accepts one connection, waits for a
    // subscribe frame, then streams a few JSON "ticker" messages. Proves the
    // full connect → send(subscribe) → receive → parse → resolve round-trip
    // without touching a live venue.
    async fn spawn_mock_server() -> String {
        let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
        let addr = listener.local_addr().unwrap();
        tokio::spawn(async move {
            if let Ok((stream, _)) = listener.accept().await {
                let mut ws = tokio_tungstenite::accept_async(stream).await.unwrap();
                // Wait for the client's subscribe frame.
                if let Some(Ok(WsMessage::Text(sub))) = ws.next().await {
                    assert!(sub.contains("subscribe"), "expected subscribe, got {sub}");
                }
                // Stream three ticker updates.
                for px in ["100.5", "101.0", "101.5"] {
                    let msg = format!("{{\"channel\":\"ticker\",\"symbol\":\"BTC/USDT\",\"last\":\"{px}\"}}");
                    ws.send(WsMessage::Text(msg)).await.unwrap();
                }
                // Give the client time to drain before closing.
                tokio::time::sleep(std::time::Duration::from_millis(50)).await;
                let _ = ws.close(None).await;
            }
        });
        format!("ws://{addr}")
    }

    // The transpiled `client.reset(error)` path (`value_reset` →
    // `reset_with_error`): a pending watch hash must observe the error (not
    // hang), a delivered-but-not-taken value must survive the reset, and an
    // arg-less `client.reset()` (error = `Value::Null`) must fall back to the
    // silent wipe instead of rejecting waiters with a null error.
    #[test]
    fn value_reset_rejects_pending_futures() {
        let url = "ws://reset-with-error.test";
        mock_setup(url);
        let client = get_client(url).expect("mock client");
        client.note_futures(&["pending".to_string(), "delivered".to_string()]);
        client.resolve("delivered", Value::Str("payload".into()));

        let handle = client_value(url);
        let error = Value::Str("[InvalidNonce] gap detected".into());
        value_reset(&handle, error.clone());

        // The pending waiter fails fast with the reset error…
        assert_eq!(
            client.take_settled(&["pending".to_string()]),
            Some(Err(error))
        );
        // …while the already-delivered value still reaches its waiter.
        assert_eq!(
            client.take_settled(&["delivered".to_string()]),
            Some(Ok(Value::Str("payload".into())))
        );
        assert!(!client.has_pending_futures());

        // Arg-less reset: silent wipe, nothing settled with a null error.
        client.note_futures(&["pending2".to_string()]);
        value_reset(&handle, Value::Null);
        assert_eq!(client.take_settled(&["pending2".to_string()]), None);
        assert!(!client.has_pending_futures());

        drop_client(url);
    }

    #[tokio::test]
    async fn upgrade_request_carries_option_headers() {
        use tokio_tungstenite::tungstenite::handshake::server::{Request, Response};
        let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
        let addr = listener.local_addr().unwrap();
        let (tx, rx) = tokio::sync::oneshot::channel::<Option<String>>();
        tokio::spawn(async move {
            if let Ok((stream, _)) = listener.accept().await {
                let mut seen = None;
                let callback = |req: &Request, resp: Response| {
                    seen = req.headers().get("X-Gate-Size-Decimal").map(|v| v.to_str().unwrap().to_string());
                    Ok(resp)
                };
                let ws = tokio_tungstenite::accept_hdr_async(stream, callback).await.unwrap();
                let _ = tx.send(seen);
                drop(ws);
            }
        });
        let url = format!("ws://{addr}");
        let headers = vec![("X-Gate-Size-Decimal".to_string(), "1".to_string())];
        ensure_client_with_headers(&url, &headers, None, true).await.expect("connect");
        assert_eq!(rx.await.unwrap().as_deref(), Some("1"));
        drop_client(&url);
    }

    #[tokio::test]
    async fn transport_roundtrip() {
        let url = spawn_mock_server().await;
        let client = ensure_client(&url, None, true).await.expect("connect");

        // Send a subscribe frame once (idempotent per hash).
        assert!(client.subscribe_once("ticker:BTC/USDT", Value::Null));
        assert!(!client.subscribe_once("ticker:BTC/USDT", Value::Null));
        assert!(client.send_text("{\"op\":\"subscribe\",\"channel\":\"ticker\"}".to_string()));

        // Drive: pull each inbound message, mimic handle_message resolving the
        // "ticker" hash, and collect the resolved values.
        let mut lasts = Vec::new();
        while lasts.len() < 3 {
            let msg = client.next_message().await.expect("message before close");
            let last = crate::get_value(&msg, &Value::Str("last".into()));
            if let Value::Str(s) = &last {
                client.resolve("ticker", Value::Str(s.clone()));
            }
            if let Some(Ok(Value::Str(v))) = client.take_settled(&["ticker".to_string()]) {
                lasts.push(v);
            }
        }
        assert_eq!(lasts, vec!["100.5", "101.0", "101.5"]);

        // Field snapshots the transpiled code reads off the client handle.
        let subs = client.subscriptions_value();
        assert!(crate::runtime::is_true(&crate::get_value(
            &subs,
            &Value::Str("ticker:BTC/USDT".into())
        )));

        drop_client(&url);
    }

    // A minimal Core whose `handle_message` resolves the "ticker" hash with the
    // inbound message's `last` field — exactly what a real venue's
    // handle_message does. Lets us drive the *actual* `watch()` runtime end to
    // end (connect → subscribe → frame → dispatch_to_derived("handle_message")
    // → resolve → return) against the mock server, independent of venue quirks.
    struct TestWsCore {
        exchange: crate::exchange::Exchange,
    }
    impl std::ops::Deref for TestWsCore {
        type Target = crate::exchange::Exchange;
        fn deref(&self) -> &Self::Target {
            &self.exchange
        }
    }
    impl std::ops::DerefMut for TestWsCore {
        fn deref_mut(&mut self) -> &mut Self::Target {
            &mut self.exchange
        }
    }
    impl crate::exchange::DerivedExchange for TestWsCore {}
    impl crate::exchange_generated::ExchangeBase for TestWsCore {
        fn call_dynamic<'a>(
            &'a mut self,
            method: &'a str,
            args: Vec<Value>,
        ) -> std::pin::Pin<Box<dyn std::future::Future<Output = Value> + Send + 'a>> {
            Box::pin(async move {
                match method {
                    "handle_message" => {
                        let client = args.get(0).cloned().unwrap_or(Value::Null);
                        let message = args.get(1).cloned().unwrap_or(Value::Null);
                        let last = crate::get_value(&message, &Value::Str("last".into()));
                        // `client.resolve(value, messageHash)` — routes to the registry.
                        client.resolve(&[last, Value::Str("ticker".into())]);
                        Value::Null
                    }
                    _ => self.call_dynamic_base(method, args).await,
                }
            })
        }
    }

    #[tokio::test]
    async fn watch_drive_loop_end_to_end() {
        use crate::exchange::ExchangeRuntime;
        let url = spawn_mock_server().await;
        let mut core = TestWsCore {
            exchange: crate::exchange::Exchange::new(None),
        };
        // Drive the real base `watch()`: connect, send subscribe, read frames,
        // dispatch each to handle_message, return once "ticker" resolves.
        let result = ExchangeRuntime::watch(
            &mut core,
            Value::Str(url.clone().into()),
            Value::Str("ticker".into()),
            &[
                Value::Str("{\"op\":\"subscribe\",\"channel\":\"ticker\"}".into()),
                Value::Str("ticker".into()),
                Value::Null,
            ],
        )
        .await;
        // First streamed ticker.
        assert_eq!(result, Value::Str("100.5".into()));
        drop_client(&url);
    }

    // ── single-flight (client.future / client.reusableFuture) ───────────────
    //
    // The venue `authenticate` idiom: the first caller leads and fetches the
    // credential, concurrent callers join the flight and wake when it settles.
    // Regression cover for the port's original no-op `future()` stub, where
    // every caller led and nobody waited.

    #[tokio::test]
    async fn flight_elects_one_leader_and_registers_it() {
        let url = "flight-test-election";
        let c = ensure_slot(url);
        assert!(c.flight_begin("authenticate:future"), "first caller leads");
        assert!(!c.flight_begin("authenticate:future"), "second caller follows");
        // The follower's `messageHash in client.futures` test must see it.
        assert!(in_op_futures(&c, "authenticate:future"));
        drop_client(url);
    }

    #[tokio::test]
    async fn flight_settle_wakes_waiters_and_reopens() {
        let url = "flight-test-settle";
        let c = ensure_slot(url);
        assert!(c.flight_begin("auth"));
        // Every waiter observes the value — settling must not consume it.
        c.resolve("auth", Value::Str("listen-key".into()));
        assert_eq!(
            ws_await_flight(&flight_handle(url, "auth", false)).await,
            Value::Str("listen-key".into())
        );
        assert_eq!(
            ws_await_flight(&flight_handle(url, "auth", false)).await,
            Value::Str("listen-key".into())
        );
        // Settled ⇒ cleared from `futures`, so the next cycle re-leads rather
        // than parking every caller on the follower branch forever.
        assert!(!in_op_futures(&c, "auth"));
        assert!(c.flight_begin("auth"), "a settled flight re-elects");
        drop_client(url);
    }

    #[tokio::test]
    async fn flight_follower_waits_for_the_leader() {
        let url = "flight-test-wait";
        let c = ensure_slot(url);
        assert!(c.flight_begin("auth"));
        let settler = {
            let c = c.clone();
            tokio::spawn(async move {
                tokio::time::sleep(std::time::Duration::from_millis(60)).await;
                c.resolve("auth", Value::Str("late".into()));
            })
        };
        let started = std::time::Instant::now();
        let got = ws_await_flight(&flight_handle(url, "auth", false)).await;
        assert_eq!(got, Value::Str("late".into()));
        assert!(started.elapsed() >= std::time::Duration::from_millis(50), "waited for the leader");
        settler.await.unwrap();
        drop_client(url);
    }

    #[tokio::test]
    async fn a_leader_never_blocks_on_its_own_flight() {
        // A venue can take the lead and then find it has nothing to do — bitget
        // re-`authenticate`s on an already-subscribed client. Its trailing
        // `await future` must return, not wait for a settle that never comes.
        let url = "flight-test-leader";
        let c = ensure_slot(url);
        let led = c.flight_begin("authenticated");
        assert!(led);
        let started = std::time::Instant::now();
        assert_eq!(
            ws_await_flight(&flight_handle(url, "authenticated", led)).await,
            Value::Null
        );
        assert!(started.elapsed() < std::time::Duration::from_millis(200), "returned at once");
        // Having led once and settled, the value is still there for a re-await.
        c.resolve("authenticated", Value::Bool(true));
        let led2 = c.flight_begin("authenticated");
        assert_eq!(
            ws_await_flight(&flight_handle(url, "authenticated", led2)).await,
            Value::Bool(true),
            "a re-lead with no new work reports the last value"
        );
        drop_client(url);
    }

    #[tokio::test]
    async fn flight_handle_without_a_flight_returns_null() {
        // Never-opened flight: return rather than hang, the value the caller
        // wanted is already in the venue's own cache.
        let url = "flight-test-missing";
        ensure_slot(url);
        assert_eq!(ws_await_flight(&flight_handle(url, "nope", false)).await, Value::Null);
        drop_client(url);
    }

    /// The transpiled follower test, `messageHash in client.futures`.
    fn in_op_futures(c: &Arc<ClientState>, hash: &str) -> bool {
        !matches!(
            crate::get_value(&c.futures_value(), &Value::Str(hash.to_string().into())),
            Value::Null
        )
    }

    #[tokio::test]
    async fn parse_helpers() {
        // JSON text → dict; non-JSON → Value::Str.
        assert!(matches!(parse_text("{\"a\":1}"), Value::Dict(_)));
        assert_eq!(parse_text("pong"), Value::Str("pong".into()));
        // gzip binary → parsed JSON.
        use std::io::Write;
        let mut e = flate2::write::GzEncoder::new(Vec::new(), flate2::Compression::default());
        e.write_all(b"{\"x\":true}").unwrap();
        let gz = e.finish().unwrap();
        assert!(matches!(parse_binary(&gz), Value::Dict(_)));
    }

    #[test]
    fn raw_binary_frames_stay_bytes() {
        // an SBE heartbeat header is all small integers, so the frame is valid
        // utf-8, it must still reach the exchange as bytes with decompressBinary off
        let frame: Vec<u8> = vec![0x10, 0x00, 0x28, 0x00, 0x01, 0x00, 0x02, 0x00, 0x41, 0x42, 0x43, 0x01];
        assert!(std::str::from_utf8(&frame).is_ok());
        assert_eq!(parse_raw_binary(&frame), crate::exchange_stubs::bytes_to_value(&frame));
        // json over the binary opcode is still parsed
        assert!(matches!(parse_raw_binary(b"{\"x\":true}"), Value::Dict(_)));
    }
}
