import asyncio
import bisect
import contextlib
import itertools
import logging
import os
import random
import re
import subprocess
import threading
import time
from collections import UserDict
from concurrent.futures import Executor
from typing import (
    Any,
    AsyncContextManager,
    AsyncGenerator,
    AsyncIterable,
    AsyncIterator,
    Awaitable,
    Callable,
    Coroutine,
    Dict,
    Generic,
    Iterable,
    Iterator,
    List,
    Mapping,
    Optional,
    Sequence,
    Tuple,
    TypeVar,
)

import yaml
from typing_extensions import Literal, ParamSpec, Protocol

from starkware.python.math_utils import div_ceil

# All functions with stubs are imported from this module.
from starkware.python.utils_stub_module import *  # noqa

DIR = os.path.dirname(__file__)


T = TypeVar("T")
P = ParamSpec("P")
K = TypeVar("K")
V = TypeVar("V")
TAsyncGenerator = TypeVar("TAsyncGenerator", bound=AsyncGenerator)
NumType = TypeVar("NumType", int, float)
HASH_BYTES = 32

# If more shared types start popping up here extract to types.py.
Endianness = Literal["big", "little"]
TComparable = TypeVar("TComparable", bound="Comparable")


class Comparable(Protocol):
    """
    A protocol for comparable classes.
    Used for type annotation.
    """

    def __eq__(self, other: Any) -> bool:
        pass

    def __lt__(self: TComparable, other: TComparable) -> bool:
        pass

    def __gt__(self: TComparable, other: TComparable) -> bool:
        pass

    def __le__(self: TComparable, other: TComparable) -> bool:
        pass

    def __ge__(self: TComparable, other: TComparable) -> bool:
        pass


class TriviallyCopyable:
    """
    Implements trivially the '__copy__' and the '__deepcopy__' methods. I.e., the following holds:
    obj is copy(obj) and obj is deepcopy(obj).
    """

    def __deepcopy__(self, memo):
        return self

    def __copy__(self):
        return self


class TriviallyCopyableCallback(TriviallyCopyable, Generic[T]):
    """
    Pypy's deepcopy has a bug with copying some objects, such as functions.
    This class wrapps callable objects and implements the expected behaviour of the copy
    functions on functions (which is trivial; see copy.py documentation).
    """

    def __init__(self, callback: Callable[..., T]):
        self._callback = callback

    def __call__(self, *args: Any, **kwargs: Any) -> T:
        return self._callback(*args, **kwargs)


def get_package_path():
    """
    Returns ROOT_PATH s.t. $ROOT_PATH/starkware is the package folder.
    """
    import starkware.python

    return os.path.abspath(os.path.join(os.path.dirname(starkware.python.__file__), "../../"))


def climb(path: str, levels_to_climb: int = 1) -> str:
    """
    Returns a path of k-parent.

    for example:
        climb(path="src/starkware/python/utils.py" ,levels_to_climb=2)
        returns "src/starkware"
    """
    result = path
    for _ in range(levels_to_climb):
        result = os.path.dirname(result)

    return result


def get_build_dir_path(rel_path=""):
    """
    Returns a path to a file inside the build directory (or the docker).

    rel_path is the relative path of the file with respect to the build directory, e.g.:
    src/starkware/python/utils.py.
    """

    if "RUNFILES_DIR" in os.environ:
        # We run in a bazel test context, hence the 'RUNFILES_DIR' environment variable is defined.
        build_root = os.path.join(os.environ["RUNFILES_DIR"], "__main__")
    else:
        # Get the workspace path, which is at distance three, due to the location of this file.
        assert DIR.endswith("starkware/python"), f"Wrong path : DIR = {DIR}"
        build_root = climb(path=DIR, levels_to_climb=3)

    return os.path.join(build_root, rel_path)


def get_source_dir_path(rel_path: str = "", default_value: Optional[str] = None):
    """
    Returns a path to a file inside the source directory. Does not work in docker.
    rel_path is the relative path of the file with respect to the source directory.
    """

    if "BUILD_WORKSPACE_DIRECTORY" in os.environ:
        source_root = os.environ["BUILD_WORKSPACE_DIRECTORY"]
        assert os.path.exists(os.path.join(source_root, "src"))
        return os.path.join(source_root, rel_path)

    # If we don't run in a Bazel context, return the default value.
    if default_value is not None:
        return default_value

    raise Exception(f"Failed to get source path for {rel_path}.")


def deduce_absolute_path(path: str) -> str:
    """
    Returns the given path if it is absolute, and otherwise joins it with the current working
    directory.
    This function is useful when using Bazel, which changes the current working directory.

    Important note: This function assumes that the code is being run using Bazel.
    """

    if os.path.isabs(path):
        return path

    # The path is considered to be relative to the current working directory.
    build_working_directory = os.getenv("BUILD_WORKING_DIRECTORY")
    assert (
        build_working_directory is not None
    ), "Could not deduce your working directory path; please run your code using Bazel."
    return os.path.join(build_working_directory, path)


def assert_same_and_get(*args):
    """
    Verifies that all the arguments are the same, and returns this value.
    For example, assert_same_and_get(5, 5, 5) will return 5, and assert_same_and_get(0, 1) will
    raise an AssertionError.
    """
    assert len(set(args)) == 1, "Values are not the same (%s)" % (args,)
    return args[0]


def assert_exhausted(iterator: Iterator):
    """
    Verifies that given iterator is empty.
    """
    assert all(False for _ in iterator), "Iterator is not empty."


def unique(x):
    """
    Removes duplicates while preserving order.
    """
    return list(dict.fromkeys(x).keys())


def unique_ordered_union(x, y):
    """
    Returns a list containing the union of 'x' and 'y', preserving order and removing duplicates.
    """
    return list(dict.fromkeys(list(x) + list(y)).keys())


def as_non_optional(value: Optional[T]) -> T:
    """
    Verifies that 'value' is not None and returns it.
    """
    assert value is not None
    return value


def add_counters(x: Mapping[T, NumType], y: Mapping[T, NumType]) -> Dict[T, NumType]:
    """
    Given two dicts x, y, returns a dict d s.t.
      d[k] = x[k] + y[k]
    """
    return {k: x.get(k, 0) + y.get(k, 0) for k in unique_ordered_union(x.keys(), y.keys())}


def sub_counters(x: Mapping[T, NumType], y: Mapping[T, NumType]) -> Dict[T, NumType]:
    """
    Given two dicts x, y, returns a dict d s.t.
      d[k] = x[k] - y[k]
    """
    return {k: x.get(k, 0) - y.get(k, 0) for k in unique_ordered_union(x.keys(), y.keys())}


def multiply_counter_by_scalar(scalar: NumType, counter: Mapping[T, NumType]) -> Dict[T, NumType]:
    """
    Given a non-negative scalar and a counter, returns a dict d s.t.
      d[k] = scalar * counter[k]
    """
    return {k: scalar * v for k, v in counter.items()}


def is_in_sorted_sequence(sorted_sequence: Sequence[TComparable], item: TComparable) -> bool:
    """
    Returns True if and only if the given item is in the given sorted sequence.
    """
    index = bisect.bisect_left(sorted_sequence, item)
    if index == len(sorted_sequence):
        return False

    return sorted_sequence[index] == item or sorted_sequence[index] is item


def indent(code, indentation):
    """
    Indent code by 'indentation' spaces.
    For example, indent('hello\nworld\n', 2) -> '  hello\n  world\n'.
    """
    if len(code) == 0:
        return code
    if isinstance(indentation, int):
        indentation = " " * indentation
    elif not isinstance(indentation, str):
        raise TypeError(f"Supports only int or str, got {type(indentation).__name__}")

    # Replace every occurrence of \n, with \n followed by indentation,
    # unless the \n is the last characther of the string or is followed by another \n.
    # We enforce the "not followed by ..." condition using negative lookahead (?!\n|$),
    # looking for end of string ($) or another \n.
    return indentation + re.sub(r"\n(?!\n|$)", "\n" + indentation, code)


def join_lines(lines: Iterable[str]) -> str:
    return "\n".join(lines)


def get_random_instance() -> random.Random:
    """
    Returns the Random instance in the random module level.
    """
    return random._inst  # type: ignore[attr-defined]


def initialize_random(
    random_object: Optional[random.Random] = None, seed: Optional[int] = None
) -> random.Random:
    """
    Returns a Random object initialized according to the given parameters.
    If both are None, the Random instance instantiated in the random module is returned.
    """
    if random_object is not None:
        return random_object

    return random.Random(seed) if seed is not None else get_random_instance()


def get_random_bytes(random_object: Optional[random.Random] = None, *, n: int):
    """
    Returns a random bytes object of length n.
    NOTE: This function is unsafe and should only be used for testing.
    """
    r = initialize_random(random_object=random_object)
    return bytes(r.getrandbits(8) for _ in range(n))


def compare_files(src, dst, fix):
    """
    If 'fix' is False, checks that the files are the same.
    If 'fix' is True, overrides dst with src.
    """
    subprocess.check_call(["cp" if fix else "diff", src, dst])


def remove_trailing_spaces(code):
    """
    Removes spaces from end of lines.
    For example, remove_trailing_spaces('hello \nworld   \n') -> 'hello\nworld\n'.
    """
    return re.sub(" +$", "", code, flags=re.MULTILINE)


def should_discard_key(key, exclude: List[str]) -> bool:
    return any(field_to_discard in key for field_to_discard in exclude)


def discard_key(d: dict, key, to_replace_by: Optional[str]):
    if to_replace_by is None:
        del d[key]
    else:
        d[key] = to_replace_by


class WriteOnceDict(UserDict):
    """
    Write once dictionary.
    A Dict that enforces that each key is set only once.
    Trying to set an existing key to its current value also raises an AssertionError.
    """

    def __setitem__(self, key, value):
        assert (
            key not in self.data
        ), f"Trying to set key={key} to '{value}' but key={key} is already set to '{self[key]}'."
        self.data[key] = value


def camel_to_snake_case(camel_case_name: str) -> str:
    """
    Converts a name with Capital first letters to lower case with '_' as separators.
    For example, CamelToSnakeCase -> camel_to_snake_case.
    """
    return (camel_case_name[0] + re.sub(r"([A-Z])", r"_\1", camel_case_name[1:])).lower()


def snake_to_camel_case(snake_case_name: str) -> str:
    """
    Converts the first letter to upper case (if possible) and all the '_l' to 'L'.
    For example snake_to_camel_case -> SnakeToCamelCase.
    """
    return re.subn(r"(^|_)([a-z])", lambda m: m.group(2).upper(), snake_case_name)[0]


async def cancel_futures(*futures: asyncio.Future):
    """
    Cancels given futures and awaits on them in order to reveal exceptions.
    Used in a process' teardown.
    """
    for future in futures:
        future.cancel()

    for future in futures:
        try:
            await future
        except asyncio.CancelledError:
            pass


def composite(*funcs):
    """
    Returns the composition of all the given functions, which is a function that runs the last
    function with the input args, and then runs the function before that with the return value of
    the last function and so on. Finally, the composition function will return the return value of
    the first function.

    Every function beside the last function should receive one argument.

    For example:
      f = composite(lambda x: x * 5, lambda x, y: x + y)
      assert f(2, 3) == (2 + 3) * 5
    """
    assert len(funcs) > 0

    def composition_function(*args, **kwargs):
        return_value: Any = funcs[-1](*args, **kwargs)
        for func in reversed(funcs[:-1]):
            return_value = func(return_value)
        return return_value

    return composition_function


def to_bytes(
    value: int,
    length: Optional[int] = None,
    byte_order: Optional[Endianness] = None,
    signed: Optional[bool] = None,
) -> bytes:
    """
    Converts the given integer to a bytes object of given length and byte order.
    The default values are 32B width (which is the hash result width) and 'big', respectively.
    """
    if length is None:
        length = HASH_BYTES

    if byte_order is None:
        byte_order = "big"

    if signed is None:
        signed = False

    return int.to_bytes(value, length=length, byteorder=byte_order, signed=signed)


def from_bytes(
    value: bytes,
    byte_order: Optional[Endianness] = None,
    signed: Optional[bool] = None,
) -> int:
    """
    Converts the given bytes object (parsed according to the given byte order) to an integer.
    Default byte order is 'big'.
    """
    if byte_order is None:
        byte_order = "big"

    if signed is None:
        signed = False

    return int.from_bytes(value, byteorder=byte_order, signed=signed)


def hex_to_bytes(hex_str: str) -> bytes:
    hex_chars = hex_str.replace("0x", "").lower()
    assert set(hex_chars).issubset(set("0123456789abcdef")), f"Invalid hex string: {hex_str}."
    if len(hex_chars) % 2 == 1:
        hex_chars = "0" + hex_chars
    return bytes.fromhex(hex_chars)


def blockify(data, chunk_size: int) -> Iterable:
    """
    Returns the given data partitioned to chunks of chunks_size (last chunk might be smaller).
    """
    assert chunk_size > 0, f"chunk_size must be greater than 0. Got: {chunk_size}."
    return (data[i : i + chunk_size] for i in range(0, len(data), chunk_size))


def iter_blockify(data: Iterable[T], chunk_size: int) -> Iterable[List[T]]:
    """
    Returns the given data partitioned to tuple-chunks of chunks_size (last chunk might be smaller).
    """
    assert chunk_size > 0, f"chunk_size must be greater than 0. Got: {chunk_size}."

    iterator = iter(data)
    while True:
        chunk = list(itertools.islice(iterator, chunk_size))
        if len(chunk) == 0:
            break

        yield chunk


async def gather_in_chunks(
    awaitables: Iterable[Awaitable[T]], chunk_size: Optional[int] = None
) -> List[T]:
    """
    Awaits on the given awaitables using asyncio.gather in chunks of chunk_size;
    Returns a list containing the results.
    """
    return [
        element
        async for element in gen_gather_in_chunks(awaitables=awaitables, chunk_size=chunk_size)
    ]


async def gen_gather_in_chunks(
    awaitables: Iterable[Awaitable[T]], chunk_size: Optional[int] = None
) -> AsyncIterable[T]:
    """
    Awaits on the given awaitables using asyncio.gather in chunks of chunk_size;
    Yields the results.
    """
    chunk_size = 100 if chunk_size is None else chunk_size
    for awaitable_chunk in iter_blockify(data=awaitables, chunk_size=chunk_size):
        chunk = await asyncio.gather(*awaitable_chunk)

        for element in chunk:
            yield element


async def process_concurrently(
    func: Callable[[T], V], items: Sequence[T], n_chunks: int, executor: Optional[Executor] = None
) -> List[V]:
    """
    Divides the items into `n_chunks` chunks, and for each chunk, in an executor,
    executes the specified function on each item.

    The reason for working in chunks (instead of submitting each item to a thread) is to control
    the overhead caused by having many threads and tasks open in case of a big item list
    (a few dozen).

    An alternative way to control this overhead is to use `gather_in_chunks`, but it is
    less efficient (probably because it waits until the entire chunk is ready before starting a new
    one, and eventually it still opens many tasks).
    """
    if len(items) == 0:
        return []

    assert n_chunks > 0, f"n_chunks must be greater than 0; got: {n_chunks}."

    def chunkified_func(chunk: Sequence[T]) -> List[V]:
        return list(map(func, chunk))

    loop = asyncio.get_event_loop()
    result_chunks: List[List[V]] = await asyncio.gather(
        *(
            loop.run_in_executor(executor, chunkified_func, chunk)
            for chunk in blockify(items, chunk_size=div_ceil(len(items), n_chunks))
        )
    )
    return [v for chunk in result_chunks for v in chunk]


def all_subclasses(cls: type) -> List[type]:
    """
    Recursively finds all subclasses of a given class.
    """
    return list(set(_all_subclasses(cls)))


def _all_subclasses(cls: type) -> List[type]:
    return [cls] + list(
        itertools.chain(*[_all_subclasses(subclass) for subclass in cls.__subclasses__()])
    )


def get_exception_repr(exception: Exception) -> str:
    return f"{type(exception).__name__}({exception})"


def func_args_to_string(
    func: Callable, args: List[Any], kwargs: Dict[str, Any], exclude_params: List[str]
) -> str:
    """
    Formats the given function's arguments in the following way:
      <arg1_name>=<arg1_value>, <arg2_name>=<arg2_value>, ...
    """
    arg_names = func.__code__.co_varnames
    formatted_args: List[str] = []

    for name in arg_names:
        if len(args) > 0:
            if name != "self" and name not in exclude_params:
                formatted_args.append(f"{name}={args[0]}")

            args = args[1:]
        elif name in kwargs and name not in exclude_params:
            formatted_args.append(f"{name}={kwargs[name]}")

    return ", ".join(formatted_args)


@contextlib.contextmanager
def log_time(logger: logging.Logger, name: str):
    """
    Logs the elapsed time in seconds.

    Example:
        with log_time(logger=logger, name="Foo"):
            sleep(1)
    """
    start = time.time()
    try:
        yield
    finally:
        logger.info(f"Ran '{name}'. Elapsed: {time.time() - start}.")


def to_ascii_string(value: str) -> str:
    """
    Converts the given string to an ascii-encodeable one by replacing non-ascii characters with '?'.
    """
    return value.encode("ascii", "replace").decode("ascii")


def update_yaml_file(file_path: str, data: Dict[str, Any]):
    """
    Updates yaml file in given path with given data.
    """
    with open(file_path, "w") as fp:
        fp.write(yaml.dump(data=data, default_flow_style=False, width=400))
        fp.flush()


def execute_coroutine_threadsafe(
    coroutine: Coroutine[Any, Any, T], loop: asyncio.AbstractEventLoop
) -> T:
    """
    Submits a coroutine object to a given event loop and returns the result.
    """
    # Verify we are not inside the main thread (as this will block it).
    coroutine_name = coroutine.__name__  # type: ignore[attr-defined]
    # NOTE: this is not accurate. A running event loop has an associated (unique)
    #   thread, so running 'run_coroutine_threadsafe' will block if called from that thread, not
    #   necessaily the main.
    assert (
        threading.current_thread() is not threading.main_thread()
    ), f"Cannot run {coroutine_name} synchronously in main thread."

    future = asyncio.run_coroutine_threadsafe(coro=coroutine, loop=loop)
    return future.result()


class aclosing(contextlib.AbstractAsyncContextManager, Generic[TAsyncGenerator]):
    """
    Async context manager for safely finalizing an asynchronously cleaned-up resource such as an
    async generator, calling its 'aclose()' method.

    This cleanup does not necessarily happen implicitly if a break (or exception) is coming from
    the external loop. For example, see the test of this object.

    See https://peps.python.org/pep-0533/ for more info.
    """

    def __init__(self, agen: TAsyncGenerator):
        self.agen = agen

    async def __aenter__(self) -> TAsyncGenerator:
        return self.agen

    async def __aexit__(self, *exc_info):
        await self.agen.aclose()


def aclosing_context_manager(
    function: Callable[P, TAsyncGenerator]
) -> Callable[P, AsyncContextManager[TAsyncGenerator]]:
    """
    Wraps a function that returns an async generator with aclosing context manager.
    """

    def wrapper(*args, **kwargs):
        return aclosing(agen=function(*args, **kwargs))

    return wrapper


async def aenumerate(aiterable: AsyncIterable[T], start: int = 0) -> AsyncIterator[Tuple[int, T]]:
    """
    Asynchronously enumerates an async iterable from a given start value.
    """
    counter = itertools.count(start)
    async for element in aiterable:
        yield next(counter), element


def from_hex_str_to_bytes_str(hex_str: str) -> str:
    return to_bytes(int(hex_str, 16)).hex()


def from_hex_str_to_decimal_str(hex_str: str) -> str:
    return str(int(hex_str, 16))


def subtract_mappings(a: Mapping[K, V], b: Mapping[K, V]) -> Mapping[K, V]:
    """
    Returns a mapping containing key-value pairs from a that are not included in b (if
    a key appears in b with a different value, it will be part of the output).
    Uses to take only updated cells from a mapping.
    """
    return dict(a.items() - b.items())
