import { StarknetChainId } from '../../constants.js';
import { SignatureType } from '../../../noble-curves/abstract/weierstrass.js';
import { CairoEnum } from '../cairoEnum.js';
import { CompiledContract, CompiledSierraCasm, ContractClass } from './contract/index.js';
export declare type WeierstrassSignatureType = SignatureType;
export declare type ArraySignatureType = string[];
export declare type Signature = ArraySignatureType | WeierstrassSignatureType;
export declare type BigNumberish = string | number | bigint;
export declare type ByteArray = {
    data: BigNumberish[];
    pending_word: BigNumberish;
    pending_word_len: BigNumberish;
};
/**
 * Compiled calldata ready to be sent
 *
 * decimal-string array
 */
export declare type Calldata = string[] & {
    readonly __compiled__?: true;
};
/**
 * Represents an integer in the range [0, 2^256)
 */
export interface Uint256 {
    low: BigNumberish;
    high: BigNumberish;
}
/**
 * Represents an integer in the range [0, 2^256)
 */
export interface Uint512 {
    limb0: BigNumberish;
    limb1: BigNumberish;
    limb2: BigNumberish;
    limb3: BigNumberish;
}
/**
 * BigNumberish array
 *
 * use CallData.compile() to convert to Calldata
 */
export declare type RawCalldata = BigNumberish[];
/**
 * Hexadecimal-string array
 */
export declare type HexCalldata = string[];
export declare type AllowArray<T> = T | T[];
export declare type OptionalPayload<T> = {
    payload: T;
} | T;
export declare type RawArgs = RawArgsObject | RawArgsArray;
export declare type RawArgsObject = {
    [inputName: string]: MultiType | MultiType[] | RawArgs;
};
export declare type RawArgsArray = Array<MultiType | MultiType[] | RawArgs>;
export declare type MultiType = BigNumberish | Uint256 | object | boolean | CairoEnum;
export declare type UniversalDeployerContractPayload = {
    classHash: BigNumberish;
    salt?: string;
    unique?: boolean;
    constructorCalldata?: RawArgs;
};
export declare type DeployAccountContractPayload = {
    classHash: string;
    constructorCalldata?: RawArgs;
    addressSalt?: BigNumberish;
    contractAddress?: string;
};
export declare type DeployAccountContractTransaction = Omit<DeployAccountContractPayload, 'contractAddress'> & {
    signature?: Signature;
};
export declare type DeclareContractPayload = {
    contract: CompiledContract | string;
    classHash?: string;
    casm?: CompiledSierraCasm;
    compiledClassHash?: string;
};
export declare type CompleteDeclareContractPayload = {
    contract: CompiledContract | string;
    classHash: string;
    casm?: CompiledSierraCasm;
    compiledClassHash?: string;
};
export declare type DeclareAndDeployContractPayload = Omit<UniversalDeployerContractPayload, 'classHash'> & DeclareContractPayload;
export declare type DeclareContractTransaction = {
    contract: ContractClass;
    senderAddress: string;
    signature?: Signature;
    compiledClassHash?: string;
};
export declare type CallDetails = {
    contractAddress: string;
    calldata?: RawArgs | Calldata;
    entrypoint?: string;
};
export declare type Invocation = CallDetails & {
    signature?: Signature;
};
export declare type Call = CallDetails & {
    entrypoint: string;
};
export declare type CairoVersion = '0' | '1' | undefined;
export declare type CompilerVersion = '0' | '1' | '2' | undefined;
export declare type InvocationsDetails = {
    nonce?: BigNumberish;
    maxFee?: BigNumberish;
    version?: BigNumberish;
} & Partial<V3TransactionDetails>;
export declare type V3TransactionDetails = {
    nonce: BigNumberish;
    version: BigNumberish;
    tip: BigNumberish;
    paymasterData: BigNumberish[];
    accountDeploymentData: BigNumberish[];
};
/**
 * Contain all additional details params
 */
export declare type Details = {
    nonce: BigNumberish;
    maxFee: BigNumberish;
    version: BigNumberish;
    chainId: StarknetChainId;
};
export declare type InvocationsDetailsWithNonce = (InvocationsDetails & {
    nonce: BigNumberish;
}) | V3TransactionDetails;
export declare enum TransactionType {
    DECLARE = "DECLARE",
    DEPLOY = "DEPLOY",
    DEPLOY_ACCOUNT = "DEPLOY_ACCOUNT",
    INVOKE = "INVOKE_FUNCTION"
}
/**
 * new statuses are defined by props: finality_status and execution_status
 * to be #deprecated
 */
export declare enum TransactionStatus {
    NOT_RECEIVED = "NOT_RECEIVED",
    RECEIVED = "RECEIVED",
    ACCEPTED_ON_L2 = "ACCEPTED_ON_L2",
    ACCEPTED_ON_L1 = "ACCEPTED_ON_L1",
    REJECTED = "REJECTED",
    REVERTED = "REVERTED"
}
export declare enum TransactionFinalityStatus {
    NOT_RECEIVED = "NOT_RECEIVED",
    RECEIVED = "RECEIVED",
    ACCEPTED_ON_L2 = "ACCEPTED_ON_L2",
    ACCEPTED_ON_L1 = "ACCEPTED_ON_L1"
}
export declare enum TransactionExecutionStatus {
    REJECTED = "REJECTED",
    REVERTED = "REVERTED",
    SUCCEEDED = "SUCCEEDED"
}
export declare enum BlockStatus {
    PENDING = "PENDING",
    ACCEPTED_ON_L1 = "ACCEPTED_ON_L1",
    ACCEPTED_ON_L2 = "ACCEPTED_ON_L2",
    REJECTED = "REJECTED"
}
export declare enum BlockTag {
    pending = "pending",
    latest = "latest"
}
export declare type BlockNumber = BlockTag | null | number;
/**
 * hex string and BigInt are detected as block hashes
 *
 * decimal string and number are detected as block numbers
 *
 * text string are detected as block tag
 *
 * null return 'pending' block tag
 */
export declare type BlockIdentifier = BlockNumber | BigNumberish;
/**
 * items used by AccountInvocations
 */
export declare type AccountInvocationItem = (({
    type: TransactionType.DECLARE;
} & DeclareContractTransaction) | ({
    type: TransactionType.DEPLOY_ACCOUNT;
} & DeployAccountContractTransaction) | ({
    type: TransactionType.INVOKE;
} & Invocation)) & InvocationsDetailsWithNonce;
/**
 * Complete invocations array with account details (internal type from account -> provider)
 */
export declare type AccountInvocations = AccountInvocationItem[];
/**
 * Invocations array user provide to bulk method (simulate)
 */
export declare type Invocations = Array<({
    type: TransactionType.DECLARE;
} & OptionalPayload<DeclareContractPayload>) | ({
    type: TransactionType.DEPLOY;
} & OptionalPayload<AllowArray<UniversalDeployerContractPayload>>) | ({
    type: TransactionType.DEPLOY_ACCOUNT;
} & OptionalPayload<DeployAccountContractPayload>) | ({
    type: TransactionType.INVOKE;
} & OptionalPayload<AllowArray<Call>>)>;
export declare type Tupled = {
    element: any;
    type: string;
};
export declare type Args = {
    [inputName: string]: BigNumberish | BigNumberish[] | ParsedStruct | ParsedStruct[];
};
export declare type ParsedStruct = {
    [key: string]: BigNumberish | BigNumberish[] | ParsedStruct | Uint256;
};
export declare type waitForTransactionOptions = {
    retryInterval?: number;
    successStates?: Array<TransactionFinalityStatus | TransactionExecutionStatus>;
    errorStates?: Array<TransactionFinalityStatus | TransactionExecutionStatus>;
};
export declare type getSimulateTransactionOptions = {
    blockIdentifier?: BlockIdentifier;
    skipValidate?: boolean;
    skipExecute?: boolean;
    skipFeeCharge?: boolean;
};
export declare type getContractVersionOptions = {
    blockIdentifier?: BlockIdentifier;
    compiler?: boolean;
};
export declare type getEstimateFeeBulkOptions = {
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
export declare type ContractVersion = {
    /** version of the cairo language */
    cairo: CairoVersion;
    /** version of the cairo compiler used to compile the contract */
    compiler: CompilerVersion;
};
export * from './contract/index.js';
