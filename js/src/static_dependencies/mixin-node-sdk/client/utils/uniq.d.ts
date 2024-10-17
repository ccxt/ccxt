/// <reference types="node" />
/** Supporting multisig for tokens & collectibles */
export declare const hashMembers: (ids: string[]) => string;
/** Generate an unique conversation id for contact */
export declare const uniqueConversationID: (userID: string, recipientID: string) => string;
export declare const newHash: (data: Buffer) => Buffer;
export declare const sha256Hash: (data: Buffer) => Buffer;
export declare const sha512Hash: (data: Buffer) => Buffer;
export declare const blake3Hash: (data: Buffer) => Buffer;
export declare const getUuid: () => string;
