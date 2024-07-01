#!/usr/bin/env python3

import argparse
import json

from starkware.cairo.lang.version import __version__
from starkware.cairo.lang.vm.crypto import get_crypto_lib_context_manager
from starkware.starknet.core.os.contract_class.compiled_class_hash import (
    compute_compiled_class_hash,
)
from starkware.starknet.services.api.contract_class.contract_class import CompiledClass


def main():
    parser = argparse.ArgumentParser(
        description="A tool to compute the compiled class hash of a Starknet contract."
    )
    parser.add_argument("-v", "--version", action="version", version=f"%(prog)s {__version__}")
    parser.add_argument(
        "compiled_class",
        type=argparse.FileType("r"),
        help="The name of the compiled contract JSON file.",
    )
    parser.add_argument(
        "--flavor",
        type=str,
        default="Release",
        choices=["Debug", "Release", "RelWithDebInfo"],
        help="Build flavor",
    )
    args = parser.parse_args()

    with get_crypto_lib_context_manager(args.flavor):
        compiled_class = CompiledClass.load(json.load(args.compiled_class))
        print(hex(compute_compiled_class_hash(compiled_class=compiled_class)))


if __name__ == "__main__":
    main()
