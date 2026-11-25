// Entry point of the hosted server (dist/server.mjs in production). The shared logging
// module comes first: it reroutes console.* to stderr on import, which keeps stray library
// output out of the JSON log lines this process writes to stdout.
import '../../ts/logging.js';
import { ccxt } from '../../ts/ccxt-loader.js';
import { loadConfig } from './config.js';
import { startHostedServer, installSignalHandlers } from './server.js';
import { createTelemetry, telemetryConfigFromEnv } from './telemetry/index.js';

declare const __HOSTED_VERSION__: string | undefined;
const VERSION = (typeof __HOSTED_VERSION__ === 'string') ? __HOSTED_VERSION__ : 'dev';

async function main (): Promise<void> {
    const config = loadConfig (process.env, VERSION);
    const fromEnv = telemetryConfigFromEnv (process.env);
    // the bundle's build id unless the deployment names the version itself
    const telemetry = await createTelemetry ({ ...fromEnv, 'serviceVersion': process.env['SERVICE_VERSION'] ?? VERSION });
    const running = await startHostedServer ({ config, ccxt, telemetry });
    installSignalHandlers (process, running, (code) => process.exit (code), telemetry);
}

main ().catch ((error) => {
    process.stderr.write ('fatal: ' + String (error?.stack ?? error) + '\n');
    process.exit (1);
});
