import os

from starkware.starknet.security.secure_hints import HintsWhitelist

WHILTELIST_DIR = os.path.join(os.path.dirname(__file__), "whitelists")


def get_hints_whitelist() -> HintsWhitelist:
    return HintsWhitelist.from_dir(dirname=WHILTELIST_DIR)
