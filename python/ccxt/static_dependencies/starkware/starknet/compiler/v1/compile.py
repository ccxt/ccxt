import json
import os
import resource
import subprocess
import tempfile
from typing import Any, Dict, List, Optional

import shlex

from starkware.starknet.compiler.v1.compiler_exe_paths import (
    STARKNET_COMPILE_EXE,
    STARKNET_SIERRA_COMPILE_EXE,
)
from starkware.starknet.definitions.error_codes import StarknetErrorCode
from starkware.starkware_utils.error_handling import StarkException

JsonObject = Dict[str, Any]


def get_allowed_libfuncs_list_file(file_name: str) -> str:
    main_dir_path = os.path.dirname(__file__)
    return os.path.join(main_dir_path, file_name + ".json")


def build_sierra_to_casm_compilation_args(
    add_pythonic_hints: bool,
    compiler_args: Optional[str] = None,
    allowed_libfuncs_list_name: Optional[str] = None,
    allowed_libfuncs_list_file: Optional[str] = None,
    max_bytecode_size: Optional[int] = None,
) -> List[str]:
    """
    Returns the compilation arguments for a given starknet contract.
    If the compiler arguments are given explicitly in the argument compiler_args, returns the
    corresponding formatted arguments.
    Otherwise, builds the compiler arguments based on the other inputs.
    """
    if compiler_args is not None:
        assert allowed_libfuncs_list_name is None and allowed_libfuncs_list_file is None, (
            "allowed_libfuncs_list_name or allowed_libfuncs_list_file cannot be used "
            "together with compiler_args."
        )
        return shlex.split(compiler_args)

    additional_args: List[str] = []

    if add_pythonic_hints:
        additional_args.append("--add-pythonic-hints")

    if max_bytecode_size is not None:
        additional_args.append(f"--max-bytecode-size={max_bytecode_size}")

    additional_args += build_allowed_libfuncs_args(
        allowed_libfuncs_list_name=allowed_libfuncs_list_name,
        allowed_libfuncs_list_file=allowed_libfuncs_list_file,
    )

    return additional_args


def build_allowed_libfuncs_args(
    allowed_libfuncs_list_name: Optional[str] = None,
    allowed_libfuncs_list_file: Optional[str] = None,
) -> List[str]:
    if allowed_libfuncs_list_name is None and allowed_libfuncs_list_file is None:
        return []
    elif allowed_libfuncs_list_name is not None and allowed_libfuncs_list_file is None:
        return ["--allowed-libfuncs-list-name", allowed_libfuncs_list_name]
    elif allowed_libfuncs_list_name is None and allowed_libfuncs_list_file is not None:
        return [
            "--allowed-libfuncs-list-file",
            get_allowed_libfuncs_list_file(file_name=allowed_libfuncs_list_file),
        ]
    else:
        raise Exception(
            "allowed_libfuncs_list_name and allowed_libfuncs_list_file cannot be used together."
        )


def compile_cairo_to_sierra(
    cairo_path: str,
    allowed_libfuncs_list_name: Optional[str] = None,
    allowed_libfuncs_list_file: Optional[str] = None,
    single_file: bool = True,
) -> JsonObject:
    """
    Compiles a Starknet Cairo 1.0 contract; returns the resulting Sierra as json.
    """
    additional_args = build_allowed_libfuncs_args(
        allowed_libfuncs_list_name=allowed_libfuncs_list_name,
        allowed_libfuncs_list_file=allowed_libfuncs_list_file,
    )
    if single_file:
        additional_args += ["--single-file"]

    command = [STARKNET_COMPILE_EXE, cairo_path, *additional_args]
    return run_compile_command(command=command)


def compile_sierra_to_casm(
    sierra_path: str,
    add_pythonic_hints: bool,
    compiler_args: Optional[str] = None,
    allowed_libfuncs_list_name: Optional[str] = None,
    allowed_libfuncs_list_file: Optional[str] = None,
    compiler_dir: Optional[str] = None,
    memory_limit_in_mb: Optional[int] = None,
    max_bytecode_size: Optional[int] = None,
) -> JsonObject:
    """
    Compiles a Starknet Sierra contract.
    If compiler_path is None, uses a default compiler.
    Returns the resulting Casm as json.
    """
    if compiler_dir is None:
        compiler_path = STARKNET_SIERRA_COMPILE_EXE
    else:
        compiler_path = os.path.join(compiler_dir, "starknet-sierra-compile")
    additional_args = build_sierra_to_casm_compilation_args(
        compiler_args=compiler_args,
        add_pythonic_hints=add_pythonic_hints,
        allowed_libfuncs_list_name=allowed_libfuncs_list_name,
        allowed_libfuncs_list_file=allowed_libfuncs_list_file,
        max_bytecode_size=max_bytecode_size,
    )

    command = [compiler_path, sierra_path, *additional_args]
    return run_compile_command(command=command, memory_limit_in_mb=memory_limit_in_mb)


def compile_cairo_to_casm(
    cairo_path: str,
    allowed_libfuncs_list_name: Optional[str] = None,
    allowed_libfuncs_list_file: Optional[str] = None,
) -> JsonObject:
    """
    Compiles a Starknet Cairo 1.0 contract to Casm; returns the resulting Casm as json.
    """
    raw_sierra = compile_cairo_to_sierra(
        cairo_path=cairo_path,
        allowed_libfuncs_list_name=allowed_libfuncs_list_name,
        allowed_libfuncs_list_file=allowed_libfuncs_list_file,
    )
    with tempfile.NamedTemporaryFile(mode="w") as sierra_file:
        json.dump(obj=raw_sierra, fp=sierra_file, indent=2)
        sierra_file.flush()

        return compile_sierra_to_casm(
            sierra_path=sierra_file.name,
            add_pythonic_hints=True,
            allowed_libfuncs_list_name=allowed_libfuncs_list_name,
            allowed_libfuncs_list_file=allowed_libfuncs_list_file,
        )


def set_memory_limit(memory_limit_in_mb: Optional[int]):
    if not memory_limit_in_mb:
        limit_in_bytes = resource.RLIM_INFINITY
    else:
        limit_in_bytes = memory_limit_in_mb * 1024 * 1024
    resource.setrlimit(resource.RLIMIT_AS, (limit_in_bytes, resource.RLIM_INFINITY))


def run_compile_command(command: List[str], memory_limit_in_mb: Optional[int] = None) -> JsonObject:
    try:
        result: subprocess.CompletedProcess = subprocess.run(
            command,
            preexec_fn=(lambda: set_memory_limit(memory_limit_in_mb=memory_limit_in_mb)),
            capture_output=True,
        )
    except subprocess.CalledProcessError:
        # The inner command is responsible for printing the error message. No need to print the
        # stack trace of this script.
        raise StarkException(
            code=StarknetErrorCode.COMPILATION_FAILED,
            message="Compilation failed. Invalid file path input.",
        )

    if result is None:
        raise StarkException(
            code=StarknetErrorCode.COMPILATION_FAILED,
            message="Compilation failed.",
        )

    if result.returncode != 0:
        raise StarkException(
            code=StarknetErrorCode.COMPILATION_FAILED,
            message=f"Compilation failed. {result.stderr.decode()}",
        )

    # Read and return the compilation result from the output.
    return json.loads(result.stdout.decode())
