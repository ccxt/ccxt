import { EDataAvailabilityMode, ETransactionVersion, ResourceBounds } from './api';
import {
  AllowArray,
  BigNumberish,
  BlockIdentifier,
  Call,
  DeclareContractPayload,
  DeployAccountContractPayload,
  TransactionType,
  UniversalDeployerContractPayload,
  V3TransactionDetails,
} from './lib';
import { DeclareTransactionReceiptResponse, EstimateFeeResponse } from './provider';

export interface EstimateFee extends EstimateFeeResponse {}

export type EstimateFeeBulk = Array<EstimateFee>;

// TODO: This is too wide generic with optional params
export type AccountInvocationsFactoryDetails = {
  versions: Array<`${ETransactionVersion}`>;
  nonce?: BigNumberish;
  blockIdentifier?: BlockIdentifier;
  skipValidate?: boolean;
} & Partial<V3TransactionDetails>;

export interface UniversalDetails {
  nonce?: BigNumberish;
  blockIdentifier?: BlockIdentifier;
  maxFee?: BigNumberish; // ignored on estimate
  tip?: BigNumberish;
  paymasterData?: BigNumberish[];
  accountDeploymentData?: BigNumberish[];
  nonceDataAvailabilityMode?: EDataAvailabilityMode;
  feeDataAvailabilityMode?: EDataAvailabilityMode;
  version?: BigNumberish;
  resourceBounds?: ResourceBounds; // ignored on estimate
  skipValidate?: boolean; // ignored on non-estimate
}

export interface EstimateFeeDetails extends UniversalDetails {}

export interface DeployContractResponse {
  contract_address: string;
  transaction_hash: string;
}

export type MultiDeployContractResponse = {
  contract_address: Array<string>;
  transaction_hash: string;
};

export type DeployContractUDCResponse = {
  contract_address: string;
  transaction_hash: string;
  address: string;
  deployer: string;
  unique: string;
  classHash: string;
  calldata_len: string;
  calldata: Array<string>;
  salt: string;
};

export type DeclareDeployUDCResponse = {
  declare: {
    class_hash: BigNumberish;
  } & Partial<DeclareTransactionReceiptResponse>;
  deploy: DeployContractUDCResponse;
};

export type SimulateTransactionDetails = {
  nonce?: BigNumberish;
  blockIdentifier?: BlockIdentifier;
  skipValidate?: boolean;
  skipExecute?: boolean;
} & Partial<V3TransactionDetails>;

export type EstimateFeeAction =
  | {
      type: TransactionType.INVOKE;
      payload: AllowArray<Call>;
    }
  | {
      type: TransactionType.DECLARE;
      payload: DeclareContractPayload;
    }
  | {
      type: TransactionType.DEPLOY_ACCOUNT;
      payload: DeployAccountContractPayload;
    }
  | {
      type: TransactionType.DEPLOY;
      payload: UniversalDeployerContractPayload;
    };

export type StarkProfile = {
  name?: string;
  profilePicture?: string;
  discord?: string;
  twitter?: string;
  github?: string;
  proofOfPersonhood?: boolean;
};
