import {
  BlockWithTxHashes,
  FeeEstimate,
  CallContractResponse,
  DeclareContractResponse,
  DeployContractResponse,
  EstimateFeeResponse,
  GetBlockResponse,
  GetTransactionResponse,
  InvokeFunctionResponse,
  SimulateTransactionResponse,
} from '../../types';
import type { GetTransactionReceiptResponse } from '../transactionReceipt';

export abstract class ResponseParser {
  abstract parseGetBlockResponse(res: BlockWithTxHashes): GetBlockResponse;

  abstract parseGetTransactionResponse(res: any): GetTransactionResponse;

  abstract parseGetTransactionReceiptResponse(res: any): GetTransactionReceiptResponse;

  abstract parseFeeEstimateResponse(res: FeeEstimate[]): EstimateFeeResponse;

  abstract parseCallContractResponse(res: any): CallContractResponse;

  abstract parseInvokeFunctionResponse(res: any): InvokeFunctionResponse;

  abstract parseDeployContractResponse(res: any): DeployContractResponse;

  abstract parseDeclareContractResponse(res: any): DeclareContractResponse;

  abstract parseSimulateTransactionResponse(res: any): SimulateTransactionResponse;
}
