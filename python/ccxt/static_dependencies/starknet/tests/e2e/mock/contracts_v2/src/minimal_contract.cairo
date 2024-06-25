#[starknet::contract]
mod MinimalContract {
    #[storage]
    struct Storage {}
    #[external(v0)]
    fn empty(ref self: ContractState) {}
}
