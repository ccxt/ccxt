// Child process for the shutdown test: telemetry against a PostHog that never answers,
// some queued logs, shutdown with a short deadline, then a natural exit (no process.exit),
// so anything still holding the event loop shows up as a slow exit.
import { createTelemetry } from '../../../src/telemetry/index.js';

const telemetry = await createTelemetry ({
    'token': process.env['TEST_TOKEN'],
    'host': process.env['SINK_URL'],
    'stdout': () => undefined,
});
for (let i = 0; i < 200; i++) {
    telemetry.log ('info', 'queued line ' + i);
}
// let the background token check and a first logs flush get stuck in flight
await new Promise ((resolve) => setTimeout (resolve, 300));
await telemetry.shutdown (300);
