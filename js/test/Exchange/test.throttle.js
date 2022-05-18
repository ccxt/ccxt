const { throttle } = require ('../../base/functions/throttle')

const delta = 10
const testCases = [
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

async function runner (test) {
    const throttler = throttle ({
        'refillRate': test['refillRate'],
        'tokens': test['tokens'],
    })
    const start = performance.now ()
    for (let i = 0; i < test['runs']; i++) {
        await throttler (test['cost'])
    }
    const end = performance.now ()
    const elapsed = end - start
    const result = Math.abs (elapsed - test['expected']) < delta
    console.log (`case ${test['number']} ${result ? 'suceeded' : 'failed'} in ${elapsed}ms expected ${test['expected']}ms`)
}

for (const test of testCases) {
    runner (test)
}
