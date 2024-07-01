from enum import Enum, auto


class ExecutionMode(Enum):
    """
    The execution mode of a given entry point.
    Used by the syscall handler.
    """

    EXECUTE = 0
    # Runs the entry point in validate mode. In validate mode the run changes as follows:
    # 1. A contract is not allowed to call another contract.
    # 2. The following deprecated syscalls are blocked:
    #    - get_block_number.
    #    - get_sequence_address.
    #    - get_block_timestamp.
    # 3. The following syscalls are changed.
    #    - get_block_hash is blocked.
    #    - In get_execution_info the block info is replaced with all-zeros.
    VALIDATE = auto()
