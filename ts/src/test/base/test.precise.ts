
// AUTO_TRANSPILE_ENABLED

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
}

export default testPrecise;
