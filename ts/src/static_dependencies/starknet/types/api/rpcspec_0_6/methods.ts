import {
  ADDRESS,
  BLOCK_ID,
  BLOCK_NUMBER,
  BROADCASTED_DECLARE_TXN,
  BROADCASTED_DEPLOY_ACCOUNT_TXN,
  BROADCASTED_INVOKE_TXN,
  BROADCASTED_TXN,
  CHAIN_ID,
  EVENT_FILTER,
  FELT,
  FUNCTION_CALL,
  MSG_FROM_L1,
  RESULT_PAGE_REQUEST,
  SIMULATION_FLAG,
  SIMULATION_FLAG_FOR_ESTIMATE_FEE,
  STORAGE_KEY,
  TXN_HASH,
} from './components';
import * as Errors from './errors';
import {
  BlockHashAndNumber,
  BlockTransactionsTraces,
  BlockWithTxHashes,
  BlockWithTxs,
  ContractClass,
  DeclaredTransaction,
  DeployedAccountTransaction,
  Events,
  FeeEstimate,
  InvokedTransaction,
  Nonce,
  SimulateTransactionResponse,
  StateUpdate,
  Syncing,
  TransactionReceipt,
  TransactionStatus,
  TransactionTrace,
  TransactionWithHash,
} from './nonspec';

export type Methods = ReadMethods & WriteMethods & TraceMethods;

type ReadMethods = {
  // Returns the version of the Starknet JSON-RPC specification being used
  starknet_specVersion: {
    params: [];
    result: string;
  };

  // Get block information with transaction hashes given the block id
  starknet_getBlockWithTxHashes: {
    params: {
      block_id: BLOCK_ID;
    };
    result: BlockWithTxHashes;
    errors: Errors.BLOCK_NOT_FOUND;
  };

  // Get block information with full transactions given the block id
  starknet_getBlockWithTxs: {
    params: {
      block_id: BLOCK_ID;
    };
    result: BlockWithTxs;
    errors: Errors.BLOCK_NOT_FOUND;
  };

  // Get the information about the result of executing the requested block
  starknet_getStateUpdate: {
    params: {
      block_id: BLOCK_ID;
    };
    result: StateUpdate;
    errors: Errors.BLOCK_NOT_FOUND;
  };

  // Get the value of the storage at the given address and key
  starknet_getStorageAt: {
    params: {
      contract_address: ADDRESS;
      key: STORAGE_KEY;
      block_id: BLOCK_ID;
    };
    result: FELT;
    errors: Errors.CONTRACT_NOT_FOUND | Errors.BLOCK_NOT_FOUND;
  };

  // Gets the transaction status (possibly reflecting that the tx is still in the mempool, or dropped from it)
  starknet_getTransactionStatus: {
    params: {
      transaction_hash: TXN_HASH;
    };
    result: TransactionStatus;
    errors: Errors.TXN_HASH_NOT_FOUND;
  };

  // Get the details and status of a submitted transaction
  starknet_getTransactionByHash: {
    params: {
      transaction_hash: TXN_HASH;
    };
    result: TransactionWithHash;
    errors: Errors.TXN_HASH_NOT_FOUND;
  };

  // Get the details of a transaction by a given block id and index
  starknet_getTransactionByBlockIdAndIndex: {
    params: {
      block_id: BLOCK_ID;
      index: number;
    };
    result: TransactionWithHash;
    errors: Errors.BLOCK_NOT_FOUND | Errors.INVALID_TXN_INDEX;
  };

  // Get the transaction receipt by the transaction hash
  starknet_getTransactionReceipt: {
    params: {
      transaction_hash: TXN_HASH;
    };
    result: TransactionReceipt;
    errors: Errors.TXN_HASH_NOT_FOUND;
  };

  // Get the contract class definition in the given block associated with the given hash
  starknet_getClass: {
    params: {
      block_id: BLOCK_ID;
      class_hash: FELT;
    };
    result: ContractClass;
    errors: Errors.BLOCK_NOT_FOUND | Errors.CLASS_HASH_NOT_FOUND;
  };

  // Get the contract class hash in the given block for the contract deployed at the given address
  starknet_getClassHashAt: {
    params: {
      block_id: BLOCK_ID;
      contract_address: ADDRESS;
    };
    result: FELT;
    errors: Errors.BLOCK_NOT_FOUND | Errors.CONTRACT_NOT_FOUND;
  };

  // Get the contract class definition in the given block at the given address
  starknet_getClassAt: {
    params: {
      block_id: BLOCK_ID;
      contract_address: ADDRESS;
    };
    result: ContractClass;
    errors: Errors.BLOCK_NOT_FOUND | Errors.CONTRACT_NOT_FOUND;
  };

  // Get the number of transactions in a block given a block id
  starknet_getBlockTransactionCount: {
    params: {
      block_id: BLOCK_ID;
    };
    result: number;
    errors: Errors.BLOCK_NOT_FOUND;
  };

  // Call a Starknet function without creating a Starknet transaction
  starknet_call: {
    params: {
      request: FUNCTION_CALL;
      block_id: BLOCK_ID;
    };
    result: FELT[];
    errors: Errors.CONTRACT_NOT_FOUND | Errors.CONTRACT_ERROR | Errors.BLOCK_NOT_FOUND;
  };

  // Estimate the fee for Starknet transactions
  starknet_estimateFee: {
    params: {
      request: BROADCASTED_TXN[];
      simulation_flags?: [SIMULATION_FLAG_FOR_ESTIMATE_FEE] | []; // Diverged from spec (0.5 can't be, 0.6 must be)
      block_id: BLOCK_ID;
    };
    result: FeeEstimate[];
    errors: Errors.TRANSACTION_EXECUTION_ERROR | Errors.BLOCK_NOT_FOUND;
  };

  // Estimate the L2 fee of a message sent on L1
  starknet_estimateMessageFee: {
    params: {
      message: MSG_FROM_L1;
      block_id: BLOCK_ID;
    };
    result: FeeEstimate;
    errors: Errors.CONTRACT_ERROR | Errors.BLOCK_NOT_FOUND;
  };

  // Get the most recent accepted block number
  starknet_blockNumber: {
    params: [];
    result: BLOCK_NUMBER;
    errors: Errors.NO_BLOCKS;
  };

  // Get the most recent accepted block hash and number
  starknet_blockHashAndNumber: {
    params: [];
    result: BlockHashAndNumber;
    errors: Errors.NO_BLOCKS;
  };

  // Return the currently configured Starknet chain id
  starknet_chainId: {
    params: [];
    result: CHAIN_ID;
  };

  // Returns an object about the sync status, or false if the node is not syncing
  starknet_syncing: {
    params: [];
    result: Syncing;
  };

  // Returns all events matching the given filter
  starknet_getEvents: {
    params: {
      filter: EVENT_FILTER & RESULT_PAGE_REQUEST;
    };
    result: Events;
    errors:
      | Errors.PAGE_SIZE_TOO_BIG
      | Errors.INVALID_CONTINUATION_TOKEN
      | Errors.BLOCK_NOT_FOUND
      | Errors.TOO_MANY_KEYS_IN_FILTER;
  };

  // Get the nonce associated with the given address in the given block
  starknet_getNonce: {
    params: {
      block_id: BLOCK_ID;
      contract_address: ADDRESS;
    };
    result: Nonce;
    errors: Errors.BLOCK_NOT_FOUND | Errors.CONTRACT_NOT_FOUND;
  };
};

type WriteMethods = {
  // Submit a new transaction to be added to the chain
  starknet_addInvokeTransaction: {
    params: {
      invoke_transaction: BROADCASTED_INVOKE_TXN;
    };
    result: InvokedTransaction;
    errors:
      | Errors.INSUFFICIENT_ACCOUNT_BALANCE
      | Errors.INSUFFICIENT_MAX_FEE
      | Errors.INVALID_TRANSACTION_NONCE
      | Errors.VALIDATION_FAILURE
      | Errors.NON_ACCOUNT
      | Errors.DUPLICATE_TX
      | Errors.UNSUPPORTED_TX_VERSION
      | Errors.UNEXPECTED_ERROR;
  };

  // Submit a new class declaration transaction
  starknet_addDeclareTransaction: {
    params: {
      declare_transaction: BROADCASTED_DECLARE_TXN;
    };
    result: DeclaredTransaction;
    errors:
      | Errors.CLASS_ALREADY_DECLARED
      | Errors.COMPILATION_FAILED
      | Errors.COMPILED_CLASS_HASH_MISMATCH
      | Errors.INSUFFICIENT_ACCOUNT_BALANCE
      | Errors.INSUFFICIENT_MAX_FEE
      | Errors.INVALID_TRANSACTION_NONCE
      | Errors.VALIDATION_FAILURE
      | Errors.NON_ACCOUNT
      | Errors.DUPLICATE_TX
      | Errors.CONTRACT_CLASS_SIZE_IS_TOO_LARGE
      | Errors.UNSUPPORTED_TX_VERSION
      | Errors.UNSUPPORTED_CONTRACT_CLASS_VERSION
      | Errors.UNEXPECTED_ERROR;
  };

  // Submit a new deploy account transaction
  starknet_addDeployAccountTransaction: {
    params: {
      deploy_account_transaction: BROADCASTED_DEPLOY_ACCOUNT_TXN;
    };
    result: DeployedAccountTransaction;
    errors:
      | Errors.INSUFFICIENT_ACCOUNT_BALANCE
      | Errors.INSUFFICIENT_MAX_FEE
      | Errors.INVALID_TRANSACTION_NONCE
      | Errors.VALIDATION_FAILURE
      | Errors.NON_ACCOUNT
      | Errors.CLASS_HASH_NOT_FOUND
      | Errors.DUPLICATE_TX
      | Errors.UNSUPPORTED_TX_VERSION
      | Errors.UNEXPECTED_ERROR;
  };
};

type TraceMethods = {
  // For a given executed transaction, return the trace of its execution, including internal calls
  starknet_traceTransaction: {
    params: { transaction_hash: TXN_HASH };
    result: TransactionTrace;
    errors: Errors.TXN_HASH_NOT_FOUND | Errors.NO_TRACE_AVAILABLE;
  };

  // Returns the execution traces of all transactions included in the given block
  starknet_traceBlockTransactions: {
    params: { block_id: BLOCK_ID };
    result: BlockTransactionsTraces;
    errors: Errors.BLOCK_NOT_FOUND;
  };

  // Simulate a given sequence of transactions on the requested state, and generate the execution traces. If one of the transactions is reverted, raises CONTRACT_ERROR
  starknet_simulateTransactions: {
    params: {
      block_id: BLOCK_ID;
      transactions: Array<BROADCASTED_TXN>;
      simulation_flags: Array<SIMULATION_FLAG>;
    };
    result: SimulateTransactionResponse;
    errors: Errors.BLOCK_NOT_FOUND | Errors.TRANSACTION_EXECUTION_ERROR;
  };
};
