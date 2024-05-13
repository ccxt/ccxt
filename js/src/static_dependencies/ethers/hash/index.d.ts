/**
 *  Utilities for common tasks involving hashing. Also see
 *  [cryptographic hashing](about-crypto-hashing).
 *
 *  @_section: api/hashing:Hashing Utilities  [about-hashing]
 */
export { id } from "../utils/index.js";
export { solidityPacked, solidityPackedKeccak256, solidityPackedSha256 } from "./solidity.js";
export { TypedDataEncoder } from "./typed-data.js";
export type { TypedDataDomain, TypedDataField } from "./typed-data.js";
