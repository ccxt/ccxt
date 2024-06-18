/**
 * Map RPC Response to common interface response
 * Intersection (sequencer response ∩ (∪ rpc responses))
 */
import {
  BlockWithTxHashes,
  ContractClassPayload,
  ContractClassResponse,
  EstimateFeeResponse,
  EstimateFeeResponseBulk,
  FeeEstimate,
  GetBlockResponse,
  GetTxReceiptResponseWithoutHelper,
  RpcProviderOptions,
  SimulateTransactionResponse,
  SimulatedTransaction,
  TransactionReceipt,
} from '../../types/provider';
import { toBigInt } from '../num.js';
import { isString } from '../shortString.js';
import { estimateFeeToBounds, estimatedFeeToMaxFee } from '../stark';
import { ResponseParser } from '.';

export class RPCResponseParser
  implements
    Omit<
      ResponseParser,
      | 'parseDeclareContractResponse'
      | 'parseDeployContractResponse'
      | 'parseInvokeFunctionResponse'
      | 'parseGetTransactionReceiptResponse'
      | 'parseGetTransactionResponse'
      | 'parseCallContractResponse'
    >
{
  private margin: RpcProviderOptions['feeMarginPercentage'];

  constructor(margin?: RpcProviderOptions['feeMarginPercentage']) {
    this.margin = margin;
  }

  private estimatedFeeToMaxFee(estimatedFee: Parameters<typeof estimatedFeeToMaxFee>[0]) {
    return estimatedFeeToMaxFee(estimatedFee, this.margin?.maxFee);
  }

  private estimateFeeToBounds(estimate: Parameters<typeof estimateFeeToBounds>[0]) {
    return estimateFeeToBounds(
      estimate,
      this.margin?.l1BoundMaxAmount,
      this.margin?.l1BoundMaxPricePerUnit
    );
  }

  public parseGetBlockResponse(res: BlockWithTxHashes): GetBlockResponse {
    return { status: 'PENDING', ...res } as GetBlockResponse;
  }

  public parseTransactionReceipt(res: TransactionReceipt): GetTxReceiptResponseWithoutHelper {
    // HOTFIX RPC 0.5 to align with RPC 0.6
    // This case is RPC 0.5. It can be only v2 thx with FRI units
    if ('actual_fee' in res && isString(res.actual_fee)) {
      return {
        ...(res as GetTxReceiptResponseWithoutHelper),
        actual_fee: {
          amount: res.actual_fee,
          unit: 'FRI',
        },
      } as GetTxReceiptResponseWithoutHelper;
    }

    return res as GetTxReceiptResponseWithoutHelper;
  }

  public parseFeeEstimateResponse(res: FeeEstimate[]): EstimateFeeResponse {
    const val = res[0];
    return {
      overall_fee: toBigInt(val.overall_fee),
      gas_consumed: toBigInt(val.gas_consumed),
      gas_price: toBigInt(val.gas_price),
      unit: val.unit,
      suggestedMaxFee: this.estimatedFeeToMaxFee(val.overall_fee),
      resourceBounds: this.estimateFeeToBounds(val),
      data_gas_consumed: val.data_gas_consumed ? toBigInt(val.data_gas_consumed) : 0n,
      data_gas_price: val.data_gas_price ? toBigInt(val.data_gas_price) : 0n,
    };
  }

  public parseFeeEstimateBulkResponse(res: FeeEstimate[]): EstimateFeeResponseBulk {
    return res.map((val) => ({
      overall_fee: toBigInt(val.overall_fee),
      gas_consumed: toBigInt(val.gas_consumed),
      gas_price: toBigInt(val.gas_price),
      unit: val.unit,
      suggestedMaxFee: this.estimatedFeeToMaxFee(val.overall_fee),
      resourceBounds: this.estimateFeeToBounds(val),
      data_gas_consumed: val.data_gas_consumed ? toBigInt(val.data_gas_consumed) : 0n,
      data_gas_price: val.data_gas_price ? toBigInt(val.data_gas_price) : 0n,
    }));
  }

  public parseSimulateTransactionResponse(
    // TODO: revisit
    // set as 'any' to avoid a mapped type circular recursion error stemming from
    // merging src/types/api/rpcspec*/components/FUNCTION_INVOCATION.calls
    //
    // res: SimulateTransactionResponse
    res: any
  ): SimulateTransactionResponse {
    return res.map((it: SimulatedTransaction) => {
      return {
        ...it,
        suggestedMaxFee: this.estimatedFeeToMaxFee(it.fee_estimation.overall_fee),
        resourceBounds: this.estimateFeeToBounds(it.fee_estimation),
      };
    });
  }

  public parseContractClassResponse(res: ContractClassPayload): ContractClassResponse {
    return {
      ...(res as ContractClassResponse),
      abi: isString(res.abi) ? JSON.parse(res.abi) : res.abi,
    };
  }

  public parseL1GasPriceResponse(res: BlockWithTxHashes): string {
    return res.l1_gas_price.price_in_wei;
  }
}
