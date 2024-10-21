
//@ts-nocheck
/*  ------------------------------------------------------------------------ */

import { now, sleep } from './time.js';
/*  ------------------------------------------------------------------------ */

class Throttler {
    constructor (config) {
        this.config = {
            'refillRate': 1.0,
            'delay': 0.001,
            'capacity': 1.0,
            'maxCapacity': 2000,
            'tokens': 0,
            'cost': 1.0,
            'throttleLimit': false, // set to true to always use up the available rate limit
        };
        Object.assign (this.config, config);
        this.queue = [];
        this.running = false;
    }

    async loop () {
        let lastTimestamp = now ();
        while (this.running) {  // loops through method calls in the queue, executing them if tokens available, and waiting if tokens not available
            const { resolver, cost } = this.queue[0];
            if (this.config['tokens'] >= 0) {  // if rate limit hasn't been reached
                this.config['tokens'] -= cost;
                if (this.config['throttleLimit']) {
                    // if the rate limit is to be throttled, continue calling resolvers within the loop without awaiting
                    this.resolve (resolver);
                } else {
                    resolver ();
                    await Promise.resolve ();
                }
                this.queue.shift ();
                // contextswitch
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
            const current = now ();
            const elapsed = current - lastTimestamp;
            lastTimestamp = current;
            this.config['tokens'] = Math.min (
                this.config['tokens'] + (this.config['refillRate'] * elapsed),
                this.config['capacity']
            );
        }
    }

    throttle (cost = undefined) {
        let resolver;
        const promise = new Promise ((resolve, reject) => {
            resolver = resolve;
        });
        if (this.queue.length > this.config['maxCapacity']) {
            throw new Error ('throttle queue is over maxCapacity (' + this.config['maxCapacity'].toString () + '), see https://github.com/ccxt/ccxt/issues/11645#issuecomment-1195695526');
        }
        cost = (cost === undefined) ? this.config['cost'] : cost;
        this.queue.push ({ resolver, cost });
        if (!this.running) {  // start the throttle loop if it's not running
            this.running = true;
            this.loop ();
        }
        return promise;
    }

    async resolve (resolver) {
        resolver (); // method for api endpoint
    }
}

export {
    Throttler,
};

// ----------------------------------------
