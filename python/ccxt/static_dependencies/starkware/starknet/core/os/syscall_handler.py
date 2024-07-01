import asyncio
import dataclasses
import functools
from abc import ABC, abstractmethod
from typing import (
    Any,
    Callable,
    Dict,
    Iterable,
    Iterator,
    List,
    Mapping,
    Optional,
    Tuple,
    Type,
    cast,
)

import cachetools

from starkware.cairo.common.cairo_function_runner import CairoFunctionRunner
from starkware.cairo.common.cairo_secp.secp_utils import SECP256K1, SECP256R1, Curve
from starkware.cairo.common.keccak_utils.keccak_utils import keccak_f
from starkware.cairo.common.structs import CairoStructProxy
from starkware.cairo.lang.vm.memory_segments import MemorySegmentManager
from starkware.cairo.lang.vm.relocatable import MaybeRelocatable, RelocatableValue
from starkware.python.math_utils import (
    EC_INFINITY,
    EcInfinity,
    EcPoint,
    ec_safe_add,
    ec_safe_mult,
    safe_div,
    y_squared_from_x,
)
from starkware.python.utils import (
    as_non_optional,
    assert_exhausted,
    blockify,
    execute_coroutine_threadsafe,
    from_bytes,
    gather_in_chunks,
    safe_zip,
    to_bytes,
)
from starkware.starknet.business_logic.execution.deprecated_objects import ExecutionResourcesManager
from starkware.starknet.business_logic.execution.execute_entry_point_base import (
    ExecuteEntryPointBase,
)
from starkware.starknet.business_logic.execution.objects import (
    CallInfo,
    CallResult,
    CallType,
    OrderedEvent,
    OrderedL2ToL1Message,
    TransactionExecutionContext,
    TransactionExecutionInfo,
)
from starkware.starknet.business_logic.fact_state.contract_state_objects import ContractState
from starkware.starknet.business_logic.state.state import ContractStorageState
from starkware.starknet.business_logic.state.state_api import SyncState
from starkware.starknet.business_logic.state.state_api_objects import BlockInfo
from starkware.starknet.core.os.contract_address.contract_address import (
    calculate_contract_address_from_hash,
)
from starkware.starknet.core.os.os_logger import OptionalSegmentManager, OsLogger
from starkware.starknet.core.os.syscall_utils import (
    STARKNET_SYSCALLS_COMPILED_PATH,
    cast_to_int,
    get_selector_from_program,
    get_syscall_structs,
    load_program,
    validate_runtime_request_type,
    wrap_with_handler_exception,
)
from starkware.starknet.definitions import constants
from starkware.starknet.definitions.constants import GasCost
from starkware.starknet.definitions.data_availability_mode import DataAvailabilityMode
from starkware.starknet.definitions.error_codes import CairoErrorCode, StarknetErrorCode
from starkware.starknet.definitions.execution_mode import ExecutionMode
from starkware.starknet.definitions.general_config import StarknetGeneralConfig
from starkware.starknet.public.abi import CONSTRUCTOR_ENTRY_POINT_SELECTOR
from starkware.starknet.services.api.contract_class.contract_class import EntryPointType
from starkware.starknet.storage.starknet_storage import (
    CommitmentInfo,
    OsSingleStarknetStorage,
    StorageLeaf,
)
from starkware.starkware_utils.error_handling import stark_assert
from starkware.storage.storage import FactFetchingContext

SyscallFullResponse = Tuple[tuple, tuple]  # Response header + specific syscall response.
ExecuteSyscallCallback = Callable[
    ["SyscallHandlerBase", int, CairoStructProxy], SyscallFullResponse
]

# Input: polynomial in coefficients representation.
# Output: KZG commitment on the polynomial, split into two Uint192.
CoefficientsToKzgCommitmentCallback = Callable[[List[int]], Tuple[int, int]]

KECCAK_FULL_RATE_IN_U64S = 17


def from_uint256(val: CairoStructProxy) -> int:
    return val.high * 2**128 + val.low  # type: ignore


def to_uint256(structs: CairoStructProxy, val: int) -> CairoStructProxy:
    return structs.Uint256(low=val & (2**128 - 1), high=val >> 128)  # type: ignore


@dataclasses.dataclass(frozen=True)
class SyscallInfo:
    name: str
    execute_callback: ExecuteSyscallCallback
    request_struct: CairoStructProxy


class SyscallHandlerBase(ABC):
    def __init__(
        self,
        segments: OptionalSegmentManager,
        initial_syscall_ptr: Optional[RelocatableValue],
    ):
        # Static syscall information.
        self.structs = get_syscall_structs()
        self.selector_to_syscall_info = self.get_selector_to_syscall_info()

        # Memory segments of the running program.
        self._segments = segments
        # Current syscall pointer; updated internally during the call execution.
        self._syscall_ptr = initial_syscall_ptr

        # Mapping from ec_point* to pythonic EcPoint.
        self.ec_points: Dict[RelocatableValue, EcPoint] = {}
        # A segment that holds all the ec points.
        self.ec_points_segment: Optional[RelocatableValue] = None
        self.ec_point_size = cast(int, self.structs.EcPoint.size)

    @classmethod
    @cachetools.cached(cache={})
    def get_selector_to_syscall_info(cls) -> Dict[int, SyscallInfo]:
        structs = get_syscall_structs()
        syscalls_program = load_program(path=STARKNET_SYSCALLS_COMPILED_PATH)
        get_selector = functools.partial(
            get_selector_from_program, syscalls_program=syscalls_program
        )
        return {
            get_selector("call_contract"): SyscallInfo(
                name="call_contract",
                execute_callback=cls.call_contract,
                request_struct=structs.CallContractRequest,
            ),
            get_selector("deploy"): SyscallInfo(
                name="deploy",
                execute_callback=cls.deploy,
                request_struct=structs.DeployRequest,
            ),
            get_selector("secp256k1_new"): SyscallInfo(
                name="secp256k1_new",
                execute_callback=cls.secp256k1_new,
                request_struct=structs.Secp256k1NewRequest,
            ),
            get_selector("secp256k1_add"): SyscallInfo(
                name="secp256k1_add",
                execute_callback=functools.partial(cls.secp_add, curve=SECP256K1),
                request_struct=structs.Secp256k1AddRequest,
            ),
            get_selector("secp256r1_add"): SyscallInfo(
                name="secp256r1_add",
                execute_callback=functools.partial(cls.secp_add, curve=SECP256R1),
                request_struct=structs.Secp256r1AddRequest,
            ),
            get_selector("secp256k1_mul"): SyscallInfo(
                name="secp256k1_mul",
                execute_callback=functools.partial(cls.secp_mul, curve=SECP256K1),
                request_struct=structs.Secp256k1MulRequest,
            ),
            get_selector("secp256r1_mul"): SyscallInfo(
                name="secp256r1_mul",
                execute_callback=functools.partial(cls.secp_mul, curve=SECP256R1),
                request_struct=structs.Secp256r1MulRequest,
            ),
            get_selector("secp256k1_get_point_from_x"): SyscallInfo(
                name="secp256k1_get_point_from_x",
                execute_callback=cls.secp256k1_get_point_from_x,
                request_struct=structs.Secp256k1GetPointFromXRequest,
            ),
            get_selector("secp256r1_get_point_from_x"): SyscallInfo(
                name="secp256r1_get_point_from_x",
                execute_callback=cls.secp256r1_get_point_from_x,
                request_struct=structs.Secp256r1GetPointFromXRequest,
            ),
            get_selector("secp256k1_get_xy"): SyscallInfo(
                name="secp256k1_get_xy",
                execute_callback=cls.secp_get_xy,
                request_struct=structs.Secp256k1GetXyRequest,
            ),
            get_selector("secp256r1_get_xy"): SyscallInfo(
                name="secp256r1_get_xy",
                execute_callback=cls.secp_get_xy,
                request_struct=structs.Secp256r1GetXyRequest,
            ),
            get_selector("secp256r1_new"): SyscallInfo(
                name="secp256r1_new",
                execute_callback=cls.secp256r1_new,
                request_struct=structs.Secp256r1NewRequest,
            ),
            get_selector("keccak"): SyscallInfo(
                name="keccak",
                execute_callback=cls.keccak,
                request_struct=structs.KeccakRequest,
            ),
            get_selector("get_block_hash"): SyscallInfo(
                name="get_block_hash",
                execute_callback=cls.get_block_hash,
                request_struct=structs.GetBlockHashRequest,
            ),
            get_selector("get_execution_info"): SyscallInfo(
                name="get_execution_info",
                execute_callback=cls.get_execution_info,
                request_struct=structs.EmptyRequest,
            ),
            get_selector("library_call"): SyscallInfo(
                name="library_call",
                execute_callback=cls.library_call,
                request_struct=structs.LibraryCallRequest,
            ),
            get_selector("storage_read"): SyscallInfo(
                name="storage_read",
                execute_callback=cls.storage_read,
                request_struct=structs.StorageReadRequest,
            ),
            get_selector("storage_write"): SyscallInfo(
                name="storage_write",
                execute_callback=cls.storage_write,
                request_struct=structs.StorageWriteRequest,
            ),
            get_selector("emit_event"): SyscallInfo(
                name="emit_event",
                execute_callback=cls.emit_event,
                request_struct=structs.EmitEventRequest,
            ),
            get_selector("replace_class"): SyscallInfo(
                name="replace_class",
                execute_callback=cls.replace_class,
                request_struct=structs.ReplaceClassRequest,
            ),
            get_selector("send_message_to_l1"): SyscallInfo(
                name="send_message_to_l1",
                execute_callback=cls.send_message_to_l1,
                request_struct=structs.SendMessageToL1Request,
            ),
        }

    @property
    def segments(self) -> MemorySegmentManager:
        return self._segments.segments

    @property
    def syscall_ptr(self) -> RelocatableValue:
        assert (
            self._syscall_ptr is not None
        ), "syscall_ptr must be set before using the SyscallHandler."
        return self._syscall_ptr

    def syscall(self, syscall_ptr: RelocatableValue):
        """
        Executes the selected system call.
        """
        self._validate_syscall_ptr(actual_syscall_ptr=syscall_ptr)
        request_header = self._read_and_validate_request(request_struct=self.structs.RequestHeader)

        # Validate syscall selector and request.
        selector = cast_to_int(request_header.selector)
        syscall_info = self.selector_to_syscall_info.get(selector)
        assert (
            syscall_info is not None
        ), f"Unsupported syscall selector {bytes.fromhex(hex(selector)[2:])!r}"
        if syscall_info.name != "keccak":
            self._count_syscall(syscall_name=syscall_info.name)
        request = self._read_and_validate_request(request_struct=syscall_info.request_struct)

        # Check and reduce gas (after validating the syscall selector for consistency with the OS).
        initial_gas = cast_to_int(request_header.gas)
        required_gas = self._get_required_gas(name=syscall_info.name)
        if initial_gas < required_gas:
            # Out of gas failure.
            response_header, response = self._handle_out_of_gas(initial_gas=initial_gas)
        else:
            # Execute.
            remaining_gas = initial_gas - required_gas
            response_header, response = syscall_info.execute_callback(self, remaining_gas, request)

        # Write response to the syscall segment.
        self._write_response(response=response_header)
        self._write_response(response=response)

    # Syscalls.

    def call_contract(self, remaining_gas: int, request: CairoStructProxy) -> SyscallFullResponse:
        return self.call_contract_helper(
            remaining_gas=remaining_gas, request=request, syscall_name="call_contract"
        )

    def library_call(self, remaining_gas: int, request: CairoStructProxy) -> SyscallFullResponse:
        return self.call_contract_helper(
            remaining_gas=remaining_gas, request=request, syscall_name="library_call"
        )

    def call_contract_helper(
        self, remaining_gas: int, request: CairoStructProxy, syscall_name: str
    ) -> SyscallFullResponse:
        result = self._call_contract_helper(
            remaining_gas=remaining_gas, request=request, syscall_name=syscall_name
        )

        remaining_gas -= result.gas_consumed
        response_header = self.structs.ResponseHeader(
            gas=remaining_gas, failure_flag=result.failure_flag
        )
        retdata_start = self._allocate_segment_for_retdata(retdata=result.retdata)
        retdata_end = retdata_start + len(result.retdata)
        if response_header.failure_flag == 0:
            response = self.structs.CallContractResponse(
                retdata_start=retdata_start, retdata_end=retdata_end
            )
        else:
            response = self.structs.FailureReason(start=retdata_start, end=retdata_end)

        return response_header, response

    def deploy(self, remaining_gas: int, request: CairoStructProxy) -> SyscallFullResponse:
        contract_address, result = self._deploy(remaining_gas=remaining_gas, request=request)

        remaining_gas -= result.gas_consumed
        response_header = self.structs.ResponseHeader(
            gas=remaining_gas, failure_flag=result.failure_flag
        )
        retdata_start = self._allocate_segment_for_retdata(retdata=result.retdata)
        retdata_end = retdata_start + len(result.retdata)
        if response_header.failure_flag == 0:
            response = self.structs.DeployResponse(
                contract_address=contract_address,
                constructor_retdata_start=retdata_start,
                constructor_retdata_end=retdata_end,
            )
        else:
            response = self.structs.FailureReason(start=retdata_start, end=retdata_end)

        return response_header, response

    def get_block_hash(self, remaining_gas: int, request: CairoStructProxy) -> SyscallFullResponse:
        """
        Executes the get_block_hash system call.

        Returns the block hash of the block at given block_number.
        Returns the expected block hash if the given block was created at least 10 blocks before the
        current block. Otherwise, returns an error.
        """
        block_number = cast_to_int(request.block_number)

        # Handle out of range block number.
        if self.current_block_number - block_number < constants.STORED_BLOCK_HASH_BUFFER:
            return self._handle_failure(
                final_gas=remaining_gas, error_code=CairoErrorCode.BLOCK_NUMBER_OUT_OF_RANGE
            )

        block_hash = self._get_block_hash(block_number=block_number)
        response_header = self.structs.ResponseHeader(gas=remaining_gas, failure_flag=0)
        response = self.structs.GetBlockHashResponse(block_hash=block_hash)

        return response_header, response

    def get_execution_info(
        self, remaining_gas: int, request: CairoStructProxy
    ) -> SyscallFullResponse:
        execution_info_ptr = self._get_execution_info_ptr()

        response_header = self.structs.ResponseHeader(gas=remaining_gas, failure_flag=0)
        response = self.structs.GetExecutionInfoResponse(execution_info=execution_info_ptr)
        return response_header, response

    def _secp_new(
        self,
        remaining_gas: int,
        request: CairoStructProxy,
        curve: Curve,
        response_struct: CairoStructProxy,
    ) -> SyscallFullResponse:
        x = from_uint256(request.x)
        y = from_uint256(request.y)

        if x >= curve.prime or y >= curve.prime:
            return self._handle_failure(
                final_gas=remaining_gas,
                error_code=CairoErrorCode.INVALID_ARGUMENT,
            )

        response_header = self.structs.ResponseHeader(gas=remaining_gas, failure_flag=0)

        ec_point: Optional[RelocatableValue] = None
        if x == 0 and y == 0:
            ec_point = self._new_ec_point(ec_point=EC_INFINITY)
        else:
            y_squared = y_squared_from_x(
                x=x, alpha=curve.alpha, beta=curve.beta, field_prime=curve.prime
            )

            if (y**2 - y_squared) % curve.prime == 0:
                ec_point = self._new_ec_point(ec_point=(x, y))

        if ec_point is None:
            response = response_struct(not_on_curve=1, ec_point=0)
        else:
            response = response_struct(not_on_curve=0, ec_point=ec_point)

        return response_header, response

    def secp256k1_new(self, remaining_gas: int, request: CairoStructProxy) -> SyscallFullResponse:
        return self._secp_new(
            remaining_gas=remaining_gas,
            request=request,
            curve=SECP256K1,
            response_struct=self.structs.Secp256k1NewResponse,
        )

    def secp256r1_new(self, remaining_gas: int, request: CairoStructProxy) -> SyscallFullResponse:
        return self._secp_new(
            remaining_gas=remaining_gas,
            request=request,
            curve=SECP256R1,
            response_struct=self.structs.Secp256r1NewResponse,
        )

    def secp_add(
        self, remaining_gas: int, request: CairoStructProxy, curve: Curve
    ) -> SyscallFullResponse:
        response_header = self.structs.ResponseHeader(gas=remaining_gas, failure_flag=0)
        response = self.structs.SecpOpResponse(
            ec_point=self._new_ec_point(
                ec_point=ec_safe_add(
                    point1=self._get_ec_point(request.p0),
                    point2=self._get_ec_point(request.p1),
                    alpha=curve.alpha,
                    p=curve.prime,
                )
            ),
        )

        return response_header, response

    def secp_mul(
        self, remaining_gas: int, request: CairoStructProxy, curve: Curve
    ) -> SyscallFullResponse:
        response_header = self.structs.ResponseHeader(gas=remaining_gas, failure_flag=0)
        response = self.structs.SecpOpResponse(
            ec_point=self._new_ec_point(
                ec_point=ec_safe_mult(
                    m=from_uint256(request.scalar),
                    point=self.ec_points[cast(RelocatableValue, request.p)],
                    alpha=curve.alpha,
                    p=curve.prime,
                )
            ),
        )
        return response_header, response

    def secp_get_point_from_x(
        self,
        remaining_gas: int,
        request: CairoStructProxy,
        curve: Curve,
    ) -> SyscallFullResponse:
        x = from_uint256(request.x)

        if x >= curve.prime:
            return self._handle_failure(
                final_gas=remaining_gas,
                error_code=CairoErrorCode.INVALID_ARGUMENT,
            )

        prime = curve.prime
        y_squared = y_squared_from_x(
            x=x,
            alpha=curve.alpha,
            beta=curve.beta,
            field_prime=prime,
        )

        y = pow(y_squared, (prime + 1) // 4, prime)
        if (y & 1) != request.y_parity:
            y = (-y) % prime

        response_header = self.structs.ResponseHeader(gas=remaining_gas, failure_flag=0)
        response = (
            self.structs.SecpNewResponse(
                not_on_curve=0,
                ec_point=self._new_ec_point(ec_point=(x, y)),
            )
            if (y * y) % prime == y_squared
            else self.structs.SecpNewResponse(
                not_on_curve=1,
                ec_point=0,
            )
        )

        return response_header, response

    def secp256k1_get_point_from_x(
        self, remaining_gas: int, request: CairoStructProxy
    ) -> SyscallFullResponse:
        return self.secp_get_point_from_x(
            remaining_gas=remaining_gas, request=request, curve=SECP256K1
        )

    def secp256r1_get_point_from_x(
        self, remaining_gas: int, request: CairoStructProxy
    ) -> SyscallFullResponse:
        return self.secp_get_point_from_x(
            remaining_gas=remaining_gas, request=request, curve=SECP256R1
        )

    def secp_get_xy(self, remaining_gas: int, request: CairoStructProxy) -> SyscallFullResponse:
        ec_point = self.ec_points[cast(RelocatableValue, request.ec_point)]
        response_header = self.structs.ResponseHeader(gas=remaining_gas, failure_flag=0)
        if isinstance(ec_point, EcInfinity):
            x, y = 0, 0
        else:
            x, y = ec_point

        # Note that we can't use self.structs.SecpGetXyResponse here as it is not flat.
        response = to_uint256(self.structs, x) + to_uint256(self.structs, y)  # type: ignore

        return response_header, response

    def keccak(self, remaining_gas: int, request: CairoStructProxy) -> SyscallFullResponse:
        assert isinstance(request.input_end, RelocatableValue)
        assert isinstance(request.input_start, RelocatableValue)
        input_len = cast(int, request.input_end - request.input_start)

        if input_len % KECCAK_FULL_RATE_IN_U64S != 0:
            return self._handle_failure(
                final_gas=remaining_gas,
                error_code=CairoErrorCode.INVALID_INPUT_LEN,
            )

        n_rounds = safe_div(input_len, KECCAK_FULL_RATE_IN_U64S)
        gas_cost = n_rounds * GasCost.KECCAK_ROUND_COST.value
        if gas_cost > remaining_gas:
            return self._handle_failure(
                final_gas=remaining_gas,
                error_code=CairoErrorCode.OUT_OF_GAS,
            )
        remaining_gas -= gas_cost

        self._keccak(n_rounds=n_rounds)
        input_array = self._get_felt_range(
            start_addr=request.input_start, end_addr=request.input_end
        )
        state = bytearray(200)
        for chunk in blockify(input_array, chunk_size=KECCAK_FULL_RATE_IN_U64S):
            for i, val in safe_zip(range(0, KECCAK_FULL_RATE_IN_U64S * 8, 8), chunk):
                state[i : i + 8] = to_bytes(
                    value=from_bytes(value=state[i : i + 8], byte_order="little") ^ val,
                    length=8,
                    byte_order="little",
                )
            state = bytearray(keccak_f(state))

        result = [
            from_bytes(state[0:16], byte_order="little"),
            from_bytes(state[16:32], byte_order="little"),
        ]

        response_header = self.structs.ResponseHeader(gas=remaining_gas, failure_flag=0)
        response = self.structs.KeccakResponse(result_low=result[0], result_high=result[1])
        return response_header, response

    def storage_read(self, remaining_gas: int, request: CairoStructProxy) -> SyscallFullResponse:
        assert request.reserved == 0, f"Unsupported address domain: {request.reserved}."
        value = self._storage_read(key=cast_to_int(request.key))

        response_header = self.structs.ResponseHeader(gas=remaining_gas, failure_flag=0)
        response = self.structs.StorageReadResponse(value=value)
        return response_header, response

    def storage_write(self, remaining_gas: int, request: CairoStructProxy) -> SyscallFullResponse:
        assert request.reserved == 0, f"Unsupported address domain: {request.reserved}."
        self._storage_write(key=cast_to_int(request.key), value=cast_to_int(request.value))

        response_header = self.structs.ResponseHeader(gas=remaining_gas, failure_flag=0)
        return response_header, tuple()

    def emit_event(self, remaining_gas: int, request: CairoStructProxy) -> SyscallFullResponse:
        keys = self._get_felt_range(start_addr=request.keys_start, end_addr=request.keys_end)
        data = self._get_felt_range(start_addr=request.data_start, end_addr=request.data_end)
        self._emit_event(keys=keys, data=data)

        response_header = self.structs.ResponseHeader(gas=remaining_gas, failure_flag=0)
        return response_header, tuple()

    def replace_class(self, remaining_gas: int, request: CairoStructProxy) -> SyscallFullResponse:
        self._replace_class(class_hash=cast_to_int(request.class_hash))

        response_header = self.structs.ResponseHeader(gas=remaining_gas, failure_flag=0)
        return response_header, tuple()

    def send_message_to_l1(
        self, remaining_gas: int, request: CairoStructProxy
    ) -> SyscallFullResponse:
        payload = self._get_felt_range(
            start_addr=cast(RelocatableValue, request.payload_start),
            end_addr=cast(RelocatableValue, request.payload_end),
        )
        self._send_message_to_l1(to_address=cast_to_int(request.to_address), payload=payload)

        response_header = self.structs.ResponseHeader(gas=remaining_gas, failure_flag=0)
        return response_header, tuple()

    # Application-specific syscall implementation.

    @abstractmethod
    def _call_contract_helper(
        self, remaining_gas: int, request: CairoStructProxy, syscall_name: str
    ) -> CallResult:
        """
        Returns the call's result.

        syscall_name can be "call_contract" or "library_call".
        """

    @abstractmethod
    def _deploy(self, remaining_gas: int, request: CairoStructProxy) -> Tuple[int, CallResult]:
        """
        Returns the address of the newly deployed contract and the constructor call's result.
        Note that the result may contain failures that preceded the constructor invocation, such
        as undeclared class.
        """

    @abstractmethod
    def _get_block_hash(self, block_number: int) -> int:
        """
        Returns the block hash of the block at given block number.
        """

    @abstractmethod
    def _get_execution_info_ptr(self) -> RelocatableValue:
        """
        Returns a pointer to the ExecutionInfo struct.
        """

    @abstractmethod
    def _keccak(self, n_rounds: int):
        """
        Post-process for the keccak syscall.
        """

    @abstractmethod
    def _storage_read(self, key: int) -> int:
        """
        Returns the value of the contract's storage at the given key.
        """

    @abstractmethod
    def _storage_write(self, key: int, value: int):
        """
        Specific implementation of the storage_write syscall.
        """

    @abstractmethod
    def _emit_event(self, keys: List[int], data: List[int]):
        """
        Specific implementation of the emit_event syscall.
        """

    @abstractmethod
    def _replace_class(self, class_hash: int):
        """
        Specific implementation of the replace_class syscall.
        """

    @abstractmethod
    def _send_message_to_l1(self, to_address: int, payload: List[int]):
        """
        Specific implementation of the send_message_to_l1 syscall.
        """

    # Internal utilities.

    def _get_required_gas(self, name: str) -> int:
        """
        Returns the remaining required gas for the given syscall.
        """
        total_gas_cost = GasCost[name.upper()].int_value
        # Refund the base amount the was pre-charged.
        return total_gas_cost - GasCost.SYSCALL_BASE.value

    def _handle_failure(self, final_gas: int, error_code: CairoErrorCode) -> SyscallFullResponse:
        response_header = self.structs.ResponseHeader(gas=final_gas, failure_flag=1)
        data = [error_code.to_felt()]
        start = self.allocate_segment(data=data)
        failure_reason = self.structs.FailureReason(start=start, end=start + len(data))

        return response_header, failure_reason

    def _handle_out_of_gas(self, initial_gas: int) -> SyscallFullResponse:
        return self._handle_failure(final_gas=initial_gas, error_code=CairoErrorCode.OUT_OF_GAS)

    def _get_felt_range(self, start_addr: Any, end_addr: Any) -> List[int]:
        assert isinstance(start_addr, RelocatableValue)
        assert isinstance(end_addr, RelocatableValue)
        assert start_addr.segment_index == end_addr.segment_index, (
            "Inconsistent start and end segment indices "
            f"({start_addr.segment_index} != {end_addr.segment_index})."
        )

        assert start_addr.offset <= end_addr.offset, (
            "The start offset cannot be greater than the end offset"
            f"({start_addr.offset} > {end_addr.offset})."
        )

        size = end_addr.offset - start_addr.offset
        return self.segments.memory.get_range_as_ints(addr=start_addr, size=size)

    @abstractmethod
    def allocate_segment(self, data: Iterable[MaybeRelocatable]) -> RelocatableValue:
        """
        Allocates and returns a new (read-only) segment with the given data.
        Note that unlike MemorySegmentManager.write_arg, this function doesn't work well with
        recursive input - call allocate_segment for the inner items if needed.
        """

    @abstractmethod
    def _allocate_segment_for_retdata(self, retdata: Iterable[int]) -> RelocatableValue:
        """
        Allocates and returns a new (read-only) segment with the given retdata.
        """

    def _validate_syscall_ptr(self, actual_syscall_ptr: RelocatableValue):
        assert (
            actual_syscall_ptr == self.syscall_ptr
        ), f"Bad syscall_ptr, Expected {self.syscall_ptr}, got {actual_syscall_ptr}."

    def _read_and_validate_request(self, request_struct: CairoStructProxy) -> CairoStructProxy:
        request = self._read_request(request_struct=request_struct)
        validate_runtime_request_type(request_values=request, request_struct=request_struct)
        return request

    def _read_request(self, request_struct: CairoStructProxy) -> CairoStructProxy:
        request = request_struct.from_ptr(memory=self.segments.memory, addr=self.syscall_ptr)
        # Advance syscall pointer.
        self._syscall_ptr = self.syscall_ptr + request_struct.size
        return request

    def _write_response(self, response: tuple):
        # Write response and update syscall pointer.
        self._syscall_ptr = self.segments.write_arg(ptr=self.syscall_ptr, arg=response)

    @abstractmethod
    def _count_syscall(self, syscall_name: str):
        """
        Counts syscalls.
        """

    def _new_ec_point(self, ec_point: EcPoint) -> RelocatableValue:
        """
        Allocates ec_points handle and stores it in the ec_points mapping.
        """

        if self.ec_points_segment is None:
            self.ec_points_segment = self.segments.add()

        handle = self.ec_points_segment + len(self.ec_points) * self.ec_point_size
        self.ec_points[handle] = ec_point
        return handle

    def _get_ec_point(self, handle: CairoStructProxy) -> EcPoint:
        """
        Returns the ec_points corresponding to `handle`.
        """

        assert isinstance(handle, RelocatableValue)
        return self.ec_points[handle]

    @property
    @abstractmethod
    def current_block_number(self) -> int:
        """
        Returns the block number of the current block.
        """


class BusinessLogicSyscallHandler(SyscallHandlerBase):
    """
    A handler for system calls; used by the BusinessLogic entry point execution.
    """

    def __init__(
        self,
        state: SyncState,
        resources_manager: ExecutionResourcesManager,
        segments: MemorySegmentManager,
        tx_execution_context: TransactionExecutionContext,
        initial_syscall_ptr: RelocatableValue,
        general_config: StarknetGeneralConfig,
        entry_point: ExecuteEntryPointBase,
        support_reverted: bool,
    ):
        super().__init__(
            segments=OptionalSegmentManager(segments=segments),
            initial_syscall_ptr=initial_syscall_ptr,
        )

        # Entry point info.
        self.entry_point = entry_point
        self.execute_entry_point_cls: Type[ExecuteEntryPointBase] = type(entry_point)

        # Configuration objects.
        self.general_config = general_config

        # Execution-related objects.
        self.tx_execution_context = tx_execution_context
        self.resources_manager = resources_manager
        self.state = state
        self.support_reverted = support_reverted

        # The storage which the current call acts on.
        self.storage = ContractStorageState(
            state=state, contract_address=self.entry_point.contract_address
        )

        # A list of dynamically allocated segments that are expected to be read-only.
        self.read_only_segments: List[Tuple[RelocatableValue, int]] = []

        # Internal calls executed by the current contract call.
        self.internal_calls: List[CallInfo] = []

        # Events emitted by the current contract call.
        self.events: List[OrderedEvent] = []

        # Messages sent by the current contract call to L1.
        self.l2_to_l1_messages: List[OrderedL2ToL1Message] = []

        # A pointer to the Cairo ExecutionInfo struct.
        self._execution_info_ptr: Optional[RelocatableValue] = None

    @property
    def current_block_number(self) -> int:
        return self.state.block_info.block_number

    # Syscalls.

    def get_block_hash(self, remaining_gas: int, request: CairoStructProxy) -> SyscallFullResponse:
        syscall_name = "get_block_hash"
        stark_assert(
            not self._is_validate_execution_mode(),
            code=StarknetErrorCode.UNAUTHORIZED_ACTION_ON_VALIDATE,
            message=(
                f"Unauthorized syscall {syscall_name} "
                f"in execution mode {self.tx_execution_context.execution_mode.name}."
            ),
        )
        return super().get_block_hash(remaining_gas=remaining_gas, request=request)

    def _call_contract_helper(
        self, remaining_gas: int, request: CairoStructProxy, syscall_name: str
    ) -> CallResult:
        calldata = self._get_felt_range(
            start_addr=request.calldata_start, end_addr=request.calldata_end
        )
        class_hash: Optional[int] = None
        if syscall_name == "call_contract":
            contract_address = cast_to_int(request.contract_address)
            caller_address = self.entry_point.contract_address
            call_type = CallType.Call
            if self._is_validate_execution_mode():
                stark_assert(
                    self.entry_point.contract_address == contract_address,
                    code=StarknetErrorCode.UNAUTHORIZED_ACTION_ON_VALIDATE,
                    message=(
                        f"Unauthorized syscall {syscall_name} "
                        f"in execution mode {self.tx_execution_context.execution_mode.name}."
                    ),
                )
        elif syscall_name == "library_call":
            contract_address = self.entry_point.contract_address
            caller_address = self.entry_point.caller_address
            call_type = CallType.Delegate
            class_hash = cast_to_int(request.class_hash)
        else:
            raise NotImplementedError(f"Unsupported call type {syscall_name}.")

        call = self.execute_entry_point_cls(
            call_type=call_type,
            contract_address=contract_address,
            entry_point_selector=cast_to_int(request.selector),
            entry_point_type=EntryPointType.EXTERNAL,
            calldata=calldata,
            caller_address=caller_address,
            initial_gas=remaining_gas,
            class_hash=class_hash,
            code_address=None,
        )

        return self.execute_entry_point(call=call)

    def _deploy(self, remaining_gas: int, request: CairoStructProxy) -> Tuple[int, CallResult]:
        assert request.deploy_from_zero in [0, 1], "The deploy_from_zero field must be 0 or 1."
        constructor_calldata = self._get_felt_range(
            start_addr=request.constructor_calldata_start, end_addr=request.constructor_calldata_end
        )
        class_hash = cast_to_int(request.class_hash)

        # Calculate contract address.
        deployer_address = self.entry_point.contract_address if request.deploy_from_zero == 0 else 0
        contract_address = calculate_contract_address_from_hash(
            salt=cast_to_int(request.contract_address_salt),
            class_hash=class_hash,
            constructor_calldata=constructor_calldata,
            deployer_address=deployer_address,
        )
        # Instantiate the contract (may raise UNDECLARED_CLASS and CONTRACT_ADDRESS_UNAVAILABLE).
        self.state.deploy_contract(contract_address=contract_address, class_hash=class_hash)

        # Invoke constructor.
        result = self.execute_constructor_entry_point(
            contract_address=contract_address,
            class_hash=class_hash,
            constructor_calldata=constructor_calldata,
            remaining_gas=remaining_gas,
        )
        return contract_address, result

    def _get_block_hash(self, block_number: int) -> int:
        return self.state.get_storage_at(
            data_availability_mode=DataAvailabilityMode.L1,
            contract_address=constants.BLOCK_HASH_CONTRACT_ADDRESS,
            key=block_number,
        )

    def _get_execution_info_ptr(self) -> RelocatableValue:
        if self._execution_info_ptr is None:
            # Prepare block info.
            python_block_info = self.storage.state.block_info
            if self._is_validate_execution_mode():
                block_number_for_validate = (
                    python_block_info.block_number // constants.VALIDATE_BLOCK_NUMBER_ROUNDING
                ) * constants.VALIDATE_BLOCK_NUMBER_ROUNDING
                block_timestamp_for_validate = (
                    python_block_info.block_timestamp // constants.VALIDATE_TIMESTAMP_ROUNDING
                ) * constants.VALIDATE_TIMESTAMP_ROUNDING
                block_info = self.structs.BlockInfo(
                    block_number=block_number_for_validate,
                    block_timestamp=block_timestamp_for_validate,
                    sequencer_address=0,
                )
            else:
                block_info = self.structs.BlockInfo(
                    block_number=python_block_info.block_number,
                    block_timestamp=python_block_info.block_timestamp,
                    sequencer_address=as_non_optional(python_block_info.sequencer_address),
                )

            # Prepare transaction info.
            signature = self.tx_execution_context.signature
            signature_start = self.allocate_segment(data=signature)
            tx_info = self.structs.TxInfo(
                version=self.tx_execution_context.version,
                account_contract_address=self.tx_execution_context.account_contract_address,
                max_fee=self.tx_execution_context.max_fee,
                signature_start=signature_start,
                signature_end=signature_start + len(signature),
                transaction_hash=self.tx_execution_context.transaction_hash,
                chain_id=self.general_config.chain_id.value,
                nonce=self.tx_execution_context.nonce,
                # We only support execution of transactions with version < 3, hence we set the new
                # additional fields to zero.
                resource_bounds_start=0,
                resource_bounds_end=0,
                tip=0,
                paymaster_data_start=0,
                paymaster_data_end=0,
                nonce_data_availability_mode=0,
                fee_data_availability_mode=0,
                account_deployment_data_start=0,
                account_deployment_data_end=0,
            )
            # Gather all info.
            execution_info = self.structs.ExecutionInfo(
                block_info=self.allocate_segment(data=block_info),
                tx_info=self.allocate_segment(data=tx_info),
                caller_address=self.entry_point.caller_address,
                contract_address=self.entry_point.contract_address,
                selector=self.entry_point.entry_point_selector,
            )
            self._execution_info_ptr = self.allocate_segment(data=execution_info)

        return self._execution_info_ptr

    def _storage_read(self, key: int) -> int:
        return self.storage.read(address=key)

    def _storage_write(self, key: int, value: int):
        self.storage.write(address=key, value=value)

    def _emit_event(self, keys: List[int], data: List[int]):
        self.events.append(
            OrderedEvent.create(
                order=self.tx_execution_context.n_emitted_events, keys=keys, data=data
            )
        )

        # Update events count.
        self.tx_execution_context.n_emitted_events += 1

    def _replace_class(self, class_hash: int):
        compiled_class_hash = self.storage.state.get_compiled_class_hash(class_hash=class_hash)
        stark_assert(
            compiled_class_hash != 0,
            code=StarknetErrorCode.UNDECLARED_CLASS,
            message=f"Class with hash {class_hash} is not declared.",
        )

        # Replace the class.
        self.state.set_class_hash_at(
            contract_address=self.entry_point.contract_address, class_hash=class_hash
        )

    def _send_message_to_l1(self, to_address: int, payload: List[int]):
        self.l2_to_l1_messages.append(
            # Note that the constructor of OrderedL2ToL1Message might fail as it is
            # more restrictive than the Cairo code.
            OrderedL2ToL1Message.create(
                order=self.tx_execution_context.n_sent_messages,
                to_address=to_address,
                payload=payload,
            )
        )

        # Update messages count.
        self.tx_execution_context.n_sent_messages += 1

    # Utilities.

    def execute_entry_point(self, call: ExecuteEntryPointBase) -> CallResult:
        with wrap_with_handler_exception(call=call):
            call_info = call.execute(
                state=self.state,
                resources_manager=self.resources_manager,
                tx_execution_context=self.tx_execution_context,
                general_config=self.general_config,
                support_reverted=self.support_reverted,
            )

        self.internal_calls.append(call_info)
        return call_info.result()

    def execute_constructor_entry_point(
        self,
        contract_address: int,
        class_hash: int,
        constructor_calldata: List[int],
        remaining_gas: int,
    ) -> CallResult:
        contract_class = self.state.get_compiled_class_by_class_hash(class_hash=class_hash)
        constructor_entry_points = contract_class.entry_points_by_type[EntryPointType.CONSTRUCTOR]
        if len(constructor_entry_points) == 0:
            # Contract has no constructor.
            assert (
                len(constructor_calldata) == 0
            ), "Cannot pass calldata to a contract with no constructor."

            call_info = CallInfo.empty_constructor_call(
                contract_address=contract_address,
                caller_address=self.entry_point.contract_address,
                class_hash=class_hash,
            )
            self.internal_calls.append(call_info)

            return call_info.result()

        call = self.execute_entry_point_cls(
            call_type=CallType.Call,
            contract_address=contract_address,
            entry_point_selector=CONSTRUCTOR_ENTRY_POINT_SELECTOR,
            entry_point_type=EntryPointType.CONSTRUCTOR,
            calldata=constructor_calldata,
            caller_address=self.entry_point.contract_address,
            initial_gas=remaining_gas,
            class_hash=None,
            code_address=None,
        )

        return self.execute_entry_point(call=call)

    def allocate_segment(self, data: Iterable[MaybeRelocatable]) -> RelocatableValue:
        segment_start = self.segments.add()
        segment_end = self.segments.write_arg(ptr=segment_start, arg=data)
        self.read_only_segments.append((segment_start, segment_end - segment_start))
        return segment_start

    def _allocate_segment_for_retdata(self, retdata: Iterable[int]) -> RelocatableValue:
        return self.allocate_segment(data=retdata)

    def post_run(self, runner: CairoFunctionRunner, syscall_end_ptr: MaybeRelocatable):
        """
        Performs post-run syscall-related tasks.
        """
        expected_syscall_end_ptr = self.syscall_ptr
        stark_assert(
            syscall_end_ptr == expected_syscall_end_ptr,
            code=StarknetErrorCode.SECURITY_ERROR,
            message=(
                f"Bad syscall_stop_ptr, Expected {expected_syscall_end_ptr}, "
                f"got {syscall_end_ptr}."
            ),
        )

        self._validate_read_only_segments(runner=runner)

    def _validate_read_only_segments(self, runner: CairoFunctionRunner):
        """
        Validates that there were no out of bounds writes to read-only segments and marks
        them as accessed.
        """
        assert self.segments is runner.segments, "Inconsistent segments."
        for segment_ptr, segment_size in self.read_only_segments:
            used_size = self.segments.get_segment_used_size(segment_index=segment_ptr.segment_index)
            stark_assert(
                used_size == segment_size,
                code=StarknetErrorCode.SECURITY_ERROR,
                message="Out of bounds write to a read-only segment.",
            )

            runner.mark_as_accessed(address=segment_ptr, size=segment_size)

    def _keccak(self, n_rounds: int):
        # For the keccak system call we want to count the number of rounds,
        # rather than the number of syscall invocations.
        self._count_syscall(syscall_name="keccak", count=n_rounds)

    def _count_syscall(self, syscall_name: str, count: int = 1):
        previous_syscall_count = self.resources_manager.syscall_counter.get(syscall_name, 0)
        self.resources_manager.syscall_counter[syscall_name] = previous_syscall_count + count

    def _is_validate_execution_mode(self):
        return self.tx_execution_context.execution_mode is ExecutionMode.VALIDATE


class OsExecutionHelper:
    """
    Maintains the information needed for executing transactions in the OS.
    """

    def __init__(
        self,
        tx_execution_infos: Iterable[TransactionExecutionInfo],
        storage_by_address: Mapping[int, OsSingleStarknetStorage],
        old_block_number_and_hash: Optional[Tuple[int, int]],
        loop: asyncio.AbstractEventLoop,
        debug_mode: bool,
        segments: OptionalSegmentManager,
        polynomial_coefficients_to_kzg_commitment_callback: CoefficientsToKzgCommitmentCallback,
    ):
        """
        Private constructor.
        """
        self.debug_mode = debug_mode

        # Stores the state diff computed by the OS, in case that KZG commitment is used (since
        # it won't be part of the OS output).
        self._da_segment: Optional[List[int]] = None

        # Callback that computes the KZG commitment of a polynomial in coefficient representation.
        self.polynomial_coefficients_to_kzg_commitment_callback = (
            polynomial_coefficients_to_kzg_commitment_callback
        )
        self.tx_execution_info_iterator: Iterator[TransactionExecutionInfo] = iter(
            tx_execution_infos
        )
        self.call_iterator: Iterator[CallInfo] = iter([])

        # The CallInfo for the call currently being executed.
        self._call_info: Optional[CallInfo] = None

        # An iterator over contract addresses that were deployed during that call.
        self.deployed_contracts_iterator: Iterator[int] = iter([])

        # An iterator to the results of the current call's internal calls.
        self.result_iterator: Iterator[CallResult] = iter([])

        # An iterator to the read_values array which is consumed when the transaction
        # code is executed.
        self.execute_code_read_iterator: Iterator[int] = iter([])

        # The TransactionExecutionInfo for the transaction currently being executed.
        self.tx_execution_info: Optional[TransactionExecutionInfo] = None

        # Starknet storage-related members.
        self.storage_by_address = storage_by_address

        # A pointer to the Cairo (deprecated) TxInfo struct.
        # This pointer needs to match the DeprecatedTxInfo pointer that is going to be used during
        # the system call validation by the Starknet OS.
        # Set during enter_tx.
        self.tx_info_ptr: Optional[RelocatableValue] = None

        # A pointer to the Cairo ExecutionInfo struct of the current call.
        # This pointer needs to match the ExecutionInfo pointer that is going to be used during the
        # system call validation by the StarkNet OS.
        # Set during enter_call.
        self.call_execution_info_ptr: Optional[RelocatableValue] = None

        # Current running event loop; used for running async tasks in a synchronous context.
        self.loop = loop

        # The block number and block hash of the (current_block_number - buffer) block, where
        # buffer=STORED_BLOCK_HASH_BUFFER.
        # It is the hash that is going to be written by this OS run.
        self.old_block_number_and_hash = old_block_number_and_hash

        self.os_logger = OsLogger(debug=debug_mode, segments=segments)

    @classmethod
    async def create(
        cls,
        tx_execution_infos: Iterable[TransactionExecutionInfo],
        storage_by_address: Mapping[int, OsSingleStarknetStorage],
        block_info: BlockInfo,
        updated_block_hash_contract_state: ContractState,
        ffc: FactFetchingContext,
        debug_mode: bool,
        segments: Optional[MemorySegmentManager],
        polynomial_coefficients_to_kzg_commitment_callback: CoefficientsToKzgCommitmentCallback,
    ) -> "OsExecutionHelper":
        # Fetch the hash of the (current_block_number - buffer) block from the updated state
        # (was written by the Batcher).
        old_block_number = block_info.block_number - constants.STORED_BLOCK_HASH_BUFFER
        if old_block_number < 0:
            old_block_number_and_hash = None
        else:
            leaf = await updated_block_hash_contract_state.storage_commitment_tree.get_leaf(
                index=old_block_number, ffc=ffc, fact_cls=StorageLeaf
            )
            old_block_number_and_hash = (old_block_number, leaf.value)

        return cls(
            tx_execution_infos=tx_execution_infos,
            storage_by_address=storage_by_address,
            old_block_number_and_hash=old_block_number_and_hash,
            loop=asyncio.get_running_loop(),
            debug_mode=debug_mode,
            segments=OptionalSegmentManager(segments=segments),
            polynomial_coefficients_to_kzg_commitment_callback=(
                polynomial_coefficients_to_kzg_commitment_callback
            ),
        )

    @property
    def da_segment(self) -> List[int]:
        assert self._da_segment is not None, "DA segment is not initialized."
        return self._da_segment

    def store_da_segment(self, da_segment: List[int]):
        """
        Stores the data-availabilty segment, to be used for computing the KZG commitment
        and published on L1 using a blob transaction.
        """
        assert self._da_segment is None, "DA segment is already initialized."
        self._da_segment = da_segment

    def compute_storage_commitments(self) -> Mapping[int, CommitmentInfo]:
        coroutine = gather_in_chunks(
            awaitables=(
                storage.compute_commitment() for storage in self.storage_by_address.values()
            )
        )
        commitments = execute_coroutine_threadsafe(coroutine=coroutine, loop=self.loop)
        return dict(safe_zip(self.storage_by_address.keys(), commitments))

    def get_old_block_number_and_hash(self) -> Tuple[int, int]:
        """
        Returns the block number and block hash of the
        (current_block_number - stored_block_hash_buffer) block.
        """
        assert (
            self.old_block_number_and_hash is not None
        ), f"Block number is probably < {constants.STORED_BLOCK_HASH_BUFFER}."

        return self.old_block_number_and_hash

    @property
    def call_info(self) -> CallInfo:
        assert self._call_info is not None
        return self._call_info

    def start_tx(self, tx_info_ptr: Optional[RelocatableValue]):
        """
        Called when starting the execution of a transaction.

        'tx_info_ptr' is a pointer to the TxInfo struct corresponding to said transaction.
        """
        assert self.tx_info_ptr is None
        self.tx_info_ptr = tx_info_ptr

        assert self.tx_execution_info is None
        self.tx_execution_info = next(self.tx_execution_info_iterator)
        self.call_iterator = self.tx_execution_info.gen_call_iterator()

    def end_tx(self):
        """
        Called after the execution of the current transaction complete.
        """
        assert_exhausted(iterator=self.call_iterator)
        self.tx_info_ptr = None
        assert self.tx_execution_info is not None
        self.tx_execution_info = None

    def assert_interators_exhausted(self):
        assert_exhausted(iterator=self.deployed_contracts_iterator)
        assert_exhausted(iterator=self.result_iterator)
        assert_exhausted(iterator=self.execute_code_read_iterator)

    def enter_call(self, execution_info_ptr: Optional[RelocatableValue]):
        assert self.call_execution_info_ptr is None
        self.call_execution_info_ptr = execution_info_ptr

        self.assert_interators_exhausted()

        assert self._call_info is None
        self._call_info = next(self.call_iterator)

        self.deployed_contracts_iterator = (
            call.contract_address
            for call in self.call_info.internal_calls
            if call.entry_point_type is EntryPointType.CONSTRUCTOR
        )
        self.result_iterator = (call.result() for call in self.call_info.internal_calls)
        self.execute_code_read_iterator = iter(self.call_info.storage_read_values)

    def exit_call(self):
        self.call_execution_info_ptr = None

        self.assert_interators_exhausted()
        assert self._call_info is not None
        self._call_info = None

    def skip_call(self):
        """
        Called when skipping the execution of a call.
        It replaces a call to enter_call and exit_call.
        """
        self.enter_call(execution_info_ptr=None)
        self.exit_call()

    def skip_tx(self):
        """
        Called when skipping the execution of a transaction.
        It replaces a call to start_tx and end_tx.
        """
        self.start_tx(tx_info_ptr=None)
        self.end_tx()


class OsSyscallHandler(SyscallHandlerBase):
    """
    A handler for system calls; used by the GpsAmbassador in the OS run execution.
    """

    def __init__(
        self,
        execution_helper: OsExecutionHelper,
        block_info: BlockInfo,
    ):
        super().__init__(segments=execution_helper.os_logger.segments, initial_syscall_ptr=None)
        self.execution_helper = execution_helper
        self.block_info = block_info
        self.syscall_counter: Dict[str, int] = {}

    @property
    def current_block_number(self) -> int:
        return self.block_info.block_number

    def set_syscall_ptr(self, syscall_ptr: RelocatableValue):
        assert self._syscall_ptr is None, "syscall_ptr is already set."
        self._syscall_ptr = syscall_ptr

    def validate_and_discard_syscall_ptr(self, syscall_ptr_end: RelocatableValue):
        assert self._syscall_ptr == syscall_ptr_end, "Bad syscall_ptr_end."
        self._syscall_ptr = None

    def allocate_segment(self, data: Iterable[MaybeRelocatable]) -> RelocatableValue:
        segment_start = self.segments.add()
        self.segments.write_arg(ptr=segment_start, arg=data)
        return segment_start

    def _allocate_segment_for_retdata(self, retdata: Iterable[int]) -> RelocatableValue:
        segment_start = self.segments.add_temp_segment()
        self.segments.write_arg(ptr=segment_start, arg=retdata)
        return segment_start

    # Syscalls.

    def _call_contract_helper(
        self, remaining_gas: int, request: CairoStructProxy, syscall_name: str
    ) -> CallResult:
        return next(self.execution_helper.result_iterator)

    def _deploy(self, remaining_gas: int, request: CairoStructProxy) -> Tuple[int, CallResult]:
        constructor_result = next(self.execution_helper.result_iterator)
        contract_address = next(self.execution_helper.deployed_contracts_iterator)
        return contract_address, constructor_result

    def _get_block_hash(self, block_number: int) -> int:
        # The syscall handler should not directly read from the storage during the execution of
        # transactions because the order in which reads and writes occur is not strictly linear.
        # However, for the "block hash contract," this rule does not apply. This contract is updated
        # only at the start of each block before other transactions are executed.
        return self.execution_helper.storage_by_address[constants.BLOCK_HASH_CONTRACT_ADDRESS].read(
            block_number
        )

    def _get_execution_info_ptr(self) -> RelocatableValue:
        assert (
            self.execution_helper.call_execution_info_ptr is not None
        ), "ExecutionInfo pointer is not set."
        return self.execution_helper.call_execution_info_ptr

    def _storage_read(self, key: int) -> int:
        return next(self.execution_helper.execute_code_read_iterator)

    def _storage_write(self, key: int, value: int):
        return

    def _emit_event(self, keys: List[int], data: List[int]):
        return

    def _replace_class(self, class_hash: int):
        return

    def _send_message_to_l1(self, to_address: int, payload: List[int]):
        return

    def _keccak(self, n_rounds: int):
        return

    def _count_syscall(self, syscall_name: str):
        previous_syscall_count = self.syscall_counter.get(syscall_name, 0)
        self.syscall_counter[syscall_name] = previous_syscall_count + 1
