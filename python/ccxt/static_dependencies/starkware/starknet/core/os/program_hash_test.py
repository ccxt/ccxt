import os

from starkware.cairo.bootloaders.program_hash_test_utils import (
    program_hash_test_main,
    run_generate_hash_test,
)
from starkware.python.utils import get_source_dir_path

PROGRAM_PATH = os.path.join(os.path.dirname(__file__), "starknet_os_compiled.json")
HASH_PATH = get_source_dir_path(
    "src/starkware/starknet/core/os/program_hash.json",
    default_value=os.path.join(os.path.dirname(__file__), "program_hash.json"),
)
COMMAND = "generate_starknet_os_program_hash"


def test_starknet_program_hash():
    run_generate_hash_test(
        fix=False, program_path=PROGRAM_PATH, hash_path=HASH_PATH, command=COMMAND
    )


if __name__ == "__main__":
    program_hash_test_main(program_path=PROGRAM_PATH, hash_path=HASH_PATH, command=COMMAND)
