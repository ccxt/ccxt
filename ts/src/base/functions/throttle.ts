
//@ts-nocheck
/*  ------------------------------------------------------------------------ */

import { now, sleep } from './time.js';
/*  ------------------------------------------------------------------------ */

class Throttler {

    running: boolean;
    queue: { resolver: any; cost: number }[];
    config: {
        refillRate: number;
        delay: number;
        capacity: number;
        maxLimiterRequests: number;
        tokens: number;
        cost: number;
        algorithm: string;
        rateLimit: number;
        windowSize: number;
        maxWeight: number;
    };
    timestamps: { timestamp: number; cost: number }[];

    constructor (config) {
        this.config = {
            'refillRate': 1.0,
            'delay': 0.001,
            'capacity': 1.0,
            'maxLimiterRequests': 2000,
            'tokens': 0,
            'cost': 1.0,
            'algorithm': 'leakyBucket',
            'windowSize': 60000.0,
            // maxWeight should be set in config parameter for rolling window algorithm
        };
        Object.assign (this.config, config);
        this.queue = [];
        this.running = false;
        this.timestamps = [];
    }

    async leakyBucketLoop () {
        let lastTimestamp = now ();
        while (this.running) {
            const { resolver, cost } = this.queue[0];
            if (this.config['tokens'] >= 0) {
                this.config['tokens'] -= cost;
                resolver ();
                this.queue.shift ();
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
            const { resolver, cost } = this.queue[0];
            const nowTime = now ();
        // Remove timestamps outside the rolling window 
        //   and
        // Calculate the total cost of requests still in the window
        let totalCost = 0;
        for (let i = this.timestamps.length - 1; i >= 0; i--) {
            if (nowTime - this.timestamps[i].timestamp >= this.config.windowSize) {
                this.timestamps.splice(i, 1);
            } else {
                totalCost += this.timestamps[i].cost;
            }
        }
            if (totalCost + cost <= this.config.maxWeight) {
                // Enough capacity, proceed with request
                this.timestamps.push ({ timestamp: nowTime, cost });
                resolver ();
                this.queue.shift ();
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

    throttle (cost = undefined) {
        let resolver;
        const promise = new Promise ((resolve, reject) => {
            resolver = resolve;
        });
        if (this.queue.length > this.config['maxLimiterRequests']) {
            throw new Error ('throttle queue is over maxLimiterRequests (' + this.config['maxLimiterRequests'].toString () + '), see https://github.com/ccxt/ccxt/issues/11645#issuecomment-1195695526');
        }
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
