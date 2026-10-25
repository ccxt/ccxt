package io.github.ccxt.ws;

import java.util.concurrent.ArrayBlockingQueue;

/**
 * Single-writer hand-off slot between the exchange ws owner thread and reader threads.
 *
 * <p>The owner publishes an immutable snapshot; readers take the most recent published one and
 * never touch live cache state. The queue is the publication barrier: a reader that observes a
 * snapshot also observes everything the owner wrote before it, and a snapshot is fully built
 * before it is offered, so no reader can see a torn or half-mutated structure.
 *
 * <p>{@link #publish} is owner-only (single writer); capacity 1 with latest-wins semantics, so a
 * slow reader can never make the owner block or retain more than one snapshot.
 */
final class OwnerSlot<T> {

    private final ArrayBlockingQueue<T> slot = new ArrayBlockingQueue<>(1);

    /** Replace the published snapshot; owner thread only. Never blocks. */
    void publish(T value) {
        this.slot.clear();
        this.slot.offer(value);
    }

    /** The latest published snapshot, or {@code fallback} when nothing was published yet. */
    T latest(T fallback) {
        T value = this.slot.peek();
        return value == null ? fallback : value;
    }
}
