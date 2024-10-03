import platform
import subprocess
import sys


def pip_freeze() -> str:
    result = subprocess.run("python -m pip freeze".split(), stdout=subprocess.PIPE)
    return f"python -m pip freeze result:\n{result.stdout.decode()}"


def python_version() -> str:
    return f"Python version:\n{sys.version}"


def platform_info() -> str:
    return f"Operating System: {platform.platform()}"


def get_environment_summary() -> str:
    return "\n\n".join([python_version(), platform_info(), pip_freeze()])
