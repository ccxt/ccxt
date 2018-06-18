"use strict";

// ----------------------------------------------------------------------------
// There's been a lot of messing with this code...
// The problem is to satisfy the following requirements:

const isBrowser = typeof window !== 'undefined'

const isElectron = typeof process !== 'undefined' &&
                   typeof process.versions !== 'undefined' &&
                   typeof process.versions.electron !== 'undefined'

const isWebWorker = typeof WorkerGlobalScope !== 'undefined' && (self instanceof WorkerGlobalScope)

const isWindows = typeof process !== 'undefined' && process.platform === "win32"

const isNode = !(isBrowser || isWebWorker)

// ----------------------------------------------------------------------------

module.exports = {

    isBrowser,
    isElectron,
    isWebWorker,
    isNode,
    isWindows,
}