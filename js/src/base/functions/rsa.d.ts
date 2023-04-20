import { CHash } from '../../static_dependencies/noble-hashes/utils.js';
declare function rsa(request: string, secret: string, hash: CHash): string | false;
declare function jwt(request: {}, secret: Uint8Array, hash: CHash, isRSA?: boolean): string;
export { rsa, jwt };
