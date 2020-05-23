'use strict';

class ArrayCache extends Array {
    constructor (maxSize) {
        super ()
        if (maxSize <= 0) {
            throw new Error ('Cache size must be larger than 0')
        }
        Object.defineProperty(this, 'maxSize', {
            __proto__: null, // make it invisible
            value: maxSize,
            writable: true,
        })
    }

    push () {
        throw new Error ('Cannot push to a cache, please use append instead')
    }

    append (item) {
        super.push (item)
        if (this.length > this.maxSize) {
            this.shift ()
        }
    }

    clear () {
        this.length = 0
    }
}

module.exports = {
    ArrayCache,
}
