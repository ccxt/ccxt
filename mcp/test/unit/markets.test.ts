import { test } from 'node:test';
import assert from 'node:assert/strict';
import { withMarketLoadLimit, marketLoadLimit } from '../../ts/markets.js';

test ('withMarketLoadLimit bounds concurrent cold loads to the threadpool-sized limit', async () => {
    const limit = marketLoadLimit ();
    let active = 0;
    let max = 0;
    let completed = 0;
    // a burst of 19 (the reporter's number) — without the gate all 19 would run at once and
    // starve the DNS/threadpool path; with the gate at most `limit` run concurrently
    const tasks = Array.from ({ length: 19 }, () => withMarketLoadLimit (async () => {
        active += 1;
        max = Math.max (max, active);
        await new Promise ((resolve) => setTimeout (resolve, 10));
        active -= 1;
        completed += 1;
    }));
    await Promise.all (tasks);
    assert.ok (max <= limit, 'observed max concurrency ' + max + ' must be <= ' + limit);
    assert.ok (max > 1, 'still runs several in parallel (not serialized)');
    assert.equal (completed, 19, 'every queued load still completes');
});
