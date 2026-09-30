package io.github.ccxt.ws;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Promise-like wrapper around CompletableFuture with explicit resolve/reject.
 * Matches the Future implementation in C# (cs/ccxt/ws/Future.cs),
 * Go (go/v4/exchange_future.go), and JS (ts/src/base/ws/Future.ts).
 *
 * Used by WsClient to track pending watch* subscriptions.
 * Each messageHash gets a Future that resolves when matching data arrives.
 */
public class Future {

    private final CompletableFuture<Object> completableFuture;

    public Future() {
        this.completableFuture = new CompletableFuture<>();
    }

    /**
     * Resolve the future with data. Thread-safe — only the first call takes effect.
     */
    public void resolve(Object data) {
        this.completableFuture.complete(data);
    }

    /**
     * Resolve the future with null. Used when no specific data is needed.
     */
    public void resolve() {
        this.completableFuture.complete(null);
    }

    /**
     * Reject the future with an error.
     */
    public void reject(Object error) {
        Exception exception;
        if (error instanceof Exception ex) {
            exception = ex;
        } else if (error == null) {
            exception = new RuntimeException("Future rejected with null");
        } else {
            exception = new RuntimeException("Future rejected: " + error);
        }
        this.completableFuture.completeExceptionally(exception);
    }

    /**
     * Get the underlying CompletableFuture for awaiting.
     */
    public CompletableFuture<Object> getFuture() {
        return this.completableFuture;
    }

    /**
     * Check if this future is already resolved or rejected.
     */
    public boolean isDone() {
        return this.completableFuture.isDone();
    }

    /**
     * Race multiple futures — returns a new Future that resolves/rejects
     * when the first input future completes.
     * Matches C# Future.race() and JS Promise.race().
     */
    public static Future race(Future... futures) {
        Future result = new Future();
        AtomicBoolean settled = new AtomicBoolean(false);
        for (Future f : futures) {
            f.completableFuture.whenComplete((val, ex) -> {
                if (settled.compareAndSet(false, true)) {
                    if (ex != null) {
                        result.completableFuture.completeExceptionally(ex);
                    } else {
                        result.completableFuture.complete(val);
                    }
                }
            });
        }
        return result;
    }
}
