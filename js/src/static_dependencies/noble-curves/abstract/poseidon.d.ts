/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
import { Field } from './modular.js';
export declare type PoseidonOpts = {
    Fp: Field<bigint>;
    t: number;
    roundsFull: number;
    roundsPartial: number;
    sboxPower?: number;
    reversePartialPowIdx?: boolean;
    mds: bigint[][];
    roundConstants: bigint[][];
};
export declare function validateOpts(opts: PoseidonOpts): Readonly<{
    rounds: number;
    sboxFn: (n: bigint) => bigint;
    roundConstants: bigint[][];
    mds: bigint[][];
    Fp: Field<bigint>;
    t: number;
    roundsFull: number;
    roundsPartial: number;
    sboxPower?: number | undefined;
    reversePartialPowIdx?: boolean | undefined;
}>;
export declare function splitConstants(rc: bigint[], t: number): never[];
export declare function poseidon(opts: PoseidonOpts): {
    (values: bigint[]): bigint[];
    roundConstants: bigint[][];
};
