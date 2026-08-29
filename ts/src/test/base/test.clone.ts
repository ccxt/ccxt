

import assert from 'assert';
import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';

function testClone () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    const obj1 = {
        "a": 1,
        "b": [ 1, 2, 3 ],
        "c": [ { "test1": 1, "test2": 1 } ],
        "d": undefined,
        "e": "not_undefined",
        "sub": {
            "a": 1,
            "b": [ 1, 2 ],
            "c": [ { "test1": 1, "test2": 2 } ],
            "d": undefined,
            "e": "not_undefined",
            "other1": "x",
        },
        "other1": "x",
    };

    const obj2 = {
        "a": 2,
        "b": [ 3, 4 ],
        "c": [ { "test1": 2, "test3": 3 } ],
        "d": "not_undefined",
        "e": undefined,
        "sub": {
            "a": 2,
            "b": [ 3, 4 ],
            "c": [ { "test1": 2, "test3": 3 } ],
            "d": "not_undefined",
            "e": undefined,
            "other2": "y",
        },
        "other2": "y",
    };

    // deepExtend
    const deepExtended = exchange.deepExtend (obj1, obj2);
    const compareTo = {
        "a": 2,
        "b": [ 3, 4 ],
        "c": [ {
            "test1": 2,
            "test3": 3,
        } ],
        "d": "not_undefined",
        "e": undefined,
        "sub": {
            "a": 2,
            "b": [ 3, 4 ],
            "c": [ { "test1": 2, "test3": 3 } ],
            "d": "not_undefined",
            "e": undefined,
            "other1": "x",
            "other2": "y",
        },
        "other1": "x",
        "other2": "y",
    };
    // todo: results are different across langs.
    // to avoid delay to this PR, I comment out this now, but will return to this after this PR merged
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testDeepExtend', deepExtended, compareTo);

    // -------------------------------------------------------------------------
    // test immutability / no cross-mutation between clone and original
    // -------------------------------------------------------------------------

    // --- test A: shallow-object clone – mutating the clone must not affect original ---
    const simpleOrig = { "x": 1, "y": "hello", "z": undefined };
    const simpleClone = exchange.clone (simpleOrig);

    assert (simpleClone["x"] === 1,         "clone A: x");
    assert (simpleClone["y"] === "hello",   "clone A: y");
    assert (simpleClone["z"] === undefined, "clone A: z");

    simpleClone["x"] = 999;
    simpleClone["y"] = "mutated";
    assert (simpleOrig["x"] === 1,       "clone A: mutating clone must not change original x");
    assert (simpleOrig["y"] === "hello", "clone A: mutating clone must not change original y");

    // mutating the original must not affect an already-taken clone
    simpleOrig["x"] = 42;
    assert (simpleClone["x"] === 999,    "clone A: mutating original must not change clone x");

    // -------------------------------------------------------------------------
    // --- test B: nested object – verify clone is a shallow copy (top-level keys independent) ---
    const nestedOrig = {
        "top": "original",
        "arr": [ 10, 20, 30 ],
        "sub": { "inner": "original" },
    };
    const nestedClone = exchange.clone (nestedOrig);

    // top-level scalar: independent
    nestedClone["top"] = "cloned";
    assert (nestedOrig["top"] === "original", "clone B: top-level scalar independence – original unchanged");
    assert (nestedClone["top"] === "cloned",  "clone B: top-level scalar independence – clone updated");

    nestedOrig["top"] = "changed_orig";
    assert (nestedClone["top"] === "cloned",  "clone B: changing original top must not affect clone");

    // -------------------------------------------------------------------------
    // --- test C: cloning an empty object ---
    const emptyClone = exchange.clone ({});
    assert (Object.keys (emptyClone).length === 0, "clone C: cloning empty object gives empty object");
    emptyClone["newKey"] = "injected";
    // confirm the operation didn't throw and the value was set
    assert (emptyClone["newKey"] === "injected", "clone C: can add key to clone of empty object");

    // -------------------------------------------------------------------------
    // --- test D: cloning an object with undefined values preserves those keys ---
    const withUndef = { "present": "yes", "absent": undefined };
    const undefClone = exchange.clone (withUndef);

    assert ("present" in undefClone,            "clone D: present key must exist in clone");
    assert (undefClone["present"] === "yes",    "clone D: present value preserved");
    assert ("absent" in undefClone,             "clone D: undefined key must still exist in clone");
    assert (undefClone["absent"] === undefined, "clone D: undefined value preserved");

    // mutate clone – original untouched
    undefClone["present"] = "no";
    assert (withUndef["present"] === "yes",     "clone D: mutating clone must not change original");

    // -------------------------------------------------------------------------
    // --- test E: multi-step: clone → mutate clone → re-clone original → compare ---
    const masterOrig = { "a": 1, "b": 2, "c": 3 };

    const clone1 = exchange.clone (masterOrig);
    clone1["a"] = 100;
    clone1["d"] = 999; // add extra key

    // original still pristine
    assert (masterOrig["a"] === 1,       "clone E: original a untouched after clone1 mutation");
    assert (!("d" in masterOrig),        "clone E: extra key must not appear in original");

    // second independent clone from the still-pristine original
    const clone2 = exchange.clone (masterOrig);
    assert (clone2["a"] === 1,           "clone E: clone2 starts from pristine original");
    assert (!("d" in clone2),            "clone E: clone2 must not inherit clone1 extra key");

    // mutate clone2 differently
    clone2["b"] = 200;
    assert (clone1["b"] === 2,           "clone E: clone1.b unaffected by clone2 mutation");
    assert (masterOrig["b"] === 2,       "clone E: original.b unaffected by clone2 mutation");
}

export default testClone;
