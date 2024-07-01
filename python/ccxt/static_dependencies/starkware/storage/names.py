import random
import string
from datetime import datetime
from typing import Dict

from starkware.starkware_utils.time.time import time


def generate_unique_key(item_type: str, props: Dict[str, str] = {}) -> bytes:
    """
    Generates a unique S3 storage key.
    """
    suffix = datetime.utcfromtimestamp(time()).strftime("%H%M%S")
    t = datetime.fromtimestamp(time())
    suffix += "_" + "".join(random.choices(string.ascii_lowercase + string.digits, k=8))
    key = f"{t:year=%04Y/month=%02m/day=%02d}/type={item_type}"
    for prop, val in props.items():
        key = f"{key}/{prop}={val}"
    key = f"{key}/{suffix}"
    return key.encode("ascii")
