import { StarknetChainId } from '../../constants.js';
import { SignatureType } from '../../../noble-curves/abstract/weierstrass.js';
// import { EDataAvailabilityMode, ResourceBounds } from '../api/index.js';
import { CairoEnum } from '../cairoEnum.js';
import { CompiledContract, CompiledSierraCasm, ContractClass } from './contract/index.js';

export type WeierstrassSignatureType = SignatureType;
export type ArraySignatureType = string[];
export type Signature = ArraySignatureType | WeierstrassSignatureType;

export type BigNumberish = string | number | bigint;

export type ByteArray = {
  data: BigNumberish[];
  pending_word: BigNumberish;
  pending_word_len: BigNumberish;
};

/**
 * Compiled calldata ready to be sent
 *
 * decimal-string array
 */
export type Calldata = string[] & { readonly __compiled__?: true };

/**
 * Represents an integer in the range [0, 2^256)
 */
export interface Uint256 {
  // The low 128 bits of the value
  low: BigNumberish;
  // The high 128 bits of the value
  high: BigNumberish;
}

/**
 * Represents an integer in the range [0, 2^256)
 */
export interface Uint512 {
  // The lowest 128 bits of the value
  limb0: BigNumberish;
  limb1: BigNumberish;
  limb2: BigNumberish;
  // The higher 128 bits of the value
  limb3: BigNumberish;
}

/**
 * BigNumberish array
 *
 * use CallData.compile() to convert to Calldata
 */
export type RawCalldata = BigNumberish[];

/**
 * Hexadecimal-string array
 */
export type HexCalldata = string[];

export type AllowArray<T> = T | T[];

export type OptionalPayload<T> = { payload: T } | T;

export type RawArgs = RawArgsObject | RawArgsArray;

export type RawArgsObject = {
  [inputName: string]: MultiType | MultiType[] | RawArgs;
};

export type RawArgsArray = Array<MultiType | MultiType[] | RawArgs>;

export type MultiType = BigNumberish | Uint256 | object | boolean | CairoEnum;

export type UniversalDeployerContractPayload = {
  classHash: BigNumberish;
  salt?: string;
  unique?: boolean;
  constructorCalldata?: RawArgs;
};

export type DeployAccountContractPayload = {
  classHash: string;
  constructorCalldata?: RawArgs;
  addressSalt?: BigNumberish;
  contractAddress?: string;
};

export type DeployAccountContractTransaction = Omit<
  DeployAccountContractPayload,
  'contractAddress'
> & {
  signature?: Signature;
};

export type DeclareContractPayload = {
  contract: CompiledContract | string;
  classHash?: string;
  casm?: CompiledSierraCasm;
  compiledClassHash?: string;
};

export type CompleteDeclareContractPayload = {
  contract: CompiledContract | string;
  classHash: string;
  casm?: CompiledSierraCasm;
  compiledClassHash?: string;
};

export type DeclareAndDeployContractPayload = Omit<UniversalDeployerContractPayload, 'classHash'> &
  DeclareContractPayload;

export type DeclareContractTransaction = {
  contract: ContractClass;
  senderAddress: string;
  signature?: Signature;
  compiledClassHash?: string;
};

export type CallDetails = {
  contractAddress: string;
  calldata?: RawArgs | Calldata;
  entrypoint?: string;
};

export type Invocation = CallDetails & { signature?: Signature };

export type Call = CallDetails & { entrypoint: string };

export type CairoVersion = '0' | '1' | undefined;
export type CompilerVersion = '0' | '1' | '2' | undefined;

export type InvocationsDetails = {
  nonce?: BigNumberish;
  maxFee?: BigNumberish;
  version?: BigNumberish;
} & Partial<V3TransactionDetails>;

export type V3TransactionDetails = {
  nonce: BigNumberish;
  version: BigNumberish;
  // resourceBounds: ResourceBounds;
  tip: BigNumberish;
  paymasterData: BigNumberish[];
  accountDeploymentData: BigNumberish[];
  // nonceDataAvailabilityMode: EDataAvailabilityMode;
  // feeDataAvailabilityMode: EDataAvailabilityMode;
};

/**
 * Contain all additional details params
 */
export type Details = {
  nonce: BigNumberish;
  maxFee: BigNumberish;
  version: BigNumberish;
  chainId: StarknetChainId;
};

export type InvocationsDetailsWithNonce =
  | (InvocationsDetails & {
      nonce: BigNumberish;
    })
  | V3TransactionDetails;

export enum TransactionType {
  DECLARE = 'DECLARE',
  DEPLOY = 'DEPLOY',
  DEPLOY_ACCOUNT = 'DEPLOY_ACCOUNT',
  INVOKE = 'INVOKE_FUNCTION',
}

/**
 * new statuses are defined by props: finality_status and execution_status
 * to be #deprecated
 */
export enum TransactionStatus {
  NOT_RECEIVED = 'NOT_RECEIVED',
  RECEIVED = 'RECEIVED',
  ACCEPTED_ON_L2 = 'ACCEPTED_ON_L2',
  ACCEPTED_ON_L1 = 'ACCEPTED_ON_L1',
  REJECTED = 'REJECTED',
  REVERTED = 'REVERTED',
}

export enum TransactionFinalityStatus {
  NOT_RECEIVED = 'NOT_RECEIVED',
  RECEIVED = 'RECEIVED',
  ACCEPTED_ON_L2 = 'ACCEPTED_ON_L2',
  ACCEPTED_ON_L1 = 'ACCEPTED_ON_L1',
}

export enum TransactionExecutionStatus {
  REJECTED = 'REJECTED',
  REVERTED = 'REVERTED',
  SUCCEEDED = 'SUCCEEDED',
}

export enum BlockStatus {
  PENDING = 'PENDING',
  ACCEPTED_ON_L1 = 'ACCEPTED_ON_L1',
  ACCEPTED_ON_L2 = 'ACCEPTED_ON_L2',
  REJECTED = 'REJECTED',
}

export enum BlockTag {
  pending = 'pending',
  latest = 'latest',
}

export type BlockNumber = BlockTag | null | number;

/**
 * hex string and BigInt are detected as block hashes
 *
 * decimal string and number are detected as block numbers
 *
 * text string are detected as block tag
 *
 * null return 'pending' block tag
 */
export type BlockIdentifier = BlockNumber | BigNumberish;

/**
 * items used by AccountInvocations
 */
export type AccountInvocationItem = (
  | ({ type: TransactionType.DECLARE } & DeclareContractTransaction)
  | ({ type: TransactionType.DEPLOY_ACCOUNT } & DeployAccountContractTransaction)
  | ({ type: TransactionType.INVOKE } & Invocation)
) &
  InvocationsDetailsWithNonce;

/**
 * Complete invocations array with account details (internal type from account -> provider)
 */
export type AccountInvocations = AccountInvocationItem[];

/**
 * Invocations array user provide to bulk method (simulate)
 */
export type Invocations = Array<
  | ({ type: TransactionType.DECLARE } & OptionalPayload<DeclareContractPayload>)
  | ({ type: TransactionType.DEPLOY } & OptionalPayload<
      AllowArray<UniversalDeployerContractPayload>
    >)
  | ({ type: TransactionType.DEPLOY_ACCOUNT } & OptionalPayload<DeployAccountContractPayload>)
  | ({ type: TransactionType.INVOKE } & OptionalPayload<AllowArray<Call>>)
>;

export type Tupled = { element: any; type: string };

export type Args = {
  [inputName: string]: BigNumberish | BigNumberish[] | ParsedStruct | ParsedStruct[];
};
export type ParsedStruct = {
  [key: string]: BigNumberish | BigNumberish[] | ParsedStruct | Uint256;
};

export type waitForTransactionOptions = {
  retryInterval?: number;
  successStates?: Array<TransactionFinalityStatus | TransactionExecutionStatus>;
  errorStates?: Array<TransactionFinalityStatus | TransactionExecutionStatus>;
};

export type getSimulateTransactionOptions = {
  blockIdentifier?: BlockIdentifier;
  skipValidate?: boolean;
  skipExecute?: boolean;
  skipFeeCharge?: boolean;
};

export type getContractVersionOptions = {
  blockIdentifier?: BlockIdentifier;
  compiler?: boolean;
};

export type getEstimateFeeBulkOptions = {
  blockIdentifier?: BlockIdentifier;
  skipValidate?: boolean;
};

export interface CallStruct {
  to: string;
  selector: string;
  calldata: string[];
}

/**
 * Represent Contract version
 */
export type ContractVersion = {
  /** version of the cairo language */
  cairo: CairoVersion;
  /** version of the cairo compiler used to compile the contract */
  compiler: CompilerVersion;
};

export * from './contract/index.js';
