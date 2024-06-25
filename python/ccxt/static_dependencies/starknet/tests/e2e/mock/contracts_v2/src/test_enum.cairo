use serde::Serde;

#[derive(Copy, Drop, Serde)]
enum MyEnum {
    a: u256,
    b: u128,
    c: ()
}

#[starknet::contract]
mod TestEnum {
    use super::MyEnum;

    #[storage]
    struct Storage {}

    #[external(v0)]
    fn receive_and_send_enum(self: @ContractState, my_enum: MyEnum) -> MyEnum {
        my_enum
    }

    #[external(v0)]
    fn get_enum(self: @ContractState) -> MyEnum {
        let my_enum = MyEnum::a(u256 { low: 100, high: 0 });

        my_enum
    }

    #[external(v0)]
    fn get_enum_without_value(self: @ContractState) -> MyEnum {
        let my_enum = MyEnum::c(());

        my_enum
    }
}
