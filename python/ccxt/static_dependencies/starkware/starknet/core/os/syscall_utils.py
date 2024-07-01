import contextlib
import dataclasses
import functools
import os
from typing import Any, Dict, Tuple, Type, Union

import cachetools

from starkware.cairo.common.structs import CairoStructFactory, CairoStructProxy
from starkware.cairo.lang.compiler.ast.cairo_types import (
    CairoType,
    TypeFelt,
    TypePointer,
    TypeStruct,
)
from starkware.cairo.lang.compiler.identifier_definition import StructDefinition
from starkware.cairo.lang.compiler.program import Program
from starkware.cairo.lang.compiler.scoped_name import ScopedName
from starkware.cairo.lang.vm.relocatable import RelocatableValue
from starkware.python.utils import safe_zip
from starkware.starknet.business_logic.execution.execute_entry_point_base import (
    ExecuteEntryPointBase,
)
from starkware.starknet.definitions.error_codes import StarknetErrorCode
from starkware.starkware_utils.error_handling import StarkException

STARKNET_OLD_SYSCALLS_COMPILED_PATH = os.path.join(
    os.path.dirname(__file__), "starknet_syscalls.json"
)
STARKNET_SYSCALLS_COMPILED_PATH = os.path.join(
    os.path.dirname(__file__), "starknet_new_syscalls.json"
)
STARKNET_BUILTINS_COMPILED_PATH = os.path.join(os.path.dirname(__file__), "starknet_builtins.json")

# New syscalls utilities.


@cachetools.cached(cache={})
def get_syscall_structs() -> CairoStructProxy:
    syscalls_program = load_program(path=STARKNET_SYSCALLS_COMPILED_PATH)
    return CairoStructFactory.from_program(program=syscalls_program, additional_imports=[]).structs


@cachetools.cached(cache={})
def get_builtins_structs() -> CairoStructProxy:
    syscalls_program = load_program(path=STARKNET_BUILTINS_COMPILED_PATH)
    return CairoStructFactory.from_program(program=syscalls_program, additional_imports=[]).structs


# Old syscalls utilities.


@dataclasses.dataclass
class DeprecatedSysCallInfo:
    selector: int
    syscall_request_struct: CairoStructProxy
    # The size of the system call struct including both the request and the response.
    syscall_size: int


@cachetools.cached(cache={})
def get_deprecated_syscall_structs_and_info() -> (
    Tuple[CairoStructProxy, Dict[str, DeprecatedSysCallInfo]]
):
    with open(STARKNET_OLD_SYSCALLS_COMPILED_PATH, "r") as file:
        syscalls_program = Program.loads(data=file.read())

    syscall_structs = CairoStructFactory.from_program(
        program=syscalls_program, additional_imports=[]
    ).structs

    get_selector = functools.partial(get_selector_from_program, syscalls_program=syscalls_program)
    syscall_info = {
        "call_contract": DeprecatedSysCallInfo(
            selector=get_selector("call_contract"),
            syscall_request_struct=syscall_structs.CallContractRequest,
            syscall_size=syscall_structs.CallContract.size,
        ),
        "delegate_call": DeprecatedSysCallInfo(
            selector=get_selector("delegate_call"),
            syscall_request_struct=syscall_structs.CallContractRequest,
            syscall_size=syscall_structs.CallContract.size,
        ),
        "delegate_l1_handler": DeprecatedSysCallInfo(
            selector=get_selector("delegate_l1_handler"),
            syscall_request_struct=syscall_structs.CallContractRequest,
            syscall_size=syscall_structs.CallContract.size,
        ),
        "deploy": DeprecatedSysCallInfo(
            selector=get_selector("deploy"),
            syscall_request_struct=syscall_structs.DeployRequest,
            syscall_size=syscall_structs.Deploy.size,
        ),
        "emit_event": DeprecatedSysCallInfo(
            selector=get_selector("emit_event"),
            syscall_request_struct=syscall_structs.EmitEvent,
            syscall_size=syscall_structs.EmitEvent.size,
        ),
        "get_caller_address": DeprecatedSysCallInfo(
            selector=get_selector("get_caller_address"),
            syscall_request_struct=syscall_structs.GetCallerAddressRequest,
            syscall_size=syscall_structs.GetCallerAddress.size,
        ),
        "get_sequencer_address": DeprecatedSysCallInfo(
            selector=get_selector("get_sequencer_address"),
            syscall_request_struct=syscall_structs.GetSequencerAddressRequest,
            syscall_size=syscall_structs.GetSequencerAddress.size,
        ),
        "get_block_number": DeprecatedSysCallInfo(
            selector=get_selector("get_block_number"),
            syscall_request_struct=syscall_structs.GetBlockNumberRequest,
            syscall_size=syscall_structs.GetBlockNumber.size,
        ),
        "get_block_timestamp": DeprecatedSysCallInfo(
            selector=get_selector("get_block_timestamp"),
            syscall_request_struct=syscall_structs.GetBlockTimestampRequest,
            syscall_size=syscall_structs.GetBlockTimestamp.size,
        ),
        "get_contract_address": DeprecatedSysCallInfo(
            selector=get_selector("get_contract_address"),
            syscall_request_struct=syscall_structs.GetContractAddressRequest,
            syscall_size=syscall_structs.GetContractAddress.size,
        ),
        "get_tx_info": DeprecatedSysCallInfo(
            selector=get_selector("get_tx_info"),
            syscall_request_struct=syscall_structs.GetTxInfoRequest,
            syscall_size=syscall_structs.GetTxInfo.size,
        ),
        "get_tx_signature": DeprecatedSysCallInfo(
            selector=get_selector("get_tx_signature"),
            syscall_request_struct=syscall_structs.GetTxSignatureRequest,
            syscall_size=syscall_structs.GetTxSignature.size,
        ),
        "library_call": DeprecatedSysCallInfo(
            selector=get_selector("library_call"),
            syscall_request_struct=syscall_structs.LibraryCallRequest,
            syscall_size=syscall_structs.LibraryCall.size,
        ),
        "library_call_l1_handler": DeprecatedSysCallInfo(
            selector=get_selector("library_call_l1_handler"),
            syscall_request_struct=syscall_structs.LibraryCallRequest,
            syscall_size=syscall_structs.LibraryCall.size,
        ),
        "send_message_to_l1": DeprecatedSysCallInfo(
            selector=get_selector("send_message_to_l1"),
            syscall_request_struct=syscall_structs.SendMessageToL1SysCall,
            syscall_size=syscall_structs.SendMessageToL1SysCall.size,
        ),
        "replace_class": DeprecatedSysCallInfo(
            selector=get_selector("replace_class"),
            syscall_request_struct=syscall_structs.ReplaceClass,
            syscall_size=syscall_structs.ReplaceClass.size,
        ),
        "storage_read": DeprecatedSysCallInfo(
            selector=get_selector("storage_read"),
            syscall_request_struct=syscall_structs.StorageReadRequest,
            syscall_size=syscall_structs.StorageRead.size,
        ),
        "storage_write": DeprecatedSysCallInfo(
            selector=get_selector("storage_write"),
            syscall_request_struct=syscall_structs.StorageWrite,
            syscall_size=syscall_structs.StorageWrite.size,
        ),
    }

    return syscall_structs, syscall_info


# Common utilities.


@dataclasses.dataclass
class HandlerException(Exception):
    """
    Base class for exceptions thrown by the syscall handler.
    """

    called_contract_address: int
    stark_exception: StarkException


@contextlib.contextmanager
def wrap_with_handler_exception(call: ExecuteEntryPointBase):
    try:
        yield
    except StarkException as exception:
        raise HandlerException(
            called_contract_address=call.contract_address, stark_exception=exception
        ) from exception
    except Exception as exception:
        # Exceptions caught here that are not StarkException, are necessarily caused due to
        # security issues, since every exception raised from a Cairo run (in _run) is already
        # wrapped with StarkException.
        stark_exception = StarkException(
            code=StarknetErrorCode.SECURITY_ERROR, message=str(exception)
        )
        raise HandlerException(
            called_contract_address=call.contract_address, stark_exception=stark_exception
        ) from exception


def get_selector_from_program(syscall_name: str, syscalls_program: Program) -> int:
    return syscalls_program.get_const(
        name=f"__main__.{syscall_name.upper()}_SELECTOR", full_name_lookup=True
    )


@cachetools.cached(cache={})
def load_program(path: str) -> Program:
    with open(path, "r") as file:
        return Program.loads(data=file.read())


def validate_runtime_request_type(
    request_values: CairoStructProxy, request_struct: CairoStructProxy
):
    """
    Validates the types of the request values.
    """
    request_struct_def: StructDefinition = request_struct.struct_definition_
    for value, (arg_name, arg_def) in safe_zip(request_values, request_struct_def.members.items()):
        expected_type = get_runtime_type(arg_def.cairo_type)
        assert isinstance(value, expected_type), (
            f"Argument {arg_name} to {type(request_values).__name__} is of unexpected type. "
            f"Expected: value of type {expected_type}; got: {value}."
        )


def get_runtime_type(
    cairo_type: CairoType,
) -> Union[Type[int], Type[RelocatableValue], Type[tuple]]:
    """
    Given a CairoType returns the expected runtime type.
    """
    if isinstance(cairo_type, TypeFelt):
        return int
    if isinstance(cairo_type, TypePointer):
        return RelocatableValue
    if isinstance(cairo_type, TypeStruct) and cairo_type.scope == ScopedName.from_string(
        "starkware.cairo.common.uint256.Uint256"
    ):
        return tuple

    raise NotImplementedError(f"Unexpected type: {cairo_type.format()}.")


def cast_to_int(value: Any) -> int:
    assert isinstance(value, int)
    return value
