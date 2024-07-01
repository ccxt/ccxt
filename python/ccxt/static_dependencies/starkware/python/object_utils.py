from typing import Any, Callable, Optional, Set, TypeVar

import marshmallow

T = TypeVar("T")


def show_attr_predicate(obj: Any, attr_name: str) -> bool:
    """
    Attribute selector that can be used in 'generic_object_repr'.
    """
    return not callable(getattr(obj, attr_name)) and not attr_name.startswith("_")


def skip_config_attr_predicate(obj: Any, attr_name: str) -> bool:
    """
    Attribute selector that can be used in 'generic_object_repr'.
    """
    return not attr_name.endswith("_config") and show_attr_predicate(obj=obj, attr_name=attr_name)


def _object_dumps(obj: Any) -> str:
    """
    A helper function for 'generic_object_repr'.
    """
    if hasattr(obj, "dumps"):
        return obj.dumps()

    if hasattr(obj, "Schema"):
        schema: marshmallow.Schema = obj.Schema()  # type: ignore[attr-defined]
        return schema.dumps(obj=obj)

    return repr(obj)


def generic_object_repr(
    obj: T,
    show_attr_predicate: Callable[[T, str], bool] = show_attr_predicate,
    exclude: Optional[Set[str]] = None,
):
    """
    A generic repr function implementation.
    The given show_attr_predicate argument determines which attributes to show, while the given
    exclude argument determines which attributes not to show.
    """
    if hasattr(obj, "dumps") or hasattr(obj, "Schema"):
        return _object_dumps(obj=obj)

    if exclude is None:
        exclude = set()

    attributes_to_show = {
        attr: getattr(obj, attr)
        for attr in obj.__dict__
        if show_attr_predicate(obj, attr) and attr not in exclude
    }
    attributes_repr = ", ".join(
        f"{attr_name}={_object_dumps(obj=attr_value)}"
        for attr_name, attr_value in attributes_to_show.items()
    )

    return f"{type(obj).__name__}({attributes_repr})"
