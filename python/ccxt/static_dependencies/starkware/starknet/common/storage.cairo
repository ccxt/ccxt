from starkware.cairo.common.math import assert_250_bit

const MAX_STORAGE_ITEM_SIZE = 256;
// Valid storage addresses should satisfy address + offset < 2**251 where
// offset < MAX_STORAGE_ITEM_SIZE and address < ADDR_BOUND.
const ADDR_BOUND = 2 ** 251 - MAX_STORAGE_ITEM_SIZE;

// Computes addr % ADDR_BOUND so that the result will form a valid storage item address in the
// storage tree. In particular, we need the result + MAX_STORAGE_ITEM_SIZE to be less than
// 2**251.
@known_ap_change
func normalize_address{range_check_ptr}(addr: felt) -> (res: felt) {
    tempvar is_small;
    %{
        # Verify the assumptions on the relationship between 2**250, ADDR_BOUND and PRIME.
        ADDR_BOUND = ids.ADDR_BOUND % PRIME
        assert (2**250 < ADDR_BOUND <= 2**251) and (2 * 2**250 < PRIME) and (
                ADDR_BOUND * 2 > PRIME), \
            'normalize_address() cannot be used with the current constants.'
        ids.is_small = 1 if ids.addr < ADDR_BOUND else 0
    %}
    if (is_small != 0) {
        tempvar is_250;
        %{ ids.is_250 = 1 if ids.addr < 2**250 else 0 %}
        if (is_250 != 0) {
            ap += 11;
            // In this case addr < 2**250 < ADDR_BOUND, so addr % ADDR_BOUND = addr.
            assert_250_bit(addr);
        } else {
            ap += 10;
            // In this case 0 <= ADDR_BOUND - 1 - addr < 2**250, so addr < ADDR_BOUND.
            assert_250_bit(ADDR_BOUND - 1 - addr);
        }
        return (res=addr);
    } else {
        // The first call to assert_250_bit() checks that 0 <= (addr - ADDR_BOUND) % PRIME < 2**250.
        // The second call checks that 0 <= (-1 - addr) % PRIME < 2**250.
        // Let x = (addr - ADDR_BOUND) % PRIME and y = (-1 - addr) % PRIME. Then,
        //   x + y = (addr - ADDR_BOUND) + (-1 - addr) = PRIME - 1 - ADDR_BOUND  (mod PRIME).
        // So we have:
        //   x + y = PRIME - 1 - ADDR_BOUND  (mod PRIME).
        // Since both hands are in the range [0, PRIME) (since 2 * 2**250 < PRIME),
        // they must be equal as integers.
        // In particular, x + ADDR_BOUND = PRIME - 1 - y < PRIME.
        // Since addr = x + ADDR_BOUND (mod PRIME) and both sides are in the range [0, PRIME)
        // we have addr = x + ADDR_BOUND (as integers).
        // Therefore, we should subtract ADDR_BOUND to get addr % ADDR_BOUND.
        let x = addr - ADDR_BOUND;
        let y = (-1) - addr;
        assert_250_bit(x);
        assert_250_bit(y);
        return (res=addr - ADDR_BOUND);
    }
}
