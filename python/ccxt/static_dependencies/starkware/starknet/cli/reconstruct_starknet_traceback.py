import re
from typing import Dict, Optional

from starkware.cairo.lang.compiler.program import Program
from starkware.cairo.lang.vm.reconstruct_traceback import reconstruct_traceback


def reconstruct_starknet_traceback(contracts: Dict[Optional[int], Program], traceback_txt: str):
    """
    Reconstructs the tracebacks for the given contracts.
    'contracts' is a mapping from contract address (None represents the account contract) to the
    compiled program (with debug info).
    """
    pos = 0
    address = None
    res = ""
    # Use '\Z' to match the end of the string.
    for m in re.finditer(r"Error in the called contract \((0x[0-9a-fA-F]+)\):|\Z", traceback_txt):
        text = traceback_txt[pos : m.start()]
        if address in contracts:
            # If 'address' is specified in the 'contracts' dictionary, reconstruct the traceback.
            text = reconstruct_traceback(program=contracts[address], traceback_txt=text)
        res += text + m.group(0)

        # Prepare for the next iteration.
        pos = m.end()
        if m.group(1) is not None:
            address = int(m.group(1), 16)
        else:
            # This should happen in the last iteration.
            break
    else:
        raise Exception("Internal error. Regex pattern failed to capture end of string.")
    assert pos == len(traceback_txt)

    return res
