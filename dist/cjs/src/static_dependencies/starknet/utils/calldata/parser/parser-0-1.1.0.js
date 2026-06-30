'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var cairo = require('../cairo.js');

class AbiParser1 {
    constructor(abi) {
        this.abi = abi;
    }
    /**
     * abi method inputs length without '_len' inputs
     * cairo 0 reducer
     * @param abiMethod FunctionAbi
     * @returns number
     */
    methodInputsLength(abiMethod) {
        return abiMethod.inputs.reduce((acc, input) => (!cairo.isLen(input.name) ? acc + 1 : acc), 0);
    }
    /**
     * get method definition from abi
     * @param name string
     * @returns FunctionAbi | undefined
     */
    getMethod(name) {
        return this.abi.find((it) => it.name === name);
    }
    /**
     * Get Abi in legacy format
     * @returns Abi
     */
    getLegacyFormat() {
        return this.abi;
    }
}

exports.AbiParser1 = AbiParser1;
