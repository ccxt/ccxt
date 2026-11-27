// collect, then build-feed, with the same arguments (npm run run -- --venue bybit).
import { main as collect } from './collect.ts';
import { main as buildFeed } from './build-feed.ts';

const argv = process.argv.slice (2);
let code = await collect (argv);
if (code === 0) {
    code = await buildFeed (argv);
}
process.exitCode = code;
