import typing

import marshmallow


class Sequence(marshmallow.fields.List):
    """
    A sequence field, basically an immutable version of the list field.
    """

    def _deserialize(  # type: ignore[override]
        self,
        value: typing.Any,
        attr: typing.Any,
        data: typing.Any,
        **kwargs: typing.Any,
    ) -> typing.Optional[typing.Sequence[typing.Any]]:
        optional_list = super()._deserialize(value, attr, data, **kwargs)
        return None if optional_list is None else tuple(optional_list)


class Set(marshmallow.fields.List):
    """
    A set field. A set is an unordered/mutable collection of unique elements, same for frozenset
    except it's immutable.

    Notes:
        Beware the a Set guarantees uniqueness in the resulting list but in return the item's order
        will be random. So if the order matters, use a List or Sequence !
    """

    def __init__(
        self,
        cls_or_instance: typing.Union[marshmallow.fields.Field, type],
        frozen: bool = False,
        **kwargs,
    ):
        super().__init__(cls_or_instance, **kwargs)
        self.set_type: typing.Type[typing.Union[frozenset, set]] = (
            frozenset if frozen else set
        )

    def _deserialize(  # type: ignore[override]
        self,
        value: typing.Any,
        attr: typing.Any,
        data: typing.Any,
        **kwargs: typing.Any,
    ) -> typing.Union[typing.Set[typing.Any], typing.FrozenSet[typing.Any], None]:
        optional_list = super()._deserialize(value, attr, data, **kwargs)
        return None if optional_list is None else self.set_type(optional_list)
