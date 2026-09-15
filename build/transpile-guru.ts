// ---------------------------------------------------------------------------
// Usage: npm run transpile-guru
// ---------------------------------------------------------------------------

import fs from 'fs'
import path from 'path'
import log from 'ololog'
import ansi from 'ansicolor'
import { platform } from 'process'
import os from 'os'
import { fork } from 'child_process'
import * as url from 'node:url';
import Piscina from 'piscina';
import { isMainEntry, Transpiler as OldTranspiler } from "./transpile.js";
import { NewTranspiler as GoTranspiler } from "./goTranspiler.js";
import { NewTranspiler as CsharpTranspiler } from "./csharpTranspiler.js";
ansi.nice

// types:
type dict = { [key: string]: string }
declare global {
    interface String {
        yellow(): string;
        cyan(): string;
    }
}

const pythonCodingUtf8 = '# -*- coding: utf-8 -*-'
const baseExchangeJsFile = './ts/src/base/Exchange.ts'

const exchanges = JSON.parse (fs.readFileSync("./exchanges.json", "utf8"));
const exchangeIds = exchanges.ids;
const exchangesWsIds = exchanges.ws;
const exchangesPredictionIds = exchanges.prediction || [];
const exchangesPredictionWsIds = exchanges.predictionWs || [];

let shouldTranspileTests = true

const metaFileUrl = import.meta.url;
let __dirname = new URL('.', metaFileUrl).pathname;

// this is necessary because for some reason
// pathname keeps the first '/' for windows paths
// making them invalid
// example: /C:Users/user/Desktop/
if (platform === 'win32') {
    if (__dirname[0] === '/') {
        __dirname = __dirname.substring(1)
    }
}

// ============================================================================
if (isMainEntry(metaFileUrl)) {
    const transpiler = new OldTranspiler ()
    const test = process.argv.includes ('--test') || process.argv.includes ('--tests')
    const errors = process.argv.includes ('--error') || process.argv.includes ('--errors')
    const force = process.argv.includes ('--force')
    const baseClassOnly = process.argv.includes ('--baseClass')
    const baseTestsOnly = process.argv.includes ('--baseTests')
    const examples = process.argv.includes ('--examples')

    shouldTranspileTests = process.argv.includes ('--noTests') ? false : true
    transpiler.buildPython = false
    transpiler.buildPHP = false

    const buildPHP = process.argv.includes ('--php');
    if (buildPHP) {
        transpiler.buildPHP = true
    }
    const buildPy = process.argv.includes ('--python');
    if (buildPy) {
        transpiler.buildPython = true
    }
    let goTranspiler;
    let csharpTranspiler;
    const buildGo = process.argv.includes ('--go');
    const buildCsharp = process.argv.includes ('--cs');
    // const buildJava = process.argv.includes ('--java');
    if (buildGo) {
        goTranspiler = new GoTranspiler()
    }
    if (buildCsharp) {
        csharpTranspiler = new CsharpTranspiler ()
    }

    if (baseClassOnly) {
        transpiler.transpileBaseMethods ()
        transpiler.transpilePredictionBaseMethods ()
        if (buildGo && goTranspiler !== undefined) {
            await goTranspiler.transpileBaseMethods (baseExchangeJsFile)
            await goTranspiler.transpilePredictionBaseMethods ()
        }
        if (buildCsharp && csharpTranspiler !== undefined) {
            await csharpTranspiler.transpileBaseMethods (baseExchangeJsFile)
            await csharpTranspiler.transpilePredictionBaseMethods ()
        }
    } else if (baseTestsOnly) {
        (async () => {
            await transpiler.baseFunctionalitiesTests ()
            await transpiler.transpileCryptoTests ()
            if (buildGo && goTranspiler !== undefined) {
                await goTranspiler.transpileTests ()
            }
            if (buildCsharp && csharpTranspiler !== undefined) {
                await csharpTranspiler.transpileTests ()
            }
        })()
    } else if (test) {
        (async () => {
            await transpiler.transpileTests ()
            if (buildGo && goTranspiler !== undefined) {
                await goTranspiler.transpileTests ()
            }
            if (buildCsharp && csharpTranspiler !== undefined) {
                await csharpTranspiler.transpileTests ()
            }
        })()
    } else if (errors) {
        transpiler.transpileErrorHierarchy ()
    } else {
        (async () => {
            // --prediction transpiles the given exchange(s) from ts/src/prediction/; bare
            // prediction-only ids (e.g. `transpile.ts kalshi`) auto-route there so scoped
            // CI steps don't need to know the namespace
            const cliExchanges = process.argv.slice (2).filter (x => !x.startsWith ('--'))
            const allArePredictionOnly = cliExchanges.length > 0 && cliExchanges.every (x => exchangesPredictionIds.includes (x) && !exchangeIds.includes (x))
            const prediction = process.argv.includes ('--prediction') || allArePredictionOnly
            await transpiler.transpileEverything (force, false, prediction)
            if (buildGo && goTranspiler !== undefined) {
                await goTranspiler.transpileEverything (force, false, examples, prediction)
            }
            if (buildCsharp && csharpTranspiler !== undefined) {
                console.log('Csharp ')
                await csharpTranspiler.transpileEverything (force, false, examples, prediction)
            }
        })()
    }

} else { // if required as a module

    // do nothing
}

// ============================================================================

export {}
