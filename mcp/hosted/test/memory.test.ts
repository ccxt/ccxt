import { test } from 'node:test';
import assert from 'node:assert/strict';
import v8 from 'node:v8';
import vm from 'node:vm';
import { startHarness, rpc } from './helpers/harness.js';

// The SDK's 2025-era stateless path adds an abort listener to the request's signal and
// never removes it; given the raw node-server Request, that listener kept every per-request
// McpServer (about 300 KB each) alive for good, and the container ran out of memory after a
// few thousand calls. Bound the heap growth of many legacy-era requests after a full GC.

v8.setFlagsFromString ('--expose-gc');
const gc: () => void = vm.runInNewContext ('gc');

async function settledHeap (): Promise<number> {
    for (let i = 0; i < 4; i++) {
        await new Promise ((resolve) => setTimeout (resolve, 20));
        gc ();
    }
    return process.memoryUsage ().heapUsed;
}

test ('memory: legacy-era requests do not retain their per-request servers', async () => {
    const harness = await startHarness ({ 'RATE_LIMIT_BURST': '100000', 'RATE_LIMIT_PER_MINUTE': '100000', 'MAX_CONCURRENT_REQUESTS': '1000' });
    try {
        const legacy = { 'mcp-protocol-version': '2025-11-25' };
        // warm-up: module caches, JIT, the first server build
        for (let i = 0; i < 50; i++) {
            await rpc (harness.url, 'ping', {}, legacy);
        }
        const before = await settledHeap ();
        const count = 400;
        for (let i = 0; i < count; i++) {
            const response = await rpc (harness.url, (i % 2 === 0) ? 'ping' : 'tools/list', {}, legacy);
            assert.equal (response.status, 200);
        }
        const grown = (await settledHeap ()) - before;
        // retained, ~120 MB for 400 requests; fixed, a few MB of noise
        assert.ok (grown < 30 * 1024 * 1024, 'heap grew by ' + Math.round (grown / 1024 / 1024) + ' MB over ' + count + ' requests');
    } finally {
        await harness.close ();
    }
});
