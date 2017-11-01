"use strict";

const { sleep }  = require ('./functions')

const throttle = cfg => {

    let lastTimestamp = Date.now ()
        , numTokens = cfg.capacity
        , queue = []
        , running = false
        , counter = 0

    return Object.assign (cost => {

        if (queue.length > cfg.maxCapacity)
            throw new Exception ('Backlog is over max capacity of ' + cfg.maxCapacity)

        return new Promise (async (resolve, reject) => {

            queue.push ({ cost, resolve, reject })

            if (!running) {
                running = true
                while (queue.length > 0) {
                    let now = Date.now ()
                    let elapsed = now - lastTimestamp
                    lastTimestamp = now
                    numTokens = Math.min (cfg.capacity, numTokens + elapsed * cfg.refillRate)
                    if (numTokens > 0) {
                        if (queue.length > 0) {
                            let { cost, resolve, reject } = queue.shift ()
                            numTokens -= (cost || cfg.defaultCost)
                            resolve ()
                        }
                    }
                    await sleep (cfg.delay)
                }
                running = false
            }
        })

    }, cfg, {
        configure: newCfg => throttle (Object.assign ({}, cfg, newCfg))
    })
}

module.exports = throttle