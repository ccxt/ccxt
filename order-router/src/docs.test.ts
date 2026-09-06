import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, globSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:http';

// The README documented an entire key-management CLI — `npm run keys:create/list/revoke/delete` —
// that had never existed under those names, including the revoke command an operator would reach
// for on a leaked key. Nothing catches that class of drift by reading: the commands look plausible,
// and the person who needs them is having a bad day already.
//
// So the commands the README tells an operator to run are checked against the ones that exist.

const root = new URL('../', import.meta.url);
const README = readFileSync(fileURLToPath(new URL('README.md', root)), 'utf8');
const pkg = JSON.parse(readFileSync(fileURLToPath(new URL('package.json', root)), 'utf8')) as {
    scripts: Record<string, string>;
};
const ADMIN_CLI = readFileSync(fileURLToPath(new URL('src/cli/admin.ts', root)), 'utf8');

test('every `npm run` command in the README exists in package.json', () => {
    const referenced = new Set(
        [...README.matchAll(/npm run ([a-z][a-z0-9:_-]*)/g)].map((m) => m[1]!),
    );
    const missing = [...referenced].filter((name) => pkg.scripts[name] === undefined).sort();
    assert.deepEqual(missing, [],
        'the README tells an operator to run scripts that do not exist:\n  ' + missing.join('\n  '));
});

test('every documented `npm run admin --` subcommand is one the CLI handles', () => {
    // The script exists, so the check above passes for anything of the form `npm run admin -- x`;
    // the subcommand is what actually has to be there.
    const documented = new Set(
        [...README.matchAll(/npm run admin -- ([a-z][a-z-]*)/g)].map((m) => m[1]!),
    );
    assert.ok(documented.size > 0, 'the README should document how to bootstrap an admin');
    const handled = new Set(
        [...ADMIN_CLI.matchAll(/command === '([a-z-]+)'/g)].map((m) => m[1]!),
    );
    for (const sub of documented) {
        assert.ok(handled.has(sub), `README documents \`admin ${sub}\`, which the CLI does not handle`);
    }
});

test('the CLI usage line lists every command it handles', () => {
    // `create-key` was missing from it, so the one command an operator needs at 3am to mint a
    // break-glass key was invisible to anyone who ran the CLI wrong to find out what it did.
    const usage = /usage: admin <([a-z|-]+)>/.exec(ADMIN_CLI)?.[1] ?? '';
    const listed = new Set(usage.split('|'));
    const handled = [...ADMIN_CLI.matchAll(/command === '([a-z-]+)'/g)].map((m) => m[1]!);
    for (const command of handled) {
        assert.ok(listed.has(command), `\`${command}\` is handled but missing from the usage line`);
    }
});

// The README documents the systemd unit an operator pastes onto the box. Two of its lines are not
// decoration: without `Restart=`, the crash handlers — which log, flush and exit non-zero on the
// stated assumption that a supervisor restarts the process — end the service on the first
// unhandled rejection; without `ExecReload=`, the `systemctl reload order-router` the same README
// offers as the instant key-revocation path is an error, leaving a restart (and a full book-cache
// rebuild) as the only way to pick up a revocation early.
function systemdUnit (): string {
    const start = README.indexOf('# /etc/systemd/system/order-router.service');
    assert.notEqual(start, -1, 'the README should document the unit');
    const end = README.indexOf('```', start);
    return README.slice(start, end);
}

test('the documented systemd unit restarts the service it says a supervisor restarts', () => {
    assert.match(systemdUnit(), /^Restart=/m,
        'the crash strategy depends on a supervisor restart; the unit must ask for one');
});

test('the documented unit can actually reload, and the process answers the signal it is sent', () => {
    const unit = systemdUnit();
    const reload = /^ExecReload=.*$/m.exec(unit)?.[0] ?? '';
    assert.notEqual(reload, '', 'the README offers `systemctl reload` as the key-reload path');
    // The signal the unit sends must be the one the process handles, or reload succeeds and does
    // nothing — the worst of the three outcomes.
    const signal = /-([A-Z]+)\s+\$MAINPID/.exec(reload)?.[1] ?? '';
    const index = readFileSync(fileURLToPath(new URL('src/index.ts', root)), 'utf8');
    assert.ok(index.indexOf(`process.on('SIG${signal}'`) !== -1,
        `the unit sends SIG${signal}, which src/index.ts does not handle`);
});

test('every job in the order-router workflow bounds its own runtime', () => {
    // Without timeout-minutes a hung step holds a runner for the six-hour default. build-and-test
    // was the one job in the file without it.
    const workflow = readFileSync(
        fileURLToPath(new URL('.github/workflows/order-router.yml', new URL('../', root))), 'utf8');
    // Scoped to the `jobs:` block — `on:` has two-space keys of its own (push, pull_request).
    const jobsBlock = workflow.slice(workflow.indexOf('\njobs:\n'));
    const jobs = [...jobsBlock.matchAll(/^ {2}([a-z][a-z0-9-]*):$/gm)].map((m) => m[1]!);
    assert.ok(jobs.length >= 4, `expected the workflow's jobs, found ${jobs.join(', ')}`);
    for (const job of jobs) {
        // From just past this job's own header line to the start of the next job's.
        const header = `\n  ${job}:\n`;
        const body = jobsBlock.slice(jobsBlock.indexOf(header) + header.length);
        const next = body.search(/^ {2}[a-z][a-z0-9-]*:$/m);
        const block = (next === -1) ? body : body.slice(0, next);
        assert.match(block, /^ {4}timeout-minutes:/m, `job ${job} has no timeout-minutes`);
    }
});

test('the README test-coverage table names every test file, and no file that does not exist', () => {
    // The table named `src/routing/bestPrice.test.ts`, which has never existed, and undercounted
    // the suite by 6x — while the readiness table two sections down reported CI as "Closed". A
    // stale coverage table does not just misinform, it overstates verification.
    const listed = new Set(
        [...README.matchAll(/`(src\/[A-Za-z0-9/._-]+\.test\.ts)`/g)].map((m) => m[1]!),
    );
    assert.ok(listed.size > 10, `expected the coverage table, found ${listed.size} files`);
    for (const file of listed) {
        assert.ok(existsSync(fileURLToPath(new URL(file, root))),
            `the coverage table names ${file}, which does not exist`);
    }
    const onDisk = globSync('src/**/*.test.ts', { cwd: fileURLToPath(root) }).sort();
    assert.ok(onDisk.length > 10, 'expected to find the suite on disk');
    const missing = onDisk.filter((f) => !listed.has(f));
    assert.deepEqual(missing, [], 'test files with no row in the README coverage table');
});

test('the coverage section does not carry a test count that will rot', () => {
    // A number written down goes stale the next time anyone adds a test, and the one that was
    // here had. `npm test` prints the real count.
    const section = README.slice(README.indexOf('| Area | File | What\'s covered |') - 800,
        README.indexOf('| Area | File | What\'s covered |'));
    assert.equal(/^\d+ tests,/m.test(section), false,
        'the coverage section should not state a fixed test count');
});

test('every unit the deploy restarts is a unit the README tells you to create', () => {
    // The deploy restarts three services; the README documented one. The two it omitted are not
    // optional extras — the ingest runner is what WRITES the key snapshot the router reads, so a
    // box built from the README answered 401 to every caller with nothing in the log to explain
    // it. This reads the workflow's own EXTRA_SERVICES so the two cannot drift apart again.
    const workflow = readFileSync(
        fileURLToPath(new URL('.github/workflows/order-router.yml', new URL('../', root))), 'utf8');
    const service = /^\s*SERVICE: ([a-z-]+)$/m.exec(workflow)?.[1];
    const extras = /^\s*EXTRA_SERVICES: '([^']*)'$/m.exec(workflow)?.[1] ?? '';
    assert.ok(service, 'the workflow should name the primary service');
    const units = [ service!, ...extras.split(/\s+/).filter((u) => u.length > 0) ];
    assert.ok(units.length >= 3, `expected the companion units, got ${units.join(', ')}`);
    for (const unit of units) {
        assert.ok(README.indexOf(`/etc/systemd/system/${unit}.service`) !== -1,
            `the deploy restarts ${unit} but the README never says how to create it`);
    }
});

test('the bootstrap tells an operator to create the schema before starting anything', () => {
    // create-admin, the console and the ingest runner all read a database that does not exist
    // until db:migrate has run, and the failure if it has not is an unhandled Postgres error at
    // boot rather than anything that names the missing step.
    const setup = README.slice(README.indexOf('### One-time setup on the box'));
    const migrate = setup.indexOf('npm run db:migrate');
    const createAdmin = setup.indexOf('admin -- create-admin');
    assert.notEqual(migrate, -1, 'the bootstrap should run the migration');
    assert.ok(migrate < createAdmin, 'the schema has to exist before the first admin can be made');
});

test('no design doc the README points at still calls itself unshipped', () => {
    // All three plan documents were stamped "plan, not shipped" long after the thing they describe
    // shipped, and one of them forbids — in bold — the :443 deployment that is running. An
    // operator sent to a document that disclaims itself cannot tell which parts are true, so the
    // safest reading (believe none of it) and the dangerous one (believe all of it) are equally
    // available.
    const docs = globSync('docs/*.md', { cwd: fileURLToPath(root) });
    assert.ok(docs.length >= 3, `expected the design docs, found ${docs.join(', ')}`);
    for (const doc of docs) {
        const text = readFileSync(fileURLToPath(new URL(doc, root)), 'utf8');
        const status = /^Status: (.*)$/m.exec(text)?.[0] ?? '';
        assert.notEqual(status, '', `${doc} has no Status line`);
        assert.equal(/plan, not shipped/.test(status), false,
            `${doc} still calls itself unshipped: ${status}`);
    }
    // And the pointer in the Security section goes to the document that describes what runs.
    const pointer = README.slice(README.indexOf('### Still not an identity system'));
    assert.ok(pointer.indexOf('docs/product-plan.md') !== -1,
        'the README should send a reader to the shipped design first');
});

// ---------------------------------------------------------------------------------------------
// The workflow, read as text: these assert the invariants that only exist in .github/workflows and
// that no other test in this package can see. Same technique as the timeout-minutes test above —
// this package has no YAML parser, and the failures being guarded against are all keyword-level.
// ---------------------------------------------------------------------------------------------
const WORKFLOW = readFileSync(
    fileURLToPath(new URL('.github/workflows/order-router.yml', new URL('../', root))), 'utf8');

function jobBlock (name: string): string {
    const jobs = WORKFLOW.slice(WORKFLOW.indexOf('\njobs:\n'));
    const header = `\n  ${name}:\n`;
    const start = jobs.indexOf(header);
    assert.notEqual(start, -1, `the workflow has no \`${name}\` job`);
    const body = jobs.slice(start + header.length);
    const next = body.search(/^ {2}[a-z][a-z0-9-]*:$/m);
    return (next === -1) ? body : body.slice(0, next);
}

// The service depends on the PUBLISHED ccxt at an exact version while living inside the ccxt repo,
// and nothing reconciled the two: the pin sat thirteen patch releases behind the tree around it, so
// every library fix landed in ts/src stopped at the service boundary and no build, test or review
// step could see it. The pin is not bumped here — that is a behaviour change with its own review —
// but the gap is now written down and checked, so it can only widen deliberately.
test('the ccxt pin has not drifted past the lag on record', () => {
    const result = spawnSync(process.execPath, ['scripts/check-ccxt-pin.mjs'],
        { cwd: fileURLToPath(root), encoding: 'utf8' });
    assert.equal(result.status, 0,
        `scripts/check-ccxt-pin.mjs failed:\n${result.stderr}${result.stdout}`);
});

test('CI runs the ccxt pin check', () => {
    // The check above only guards this checkout. Drift arrives when the REPO moves, in a commit
    // that need not touch order-router at all, so the check has to be a build step too.
    assert.match(jobBlock('build-and-test'), /run: npm run check:ccxt-pin/,
        'build-and-test does not run the ccxt pin check');
});

test('the deploy job tests the tree it ships', () => {
    // build-and-test runs on x64; deploy rebuilds from scratch on arm64 and packs THAT tree. For
    // as long as deploy ran no assertions, the artifact reaching production was one no test had
    // ever touched, and an arm64-only failure was first observed by the on-box smoke — after the
    // symlink had moved.
    const deploy = jobBlock('deploy');
    const tested = deploy.indexOf('run: npm test');
    assert.notEqual(tested, -1, 'the deploy job never runs the test suite on the tree it packs');
    const packed = deploy.indexOf('tar czf');
    assert.notEqual(packed, -1, 'the deploy job should pack a release');
    assert.ok(tested < packed, 'the deploy job packs the release before testing it');
});

test('the on-box smoke test waits for readiness, not just liveness', () => {
    // /health answers 200 from the first millisecond of boot. A deploy that gates on it alone
    // declares success while the book cache is still cold and /route is answering "no route" to
    // live traffic. /ready is the endpoint that knows the difference, and nothing consumed it.
    const smoke = jobBlock('deploy').split('\n').filter((line) => line.indexOf('curl') !== -1);
    assert.ok(smoke.some((line) => line.indexOf('/ready') !== -1),
        'the deploy smoke test never REQUESTS /ready (a comment about it is not a gate), so it '
        + 'cannot tell a warm router from a cold one');
});

test('rollback fires on failed assertions, not on an unusable smoke key', () => {
    // A missing, rotated or revoked ORDER_ROUTER_SMOKE_API_KEY fails every authenticated check in
    // live-integration.mjs, which is indistinguishable from "the release is bad" if the rollback
    // keys on the job result. It rolled a healthy release back and restarted the router twice —
    // two full book-cache rebuilds — over an expired secret.
    assert.match(jobBlock('live-integration'), /^ {4}outputs:$/m,
        'live-integration must publish what it learned, not just whether it passed');
    assert.match(jobBlock('live-integration'), /verdict=misconfigured/,
        'live-integration must be able to report that its own configuration, not the release, was wrong');
    assert.match(jobBlock('rollback'),
        /needs\.live-integration\.outputs\.verdict == 'failed'/,
        'rollback still fires on any live-integration failure, including one that says nothing '
        + 'about the deployed release');
});

test('live-integration.mjs exits 2, not 1, when the deployment rejects the supplied key', async () => {
    // Exit 2 is what the workflow reads as "misconfigured" and refuses to roll back on, so the
    // script has to actually produce it: a service that rejects no-key and a bogus key correctly,
    // and then rejects OURS, has told us about our credentials and nothing about itself.
    const server = createServer((req, res) => {
        const url = req.url ?? '';
        if (url.startsWith('/health')) {
            res.writeHead(200, { 'content-type': 'application/json' });
            res.end(JSON.stringify({ status: 'ok', uptimeSec: 1 }));
            return;
        }
        // Every authenticated path 401s, including with the key we were handed — a revoked key.
        res.writeHead(401, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ error: 'unauthorized' }));
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    try {
        const port = (server.address() as { port: number }).port;
        // spawn, not spawnSync: the stub server is served by THIS event loop, which spawnSync
        // would block for the child's whole lifetime — every request would time out and the exit
        // code would be 1 for reasons that have nothing to do with what is being asserted.
        const child = spawn(process.execPath, ['scripts/live-integration.mjs'], {
            cwd: fileURLToPath(root),
            env: {
                ...process.env,
                ROUTER_BASE_URL: `http://127.0.0.1:${port}`,
                ROUTER_API_KEY: 'or_live_revoked',
                ROUTER_WARMUP_MS: '1',
                ROUTER_TIMEOUT_MS: '3000',
            },
        });
        let stdout = '';
        child.stdout.on('data', (chunk) => { stdout += String(chunk); });
        child.stderr.on('data', () => {});
        const status = await new Promise<number | null>((resolve) => {
            child.on('close', (code) => resolve(code));
        });
        assert.equal(status, 2, `expected exit 2 (misconfigured), got ${status}:\n${stdout}`);
        assert.match(stdout, /MISCONFIGURED/);
    } finally {
        server.close();
    }
});

test('the nginx readiness gate exempts exactly the endpoints the app leaves ungated', async () => {
    // The app gates /route and /stream/route ONLY: those RANK ACROSS the cache, so a venue that
    // has not connected silently changes which one wins. /orderbook, /symbols and
    // /exchanges/status rank nothing -- they report what the cache holds, which is the truth a
    // caller most wants during a restart -- and the README argues that carve-out at length.
    //
    // nginx gates on a PREFIX, so `location /router/api/` swept all of them up and the documented
    // behaviour was not the behaviour for anyone arriving through the proxy, which is everyone.
    // This test exists because the two live in different files and nothing else ties them together.
    const { readFileSync } = await import('node:fs');
    const conf = readFileSync(new URL('../docs/deploy/nginx/docs.ccxt.com-router.conf', import.meta.url), 'utf8');
    const server = readFileSync(new URL('./api/server.ts', import.meta.url), 'utf8');

    // Locations carrying `auth_request off` — the ones nginx serves while cold.
    const exempt = [ ...conf.matchAll(/location\s+(=\s+)?(\S+)\s*\{[^}]*auth_request\s+off/g) ]
        .map((m) => m[2]);
    for (const path of [ '/router/api/orderbook/', '/router/api/symbols', '/router/api/exchanges/status' ]) {
        assert.ok(exempt.indexOf(path) !== -1,
            `${path} is served while cold by the app, so nginx must not gate it (add auth_request off)`);
    }
    // The converse: the two the app DOES refuse must stay gated, or the proxy would pass a cold
    // ranking straight through.
    assert.match(conf, /location\s+\/router\/api\/stream\/\s*\{[^}]*auth_request\s+\/_router_ready_gate/,
        'the stream must stay gated');
    assert.ok(server.indexOf("reason: 'cache_cold'") !== -1,
        'the app still refuses cold; if this moved, revisit the nginx exemptions above');
});
