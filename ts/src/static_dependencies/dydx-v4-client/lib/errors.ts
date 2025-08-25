import { BroadcastTxSyncResponse } from '@cosmjs/tendermint-rpc/build/tendermint37';

/**
 * An edge-case was hit in the client that should never have been reached.
 */
export class UnexpectedClientError extends Error {
  constructor() {
    super('An unexpected error occurred on the client');
    this.name = 'UnexpectedClientError';
  }
}

/**
 * An error occurred during the broadcasting process.
 */
export class BroadcastErrorObject extends Error {
  result: BroadcastTxSyncResponse;
  code: number;
  codespace?: string;

  constructor(message: string, result: BroadcastTxSyncResponse) {
    super(message);
    this.name = 'BroadcastError';
    this.result = result;
    this.code = result.code;
    this.codespace = result.codespace;
  }
}

/**
 * User error occurred during a client operation.
 */
export class UserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserError';
  }
}
