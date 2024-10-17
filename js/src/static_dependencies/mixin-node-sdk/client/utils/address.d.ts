/// <reference types="node" />
import type { MixAddress } from '../types';
export declare const MainAddressPrefix = "XIN";
export declare const MixAddressPrefix = "MIX";
export declare const MixAddressVersion = 2;
export declare const getPublicFromMainnetAddress: (address: string) => Buffer;
export declare const getMainnetAddressFromPublic: (pubKey: Buffer) => string;
export declare const parseMixAddress: (address: string) => MixAddress | undefined;
export declare const buildMixAddress: (ma: MixAddress) => string;
