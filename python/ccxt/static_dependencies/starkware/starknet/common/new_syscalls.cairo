from starkware.cairo.common.cairo_secp.ec import EcPoint
from starkware.cairo.common.uint256 import Uint256

// Syscall selectors.

const CALL_CONTRACT_SELECTOR = 'CallContract';
const DEPLOY_SELECTOR = 'Deploy';
const EMIT_EVENT_SELECTOR = 'EmitEvent';
const GET_BLOCK_HASH_SELECTOR = 'GetBlockHash';
const GET_EXECUTION_INFO_SELECTOR = 'GetExecutionInfo';
const SECP256K1_ADD_SELECTOR = 'Secp256k1Add';
const SECP256K1_GET_POINT_FROM_X_SELECTOR = 'Secp256k1GetPointFromX';
const SECP256K1_GET_XY_SELECTOR = 'Secp256k1GetXy';
const SECP256K1_MUL_SELECTOR = 'Secp256k1Mul';
const SECP256K1_NEW_SELECTOR = 'Secp256k1New';
const SECP256R1_ADD_SELECTOR = 'Secp256r1Add';
const SECP256R1_GET_POINT_FROM_X_SELECTOR = 'Secp256r1GetPointFromX';
const SECP256R1_GET_XY_SELECTOR = 'Secp256r1GetXy';
const SECP256R1_MUL_SELECTOR = 'Secp256r1Mul';
const SECP256R1_NEW_SELECTOR = 'Secp256r1New';
const KECCAK_SELECTOR = 'Keccak';
const LIBRARY_CALL_SELECTOR = 'LibraryCall';
const REPLACE_CLASS_SELECTOR = 'ReplaceClass';
const SEND_MESSAGE_TO_L1_SELECTOR = 'SendMessageToL1';
const STORAGE_READ_SELECTOR = 'StorageRead';
const STORAGE_WRITE_SELECTOR = 'StorageWrite';

// Syscall structs.

struct ExecutionInfo {
    block_info: BlockInfo*,
    tx_info: TxInfo*,

    // Entry-point-specific info.

    caller_address: felt,
    // The execution is done in the context of the contract at this address.
    // It controls the storage being used, messages sent to L1, calling contracts, etc.
    contract_address: felt,
    // The entry point selector.
    selector: felt,
}

struct BlockInfo {
    block_number: felt,
    block_timestamp: felt,
    // The address of the sequencer that is creating this block.
    sequencer_address: felt,
}

struct ResourceBounds {
    // The name of the resource (e.g., 'L1_GAS').
    resource: felt,
    // The maximum amount of the resource allowed for usage during the execution.
    max_amount: felt,
    // The maximum price the user is willing to pay for the resource unit.
    max_price_per_unit: felt,
}

struct TxInfo {
    // The version of the transaction. It is fixed in the OS, and should be signed by the account
    // contract.
    // This field allows invalidating old transactions, whenever the meaning of the other
    // transaction fields is changed (in the OS).
    version: felt,
    // The account contract from which this transaction originates.
    account_contract_address: felt,
    // The max_fee field of the transaction.
    max_fee: felt,
    // The signature of the transaction.
    signature_start: felt*,
    signature_end: felt*,
    // The hash of the transaction.
    transaction_hash: felt,
    // The identifier of the chain.
    // This field can be used to prevent replay of testnet transactions on mainnet.
    chain_id: felt,
    // The transaction's nonce.
    nonce: felt,
    // An array of ResourceBounds structs.
    resource_bounds_start: ResourceBounds*,
    resource_bounds_end: ResourceBounds*,
    // The tip.
    tip: felt,
    // If specified, the paymaster should pay for the execution of the tx.
    // The data includes the address of the paymaster sponsoring the transaction, followed by extra
    // data to send to the paymaster.
    paymaster_data_start: felt*,
    paymaster_data_end: felt*,
    // The data availability mode for the nonce.
    nonce_data_availability_mode: felt,
    // The data availability mode for the account balance from which fee will be taken.
    fee_data_availability_mode: felt,
    // If nonempty, will contain the required data for deploying and initializing an account
    // contract: its class hash, address salt and constructor calldata.
    account_deployment_data_start: felt*,
    account_deployment_data_end: felt*,
}

// Shared attributes.

struct RequestHeader {
    // The syscall selector.
    selector: felt,
    // The amount of gas left before the syscall execution.
    gas: felt,
}

struct ResponseHeader {
    // The amount of gas left after the syscall execution.
    gas: felt,
    // 0 if the syscall succeeded; 1 otherwise.
    failure_flag: felt,
}

struct FailureReason {
    start: felt*,
    end: felt*,
}

// Syscall requests.

struct CallContractRequest {
    // The address of the L2 contract to call.
    contract_address: felt,
    // The selector of the function to call.
    selector: felt,
    // The calldata.
    calldata_start: felt*,
    calldata_end: felt*,
}

struct LibraryCallRequest {
    // The hash of the class to run.
    class_hash: felt,
    // The selector of the function to call.
    selector: felt,
    // The calldata.
    calldata_start: felt*,
    calldata_end: felt*,
}

struct EmptyRequest {
}

struct DeployRequest {
    // The hash of the class to deploy.
    class_hash: felt,
    // A salt for the new contract address calculation.
    contract_address_salt: felt,
    // The calldata for the constructor.
    constructor_calldata_start: felt*,
    constructor_calldata_end: felt*,
    // Used for deterministic contract address deployment.
    deploy_from_zero: felt,
}

struct GetBlockHashRequest {
    // The number of the block to get the hash for.
    block_number: felt,
}

struct KeccakRequest {
    // The Span<u64> to be hashed.
    // See `keccak_padded_input` for more details.
    input_start: felt*,
    input_end: felt*,
}

struct SecpAddRequest {
    p0: EcPoint*,
    p1: EcPoint*,
}

using Secp256k1AddRequest = SecpAddRequest;
using Secp256r1AddRequest = SecpAddRequest;

struct SecpMulRequest {
    p: EcPoint*,
    scalar: Uint256,
}

using Secp256k1MulRequest = SecpMulRequest;
using Secp256r1MulRequest = SecpMulRequest;

struct SecpNewRequest {
    // The x and y coordinates of the requested point on the Secp curve.
    // The point at infinity, can be created by passing (0, 0).
    x: Uint256,
    y: Uint256,
}

using Secp256k1NewRequest = SecpNewRequest;
using Secp256r1NewRequest = SecpNewRequest;

struct SecpGetPointFromXRequest {
    x: Uint256,
    y_parity: felt,
}

using Secp256k1GetPointFromXRequest = SecpGetPointFromXRequest;
using Secp256r1GetPointFromXRequest = SecpGetPointFromXRequest;

struct SecpGetXyRequest {
    // A pointer to the point.
    ec_point: EcPoint*,
}

using Secp256k1GetXyRequest = SecpGetXyRequest;
using Secp256r1GetXyRequest = SecpGetXyRequest;

struct StorageReadRequest {
    reserved: felt,
    key: felt,
}

struct StorageWriteRequest {
    reserved: felt,
    key: felt,
    value: felt,
}

struct EmitEventRequest {
    keys_start: felt*,
    keys_end: felt*,
    data_start: felt*,
    data_end: felt*,
}

struct ReplaceClassRequest {
    class_hash: felt,
}

struct SendMessageToL1Request {
    to_address: felt,
    payload_start: felt*,
    payload_end: felt*,
}

// Syscall responses.

struct CallContractResponse {
    retdata_start: felt*,
    retdata_end: felt*,
}

struct DeployResponse {
    contract_address: felt,
    constructor_retdata_start: felt*,
    constructor_retdata_end: felt*,
}

struct KeccakResponse {
    result_low: felt,
    result_high: felt,
}

struct SecpGetXyResponse {
    // The x and y coordinates of the given point. Returns (0, 0) for the point at infinity.
    x: Uint256,
    y: Uint256,
}

using Secp256k1GetXyResponse = SecpGetXyResponse;
using Secp256r1GetXyResponse = SecpGetXyResponse;

struct SecpNewResponse {
    // The syscall returns `Option<SecpPoint>` which is represented as two felts in memory.

    // 1 if the point is not on the curve, 0 otherwise.
    not_on_curve: felt,
    // A pointer to the point in the case not_on_curve == 0, otherwise 0.
    ec_point: EcPoint*,
}

using Secp256k1NewResponse = SecpNewResponse;
using Secp256r1NewResponse = SecpNewResponse;

struct SecpOpResponse {
    // The result of Secp256k1 or Secp256r1 add or mul operations.
    ec_point: EcPoint*,
}

using Secp256k1AddResponse = SecpOpResponse;
using Secp256k1MulResponse = SecpOpResponse;
using Secp256r1AddResponse = SecpOpResponse;
using Secp256r1MulResponse = SecpOpResponse;

struct StorageReadResponse {
    value: felt,
}

struct GetExecutionInfoResponse {
    execution_info: ExecutionInfo*,
}

struct GetBlockHashResponse {
    block_hash: felt,
}
