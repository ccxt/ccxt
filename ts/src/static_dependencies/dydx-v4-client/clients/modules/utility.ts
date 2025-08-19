import type {
  ComplianceResponse,
  ComplianceV2Response,
  HeightResponse,
  TimeResponse,
} from '../types';
import RestClient from './rest';

export default class UtilityClient extends RestClient {
  /**
   * @description Get the current time of the Indexer
   * @returns {TimeResponse} isoString and epoch
   */
  async getTime(): Promise<TimeResponse> {
    const uri = '/v4/time';
    return this.get(uri);
  }

  /**
   * @description Get the block height of the most recent block processed by the Indexer
   * @returns {HeightResponse} block height and time
   */
  async getHeight(): Promise<HeightResponse> {
    const uri = '/v4/height';
    return this.get(uri);
  }

  /**
   * @description Screen an address to see if it is restricted
   * @param {string} address evm or dydx address
   * @returns {ComplianceResponse} whether the specified address is restricted
   */
  async screen(address: string): Promise<ComplianceResponse> {
    const uri = '/v4/screen';
    return this.get(uri, { address });
  }

  /**
   * @description Screen an address to see if it is restricted
   * @param {string} address evm or dydx address
   * @returns {ComplianceResponse} whether the specified address is restricted
   */
  async complianceScreen(address: string): Promise<ComplianceV2Response> {
    const uri = `/v4/compliance/screen/${address}`;
    return this.get(uri);
  }
}
