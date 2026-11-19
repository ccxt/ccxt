package io.github.ccxt;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * Rate limiter for CCXT exchanges.
 * Supports two algorithms: leakyBucket (default) and rollingWindow.
 * Thread-safe, designed to be called from CompletableFuture async chains.
 *
 * Architecture matches all other CCXT languages (JS, Python, C#, Go, PHP):
 * single async loop + FIFO channel; the loop thread is the only owner of the limiter
 * state, so callers hand an element over instead of taking a lock.
 */
public class Throttler {

    private static class QueueElement {
        final double cost;
        final CompletableFuture<Void> future;

        QueueElement(double cost, CompletableFuture<Void> future) {
            this.cost = cost;
            this.future = future;
        }
    }

    private static class TimestampedCost {
        final long timestamp;
        final double cost;

        TimestampedCost(long timestamp, double cost) {
            this.timestamp = timestamp;
            this.cost = cost;
        }
    }

    // Channel hand-off: a caller offers an element and gets its future back; the owner thread
    // takes them in order, paces them and completes the futures. Everything below the channel
    // (tokens, timestamps, config) is touched only by that thread.
    private final java.util.concurrent.BlockingQueue<QueueElement> channel = new java.util.concurrent.LinkedBlockingQueue<>();

    // Config
    private double refillRate;
    private double delay;
    private double capacity;
    private double tokens;
    private double defaultCost;
    private String algorithm;
    private double windowSize;
    private double maxWeight;

    // Rolling window state
    private final List<TimestampedCost> timestamps = new ArrayList<>();

    @SuppressWarnings("unchecked")
    public Throttler(Object config) {
        // Defaults
        this.refillRate = 1.0;
        this.delay = 0.001;
        this.capacity = 1.0;
        this.tokens = 0;
        this.defaultCost = 1.0;
        this.algorithm = "leakyBucket";
        this.windowSize = 60000.0;
        this.maxWeight = 0.0;

        if (config instanceof Map) {
            Map<String, Object> cfg = (Map<String, Object>) config;
            if (cfg.containsKey("refillRate")) this.refillRate = toDouble(cfg.get("refillRate"));
            if (cfg.containsKey("delay")) this.delay = toDouble(cfg.get("delay"));
            if (cfg.containsKey("capacity")) this.capacity = toDouble(cfg.get("capacity"));
            if (cfg.containsKey("tokens")) this.tokens = toDouble(cfg.get("tokens"));
            if (cfg.containsKey("cost")) this.defaultCost = toDouble(cfg.get("cost"));
            if (cfg.containsKey("algorithm")) this.algorithm = String.valueOf(cfg.get("algorithm"));
            if (cfg.containsKey("windowSize")) this.windowSize = toDouble(cfg.get("windowSize"));
            if (cfg.containsKey("rateLimit")) {
                double rateLimit = toDouble(cfg.get("rateLimit"));
                if (!"leakyBucket".equals(this.algorithm) && rateLimit > 0) {
                    this.maxWeight = this.windowSize / rateLimit;
                }
            }
            if (cfg.containsKey("maxWeight") && cfg.get("maxWeight") != null) {
                double mw = toDouble(cfg.get("maxWeight"));
                if (mw > 0) this.maxWeight = mw;
            }
        }
        // the loop thread owns the state above; Thread.start publishes the config written here
        Thread.ofVirtual().name("ccxt-throttler").start(this::loop);
    }

    /**
     * Throttle with the given cost. Returns a CompletableFuture that completes
     * when the request is allowed to proceed.
     */
    public CompletableFuture<Void> throttle(double cost) {
        CompletableFuture<Void> future = new CompletableFuture<>();
        this.channel.offer(new QueueElement(cost, future));
        return future;
    }

    /**
     * Throttle with default cost.
     */
    public CompletableFuture<Void> throttle() {
        return throttle(this.defaultCost);
    }

    private void loop() {
        if ("leakyBucket".equals(this.algorithm)) {
            leakyBucketLoop();
        } else {
            rollingWindowLoop();
        }
    }

    private void leakyBucketLoop() {
        long lastTimestamp = milliseconds();

        while (true) {
            QueueElement element;
            try {
                element = this.channel.take();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return;
            }

            // Refill tokens based on elapsed time
            long now = milliseconds();
            long elapsed = now - lastTimestamp;
            lastTimestamp = now;
            if (elapsed > 0) {
                double newTokens = this.tokens + (this.refillRate * elapsed);
                this.tokens = Math.min(newTokens, this.capacity);
            }

            // The head of the channel is served as soon as the bucket is not overdrawn — a
            // zero-token bucket still serves the first request — and its cost is charged after.
            while (this.tokens < 0) {
                double deficit = -this.tokens;
                long sleepMs = (long) Math.ceil(deficit / this.refillRate);
                if (sleepMs < 1) sleepMs = 1;
                try {
                    Thread.sleep(sleepMs);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return;
                }
                long after = milliseconds();
                long waited = after - lastTimestamp;
                lastTimestamp = after;
                if (waited > 0) {
                    double newTokens = this.tokens + (this.refillRate * waited);
                    this.tokens = Math.min(newTokens, this.capacity);
                }
            }

            this.tokens -= element.cost;
            element.future.complete(null);
        }
    }

    private void rollingWindowLoop() {
        while (true) {
            QueueElement element;
            try {
                element = this.channel.take();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return;
            }

            long now = milliseconds();
            while (true) {
                // Remove expired timestamps
                final long cutoff = now - (long) this.windowSize;
                this.timestamps.removeIf(t -> t.timestamp <= cutoff);
                double totalCost = 0.0;
                for (TimestampedCost entry : this.timestamps) {
                    totalCost += entry.cost;
                }

                // Serve the head as soon as it fits within the window weight
                if (totalCost + element.cost <= this.maxWeight) {
                    this.timestamps.add(new TimestampedCost(now, element.cost));
                    element.future.complete(null);
                    break;
                }

                // Otherwise wait until the oldest entry expires; with no history at all, poll at
                // the configured delay instead of spinning (a cost above maxWeight never fits).
                long sleepMs;
                if (!this.timestamps.isEmpty()) {
                    sleepMs = (this.timestamps.get(0).timestamp + (long) this.windowSize) - now;
                } else {
                    sleepMs = Math.max(1, (long) (this.delay * 1000));
                }
                if (sleepMs < 1) sleepMs = 1;
                try {
                    Thread.sleep(sleepMs);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return;
                }
                now = milliseconds();
            }
        }
    }

    private static long milliseconds() {
        return System.currentTimeMillis();
    }

    private static double toDouble(Object v) {
        if (v == null) return 0.0;
        if (v instanceof Number n) return n.doubleValue();
        try { return Double.parseDouble(String.valueOf(v)); } catch (Exception e) { return 0.0; }
    }
}
