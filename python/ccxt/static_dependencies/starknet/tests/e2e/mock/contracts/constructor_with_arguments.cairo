%lang starknet
%builtins pedersen range_check

from starkware.cairo.common.cairo_builtins import HashBuiltin

struct NestedStruct {
    value: felt,
}

struct TopStruct {
    value: felt,
    nested_struct: NestedStruct,
}

@storage_var
func storage() -> (value: (felt, (felt, (felt, felt)), felt, TopStruct)) {
}

func array_sum(arr: felt*, size) -> (sum: felt) {
    if (size == 0) {
        return (sum=0);
    }

    // size is not zero.
    let (sum_of_rest) = array_sum(arr=arr + 1, size=size - 1);
    return (sum=[arr] + sum_of_rest);
}

@constructor
func constructor{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    single_value: felt, tuple: (felt, (felt, felt)), arr_len: felt, arr: felt*, dict: TopStruct
) {
    let (arr_sum) = array_sum(arr, arr_len);
    storage.write((single_value, tuple, arr_sum, dict));
    return ();
}

@view
func get{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (
    single_value: felt, tuple: (felt, (felt, felt)), arr_sum: felt, dict: TopStruct
) {
    let (value) = storage.read();
    return (value[0], value[1], value[2], value[3]);
}
