# Offline Pro (WebSocket) base test for `Future` — the settle-from-outside
# promise that every WS subscription hands its messages through
# (`src/wsbase.jl`, ported from `ts/src/base/ws/Future.ts`).
#
# This file is hand-written rather than transpiled, because the upstream test
# only exists in Python: `python/ccxt/pro/test/base/test_future.py`, which
# `python/ccxt/pro/test/base/tests_init.py` executes via `await test_ws_future()`.
# There is no `ts/src/pro/test/base/test.future.ts` to transpile from, so the
# Julia suite would otherwise have no coverage of `Future` at all. Every case
# below mirrors one Python test function, named after it, so the two suites stay
# comparable:
#
#   test_resolve_before             -> "resolve before await"
#   test_reject                     -> "reject"
#   test_race_success_before        -> "race resolves with an already-resolved input"
#   test_race_success_after         -> "race resolves with a later-resolved input"
#   test_race_return_first_exception-> "race propagates the first rejection"
#   test_cancel                     -> "cancel while awaiting"
#   test_await_canceled_future      -> "await an already-cancelled future"
#   test_race_cancel                -> "cancelling the raced future"
#   test_race_mixed_outcomes        -> "race keeps the first winner"
#   test_race_with_wait_for_timeout -> "race that outlives its timeout"
#   test_race_with_wait_for_completion -> "race that beats its timeout"
#   test_race_with_precompleted_future -> "race prioritises a pre-completed input"
#   test_closed_by_user             -> "race propagates ExchangeClosedByUser"
#
# Python's `asyncio.CancelledError` maps to `Ccxt.CancelledError`, and
# `asyncio.wait_for(..., timeout)` maps to `withTimeout` below, which races the
# future against a timer task.

using Ccxt: Future, CancelledError, ExchangeClosedByUser, resolve, reject, cancel, race,
    isDone, isCancelled, isPending

# Settle `future` after `delay` seconds, from another task. Mirrors the
# `resolve_later` / `reject_later` / `cancel_later` helpers in test_future.py.
#
# NOTE: `Base.sleep` must be spelled out in this file. `test/setup.jl` imports
# CCXT's own `sleep` helper into `Main` (it is in `_CCXT_NOSELF_UTILS`), and
# that one takes *milliseconds* and returns a `Task` immediately instead of
# blocking — so a bare `sleep(0.4)` here would return at once and every "later"
# helper would settle its future synchronously.
resolveLater(future, result, delay) = @async begin
    Base.sleep(delay)
    resolve(future, result)
end

rejectLater(future, err, delay) = @async begin
    Base.sleep(delay)
    reject(future, err)
end

cancelLater(future, delay) = @async begin
    Base.sleep(delay)
    cancel(future)
end

# `asyncio.wait_for(fut, timeout)` equivalent: return the future's value, or
# throw `TimeoutError` once `timeout` seconds elapse. Implemented on top of
# `race` so the timeout path exercises the same code the library uses.
struct FutureTimeoutError <: Exception end

function withTimeout(future::Future, timeout::Real)
    timer = Future()
    @async begin
        Base.sleep(timeout)
        reject(timer, FutureTimeoutError())
    end
    return Base.fetch(race([future, timer]))
end

function testWsFuture()
    @testset "future" begin
        @testset "resolve before await" begin
            future = Future()
            resolve(future, "test")
            @test isDone(future)
            @test Base.fetch(future) == "test"
        end

        @testset "reject" begin
            future = Future()
            reject(future, ErrorException("test error"))
            @test isDone(future)
            @test_throws ErrorException Base.fetch(future)
            err = try
                Base.fetch(future)
                nothing
            catch e
                e
            end
            @test err.msg == "test error"
        end

        @testset "race resolves with an already-resolved input" begin
            future1 = Future()
            future2 = Future()
            raceFuture = race([future1, future2])
            resolve(future1, "first")
            @test Base.fetch(raceFuture) == "first"
            cancel(future2)
        end

        @testset "race resolves with a later-resolved input" begin
            future1 = Future()
            future2 = Future()
            raceFuture = race([future1, future2])
            resolveLater(future1, "first", 0.01)
            @test Base.fetch(raceFuture) == "first"
            cancel(future2)
        end

        @testset "race propagates the first rejection" begin
            future1 = Future()
            raceFuture = race([future1])
            reject(future1, ErrorException("Error in future1"))
            err = try
                Base.fetch(raceFuture)
                nothing
            catch e
                e
            end
            @test err isa ErrorException
            @test err.msg == "Error in future1"
        end

        @testset "cancel while awaiting" begin
            future = Future()
            cancelLater(future, 0.05)
            @test_throws CancelledError Base.fetch(future)
        end

        @testset "await an already-cancelled future" begin
            future = Future()
            cancel(future)
            @test isCancelled(future)
            @test_throws CancelledError Base.fetch(future)
        end

        @testset "cancelling the raced future" begin
            future1 = Future()
            future2 = Future()
            raceFuture = race([future1, future2])
            cancel(raceFuture)
            # A late winner must not overwrite the cancellation.
            resolve(future1, "success")
            @test_throws CancelledError Base.fetch(raceFuture)
            cancel(future2)
        end

        @testset "race keeps the first winner" begin
            future1 = Future()
            future2 = Future()
            raceFuture = race([future1, future2])
            resolve(future1, "first")
            rejectLater(future2, ErrorException("Error in future2"), 0.05)
            @test Base.fetch(raceFuture) == "first"
            cancel(future2)
        end

        @testset "race that outlives its timeout" begin
            future1 = Future()
            task = resolveLater(future1, "completed first", 0.4)
            @test_throws FutureTimeoutError withTimeout(race([future1]), 0.1)
            Base.wait(task)
        end

        @testset "race that beats its timeout" begin
            future1 = Future()
            future2 = Future()
            task = resolveLater(future1, "completed first", 0.05)
            @test withTimeout(race([future1, future2]), 1.0) == "completed first"
            Base.wait(task)
            cancel(future2)
        end

        @testset "race prioritises a pre-completed input" begin
            future1 = Future()
            future2 = Future()
            resolve(future1, "immediate success")
            raceFuture = race([future1, future2])
            @test Base.fetch(raceFuture) == "immediate success"
            cancel(future2)
        end

        @testset "race propagates ExchangeClosedByUser" begin
            future1 = Future()
            future2 = Future()
            raceFuture = race([future1, future2])
            task1 = rejectLater(future1, ExchangeClosedByUser("closed"), 0.05)
            task2 = rejectLater(future2, ExchangeClosedByUser("closed"), 0.05)
            @test_throws ExchangeClosedByUser Base.fetch(raceFuture)
            Base.wait(task1)
            Base.wait(task2)
            @test istaskdone(task1)
            @test istaskdone(task2)
        end

        # Beyond the Python cases: `subscribe` is the synchronous notification
        # path `race` is built on, and its unsubscribe closure is what keeps a
        # repeatedly-raced future from accumulating dead handlers.
        @testset "subscribe fires synchronously and unsubscribes" begin
            future = Future()
            seen = String[]
            unsubscribe = subscribe(future, v -> push!(seen, "fulfil:" * string(v)),
                                    e -> push!(seen, "reject"))
            @test seen == String[]
            resolve(future, "x")
            @test seen == ["fulfil:x"]
            unsubscribe()

            pending = Future()
            dropped = subscribe(pending, _ -> push!(seen, "should not fire"),
                                _ -> push!(seen, "should not fire"))
            dropped()
            resolve(pending, "y")
            @test seen == ["fulfil:x"]
        end

        @testset "settling is idempotent" begin
            future = Future()
            resolve(future, "first")
            resolve(future, "second")
            reject(future, ErrorException("ignored"))
            cancel(future)
            @test Base.fetch(future) == "first"
        end
    end
end
