#pragma once

// C++ analogue of ts/src/base/ws/Client.ts. The static ws tests run through a
// MOCK transport: connect() settles the connected future without dialing and
// send() records the outgoing frame, so everything above the socket
// (subscriptions, futures, caches, message routing) runs unmodified. A real
// transport (Boost.Beast etc) plugs into the same seams later.
//
// Threading contract (mirrors the JS harness's polling protocol):
//   * the watch side blocks on a future (ws::Future::get)
//   * the injector side calls exchange.handleMessage -> client.resolve/reject
//     on ANOTHER thread
//   * hence futures/rejections/subscriptions are mutex-guarded here.
//
// The dict/list fields use ccxt's reference-semantic containers so generated
// code can read AND mutate them through getValue/setValue with JS aliasing
// semantics (client.subscriptions[hash] = ... sticks).

#include "Future.h"
#include "../Errors.h"
#include "../Value.h"

#include <any>
#include <memory>
#include <mutex>
#include <stdexcept>
#include <string>
#include <vector>

namespace ccxt {
namespace ws {

class Client {
public:
    struct Impl {
        std::mutex mutex;
        std::string url;
        // messageHash -> ws::Future
        ccxt::dict futures;
        // messageHash -> rejection reason (JS stores late rejections for
        // futures that do not exist yet)
        ccxt::dict rejections;
        // subscribeHash -> subscription object / true
        ccxt::dict subscriptions;
        // frames sent over the mock transport, already json-parsed
        ccxt::list mockSentMessages;
        bool mockConnected = false;
        bool wsTestCompleted = false;
        int64_t lastPong = 0;
        int64_t keepAlive = 30000;
    };

    Client () : impl (std::make_shared<Impl> ()) {}
    explicit Client (const std::string& url) : impl (std::make_shared<Impl> ()) {
        impl->url = url;
    }

    std::string url () const {
        return impl->url;
    }

    // create-or-fetch the future for a message hash (JS client.future)
    Future future (const std::string& messageHash) {
        std::lock_guard<std::mutex> lock (impl->mutex);
        Future f;
        if (impl->futures.has (messageHash)) {
            f = std::any_cast<Future> (impl->futures.get (messageHash));
        } else {
            f = Future ();
            impl->futures.set (messageHash, std::any (f));
        }
        // deliver a rejection that arrived before the future existed
        if (impl->rejections.has (messageHash)) {
            std::any reason = impl->rejections.get (messageHash);
            impl->rejections.erase (messageHash);
            f.reject (reasonToException (reason));
        }
        return f;
    }

    bool hasFuture (const std::string& messageHash) {
        std::lock_guard<std::mutex> lock (impl->mutex);
        return impl->futures.has (messageHash);
    }

    // settle the future for a message hash (JS client.resolve)
    void resolve (const std::any& result, const std::string& messageHash) {
        std::lock_guard<std::mutex> lock (impl->mutex);
        if (!impl->futures.has (messageHash)) {
            return;
        }
        Future f = std::any_cast<Future> (impl->futures.get (messageHash));
        impl->futures.erase (messageHash);
        f.resolve (result);
    }

    // reject one (or, with empty hash, every pending) future (JS client.reject)
    void reject (const std::any& reason, const std::string& messageHash = "") {
        std::lock_guard<std::mutex> lock (impl->mutex);
        if (messageHash.empty ()) {
            std::vector<std::string> keys;
            for (const auto& kv : impl->futures.entries ()) {
                keys.push_back (kv.first);
            }
            for (const auto& k : keys) {
                Future f = std::any_cast<Future> (impl->futures.get (k));
                impl->futures.erase (k);
                f.reject (reasonToException (reason));
            }
            return;
        }
        if (!impl->futures.has (messageHash)) {
            impl->rejections.set (messageHash, reason);
            return;
        }
        Future f = std::any_cast<Future> (impl->futures.get (messageHash));
        impl->futures.erase (messageHash);
        f.reject (reasonToException (reason));
    }

    // whether any future is currently awaited (JS tests.helpers polling)
    bool hasPendingFutures () {
        std::lock_guard<std::mutex> lock (impl->mutex);
        return impl->futures.size () > 0;
    }

    std::size_t pendingFuturesCount () {
        std::lock_guard<std::mutex> lock (impl->mutex);
        return impl->futures.size ();
    }

    // subscribeHash bookkeeping (JS client.subscriptions)
    bool isSubscribed (const std::string& subscribeHash) {
        std::lock_guard<std::mutex> lock (impl->mutex);
        return impl->subscriptions.has (subscribeHash);
    }

    void setSubscription (const std::string& subscribeHash, const std::any& subscription) {
        std::lock_guard<std::mutex> lock (impl->mutex);
        impl->subscriptions.set (subscribeHash, subscription);
    }

    std::any subscription (const std::string& subscribeHash) {
        std::lock_guard<std::mutex> lock (impl->mutex);
        return impl->subscriptions.has (subscribeHash) ? impl->subscriptions.get (subscribeHash) : std::any {};
    }

    void deleteSubscription (const std::string& subscribeHash) {
        std::lock_guard<std::mutex> lock (impl->mutex);
        impl->subscriptions.erase (subscribeHash);
    }

    // mock transport: mark as connected without dialing (JS tests.helpers)
    void mockConnect () {
        std::lock_guard<std::mutex> lock (impl->mutex);
        impl->mockConnected = true;
    }

    bool isMockConnected () {
        std::lock_guard<std::mutex> lock (impl->mutex);
        return impl->mockConnected;
    }

    // record an outgoing frame (json-parsed) on the mock transport
    void send (const std::any& message) {
        std::lock_guard<std::mutex> lock (impl->mutex);
        impl->mockSentMessages.push (message);
    }

    ccxt::list sentMessages () {
        std::lock_guard<std::mutex> lock (impl->mutex);
        ccxt::list copy = impl->mockSentMessages;
        return copy;
    }

    // test-harness completion flag (JS tests.helpers markWsTestCompleted)
    void markWsTestCompleted () {
        std::lock_guard<std::mutex> lock (impl->mutex);
        impl->wsTestCompleted = true;
    }

    bool isWsTestCompleted () {
        std::lock_guard<std::mutex> lock (impl->mutex);
        return impl->wsTestCompleted;
    }

    void setLastPong (int64_t ms) {
        std::lock_guard<std::mutex> lock (impl->mutex);
        impl->lastPong = ms;
    }

    // live views for getValue/setValue on the generated client.std::any: return
    // copies (dict/list are reference-semantic handles, so mutations propagate)
    ccxt::dict futuresView () {
        std::lock_guard<std::mutex> lock (impl->mutex);
        return impl->futures;
    }

    ccxt::dict subscriptionsView () {
        std::lock_guard<std::mutex> lock (impl->mutex);
        return impl->subscriptions;
    }

    ccxt::dict rejectionsView () {
        std::lock_guard<std::mutex> lock (impl->mutex);
        return impl->rejections;
    }

    ccxt::list sentMessagesView () {
        std::lock_guard<std::mutex> lock (impl->mutex);
        return impl->mockSentMessages;
    }

    // extraction from the any-based world: a client travels through generated
    // code as a std::any holding a Client handle
    static Client of (const std::any& v) {
        return std::any_cast<Client> (v);
    }

    // converts a rejection reason (any) into a rethrowable exception_ptr; used
    // by the wsFutureReject free helper as well
    static std::exception_ptr reasonToException (const std::any& reason) {
        if (reason.type () == typeid (std::exception_ptr)) {
            return std::any_cast<std::exception_ptr> (reason);
        }
        try {
            if (reason.type () == typeid (std::string)) {
                throw std::runtime_error (std::any_cast<std::string> (reason));
            }
            if (reason.type () == typeid (std::shared_ptr<ccxt::BaseError>)) {
                throw *std::any_cast<std::shared_ptr<ccxt::BaseError>> (reason);
            }
            if (reason.type () == typeid (const std::exception*)) {
                // a caught-and-stored pointer: rethrow its object so the dynamic
                // type survives (BaseError/ExchangeError subclasses included)
                const auto* e = std::any_cast<const std::exception*> (reason);
                throw *e;
            }
            throw std::runtime_error ("ws future rejected");
        } catch (...) {
            return std::current_exception ();
        }
    }

    std::shared_ptr<Impl> impl;
    friend class ClientAccess;
};

} // namespace ws
} // namespace ccxt
