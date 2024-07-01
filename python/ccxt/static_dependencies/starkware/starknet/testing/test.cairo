%lang starknet

from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.registers import get_fp_and_pc
from starkware.starknet.common.messages import send_message_to_l1
from starkware.starknet.common.syscalls import (
    get_caller_address,
    get_tx_info,
    storage_read,
    storage_write,
)

@contract_interface
namespace MyContract {
    func increase_value(address: felt, value: felt) {
    }
}

@external
func increase_value{syscall_ptr: felt*}(address: felt, value: felt) {
    let (res) = storage_read(address=address);
    return storage_write(address=address, value=res + value);
}

@external
func call_increase_value{syscall_ptr: felt*, range_check_ptr}(
    contract_address: felt, address: felt, value: felt
) {
    MyContract.increase_value(contract_address=contract_address, address=address, value=value);
    return ();
}

@external
func get_value{syscall_ptr: felt*}(address: felt) -> (res: felt) {
    let (res) = storage_read(address=address);
    return (res=res);
}

@external
func get_caller{syscall_ptr: felt*}() -> (res: felt) {
    let (caller_address) = get_caller_address();
    return (res=caller_address);
}

@external
func takes_array{syscall_ptr: felt*}(a_len: felt, a: felt*) -> (res: felt) {
    let res = a_len + a[0] + a[1];
    return (res=res);
}

@external
func get_signature{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*}() -> (
    res_len: felt, res: felt*
) {
    let (tx_info) = get_tx_info();
    return (res_len=tx_info.signature_len, res=tx_info.signature);
}

@external
func send_message{syscall_ptr: felt*}(to_address: felt, payload_len: felt, payload: felt*) {
    send_message_to_l1(to_address=to_address, payload_size=payload_len, payload=payload);
    return ();
}

@l1_handler
func deposit{syscall_ptr: felt*}(from_address: felt, user: felt, amount: felt) {
    increase_value(address=user, value=amount);
    return ();
}

struct Point {
    x: felt,
    y: felt,
}

@event
func log_sum_points(points_len: felt, points: Point*, sum: Point) {
}

@view
func sum_points{syscall_ptr: felt*, range_check_ptr}(points: (Point, Point)) -> (res: Point) {
    // Calculate sum.
    let res: Point = Point(x=points[0].x + points[1].x, y=points[0].y + points[1].y);

    // Log points and their sum.
    let (__fp__, _) = get_fp_and_pc();
    log_sum_points.emit(points_len=2, points=&points[0], sum=res);

    return (res=res);
}

@view
func sum_and_mult_points{syscall_ptr: felt*, range_check_ptr}(points: (Point, Point)) -> (
    sum_res: Point, mult_res: felt
) {
    let sum_res: Point = sum_points(points=points);
    let mult_res: felt = (points[0].x * points[1].x) + (points[0].y * points[1].y);
    return (sum_res=sum_res, mult_res=mult_res);
}

@external
func transpose(inp_len: felt, inp: Point*) -> (res_len: felt, res: Point*) {
    assert inp_len = 2;
    let (res: Point*) = alloc();
    assert res[0] = Point(x=inp[0].x, y=inp[1].x);
    assert res[1] = Point(x=inp[0].y, y=inp[1].y);
    return (res_len=2, res=res);
}
