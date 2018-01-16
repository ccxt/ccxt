"use strict";

/*  ------------------------------------------------------------------------ */

const { sleep
      , time } = require ('./time')

/*  ------------------------------------------------------------------------ */

module.exports = {
    
    throttle: function throttle (cfg) {

        let   lastTimestamp = time.now ()
            , numTokens     = (typeof cfg.numTokens != 'undefined') ? cfg.numTokens : cfg.capacity
            , running       = false
            , counter       = 0

        const queue = []

        return Object.assign (cost => {

            if (queue.length > cfg.maxCapacity)
                throw new Error ('Backlog is over max capacity of ' + cfg.maxCapacity)

            return new Promise (async (resolve, reject) => {

                try {
                    queue.push ({ cost, resolve, reject })

                    if (!running) {
                        running = true
                        while (queue.length > 0) {
                            const hasEnoughTokens = cfg.capacity ? (numTokens > 0) : (numTokens >= 0)
                            if (hasEnoughTokens) {
                                if (queue.length > 0) {
                                    const { cost, resolve, reject } = queue[0]
                                    cost = (cost || cfg.defaultCost)
                                    if (numTokens >= Math.min (cost, cfg.capacity)) {
                                        numTokens -= cost
                                        queue.shift ()
                                        resolve ()
                                    }
                                }
                            }
                            const now = time.now ()
                                , elapsed = now - lastTimestamp
                            lastTimestamp = now
                            numTokens = Math.min (cfg.capacity, numTokens + elapsed * cfg.refillRate)
                            await sleep (cfg.delay)
                        }
                        running = false
                    }

                } catch (e) {
                    reject (e)
                }
            })

        }, cfg, { configure: newCfg => throttle (Object.assign ({}, cfg, newCfg)) })
    }
}

/*  ------------------------------------------------------------------------ */
