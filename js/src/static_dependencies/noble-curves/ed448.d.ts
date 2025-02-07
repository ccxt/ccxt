import * as htf from './abstract/hash-to-curve.js';
export declare const ed448: import("./abstract/edwards.js").CurveFn;
export declare const ed448ph: import("./abstract/edwards.js").CurveFn;
export declare const x448: import("./abstract/montgomery.js").CurveFn;
declare const hashToCurve: (msg: Uint8Array, options?: htf.htfBasicOpts) => htf.H2CPoint<bigint>, encodeToCurve: (msg: Uint8Array, options?: htf.htfBasicOpts) => htf.H2CPoint<bigint>;
export { hashToCurve, encodeToCurve };
