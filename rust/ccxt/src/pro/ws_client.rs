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
//! registry keyed by URL (behind its own locks) keeps it disjoint from the
//! `&mut Exchange` borrow, so the drive loop can read the next frame and call
//! `handle_message(self, client, msg)` without aliasing.

#![allow(dead_code)]

use std::collections::{HashMap, HashSet, VecDeque};
use std::sync::{Arc, Mutex};

use futures::{SinkExt, StreamExt};
use once_cell::sync::Lazy;
use tokio::sync::{mpsc, Notify};
use tokio_tungstenite::tungstenite::Message;

use crate::Value;

/// Per-connection state. Lives in [`REGISTRY`] behind an `Arc`, so both the
/// background reader/writer tasks and the `watch` drive loop share it.
pub struct ClientState {
    pub url: String,
    /// Frames queued for the writer task → socket.
    outgoing: mpsc::UnboundedSender<Message>,
    /// Receiver half held until the socket connects (a slot is pre-registered
    /// before connecting so `client.subscriptions` writes persist — upbit builds
    /// its subscribe frame from subscriptions set before the socket is up). The
    /// writer task takes this on connect.
    pending_rx: Mutex<Option<mpsc::UnboundedReceiver<Message>>>,
    /// Serializes the (async) connect so concurrent `ensure_client`s for a
    /// pre-registered slot don't open two sockets.
    connect_gate: tokio::sync::Mutex<()>,
    /// Parsed inbound messages awaiting dispatch to `handle_message`.
    incoming: Mutex<VecDeque<Value>>,
    /// Woken on: new inbound message, a resolve/reject, or close.
    notify: Notify,
    /// messageHash → resolved value (set by `handle_message` via `resolve`).
    resolved: Mutex<HashMap<String, Value>>,
    /// messageHash → error (set by `reject`; delivered before/instead of value).
    rejections: Mutex<HashMap<String, Value>>,
    /// subscribeHash → subscription object (TS `client.subscriptions[hash]`).
    /// A subscribe frame is sent only the first time a hash is inserted.
    subscriptions: Mutex<HashMap<String, Value>>,
    /// messageHashes some `watch` call is currently waiting on. Mirrors TS
    /// `client.futures` (read by a few venues' `handle_message`).
    futures: Mutex<HashSet<String>>,
    connected: Mutex<bool>,
    closed: Mutex<bool>,
    last_pong_ms: Mutex<i64>,
}

static REGISTRY: Lazy<Mutex<HashMap<String, Arc<ClientState>>>> =
    Lazy::new(|| Mutex::new(HashMap::new()));

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
        Err(_) => Value::Str(t.to_string()),
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
    parse_text(&String::from_utf8_lossy(b))
}

impl ClientState {
    fn push_incoming(&self, v: Value) {
        self.incoming.lock().unwrap().push_back(v);
        self.notify.notify_waiters();
    }

    /// Await the next inbound message. `None` once the socket is closed and
    /// the backlog is drained. Uses the create-future-before-check pattern so
    /// a resolve/push racing the await is never lost.
    pub async fn next_message(&self) -> Option<Value> {
        loop {
            let notified = self.notify.notified();
            if let Some(v) = self.incoming.lock().unwrap().pop_front() {
                return Some(v);
            }
            if *self.closed.lock().unwrap() {
                return None;
            }
            notified.await;
        }
    }

    /// Store a resolved value for `hash` (TS `client.resolve`).
    pub fn resolve(&self, hash: &str, value: Value) {
        if std::env::var("CCXT_WS_DEBUG").is_ok() {
            eprintln!("[wsresolve] {}", hash);
        }
        self.resolved.lock().unwrap().insert(hash.to_string(), value);
        self.notify.notify_waiters();
    }

    /// Store an error for `hash` (TS `client.reject`).
    pub fn reject(&self, hash: &str, err: Value) {
        self.rejections.lock().unwrap().insert(hash.to_string(), err);
        self.notify.notify_waiters();
    }

    /// If any of `hashes` has a resolved value or rejection, remove and return
    /// it (`Ok` for value, `Err` for rejection). Rejections take priority.
    pub fn take_settled(&self, hashes: &[String]) -> Option<Result<Value, Value>> {
        {
            let mut rj = self.rejections.lock().unwrap();
            for h in hashes {
                if let Some(e) = rj.remove(h) {
                    return Some(Err(e));
                }
            }
        }
        let mut r = self.resolved.lock().unwrap();
        for h in hashes {
            if let Some(v) = r.remove(h) {
                return Some(Ok(v));
            }
        }
        None
    }

    /// Register interest in `hashes` (TS `client.future`). Returns true if the
    /// subscribe frame still needs sending for `subscribe_hash`.
    pub fn note_futures(&self, hashes: &[String]) {
        let mut f = self.futures.lock().unwrap();
        for h in hashes {
            f.insert(h.clone());
        }
    }

    /// Record `subscribe_hash` → `subscription`; returns true the first time
    /// (so the caller sends the subscribe frame exactly once). Mirrors TS
    /// `client.subscriptions[subscribeHash] = subscription || true`.
    pub fn subscribe_once(&self, subscribe_hash: &str, subscription: Value) -> bool {
        let mut subs = self.subscriptions.lock().unwrap();
        if subs.contains_key(subscribe_hash) {
            return false;
        }
        let stored = if matches!(subscription, Value::Null) {
            Value::Bool(true)
        } else {
            subscription
        };
        subs.insert(subscribe_hash.to_string(), stored);
        true
    }

    /// Directly set a subscription entry (TS `client.subscriptions[h] = x`
    /// written from `handle_message`).
    pub fn set_subscription(&self, subscribe_hash: &str, subscription: Value) {
        self.subscriptions.lock().unwrap().insert(subscribe_hash.to_string(), subscription);
    }

    pub fn is_subscribed(&self, subscribe_hash: &str) -> bool {
        self.subscriptions.lock().unwrap().contains_key(subscribe_hash)
    }

    pub fn send_text(&self, s: String) -> bool {
        if std::env::var("CCXT_WS_DEBUG").is_ok() { eprintln!("[wssend] {}", s.chars().take(200).collect::<String>()); }
        self.outgoing.send(Message::Text(s)).is_ok()
    }

    pub fn is_closed(&self) -> bool {
        *self.closed.lock().unwrap()
    }

    pub fn on_pong(&self) {
        *self.last_pong_ms.lock().unwrap() = now_ms();
    }

    /// Drop resolved/rejected/subscription/future state (TS `client.reset`),
    /// e.g. after a reconnect so stale hashes don't resolve new waiters.
    pub fn reset(&self) {
        self.resolved.lock().unwrap().clear();
        self.rejections.lock().unwrap().clear();
        self.subscriptions.lock().unwrap().clear();
        self.futures.lock().unwrap().clear();
    }

    /// Snapshot of `subscriptions` as a `Value::Map { hash: subscription }` —
    /// the shape the transpiled `get_value(&client, "subscriptions")` reads.
    /// Tagged with `__ws_subs_url` so that writes performed on the snapshot
    /// (`client.subscriptions[chanId] = …`, common in bitfinex/chan-id venues)
    /// route back to this live `ClientState` instead of a discarded clone.
    pub fn subscriptions_value(&self) -> Value {
        let subs = self.subscriptions.lock().unwrap();
        let mut m = indexmap::IndexMap::new();
        m.insert("__ws_subs_url".to_string(), Value::Str(self.url.clone()));
        for (h, sub) in subs.iter() {
            // Tag each subscription DICT with a back-reference so a field write
            // on it (`subscription['receivedSnapshot'] = true`) persists to this
            // live client — venues mutate a subscription retrieved from
            // client.subscriptions and rely on JS object identity.
            let tagged = match sub {
                Value::Dict(d) => {
                    let mut inner = (**d).clone();
                    inner.insert("__ws_sub_ref".to_string(),
                        Value::Str(format!("{}\u{1}{}", self.url, h)));
                    Value::Dict(std::sync::Arc::new(inner))
                }
                other => other.clone(),
            };
            m.insert(h.clone(), tagged);
        }
        Value::Map(m)
    }

    /// Set a field on a stored subscription dict (`client.subscriptions[hash]
    /// [key] = val`). Creates the entry if missing.
    pub fn set_subscription_field(&self, hash: &str, key: &str, val: Value) {
        let mut subs = self.subscriptions.lock().unwrap();
        match subs.get_mut(hash) {
            Some(Value::Dict(d)) => { std::sync::Arc::make_mut(d).insert(key.to_string(), val); }
            _ => {
                let mut inner = indexmap::IndexMap::new();
                inner.insert(key.to_string(), val);
                subs.insert(hash.to_string(), Value::Dict(std::sync::Arc::new(inner)));
            }
        }
    }

    /// Snapshot of `futures` as a `Value::Map { hash: true }`.
    pub fn futures_value(&self) -> Value {
        let f = self.futures.lock().unwrap();
        let mut m = indexmap::IndexMap::new();
        for h in f.iter() {
            m.insert(h.clone(), Value::Bool(true));
        }
        Value::Map(m)
    }
}

/// Get the existing client for `url`, or `None` if not yet connected.
pub fn get_client(url: &str) -> Option<Arc<ClientState>> {
    let reg = REGISTRY.lock().unwrap();
    reg.get(url).filter(|c| !c.is_closed()).cloned()
}

/// `client.subscriptions[key] = val` written on a tagged snapshot — persist it
/// to the live client so subsequent `handle_message` snapshots see it.
pub fn value_subs_insert(url: &str, key: &str, val: Value) {
    if let Some(c) = get_client(url) { c.set_subscription(key, val); }
}

/// `delete client.subscriptions[key]` on a tagged snapshot.
pub fn value_subs_remove(url: &str, key: &str) {
    if let Some(c) = get_client(url) { c.subscriptions.lock().unwrap().remove(key); }
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
pub async fn ensure_client(url: &str) -> Result<Arc<ClientState>, String> {
    let state = ensure_slot(url);
    if *state.connected.lock().unwrap() {
        return Ok(state);
    }
    // Serialize connect; re-check under the gate (another task may have just
    // connected this slot). Lock via a cloned Arc so `state` stays movable.
    let gate_holder = state.clone();
    let _gate = gate_holder.connect_gate.lock().await;
    if *state.connected.lock().unwrap() {
        return Ok(state);
    }
    let (ws, _resp) = tokio_tungstenite::connect_async(url)
        .await
        .map_err(|e| format!("[NetworkError] ws connect {url}: {e}"))?;
    let (mut write, mut read) = ws.split();
    let mut rx = state.pending_rx.lock().unwrap().take()
        .ok_or_else(|| format!("[NetworkError] ws {url} slot has no writer channel"))?;
    *state.last_pong_ms.lock().unwrap() = now_ms();

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
                Ok(Message::Binary(b)) => st.push_incoming(parse_binary(&b)),
                Ok(Message::Pong(_)) => st.on_pong(),
                // tungstenite answers Ping frames with Pong automatically.
                Ok(Message::Ping(_)) => {}
                Ok(Message::Close(_)) | Err(_) => break,
                _ => {}
            }
        }
        *st.connected.lock().unwrap() = false;
        *st.closed.lock().unwrap() = true;
        st.notify.notify_waiters();
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
            if st2.outgoing.send(Message::Ping(Vec::new())).is_err() {
                break;
            }
        }
    });

    *state.connected.lock().unwrap() = true;
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
    let mut reg = REGISTRY.lock().unwrap();
    if let Some(c) = reg.get(url) {
        if !c.is_closed() {
            return c.clone();
        }
    }
    let (tx, rx) = mpsc::unbounded_channel::<Message>();
    let state = Arc::new(ClientState {
        url: url.to_string(),
        outgoing: tx,
        pending_rx: Mutex::new(Some(rx)),
        connect_gate: tokio::sync::Mutex::new(()),
        incoming: Mutex::new(VecDeque::new()),
        notify: Notify::new(),
        resolved: Mutex::new(HashMap::new()),
        rejections: Mutex::new(HashMap::new()),
        subscriptions: Mutex::new(HashMap::new()),
        futures: Mutex::new(HashSet::new()),
        connected: Mutex::new(false),
        closed: Mutex::new(false),
        last_pong_ms: Mutex::new(now_ms()),
    });
    reg.insert(url.to_string(), state.clone());
    state
}

/// Remove (and thereby drop / disconnect) the client for `url`.
pub fn drop_client(url: &str) {
    REGISTRY.lock().unwrap().remove(url);
}

// ── `Value`-handle bridge ────────────────────────────────────────────────────
//
// The transpiled `handle_message(&mut self, client: Value, message: Value)`
// receives a *client* as a `Value`. We model it as `Value::Map { "url": <url>,
// "subscriptions": <snapshot>, "futures": <snapshot> }`. The `Value` methods
// `resolve`/`reject`/`send`/… (in value.rs) extract `url` and route here.

/// Build the client-handle `Value` passed to `handle_message`: the URL plus
/// live snapshots of `subscriptions` / `futures` (the fields venues read via
/// `get_value(&client, "subscriptions")`).
pub fn client_value(url: &str) -> Value {
    // Pre-register the slot so subscriptions written on this handle (before the
    // socket connects) persist and read back — upbit-style subscribe building.
    let c = ensure_slot(url);
    let mut m = indexmap::IndexMap::new();
    m.insert("url".to_string(), Value::Str(url.to_string()));
    m.insert("subscriptions".to_string(), c.subscriptions_value());
    m.insert("futures".to_string(), c.futures_value());
    Value::Map(m)
}

/// Extract the `url` from a client-handle `Value` (`Map{"url": ...}`).
pub fn url_of(client: &Value) -> Option<String> {
    match crate::get_value(client, &Value::Str("url".to_string())) {
        Value::Str(s) => Some(s),
        _ => None,
    }
}

fn hash_str(v: &Value) -> Option<String> {
    match v {
        Value::Str(s) => Some(s.clone()),
        _ => None,
    }
}

/// `client.resolve(value, messageHash)` routed by URL. Returns `value`.
pub fn value_resolve(client: &Value, args: &[Value]) -> Value {
    let value = args.get(0).cloned().unwrap_or(Value::Null);
    if let (Some(url), Some(hash)) = (url_of(client), args.get(1).and_then(hash_str)) {
        if let Some(c) = get_client(&url) {
            c.resolve(&hash, value.clone());
        }
    }
    value
}

/// `client.reject(error, messageHash)` routed by URL.
pub fn value_reject(client: &Value, args: &[Value]) -> Value {
    let err = args.get(0).cloned().unwrap_or(Value::Null);
    if let Some(url) = url_of(client) {
        if let Some(c) = get_client(&url) {
            match args.get(1).and_then(hash_str) {
                Some(hash) => c.reject(&hash, err.clone()),
                // reject with no hash → reject every pending future.
                None => {
                    let hashes: Vec<String> = c.futures.lock().unwrap().iter().cloned().collect();
                    for h in hashes {
                        c.reject(&h, err.clone());
                    }
                }
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
                Some(Value::Str(s)) => s.clone(),
                Some(v) => v.to_json().to_string(),
                None => String::new(),
            };
            c.send_text(payload);
        }
    }
    Value::Null
}

/// `client.reset(...)` routed by URL.
pub fn value_reset(client: &Value) -> Value {
    if let Some(url) = url_of(client) {
        if let Some(c) = get_client(&url) {
            c.reset();
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

    #[tokio::test]
    async fn transport_roundtrip() {
        let url = spawn_mock_server().await;
        let client = ensure_client(&url).await.expect("connect");

        // Send a subscribe frame once (idempotent per hash).
        assert!(client.subscribe_once("ticker:BTC/USDT", Value::Null));
        assert!(!client.subscribe_once("ticker:BTC/USDT", Value::Null));
        assert!(client.send_text("{\"op\":\"subscribe\",\"channel\":\"ticker\"}".to_string()));

        // Drive: pull each inbound message, mimic handle_message resolving the
        // "ticker" hash, and collect the resolved values.
        let mut lasts = Vec::new();
        while lasts.len() < 3 {
            let msg = client.next_message().await.expect("message before close");
            let last = crate::get_value(&msg, &Value::Str("last".to_string()));
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
            &Value::Str("ticker:BTC/USDT".to_string())
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
                        let last = crate::get_value(&message, &Value::Str("last".to_string()));
                        // `client.resolve(value, messageHash)` — routes to the registry.
                        client.resolve(&[last, Value::Str("ticker".to_string())]);
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
            Value::Str(url.clone()),
            Value::Str("ticker".to_string()),
            &[
                Value::Str("{\"op\":\"subscribe\",\"channel\":\"ticker\"}".to_string()),
                Value::Str("ticker".to_string()),
                Value::Null,
            ],
        )
        .await;
        // First streamed ticker.
        assert_eq!(result, Value::Str("100.5".to_string()));
        drop_client(&url);
    }

    #[tokio::test]
    async fn parse_helpers() {
        // JSON text → dict; non-JSON → Value::Str.
        assert!(matches!(parse_text("{\"a\":1}"), Value::Dict(_)));
        assert_eq!(parse_text("pong"), Value::Str("pong".to_string()));
        // gzip binary → parsed JSON.
        use std::io::Write;
        let mut e = flate2::write::GzEncoder::new(Vec::new(), flate2::Compression::default());
        e.write_all(b"{\"x\":true}").unwrap();
        let gz = e.finish().unwrap();
        assert!(matches!(parse_binary(&gz), Value::Dict(_)));
    }
}
