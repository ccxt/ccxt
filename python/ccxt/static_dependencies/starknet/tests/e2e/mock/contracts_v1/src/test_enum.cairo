use serde::Serde;

#[derive(Copy, Drop, Serde)]
enum MyEnum {
    a: u256,
    b: u128,
    c: ()
}

#[contract]
mod TestEnum {
    use super::MyEnum;

    #[view]
    fn receive_and_send_enum(my_enum: MyEnum) -> MyEnum {
        my_enum
    }

    #[view]
    fn get_enum() -> MyEnum {
        let my_enum = MyEnum::a(u256 { low: 100, high: 0 });

        my_enum
    }

    #[view]
    fn get_enum_without_value() -> MyEnum {
        let my_enum = MyEnum::c(());

        my_enum
    }
}
