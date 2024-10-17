import { sha256Hash } from './uniq.js';
const TIPSequencerRegister = 'SEQUENCER:REGISTER:';
export const TIPBodyForSequencerRegister = (user_id, pubKey) => tipBody(`${TIPSequencerRegister}${user_id}${pubKey}`);
export const tipBody = (s) => sha256Hash(Buffer.from(s));
