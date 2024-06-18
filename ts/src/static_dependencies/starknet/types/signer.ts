import { StarknetChainId } from '../constants.js';
import { ETransactionVersion, ETransactionVersion2, ETransactionVersion3 } from './api';
import {
  BigNumberish,
  CairoVersion,
  DeployAccountContractPayload,
  InvocationsDetails,
  V3TransactionDetails,
} from './lib';

export type InvocationsSignerDetails = (V2InvocationsSignerDetails | V3InvocationsSignerDetails) & {
  version: `${ETransactionVersion}`;
  skipValidate?: boolean;
};

export type V2InvocationsSignerDetails = {
  walletAddress: string;
  cairoVersion: CairoVersion;
  chainId: StarknetChainId;
  nonce: BigNumberish;
  maxFee: BigNumberish;
  version: `${ETransactionVersion2}`;
};

export type V3InvocationsSignerDetails = V3TransactionDetails & {
  walletAddress: string;
  cairoVersion: CairoVersion;
  chainId: StarknetChainId;
  version: `${ETransactionVersion3}`;
};

export type DeclareSignerDetails = (V3DeclareSignerDetails | V2DeclareSignerDetails) & {
  version: `${ETransactionVersion}`;
};

export type V2DeclareSignerDetails = Required<InvocationsDetails> & {
  classHash: string;
  compiledClassHash?: string;
  senderAddress: string;
  chainId: StarknetChainId;
  version: `${ETransactionVersion2}`;
};

export type V3DeclareSignerDetails = V3TransactionDetails & {
  classHash: string;
  compiledClassHash: string;
  senderAddress: string;
  chainId: StarknetChainId;
  version: `${ETransactionVersion3}`;
};

export type DeployAccountSignerDetails =
  | V2DeployAccountSignerDetails
  | V3DeployAccountSignerDetails;

export type V2DeployAccountSignerDetails = Required<DeployAccountContractPayload> &
  Required<InvocationsDetails> & {
    contractAddress: BigNumberish;
    chainId: StarknetChainId;
    version: `${ETransactionVersion2}`;
  };

export type V3DeployAccountSignerDetails = Required<DeployAccountContractPayload> &
  V3TransactionDetails & {
    contractAddress: BigNumberish;
    chainId: StarknetChainId;
    version: `${ETransactionVersion3}`;
  };
