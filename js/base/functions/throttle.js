"use strict";

/*  ------------------------------------------------------------------------ */

const { sleep
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
            , tokens     = cfg.capacity
            , running       = false

        const queue = []

        return (rateLimit, cost = undefined) => {
            if (queue.length && !running) {
                running = true
                if (tokens >= Math.min (config['capacity'], cost)) {
                    let [cost, resolve] = queue.shift ()

                }
            }
        }
    }
}

/*  ------------------------------------------------------------------------ */
