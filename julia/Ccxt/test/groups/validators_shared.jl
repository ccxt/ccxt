# Group: validators_shared — exercises the shared assert primitives
# (`test.sharedMethods`, file #25 in `ts/src/test/Exchange/base/`) directly
# against representative data. Every one of the 24 structure validators calls
# these primitives, so this proves the 25th file's shipped code works on the
# real path rather than merely being loaded. Depends on `validators` (which
# `include`s the transpiled `test.sharedMethods.jl` definitions) and
# `fixtures_init` (which defines `static_init_offline`).
include("../validators/test_validators_shared.jl")
