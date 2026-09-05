
//@ts-nocheck
/*  ------------------------------------------------------------------------ */

import { now, sleep } from './time.js';
/*  ------------------------------------------------------------------------ */

class Throttler {

    running: boolean;
    queue: { resolver: any; cost: number }[];
    queueHead: number;              // index of the next item to process — avoids O(n) Array#shift on every dequeue
    config: {
        refillRate: number;         // leaky bucket refill rate in tokens per second
        delay: number;              // leaky bucket seconds before checking the queue after waiting
        capacity: number;           // leaky bucket
        tokens: number;             // leaky bucket
        cost: number;               // leaky bucket and rolling window
        algorithm: string;
        rateLimit: number;
        windowSize: number;         // rolling window size in milliseconds
        maxWeight: number;          // rolling window - rollingWindowSize / rateLimit   // ms_of_window / ms_of_rate_limit
    };
    timestamps: { timestamp: number; cost: number }[];
    totalCost: number;              // running sum of timestamps[].cost, kept in sync incrementally

    constructor (config) {
        this.config = {
            'refillRate': 1.0,              // leaky bucket refill rate in tokens per second
            'delay': 0.001,                 // leaky bucket seconds before checking the queue after waiting
            'capacity': 1.0,                // leaky bucket
            'tokens': 0,                    // leaky bucket
            'cost': 1.0,                    // leaky bucket and rolling window
            'algorithm': 'leakyBucket',
            'windowSize': 60000.0,          // rolling window size in milliseconds
            'maxWeight': undefined,         // rolling window - rollingWindowSize / rateLimit   // ms_of_window / ms_of_rate_limit
        };
        Object.assign (this.config, config);
        if (this.config['algorithm'] !== 'leakyBucket') {
            this.config['maxWeight'] = this.config.windowSize / this.config.rateLimit;
        }
        this.queue = [];
        this.queueHead = 0;
        this.running = false;
        this.timestamps = [];
        this.totalCost = 0;
    }

    // pops the front of the queue without the O(n) element shift that Array#shift performs;
    // compacts back to an empty array once drained (or periodically under sustained load)
    // so consumed entries don't pin memory
    dequeue () {
        this.queueHead += 1;
        if (this.queueHead === this.queue.length) {
            this.queue.length = 0;
            this.queueHead = 0;
        } else if (this.queueHead >= 1024 && this.queueHead >= (this.queue.length / 2)) {
            this.queue = this.queue.slice (this.queueHead);
            this.queueHead = 0;
        }
    }

    async leakyBucketLoop () {
        let lastTimestamp = now ();
        while (this.running) {
            const { resolver, cost } = this.queue[this.queueHead];
            if (this.config['tokens'] >= 0) {
                this.config['tokens'] -= cost;
                resolver ();
                this.dequeue ();
                // contextswitch
                await Promise.resolve ();
                if (this.queue.length === 0) {
                    this.running = false;
                }
            } else {
                await sleep (this.config['delay'] * 1000);
                const current = now ();
                const elapsed = current - lastTimestamp;
                lastTimestamp = current;
                const tokens = this.config['tokens'] + (this.config['refillRate'] * elapsed);
                this.config['tokens'] = Math.min (tokens, this.config['capacity']);
            }
        }
    }

    async rollingWindowLoop() {
        while (this.running) {
            const { resolver, cost } = this.queue[this.queueHead];
            const nowTime = now ();
            const cutOffTime = nowTime - this.config.windowSize;
            // timestamps are appended in non-decreasing (nowTime) order when the
            // system clock is monotonic — trim just the expired prefix and keep a
            // running total instead of rescanning + rebuilding the whole array on
            // every single iteration. This assumption does not hold across a
            // backwards clock step (NTP correction, VM resume): a stale entry can
            // then survive behind the prefix cut. That only makes totalCost an
            // overestimate of the true live cost, never an underestimate, so
            // admission becomes stricter rather than looser, and it self-heals
            // once the stale entry's own timestamp expires.
            let expiredCount = 0;
            const timestampsLength = this.timestamps.length;
            while (expiredCount < timestampsLength && this.timestamps[expiredCount].timestamp <= cutOffTime) {
                this.totalCost -= this.timestamps[expiredCount].cost;
                expiredCount += 1;
            }
            if (expiredCount > 0) {
                this.timestamps.splice (0, expiredCount);
            }
            // handle current request
            if (this.totalCost + cost <= this.config.maxWeight) {
                // Enough capacity, proceed with request
                this.timestamps.push ({ timestamp: nowTime, cost });
                this.totalCost += cost; // keep in sync with timestamps[] — any early exit added between the trim above and this line would desynchronise them permanently
                resolver ();
                this.dequeue ();
                await Promise.resolve (); // Yield control to event loop
                if (this.queue.length === 0) {
                    this.running = false;
                }
            } else {
                // Calculate the wait time until the oldest request expires
                const earliestRequestTime = this.timestamps[0].timestamp;
                const waitTime = (earliestRequestTime + this.config.windowSize) - nowTime;
                // Ensure waitTime is positive before sleeping
                if (waitTime > 0) {
                    await sleep (waitTime);
                }
            }
        }
    }

    async loop () {
        if (this.config['algorithm'] === 'leakyBucket') {
            await this.leakyBucketLoop ();
        } else {
            await this.rollingWindowLoop ();
        }
    }

    throttle (cost: Num = undefined) {
        let resolver;
        const promise = new Promise ((resolve, reject) => {
            resolver = resolve;
        });
        cost = (cost === undefined) ? this.config['cost'] : cost;
        this.queue.push ({ resolver, cost });
        if (!this.running) {
            this.running = true;
            this.loop ();
        }
        return promise;
    }
}

export {
    Throttler,
};

// ----------------------------------------
