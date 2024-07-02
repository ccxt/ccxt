/**
 * PRIMITIVES
 */

/**
 * A field element. represented by at most 63 hex digits
 * @pattern ^0x(0|[a-fA-F1-9]{1}[a-fA-F0-9]{0,62})$
 */
export type FELT = string;
/**
 * an ethereum address represented as 40 hex digits
 * @pattern ^0x[a-fA-F0-9]{40}$
 */
export type ETH_ADDRESS = string;
/**
 * A storage key. Represented as up to 62 hex digits, 3 bits, and 5 leading zeroes.
 * @pattern ^0x0[0-7]{1}[a-fA-F0-9]{0,62}$
 */
export type STORAGE_KEY = string;
export type ADDRESS = FELT;
export type NUM_AS_HEX = string;
/**
 * 64 bit integers, represented by hex string of length at most 16
 * "pattern": "^0x(0|[a-fA-F1-9]{1}[a-fA-F0-9]{0,15})$"
 */
export type u64 = string;
/**
 * 64 bit integers, represented by hex string of length at most 32
 * "pattern": "^0x(0|[a-fA-F1-9]{1}[a-fA-F0-9]{0,31})$"
 */
export type u128 = string;
export type SIGNATURE = Array<FELT>;
export type BLOCK_NUMBER = number;
export type BLOCK_HASH = FELT;
export type TXN_HASH = FELT;
export type CHAIN_ID = NUM_AS_HEX;
export type STRUCT_ABI_TYPE = 'struct';
export type EVENT_ABI_TYPE = 'event';
export type FUNCTION_ABI_TYPE = 'function' | 'l1_handler' | 'constructor';
// Represents the type of an entry point.
export type ENTRY_POINT_TYPE = 'EXTERNAL' | 'L1_HANDLER' | 'CONSTRUCTOR';
// Represents the type of a function call.
export type CALL_TYPE = 'DELEGATE' | 'LIBRARY_CALL' | 'CALL';
// Represents the status of the transaction
export type TXN_STATUS = 'RECEIVED' | 'REJECTED' | 'ACCEPTED_ON_L2' | 'ACCEPTED_ON_L1';
// Flags that indicate how to simulate a given transaction. By default, the sequencer behavior is replicated locally (enough funds are expected to be in the account, and the fee will be deducted from the balance before the simulation of the next transaction). To skip the fee charge, use the SKIP_FEE_CHARGE flag.
export type SIMULATION_FLAG = 'SKIP_VALIDATE' | 'SKIP_FEE_CHARGE';
// Data availability mode
export type DA_MODE = 'L1' | 'L2';
export type TXN_TYPE = 'DECLARE' | 'DEPLOY' | 'DEPLOY_ACCOUNT' | 'INVOKE' | 'L1_HANDLER';
export type TXN_FINALITY_STATUS = 'ACCEPTED_ON_L2' | 'ACCEPTED_ON_L1';
export type TXN_EXECUTION_STATUS = 'SUCCEEDED' | 'REVERTED';
export type BLOCK_STATUS = 'PENDING' | 'ACCEPTED_ON_L2' | 'ACCEPTED_ON_L1' | 'REJECTED';
export type BLOCK_TAG = 'latest' | 'pending';

/**
 * READ API
 */

export type EVENTS_CHUNK = {
  // Returns matching events
  events: EMITTED_EVENT[];
  // Use this token in a subsequent query to obtain the next page. Should not appear if there are no more pages.
  continuation_token?: string;
};

export type RESULT_PAGE_REQUEST = {
  // The token returned from the previous query. If no token is provided the first page is returned.
  continuation_token?: string;
  // Chunk size
  chunk_size: number;
};

export type EMITTED_EVENT = EVENT & {
  block_hash: BLOCK_HASH;
  block_number: BLOCK_NUMBER;
  transaction_hash: TXN_HASH;
};

export type EVENT = {
  from_address: ADDRESS;
} & EVENT_CONTENT;

export type EVENT_CONTENT = {
  keys: FELT[];
  data: FELT[];
};

export type EVENT_FILTER = {
  from_block?: BLOCK_ID;
  to_block?: BLOCK_ID;
  address?: ADDRESS;
  keys?: FELT[][];
};

export type BLOCK_ID =
  | {
      block_hash?: BLOCK_HASH;
      block_number?: BLOCK_NUMBER;
    }
  | BLOCK_TAG;

export type SYNC_STATUS = {
  starting_block_hash: BLOCK_HASH;
  starting_block_num: BLOCK_NUMBER;
  current_block_hash: BLOCK_HASH;
  current_block_num: BLOCK_NUMBER;
  highest_block_hash: BLOCK_HASH;
  highest_block_num: BLOCK_NUMBER;
};

export type NEW_CLASSES = {
  class_hash: FELT;
  compiled_class_hash: FELT;
};

export type REPLACED_CLASS = {
  class_hash: FELT;
  contract_address: FELT;
};

export type NONCE_UPDATE = {
  contract_address: ADDRESS;
  nonce: FELT;
};

export type STATE_DIFF = {
  storage_diffs: CONTRACT_STORAGE_DIFF_ITEM[];
  deprecated_declared_classes: FELT[];
  declared_classes: NEW_CLASSES[];
  deployed_contracts: DEPLOYED_CONTRACT_ITEM[];
  replaced_classes: REPLACED_CLASS[];
  nonces: NONCE_UPDATE[];
};

export type PENDING_STATE_UPDATE = {
  old_root: FELT;
  state_diff: STATE_DIFF;
  block_hash: never; // diverge: this makes it distinct
};

export type STATE_UPDATE = {
  block_hash: BLOCK_HASH;
  old_root: FELT;
  new_root: FELT;
  state_diff: STATE_DIFF;
};

export type BLOCK_BODY_WITH_TX_HASHES = {
  transactions: TXN_HASH[];
};

export type BLOCK_BODY_WITH_TXS = {
  transactions: (TXN & {
    transaction_hash: TXN_HASH;
  })[];
};

export type BLOCK_HEADER = {
  block_hash: BLOCK_HASH;
  parent_hash: BLOCK_HASH;
  block_number: BLOCK_NUMBER;
  new_root: FELT;
  timestamp: number;
  sequencer_address: FELT;
  l1_gas_price: RESOURCE_PRICE;
  starknet_version: string;
};

export type PENDING_BLOCK_HEADER = {
  parent_hash: BLOCK_HASH;
  timestamp: number;
  sequencer_address: FELT;
  l1_gas_price: RESOURCE_PRICE;
  starknet_version: string;
};

export type BLOCK_WITH_TX_HASHES = { status: BLOCK_STATUS } & BLOCK_HEADER &
  BLOCK_BODY_WITH_TX_HASHES;

export type BLOCK_WITH_TXS = { status: BLOCK_STATUS } & BLOCK_HEADER & BLOCK_BODY_WITH_TXS;

export type PENDING_BLOCK_WITH_TX_HASHES = BLOCK_BODY_WITH_TX_HASHES & PENDING_BLOCK_HEADER;

export type PENDING_BLOCK_WITH_TXS = BLOCK_BODY_WITH_TXS & PENDING_BLOCK_HEADER;

export type DEPLOYED_CONTRACT_ITEM = {
  address: FELT;
  class_hash: FELT;
};

export type CONTRACT_STORAGE_DIFF_ITEM = {
  // The contract address for which the storage changed (in FELT format)
  address: string;
  // The changes in the storage of the contract
  storage_entries: StorageDiffItem[];
};

export type StorageDiffItem = {
  // The key of the changed value (in FELT format)
  key: string;
  // The new value applied to the given address (in FELT format)
  value: string;
};

export type TXN = INVOKE_TXN | L1_HANDLER_TXN | DECLARE_TXN | DEPLOY_TXN | DEPLOY_ACCOUNT_TXN;

export type DECLARE_TXN = DECLARE_TXN_V0 | DECLARE_TXN_V1 | DECLARE_TXN_V2 | DECLARE_TXN_V3;

export type DECLARE_TXN_V0 = {
  type: 'DECLARE';
  sender_address: ADDRESS;
  max_fee: FELT;
  version: '0x0' | '0x100000000000000000000000000000000';
  signature: SIGNATURE;
  class_hash: FELT;
};

export type DECLARE_TXN_V1 = {
  type: 'DECLARE';
  sender_address: ADDRESS;
  max_fee: FELT;
  version: '0x1' | '0x100000000000000000000000000000001';
  signature: SIGNATURE;
  nonce: FELT;
  class_hash: FELT;
};

export type DECLARE_TXN_V2 = {
  type: 'DECLARE';
  sender_address: ADDRESS;
  compiled_class_hash: FELT;
  max_fee: FELT;
  version: '0x2' | '0x100000000000000000000000000000002';
  signature: SIGNATURE;
  nonce: FELT;
  class_hash: FELT;
};

export type DECLARE_TXN_V3 = {
  type: 'DECLARE';
  sender_address: ADDRESS;
  compiled_class_hash: FELT;
  version: '0x3' | '0x100000000000000000000000000000003';
  signature: SIGNATURE;
  nonce: FELT;
  class_hash: FELT;
  // new...
  resource_bounds: RESOURCE_BOUNDS_MAPPING;
  tip: u64;
  paymaster_data: FELT[];
  account_deployment_data: FELT[];
  nonce_data_availability_mode: DA_MODE;
  fee_data_availability_mode: DA_MODE;
};

export type BROADCASTED_TXN =
  | BROADCASTED_INVOKE_TXN
  | BROADCASTED_DECLARE_TXN
  | BROADCASTED_DEPLOY_ACCOUNT_TXN;

export type BROADCASTED_INVOKE_TXN = INVOKE_TXN;

export type BROADCASTED_DEPLOY_ACCOUNT_TXN = DEPLOY_ACCOUNT_TXN;

export type BROADCASTED_DECLARE_TXN =
  | BROADCASTED_DECLARE_TXN_V1
  | BROADCASTED_DECLARE_TXN_V2
  | BROADCASTED_DECLARE_TXN_V3;

export type BROADCASTED_DECLARE_TXN_V1 = {
  type: 'DECLARE';
  sender_address: ADDRESS;
  max_fee: FELT;
  // todo: check if working, prev i fixed it with NUM_AS_HEX
  version: '0x1' | '0x100000000000000000000000000000001';
  signature: SIGNATURE;
  nonce: FELT;
  contract_class: DEPRECATED_CONTRACT_CLASS;
};

export type BROADCASTED_DECLARE_TXN_V2 = {
  type: 'DECLARE';
  sender_address: ADDRESS;
  compiled_class_hash: FELT;
  max_fee: FELT;
  version: '0x2' | '0x100000000000000000000000000000002';
  signature: SIGNATURE;
  nonce: FELT;
  contract_class: CONTRACT_CLASS;
};

export type BROADCASTED_DECLARE_TXN_V3 = {
  type: 'DECLARE';
  sender_address: ADDRESS;
  compiled_class_hash: FELT;
  version: '0x3' | '0x100000000000000000000000000000003';
  signature: SIGNATURE;
  nonce: FELT;
  contract_class: CONTRACT_CLASS;
  // new...
  resource_bounds: RESOURCE_BOUNDS_MAPPING;
  tip: u64;
  paymaster_data: FELT[];
  account_deployment_data: FELT[];
  nonce_data_availability_mode: DA_MODE;
  fee_data_availability_mode: DA_MODE;
};

export type DEPLOY_ACCOUNT_TXN = DEPLOY_ACCOUNT_TXN_V1 | DEPLOY_ACCOUNT_TXN_V3;

export type DEPLOY_ACCOUNT_TXN_V1 = {
  type: 'DEPLOY_ACCOUNT';
  max_fee: FELT;
  version: '0x1' | '0x100000000000000000000000000000001';
  signature: SIGNATURE;
  nonce: FELT;
  contract_address_salt: FELT;
  constructor_calldata: FELT[];
  class_hash: FELT;
};

export type DEPLOY_ACCOUNT_TXN_V3 = {
  type: 'DEPLOY_ACCOUNT';
  version: '0x3' | '0x100000000000000000000000000000003';
  signature: SIGNATURE;
  nonce: FELT;
  contract_address_salt: FELT;
  constructor_calldata: FELT[];
  class_hash: FELT;
  resource_bounds: RESOURCE_BOUNDS_MAPPING;
  tip: u64;
  paymaster_data: FELT[];
  nonce_data_availability_mode: DA_MODE;
  fee_data_availability_mode: DA_MODE;
};

export type DEPLOY_TXN = {
  type: 'DEPLOY';
  version: FELT;
  contract_address_salt: FELT;
  constructor_calldata: FELT[];
  class_hash: FELT;
};

export type INVOKE_TXN = INVOKE_TXN_V0 | INVOKE_TXN_V1 | INVOKE_TXN_V3;

export type INVOKE_TXN_V0 = {
  type: 'INVOKE';
  max_fee: FELT;
  version: '0x0' | '0x100000000000000000000000000000000';
  signature: SIGNATURE;
  contract_address: ADDRESS;
  entry_point_selector: FELT;
  calldata: FELT[];
};

export type INVOKE_TXN_V1 = {
  type: 'INVOKE';
  sender_address: ADDRESS;
  calldata: FELT[];
  max_fee: FELT;
  version: '0x1' | '0x100000000000000000000000000000001';
  signature: SIGNATURE;
  nonce: FELT;
};

export type INVOKE_TXN_V3 = {
  type: 'INVOKE';
  sender_address: ADDRESS;
  calldata: FELT[];
  version: '0x3' | '0x100000000000000000000000000000003';
  signature: SIGNATURE;
  nonce: FELT;
  resource_bounds: RESOURCE_BOUNDS_MAPPING;
  tip: u64;
  paymaster_data: FELT[];
  account_deployment_data: FELT[];
  nonce_data_availability_mode: DA_MODE;
  fee_data_availability_mode: DA_MODE;
};

export type L1_HANDLER_TXN = {
  version: FELT;
  type: 'L1_HANDLER';
  nonce: NUM_AS_HEX;
} & FUNCTION_CALL;

export type COMMON_RECEIPT_PROPERTIES = {
  transaction_hash: TXN_HASH;
  actual_fee: FEE_PAYMENT;
  execution_status: TXN_EXECUTION_STATUS;
  finality_status: TXN_FINALITY_STATUS;
  block_hash: BLOCK_HASH;
  block_number: BLOCK_NUMBER;
  messages_sent: MSG_TO_L1[];
  revert_reason?: string;
  events: EVENT[];
  execution_resources: EXECUTION_RESOURCES;
};

export type PENDING_COMMON_RECEIPT_PROPERTIES = {
  transaction_hash: TXN_HASH;
  actual_fee: FEE_PAYMENT;
  messages_sent: MSG_TO_L1[];
  events: EVENT[];
  revert_reason?: string;
  finality_status: 'ACCEPTED_ON_L2';
  execution_status: TXN_EXECUTION_STATUS;
  execution_resources: EXECUTION_RESOURCES;
};

export type INVOKE_TXN_RECEIPT = {
  type: 'INVOKE';
} & COMMON_RECEIPT_PROPERTIES;

export type PENDING_INVOKE_TXN_RECEIPT = {
  type: 'INVOKE';
} & PENDING_COMMON_RECEIPT_PROPERTIES;

export type DECLARE_TXN_RECEIPT = {
  type: 'DECLARE';
} & COMMON_RECEIPT_PROPERTIES;

export type PENDING_DECLARE_TXN_RECEIPT = {
  type: 'DECLARE';
} & PENDING_COMMON_RECEIPT_PROPERTIES;

export type DEPLOY_ACCOUNT_TXN_RECEIPT = {
  type: 'DEPLOY_ACCOUNT';
  contract_address: FELT;
} & COMMON_RECEIPT_PROPERTIES;

export type PENDING_DEPLOY_ACCOUNT_TXN_RECEIPT = {
  type: 'DEPLOY_ACCOUNT';
  contract_address: FELT;
} & PENDING_COMMON_RECEIPT_PROPERTIES;

export type DEPLOY_TXN_RECEIPT = {
  type: 'DEPLOY';
  contract_address: FELT;
} & COMMON_RECEIPT_PROPERTIES;

export type L1_HANDLER_TXN_RECEIPT = {
  type: 'L1_HANDLER';
  message_hash: NUM_AS_HEX;
} & COMMON_RECEIPT_PROPERTIES;

export type PENDING_L1_HANDLER_TXN_RECEIPT = {
  type: 'L1_HANDLER';
  message_hash: NUM_AS_HEX;
} & PENDING_COMMON_RECEIPT_PROPERTIES;

export type TXN_RECEIPT =
  | INVOKE_TXN_RECEIPT
  | L1_HANDLER_TXN_RECEIPT
  | DECLARE_TXN_RECEIPT
  | DEPLOY_TXN_RECEIPT
  | DEPLOY_ACCOUNT_TXN_RECEIPT;

export type PENDING_TXN_RECEIPT =
  | PENDING_INVOKE_TXN_RECEIPT
  | PENDING_L1_HANDLER_TXN_RECEIPT
  | PENDING_DECLARE_TXN_RECEIPT
  | PENDING_DEPLOY_ACCOUNT_TXN_RECEIPT;

export type MSG_TO_L1 = {
  from_address: FELT;
  to_address: FELT;
  payload: FELT[];
};

export type MSG_FROM_L1 = {
  from_address: ETH_ADDRESS;
  to_address: ADDRESS;
  entry_point_selector: FELT;
  payload: FELT[];
};

export type FUNCTION_CALL = {
  contract_address: ADDRESS;
  entry_point_selector: FELT;
  calldata: FELT[];
};

export type CONTRACT_CLASS = {
  sierra_program: FELT[];
  contract_class_version: string;
  entry_points_by_type: {
    CONSTRUCTOR: SIERRA_ENTRY_POINT[];
    EXTERNAL: SIERRA_ENTRY_POINT[];
    L1_HANDLER: SIERRA_ENTRY_POINT[];
  };
  abi: string;
};

export type DEPRECATED_CONTRACT_CLASS = {
  program: string;
  entry_points_by_type: {
    CONSTRUCTOR: DEPRECATED_CAIRO_ENTRY_POINT[];
    EXTERNAL: DEPRECATED_CAIRO_ENTRY_POINT[];
    L1_HANDLER: DEPRECATED_CAIRO_ENTRY_POINT[];
  };
  abi: CONTRACT_ABI;
};

export type DEPRECATED_CAIRO_ENTRY_POINT = {
  offset: NUM_AS_HEX | number;
  selector: FELT;
};

export type SIERRA_ENTRY_POINT = {
  selector: FELT;
  function_idx: number;
};

export type CONTRACT_ABI = readonly CONTRACT_ABI_ENTRY[];

export type CONTRACT_ABI_ENTRY = {
  selector: FELT;
  input: string;
  output: string;
};

export type STRUCT_ABI_ENTRY = {
  type: STRUCT_ABI_TYPE;
  name: string;
  size: number;
  members: STRUCT_MEMBER[];
};

export type STRUCT_MEMBER = TYPED_PARAMETER & {
  offset: number;
};

export type EVENT_ABI_ENTRY = {
  type: EVENT_ABI_TYPE;
  name: string;
  keys: TYPED_PARAMETER[];
  data: TYPED_PARAMETER[];
};

export type FUNCTION_STATE_MUTABILITY = 'view';

export type FUNCTION_ABI_ENTRY = {
  type: FUNCTION_ABI_TYPE;
  name: string;
  inputs: TYPED_PARAMETER[];
  outputs: TYPED_PARAMETER[];
  stateMutability: FUNCTION_STATE_MUTABILITY;
};

export type TYPED_PARAMETER = {
  name: string;
  type: string;
};

export type SIMULATION_FLAG_FOR_ESTIMATE_FEE = 'SKIP_VALIDATE';
export type PRICE_UNIT = 'WEI' | 'FRI';

export type FEE_ESTIMATE = {
  gas_consumed: FELT;
  gas_price: FELT;
  overall_fee: FELT;
  unit: PRICE_UNIT;
};

export type FEE_PAYMENT = {
  amount: FELT;
  unit: PRICE_UNIT;
};

export type RESOURCE_BOUNDS_MAPPING = {
  l1_gas: RESOURCE_BOUNDS;
  l2_gas: RESOURCE_BOUNDS;
};

export type RESOURCE_BOUNDS = {
  max_amount: u64;
  max_price_per_unit: u128;
};

export type RESOURCE_PRICE = {
  price_in_fri: FELT;
  price_in_wei: FELT;
};

export type EXECUTION_RESOURCES = {
  steps: number;
  memory_holes?: number;
  range_check_builtin_applications?: number;
  pedersen_builtin_applications?: number;
  poseidon_builtin_applications?: number;
  ec_op_builtin_applications?: number;
  ecdsa_builtin_applications?: number;
  bitwise_builtin_applications?: number;
  keccak_builtin_applications?: number;
  segment_arena_builtin?: number;
};

/**
 * TRACE API
 */

// Represents a transaction trace including the execution details.
export type TRANSACTION_TRACE = {
  invoke_tx_trace?: INVOKE_TXN_TRACE;
  declare_tx_trace?: DECLARE_TXN_TRACE;
  deploy_account_tx_trace?: DEPLOY_ACCOUNT_TXN_TRACE;
  l1_handler_tx_trace?: L1_HANDLER_TXN_TRACE;
};

// Represents a transaction trace for an invoke transaction.
export type INVOKE_TXN_TRACE = {
  type: 'INVOKE';
  execute_invocation: FUNCTION_INVOCATION | { revert_reason: string };
  validate_invocation?: FUNCTION_INVOCATION;
  fee_transfer_invocation?: FUNCTION_INVOCATION;
  state_diff?: STATE_DIFF;
};

// Represents a transaction trace for a declare transaction.
export type DECLARE_TXN_TRACE = {
  type: 'DECLARE';
  validate_invocation?: FUNCTION_INVOCATION;
  fee_transfer_invocation?: FUNCTION_INVOCATION;
  state_diff?: STATE_DIFF;
};

// Represents a transaction trace for a deploy account transaction.
export type DEPLOY_ACCOUNT_TXN_TRACE = {
  type: 'DEPLOY_ACCOUNT';
  constructor_invocation: FUNCTION_INVOCATION;
  validate_invocation?: FUNCTION_INVOCATION;
  fee_transfer_invocation?: FUNCTION_INVOCATION;
  state_diff?: STATE_DIFF;
};

// Represents a transaction trace for an L1 handler transaction.
export type L1_HANDLER_TXN_TRACE = {
  type: 'L1_HANDLER';
  function_invocation: FUNCTION_INVOCATION;
  state_diff?: STATE_DIFF;
};

// Represents a nested function call.
export type NESTED_CALL = FUNCTION_INVOCATION;

// Represents a function invocation along with its execution details.
export type FUNCTION_INVOCATION = FUNCTION_CALL & {
  caller_address: string;
  class_hash: string;
  entry_point_type: ENTRY_POINT_TYPE;
  call_type: CALL_TYPE;
  result: string[];
  calls: NESTED_CALL[];
  events: ORDERED_EVENT[];
  messages: ORDERED_MESSAGE[];
  execution_resources: EXECUTION_RESOURCES;
};

// Represents an ordered event alongside its order within the transaction.
export type ORDERED_EVENT = {
  order: number;
  event: EVENT;
};

// Represents an ordered message alongside its order within the transaction.
export type ORDERED_MESSAGE = {
  order: number;
  message: MSG_TO_L1;
};
