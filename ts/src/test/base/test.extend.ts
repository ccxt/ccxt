


import assert from 'assert';
import ccxt from '../../../ccxt.js';

function testExtend () {

    const exchange = new ccxt.Exchange ({
        'id': 'regirock',
    });

    const obj1 = {
        "a": 1,
        "b": [ 1, 2 ],
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

    // snapshot originals for mutation checks
    const obj1SnapshotA = obj1["a"];
    const obj1SnapshotB0 = obj1["b"][0];
    const obj1SnapshotOther1 = obj1["other1"];
    const obj2SnapshotA = obj2["a"];
    const obj2SnapshotB0 = obj2["b"][0];
    const obj2SnapshotOther2 = obj2["other2"];

    // --- test 1: basic extend ---
    const extended = exchange.extend (obj1, obj2);
    tbfeCheckExtended (extended, true);

    // --- mutation check: obj1 must NOT be mutated ---
    assert (obj1["a"] === obj1SnapshotA, "obj1.a was mutated after extend");
    assert (obj1["b"][0] === obj1SnapshotB0, "obj1.b[0] was mutated after extend");
    assert (obj1["other1"] === obj1SnapshotOther1, "obj1['other1'] was mutated after extend");

    // --- mutation check: obj2 must NOT be mutated ---
    assert (obj2["a"] === obj2SnapshotA, "obj2.a was mutated after extend");
    assert (obj2["b"][0] === obj2SnapshotB0, "obj2.b[0] was mutated after extend");
    assert (obj2["other2"] === obj2SnapshotOther2, "obj2['other2'] was mutated after extend");

    // --- test 2: multi-step extend – apply a third patch on top of the first result ---
    const obj3 = {
        "a": 3,
        "b": [ 5, 6 ],
        "c": [ { "test1": 3, "test4": 4 } ],
        "d": "step3",
        "e": "back_to_string",
        "other3": "z",
    };

    const extended2 = exchange.extend (extended, obj3);

    assert (extended2["a"] === 3,                       "step2: a");
    assert (extended2["b"][0] === 5,                    "step2: b[0]");
    assert (extended2["b"][1] === 6,                    "step2: b[1]");
    assert (extended2["c"][0]["test1"] === 3,           "step2: c[0].test1");
    assert (!("test2" in extended2["c"][0]),             "step2: c[0] should not have test2");
    assert (!("test3" in extended2["c"][0]),             "step2: c[0] should not have test3");
    assert (extended2["c"][0]["test4"] === 4,            "step2: c[0].test4");
    assert (extended2["d"] === "step3",                  "step2: d");
    assert (extended2["e"] === "back_to_string",         "step2: e");
    assert (extended2["other1"] === "x",                 "step2: extended2['other1'] preserved");
    assert (extended2["other2"] === "y",                 "step2: extended2['other2'] preserved");
    assert (extended2["other3"] === "z",                 "step2: extended2['other3'] added");

    // --- mutation check: first result must NOT be mutated by second extend ---
    assert (extended["a"] === 2,            "extended['a'] was mutated by second extend");
    assert (extended["b"][0] === 3,         "extended['b'][0] was mutated by second extend");
    assert (!("other3" in extended),           "extended['other3'] should not exist after second extend");

    // --- test 3: four-step chained extend on same base object ---
    const base = { "x": 0, "keep": "yes" };
    const patch1 = { "x": 1, "p1": true };
    const patch2 = { "x": 2, "p2": true };
    const patch3 = { "x": 3, "p3": true };

    const r1 = exchange.extend (base, patch1);
    const r2 = exchange.extend (r1, patch2);
    const r3 = exchange.extend (r2, patch3);

    assert (r3["x"] === 3,          "chain: r3['x'] should be 3 after 3 patches");
    assert (r3["keep"] === "yes",   "chain: r3['keep'] should be preserved");
    assert (r3["p1"] === true,      "chain: r3['p1'] should be present");
    assert (r3["p2"] === true,      "chain: r3['p2'] should be present");
    assert (r3["p3"] === true,      "chain: r3['p3'] should be present");

    // --- mutation check: each intermediate must be unaffected ---
    assert (base["x"] === 0,    "base['x'] was mutated during chain");
    assert (r1["x"] === 1,      "r1['x'] was mutated during chain");
    assert (r2["x"] === 2,      "r2['x'] was mutated during chain");
    assert (!("p3" in r1),      "r1['p3'] leaked into r1");
    assert (!("p2" in base),    "base['p2'] leaked into base");

    // --- test 4: extend with undefined values does NOT overwrite existing keys ---
    const withValues  = { "keep1": "A", "keep2": "B" };
    const withUndefs  = { "keep1": undefined, "keep2": undefined, "newKey": "C" };

    const extUndef = exchange.extend (withValues, withUndefs);

    // extend() merges ALL keys (including undefined ones), so undefined wins over previous value
    assert (extUndef["keep1"] === undefined,  "extend: extUndef['keep1'] should be undefined");
    assert (extUndef["keep2"] === undefined,  "extend: extUndef['keep2'] should be undefined");
    assert (extUndef["newKey"] === "C",       "extend: extUndef['newKey'] should be added");
    // original must not be touched
    assert (withValues["keep1"] === "A",      "withValues['keep1'] was mutated");
    assert (withValues["keep2"] === "B",      "withValues['keep2'] was mutated");
}

function tbfeCheckExtended (extended: any, hasSub: boolean) {
    assert (extended["a"] === 2);
    assert (extended["b"][0] === 3);
    assert (extended["b"][1] === 4);
    assert (extended["c"][0]["test1"] === 2);
    assert (!("test2" in extended["c"][0]));
    assert (extended["c"][0]["test3"] === 3);
    assert (extended["d"] === "not_undefined");
    assert (extended["e"] === undefined);
    assert (extended["other1"] === "x");
    assert (extended["other2"] === "y");
    if (hasSub) {
        assert ("sub" in extended);
    }
}

export default testExtend;
