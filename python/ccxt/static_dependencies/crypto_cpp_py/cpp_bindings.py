import ctypes
import os
from pathlib import Path
from typing import Optional, Tuple

from .utils import cpp_generate_k_rfc6979, cpp_inv_mod_curve_size

CPP_LIB_BINDING = None
OUT_BUFFER_SIZE = 1024

WINDOWS_PLATFORM = os.name == "nt"

if WINDOWS_PLATFORM:
    import win32api
    import win32con


def unload_cpp_lib():
    # pylint: disable=global-statement
    global CPP_LIB_BINDING
    CPP_LIB_BINDING = None


def get_cpp_lib_path():
    return Path(__file__).parents[1]


def get_cpp_lib_file() -> str:
    crypto_path = get_cpp_lib_path()
    try:
        filename = next(
            f for f in os.listdir(crypto_path) if f.startswith("libcrypto_c_exports")
        )
        return os.path.join(crypto_path, filename)
    except (StopIteration, FileNotFoundError) as exc:
        raise RuntimeError("Couldn't find libcrypto_c_exports") from exc


def load_cpp_lib(func):
    # pylint: disable=global-statement
    global CPP_LIB_BINDING
    if CPP_LIB_BINDING:
        return func

    cpp_lib_file = get_cpp_lib_file()

    if WINDOWS_PLATFORM:
        CPP_LIB_BINDING = load_cpp_lib_windows(cpp_lib_file)
    else:
        CPP_LIB_BINDING = load_cpp_lib_unix(cpp_lib_file)

    configure_function_arguments()
    return func


def load_cpp_lib_windows(dll_name: str):
    handle1 = win32con.LOAD_WITH_ALTERED_SEARCH_PATH
    dll_handle = win32api.LoadLibraryEx(dll_name, 0, handle1)
    return ctypes.WinDLL(dll_name, handle=dll_handle)


def load_cpp_lib_unix(cpp_lib_file: str) -> ctypes.CDLL:
    return ctypes.cdll.LoadLibrary(cpp_lib_file)


def configure_function_arguments() -> None:
    CPP_LIB_BINDING.Hash.argtypes = [ctypes.c_void_p, ctypes.c_void_p, ctypes.c_void_p]
    CPP_LIB_BINDING.Verify.argtypes = [
        ctypes.c_void_p,
        ctypes.c_void_p,
        ctypes.c_void_p,
        ctypes.c_void_p,
    ]
    CPP_LIB_BINDING.Verify.restype = bool
    CPP_LIB_BINDING.Sign.argtypes = [
        ctypes.c_void_p,
        ctypes.c_void_p,
        ctypes.c_void_p,
        ctypes.c_void_p,
    ]
    CPP_LIB_BINDING.GetPublicKey.argtypes = [
        ctypes.c_void_p,
        ctypes.c_void_p,
    ]


def cpp_binding_loaded() -> bool:
    return CPP_LIB_BINDING is not None


# A type for the digital signature.
ECSignature = Tuple[int, int]


# @load_cpp_lib
def cpp_hash(left: int, right: int) -> int:
    res = ctypes.create_string_buffer(OUT_BUFFER_SIZE)

    if (
        CPP_LIB_BINDING.Hash(
            left.to_bytes(32, "little", signed=False),
            right.to_bytes(32, "little", signed=False),
            res,
        )
        != 0
    ):
        raise ValueError(res.raw.rstrip(b"\00"))
    return int.from_bytes(res.raw[:32], "little", signed=False)


# @load_cpp_lib
def cpp_verify(msg_hash, r, w, stark_key) -> bool:
    return CPP_LIB_BINDING.Verify(
        stark_key.to_bytes(32, "little", signed=False),
        msg_hash.to_bytes(32, "little", signed=False),
        r.to_bytes(32, "little", signed=False),
        w.to_bytes(32, "little", signed=False),
    )


# @load_cpp_lib
def cpp_get_public_key(private_key) -> int:
    out_buffer = ctypes.create_string_buffer(OUT_BUFFER_SIZE)

    result = CPP_LIB_BINDING.GetPublicKey(
        private_key.to_bytes(32, "little", signed=False), out_buffer
    )

    if result != 0:
        raise ValueError(out_buffer.raw.rstrip(b"\00"))
    return int.from_bytes(out_buffer.raw[:32], "little", signed=False)


# @load_cpp_lib
def cpp_sign(msg_hash, priv_key, seed: Optional[int] = 32) -> ECSignature:
    res = ctypes.create_string_buffer(OUT_BUFFER_SIZE)
    k = cpp_generate_k_rfc6979(msg_hash, priv_key, seed)
    if (
        CPP_LIB_BINDING.Sign(
            priv_key.to_bytes(32, "little", signed=False),
            msg_hash.to_bytes(32, "little", signed=False),
            k.to_bytes(32, "little", signed=False),
            res,
        )
        != 0
    ):
        raise ValueError(res.raw.rstrip(b"\00"))
    # pylint: disable=invalid-name
    w = int.from_bytes(res.raw[32:64], "little", signed=False)
    s = cpp_inv_mod_curve_size(w)
    return int.from_bytes(res.raw[:32], "little", signed=False), s
