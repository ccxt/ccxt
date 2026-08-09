# Group: fixtures_init — loads only the offline exchange constructor helper
# (`static_init_offline`), its JSON fixture loader and the `FIXTURE_EXCHANGES`
# registry, with no @testset bodies.
#
# This is the cheap dependency the `validators_pass` group needs (it builds an
# offline exchange to exercise the structure validators); it deliberately does
# NOT pull in the fixture drivers, which is what `static_drivers` is for.
include("../fixtures/static_init_offline.jl")
