import os

import cachetools

from starkware.cairo.bootloaders.hash_program import compute_program_hash_chain
from starkware.cairo.lang.compiler.program import Program

STARKNET_OS_COMPILED_PATH = os.path.join(os.path.dirname(__file__), "starknet_os_compiled.json")


@cachetools.cached(cache={})
def get_os_program() -> Program:
    with open(STARKNET_OS_COMPILED_PATH, "r") as file:
        return Program.loads(data=file.read())


@cachetools.cached(cache={})
def get_os_program_hash() -> int:
    program = get_os_program()
    return compute_program_hash_chain(program=program, use_poseidon=False)
