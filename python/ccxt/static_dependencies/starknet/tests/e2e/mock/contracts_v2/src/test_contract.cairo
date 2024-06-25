#[starknet::interface]
trait IAnotherContract<T> {
    fn foo(ref self: T, a: u128) -> u128;
}


#[starknet::contract]
mod TestContract {
    use super::{
        IAnotherContractDispatcher, IAnotherContractLibraryDispatcher,
        IAnotherContractDispatcherTrait, MyType
    };
    use dict::Felt252DictTrait;

    #[storage]
    struct Storage {
        my_storage_var: felt252
    }

    fn internal_func() -> felt252 {
        1
    }

    #[external(v0)]
    fn test(ref self: ContractState, ref arg: felt252, arg1: felt252, arg2: felt252) -> felt252 {
        let mut x = self.my_storage_var.read();
        x += 1;
        self.my_storage_var.write(x);
        x + internal_func()
    }

    #[external(v0)]
    fn another_function(ref self: ContractState, x: MyType) {}

    #[external(v0)]
    fn call_foo(
        ref self: ContractState, another_contract_address: starknet::ContractAddress, a: u128
    ) -> u128 {
        IAnotherContractDispatcher { contract_address: another_contract_address }.foo(a)
    }

    #[external(v0)]
    fn libcall_foo(ref self: ContractState, a: u128) -> u128 {
        IAnotherContractLibraryDispatcher { class_hash: starknet::class_hash_const::<0>() }.foo(a)
    }

    /// An external method that requires the `segment_arena` builtin.
    #[external(v0)]
    fn segment_arena_builtin(ref self: ContractState,) {
        let x = felt252_dict_new::<felt252>();
        x.squash();
    }

    #[l1_handler]
    fn l1_handle(ref self: ContractState, from_address: felt252, arg: felt252) -> felt252 {
        arg
    }
}

#[derive(Copy, Drop, Serde)]
struct MyType {
    a: felt252,
    b: bool,
}
