use starknet::ContractAddress;
use serde::Serde;
use traits::Into;
use zeroable::Zeroable;

#[abi]
trait IMintableToken {
    fn permissioned_mint(account: ContractAddress, amount: u256);
    fn permissioned_burn(account: ContractAddress, amount: u256);
}

#[contract]
mod TokenBridge {
    use array::ArrayTrait;
    use integer::Felt252IntoU256;
    use integer::U128IntoFelt252;
    use option::OptionTrait;
    use serde::Serde;
    use starknet::ContractAddress;
    use starknet::contract_address::ContractAddressZeroable;
    use starknet::get_caller_address;
    use starknet::EthAddress;
    use starknet::EthAddressIntoFelt252;
    use starknet::EthAddressSerde;
    use starknet::EthAddressZeroable;
    use starknet::syscalls::send_message_to_l1_syscall;
    use super::IMintableTokenDispatcher;
    use super::IMintableTokenDispatcherTrait;
    use super::IMintableTokenLibraryDispatcher;
    use traits::Into;
    use zeroable::Zeroable;


    const WITHDRAW_MESSAGE: felt252 = 0;
    const CONTRACT_IDENTITY: felt252 = 'STARKGATE';
    const CONTRACT_VERSION: felt252 = 2;

    struct Storage {
        // The address of the L2 governor of this contract. Only the governor can set the other
        // storage variables.
        governor: ContractAddress,
        // The L1 bridge address. Zero when unset.
        l1_bridge: felt252,
        // The L2 token contract address. Zero when unset.
        l2_token: ContractAddress,
    }

    // An event that is emitted when set_l1_bridge is called.
    // * l1_bridge_address is the new l1 bridge address.
    #[event]
    fn l1_bridge_set(l1_bridge_address: EthAddress) {}

    // An event that is emitted when set_l2_token is called.
    // * l2_token_address is the new l2 token address.
    #[event]
    fn l2_token_set(l2_token_address: ContractAddress) {}

    // An event that is emitted when initiate_withdraw is called.
    // * l1_recipient is the l1 recipient address.
    // * amount is the amount to withdraw.
    // * caller_address is the address from which the call was made.
    #[event]
    fn withdraw_initiated(
        l1_recipient: EthAddress, amount: u256, caller_address: ContractAddress
    ) {}

    // An event that is emitted when handle_deposit is called.
    // * account is the recipient address.
    // * amount is the amount to deposit.
    #[event]
    fn deposit_handled(account: ContractAddress, amount: u256) {}

    #[view]
    fn get_version() -> felt252 {
        CONTRACT_VERSION
    }

    #[view]
    fn get_identity() -> felt252 {
        CONTRACT_IDENTITY
    }

    #[constructor]
    fn constructor(governor_address: ContractAddress) {
        assert(governor_address.is_non_zero(), 'ZERO_GOVERNOR_ADDRESS');
        governor::write(governor_address);
    }

    #[external]
    fn set_l1_bridge(l1_bridge_address: EthAddress) {
        // The call is restricted to the governor.
        assert(get_caller_address() == governor::read(), 'GOVERNOR_ONLY');

        assert(l1_bridge::read().is_zero(), 'L1_BRIDGE_ALREADY_INITIALIZED');
        assert(l1_bridge_address.is_non_zero(), 'ZERO_BRIDGE_ADDRESS');

        l1_bridge::write(l1_bridge_address.into());
        l1_bridge_set(l1_bridge_address);
    }

    #[external]
    fn set_l2_token(l2_token_address: ContractAddress) {
        // The call is restricted to the governor.
        assert(get_caller_address() == governor::read(), 'GOVERNOR_ONLY');

        assert(l2_token::read().is_zero(), 'L2_TOKEN_ALREADY_INITIALIZED');
        assert(l2_token_address.is_non_zero(), 'ZERO_TOKEN_ADDRESS');

        l2_token::write(l2_token_address);
        l2_token_set(l2_token_address);
    }

    #[external]
    fn initiate_withdraw(l1_recipient: EthAddress, amount: u256) {
        // Call burn on l2_token contract.
        let caller_address = get_caller_address();
        IMintableTokenDispatcher {
            contract_address: read_initialized_l2_token()
        }.permissioned_burn(account: caller_address, :amount);

        // Send the message.
        let mut message_payload: Array<felt252> = ArrayTrait::new();
        message_payload.append(WITHDRAW_MESSAGE);
        message_payload.append(l1_recipient.into());
        message_payload.append(amount.low.into());
        message_payload.append(amount.high.into());

        send_message_to_l1_syscall(
            to_address: read_initialized_l1_bridge(), payload: message_payload.span()
        );
        withdraw_initiated(:l1_recipient, :amount, :caller_address);
    }

    #[l1_handler]
    fn handle_deposit(from_address: felt252, account: ContractAddress, amount: u256) {
        assert(from_address == l1_bridge::read(), 'EXPECTED_FROM_BRIDGE_ONLY');

        // Call mint on l2_token contract.
        IMintableTokenDispatcher {
            contract_address: read_initialized_l2_token()
        }.permissioned_mint(:account, :amount);

        deposit_handled(:account, :amount);
    }

    // Helpers (internal functions)

    // Read l1_bridge and verify it's initialized.
    fn read_initialized_l1_bridge() -> felt252 {
        let l1_bridge_address = l1_bridge::read();
        assert(l1_bridge_address.is_non_zero(), 'UNINITIALIZED_L1_BRIDGE_ADDRESS');
        l1_bridge_address
    }

    // Read l2_token and verify it's initialized.
    fn read_initialized_l2_token() -> ContractAddress {
        let l2_token_address = l2_token::read();
        assert(l2_token_address.is_non_zero(), 'UNINITIALIZED_TOKEN');
        l2_token_address
    }
}
