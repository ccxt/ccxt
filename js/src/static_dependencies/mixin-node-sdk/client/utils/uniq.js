import md5 from './_md5.js';
import { blake3 } from '../../../noble-hashes/blake3.js';
import { sha3_256 } from '../../../noble-hashes/sha3.js';
import { sha256 } from '../../../noble-hashes/sha256.js';
import { sha512 } from '../../../noble-hashes/sha512.js';
import { stringify as uuidStringify, v4 as uuid } from './_uuid.js';
/** Supporting multisig for tokens & collectibles */
export const hashMembers = (ids) => {
    const key = ids.sort().join('');
    return newHash(Buffer.from(key)).toString('hex');
};
/** Generate an unique conversation id for contact */
export const uniqueConversationID = (userID, recipientID) => {
    const [minId, maxId] = [userID, recipientID].sort();
    const res = md5(minId + maxId);
    const bytes = Buffer.from(res, 'hex');
    bytes[6] = (bytes[6] & 0x0f) | 0x30;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    return uuidStringify(bytes);
};
export const newHash = (data) => Buffer.from(sha3_256.create().update(data).digest());
export const sha256Hash = (data) => Buffer.from(sha256.create().update(data).digest());
export const sha512Hash = (data) => Buffer.from(sha512.create().update(data).digest());
export const blake3Hash = (data) => Buffer.from(blake3.create({}).update(data).digest());
export const getUuid = () => uuid();
