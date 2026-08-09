include(joinpath(@__DIR__, "..", "python", "python_call_main.jl"))

using Test

@testset "python call" begin
    out = run_py(["-c", "print('PYTHONCALL_OK')"])
    @test occursin("PYTHONCALL_OK", out)
end
