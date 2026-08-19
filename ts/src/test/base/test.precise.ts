


import assert from 'assert';
import Precise from '../../base/Precise.js';


function testPrecise () {

    const w = '-1.123e-6';
    const x = '0.00000002';
    const y = '69696900000';
    const z = '0';
    const a = '1e8';

    assert (Precise.stringMul (x, y) === '1393.938');
    assert (Precise.stringMul (y, x) === '1393.938');
    assert (Precise.stringAdd (x, y) === '69696900000.00000002');
    assert (Precise.stringAdd (y, x) === '69696900000.00000002');
    assert (Precise.stringSub (x, y) === '-69696899999.99999998');
    assert (Precise.stringSub (y, x) === '69696899999.99999998');
    assert (Precise.stringDiv (x, y, 1) === '0');
    assert (Precise.stringDiv (x, y) === '0');
    assert (Precise.stringDiv (x, y, 19) === '0.0000000000000000002');
    assert (Precise.stringDiv (x, y, 20) === '0.00000000000000000028');
    assert (Precise.stringDiv (x, y, 21) === '0.000000000000000000286');
    assert (Precise.stringDiv (x, y, 22) === '0.0000000000000000002869');
    assert (Precise.stringDiv (y, x) === '3484845000000000000');

    assert (Precise.stringMul (x, w) === '-0.00000000000002246');
    assert (Precise.stringMul (w, x) === '-0.00000000000002246');
    assert (Precise.stringAdd (x, w) === '-0.000001103');
    assert (Precise.stringAdd (w, x) === '-0.000001103');
    assert (Precise.stringSub (x, w) === '0.000001143');
    assert (Precise.stringSub (w, x) === '-0.000001143');
    assert (Precise.stringDiv (x, w) === '-0.017809439002671415');
    assert (Precise.stringDiv (w, x) === '-56.15');

    assert (Precise.stringMul (z, w) === '0');
    assert (Precise.stringMul (z, x) === '0');
    assert (Precise.stringMul (z, y) === '0');
    assert (Precise.stringMul (w, z) === '0');
    assert (Precise.stringMul (x, z) === '0');
    assert (Precise.stringMul (y, z) === '0');
    assert (Precise.stringAdd (z, w) === '-0.000001123');
    assert (Precise.stringAdd (z, x) === '0.00000002');
    assert (Precise.stringAdd (z, y) === '69696900000');
    assert (Precise.stringAdd (w, z) === '-0.000001123');
    assert (Precise.stringAdd (x, z) === '0.00000002');
    assert (Precise.stringAdd (y, z) === '69696900000');

    assert (Precise.stringMul (x, a) === '2');
    assert (Precise.stringMul (a, x) === '2');
    assert (Precise.stringMul (y, a) === '6969690000000000000');
    assert (Precise.stringMul (a, y) === '6969690000000000000');
    assert (Precise.stringDiv (y, a) === '696.969');
    assert (Precise.stringDiv (y, a, -1) === '690');
    assert (Precise.stringDiv (y, a, 0) === '696');
    assert (Precise.stringDiv (y, a, 1) === '696.9');
    assert (Precise.stringDiv (y, a, 2) === '696.96');
    assert (Precise.stringDiv (a, y) === '0.001434784043479695');

    assert (Precise.stringAbs ('0') === '0');
    assert (Precise.stringAbs ('-0') === '0');
    assert (Precise.stringAbs ('-500.1') === '500.1');
    assert (Precise.stringAbs ('213') === '213');

    assert (Precise.stringNeg ('0') === '0');
    assert (Precise.stringNeg ('-0') === '0');
    assert (Precise.stringNeg ('-500.1') === '500.1');
    assert (Precise.stringNeg ('213') === '-213');

    assert (Precise.stringMod ('57.123', '10') === '7.123');
    assert (Precise.stringMod ('18', '6') === '0');
    assert (Precise.stringMod ('10.1', '0.5') === '0.1');
    assert (Precise.stringMod ('10000000', '5555') === '1000');
    assert (Precise.stringMod ('5550', '120') === '30');

    assert (Precise.stringEquals ('1.0000', '1'));
    assert (Precise.stringEquals ('-0.0', '0'));
    assert (Precise.stringEquals ('-0.0', '0.0'));
    assert (Precise.stringEquals ('5.534000', '5.5340'));

    assert (Precise.stringMin ('1.0000', '2') === '1');
    assert (Precise.stringMin ('2', '1.2345') === '1.2345');
    assert (Precise.stringMin ('3.1415', '-2') === '-2');
    assert (Precise.stringMin ('-3.1415', '-2') === '-3.1415');
    assert (Precise.stringMin ('0.000', '-0.0') === '0');

    assert (Precise.stringMax ('1.0000', '2') === '2');
    assert (Precise.stringMax ('2', '1.2345') === '2');
    assert (Precise.stringMax ('3.1415', '-2') === '3.1415');
    assert (Precise.stringMax ('-3.1415', '-2') === '-2');
    assert (Precise.stringMax ('0.000', '-0.0') === '0');

    assert (!Precise.stringGt ('1.0000', '2'));
    assert (Precise.stringGt ('2', '1.2345'));
    assert (Precise.stringGt ('3.1415', '-2'));
    assert (!Precise.stringGt ('-3.1415', '-2'));
    assert (!Precise.stringGt ('3.1415', '3.1415'));
    assert (Precise.stringGt ('3.14150000000000000000001', '3.1415'));

    assert (!Precise.stringGe ('1.0000', '2'));
    assert (Precise.stringGe ('2', '1.2345'));
    assert (Precise.stringGe ('3.1415', '-2'));
    assert (!Precise.stringGe ('-3.1415', '-2'));
    assert (Precise.stringGe ('3.1415', '3.1415'));
    assert (Precise.stringGe ('3.14150000000000000000001', '3.1415'));

    assert (Precise.stringLt ('1.0000', '2'));
    assert (!Precise.stringLt ('2', '1.2345'));
    assert (!Precise.stringLt ('3.1415', '-2'));
    assert (Precise.stringLt ('-3.1415', '-2'));
    assert (!Precise.stringLt ('3.1415', '3.1415'));
    assert (Precise.stringLt ('3.1415', '3.14150000000000000000001'));

    assert (Precise.stringLe ('1.0000', '2'));
    assert (!Precise.stringLe ('2', '1.2345'));
    assert (!Precise.stringLe ('3.1415', '-2'));
    assert (Precise.stringLe ('-3.1415', '-2'));
    assert (Precise.stringLe ('3.1415', '3.1415'));
    assert (Precise.stringLe ('3.1415', '3.14150000000000000000001'));

    assert (Precise.stringOr ('5', '3') === '7');
    assert (Precise.stringOr ('10', '5') === '15');  // 1010 | 0101 = 1111 = 15
    assert (Precise.stringOr ('0', '0') === '0');
    assert (Precise.stringOr ('7', '0') === '7');

    // with undefined arguments
    assert (Precise.stringMul (undefined, '1') === undefined);
    assert (Precise.stringMul ('1', undefined) === undefined);
    assert (Precise.stringMul (undefined, undefined) === undefined);

    assert (Precise.stringDiv (undefined, '1') === undefined);
    assert (Precise.stringDiv ('1', undefined) === undefined);
    assert (Precise.stringDiv (undefined, undefined) === undefined);

    assert (Precise.stringAdd (undefined, '1') === undefined);
    assert (Precise.stringAdd ('1', undefined) === undefined);
    assert (Precise.stringAdd (undefined, undefined) === undefined);

    assert (Precise.stringSub (undefined, '1') === undefined);
    assert (Precise.stringSub ('1', undefined) === undefined);
    assert (Precise.stringSub (undefined, undefined) === undefined);

    assert (Precise.stringAbs (undefined) === undefined);
    assert (Precise.stringNeg (undefined) === undefined);

    assert (Precise.stringMod (undefined, '1') === undefined);
    assert (Precise.stringMod ('1', undefined) === undefined);
    assert (Precise.stringMod (undefined, undefined) === undefined);

    assert (Precise.stringOr (undefined, '1') === undefined);
    assert (Precise.stringOr ('1', undefined) === undefined);
    assert (Precise.stringOr (undefined, undefined) === undefined);

    assert (Precise.stringMin (undefined, '1') === undefined);
    assert (Precise.stringMin ('1', undefined) === undefined);
    assert (Precise.stringMin (undefined, undefined) === undefined);

    assert (Precise.stringMax (undefined, '1') === undefined);
    assert (Precise.stringMax ('1', undefined) === undefined);
    assert (Precise.stringMax (undefined, undefined) === undefined);

    // bool false

    assert (Precise.stringEquals (undefined, '1') === false);
    assert (Precise.stringEquals ('1', undefined) === false);
    assert (Precise.stringEquals (undefined, undefined) === false);

    assert (Precise.stringEq (undefined, '1') === false);
    assert (Precise.stringEq ('1', undefined) === false);
    assert (Precise.stringEq (undefined, undefined) === false);

    assert (Precise.stringGt (undefined, '1') === false);
    assert (Precise.stringGt ('1', undefined) === false);
    assert (Precise.stringGt (undefined, undefined) === false);

    assert (Precise.stringGe (undefined, '1') === false);
    assert (Precise.stringGe ('1', undefined) === false);
    assert (Precise.stringGe (undefined, undefined) === false);

    assert (Precise.stringLt (undefined, '1') === false);
    assert (Precise.stringLt ('1', undefined) === false);
    assert (Precise.stringLt (undefined, undefined) === false);

    assert (Precise.stringLe (undefined, '1') === false);
    assert (Precise.stringLe ('1', undefined) === false);
    assert (Precise.stringLe (undefined, undefined) === false);

    // scientific notation parsing (lowercase / uppercase / signed exponents)
    assert (Precise.stringAdd ('1E8', '0') === '100000000');
    assert (Precise.stringAdd ('1e+8', '0') === '100000000');
    assert (Precise.stringAdd ('-1.123E-6', '0') === '-0.000001123');
    assert (Precise.stringAdd ('1.5e3', '0') === '1500');
    assert (Precise.stringAdd ('2.5E-3', '0') === '0.0025');
    assert (Precise.stringMul ('1E8', '1e-8') === '1');
    assert (Precise.stringEquals ('1e2', '100'));
    assert (Precise.stringEquals ('1E2', '100.00'));

    // integers without a decimal point (constructor fast path)
    assert (Precise.stringAdd ('123', '877') === '1000');
    assert (Precise.stringSub ('-5', '-5') === '0');
    assert (Precise.stringMul ('-7', '8') === '-56');

    // negative-decimals toString path (trailing zero expansion)
    assert (Precise.stringMul ('1e5', '1e5') === '10000000000');
    assert (Precise.stringDiv ('69696900000', '1e8', -1) === '690');
    assert (Precise.stringDiv ('1000', '1', -2) === '1000');

    // subtraction with unequal decimals in both directions
    assert (Precise.stringSub ('1.0001', '1') === '0.0001');
    assert (Precise.stringSub ('1', '1.0001') === '-0.0001');
    assert (Precise.stringSub ('0.00000002', '0.000000020') === '0');

    // division edge cases
    assert (Precise.stringDiv ('1', '0') === undefined); // division by zero
    assert (Precise.stringDiv ('0', '5') === '0');
    assert (Precise.stringDiv ('1', '3', 5) === '0.33333');
    assert (Precise.stringDiv ('-1', '3', 5) === '-0.33333');
    // very high precision (exercises exponents beyond typical cached powers)
    const oneThird = Precise.stringDiv ('1', '3', 600);
    assert (Precise.stringEquals (oneThird, Precise.stringDiv ('10', '30', 600)));
    assert (Precise.stringGt ('0.34', oneThird));
    assert (Precise.stringGt (oneThird, '0.333333333333333333'));

    // mod with mixed decimals and negatives
    assert (Precise.stringMod ('10.1', '3') === '1.1');
    assert (Precise.stringMod ('0.7', '0.2') === '0.1');
    assert (Precise.stringMod ('-5', '3') === '-2');

    // comparisons across different decimal counts
    assert (Precise.stringGt ('1.10', '1.1') === false);
    assert (Precise.stringGe ('1.10', '1.1') === true);
    assert (Precise.stringLt ('0.999999999999999999999', '1'));
    assert (Precise.stringGt ('1.000000000000000000001', '1'));
    assert (Precise.stringGt ('0', '-0.000000000000000001'));
    assert (Precise.stringLt ('-1e-18', '0'));
    assert (Precise.stringGe ('-0', '0'));
    assert (Precise.stringLe ('-0', '0'));

    // min/max tie-breaking and mixed decimals
    assert (Precise.stringMin ('1.0', '1.00') === '1');
    assert (Precise.stringMax ('1.0', '1.00') === '1');
    assert (Precise.stringMin ('-1e-8', '-1e-7') === '-0.0000001');
    assert (Precise.stringMax ('-1e-8', '-1e-7') === '-0.00000001');

    // equals / reduce edge cases
    assert (Precise.stringEquals ('0.000', '0'));
    assert (Precise.stringEquals ('100', '1e2'));
    assert (Precise.stringEquals ('-100.000', '-1e2'));
    assert (!Precise.stringEquals ('100', '100.1'));
    assert (Precise.stringAdd ('0.10', '0.10') === '0.2'); // trailing zeros reduced

    // large number round-trips
    assert (Precise.stringAdd ('123456789012345678901234567890.123456789', '0') === '123456789012345678901234567890.123456789');
    assert (Precise.stringMul ('123456789012345678901234567890', '1') === '123456789012345678901234567890');
    assert (Precise.stringSub ('123456789012345678901234567890.1', '0.1') === '123456789012345678901234567890');

    // abs/neg on scientific notation inputs
    assert (Precise.stringAbs ('-1.123e-6') === '0.000001123');
    assert (Precise.stringNeg ('1e-3') === '-0.001');
}

export default testPrecise;
