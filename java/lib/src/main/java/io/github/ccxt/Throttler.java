package io.github.ccxt;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.locks.ReentrantLock;

/**
 * Rate limiter for CCXT exchanges.
 * Supports two algorithms: leakyBucket (default) and rollingWindow.
 * Thread-safe, designed to be called from CompletableFuture async chains.
 *
 * Architecture matches all other CCXT languages (JS, Python, C#, Go, PHP):
 * single async loop + FIFO queue + lock-protected state.
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

    private final LinkedList<QueueElement> queue = new LinkedList<>();
    private final ReentrantLock lock = new ReentrantLock();
    private boolean running = false;

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
    }

    /**
     * Throttle with the given cost. Returns a CompletableFuture that completes
     * when the request is allowed to proceed.
     */
    public CompletableFuture<Void> throttle(double cost) {
        CompletableFuture<Void> future = new CompletableFuture<>();
        QueueElement element = new QueueElement(cost, future);

        lock.lock();
        try {
            queue.add(element);
            if (!running) {
                running = true;
                Thread.ofVirtual().start(this::loop);
            }
        } finally {
            lock.unlock();
        }

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
            List<CompletableFuture<Void>> toComplete = new ArrayList<>();
            long sleepMs = 0;

            lock.lock();
            try {
                if (queue.isEmpty()) {
                    running = false;
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

                // Batch: complete all affordable requests
                while (!queue.isEmpty() && this.tokens >= 0) {
                    QueueElement el = queue.poll();
                    this.tokens -= el.cost;
                    toComplete.add(el.future);
                }

                // If queue still has items but no tokens, compute exact wait time
                if (!queue.isEmpty() && this.tokens < 0) {
                    double deficit = -this.tokens;
                    sleepMs = (long) Math.ceil(deficit / this.refillRate);
                    if (sleepMs < 1) sleepMs = 1;
                }
            } finally {
                lock.unlock();
            }

            // Complete futures outside the lock to reduce hold time
            for (var f : toComplete) {
                f.complete(null);
            }

            if (sleepMs > 0) {
                try {
                    Thread.sleep(sleepMs);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return;
                }
            }
        }
    }

    private void rollingWindowLoop() {
        while (true) {
            List<CompletableFuture<Void>> toComplete = new ArrayList<>();
            long sleepMs = 0;

            lock.lock();
            try {
                if (queue.isEmpty()) {
                    running = false;
                    return;
                }

                long now = milliseconds();

                // Remove expired timestamps
                long cutoff = now - (long) windowSize;
                timestamps.removeIf(t -> t.timestamp <= cutoff);
                double totalCost = timestamps.stream().mapToDouble(t -> t.cost).sum();

                // Batch: complete all requests that fit within the window weight
                while (!queue.isEmpty()) {
                    QueueElement first = queue.peek();
                    if (totalCost + first.cost <= maxWeight) {
                        queue.poll();
                        timestamps.add(new TimestampedCost(now, first.cost));
                        totalCost += first.cost;
                        toComplete.add(first.future);
                    } else {
                        break;
                    }
                }

                // If queue still has items, compute exact wait until oldest entry expires
                if (!queue.isEmpty()) {
                    if (!timestamps.isEmpty()) {
                        sleepMs = (timestamps.get(0).timestamp + (long) windowSize) - now;
                        if (sleepMs < 1) sleepMs = 1;
                    } else if (toComplete.isEmpty()) {
                        // Inner loop made no progress AND no history to wait on — prevents
                        // 100% CPU spin when head cost exceeds maxWeight (e.g. maxWeight=0).
                        sleepMs = Math.max(1, (long) (delay * 1000));
                    }
                }
            } finally {
                lock.unlock();
            }

            // Complete futures outside the lock
            for (var f : toComplete) {
                f.complete(null);
            }

            if (sleepMs > 0) {
                try {
                    Thread.sleep(sleepMs);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return;
                }
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
