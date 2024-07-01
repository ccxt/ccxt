from starkware.cairo.common.dict_access import DictAccess

const SEND_MESSAGE_TO_L1_SELECTOR = 'SendMessageToL1';

// Describes the SendMessageToL1 system call format.
struct SendMessageToL1SysCall {
    selector: felt,
    to_address: felt,
    payload_size: felt,
    payload_ptr: felt*,
}

const CALL_CONTRACT_SELECTOR = 'CallContract';
const DELEGATE_CALL_SELECTOR = 'DelegateCall';
const DELEGATE_L1_HANDLER_SELECTOR = 'DelegateL1Handler';

// Describes the CallContract system call format.
struct CallContractRequest {
    // The system call selector
    // (= CALL_CONTRACT_SELECTOR, DELEGATE_CALL_SELECTOR or DELEGATE_L1_HANDLER_SELECTOR).
    selector: felt,
    // The address of the L2 contract to call.
    contract_address: felt,
    // The selector of the function to call.
    function_selector: felt,
    // The size of the calldata.
    calldata_size: felt,
    // The calldata.
    calldata: felt*,
}

struct CallContractResponse {
    retdata_size: felt,
    retdata: felt*,
}

struct CallContract {
    request: CallContractRequest,
    response: CallContractResponse,
}

func call_contract{syscall_ptr: felt*}(
    contract_address: felt, function_selector: felt, calldata_size: felt, calldata: felt*
) -> (retdata_size: felt, retdata: felt*) {
    let syscall = [cast(syscall_ptr, CallContract*)];
    assert syscall.request = CallContractRequest(
        selector=CALL_CONTRACT_SELECTOR,
        contract_address=contract_address,
        function_selector=function_selector,
        calldata_size=calldata_size,
        calldata=calldata,
    );
    %{ syscall_handler.call_contract(segments=segments, syscall_ptr=ids.syscall_ptr) %}
    let response = syscall.response;

    let syscall_ptr = syscall_ptr + CallContract.SIZE;
    return (retdata_size=response.retdata_size, retdata=response.retdata);
}

const LIBRARY_CALL_SELECTOR = 'LibraryCall';
const LIBRARY_CALL_L1_HANDLER_SELECTOR = 'LibraryCallL1Handler';

// Describes the LibraryCall system call format.
struct LibraryCallRequest {
    // The system library call selector
    // (= LIBRARY_CALL_SELECTOR or LIBRARY_CALL_L1_HANDLER_SELECTOR).
    selector: felt,
    // The hash of the class to run.
    class_hash: felt,
    // The selector of the function to call.
    function_selector: felt,
    // The size of the calldata.
    calldata_size: felt,
    // The calldata.
    calldata: felt*,
}

struct LibraryCall {
    request: LibraryCallRequest,
    response: CallContractResponse,
}

// Performs a library call: Runs an entry point of another contract class
// on the current contract state.
func library_call{syscall_ptr: felt*}(
    class_hash: felt, function_selector: felt, calldata_size: felt, calldata: felt*
) -> (retdata_size: felt, retdata: felt*) {
    let syscall = [cast(syscall_ptr, LibraryCall*)];
    assert syscall.request = LibraryCallRequest(
        selector=LIBRARY_CALL_SELECTOR,
        class_hash=class_hash,
        function_selector=function_selector,
        calldata_size=calldata_size,
        calldata=calldata,
    );
    %{ syscall_handler.library_call(segments=segments, syscall_ptr=ids.syscall_ptr) %}
    let response = syscall.response;

    let syscall_ptr = syscall_ptr + LibraryCall.SIZE;
    return (retdata_size=response.retdata_size, retdata=response.retdata);
}

// Simialr to library_call(), except that the entry point is an L1 handler,
// rather than an external function.
// Note that this function does not consume an L1 message,
// and thus it should only be called from a corresponding L1 handler.
func library_call_l1_handler{syscall_ptr: felt*}(
    class_hash: felt, function_selector: felt, calldata_size: felt, calldata: felt*
) -> (retdata_size: felt, retdata: felt*) {
    let syscall = [cast(syscall_ptr, LibraryCall*)];
    assert syscall.request = LibraryCallRequest(
        selector=LIBRARY_CALL_L1_HANDLER_SELECTOR,
        class_hash=class_hash,
        function_selector=function_selector,
        calldata_size=calldata_size,
        calldata=calldata,
    );
    %{ syscall_handler.library_call_l1_handler(segments=segments, syscall_ptr=ids.syscall_ptr) %}
    let response = syscall.response;

    let syscall_ptr = syscall_ptr + LibraryCall.SIZE;
    return (retdata_size=response.retdata_size, retdata=response.retdata);
}

const DEPLOY_SELECTOR = 'Deploy';

// Describes the Deploy system call format.
struct DeployRequest {
    // The system call selector (= DEPLOY_SELECTOR).
    selector: felt,
    // The hash of the class to deploy.
    class_hash: felt,
    // A salt for the new contract address calculation.
    contract_address_salt: felt,
    // The size of the calldata for the constructor.
    constructor_calldata_size: felt,
    // The calldata for the constructor.
    constructor_calldata: felt*,
    // Used for deterministic contract address deployment.
    deploy_from_zero: felt,
}

struct DeployResponse {
    contract_address: felt,
    constructor_retdata_size: felt,
    constructor_retdata: felt*,
}

struct Deploy {
    request: DeployRequest,
    response: DeployResponse,
}

// Deploys a contract with the given class, and returns its address.
// Fails if a contract with the same parameters was already deployed.
// If 'deploy_from_zero' is 1, the contract address is not affected by the deployer's address.
func deploy{syscall_ptr: felt*}(
    class_hash: felt,
    contract_address_salt: felt,
    constructor_calldata_size: felt,
    constructor_calldata: felt*,
    deploy_from_zero: felt,
) -> (contract_address: felt) {
    let syscall = [cast(syscall_ptr, Deploy*)];
    assert syscall.request = DeployRequest(
        selector=DEPLOY_SELECTOR,
        class_hash=class_hash,
        contract_address_salt=contract_address_salt,
        constructor_calldata_size=constructor_calldata_size,
        constructor_calldata=constructor_calldata,
        deploy_from_zero=deploy_from_zero,
    );

    %{ syscall_handler.deploy(segments=segments, syscall_ptr=ids.syscall_ptr) %}
    let response = syscall.response;
    let syscall_ptr = syscall_ptr + Deploy.SIZE;

    return (contract_address=response.contract_address);
}

const GET_CALLER_ADDRESS_SELECTOR = 'GetCallerAddress';

// Describes the GetCallerAddress system call format.
struct GetCallerAddressRequest {
    // The system call selector (= GET_CALLER_ADDRESS_SELECTOR).
    selector: felt,
}

struct GetCallerAddressResponse {
    caller_address: felt,
}

struct GetCallerAddress {
    request: GetCallerAddressRequest,
    response: GetCallerAddressResponse,
}

// Returns the address of the calling contract or 0 if this transaction was not initiated by another
// contract.
func get_caller_address{syscall_ptr: felt*}() -> (caller_address: felt) {
    let syscall = [cast(syscall_ptr, GetCallerAddress*)];
    assert syscall.request = GetCallerAddressRequest(selector=GET_CALLER_ADDRESS_SELECTOR);
    %{ syscall_handler.get_caller_address(segments=segments, syscall_ptr=ids.syscall_ptr) %}
    let syscall_ptr = syscall_ptr + GetCallerAddress.SIZE;
    return (caller_address=syscall.response.caller_address);
}

const GET_SEQUENCER_ADDRESS_SELECTOR = 'GetSequencerAddress';

// Describes the GetSequencerAddress system call format.
struct GetSequencerAddressRequest {
    // The system call selector (= GET_SEQUENCER_ADDRESS_SELECTOR).
    selector: felt,
}

struct GetSequencerAddressResponse {
    sequencer_address: felt,
}

struct GetSequencerAddress {
    request: GetSequencerAddressRequest,
    response: GetSequencerAddressResponse,
}

// Returns the address of the sequencer contract.
func get_sequencer_address{syscall_ptr: felt*}() -> (sequencer_address: felt) {
    let syscall = [cast(syscall_ptr, GetSequencerAddress*)];
    assert syscall.request = GetSequencerAddressRequest(selector=GET_SEQUENCER_ADDRESS_SELECTOR);
    %{ syscall_handler.get_sequencer_address(segments=segments, syscall_ptr=ids.syscall_ptr) %}
    let syscall_ptr = syscall_ptr + GetSequencerAddress.SIZE;
    return (sequencer_address=syscall.response.sequencer_address);
}

const GET_BLOCK_NUMBER_SELECTOR = 'GetBlockNumber';

struct GetBlockNumberRequest {
    selector: felt,
}

struct GetBlockNumberResponse {
    block_number: felt,
}

struct GetBlockNumber {
    request: GetBlockNumberRequest,
    response: GetBlockNumberResponse,
}

func get_block_number{syscall_ptr: felt*}() -> (block_number: felt) {
    let syscall = [cast(syscall_ptr, GetBlockNumber*)];
    assert syscall.request = GetBlockNumberRequest(selector=GET_BLOCK_NUMBER_SELECTOR);
    %{ syscall_handler.get_block_number(segments=segments, syscall_ptr=ids.syscall_ptr) %}
    let syscall_ptr = syscall_ptr + GetBlockNumber.SIZE;
    return (block_number=syscall.response.block_number);
}

const GET_CONTRACT_ADDRESS_SELECTOR = 'GetContractAddress';

// Describes the GetContractAddress system call format.
struct GetContractAddressRequest {
    // The system call selector (= GET_CONTRACT_ADDRESS_SELECTOR).
    selector: felt,
}

struct GetContractAddressResponse {
    contract_address: felt,
}

struct GetContractAddress {
    request: GetContractAddressRequest,
    response: GetContractAddressResponse,
}

func get_contract_address{syscall_ptr: felt*}() -> (contract_address: felt) {
    let syscall = [cast(syscall_ptr, GetContractAddress*)];
    assert syscall.request = GetContractAddressRequest(selector=GET_CONTRACT_ADDRESS_SELECTOR);
    %{ syscall_handler.get_contract_address(segments=segments, syscall_ptr=ids.syscall_ptr) %}
    let syscall_ptr = syscall_ptr + GetContractAddress.SIZE;
    return (contract_address=syscall.response.contract_address);
}

const GET_BLOCK_TIMESTAMP_SELECTOR = 'GetBlockTimestamp';

struct GetBlockTimestampRequest {
    // The system call selector (= GET_BLOCK_TIMESTAMP_SELECTOR).
    selector: felt,
}

struct GetBlockTimestampResponse {
    block_timestamp: felt,
}

struct GetBlockTimestamp {
    request: GetBlockTimestampRequest,
    response: GetBlockTimestampResponse,
}

func get_block_timestamp{syscall_ptr: felt*}() -> (block_timestamp: felt) {
    let syscall = [cast(syscall_ptr, GetBlockTimestamp*)];
    assert syscall.request = GetBlockTimestampRequest(selector=GET_BLOCK_TIMESTAMP_SELECTOR);
    %{ syscall_handler.get_block_timestamp(segments=segments, syscall_ptr=ids.syscall_ptr) %}
    let syscall_ptr = syscall_ptr + GetBlockTimestamp.SIZE;
    return (block_timestamp=syscall.response.block_timestamp);
}

const GET_TX_SIGNATURE_SELECTOR = 'GetTxSignature';

struct GetTxSignatureRequest {
    // The system call selector (= GET_TX_SIGNATURE_SELECTOR).
    selector: felt,
}

struct GetTxSignatureResponse {
    signature_len: felt,
    signature: felt*,
}

struct GetTxSignature {
    request: GetTxSignatureRequest,
    response: GetTxSignatureResponse,
}

// Returns the signature information of the transaction.
//
// NOTE: This function is deprecated. Use get_tx_info() instead.
func get_tx_signature{syscall_ptr: felt*}() -> (signature_len: felt, signature: felt*) {
    let syscall = [cast(syscall_ptr, GetTxSignature*)];
    assert syscall.request = GetTxSignatureRequest(selector=GET_TX_SIGNATURE_SELECTOR);
    %{ syscall_handler.get_tx_signature(segments=segments, syscall_ptr=ids.syscall_ptr) %}
    let syscall_ptr = syscall_ptr + GetTxSignature.SIZE;
    return (signature_len=syscall.response.signature_len, signature=syscall.response.signature);
}

const STORAGE_READ_SELECTOR = 'StorageRead';

// Describes the StorageRead system call format.
struct StorageReadRequest {
    // The system call selector (= STORAGE_READ_SELECTOR).
    selector: felt,
    address: felt,
}

struct StorageReadResponse {
    value: felt,
}

struct StorageRead {
    request: StorageReadRequest,
    response: StorageReadResponse,
}

func storage_read{syscall_ptr: felt*}(address: felt) -> (value: felt) {
    let syscall = [cast(syscall_ptr, StorageRead*)];
    assert syscall.request = StorageReadRequest(selector=STORAGE_READ_SELECTOR, address=address);
    %{ syscall_handler.storage_read(segments=segments, syscall_ptr=ids.syscall_ptr) %}
    let response = syscall.response;
    let syscall_ptr = syscall_ptr + StorageRead.SIZE;
    return (value=response.value);
}

const STORAGE_WRITE_SELECTOR = 'StorageWrite';

// Describes the StorageWrite system call format.
struct StorageWrite {
    selector: felt,
    address: felt,
    value: felt,
}

func storage_write{syscall_ptr: felt*}(address: felt, value: felt) {
    assert [cast(syscall_ptr, StorageWrite*)] = StorageWrite(
        selector=STORAGE_WRITE_SELECTOR, address=address, value=value
    );
    %{ syscall_handler.storage_write(segments=segments, syscall_ptr=ids.syscall_ptr) %}
    let syscall_ptr = syscall_ptr + StorageWrite.SIZE;
    return ();
}

const EMIT_EVENT_SELECTOR = 'EmitEvent';

// Describes the EmitEvent system call format.
struct EmitEvent {
    selector: felt,
    keys_len: felt,
    keys: felt*,
    data_len: felt,
    data: felt*,
}

func emit_event{syscall_ptr: felt*}(keys_len: felt, keys: felt*, data_len: felt, data: felt*) {
    assert [cast(syscall_ptr, EmitEvent*)] = EmitEvent(
        selector=EMIT_EVENT_SELECTOR, keys_len=keys_len, keys=keys, data_len=data_len, data=data
    );
    %{ syscall_handler.emit_event(segments=segments, syscall_ptr=ids.syscall_ptr) %}
    let syscall_ptr = syscall_ptr + EmitEvent.SIZE;
    return ();
}

struct TxInfo {
    // The version of the transaction. It is fixed (currently, 1) in the OS, and should be
    // signed by the account contract.
    // This field allows invalidating old transactions, whenever the meaning of the other
    // transaction fields is changed (in the OS).
    version: felt,

    // The account contract from which this transaction originates.
    account_contract_address: felt,

    // The max_fee field of the transaction.
    max_fee: felt,

    // The signature of the transaction.
    signature_len: felt,
    signature: felt*,

    // The hash of the transaction.
    transaction_hash: felt,

    // The identifier of the chain.
    // This field can be used to prevent replay of testnet transactions on mainnet.
    chain_id: felt,

    // The transaction's nonce.
    nonce: felt,
}

const GET_TX_INFO_SELECTOR = 'GetTxInfo';

// Describes the GetTxInfo system call format.
struct GetTxInfoRequest {
    // The system call selector (= GET_TX_INFO_SELECTOR).
    selector: felt,
}

struct GetTxInfoResponse {
    tx_info: TxInfo*,
}

struct GetTxInfo {
    request: GetTxInfoRequest,
    response: GetTxInfoResponse,
}

func get_tx_info{syscall_ptr: felt*}() -> (tx_info: TxInfo*) {
    let syscall = [cast(syscall_ptr, GetTxInfo*)];
    assert syscall.request = GetTxInfoRequest(selector=GET_TX_INFO_SELECTOR);
    %{ syscall_handler.get_tx_info(segments=segments, syscall_ptr=ids.syscall_ptr) %}
    let response = syscall.response;
    let syscall_ptr = syscall_ptr + GetTxInfo.SIZE;
    return (tx_info=response.tx_info);
}

const REPLACE_CLASS_SELECTOR = 'ReplaceClass';

// Describes the ReplaceClass system call format.
struct ReplaceClass {
    // The system call selector (= GET_REPLACE_CLASS_SELECTOR).
    selector: felt,
    // The new class hash for the contract.
    class_hash: felt,
}

func replace_class{syscall_ptr: felt*}(class_hash: felt) {
    assert [cast(syscall_ptr, ReplaceClass*)] = ReplaceClass(
        selector=REPLACE_CLASS_SELECTOR, class_hash=class_hash
    );
    %{ syscall_handler.replace_class(segments=segments, syscall_ptr=ids.syscall_ptr) %}
    let syscall_ptr = syscall_ptr + ReplaceClass.SIZE;
    return ();
}
