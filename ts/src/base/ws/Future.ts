// @ts-nocheck
import { Unpromise } from "../../static_dependencies/watchable/src/unpromise.js";
export interface FutureInterface extends Promise<any> {
    resolve(value: unknown): void;
    reject(reason?: any): void;
}

export function Future (): FutureInterface {

    let resolve = undefined
        , reject = undefined

    const p = new Promise ((resolve_, reject_) => {
        resolve = resolve_
        reject = reject_
    })

    p.resolve = function _resolve () {
        // eslint-disable-next-line prefer-rest-params
        setTimeout (() => {
            resolve.apply (this, arguments)
        })
    }

    p.reject = function _reject () {
        // eslint-disable-next-line prefer-rest-params
        setTimeout (() => {
            reject.apply (this, arguments)
        })
    }

    return p
}

function wrapFuture (aggregatePromise): FutureInterface {
    const p = Future ()
    // wrap the promises as a future
    aggregatePromise.then (p.resolve, p.reject)
    return p
}

Future.race = (futures) : FutureInterface => wrapFuture (Unpromise.race (futures))
