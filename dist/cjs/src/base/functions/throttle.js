'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var time = require('./time.js');

//@ts-nocheck
/*  ------------------------------------------------------------------------ */
class Throttler {
    constructor(config) {
        this.config = {
            'refillRate': 1.0,
            'delay': 0.001,
            'capacity': 1.0,
            'maxCapacity': 2000,
            'tokens': 0,
            'cost': 1.0,
        };
        Object.assign(this.config, config);
        this.queue = [];
        this.running = false;
    }
    async loop() {
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
    throttle(cost = undefined) {
        let resolver;
        const promise = new Promise((resolve, reject) => {
            resolver = resolve;
        });
        if (this.queue.length > this.config['maxCapacity']) {
            throw new Error('throttle queue is over maxCapacity (' + this.config['maxCapacity'].toString() + '), see https://github.com/ccxt/ccxt/issues/11645#issuecomment-1195695526');
        }
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
