//@ts-nocheck

/*  ------------------------------------------------------------------------ */
import { now, sleep } from './time.js';
import { CustomThrottlePriority } from '../types.js';

/*  ------------------------------------------------------------------------ */

class Throttler {
    constructor (config) {
        this.config = {
            refillRate: 1.0,
            delay: 0.001,
            capacity: 1.0,
            maxCapacity: 2000,
            tokens: 0,
            cost: 1.0,
            priorities: {},
            expireIntervals: {
                'myTrades': 1000 * 50, // 50 seconds
            },
        };
        Object.assign (this.config, config);
        this.priorityQueue = {}; // Set priority here
        this.running = false;
        
        this.isActive = true;
    }

    /**
     * Returns the most important queue (lower number => hight priority), if there are no priorities, returns the normal queue
     */
    getMostImportantQueue () {
        const priorityIndices = Object.keys (this.priorityQueue);
        const highestPriorityIndex = Math.min (...priorityIndices);
        const highestPriorityQueue = this.priorityQueue[highestPriorityIndex];
        return {
            highestPriorityQueue,
            highestPriorityIndex,
        };
    }

    stop() {
        this.isActive = false
    }

    async loop () {
        let lastTimestamp = now ();
        while (this.running) {
            const { highestPriorityQueue, highestPriorityIndex } = this.getMostImportantQueue ();
            // It shouldn't ever be undefined
            if(highestPriorityQueue === undefined) {
                this.running = false;
                continue;
            }

            const { resolver, cost, rejecter, timestamp, expireInterval } = highestPriorityQueue[0];
    
            if (this.config['tokens'] >= 0 || !this.isActive) {
                // check if the request is expired
                if (expireInterval !== undefined && timestamp + expireInterval < now () || !this.isActive) {
                    rejecter (new Error ('Request expired'));
                } else {
                    this.config['tokens'] -= cost;
                    resolver ();
                }
                highestPriorityQueue.shift ();
                // contextswitch
                await Promise.resolve ();
                if (highestPriorityQueue.length === 0) {
                    delete this.priorityQueue[highestPriorityIndex];
                }
                if (Object.keys (this.priorityQueue).length === 0) {
                    this.running = false;
                }
            } else {
                await sleep (this.config['delay'] * 1000);
                const current = now ();
                const elapsed = current - lastTimestamp;
                lastTimestamp = current;
                const tokens = this.config['tokens'] + this.config['refillRate'] * elapsed;
                this.config['tokens'] = Math.min (tokens, this.config['capacity']);
            }
        }
    }

    customThrottle (cost = undefined, path = undefined, customExpireInterval = undefined, customPriority = undefined) {
        let resolver;
        let rejecter;
        const promise = new Promise ((resolve, reject) => {
            resolver = resolve;
            rejecter = reject;
        });

        const capacity = Object.keys (this.priorityQueue).reduce (
            (acc, cur) => acc + this.priorityQueue[cur].length,
            0
        );
        // TODO manage capacity for both queues
        if (capacity > this.config['maxCapacity']) {
            throw new Error ('throttle queue is over maxCapacity (' + this.config['maxCapacity'].toString () + '), see https://github.com/ccxt/ccxt/issues/11645#issuecomment-1195695526');
        }
        cost = (cost === undefined) ? this.config['cost'] : cost;

        let priority;
        if (customPriority !== undefined && customPriority in CustomThrottlePriority) {
            priority = customPriority;
        } else if (path !== undefined && this.config['priorities'][path] !== undefined
        ) {
            priority = this.config['priorities'][path];
        } else {
            priority = CustomThrottlePriority.MEDIUM;
        }
        let expireInterval;
        if (customExpireInterval !== undefined) {
            expireInterval = customExpireInterval;
        } else if (path !== undefined) {
            expireInterval = this.config['expireIntervals'][path];
        }
        if (this.priorityQueue[priority] === undefined) {
            this.priorityQueue[priority] = [];
        }
        this.priorityQueue[priority].push ({
            resolver,
            cost,
            rejecter,
            'timestamp': now (),
            expireInterval,
        });
        for (let i = 0; i < this.priorityQueue.length; i++) {
            const q = this.priorityQueue[i];
        }
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