"use strict";

const { sleep }  = require ('./functions')

const throttle = cfg => {

    let lastTimestamp = Date.now ()
        , numTokens = (typeof cfg.numTokens != 'undefined') ? cfg.numTokens : cfg.capacity
        , queue = []
        , running = false
        , counter = 0

    return Object.assign (cost => {

        if (queue.length > cfg.maxCapacity)
            throw new Exception ('Backlog is over max capacity of ' + cfg.maxCapacity)

        return new Promise (async (resolve, reject) => {

            try {

                queue.push ({ cost, resolve, reject })

                if (!running) {
                    running = true
                    while (queue.length > 0) {
                        const hasEnoughTokens = cfg.capacity ? (numTokens > 0) : (numTokens >= 0)
                        if (hasEnoughTokens) {
                            if (queue.length > 0) {
                                let { cost, resolve, reject } = queue[0]
                                cost = (cost || cfg.defaultCost)
                                if (numTokens >= Math.min (cost, cfg.capacity)) {
                                    numTokens -= cost
                                    queue.shift ()
                                    resolve ()
                                }
                            }
                        }
                        let now = Date.now ()
                        let elapsed = now - lastTimestamp
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

    }, cfg, {
        configure: newCfg => throttle (Object.assign ({}, cfg, newCfg))
    })
}

module.exports = throttle