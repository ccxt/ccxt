'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var time = require('./time.js');

// ----------------------------------------------------------------------------
/*  ------------------------------------------------------------------------ */
class Throttler {
    constructor(config) {
        this.config = {
            'refillRate': 1.0,
            'delay': 0.001,
            'capacity': 1.0,
            'tokens': 0,
            'cost': 1.0,
            'algorithm': 'leakyBucket',
            'windowSize': 60000.0,
            'maxWeight': undefined, // rolling window - rollingWindowSize / rateLimit   // ms_of_window / ms_of_rate_limit
        };
        Object.assign(this.config, config);
        if (this.config['algorithm'] !== 'leakyBucket') {
            this.config['maxWeight'] = this.config.windowSize / this.config.rateLimit;
        }
        this.queue = [];
        this.running = false;
        this.timestamps = [];
    }
    async leakyBucketLoop() {
        let lastTimestamp = time.now();
        while (this.running) {
            const { resolver, cost } = this.queue[0];
            if (this.config['tokens'] >= 0) {
                this.config['tokens'] -= cost;
                resolver();
                this.queue.shift();
                // contextswitch
                await Promise.resolve();
                if (this.queue.length === 0) {
                    this.running = false;
                }
            }
            else {
                await time.sleep(this.config['delay'] * 1000);
                const current = time.now();
                const elapsed = current - lastTimestamp;
                lastTimestamp = current;
                const tokens = this.config['tokens'] + (this.config['refillRate'] * elapsed);
                this.config['tokens'] = Math.min(tokens, this.config['capacity']);
            }
        }
    }
    async rollingWindowLoop() {
        while (this.running) {
            const { resolver, cost } = this.queue[0];
            const nowTime = time.now();
            const cutOffTime = nowTime - this.config.windowSize;
            let totalCost = 0;
            // Remove expired timestamps & sum the remaining requests
            const timestamps = [];
            for (let i = 0; i < this.timestamps.length; i++) {
                const element = this.timestamps[i];
                if (element.timestamp > cutOffTime) {
                    totalCost += element.cost;
                    timestamps.push(element);
                }
            }
            this.timestamps = timestamps;
            // handle current request
            if (totalCost + cost <= this.config.maxWeight) {
                // Enough capacity, proceed with request
                this.timestamps.push({ timestamp: nowTime, cost });
                resolver();
                this.queue.shift();
                await Promise.resolve(); // Yield control to event loop
                if (this.queue.length === 0) {
                    this.running = false;
                }
            }
            else {
                // Calculate the wait time until the oldest request expires
                const earliestRequestTime = this.timestamps[0].timestamp;
                const waitTime = (earliestRequestTime + this.config.windowSize) - nowTime;
                // Ensure waitTime is positive before sleeping
                if (waitTime > 0) {
                    await time.sleep(waitTime);
                }
            }
        }
    }
    async loop() {
        if (this.config['algorithm'] === 'leakyBucket') {
            await this.leakyBucketLoop();
        }
        else {
            await this.rollingWindowLoop();
        }
    }
    throttle(cost = undefined) {
        let resolver;
        const promise = new Promise((resolve, reject) => {
            resolver = resolve;
        });
        cost = (cost === undefined) ? this.config['cost'] : cost;
        this.queue.push({ resolver, cost });
        if (!this.running) {
            this.running = true;
            this.loop();
        }
        return promise;
    }
}
// ----------------------------------------

exports.Throttler = Throttler;
