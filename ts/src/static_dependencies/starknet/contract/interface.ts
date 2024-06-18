import type { Abi as AbiKanabi, TypedContract as AbiWanTypedContract } from 'abi-wan-kanabi';

import { AccountInterface } from '../account';
import { ProviderInterface } from '../provider';
import {
  Abi,
  ArgsOrCalldata,
  AsyncContractFunction,
  BigNumberish,
  BlockIdentifier,
  CallOptions,
  Calldata,
  ContractFunction,
  ContractVersion,
  EstimateFeeResponse,
  Invocation,
  InvokeFunctionResponse,
  InvokeOptions,
  ParsedEvents,
  RawArgs,
  Result,
  Uint256,
} from '../types';
import { CairoCustomEnum } from '../utils/calldata/enum/CairoCustomEnum.js';
import { CairoOption } from '../utils/calldata/enum/CairoOption';
import { CairoResult } from '../utils/calldata/enum/CairoResult';
import type { GetTransactionReceiptResponse } from '../utils/transactionReceipt';

declare module 'abi-wan-kanabi' {
  export interface Config<OptionT = any, ResultT = any, ErrorT = any> {
    FeltType: BigNumberish;
    U256Type: number | bigint | Uint256;
    U512Type: BigNumberish;
    Secp256k1PointType: BigNumberish;
    Option: CairoOption<OptionT>;
    Tuple: Record<number, BigNumberish | object | boolean>;
    Result: CairoResult<ResultT, ErrorT>;
    Enum: CairoCustomEnum;
    Calldata: RawArgs | Calldata;
    CallOptions: CallOptions;
    InvokeOptions: InvokeOptions;
    InvokeFunctionResponse: InvokeFunctionResponse;
  }
}

type TypedContractV2<TAbi extends AbiKanabi> = AbiWanTypedContract<TAbi> & ContractInterface;

export abstract class ContractInterface {
  public abstract abi: Abi;

  public abstract address: string;

  public abstract providerOrAccount: ProviderInterface | AccountInterface;

  public abstract deployTransactionHash?: string;

  readonly functions!: { [name: string]: AsyncContractFunction };

  readonly callStatic!: { [name: string]: AsyncContractFunction };

  readonly populateTransaction!: { [name: string]: ContractFunction };

  readonly estimateFee!: { [name: string]: ContractFunction };

  readonly [key: string]: AsyncContractFunction | any;

  /**
   * Saves the address of the contract deployed on network that will be used for interaction
   *
   * @param address - address of the contract
   */
  public abstract attach(address: string): void;

  /**
   * Attaches to new Provider or Account
   *
   * @param providerOrAccount - new Provider or Account to attach to
   */
  public abstract connect(providerOrAccount: ProviderInterface | AccountInterface): void;

  /**
   * Resolves when contract is deployed on the network or when no deployment transaction is found
   *
   * @returns Promise that resolves when contract is deployed on the network or when no deployment transaction is found
   * @throws When deployment fails
   */
  public abstract deployed(): Promise<ContractInterface>;

  /**
   * Calls a method on a contract
   *
   * @param method name of the method
   * @param args Array of the arguments for the call
   * @param options optional blockIdentifier
   * @returns Result of the call as an array with key value pars
   */
  public abstract call(
    method: string,
    args?: ArgsOrCalldata,
    options?: CallOptions
  ): Promise<Result>;

  /**
   * Invokes a method on a contract
   *
   * @param method name of the method
   * @param args Array of the arguments for the invoke or Calldata
   * @param options
   * @returns Add Transaction Response
   */
  public abstract invoke(
    method: string,
    args?: ArgsOrCalldata,
    options?: InvokeOptions
  ): Promise<InvokeFunctionResponse>;

  /**
   * Estimates a method on a contract
   *
   * @param method name of the method
   * @param args Array of the arguments for the call or Calldata
   * @param options optional blockIdentifier
   */
  public abstract estimate(
    method: string,
    args?: ArgsOrCalldata,
    options?: {
      blockIdentifier?: BlockIdentifier;
    }
  ): Promise<EstimateFeeResponse>;

  /**
   * Calls a method on a contract
   *
   * @param method name of the method
   * @param args Array of the arguments for the call or Calldata
   * @returns Invocation object
   */
  public abstract populate(method: string, args?: ArgsOrCalldata): Invocation;

  /**
   * Parse contract events of a GetTransactionReceiptResponse received from waitForTransaction. Based on contract's abi
   *
   * @param receipt transaction receipt
   * @returns Events parsed
   */
  public abstract parseEvents(receipt: GetTransactionReceiptResponse): ParsedEvents;

  /**
   * tells if the contract comes from a Cairo 1 contract
   *
   * @returns TRUE if the contract comes from a Cairo1 contract
   * @example
   * ```typescript
   * const isCairo1: boolean = myContract.isCairo1();
   * ```
   */
  public abstract isCairo1(): boolean;

  /**
   * Retrieves the version of the contract (cairo version & compiler version)
   */
  public abstract getVersion(): Promise<ContractVersion>;

  /**
   * Returns a typed instance of ContractV2 based on the supplied ABI.
   *
   * @param {TAbi} tAbi - The ABI (Abstract Binary Interface) of the ContractV2.
   * @return {TypedContractV2<TAbi>} - A typed instance of ContractV2.
   */
  public abstract typedv2<TAbi extends AbiKanabi>(tAbi: TAbi): TypedContractV2<TAbi>;
}
