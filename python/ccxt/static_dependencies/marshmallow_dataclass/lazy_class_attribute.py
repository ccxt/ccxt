from typing import Any, Callable, Optional


__all__ = ("lazy_class_attribute",)


class LazyClassAttribute:
    """Descriptor decorator implementing a class-level, read-only
    property, which caches its results on the class(es) on which it
    operates.
    """

    __slots__ = ("func", "name", "called", "forward_value")

    def __init__(
        self,
        func: Callable[..., Any],
        name: Optional[str] = None,
        forward_value: Any = None,
    ):
        self.func = func
        self.name = name
        self.called = False
        self.forward_value = forward_value

    def __get__(self, instance, cls=None):
        if not cls:
            cls = type(instance)

        # avoid recursion
        if self.called:
            return self.forward_value

        self.called = True

        setattr(cls, self.name, self.func())

        # "getattr" is used to handle bounded methods
        return getattr(cls, self.name)

    def __set_name__(self, owner, name):
        self.name = self.name or name


lazy_class_attribute = LazyClassAttribute
