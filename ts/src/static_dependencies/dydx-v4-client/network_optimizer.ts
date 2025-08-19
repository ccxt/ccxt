import { IndexerClient } from './clients/indexer-client';
import { ValidatorClient } from './clients/validator-client';
import { encodeJson } from './lib/helpers';
import { IndexerConfig, ValidatorConfig } from './types';

class PingResponse {
  public readonly height: number;
  public readonly responseTime: Date;
  public endpoint?: string;

  constructor(height: number) {
    this.height = height;
    this.responseTime = new Date();
  }
}

export const isTruthy = <T>(n?: T | false | null | undefined | 0): n is T => Boolean(n);

export class NetworkOptimizer {
  private async validatorClients(
    endpointUrls: string[],
    chainId: string,
  ): Promise<ValidatorClient[]> {
    return (
      await Promise.all(
        endpointUrls.map((endpointUrl) =>
          ValidatorClient.connect(
            new ValidatorConfig(endpointUrl, chainId, {
              CHAINTOKEN_DENOM: 'placeholder',
              CHAINTOKEN_DECIMALS: 18,
              USDC_DENOM: 'uusdc',
              USDC_DECIMALS: 6,
            }),
          ).catch((_) => undefined),
        ),
      )
    ).filter(isTruthy);
  }

  private indexerClients(endpointUrls: string[]): IndexerClient[] {
    return endpointUrls
      .map(
        (endpointUrl) =>
          new IndexerClient(
            // socket is not used for finding optimal indexer, but required as a parameter to the config
            new IndexerConfig(
              endpointUrl,
              endpointUrl.replace('https://', 'wss://').replace('http://', 'ws://'),
            ),
          ),
      )
      .filter(isTruthy);
  }

  async findOptimalNode(endpointUrls: string[], chainId: string): Promise<string> {
    if (endpointUrls.length === 0) {
      const errorResponse = {
        error: {
          message: 'No nodes provided',
        },
      };
      return encodeJson(errorResponse);
    }
    const clients = await this.validatorClients(endpointUrls, chainId);
    const responses = (
      await Promise.all(
        clients
          .map(async (client) => {
            const block = await client.get.latestBlock();
            const response = new PingResponse(block.header.height);
            return {
              endpoint: client.config.restEndpoint,
              height: response.height,
              time: response.responseTime.getTime(),
            };
          })
          .map((promise) => promise.catch((_) => undefined)),
      )
    ).filter(isTruthy);

    if (responses.length === 0) {
      throw new Error('Could not connect to endpoints');
    }
    const maxHeight = Math.max(...responses.map(({ height }) => height));
    return (
      responses
        // Only consider nodes at `maxHeight` or `maxHeight - 1`
        .filter(({ height }) => height === maxHeight || height === maxHeight - 1)
        // Return the endpoint with the fastest response time
        .sort((a, b) => a.time - b.time)[0].endpoint
    );
  }

  async findOptimalIndexer(endpointUrls: string[]): Promise<string> {
    if (endpointUrls.length === 0) {
      const errorResponse = {
        error: {
          message: 'No URL provided',
        },
      };
      return encodeJson(errorResponse);
    }
    const clients = this.indexerClients(endpointUrls);
    const responses = (
      await Promise.all(
        clients
          .map(async (client) => {
            const block = await client.utility.getHeight();
            const response = new PingResponse(+block.height);
            return {
              endpoint: client.config.restEndpoint,
              height: response.height,
              time: response.responseTime.getTime(),
            };
          })
          .map((promise) => promise.catch((_) => undefined)),
      )
    ).filter(isTruthy);

    if (responses.length === 0) {
      throw new Error('Could not connect to endpoints');
    }
    const maxHeight = Math.max(...responses.map(({ height }) => height));
    return (
      responses
        // Only consider nodes at `maxHeight` or `maxHeight - 1`
        .filter(({ height }) => height === maxHeight || height === maxHeight - 1)
        // Return the endpoint with the fastest response time
        .sort((a, b) => a.time - b.time)[0].endpoint
    );
  }
}
