'use strict';

require('./errors.js');
require('./maths.js');

// ----------------------------------------------------------------------------
BigInt(-1);
BigInt(0);
BigInt(1);
BigInt(5);
// Constant to pull zeros from for multipliers
let Zeros = "0000";
while (Zeros.length < 80) {
    Zeros += Zeros;
}
//const f1 = FixedNumber.fromString("12.56", "fixed16x2");
//const f2 = FixedNumber.fromString("0.3", "fixed16x2");
//console.log(f1.divSignal(f2));
//const BUMP = FixedNumber.from("0.5");
