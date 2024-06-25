use array::ArrayTrait;
use array::SpanTrait;
use option::OptionTrait;
use traits::TryInto;
use serde::Serde;

// bet part
use starknet::ContractAddress;
use starknet::get_caller_address;
use starknet::Store;
use starknet::storage_access;
use starknet::StorageBaseAddress;
use starknet::SyscallResult;
use starknet::storage_read_syscall;
use starknet::storage_write_syscall;
use starknet::storage_address_from_base_and_offset;
use starknet::storage_base_address_from_felt252;

use traits::Into;
use starknet::storage_access::StorageAddressSerde;
use box::BoxTrait;
// end bet part

#[derive(Copy, Drop, Serde)]
struct Foo {
    val: felt252
}

// Complex Structs
#[derive(Copy, Drop, Serde, starknet::Store)]
struct UserData {
    address: ContractAddress,
    is_claimed: bool,
}

#[derive(Copy, Drop, Serde, starknet::Store)]
struct Bet {
    name: felt252,
    description: felt252,
    expire_date: u64,
    creation_time: u64,
    creator: ContractAddress,
    is_cancelled: bool,
    is_voted: bool,
    bettor: UserData,
    counter_bettor: UserData,
    winner: bool,
    pool: u256,
    amount: u256,
}

#[derive(Copy, Drop, Serde)]
struct Order {
    p1: felt252,
    p2: u16,
}

#[derive(Copy, Drop, Serde)]
enum MyEnum {
    Response: Order,
    Warning: felt252,
    Error: u16,
}

#[starknet::interface]
trait IHelloStarknet<TContractState> {
    // Felt252 test.
    fn increase_balance(ref self: TContractState, amount: felt252);
    fn get_balance(self: @TContractState) -> felt252;
    // Bool Test
    fn set_status(ref self: TContractState, new_status: bool);
    fn get_status(self: @TContractState) -> bool;

    // ContractAddress
    fn set_ca(ref self: TContractState, address: ContractAddress);
    fn get_ca(self: @TContractState) -> ContractAddress;

    // u8 Test.
    fn increase_balance_u8(ref self: TContractState, amount: u8);
    fn get_balance_u8(self: @TContractState) -> u8;

    fn test_u16(self: @TContractState, p1: u16) -> u16;
    fn test_u32(self: @TContractState, p1: u32) -> u32;
    fn test_u64(self: @TContractState, p1: u64) -> u64;

    fn test_u128(self: @TContractState, p1: u128) -> u128;
    fn test_u256(self: @TContractState, p1: u256) -> u256;

    // echo Array
    fn echo_array(self: @TContractState, data: Array<u8>) -> Array<u8>;
    fn echo_array_u256(self: @TContractState, data: Array<u256>) -> Array<u256>;
    fn echo_array_bool(self: @TContractState, data: Array<bool>) -> Array<bool>;
    // unnamed Tuple
    fn echo_un_tuple(self: @TContractState, a: (felt252, u16)) -> (felt252, u16);
    // echo Struct
    fn echo_struct(self: @TContractState, tt: Foo) -> Foo;
    fn set_bet(ref self: TContractState);

    fn get_bet(self: @TContractState, test: felt252) -> Bet;
    fn set_user1(ref self: TContractState, user: UserData);
    fn get_user1(self: @TContractState) -> UserData;
    // this method is required so that ABI have UserData definition in structs
    fn get_user(self: @TContractState) -> UserData;
    // Nested Array 2d
    fn array2d_ex(ref self: TContractState, test: Array<Array<felt252>>) -> felt252;
    fn array2d_array(self: @TContractState, test: Array<Array<felt252>>) -> Array<Array<felt252>>;

    fn array2d_felt(self: @TContractState, test: Array<Array<felt252>>) -> felt252;
    // req tuple(array) ret tuple(array)
    fn tuple_echo(
        self: @TContractState, a: (core::array::Array::<felt252>, core::array::Array::<felt252>)
    ) -> (core::array::Array::<felt252>, core::array::Array::<felt252>);

    // mix req (array,bool) ret tuple(array,bool)
    fn array_bool_tuple(
        self: @TContractState, a: core::array::Array::<felt252>, b: bool
    ) -> (core::array::Array::<felt252>, bool);

    // used for changes to redeclare contract
    fn array2ddd_felt(self: @TContractState, testdd: Array<Array<felt252>>) -> felt252;
    fn my_enum_output(self: @TContractState, val1: u16) -> MyEnum;
    fn option_u8_output(self: @TContractState, val1: u8) -> Option<u8>;
    fn option_order_output(self: @TContractState, val1: u16) -> Option<Order>;
    fn option_order_input(self: @TContractState, inp: Option<Order>) -> u16;
}

// MAIN APP
#[starknet::contract]
mod Hello2 {
    //  libs
    use array::ArrayTrait;
    use array::SpanTrait;
    use option::OptionTrait;
    use traits::TryInto;
    use serde::Serde;
    use clone::Clone;

    // bet part
    use starknet::ContractAddress;
    use starknet::get_caller_address;
    use starknet::Store;
    use starknet::storage_access;
    use starknet::StorageBaseAddress;
    use starknet::SyscallResult;
    use starknet::storage_read_syscall;
    use starknet::storage_write_syscall;
    use starknet::storage_address_from_base_and_offset;
    use starknet::storage_base_address_from_felt252;

    use traits::Into;
    use starknet::storage_access::StorageAddressSerde;
    use box::BoxTrait;

    //bet
    use super::Bet;
    use super::UserData;
    use super::Foo;
    use super::{Order, MyEnum};

    #[storage]
    struct Storage {
        balance: felt252,
        balance_u8: u8,
        status: bool,
        ca: ContractAddress,
        testbet: Bet,
        user: UserData,
        user1: UserData,
    }

    #[l1_handler]
    fn increase_bal(ref self: ContractState, from_address: felt252, amount: felt252) {
        let current = self.balance.read();
        self.balance.write(current + amount);
    }


    #[constructor]
    fn constructor(ref self: ContractState) {}


    #[abi(embed_v0)]
    impl IHelloStarknetImpl of super::IHelloStarknet<ContractState> {
        // Felt252 test.
        fn increase_balance(ref self: ContractState, amount: felt252) {
            self.balance.write(self.balance.read() + amount);
        }

        fn get_balance(self: @ContractState) -> felt252 {
            self.balance.read()
        }

        // Bool Test
        fn set_status(ref self: ContractState, new_status: bool) {
            self.status.write(new_status);
        }

        fn get_status(self: @ContractState) -> bool {
            self.status.read()
        }

        // ContractAddress
        fn set_ca(ref self: ContractState, address: ContractAddress) {
            self.ca.write(address);
        }

        fn get_ca(self: @ContractState) -> ContractAddress {
            self.ca.read()
        }

        // u8 Test.
        fn increase_balance_u8(ref self: ContractState, amount: u8) {
            self.balance_u8.write(self.balance_u8.read() + amount);
        }

        fn get_balance_u8(self: @ContractState) -> u8 {
            self.balance_u8.read()
        }

        fn test_u16(self: @ContractState, p1: u16) -> u16 {
            p1 + 1_u16
        }

        fn test_u32(self: @ContractState, p1: u32) -> u32 {
            p1 + 1_u32
        }

        fn test_u64(self: @ContractState, p1: u64) -> u64 {
            p1 + 1_u64
        }

        fn test_u128(self: @ContractState, p1: u128) -> u128 {
            p1 + 1_u128
        }

        fn test_u256(self: @ContractState, p1: u256) -> u256 {
            let to_add = u256 { low: 1_u128, high: 0_u128 };
            p1 + to_add
        }

        // echo Array
        fn echo_array(self: @ContractState, data: Array<u8>) -> Array<u8> {
            data
        }

        fn echo_array_u256(self: @ContractState, data: Array<u256>) -> Array<u256> {
            data
        }

        fn echo_array_bool(self: @ContractState, data: Array<bool>) -> Array<bool> {
            data
        }

        // unnamed Tuple
        fn echo_un_tuple(self: @ContractState, a: (felt252, u16)) -> (felt252, u16) {
            a
        }

        // echo Struct
        fn echo_struct(self: @ContractState, tt: Foo) -> Foo {
            tt
        }

        fn set_bet(ref self: ContractState) {
            let sender = get_caller_address();
            let user = UserData { address: sender, is_claimed: false };
            self
                .testbet
                .write(
                    Bet {
                        name: 'test',
                        description: 'dec',
                        expire_date: 1_u64,
                        creation_time: 1_u64,
                        creator: sender,
                        is_cancelled: false,
                        is_voted: false,
                        bettor: user,
                        counter_bettor: user,
                        winner: false,
                        pool: u256 { low: 10_u128, high: 0_u128 },
                        amount: u256 { low: 1000_u128, high: 0_u128 }
                    }
                );
        }

        fn get_bet(self: @ContractState, test: felt252) -> Bet {
            self.testbet.read()
        }

        fn set_user1(ref self: ContractState, user: UserData) {
            self.user1.write(user);
        }

        fn get_user1(self: @ContractState) -> UserData {
            self.user1.read()
        }

        // this method is required so that ABI have UserData definition in structs
        fn get_user(self: @ContractState) -> UserData {
            self.user.read()
        }

        // Nested Array 2d
        fn array2d_ex(ref self: ContractState, test: Array<Array<felt252>>) -> felt252 {
            return *(test.at(0_u32)).at(0_u32);
        }

        fn array2d_array(
            self: @ContractState, test: Array<Array<felt252>>
        ) -> Array<Array<felt252>> {
            return test;
        }

        fn array2d_felt(self: @ContractState, test: Array<Array<felt252>>) -> felt252 {
            return *(test.at(0_u32)).at(0_u32);
        }

        // req tuple(array) ret tuple(array)
        fn tuple_echo(
            self: @ContractState, a: (core::array::Array::<felt252>, core::array::Array::<felt252>)
        ) -> (core::array::Array::<felt252>, core::array::Array::<felt252>) {
            a
        }

        // mix req (array,bool) ret tuple(array,bool)
        fn array_bool_tuple(
            self: @ContractState, a: core::array::Array::<felt252>, b: bool
        ) -> (core::array::Array::<felt252>, bool) {
            let mut a = a.clone();
            a.append(1);
            a.append(2);
            (a, b)
        }

        // used for changes to redeclare contract
        fn array2ddd_felt(self: @ContractState, testdd: Array<Array<felt252>>) -> felt252 {
            return *(testdd.at(0_u32)).at(0_u32);
        }

        // return MyEnum
        fn my_enum_output(self: @ContractState, val1: u16) -> MyEnum {
            if val1 < 100 {
                return MyEnum::Error(3);
            }
            if val1 == 100 {
                return MyEnum::Warning('attention:100');
            }
            MyEnum::Response(Order { p1: 1, p2: val1 })
        }
        // return Option<literal>
        fn option_u8_output(self: @ContractState, val1: u8) -> Option<u8> {
            if val1 < 100 {
                return Option::None(());
            }
            Option::Some(val1 + 1)
        }
        // return Option<Order>
        fn option_order_output(self: @ContractState, val1: u16) -> Option<Order> {
            if val1 < 100 {
                return Option::None(());
            }
            Option::Some(Order { p1: 18, p2: val1 })
        }
        // use as input Option<Order>
        fn option_order_input(self: @ContractState, inp: Option<Order>) -> u16 {
            match inp {
                Option::Some(x) => { return x.p2; },
                Option::None(()) => { return 17; }
            }
        }
    }
}
