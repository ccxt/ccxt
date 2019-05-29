from __future__ import print_function

import json
import platform
import sys

from . import __version__ as pyjwt_version

try:
    import cryptography
except ImportError:
    cryptography = None

try:
    import ecdsa
except ImportError:
    ecdsa = None


def info():
    """
    Generate information for a bug report.
    Based on the requests package help utility module.
    """
    try:
        platform_info = {"system": platform.system(), "release": platform.release()}
    except IOError:
        platform_info = {"system": "Unknown", "release": "Unknown"}

    implementation = platform.python_implementation()

    if implementation == "CPython":
        implementation_version = platform.python_version()
    elif implementation == "PyPy":
        implementation_version = "%s.%s.%s" % (
            sys.pypy_version_info.major,
            sys.pypy_version_info.minor,
            sys.pypy_version_info.micro,
        )
        if sys.pypy_version_info.releaselevel != "final":
            implementation_version = "".join(
                [implementation_version, sys.pypy_version_info.releaselevel]
            )
    else:
        implementation_version = "Unknown"

    return {
        "platform": platform_info,
        "implementation": {"name": implementation, "version": implementation_version},
        "cryptography": {"version": getattr(cryptography, "__version__", "")},
        "pyjwt": {"version": pyjwt_version},
    }


def main():
    """Pretty-print the bug information as JSON."""
    print(json.dumps(info(), sort_keys=True, indent=2))


if __name__ == "__main__":
    main()
