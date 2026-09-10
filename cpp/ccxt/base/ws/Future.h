#pragma once

// C++ analogue of ts/src/base/ws/Future.ts. A ws Future is a one-shot promise
// that can be settled from a DIFFERENT thread than the one awaiting it: the
// static ws test harness injects frames on one thread while the watch method
// blocks on the same future on another. Mirrors the JS semantics:
//   * resolve/reject are one-shot: the first settlement wins, later ones no-op
//   * a rejected future rethrows the stored exception on await
//   * race(): the first-arriving settlement wins; losers detach
//
// The Future is copyable and reference-semantic (shared Impl), so it can travel
// through generated code inside a std::any, like the ws caches and orderbooks.

#include <any>
#include <condition_variable>
#include <exception>
#include <functional>
#include <memory>
#include <mutex>
#include <vector>

namespace ccxt {
namespace ws {

class Future {
public:
    struct Impl {
        std::mutex mutex;
        std::condition_variable cv;
        bool settled = false;
        bool rejected = false;
        std::any value;
        std::exception_ptr error;
        // settlement subscribers, invoked OUTSIDE the lock so a subscriber can
        // settle another future without deadlocking (Future.race does exactly that)
        std::vector<std::pair<std::function<void (const std::any&)>,
                              std::function<void (const std::exception_ptr&)>>> listeners;
    };

    Future () : impl (std::make_shared<Impl> ()) {}

    void resolve (const std::any& v) {
        std::vector<std::pair<std::function<void (const std::any&)>,
                              std::function<void (const std::exception_ptr&)>>> fires;
        {
            std::lock_guard<std::mutex> lock (impl->mutex);
            if (impl->settled) {
                return;
            }
            impl->settled = true;
            impl->value = v;
            fires.swap (impl->listeners);
        }
        // notify the waiters FIRST: a throwing listener must not skip the
        // notify and strand every blocked get() waiter
        impl->cv.notify_all ();
        for (const auto& l : fires) {
            try {
                l.first (v);
            } catch (...) {
                // a subscriber that throws must not drop the remaining listeners
            }
        }
    }

    void reject (const std::exception_ptr& e) {
        std::vector<std::pair<std::function<void (const std::any&)>,
                              std::function<void (const std::exception_ptr&)>>> fires;
        {
            std::lock_guard<std::mutex> lock (impl->mutex);
            if (impl->settled) {
                return;
            }
            impl->settled = true;
            impl->rejected = true;
            impl->error = e;
            fires.swap (impl->listeners);
        }
        impl->cv.notify_all ();
        for (const auto& l : fires) {
            try {
                l.second (e);
            } catch (...) {
                // a subscriber that throws must not drop the remaining listeners
            }
        }
    }

    // blocks until settled; returns the value or rethrows the stored error
    std::any get () const {
        std::unique_lock<std::mutex> lock (impl->mutex);
        impl->cv.wait (lock, [&] { return impl->settled; });
        if (impl->rejected) {
            std::rethrow_exception (impl->error);
        }
        return impl->value;
    }

    bool isSettled () const {
        std::lock_guard<std::mutex> lock (impl->mutex);
        return impl->settled;
    }

    // synchronous settlement subscription: fires immediately if already settled,
    // else when resolve/reject lands (possibly from another thread)
    void subscribe (const std::function<void (const std::any&)>& onFulfil,
                    const std::function<void (const std::exception_ptr&)>& onReject) const {
        bool alreadySettled = false;
        bool alreadyRejected = false;
        std::any v;
        std::exception_ptr e;
        {
            std::lock_guard<std::mutex> lock (impl->mutex);
            if (impl->settled) {
                alreadySettled = true;
                alreadyRejected = impl->rejected;
                v = impl->value;
                e = impl->error;
            } else {
                impl->listeners.push_back ({ onFulfil, onReject });
            }
        }
        // callbacks run without the lock held, exactly like resolve/reject
        if (alreadySettled) {
            if (alreadyRejected) {
                onReject (e);
            } else {
                onFulfil (v);
            }
        }
    }

    static Future resolved (const std::any& v = std::any {}) {
        Future f;
        f.resolve (v);
        return f;
    }

private:
    std::shared_ptr<Impl> impl;
};

// settle with the first settlement of any input; mirror of Future.race in TS
inline Future race (const std::vector<Future>& futures) {
    Future out;
    for (const auto& f : futures) {
        f.subscribe (
            [=] (const std::any& v) mutable { out.resolve (v); },
            [=] (const std::exception_ptr& e) mutable { out.reject (e); });
    }
    return out;
}

} // namespace ws
} // namespace ccxt
