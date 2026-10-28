/*  ------------------------------------------------------------------------ */

import crypto from 'node:crypto';
import { base64 } from "@scure/base";

/*  ------------------------------------------------------------------------ */


function decryptPrivateKey (encryptionPrivKey: string, encryptionSecret: string) {
    return crypto.privateDecrypt ({ 'key': encryptionPrivKey, 'padding': crypto.constants.RSA_PKCS1_PADDING }, base64.decode (encryptionSecret)); // this.base64ToBinary 
}


/*  ------------------------------------------------------------------------ */

export {
    decryptPrivateKey,
};

/*  ------------------------------------------------------------------------ */
