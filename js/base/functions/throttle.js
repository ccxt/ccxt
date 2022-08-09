"use strict";

/*  ------------------------------------------------------------------------ */

const { now, sleep } = require ('./time');
/*  ------------------------------------------------------------------------ */

const DEFAULT_CONFIG = {
    refillRate: 1.0,
    delay: 0.001,
    capacity: 1.0,
    maxCapacity: Number.MAX_SAFE_INTEGER,
    tokens: 0,
    cost: 1.0,
    lastTimestamp: 0,
};

class Throttle {
    constructor () {
        this.queue = [];
        this.running = false;
    }

    instanceOf (config) {
        return Object.assign ({}, DEFAULT_CONFIG, config);
    }

    async loop () {
        while (this.running) {
            for (let i = 0; i < this.queue.length; i++) {
                const { resolver, cost, config } = this.queue[i];
                if (config['tokens'] >= 0) {
                    config['tokens'] -= cost;
                    resolver ();
                    this.queue.splice (i, 1);
                    i--;
                    // contextswitch
                    await Promise.resolve ();
                    if (this.queue.length === 0) {
                        this.running = false;
                    }
                } else {
                    const current = now ();
                    const elapsed = current - config['lastTimestamp'];
                    config['lastTimestamp'] = current;
                    const tokens = config['tokens'] + (config['refillRate'] * elapsed);
                    config['tokens'] = Math.min (tokens, config['capacity']);
                }
            }
            await sleep (DEFAULT_CONFIG['delay'] * 1000)
        }
    }
}

const globalThrottle = new Throttle ()

function throttle (config) {
    function inner (cost = undefined) {
        let resolver;
        const promise = new Promise ((resolve, reject) => {
            resolver = resolve;
        });
        if (globalThrottle.queue.length > this['maxCapacity']) {
            throw new Error ('throttle queue is over maxCapacity');
        }
        cost = (cost === undefined) ? this['cost'] : cost;
        this['lastTimestamp'] = now ()
        globalThrottle.queue.push ({
            resolver,
            cost,
            'config': this,
        });
        if (!globalThrottle.running) {
            globalThrottle.running = true;
            globalThrottle.loop ()
        }
        return promise;
    }
    const configInstance = globalThrottle.instanceOf (config);
    const bound = inner.bind (configInstance);
    // useful for inspecting the tokenBucket
    return bound;
}

module.exports = {
    throttle,
};

// ----------------------------------------
