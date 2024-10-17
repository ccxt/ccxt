import { validate } from './_uuid.js';
import { sha256Hash } from './uniq.js';
import serialize from './_serialize.js';
import { base64RawURLEncode } from './base64.js';
import { ed25519 } from './_noble-curves/ed25519.js';
import { AppKeystore, NetworkUserKeystore } from '../types';

export const signToken = (payload: Object, private_key: string): string => {
    const header = base64RawURLEncode(serialize({ alg: 'EdDSA', typ: 'JWT' }));
    const payloadStr = base64RawURLEncode(serialize(payload));
    const result = [header, payloadStr];
  
    const signData = ed25519.sign(Buffer.from(result.join('.')), private_key);
    const sign = base64RawURLEncode(signData);
    result.push(sign);
    return result.join('.');
};

/**
 * sign an authentication token
 * sig: sha256(method + uri + params)
 */
export const signAuthenticationToken = (methodRaw: string | undefined, uri: string, params: Object | string, requestID: string, keystore: AppKeystore | NetworkUserKeystore) => {
    if (!keystore.session_id || !validate(keystore.session_id)) return '';
  
    let method = 'GET';
    if (methodRaw) method = methodRaw.toLocaleUpperCase();
  
    let data: string = '';
    if (typeof params === 'object') {
      data = serialize(params, { unsafe: true });
    } else if (typeof params === 'string') {
      data = params;
    }
  
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 3600;
    const sha256 = sha256Hash(Buffer.from(method + uri + data)).toString('hex');
  
    const payload = {
      uid: keystore.app_id,
      sid: keystore.session_id,
      iat,
      exp,
      jti: requestID,
      sig: sha256,
      scp: 'FULL',
    };
  
    return signToken(payload, keystore.session_private_key);
  };