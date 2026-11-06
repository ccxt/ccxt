/*  ------------------------------------------------------------------------ */

import crypto from 'crypto';
import { base64 } from "@scure/base";

/*  ------------------------------------------------------------------------ */


function decryptPrivateKey (encryptionPrivKey: string, encryptionSecret: string) {
    if (crypto === undefined || crypto.createSign === undefined) {
        throw new Error ('decryptPrivateKey is currently not supported in the browser');
    }
    return crypto.privateDecrypt ({ 'key': encryptionPrivKey, 'padding': crypto.constants.RSA_PKCS1_PADDING }, base64.decode (encryptionSecret)); // this.base64ToBinary 
}


/*  ------------------------------------------------------------------------ */

export {
    decryptPrivateKey,
};

/*  ------------------------------------------------------------------------ */
