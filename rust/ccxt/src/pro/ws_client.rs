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
    /// Parsed inbound messages awaiting dispatch to `handle_message`.
    incoming: Mutex<VecDeque<Value>>,
    /// Woken on: new inbound message, a resolve/reject, or close.
    notify: Notify,
    /// messageHash → resolved value (set by `handle_message` via `resolve`).
    resolved: Mutex<HashMap<String, Value>>,
    /// messageHash → error (set by `reject`; delivered before/instead of value).
    rejections: Mutex<HashMap<String, Value>>,
    /// subscribeHash set — a subscribe frame is sent only the first time.
    subscriptions: Mutex<HashSet<String>>,
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

    /// Mark `subscribe_hash` subscribed; returns true the first time (so the
    /// caller sends the subscribe frame exactly once).
    pub fn subscribe_once(&self, subscribe_hash: &str) -> bool {
        self.subscriptions.lock().unwrap().insert(subscribe_hash.to_string())
    }

    pub fn is_subscribed(&self, subscribe_hash: &str) -> bool {
        self.subscriptions.lock().unwrap().contains(subscribe_hash)
    }

    pub fn send_text(&self, s: String) -> bool {
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

    /// Snapshot of `subscriptions` as a `Value::Map { hash: true }` — the shape
    /// the transpiled `get_value(&client, "subscriptions")` reads.
    pub fn subscriptions_value(&self) -> Value {
        let subs = self.subscriptions.lock().unwrap();
        let mut m = indexmap::IndexMap::new();
        for h in subs.iter() {
            m.insert(h.clone(), Value::Bool(true));
        }
        Value::Map(m)
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

/// Ensure a live connection to `url`, connecting (and spawning the reader /
/// writer / keep-alive tasks) if needed. Idempotent per URL.
pub async fn ensure_client(url: &str) -> Result<Arc<ClientState>, String> {
    if let Some(c) = get_client(url) {
        return Ok(c);
    }
    let (ws, _resp) = tokio_tungstenite::connect_async(url)
        .await
        .map_err(|e| format!("[NetworkError] ws connect {url}: {e}"))?;
    let (mut write, mut read) = ws.split();
    let (tx, mut rx) = mpsc::unbounded_channel::<Message>();

    let state = Arc::new(ClientState {
        url: url.to_string(),
        outgoing: tx,
        incoming: Mutex::new(VecDeque::new()),
        notify: Notify::new(),
        resolved: Mutex::new(HashMap::new()),
        rejections: Mutex::new(HashMap::new()),
        subscriptions: Mutex::new(HashSet::new()),
        futures: Mutex::new(HashSet::new()),
        connected: Mutex::new(true),
        closed: Mutex::new(false),
        last_pong_ms: Mutex::new(now_ms()),
    });

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

    REGISTRY.lock().unwrap().insert(url.to_string(), state.clone());
    Ok(state)
}

/// Remove (and thereby drop / disconnect) the client for `url`.
pub fn drop_client(url: &str) {
    REGISTRY.lock().unwrap().remove(url);
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
        assert!(client.subscribe_once("ticker:BTC/USDT"));
        assert!(!client.subscribe_once("ticker:BTC/USDT"));
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
