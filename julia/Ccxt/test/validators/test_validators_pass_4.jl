# Batch 4 of the validator driver (see test_validators_pass.jl for builders).
@testset "validators: account" begin
    testAccount(_V_EX, _V_SKIP, "fetchAccount", _v_account())
end

@testset "validators: ledgerEntry" begin
    testLedgerEntry(_V_EX, _V_SKIP, "fetchLedger", _v_ledgerEntry("BTC"), "BTC", _V_NOW)
end

@testset "validators: borrowInterest" begin
    testBorrowInterest(_V_EX, _V_SKIP, "fetchBorrowInterest", _v_borrowInterest("USDT"), "USDT", nothing)
end

@testset "validators: borrowRate" begin
    testBorrowRate(_V_EX, _V_SKIP, "fetchBorrowRate", _v_borrowRate("USDT"), "USDT")
end

@testset "validators: depositWithdrawal" begin
    testDepositWithdrawal(_V_EX, _V_SKIP, "fetchDepositsWithdrawals", _v_depositWithdrawal("USDT"), "USDT", _V_NOW)
end

@testset "validators: status" begin
    testStatus(_V_EX, _V_SKIP, "fetchStatus", _v_status(), _V_NOW)
end
