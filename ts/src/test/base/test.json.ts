
// AUTO_TRANSPILE_ENABLED

import assert from 'assert';
import ccxt, { BadRequest } from '../../../ccxt.js';

function testJsonInner () {

    const exchange = new ccxt.Exchange ({
        'id': 'regirock',
    });

    // Test: object
    const obj = { "k": "v" };
    const objJson = exchange.json (obj);
    assert (objJson === "{\"k\":\"v\"}");

    // Test: list
    const list = [ 1, 2 ];
    const listJson = exchange.json (list);
    assert (listJson === "[1,2]");

    // Test: can serialize errors
    try {
        throw new BadRequest ("some error");
    } catch (e) {
        const errString = exchange.json (e);
        assert (errString === "{\"name\":\"BadRequest\"}");
    }

    // Test: json a string
    const str = "ccxt, rocks!";
    const serializedString = exchange.json (str);
    assert (serializedString === "\"ccxt, rocks!\"");

}

function testJson () {
    testJsonInner ();
}

function testJson2 () {
    try {
        testJsonInner ();
    } catch (exc) {
        // todo: the reason this tests was commented in `base/test.init.ts` is that as it needs fix of ast-tranpsiler - it adds extra backslashes in PHP double-quoted json which are read as literal chars in PHP
        const message = exc.toString ();
        // transpiler trick
        if (!((message + '').toString ()).includes ('json.php')) {
            throw exc;
        }
    }
}

export default testJson;
