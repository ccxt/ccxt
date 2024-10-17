import { AppKeystore, NetworkUserKeystore } from '../types';
export declare const signToken: (payload: Object, private_key: string) => string;
/**
 * sign an authentication token
 * sig: sha256(method + uri + params)
 */
export declare const signAuthenticationToken: (methodRaw: string | undefined, uri: string, params: Object | string, requestID: string, keystore: AppKeystore | NetworkUserKeystore) => string;
