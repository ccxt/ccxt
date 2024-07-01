%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.hash import hash2
from starkware.cairo.common.math import assert_le, assert_nn_le, unsigned_div_rem
from starkware.starknet.common.syscalls import get_caller_address, storage_read, storage_write

// The maximum amount of each token that belongs to the AMM.
const BALANCE_UPPER_BOUND = 2 ** 64;

const TOKEN_TYPE_A = 1;
const TOKEN_TYPE_B = 2;

// Ensure the user's balances are much smaller than the pool's balance.
const POOL_UPPER_BOUND = 2 ** 30;
const ACCOUNT_BALANCE_BOUND = 1073741;  // 2**30 // 1000.

// A map from account and token type to the corresponding balance of that account.
@storage_var
func account_balance(account_id: felt, token_type: felt) -> (balance: felt) {
}

// A map from token type to the corresponding balance of the pool.
@storage_var
func pool_balance(token_type: felt) -> (balance: felt) {
}

// Adds amount to the account's balance for the given token.
// amount may be positive or negative.
// Assert before setting that the balance does not exceed the upper bound.
func modify_account_balance{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    account_id: felt, token_type: felt, amount: felt
) {
    let (current_balance) = account_balance.read(account_id, token_type);
    tempvar new_balance = current_balance + amount;
    assert_nn_le(new_balance, BALANCE_UPPER_BOUND - 1);
    account_balance.write(account_id=account_id, token_type=token_type, value=new_balance);
    return ();
}

// Returns the account's balance for the given token.
@view
func get_account_token_balance{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    account_id: felt, token_type: felt
) -> (balance: felt) {
    return account_balance.read(account_id, token_type);
}

// Sets the pool's balance for the given token.
// Asserts before setting that the balance does not exceed the upper bound.
func set_pool_token_balance{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    token_type: felt, balance: felt
) {
    assert_nn_le(balance, BALANCE_UPPER_BOUND - 1);
    pool_balance.write(token_type, balance);
    return ();
}

// Returns the pool's balance.
@view
func get_pool_token_balance{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    token_type: felt
) -> (balance: felt) {
    return pool_balance.read(token_type);
}

// Swaps tokens between the given account and the pool.
func do_swap{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    account_id: felt, token_from: felt, token_to: felt, amount_from: felt
) -> (amount_to: felt) {
    alloc_locals;

    // Get pool balance.
    let (local amm_from_balance) = get_pool_token_balance(token_type=token_from);
    let (local amm_to_balance) = get_pool_token_balance(token_type=token_to);

    // Calculate swap amount.
    let (local amount_to, _) = unsigned_div_rem(
        amm_to_balance * amount_from, amm_from_balance + amount_from
    );

    // Update token_from balances.
    modify_account_balance(account_id=account_id, token_type=token_from, amount=-amount_from);
    set_pool_token_balance(token_type=token_from, balance=amm_from_balance + amount_from);

    // Update token_to balances.
    modify_account_balance(account_id=account_id, token_type=token_to, amount=amount_to);
    set_pool_token_balance(token_type=token_to, balance=amm_to_balance - amount_to);
    return (amount_to=amount_to);
}

func get_opposite_token(token_type: felt) -> (t: felt) {
    if (token_type == TOKEN_TYPE_A) {
        return (t=TOKEN_TYPE_B);
    } else {
        return (t=TOKEN_TYPE_A);
    }
}

// Swaps tokens between the given account and the pool.
@external
func swap{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    token_from: felt, amount_from: felt
) -> (amount_to: felt) {
    let (account_id) = get_caller_address();

    // Verify that token_from is either TOKEN_TYPE_A or TOKEN_TYPE_B.
    assert (token_from - TOKEN_TYPE_A) * (token_from - TOKEN_TYPE_B) = 0;

    // Check requested amount_from is valid.
    assert_nn_le(amount_from, BALANCE_UPPER_BOUND - 1);
    // Check user has enough funds.
    let (account_from_balance) = get_account_token_balance(
        account_id=account_id, token_type=token_from
    );
    assert_le(amount_from, account_from_balance);

    let (token_to) = get_opposite_token(token_type=token_from);
    let (amount_to) = do_swap(
        account_id=account_id, token_from=token_from, token_to=token_to, amount_from=amount_from
    );

    return (amount_to=amount_to);
}

// Adds demo tokens to the given account.
@external
func add_demo_token{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    token_a_amount: felt, token_b_amount: felt
) {
    let (account_id) = get_caller_address();

    // Make sure the account's balance is much smaller than
    // the pool init balance.
    assert_nn_le(token_a_amount, ACCOUNT_BALANCE_BOUND - 1);
    assert_nn_le(token_b_amount, ACCOUNT_BALANCE_BOUND - 1);

    modify_account_balance(account_id=account_id, token_type=TOKEN_TYPE_A, amount=token_a_amount);
    modify_account_balance(account_id=account_id, token_type=TOKEN_TYPE_B, amount=token_b_amount);
    return ();
}

// Until we have LPs, for testing, we'll need to initialize the AMM somehow.
@external
func init_pool{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    token_a: felt, token_b: felt
) {
    assert_nn_le(token_a, POOL_UPPER_BOUND - 1);
    assert_nn_le(token_b, POOL_UPPER_BOUND - 1);

    set_pool_token_balance(token_type=TOKEN_TYPE_A, balance=token_a);
    set_pool_token_balance(token_type=TOKEN_TYPE_B, balance=token_b);

    return ();
}
