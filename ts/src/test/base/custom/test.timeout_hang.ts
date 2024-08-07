// run with `node test_timeout_hang`

import { timeout } from '../../../base/functions';

(async function () {
    await timeout (10000, Promise.resolve ('foo'));
    console.log ('Look ma, no hangs!'); // should terminate the process immediately..
} ());
