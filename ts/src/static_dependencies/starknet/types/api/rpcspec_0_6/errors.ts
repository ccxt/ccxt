export interface FAILED_TO_RECEIVE_TXN {
  code: 1;
  message: 'Failed to write transaction';
}

export interface NO_TRACE_AVAILABLE {
  code: 10;
  message: 'No trace available for transaction';
  data: {
    status: 'RECEIVED' | 'REJECTED';
  };
}

export interface CONTRACT_NOT_FOUND {
  code: 20;
  message: 'Contract not found';
}

export interface INVALID_MESSAGE_SELECTOR {
  code: 21;
  message: 'Invalid message selector';
}

export interface INVALID_CALL_DATA {
  code: 22;
  message: 'Invalid call data';
}

export interface BLOCK_NOT_FOUND {
  code: 24;
  message: 'Block not found';
}

export interface INVALID_BLOCK_HASH {
  code: 26;
  message: 'Invalid block hash';
}

export interface INVALID_TXN_INDEX {
  code: 27;
  message: 'Invalid transaction index in a block';
}

export interface CLASS_HASH_NOT_FOUND {
  code: 28;
  message: 'Class hash not found';
}

export interface TXN_HASH_NOT_FOUND {
  code: 29;
  message: 'Transaction hash not found';
}

export interface PAGE_SIZE_TOO_BIG {
  code: 31;
  message: 'Requested page size is too big';
}

export interface NO_BLOCKS {
  code: 32;
  message: 'There are no blocks';
}

export interface INVALID_CONTINUATION_TOKEN {
  code: 33;
  message: 'The supplied continuation token is invalid or unknown';
}

export interface TOO_MANY_KEYS_IN_FILTER {
  code: 34;
  message: 'Too many keys provided in a filter';
}

export interface CONTRACT_ERROR {
  code: 40;
  message: 'Contract error';
  data: {
    revert_error: string;
  };
}

export interface TRANSACTION_EXECUTION_ERROR {
  code: 41;
  message: 'Transaction execution error';
  data: {
    transaction_index: number;
    execution_error: string;
  };
}

export interface CLASS_ALREADY_DECLARED {
  code: 51;
  message: 'Class already declared';
}

export interface INVALID_TRANSACTION_NONCE {
  code: 52;
  message: 'Invalid transaction nonce';
}

export interface INSUFFICIENT_MAX_FEE {
  code: 53;
  message: 'Max fee is smaller than the minimal transaction cost (validation plus fee transfer)';
}

export interface INSUFFICIENT_ACCOUNT_BALANCE {
  code: 54;
  message: "Account balance is smaller than the transaction's max_fee";
}

export interface VALIDATION_FAILURE {
  code: 55;
  message: 'Account validation failed';
  data: string;
}

export interface COMPILATION_FAILED {
  code: 56;
  message: 'Compilation failed';
}

export interface CONTRACT_CLASS_SIZE_IS_TOO_LARGE {
  code: 57;
  message: 'Contract class size it too large';
}

export interface NON_ACCOUNT {
  code: 58;
  message: 'Sender address in not an account contract';
}

export interface DUPLICATE_TX {
  code: 59;
  message: 'A transaction with the same hash already exists in the mempool';
}

export interface COMPILED_CLASS_HASH_MISMATCH {
  code: 60;
  message: 'the compiled class hash did not match the one supplied in the transaction';
}

export interface UNSUPPORTED_TX_VERSION {
  code: 61;
  message: 'the transaction version is not supported';
}

export interface UNSUPPORTED_CONTRACT_CLASS_VERSION {
  code: 62;
  message: 'the contract class version is not supported';
}

export interface UNEXPECTED_ERROR {
  code: 63;
  message: 'An unexpected error occurred';
  data: string;
}
