#!/usr/bin/env python3

import argparse
import json

from starkware.cairo.lang.version import __version__
from starkware.cairo.lang.vm.crypto import get_crypto_lib_context_manager
from starkware.starknet.core.os.contract_class.class_hash import compute_class_hash
from starkware.starknet.core.os.contract_class.deprecated_class_hash import (
    compute_deprecated_class_hash,
)
from starkware.starknet.services.api.contract_class.contract_class import DeprecatedCompiledClass
from starkware.starknet.services.api.contract_class.contract_class_utils import (
    load_sierra_from_dict,
)


def main():
    parser = argparse.ArgumentParser(
        description="A tool to compute the class hash of a Starknet contract."
    )
    parser.add_argument("-v", "--version", action="version", version=f"%(prog)s {__version__}")
    parser.add_argument(
        "contract_class",
        type=argparse.FileType("r"),
        help="The name of the contract JSON file.",
    )
    parser.add_argument(
        "--flavor",
        type=str,
        default="Release",
        choices=["Debug", "Release", "RelWithDebInfo"],
        help="Build flavor",
    )
    parser.add_argument(
        "--deprecated",
        action="store_true",
        help=(
            "Compute the class hash of a deprecated compiled contract (i.e., a Cairo v0 contract)."
        ),
    )
    args = parser.parse_args()

    with get_crypto_lib_context_manager(args.flavor):
        if args.deprecated:
            deprecated_compiled_contract = DeprecatedCompiledClass.loads(
                data=args.contract_class.read()
            )
            print(hex(compute_deprecated_class_hash(contract_class=deprecated_compiled_contract)))
        else:
            contract_class = load_sierra_from_dict(sierra=json.load(args.contract_class))
            print(hex(compute_class_hash(contract_class=contract_class)))


if __name__ == "__main__":
    main()
