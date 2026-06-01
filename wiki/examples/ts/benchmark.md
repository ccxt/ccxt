- [Benchmark](./examples/ts/)


 ```javascript
 import { spawn } from 'child_process';
import asTable from 'as-table';
import ccxt, { version } from '../../js/ccxt.js';

interface Stats {
    min: number;
    average: number;
    max: number;
    median: number;
    iterations: number;
}

interface Test {
    language: string;
    method: string;
    command: string;
}

interface Benchmark extends Omit<Test, 'command'>, Stats { }

const stats = (times: number[]): Stats => {
    // calculate statistics
    const sum = times.reduce ((a, b) => a + b, 0);
    const avg = Math.round (sum / times.length);
    const min = Math.min (...times);
    const max = Math.max (...times);
    times.sort ((a, b) => a - b);
    const median = times.length % 2 === 0 ? (times[times.length / 2 - 1] + times[times.length / 2]) / 2 : times[Math.floor (times.length / 2)];
    return { min, 'average': avg, max, median, 'iterations': times.length };
};

async function benchmark (exchangeId, method, args, verbose = false, minIterations = 10, argsv = '') {
    const exchange = new ccxt.pro[exchangeId] ({});
    const languages = [ 'js', 'py', 'php', 'cs' ];
    const commands: Test[] = languages.map ((language) => ({
        'language': language,
        'method': method,
        'command': `npm run cli.${language} ${exchangeId} ${method} ${args.join (' ')} -- ${argsv} --poll`,
    }));
    const wsMethod = method + 'Ws';
    if (exchange.has[wsMethod]) {
        const wsCommands: Test[] = languages.map ((language) => ({
            'language': language,
            'method': wsMethod,
            'command': `npm run cli.${language} ${exchangeId} ${wsMethod} ${args.join (' ')} -- ${argsv} --poll`,
        }));
        commands.push (...wsCommands);
    }
    const regex = /iteration (\d+) passed in (\d+) ms/g;

    async function runCommand (command: string) {
        if (verbose) {
            console.log (exchange.iso8601 (new Date ().getTime ()), ' running command:', command);
        }
        return new Promise<{ times: number[] }> ((resolve, reject) => {
            const [ cmd, ...args ] = command.split (' ');

            const child = spawn (cmd, args);
            const matches = [];
            const language = command.slice (8, 15);
            child.stdout.on ('data', (data: Buffer) => {
                const message = data.toString ();
                matches.push (...Array.from (message.matchAll (regex)));
                const match = matches[matches.length - 1];

                if (match && match[1] && match[2]) {
                    const iteration = parseInt (match[1]);
                    const time = parseInt (match[2]);

                    if (iteration <= minIterations) {
                        if (verbose) {
                            console.log (exchange.iso8601 (new Date ().getTime ()), `${language} iteration ${iteration} passed in ${time} ms`);
                        }
                    } else {
                        const times = matches.map ((m) => parseInt (m[2]));
                        child.kill ();
                        if (verbose) {
                            console.log (exchange.iso8601 (new Date ().getTime ()), `killed process - ${language} iteration ${iteration} passed in ${time} ms`);
                        }
                        resolve ({ times });
                    }
                }
            });

            child.stderr.on ('data', (data: Buffer) => {
                const message = data.toString ();
                console.error (exchange.iso8601 (new Date ().getTime ()), `command ${command} failed. stderr: ${message}`);
                const times = matches.map ((m) => parseInt (m[2]));
                resolve ({ times });
            });

            child.on ('close', (code: number) => {
                const times = matches.map ((m) => parseInt (m[2]));
                resolve ({ times });
                console.log (exchange.iso8601 (new Date ().getTime ()), `${language} child process exited with code ${code}`);
            });

            child.on ('error', (err) => {
                console.error (exchange.iso8601 (new Date ().getTime ()), `command ${command} failed. error: ${err}`);
                reject (err);
            });
        });
    }

    const benchmarks: Benchmark[] = [];
    const results = await Promise.all (commands.map ((c) => runCommand (c.command)));
    for (let i = 0; i < results.length; i++) {
        const result = results[i];
        benchmarks.push ({ 'language': commands[i].language, 'method': commands[i].method, ...stats (result.times) });
    }
    if (verbose) {
        const rawResults = results.map ((r, i) => ({ 'language': commands[i].language, 'method': commands[i].method, ...stats (r.times), 'times': r.times }));
        console.log (rawResults);
    }
    console.log (asTable (benchmarks));
}

const [ _, , exchangeId, methodName, ...params ] = process.argv.filter ((x) => !x.startsWith ('--'));
const verbose = process.argv.includes ('--verbose');
const minIterationsString = process.argv.find ((x) => x.startsWith ('--min-iterations='))?.slice (18);
const minIterations = minIterationsString ? parseInt (minIterationsString) : 10;
const argsv = process.argv.filter ((x) => x.startsWith ('--') && !x.startsWith ('--min-iterations')).join (' ');


console.log ((new Date ()).toISOString ());
console.log ('Node.js:', process.version);
console.log ('CCXT v' + version);

const start = new Date ().getTime ();
await benchmark (exchangeId, methodName, params, verbose, minIterations, argsv);
const end = new Date ().getTime ();

console.log ((new Date ().toISOString ()), 'Total time:', end - start, 'ms');
process.exit (0);
 
```