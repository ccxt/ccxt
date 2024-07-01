import functools
import inspect
import os
import random
import sys
from typing import Callable, List, Optional

import pytest
from mypy_extensions import NamedArg


def _get_seeds(n_nightly_runs: int, seed: Optional[int]) -> List[int]:
    """
    Gets a list of seeds based on environment variables and the seed function argument.
    If RANDOM_TEST_N_RUNS is specified, returns a list of RANDOM_TEST_N_RUNS random seeds.
    """
    n_iters_env_var = os.environ.get("RANDOM_TEST_N_RUNS")
    if n_iters_env_var is None:
        n_iters = n_nightly_runs if (os.environ.get("NIGHTLY_TEST") == "1") else 1
    else:
        return [random.randrange(sys.maxsize) for _ in range(int(n_iters_env_var))]

    seed_env_var = os.environ.get("RANDOM_TEST_SEED")
    if seed_env_var == "random":
        return [random.randrange(sys.maxsize) for _ in range(n_iters)]
    elif seed_env_var is not None:
        return [int(seed_env_var)]
    elif seed is not None:
        return [seed]

    # If we got here, then the seed wasn't set with an environment variable or a function argument.
    if os.environ.get("NIGHTLY_TEST") == "1":
        return [random.randrange(sys.maxsize) for _ in range(n_iters)]
    return [0]


def _print_seed(seed: int, decorator_name: str):
    print(f"The seed used in the test is {seed}.")
    print(f"To reproduce the results set the environment variable RANDOM_TEST_SEED to {seed}.")
    print(
        f"(This can be done by adding 'RANDOM_TEST_SEED={seed}' at the beginning of the command)."
    )
    print(f"Alternatively, you can add 'seed={seed}' to the '{decorator_name}' decorator")


def _convert_function_to_function_or_coroutine(
    caller_func: Callable, callee_func: Callable
) -> Callable:
    """
    Gets a function `caller_func` and a function or co-routine `callee_func`.
    `caller_func` is expected to yield values of the form `callee_func(...)` (which are either
    values or tasks).
    Converts `caller_func` into a function or coroutine that runs all the yielded calls in
    caller_function and awaits them if they are tasks.
    Uses the callee function to determine the name and args of the returned function.
    Exceptions that were thrown will be raised into the caller function.
    """
    if inspect.iscoroutinefunction(callee_func):

        @functools.wraps(callee_func)
        async def return_value(*args, **kwargs):
            gen = caller_func(*args, **kwargs)
            for run in gen:
                try:
                    await run
                except Exception as e:
                    gen.throw(e)

    else:

        @functools.wraps(callee_func)
        def return_value(*args, **kwargs):
            for run in caller_func(*args, **kwargs):
                pass

    return return_value


def random_test(n_nightly_runs: int = 10, seed: Optional[int] = None):
    """
    A decorator for random tests that fixates the python global random object with a seed. In
    non-nightly runs, the seed is constant. In nightly runs, the test will run multiple times with
    random seeds.
    Currently, non-nightly runs will run with a random seed. This will be changed soon.

    Assumes that the test receives a `seed` parameter. It doesn't need to do anything with it.

    The test will print the seed upon failure.
    Can also receive a seed to fixate the test with. If it got a seed, it will run the test once
    with that seed even on nightly runs.

    The seed can also be fixed by setting the `RANDOM_TEST_SEED` environment variable to the desired
    seed. If it is set to `random` a random seed will be used. If the seed is set to a number then
    the test will run only once.
    If the `RANDOM_TEST_N_RUNS` environment variable is defined, the test will run that many times
    (both in non-nightly runs and nightly runs).
    Setting the environment variable can be done by prefixing the command line with
    `RANDOM_TEST_SEED=10` for example.
    """

    def convert_test_func(test_func: Callable):
        seeds = _get_seeds(n_nightly_runs=n_nightly_runs, seed=seed)

        def fixate_seed_and_yield_test_run(*args, seed, **kwargs):
            old_state = random.getstate()
            random.seed(seed)
            try:
                yield test_func(*args, seed=seed, **kwargs)
            except Exception:
                _print_seed(seed=seed, decorator_name="random_test")
                raise
            finally:
                random.setstate(old_state)

        # We need to use pytest.mark.parametrize rather than running the test in a for loop. If we
        # do the latter, pytest won't re-create the fixtures for each run.
        return pytest.mark.parametrize("seed", seeds)(
            _convert_function_to_function_or_coroutine(
                caller_func=fixate_seed_and_yield_test_run, callee_func=test_func
            )
        )

    return convert_test_func


def parametrize_random_object(n_nightly_runs: int = 10, seed: Optional[int] = None):
    """
    A decorator for random tests that passes as a parameter a random object with a seed. In
    non-nightly runs, the seed is constant. In nightly runs, the test will run multiple times with
    random seeds.
    Currently, non-nightly runs will run with a random seed. This will be changed soon.

    The test will print the seed upon failure.
    Can also receive a seed to fixate the test with. If it got a seed, it will run the test once
    with that seed even on nightly runs.

    For explanation on environment variables, read the doc of the `random_test` decorator.
    """

    def convert_test_func(
        test_func: Callable[[NamedArg(type=random.Random, name="random_object")], None]
    ):
        seeds = _get_seeds(n_nightly_runs=n_nightly_runs, seed=seed)

        def fixate_seed_and_yield_test_run(*args, **kwargs):
            yield test_func(*args, **kwargs)

        return pytest.mark.parametrize(
            "random_object",
            [random.Random(seed) for seed in seeds],
            ids=[f"Random({seed})" for seed in seeds],
        )(
            _convert_function_to_function_or_coroutine(
                caller_func=fixate_seed_and_yield_test_run, callee_func=test_func
            )
        )

    return convert_test_func
