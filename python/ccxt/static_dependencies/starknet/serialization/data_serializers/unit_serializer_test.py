import pytest

from serialization.data_serializers.unit_serializer import UnitSerializer

serializer = UnitSerializer()


def test_deserialize_unit():
    deserialized = serializer.deserialize([])

    assert deserialized is None


def test_serialize_unit():
    # pylint: disable=use-implicit-booleaness-not-comparison
    serialized = serializer.serialize(None)

    assert serialized == []


def test_throws_on_not_none():
    with pytest.raises(ValueError, match="Can only serialize `None`."):
        serializer.serialize("abc")  # type: ignore
