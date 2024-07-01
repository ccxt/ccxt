from starkware.starknet.common.syscalls import SEND_MESSAGE_TO_L1_SELECTOR, SendMessageToL1SysCall

// Sends a message to an L1 contract at 'l1_address' with given payload.
func send_message_to_l1{syscall_ptr: felt*}(to_address: felt, payload_size: felt, payload: felt*) {
    assert [cast(syscall_ptr, SendMessageToL1SysCall*)] = SendMessageToL1SysCall(
        selector=SEND_MESSAGE_TO_L1_SELECTOR,
        to_address=to_address,
        payload_size=payload_size,
        payload_ptr=payload,
    );
    %{ syscall_handler.send_message_to_l1(segments=segments, syscall_ptr=ids.syscall_ptr) %}
    let syscall_ptr = syscall_ptr + SendMessageToL1SysCall.SIZE;
    return ();
}
