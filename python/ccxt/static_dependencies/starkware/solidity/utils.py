import inspect
import json
from pathlib import Path


def load_nearby_contract(name: str) -> dict:
    """
    Loads a contract json from the directory of the caller module.
    """
    frame = inspect.stack()[1]
    module = inspect.getmodule(frame[0])
    assert module is not None
    filename = module.__file__
    assert filename is not None

    path = Path(filename).parent / f"{name}.json"
    with path.open() as fp:
        return json.load(fp)
