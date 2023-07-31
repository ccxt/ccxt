// @ts-nocheck

export interface Future extends Promise<unknown> {
    resolve(value: unknown): void;
    reject(reason?: any): void;
}

export function createFuture (): Future {

    let resolve = undefined
        , reject = undefined

    const p = new Promise ((resolve_, reject_) => {
        resolve = resolve_
        reject = reject_
    })

    p.resolve = function _resolve () {
        // eslint-disable-next-line prefer-rest-params
        resolve.apply (this, arguments)
    }

    p.reject = function _reject () {
        // eslint-disable-next-line prefer-rest-params
        reject.apply (this, arguments)
    }

    return p
};
