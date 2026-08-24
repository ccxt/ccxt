# Group: validators_pass — exercises the unified-structure validators
# (criterion #1) against valid synthetic parsed data. Each validator in the
# `validators` group is invoked on a synthetic but genuinely-shaped unified
# object (built via `parseNumber`/`safeX` on a real offline exchange), so the
# real validator logic runs end-to-end. Depends on `validators` (defines the
# `test<Structure>` functions) and `fixtures_init` (defines
# `static_init_offline`).
#
# The driver is split into `test_validators_pass_1..4.jl` (six validators each)
# so the work compiles/runs in small chunks instead of one giant include —
# each @testset cold-compiles a heavily meta-programmed validator function, and
# a single monolithic include blew past the suite's wall-clock budget. Splitting
# keeps any one include small enough to finish, and lets a single validator be
# run on its own for a fast edit/test loop.
include("../validators/test_validators_pass.jl")
include("../validators/test_validators_pass_1.jl")
include("../validators/test_validators_pass_2.jl")
include("../validators/test_validators_pass_3.jl")
include("../validators/test_validators_pass_4.jl")
