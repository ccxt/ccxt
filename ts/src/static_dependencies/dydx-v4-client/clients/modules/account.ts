import {
  OrderSide,
  OrderStatus,
  OrderType,
  PositionStatus,
  TickerType,
  TradingRewardAggregationPeriod,
} from '../constants';
import { Data } from '../types';
import RestClient from './rest';

/**
 * @description REST endpoints for data related to a particular address.
 */
export default class AccountClient extends RestClient {
  // ------ Subaccount ------ //

  async getSubaccounts(address: string, limit?: number): Promise<Data> {
    const uri = `/v4/addresses/${address}`;
    return this.get(uri, { limit });
  }

  async getSubaccount(address: string, subaccountNumber: number): Promise<Data> {
    const uri = `/v4/addresses/${address}/subaccountNumber/${subaccountNumber}`;
    return this.get(uri);
  }

  async getParentSubaccount(address: string, parentSubaccountNumber: number): Promise<Data> {
    const uri = `/v4/addresses/${address}/parentSubaccountNumber/${parentSubaccountNumber}`;
    return this.get(uri);
  }

  // ------ Positions ------ //

  async getSubaccountPerpetualPositions(
    address: string,
    subaccountNumber: number,
    status?: PositionStatus | null,
    limit?: number | null,
    createdBeforeOrAtHeight?: number | null,
    createdBeforeOrAt?: string | null,
  ): Promise<Data> {
    const uri = '/v4/perpetualPositions';
    return this.get(uri, {
      address,
      subaccountNumber,
      status,
      limit,
      createdBeforeOrAtHeight,
      createdBeforeOrAt,
    });
  }

  async getSubaccountAssetPositions(
    address: string,
    subaccountNumber: number,
    status?: PositionStatus | null,
    limit?: number | null,
    createdBeforeOrAtHeight?: number | null,
    createdBeforeOrAt?: string | null,
  ): Promise<Data> {
    const uri = '/v4/assetPositions';
    return this.get(uri, {
      address,
      subaccountNumber,
      status,
      limit,
      createdBeforeOrAtHeight,
      createdBeforeOrAt,
    });
  }

  // ------ Transfers ------ //

  async getTransfersBetween(
    sourceAddress: string,
    sourceSubaccountNumber: string,
    recipientAddress: string,
    recipientSubaccountNumber: string,
    createdBeforeOrAtHeight?: number | null,
    createdBeforeOrAt?: string | null,
  ): Promise<Data> {
    const uri = '/v4/transfers/between';
    return this.get(uri, {
      sourceAddress,
      sourceSubaccountNumber,
      recipientAddress,
      recipientSubaccountNumber,
      createdBeforeOrAtHeight,
      createdBeforeOrAt,
    });
  }

  async getSubaccountTransfers(
    address: string,
    subaccountNumber: number,
    limit?: number | null,
    createdBeforeOrAtHeight?: number | null,
    createdBeforeOrAt?: string | null,
    page?: number | null,
  ): Promise<Data> {
    const uri = '/v4/transfers';
    return this.get(uri, {
      address,
      subaccountNumber,
      limit,
      createdBeforeOrAtHeight,
      createdBeforeOrAt,
      page,
    });
  }

  async getParentSubaccountNumberTransfers(
    address: string,
    parentSubaccountNumber: number,
    limit?: number | null,
    createdBeforeOrAtHeight?: number | null,
    createdBeforeOrAt?: string | null,
    page?: number | null,
  ): Promise<Data> {
    const uri = '/v4/transfers/parentSubaccountNumber';
    return this.get(uri, {
      address,
      parentSubaccountNumber,
      limit,
      createdBeforeOrAtHeight,
      createdBeforeOrAt,
      page,
    });
  }

  // ------ Orders ------ //

  async getSubaccountOrders(
    address: string,
    subaccountNumber: number,
    ticker?: string | null,
    tickerType: TickerType = TickerType.PERPETUAL,
    side?: OrderSide | null,
    status?: OrderStatus | null,
    type?: OrderType | null,
    limit?: number | null,
    goodTilBlockBeforeOrAt?: number | null,
    goodTilBlockTimeBeforeOrAt?: string | null,
    returnLatestOrders?: boolean | null,
  ): Promise<Data> {
    const uri = '/v4/orders';
    return this.get(uri, {
      address,
      subaccountNumber,
      ticker,
      tickerType,
      side,
      status,
      type,
      limit,
      goodTilBlockBeforeOrAt,
      goodTilBlockTimeBeforeOrAt,
      returnLatestOrders,
    });
  }

  async getParentSubaccountNumberOrders(
    address: string,
    parentSubaccountNumber: number,
    ticker?: string | null,
    side?: OrderSide | null,
    status?: OrderStatus | null,
    type?: OrderType | null,
    limit?: number | null,
    goodTilBlockBeforeOrAt?: number | null,
    goodTilBlockTimeBeforeOrAt?: string | null,
    returnLatestOrders?: boolean | null,
  ): Promise<Data> {
    const uri = '/v4/orders/parentSubaccountNumber';
    return this.get(uri, {
      address,
      parentSubaccountNumber,
      ticker,
      side,
      status,
      type,
      limit,
      goodTilBlockBeforeOrAt,
      goodTilBlockTimeBeforeOrAt,
      returnLatestOrders,
    });
  }

  async getOrder(orderId: string): Promise<Data> {
    const uri = `/v4/orders/${orderId}`;
    return this.get(uri);
  }

  // ------ Fills ------ //

  async getSubaccountFills(
    address: string,
    subaccountNumber: number,
    ticker?: string | null,
    tickerType: TickerType = TickerType.PERPETUAL,
    limit?: number | null,
    createdBeforeOrAtHeight?: number | null,
    createdBeforeOrAt?: string | null,
    page?: number | null,
  ): Promise<Data> {
    const uri = '/v4/fills';
    return this.get(uri, {
      address,
      subaccountNumber,
      ticker,
      tickerType,
      limit,
      createdBeforeOrAtHeight,
      createdBeforeOrAt,
      page,
    });
  }

  async getParentSubaccountNumberFills(
    address: string,
    parentSubaccountNumber: number,
    ticker?: string | null,
    tickerType: TickerType = TickerType.PERPETUAL,
    limit?: number | null,
    createdBeforeOrAtHeight?: number | null,
    createdBeforeOrAt?: string | null,
    page?: number | null,
  ): Promise<Data> {
    const uri = '/v4/fills/parentSubaccountNumber';
    return this.get(uri, {
      address,
      parentSubaccountNumber,
      ticker,
      tickerType,
      limit,
      createdBeforeOrAtHeight,
      createdBeforeOrAt,
      page,
    });
  }

  // ------ Pnl ------ //

  async getSubaccountHistoricalPNLs(
    address: string,
    subaccountNumber: number,
    createdBeforeOrAtHeight?: number | null,
    createdBeforeOrAt?: string | null,
    createdOnOrAfterHeight?: number | null,
    createdOnOrAfter?: string | null,
    limit?: number | null,
    page?: number | null,
  ): Promise<Data> {
    const uri = '/v4/historical-pnl';
    return this.get(uri, {
      address,
      subaccountNumber,
      createdBeforeOrAtHeight,
      createdBeforeOrAt,
      createdOnOrAfterHeight,
      createdOnOrAfter,
      limit,
      page,
    });
  }

  // limit applies to the subaccount ticks, so expect number of results to be much lower than limit
  async getParentSubaccountNumberHistoricalPNLs(
    address: string,
    parentSubaccountNumber: number,
    createdBeforeOrAtHeight?: number | null,
    createdBeforeOrAt?: string | null,
    createdOnOrAfterHeight?: number | null,
    createdOnOrAfter?: string | null,
    limit?: number | null,
    page?: number | null,
  ): Promise<Data> {
    const uri = '/v4/historical-pnl/parentSubaccountNumber';
    return this.get(uri, {
      address,
      parentSubaccountNumber,
      createdBeforeOrAtHeight,
      createdBeforeOrAt,
      createdOnOrAfterHeight,
      createdOnOrAfter,
      limit,
      page,
    });
  }

  // ------ Rewards ------ //

  async getHistoricalTradingRewardsAggregations(
    address: string,
    period: TradingRewardAggregationPeriod,
    limit?: number,
    startingBeforeOrAt?: string,
    startingBeforeOrAtHeight?: string,
  ): Promise<Data> {
    const uri = `/v4/historicalTradingRewardAggregations/${address}`;
    return this.get(uri, { period, limit, startingBeforeOrAt, startingBeforeOrAtHeight });
  }

  async getHistoricalBlockTradingRewards(
    address: string,
    limit?: number,
    startingBeforeOrAt?: string,
    startingBeforeOrAtHeight?: string,
  ): Promise<Data> {
    const uri = `/v4/historicalBlockTradingRewards/${address}`;
    return this.get(uri, { limit, startingBeforeOrAt, startingBeforeOrAtHeight });
  }

  // ------ Funding Payments------ //

  async getSubaccountFundingPayments(
    address: string,
    subaccountNumber: number,
    limit?: number,
    ticker?: string,
    afterOrAt?: string,
    page?: number,
  ): Promise<Data> {
    const uri = `/v4/fundingPayments`;
    return this.get(uri, { address, subaccountNumber, limit, ticker, afterOrAt, page });
  }

  async getParentSubaccountNumberFundingPayments(
    address: string,
    parentSubaccountNumber: number,
    limit?: number,
    ticker?: string,
    afterOrAt?: string,
    page?: number,
  ): Promise<Data> {
    const uri = `/v4/fundingPayments/parentSubaccount`;
    return this.get(uri, { address, parentSubaccountNumber, limit, ticker, afterOrAt, page });
  }
}
