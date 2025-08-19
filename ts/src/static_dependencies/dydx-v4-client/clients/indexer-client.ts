import { IndexerConfig, DEFAULT_API_TIMEOUT } from './constants';
import AccountClient from './modules/account';
import MarketsClient from './modules/markets';
import UtilityClient from './modules/utility';
import VaultClient from './modules/vault';

/**
 * @description Client for Indexer
 */
export class IndexerClient {
  public readonly config: IndexerConfig;
  readonly apiTimeout: number;
  readonly _markets: MarketsClient;
  readonly _account: AccountClient;
  readonly _utility: UtilityClient;
  readonly _vault: VaultClient;

  constructor(config: IndexerConfig, apiTimeout?: number) {
    this.config = config;
    this.apiTimeout = apiTimeout ?? DEFAULT_API_TIMEOUT;

    this._markets = new MarketsClient(config.restEndpoint, apiTimeout, config.proxy);
    this._account = new AccountClient(config.restEndpoint, apiTimeout, config.proxy);
    this._utility = new UtilityClient(config.restEndpoint, apiTimeout, config.proxy);
    this._vault = new VaultClient(config.restEndpoint, apiTimeout, config.proxy);
  }

  /**
   * @description Get the public module, used for interacting with public endpoints.
   *
   * @returns The public module
   */
  get markets(): MarketsClient {
    return this._markets;
  }

  /**
   * @description Get the private module, used for interacting with private endpoints.
   *
   * @returns The private module
   */
  get account(): AccountClient {
    return this._account;
  }

  /**
   * @description Get the utility module, used for interacting with non-market public endpoints.
   */
  get utility(): UtilityClient {
    return this._utility;
  }

  /**
   * @description Get the vault module, used for interacting with vault endpoints.
   *
   * @returns The vault module
   */
  get vault(): VaultClient {
    return this._vault;
  }
}
