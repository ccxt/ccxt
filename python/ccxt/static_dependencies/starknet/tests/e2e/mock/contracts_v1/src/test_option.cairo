use serde::Serde;
use array::SpanTrait;


#[derive(Copy, Drop, Serde)]
struct OptionStruct {
    first_field: felt252,
    second_field: Option::<u256>,
    third_field: Option::<u8>,
    fourth_field: felt252
}

#[contract]
mod TestOption {
    use super::OptionStruct;

    #[view]
    fn receive_and_send_option_struct(option_struct: OptionStruct) -> OptionStruct {
        option_struct
    }

    #[view]
    fn get_option_struct() -> OptionStruct {
        let option_struct = OptionStruct {
            first_field: 1,
            second_field: Option::Some(u256 { low: 2, high: 0 }),
            third_field: Option::None(()),
            fourth_field: 4
        };

        option_struct
    }

    #[view]
    fn get_empty_option() -> Option::<()> {
        Option::Some(())
    }
}
