from typing import Union

from constants import QUERY_VERSION_BASE


def _extract_tx_version(version: Union[int, str]):
    if isinstance(version, str):
        version = int(version, 16)
    return version % QUERY_VERSION_BASE
