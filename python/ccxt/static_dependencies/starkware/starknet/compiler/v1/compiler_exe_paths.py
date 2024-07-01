import os

COMPILER_DIR_NAME = "sierra-compiler-major-1/bin"

# This path might be invalid and shouldn't be used outside the following `if`.
_COMPILER_DIR = os.path.join(os.path.dirname(__file__), COMPILER_DIR_NAME)

STARKNET_COMPILE_EXE = os.path.join(_COMPILER_DIR, "starknet-compile")
STARKNET_SIERRA_COMPILE_EXE = os.path.join(_COMPILER_DIR, "starknet-sierra-compile")


if not os.path.exists(_COMPILER_DIR):
    # Bazel flow.
    from bazel_tools.tools.python.runfiles import runfiles

    r = runfiles.Create()
    STARKNET_COMPILE_EXE = r.Rlocation(os.path.join(COMPILER_DIR_NAME, "starknet-compile"))
    STARKNET_SIERRA_COMPILE_EXE = r.Rlocation(
        os.path.join(COMPILER_DIR_NAME, "starknet-sierra-compile")
    )

assert os.path.exists(
    STARKNET_COMPILE_EXE
), f"starknet-compile exe doesn't exist at: {STARKNET_COMPILE_EXE}."
assert os.path.exists(
    STARKNET_SIERRA_COMPILE_EXE
), f"starknet-sierra-compile exe doesn't exist at: {STARKNET_SIERRA_COMPILE_EXE}."
