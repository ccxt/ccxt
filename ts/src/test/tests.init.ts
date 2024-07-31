

import { getCliArgValue, argvExchange, argvSymbol, argvMethod, } from './tests.helpers.js';
import testMainClass from './tests.js';
import baseTestsInitWs from '../pro/test/base/tests.init.js';


// ########### args ###########
const isWs = getCliArgValue ('--ws');
const isBaseTests = getCliArgValue ('--baseTests');
const runAll = getCliArgValue ('--all');

// ####### base tests #######
if (isBaseTests) {
    if (isWs) {
        baseTestsInitWs ();
    } else {
        await (new testMainClass ()).init ();
    }
    if (!runAll) {
        process.exit (0);
    }
}

(new testMainClass ()).init (argvExchange, argvSymbol, argvMethod);
