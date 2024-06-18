import { ContractClassResponse } from '../types';
import {
  CairoContract,
  CompiledSierra,
  LegacyCompiledContract,
  LegacyContractClass,
  SierraContractClass,
} from '../types/lib/contract/index';
import { CompleteDeclareContractPayload, DeclareContractPayload } from '../types/lib/index';
import { computeCompiledClassHash, computeContractClassHash } from './hash/index.js';
import { parse } from './json.js';
import { decompressProgram } from './stark';

import { isString } from './shortString.js';

/**
 * Checks if a given contract is in Sierra (Safe Intermediate Representation) format.
 *
 * @param {CairoContract | string} contract - The contract to check. Can be either a CairoContract object or a string representation of the contract.
 * @return {boolean} - Returns true if the contract is a Sierra contract, otherwise false.
 */
export function isSierra(
  contract: CairoContract | string
): contract is SierraContractClass | CompiledSierra {
  const compiledContract = isString(contract) ? parse(contract) : contract;
  return 'sierra_program' in compiledContract;
}

/**
 * Extracts contract hashes from `DeclareContractPayload`.
 *
 * @param {DeclareContractPayload} payload - The payload containing contract information.
 *
 * @return {CompleteDeclareContractPayload} - The `CompleteDeclareContractPayload` with extracted contract hashes.
 *
 * @throws {Error} - If extraction of compiledClassHash or classHash fails.
 */
export function extractContractHashes(
  payload: DeclareContractPayload
): CompleteDeclareContractPayload {
  const response = { ...payload } as CompleteDeclareContractPayload;

  if (isSierra(payload.contract)) {
    if (!payload.compiledClassHash && payload.casm) {
      response.compiledClassHash = computeCompiledClassHash(payload.casm);
    }
    if (!response.compiledClassHash)
      throw new Error(
        'Extract compiledClassHash failed, provide (CairoAssembly).casm file or compiledClassHash'
      );
  }

  response.classHash = payload.classHash ?? computeContractClassHash(payload.contract);
  if (!response.classHash)
    throw new Error('Extract classHash failed, provide (CompiledContract).json file or classHash');

  return response;
}

/**
 * Helper to redeclare response Cairo0 contract
 */
export function contractClassResponseToLegacyCompiledContract(ccr: ContractClassResponse) {
  if (isSierra(ccr)) {
    throw Error('ContractClassResponse need to be LegacyContractClass (cairo0 response class)');
  }
  const contract = ccr as LegacyContractClass;
  return { ...contract, program: decompressProgram(contract.program) } as LegacyCompiledContract;
}
