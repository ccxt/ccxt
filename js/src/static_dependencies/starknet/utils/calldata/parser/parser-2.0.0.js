export class AbiParser2 {
    constructor(abi) {
        this.abi = abi;
    }
    /**
     * abi method inputs length
     * @param abiMethod FunctionAbi
     * @returns number
     */
    methodInputsLength(abiMethod) {
        return abiMethod.inputs.length;
    }
    /**
     * get method definition from abi
     * @param name string
     * @returns FunctionAbi | undefined
     */
    getMethod(name) {
        const intf = this.abi.find((it) => it.type === 'interface');
        return intf.items.find((it) => it.name === name);
    }
    /**
     * Get Abi in legacy format
     * @returns Abi
     */
    getLegacyFormat() {
        return this.abi.flatMap((e) => {
            if (e.type === 'interface') {
                return e.items;
            }
            return e;
        });
    }
}
