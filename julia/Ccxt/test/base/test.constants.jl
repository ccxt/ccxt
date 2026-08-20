using Test
using Ccxt
function testConstants()

    @test ROUND == 1
    @test TRUNCATE == 0
    @test ROUND_UP == 2
    @test ROUND_DOWN == 3
    @test DECIMAL_PLACES == 2
    @test SIGNIFICANT_DIGITS == 3
    @test TICK_SIZE == 4
    @test NO_PADDING == 5
    @test PAD_WITH_ZERO == 6
end
