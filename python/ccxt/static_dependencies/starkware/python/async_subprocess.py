import asyncio
import sys
from typing import List, Optional, Tuple, Union


async def async_check_output(
    args: Union[str, List[str]], shell: bool = False, cwd=None, env=None
) -> str:
    """
    An async equivalent to subprocess.check_output().
    Note that this function returns a string (ascii decoded).
    """
    decoded_stdout, decoded_stderr, returncode = await async_run_command(
        args=args, shell=shell, cwd=cwd, env=env
    )
    print(decoded_stderr, file=sys.stderr)
    assert (
        returncode == 0
    ), f"""\
stderr: {decoded_stderr}
stdout: {decoded_stdout}
"""
    return decoded_stdout


async def async_run_command(
    args: Union[str, List[str]], shell: bool = False, cwd=None, env=None
) -> Tuple[str, str, Optional[int]]:
    """
    Runs a command. Returns the outputs - regular and error - as strings,
    and the exit code of the command.
    """
    if shell:
        assert isinstance(args, str), "args must be a string where shell=True."
        # Pass '-e' to stop after failure if args consists of multiple commands.
        args = ["bash", "-e", "-c", args]
    proc = await asyncio.create_subprocess_exec(
        *args,
        cwd=cwd,
        env=env,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout_data, stderr_data = await proc.communicate()
    decoded_stderr = stderr_data.decode("ascii").strip()
    decoded_stdout = stdout_data.decode("ascii").strip()
    return decoded_stdout, decoded_stderr, proc.returncode
