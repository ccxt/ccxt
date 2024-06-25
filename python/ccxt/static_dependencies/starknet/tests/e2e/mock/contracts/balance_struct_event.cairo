%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin

struct NestedStruct {
    value: felt,
}

struct TopStruct {
    value: felt,
    nested_struct: NestedStruct,
}

@storage_var
func balance(key: felt) -> (value: TopStruct) {
}

@event
func increase_balance_called(key: felt, prev_amount: TopStruct, amount: TopStruct) {
}

@external
func increase_balance{
    syscall_ptr: felt*,
    pedersen_ptr: HashBuiltin*,
    range_check_ptr,
}(key: felt, amount: TopStruct) {
    let (value) = balance.read(key=key);

    increase_balance_called.emit(key=key, prev_amount=value, amount=amount);

    let new_value = value.nested_struct.value + amount.nested_struct.value;
    let nested_struct = NestedStruct(value=new_value);
    let top_struct = TopStruct(value=0, nested_struct=nested_struct);

    balance.write(key, top_struct);
    return ();
}

@view
func get_balance{
    syscall_ptr: felt*,
    pedersen_ptr: HashBuiltin*,
    range_check_ptr,
}(key: felt) -> (value: TopStruct) {
    let (value) = balance.read(key=key);
    return (value=value);
}
