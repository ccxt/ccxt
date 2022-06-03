"use strict";

/*  ------------------------------------------------------------------------ */

const { now, sleep } = require ('./time')

/*  ------------------------------------------------------------------------ */

class Throttle {
    constructor (config) {
        this.config = {
            refillRate: 1.0,
            delay: 0.001,
            capacity: 1.0,
            maxCapacity: 2000,
            tokens: 0,
            cost: 1.0,
        };
        Object.assign (this.config, config);
        this.queue = [];  // requests to be sent
        this.running = false;
    }

    async resolve (resolver) {
        resolver (); // method for api endpoint
    }

    async loop () {
        let lastTimestamp = now ();
        while (this.running) { // loops through method calls in the queue, executing them if tokens available, and waiting if tokens not available
            const { resolver, cost } = this.queue[0];
            if (this.config['tokens'] >= 0) { // if rate limit hasn't been reached
                this.config['tokens'] -= cost;
                this.resolve (resolver)
                this.queue.shift ();
                // contextswitch
                await Promise.resolve (); // what does this do?
                if (this.queue.length === 0) {
                    this.running = false;
                }
            } else {
                await sleep (this.config['delay'] * 1000);
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
}

function throttle (config) {
    function inner (cost = undefined) {
        let resolver;
        const promise = new Promise ((resolve, reject) => {
            resolver = resolve;
        })
        if (this.queue.length > this.config['maxCapacity']) {
            throw new Error ('throttle queue is over maxCapacity');
        }
        if (cost === undefined) {
            cost = this.config['cost'];
        }
        this.queue.push ({ resolver, cost });
        if (!this.running) { // start the throttle loop if it's not running
            this.running = true;
            this.loop ();
        }
        return promise;
    }
    const instance = new Throttle (config);
    const bound = inner.bind (instance);
    // useful for inspecting the tokenBucket
    bound.config = instance.config;
    return bound;
}

module.exports = {
    throttle,
}

// ----------------------------------------
