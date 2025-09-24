import inspect
from typing import Callable, Optional, Type

from mypy import nodes
from mypy.plugin import DynamicClassDefContext, Plugin
from mypy.plugins import dataclasses

import marshmallow_dataclass

_NEW_TYPE_SIG = inspect.signature(marshmallow_dataclass.NewType)


def plugin(version: str) -> Type[Plugin]:
    return MarshmallowDataclassPlugin


class MarshmallowDataclassPlugin(Plugin):
    def get_dynamic_class_hook(
        self, fullname: str
    ) -> Optional[Callable[[DynamicClassDefContext], None]]:
        if fullname == "marshmallow_dataclass.NewType":
            return new_type_hook
        return None

    def get_class_decorator_hook(self, fullname: str):
        if fullname == "marshmallow_dataclass.dataclass":
            return dataclasses.dataclass_class_maker_callback
        return None


def new_type_hook(ctx: DynamicClassDefContext) -> None:
    """
    Dynamic class hook for :func:`marshmallow_dataclass.NewType`.

    Uses the type of the ``typ`` argument.
    """
    typ = _get_arg_by_name(ctx.call, "typ", _NEW_TYPE_SIG)
    if not isinstance(typ, nodes.RefExpr):
        return
    info = typ.node
    if not isinstance(info, nodes.TypeInfo):
        return
    ctx.api.add_symbol_table_node(ctx.name, nodes.SymbolTableNode(nodes.GDEF, info))


def _get_arg_by_name(
    call: nodes.CallExpr, name: str, sig: inspect.Signature
) -> Optional[nodes.Expression]:
    """
    Get value of argument from a call.

    :return: The argument value, or ``None`` if it cannot be found.

    .. warning::
        This probably doesn't yet work for calls with ``*args`` and/or ``*kwargs``.
    """
    args = []
    kwargs = {}
    for arg_name, arg_value in zip(call.arg_names, call.args):
        if arg_name is None:
            args.append(arg_value)
        else:
            kwargs[arg_name] = arg_value
    try:
        bound_args = sig.bind(*args, **kwargs)
    except TypeError:
        return None
    try:
        return bound_args.arguments[name]
    except KeyError:
        return None
