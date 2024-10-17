import { sha256Hash } from './uniq.js';

const TIPSequencerRegister = 'SEQUENCER:REGISTER:';

export const TIPBodyForSequencerRegister = (user_id: string, pubKey: string) => tipBody(`${TIPSequencerRegister}${user_id}${pubKey}`);

export const tipBody = (s: string) => sha256Hash(Buffer.from(s));