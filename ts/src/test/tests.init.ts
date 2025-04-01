

import { getCliArgValue, argvExchange, argvSymbol, argvMethod } from './tests.helpers.js';
import testMainClass from './tests.js';
import baseTestsInitRest from './base/tests.init.js';
import baseTestsInitWs from '../pro/test/base/tests.init.js';


// ########### args ###########
const isWs = getCliArgValue ('--ws');
const isBaseTests = getCliArgValue ('--baseTests');
const runAll = getCliArgValue ('--all');

// ####### base tests #######
if (isBaseTests) {
    if (isWs) {
        baseTestsInitWs ();
        console.log ('base WS tests passed!');
    } else {
        baseTestsInitRest ();
        console.log ('base REST tests passed!');
    }
    if (!runAll) {
        process.exit (0);
    }
}

(new testMainClass ()).init (argvExchange, argvSymbol, argvMethod);
