import { CHash } from '../../static_dependencies/noble-hashes/utils.js';
import { Dictionary } from "../types.js";
declare function rsa(request: string, secret: string, hash: CHash): string;
declare function jwt(request: Dictionary<any>, secret: Uint8Array, hash: CHash, isRSA?: boolean, opts?: Dictionary<any>): string;
export { rsa, jwt };
