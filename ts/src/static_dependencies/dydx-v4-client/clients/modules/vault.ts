import { PnlTickInterval } from '../constants';
import { Data } from '../types';
import RestClient from './rest';

/**
 * @description REST endpoints for data unrelated to a particular address.
 */
export default class VaultClient extends RestClient {
  async getMegavaultHistoricalPnl(resolution?: PnlTickInterval | null): Promise<Data> {
    const uri = '/v4/vault/v1/megavault/historicalPnl';
    return this.get(uri, { resolution });
  }

  async getVaultsHistoricalPnl(resolution?: PnlTickInterval | null): Promise<Data> {
    const uri = '/v4/vault/v1/vaults/historicalPnl';
    return this.get(uri, { resolution });
  }

  async getMegavaultPositions(): Promise<Data> {
    const uri = '/v4/vault/v1/megavault/positions';
    return this.get(uri);
  }
}
