// ---------------------------------------------------------------------------
// Usage: node tests-manager.js someNodeFile
// ---------------------------------------------------------------------------

"use strict";
const fs = require('fs');
const { spawn } = require('child_process');
const util = require('node:util');
const { exit } = require('process');
const execFile = util.promisify(require('node:child_process').execFile);
const log = require ('ololog').unlimited

const TEST_TIMESTAMP = "./testTimestamp.json";

const testFile = require(TEST_TIMESTAMP);
const lastRun = testFile.lastRun;
const threeHours = 60 * 60 * 3 * 1000;
const currentTs = Date.now();

if (process.argv.length < 3) {
    log.red("Required node command not provided");
    log.yellow("Example: node tests-manager.js run-tests-ws");
    exit(1);
}

const COMMAND = process.argv[2];

const argv = process.argv
argv.splice(0,3);

async function main() {

    if (currentTs > threeHours + lastRun) {
        // run all tests again
        runCommand(argv)
    } else {
        const { stdout } = await execFile('git diff master', ['--name-only'], { shell:true });

        if (stdout.length === 0) {
            return;
        }

        const shouldRunEverything = stdout.indexOf ("Exchange") > -1 ||
                                    stdout.indexOf ("/test") > -1 ||
                                    stdout.indexOf ("/build") > -1 ||
                                    stdout.indexOf ("/base") > -1 ||
                                    stdout.indexOf ("/static_dependencies") > -1 ||
                                    stdout.indexOf ("run-tests") > -1

        if (shouldRunEverything) {
            runCommand(argv)
        } else {
            const exchangeFiles = stdout.split ("\n").filter (e => e && e.indexOf('js/') > -1 ).map(e=> e.split("/").pop()).map(e=> e.split(".")[0]);
            // ignore examples and files like that
            if (exchangeFiles.length > 0) {
                const parsedArgs = exchangeFiles.concat (argv)
                runCommand (parsedArgs, false) // when running some specific tests we shouldn't update ts
            }
        }
    }
}

function runCommand(args, updateTs = true) {

    const nodeCommand = "node " + COMMAND;
    const pro = spawn (nodeCommand, args, { stdio: 'inherit', shell: true })

    pro.on('exit', code => {
        console.log ("code", code)
        if (code === 0) {
            if (updateTs) {
                log.bright.green ("All tests ran sucessfully, saving new timestamp!")
                saveNewTS ()
            }
        } else {
            log.bright.red ("Error running tests!")
        }
    })
}

function saveNewTS() {
    testFile.lastRun = Date.now ();
    fs.writeFileSync (TEST_TIMESTAMP, JSON.stringify (testFile))
}

main();
