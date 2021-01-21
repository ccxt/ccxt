"use strict";

/*  ------------------------------------------------------------------------ */

const { setTimeout_safe
      , now } = require ('./time')

/*  ------------------------------------------------------------------------ */

module.exports = {

    throttle: function throttle (config) {
        // {
        //    delay:       1,
        //    capacity:    1,
        //    defaultCost: 1,
        //    maxCapacity: 1000,
        // }

        let   lastTimestamp = now ()
            , tokens        = config.capacity
            , running       = false
        const queue = []

        return (rateLimit, cost = undefined) => {
            if (queue.length > config['maxCapacity']) {
                throw new Error ('Backlog is over max capacity of ' + config['maxCapacity'])
            }

            function resolver () {
                if (queue.length && !running) {
                    running = true
                    const cost = queue[0][0]
                    if (tokens >= Math.min (config['capacity'], cost)) {
                        const [_, resolve] = queue.shift ()
                        tokens -= cost
                        resolve ()
                    }
                    const currentTime = now ()
                    const elapsed = currentTime - lastTimestamp
                    lastTimestamp = currentTime
                    tokens = Math.min (config['capacity'], tokens + elapsed / rateLimit)
                    setTimeout_safe (() => {
                        running = false
                        resolver ()
                    }, config['delay'])
                }
            }
            return new Promise ((resolve, reject) => {
                cost = cost ? cost : config['defaultCost']
                queue.push ([cost, resolve])
                resolver ()
            })
        }
    }
}

/*  ------------------------------------------------------------------------ */
