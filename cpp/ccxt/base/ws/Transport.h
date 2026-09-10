#pragma once

// Live WebSocket transport for the pro tier, built on Boost.Beast (header-only).
// The static ws tests never use this: mock-connected clients record sends and
// receive frames from the harness. A real exchange client dials through here.
//
// Design: synchronous connect/handshake on the caller thread, then a dedicated
// receive thread blocking in a read loop. Sends come from watch threads under a
// mutex (beast requires a single writer). Beast answers server pings with pongs
// automatically during read. TLS via asio ssl (openssl), hostname verified with
// SNI. On destruction the socket is shut down and the receive thread joined, so
// a process exit with a live watch never leaves a running read thread behind.

#include <boost/asio/connect.hpp>
#include <boost/asio/ip/tcp.hpp>
#include <boost/asio/ssl.hpp>
#include <boost/beast/core.hpp>
#include <boost/beast/ssl.hpp>
#include <boost/beast/websocket.hpp>

#include <atomic>
#include <functional>
#include <mutex>
#include <string>
#include <thread>

namespace ccxt {
namespace ws {

class Transport {
public:
    using MessageFn = std::function<void (const std::string&)>;
    using ErrorFn = std::function<void (const std::string&)>;

    // splits wss://host[:port][/path] -> host, port, target, usesTls
    static void splitUrl (const std::string& url, std::string& host, std::string& port,
                          std::string& target, bool& usesTls) {
        std::string rest = url;
        usesTls = false;
        if (rest.rfind ("wss://", 0) == 0) {
            usesTls = true;
            rest = rest.substr (6);
        } else if (rest.rfind ("ws://", 0) == 0) {
            rest = rest.substr (5);
        }
        const std::size_t slash = rest.find ('/');
        const std::string authority = (slash == std::string::npos) ? rest : rest.substr (0, slash);
        target = (slash == std::string::npos) ? std::string ("/") : rest.substr (slash);
        const std::size_t colon = authority.rfind (':');
        if (colon != std::string::npos && colon > 0) {
            host = authority.substr (0, colon);
            port = authority.substr (colon + 1);
        } else {
            host = authority;
            port = usesTls ? std::string ("443") : std::string ("80");
        }
    }

    Transport ()
        : sslCtx (boost::asio::ssl::context::tls_client),
          resolver (io), ws (io, sslCtx) {
        // asio's tls context starts with an EMPTY trust store; load the system
        // CAs or every wss:// handshake fails with "certificate verify failed"
        boost::system::error_code ec;
        sslCtx.set_default_verify_paths (ec);
        if (ec) {
            sslCtx.load_verify_file ("/etc/ssl/certs/ca-certificates.crt", ec);
        }
    }

    ~Transport () {
        shutdown ();
    }

    // dials and completes the websocket handshake, then starts the receive
    // thread. onMessage receives TEXT frames (payload only, unescaped by beast);
    // onError reports a socket-level failure after which no more messages come.
    void connect (const std::string& url, MessageFn onMessage, ErrorFn onError) {
        std::string host, port, target;
        bool usesTls = false;
        splitUrl (url, host, port, target, usesTls);
        boost::system::error_code ec;
        auto results = resolver.resolve (host, port, ec);
        if (ec) {
            throw std::runtime_error ("ws resolve " + url + ": " + ec.message ());
        }
        boost::asio::connect (ws.next_layer ().next_layer (), results, ec);
        if (ec) {
            throw std::runtime_error ("ws connect " + url + ": " + ec.message ());
        }
        if (usesTls) {
            // SNI so the server selects the right cert; fail hard on a bad chain
            if (!SSL_set_tlsext_host_name (ws.next_layer ().native_handle (), host.c_str ())) {
                throw std::runtime_error ("ws SNI setup failed for " + host);
            }
            ws.next_layer ().set_verify_mode (boost::asio::ssl::verify_peer);
            ws.next_layer ().handshake (boost::asio::ssl::stream_base::client, ec);
            if (ec) {
                throw std::runtime_error ("ws tls handshake " + url + ": " + ec.message ());
            }
        }
        ws.handshake (host, target, ec);
        if (ec) {
            throw std::runtime_error ("ws handshake " + url + ": " + ec.message ());
        }
        messageFn = std::move (onMessage);
        errorFn = std::move (onError);
        running.store (true);
        receiveThread = std::thread ([this] () { receiveLoop (); });
    }

    // text send from any thread (mutex-guarded: beast allows one writer)
    void send (const std::string& text) {
        std::lock_guard<std::mutex> lock (sendMutex);
        if (!running.load ()) {
            return;
        }
        boost::system::error_code ec;
        ws.write (boost::asio::buffer (text), ec);
        if (ec && errorFn) {
            errorFn (std::string ("ws send: ") + ec.message ());
        }
    }

    void shutdown () {
        if (!running.exchange (false)) {
            return;
        }
        boost::system::error_code ec;
        // unblock a read blocked in recv; the close frame flush is best-effort
        ws.next_layer ().next_layer ().cancel (ec);
        ws.next_layer ().next_layer ().close (ec);
        if (receiveThread.joinable ()) {
            receiveThread.join ();
        }
    }

private:
    void receiveLoop () {
        try {
            boost::beast::flat_buffer buffer;
            while (running.load ()) {
                buffer.clear ();
                boost::system::error_code ec;
                ws.read (buffer, ec);
                if (ec) {
                    if (running.load () && errorFn) {
                        errorFn (std::string ("ws read: ") + ec.message ());
                    }
                    break;
                }
                if (ws.got_text () && messageFn) {
                    messageFn (boost::beast::buffers_to_string (buffer.data ()));
                }
                // ping/pong and close frames are handled by beast itself
            }
        } catch (const std::exception& e) {
            if (running.load () && errorFn) {
                errorFn (std::string ("ws receive: ") + e.what ());
            }
        }
        running.store (false);
    }

    boost::asio::io_context io;
    boost::asio::ssl::context sslCtx;
    boost::asio::ip::tcp::resolver resolver;
    boost::beast::websocket::stream<boost::beast::ssl_stream<boost::asio::ip::tcp::socket>> ws;
    MessageFn messageFn;
    ErrorFn errorFn;
    std::mutex sendMutex;
    std::atomic<bool> running { false };
    std::thread receiveThread;
};

} // namespace ws
} // namespace ccxt
