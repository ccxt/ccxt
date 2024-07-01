import json
import tempfile
from typing import Any, Dict, Optional

from starkware.starknet.compiler.v1.compile import JsonObject, compile_sierra_to_casm
from starkware.starknet.services.api.contract_class.contract_class import (
    CompiledClass,
    ContractClass,
)


def compile_contract_class(
    contract_class: ContractClass,
    compiler_args: Optional[str] = None,
    allowed_libfuncs_list_name: Optional[str] = None,
    allowed_libfuncs_list_file: Optional[str] = None,
    compiler_dir: Optional[str] = None,
    memory_limit_in_mb: Optional[int] = None,
    max_bytecode_size: Optional[int] = None,
) -> CompiledClass:
    """
    Compiles a contract class to a compiled class.
    """
    # Extract Sierra representation from the contact class.
    sierra = contract_class.dump()
    sierra.pop("abi", None)

    # Create a temporary Sierra file.
    with tempfile.NamedTemporaryFile(mode="w") as sierra_file:
        # Obtain temp file name.
        temp_sierra_file_name = sierra_file.name
        # Write the contract class Sierra representation to the sierra file.
        json.dump(obj=sierra, fp=sierra_file, indent=2)

        # Flush the Sierra content to the file.
        sierra_file.flush()

        # Compile the Sierra file.
        casm_from_compiled_sierra = compile_sierra_to_casm(
            sierra_path=temp_sierra_file_name,
            compiler_args=compiler_args,
            add_pythonic_hints=True,
            allowed_libfuncs_list_name=allowed_libfuncs_list_name,
            allowed_libfuncs_list_file=allowed_libfuncs_list_file,
            compiler_dir=compiler_dir,
            memory_limit_in_mb=memory_limit_in_mb,
            max_bytecode_size=max_bytecode_size,
        )

    # Parse the resultant Casm file.
    return CompiledClass.load(data=casm_from_compiled_sierra)


def load_file(path: str) -> JsonObject:
    with open(path, "r") as fp:
        return json.load(fp)


def load_sierra(sierra_path: str) -> ContractClass:
    sierra = load_file(path=sierra_path)
    return load_sierra_from_dict(sierra=sierra)


def load_sierra_from_dict(sierra: JsonObject) -> ContractClass:
    sierra.pop("sierra_program_debug_info", None)
    convert_sierra_program_abi_to_string(sierra_program=sierra)
    return ContractClass.load(data=sierra)


def convert_sierra_program_abi_to_string(sierra_program: Dict[str, Any]):
    if "abi" in sierra_program:
        assert isinstance(sierra_program["abi"], list), "Unexpected ABI type."
        sierra_program["abi"] = json.dumps(obj=sierra_program["abi"])
