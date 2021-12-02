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
            maxCapacity: 1000,
            tokens: 0,
            cost: 1.0,
        }
        Object.assign (this.config, config)
        this.queue = []
        this.running = false
    }

    async loop () {
        let lastTimestamp = now ()
        while (this.running) {
            const { resolver, cost } = this.queue[0]
            if (this.config['tokens'] >= 0) {
                this.config['tokens'] -= cost
                resolver ()
                this.queue.shift ()
                // contextswitch
                await Promise.resolve ()
                if (this.queue.length === 0) {
                    this.running = false
                }
            } else {
                await sleep (this.config['delay'] * 1000);
                const current = now ()
                const elapsed = current - lastTimestamp
                lastTimestamp = current
                this.config['tokens'] = Math.min (this.config['tokens'] + (this.config['refillRate'] * elapsed), this.config['capacity'])
            }
        }
    }
}

function throttle (config) {
    function inner (cost = undefined) {
        let resolver
        const promise = new Promise ((resolve, reject) => {
            resolver = resolve
        })
        if (this.queue.length > this.config['maxCapacity']) {
            throw new Error ('throttle queue is over maxCapacity')
        }
        cost = (cost === undefined) ? this.config['cost'] : cost
        this.queue.push ({
            resolver,
            cost,
        })
        if (!this.running) {
            this.running = true
            this.loop ()
        }
        return promise
    }
    const instance = new Throttle (config)
    const bound = inner.bind (instance)
    // useful for inspecting the tokenBucket
    bound.config = instance.config
    return bound
}

module.exports = {
    throttle,
}

// ----------------------------------------
