import { BigNumberish } from '../types/index.js';
export declare class MerkleTree {
    leaves: string[];
    branches: string[][];
    root: string;
    hashMethod: (a: BigNumberish, b: BigNumberish) => string;
    constructor(leafHashes: string[], hashMethod?: (a: BigNumberish, b: BigNumberish) => string);
    /**
     * Create Merkle tree
     * @param leaves hex-string array
     * @returns format: hex-string; Merkle tree root
     */
    private build;
    /**
     * Create hash from ordered a and b, Pedersen hash default
     * @returns format: hex-string
     */
    static hash(a: BigNumberish, b: BigNumberish, hashMethod?: (a: BigNumberish, b: BigNumberish) => string): string;
    /**
     * Return path to leaf
     * @param leaf hex-string
     * @param branch hex-string array
     * @param hashPath hex-string array
     * @returns format: hex-string array
     */
    getProof(leaf: string, branch?: string[], hashPath?: string[]): string[];
}
/**
 * Test Merkle tree path
 * @param root hex-string
 * @param leaf hex-string
 * @param path hex-string array
 * @param hashMethod hash method override, Pedersen default
 */
export declare function proofMerklePath(root: string, leaf: string, path: string[], hashMethod?: (a: BigNumberish, b: BigNumberish) => string): boolean;
