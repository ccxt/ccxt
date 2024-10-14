// @ts-nocheck

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

// WeakMap to store promise records
const promiseRecords = new WeakMap();

function isPrimitive(value) {
    return value === null || (typeof value !== "object" && typeof value !== "function");
}

function addRaceContender(contender) {
    const deferreds = new Set();
    const record = { deferreds, settled: false };

    Promise.resolve(contender).then(
        (value) => {
            for (const { resolve } of deferreds) {
                resolve(value);
            }
            deferreds.clear();
            record.settled = true;
        },
        (err) => {
            for (const { reject } of deferreds) {
                reject(err);
            }
            deferreds.clear();
            record.settled = true;
        }
    );
    return record;
}

Future.race = (futures: FutureInterface[]): FutureInterface => {
    let deferred;
    const result = new Promise((resolve, reject) => {
        deferred = { resolve, reject };
        for (const future of futures) {
            if (isPrimitive(future)) {
                Promise.resolve(future).then(resolve, reject);
                continue;
            }

            let record = promiseRecords.get(future);
            if (record === undefined) {
                record = addRaceContender(future);
                record.deferreds.add(deferred);
                promiseRecords.set(future, record);
            } else if (record.settled) {
                Promise.resolve(future).then(resolve, reject);
            } else {
                record.deferreds.add(deferred);
            }
        }
    });

    return wrapFuture(result.finally(() => {
        for (const future of futures) {
            if (!isPrimitive(future)) {
                const record = promiseRecords.get(future);
                if (record) {
                    record.deferreds.delete(deferred);
                }
            }
        }
    }));
};
