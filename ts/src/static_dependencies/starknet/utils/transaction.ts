import { UDC } from '../constants.js';
import {
  BigNumberish,
  CairoVersion,
  Call,
  CallStruct,
  Calldata,
  ParsedStruct,
  RawArgs,
  UniversalDeployerContractPayload,
} from '../types';
import { ETransactionVersion } from '../types/api/index.js';
import { CallData } from './calldata/index.js';
import { starkCurve } from './ec.js';
import { calculateContractAddressFromHash, getSelectorFromName } from './hash/index.js';
import { toBigInt, toCairoBool } from './num.js';
import { randomAddress } from './stark.js';

/**
 * Transforms a list of Calls, each with their own calldata, into
 * two arrays: one with the entry points, and one with the concatenated calldata
 */
export const transformCallsToMulticallArrays = (calls: Call[]) => {
  const callArray: ParsedStruct[] = [];
  const calldata: BigNumberish[] = [];
  calls.forEach((call) => {
    const data = CallData.compile(call.calldata || []);
    callArray.push({
      to: toBigInt(call.contractAddress).toString(10),
      selector: toBigInt(getSelectorFromName(call.entrypoint)).toString(10),
      data_offset: calldata.length.toString(),
      data_len: data.length.toString(),
    });
    calldata.push(...data);
  });
  return {
    callArray,
    calldata: CallData.compile({ calldata }),
  };
};

/**
 * Transforms a list of calls into the Cairo 0 `__execute__` calldata.
 */
export const fromCallsToExecuteCalldata = (calls: Call[]) => {
  const { callArray, calldata } = transformCallsToMulticallArrays(calls);
  const compiledCalls = CallData.compile({ callArray });
  return [...compiledCalls, ...calldata] as Calldata;
};

/**
 * Transforms a list of calls into the Cairo 0 `__execute__` calldata including nonce.
 *
 * @deprecated
 */
export const fromCallsToExecuteCalldataWithNonce = (calls: Call[], nonce: BigNumberish) => {
  return [...fromCallsToExecuteCalldata(calls), toBigInt(nonce).toString()] as Calldata;
};

/**
 * Format Data inside Calls
 *
 * @deprecated Not required for getting execute Calldata
 */
export const transformCallsToMulticallArrays_cairo1 = (calls: Call[]) => {
  const callArray = calls.map<CallStruct>((call) => ({
    to: toBigInt(call.contractAddress).toString(10),
    selector: toBigInt(getSelectorFromName(call.entrypoint)).toString(10),
    calldata: CallData.compile(call.calldata || []),
  }));
  return callArray;
};

/**
 * Transforms a list of calls into the Cairo 1 `__execute__` calldata.
 */
export const fromCallsToExecuteCalldata_cairo1 = (calls: Call[]) => {
  // ensure property order
  const orderCalls = calls.map((call) => ({
    contractAddress: call.contractAddress,
    entrypoint: call.entrypoint,
    calldata:
      Array.isArray(call.calldata) && '__compiled__' in call.calldata
        ? call.calldata // Calldata type
        : CallData.compile(call.calldata as RawArgs), // RawArgsObject | RawArgsArray type
  }));

  return CallData.compile({ orderCalls });
};

/**
 * Create `__execute__` Calldata from Calls based on Cairo versions
 */
export const getExecuteCalldata = (calls: Call[], cairoVersion: CairoVersion = '0') => {
  if (cairoVersion === '1') {
    return fromCallsToExecuteCalldata_cairo1(calls);
  }
  return fromCallsToExecuteCalldata(calls);
};

/**
 * Builds a UDCCall object.
 *
 * @param {UniversalDeployerContractPayload | UniversalDeployerContractPayload[]} payload - The payload data for the UDCCall. Can be a single payload object or an array of payload objects
 *.
 * @param {string} address - The address to be used in the UDCCall.
 * @returns {{ calls: Array, addresses: Array }} - The UDCCall object containing an array of calls and an array of addresses.
 */
export function buildUDCCall(
  payload: UniversalDeployerContractPayload | UniversalDeployerContractPayload[],
  address: string
) {
  const params = [].concat(payload as []).map((it) => {
    const {
      classHash,
      salt,
      unique = true,
      constructorCalldata = [],
    } = it as UniversalDeployerContractPayload;

    const compiledConstructorCallData = CallData.compile(constructorCalldata);
    const deploySalt = salt ?? randomAddress();

    return {
      call: {
        contractAddress: UDC.ADDRESS,
        entrypoint: UDC.ENTRYPOINT,
        calldata: [
          classHash,
          deploySalt,
          toCairoBool(unique),
          compiledConstructorCallData.length,
          ...compiledConstructorCallData,
        ],
      },
      address: calculateContractAddressFromHash(
        unique ? starkCurve.pedersen(address, deploySalt) : deploySalt,
        classHash,
        compiledConstructorCallData,
        unique ? UDC.ADDRESS : 0
      ),
    };
  });

  return {
    calls: params.map((it) => it.call),
    addresses: params.map((it) => it.address),
  };
}

/**
 * Return transaction versions based on version type, default version type is 'transaction'
 */
export function getVersionsByType(versionType?: 'fee' | 'transaction') {
  return versionType === 'fee'
    ? {
        v1: ETransactionVersion.F1,
        v2: ETransactionVersion.F2,
        v3: ETransactionVersion.F3,
      }
    : { v1: ETransactionVersion.V1, v2: ETransactionVersion.V2, v3: ETransactionVersion.V3 };
}
