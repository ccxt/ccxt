use serde::Serde;
use array::SpanTrait;

#[derive(Copy, Drop, Serde)]
struct OptionStruct {
    first_field: felt252,
    second_field: Option::<u256>,
    third_field: Option::<u8>,
    fourth_field: felt252
}


#[starknet::contract]
mod TestOption {
    use super::OptionStruct;

    #[storage]
    struct Storage {}

    #[external(v0)]
    fn receive_and_send_option_struct(
        self: @ContractState, option_struct: OptionStruct
    ) -> OptionStruct {
        option_struct
    }

    #[external(v0)]
    fn get_option_struct(self: @ContractState) -> OptionStruct {
        let option_struct = OptionStruct {
            first_field: 1,
            second_field: Option::Some(u256 { low: 2, high: 0 }),
            third_field: Option::None(()),
            fourth_field: 4
        };

        option_struct
    }

    #[external(v0)]
    fn get_empty_option(self: @ContractState) -> Option::<()> {
        Option::Some(())
    }
}
