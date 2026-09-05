/* eslint-disable */
import assert from 'assert'
import { Throttler, QUEUE_COMPACTION_THRESHOLD } from '../../../base/functions/throttle.js'
import type { Dict } from '../../../base/types.js'

async function testThrottle () {

    const delta = 10
    const testCases: Dict[] = [
        {
            'tokens': 0,
            'refillRate': 1 / 50,
            'cost': 1,
            'runs': 100,
        },
        {
            'tokens': 20,
            'refillRate': 1 / 50,
            'cost': 1,
            'runs': 100,
        },
        {
            'tokens': 40,
            'refillRate': 1 / 50,
            'cost': 1,
            'runs': 100,
        },
        {
            'tokens': 0,
            'refillRate': 1 / 20,
            'cost': 1,
            'runs': 100,
        },
        {
            'tokens': 100,
            'refillRate': 1 / 20,
            'cost': 5,
            'runs': 50,
        },
        {
            'tokens': 0,
            'refillRate': 1 / 40,
            'cost': 2,
            'runs': 50,
        },
        {
            'tokens': 1,
            'refillRate': 1 / 100,
            'cost': 1,
            'runs': 10,
        },
        {
            'tokens': 5,
            'refillRate': 1 / 100,
            'cost': 1,
            'runs': 10,
        },
        {
            'tokens': 0,
            'refillRate': 1 / 500,
            'cost': 1,
            'runs': 10,
        },
        {
            'tokens': 0,
            'refillRate': 1 / 10,
            'cost': 1,
            'runs': 500,
        },
    ]


    let number = 0
    for (const test of testCases) {
        test['number'] = number++
        const instantlyComplete = test['tokens'] / test['cost']
        // after that each run will take cost and the total time will be runs * cost / refillRate
        const remaining = test['runs'] - instantlyComplete - 1
        test['expected'] = remaining * test['cost'] / test['refillRate']
    }

    async function runner (test: Dict) {
        const throttler = new Throttler ({
            'refillRate': test['refillRate'],
            'tokens': test['tokens'],
        })
        const start = performance.now ()
        for (let i = 0; i < test['runs']; i++) {
            await throttler.throttle (test['cost'])
        }
        const end = performance.now ()
        const elapsed = end - start
        const result = Math.abs (elapsed - test['expected']) < delta
        console.log (`case ${test['number']} ${result ? 'suceeded' : 'failed'} in ${elapsed}ms expected ${test['expected']}ms`)
    }

    for (const test of testCases) {
        runner (test)
    }

    await testThrottleQueueCompaction ()
    return testThrottleRollingWindowInvariant ()
}

// exercises the periodic compaction branch in Throttler#dequeue () (queueHead
// reaching >= 1024 under a sustained backlog) by bursting a large batch of
// requests through a throttler with abundant tokens so nothing has to wait.
// With a small queue, queueHead never exceeds 1024 and the slice () branch
// never runs in CI, so this guards against a future refactor of the index
// arithmetic silently dropping or replaying a queued resolver.
async function testThrottleQueueCompaction () {
    // sized off the real threshold (rather than a hardcoded number) so this
    // stays a meaningful coverage guarantee even if QUEUE_COMPACTION_THRESHOLD
    // is ever raised
    const total = QUEUE_COMPACTION_THRESHOLD * 3
    const throttler = new Throttler ({
        'tokens': total + 10, // abundant tokens: no request should ever have to wait
        'cost': 1,
    })
    const order: number[] = []
    const promises: Promise<void>[] = []
    for (let i = 0; i < total; i++) {
        promises.push (throttler.throttle (1).then (() => { order.push (i) }))
    }
    await Promise.all (promises)
    assert (order.length === total, `testThrottleQueueCompaction: expected ${total} resolutions, got ${order.length}`)
    for (let i = 0; i < total; i++) {
        assert (order[i] === i, `testThrottleQueueCompaction: resolution order broken at index ${i}, got ${order[i]}`)
    }
    // a fully drained queue always ends up reset to this state whether or not
    // compaction fired along the way, but a non-zero queueHead/queue.length
    // here would mean the burst didn't actually finish draining
    assert (throttler.queueHead === 0 && throttler.queue.length === 0, `testThrottleQueueCompaction: queue did not fully drain (queueHead=${throttler.queueHead}, queue.length=${throttler.queue.length})`)
    console.log (`testThrottleQueueCompaction succeeded for ${total} queued items`)
}

// guards the totalCost === sum(timestamps[].cost) invariant that
// rollingWindowLoop () relies on: totalCost is now updated incrementally
// (see review on #30266) instead of being recomputed from timestamps[] each
// iteration, so a future change that adds an early continue/break between
// the expired-prefix trim and the totalCost += cost update could
// desynchronise the two permanently without this catching it.
async function testThrottleRollingWindowInvariant () {
    const throttler = new Throttler ({
        'algorithm': 'rollingWindow',
        'windowSize': 1000,
        'rateLimit': 10, // maxWeight = windowSize / rateLimit = 100, well above what this test admits
        'cost': 1,
    })
    const total = 50
    const promises: Promise<void>[] = []
    for (let i = 0; i < total; i++) {
        promises.push (throttler.throttle (1).then (() => {
            const sum = throttler.timestamps.reduce ((acc, t) => acc + t.cost, 0)
            assert (Math.abs (throttler.totalCost - sum) < 1e-9, `testThrottleRollingWindowInvariant: totalCost (${throttler.totalCost}) desynced from timestamps[] (${sum}) after resolution ${i}`)
        }))
    }
    await Promise.all (promises)
    console.log ('testThrottleRollingWindowInvariant succeeded')
}

export default testThrottle;
