import { isCairo1Abi } from '../cairo.js';
import { AbiParser1 } from './parser-0-1.1.0.js';
import { AbiParser2 } from './parser-2.0.0.js';
export function createAbiParser(abi) {
    const version = getAbiVersion(abi);
    if (version === 0 || version === 1) {
        return new AbiParser1(abi);
    }
    if (version === 2) {
        return new AbiParser2(abi);
    }
    throw Error(`Unsupported ABI version ${version}`);
}
export function getAbiVersion(abi) {
    if (abi.find((it) => it.type === 'interface'))
        return 2;
    if (isCairo1Abi(abi))
        return 1;
    return 0;
}
export function isNoConstructorValid(method, argsCalldata, abiMethod) {
    // No constructor in abi and validly empty args
    return method === 'constructor' && !abiMethod && !argsCalldata.length;
}
