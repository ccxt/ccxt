module.exports = class IncrementalOrderBook {
    constructor (snapshot = undefined) {
        this.orderBook = snapshot === undefined ? {
            'bids': [[0, 0]],
            'asks': [[Number.MAX_SAFE_INTEGER, 0]],
            'timestamp': undefined,
            'datetime': undefined,
            'nonce': undefined,
        } : snapshot
    }

    incrementOrderBook (nonce, operation, side, price, amount) {
        if (nonce !== undefined && this.orderBook['nonce'] !== undefined && nonce <= this.orderBook['nonce']) {
            return
        }
        let bookSide = this.orderBook[side];
        for (let i = 0; i < bookSide.length; i++) {
            let order = bookSide[i]
            if (side === 'bids' ? order[0] > price : order[0] <= price) {
                continue
            }
            if (operation === 'add') {
                if (order[0] === price) {
                    order[1] += amount
                    return
                } else {
                    bookSide.splice (i, 0, [price, amount])
                    return
                }
            } else if (operation === 'delete') {
                bookSide.splice (i, 1)
                return
            } else if (operation === 'absolute') {
                order[1] = amount;
                return;
            }
        }
    }

    update (deltas) {
        for (let delta of deltas) {
            this.incrementOrderBook (...delta)
        }
        this.cleanAbstraction ('bids')
        this.cleanAbstraction ('asks')
    }

    cleanAbstraction (side) {
        let bookSide = this.orderBook[side];
        if (bookSide[bookSide.length - 1][1] === 0) {
            bookSide.pop ()
        }
    }
}
