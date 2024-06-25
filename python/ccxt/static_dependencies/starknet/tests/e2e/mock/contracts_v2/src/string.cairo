#[starknet::contract]
mod MyString {
    #[storage]
    struct Storage {
        string: ByteArray,
    }

    #[constructor]
    fn constructor(ref self: ContractState) {
        self.string.write("Hello");
    }

    #[external(v0)]
    fn set_string(ref self: ContractState, new_string: ByteArray) {
        self.string.write(new_string);
    }

    #[external(v0)]
    fn get_string(self: @ContractState) -> ByteArray {
        self.string.read()
    }
}
