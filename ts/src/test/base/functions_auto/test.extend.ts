// @ts-nocheck

import assert from 'assert';

function testBaseFunctionsExtend (exchange: any) {
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
            "a": 1,
            "b": [ 1, 2 ],
            "c": [ { "test1": 2, "test3": 3 } ],
            "d": "not_undefined",
            "e": undefined,
            "other2": "y",
        },
        "other2": "y",
    };

    // extend
    const extended = exchange.extend (obj1, obj2);
    checkExtended (extended);
    assert ("sub" in extended);
    // deepExtend
    const deepExtended = exchange.deepExtend (obj1, obj2);
    checkExtended (extended);
    assert ("sub" in extended);
    checkExtended (deepExtended["sub"]);
}

function checkExtended (extended: any) {
    assert (extended["a"] === 2);
    assert (extended["b"][0] === 3);
    assert (extended["b"][1] === 4);
    assert (extended["c"][0]["test1"] === 2);
    assert (extended["c"][0]["test2"] === 1);
    assert (extended["c"][0]["test3"] === 3);
    assert (extended["d"] === "not_undefined");
    assert (extended["e"] === undefined);
    assert (extended["other1"] === "x");
    assert (extended["other2"] === "y");
}

export default testBasePartExtend;