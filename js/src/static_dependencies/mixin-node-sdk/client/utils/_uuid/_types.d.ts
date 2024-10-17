export declare type UUIDTypes = string | Uint8Array;
export declare type Version1Options = {
    node?: Uint8Array;
    clockseq?: number;
    random?: Uint8Array;
    rng?: () => Uint8Array;
    msecs?: number;
    nsecs?: number;
    _v6?: boolean;
};
export declare type Version4Options = {
    random?: Uint8Array;
    rng?: () => Uint8Array;
};
export declare type Version6Options = Version1Options;
export declare type Version7Options = {
    random?: Uint8Array;
    msecs?: number;
    seq?: number;
    rng?: () => Uint8Array;
};
