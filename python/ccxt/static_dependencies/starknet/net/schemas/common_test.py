from typing import Optional, Type, Union

import pytest
from ..marshmallow import Schema, ValidationError

from ..client_models import BlockStatus, DAMode, Hash, TransactionStatus
from ..schemas.common import (
    BlockStatusField,
    DAModeField,
    Felt,
    NonPrefixedHex,
    StatusField,
    Uint64,
    Uint128,
)


class SchemaWithUint64(Schema):
    value = Uint64(data_key="value")


class SchemaWithUint128(Schema):
    value = Uint128(data_key="value")


class SchemaWithFelt(Schema):
    value = Felt(data_key="value")


class SchemaWithDAModeField(Schema):
    value = DAModeField(data_key="value")


def test_serialize_felt():
    data = {"value": 2137}

    serialized = SchemaWithFelt().dumps(data)
    assert '"value": "0x859"' in serialized


@pytest.mark.parametrize(
    "data",
    [
        {"value": None},
        {"value": 2**252},
    ],
)
def test_serialize_felt_throws_on_invalid_data(data):
    with pytest.raises(ValidationError, match="Invalid value provided for Felt"):
        SchemaWithFelt().dumps(data)


def test_deserialize_felt():
    data = {"value": "0x859"}

    deserialized = SchemaWithFelt().load(data)
    assert isinstance(deserialized, dict)
    assert deserialized["value"] == 2137


def test_deserialize_felt_throws_on_invalid_data():
    data = {"value": "2137"}

    with pytest.raises(ValidationError, match="Invalid value provided for Felt"):
        SchemaWithFelt().load(data)

    data = {"value": "0xwww"}
    with pytest.raises(ValidationError, match="Invalid value provided for Felt"):
        SchemaWithFelt().load(data)


@pytest.mark.parametrize(
    "data, expected_serialized",
    (
        ({"value": 0}, "0x0"),
        ({"value": "0x100"}, "0x100"),
        ({"value": 2**32}, "0x100000000"),
    ),
)
def test_serialize_uint64(data, expected_serialized):
    serialized = SchemaWithUint64().dumps(data)
    assert f'"value": "{expected_serialized}"' in serialized


@pytest.mark.parametrize(
    "data",
    [{"value": -1}, {"value": 2**64}, {"value": None}],
)
def test_serialize_uint64_throws_on_invalid_data(data):
    with pytest.raises(
        ValidationError,
        match=get_uint_error_message(Uint64, data["value"]),
    ):
        SchemaWithUint64().dumps(data)


@pytest.mark.parametrize(
    "data",
    [{"value": "0x100000000"}, {"value": 2**32}],
)
def test_deserialize_uint64(data):
    deserialized = SchemaWithUint64().load(data)
    assert isinstance(deserialized, dict)
    assert deserialized["value"] == 2**32


@pytest.mark.parametrize(
    "data",
    [
        {"value": -1},
        {"value": "1000"},
        {"value": 2**64},
        {"value": "0xwrong"},
        {"value": ""},
    ],
)
def test_deserialize_uint64_throws_on_invalid_data(data):
    with pytest.raises(
        ValidationError,
        match=get_uint_error_message(Uint64, data["value"]),
    ):
        SchemaWithUint64().load(data)


def test_serialize_uint128():
    data = {"value": 2**64}
    serialized = SchemaWithUint128().dumps(data)
    assert '"value": "0x10000000000000000"' in serialized


def test_serialize_uint128_throws_on_invalid_data():
    data = {"value": 2**128}
    with pytest.raises(
        ValidationError,
        match=get_uint_error_message(Uint128, data["value"]),
    ):
        SchemaWithUint128().dumps(data)


@pytest.mark.parametrize(
    "data",
    [{"value": "0x10000000000000000"}, {"value": 2**64}],
)
def test_deserialize_uint128(data):
    deserialized = SchemaWithUint128().load(data)
    assert isinstance(deserialized, dict)
    assert deserialized["value"] == 2**64


@pytest.mark.parametrize(
    "data",
    [
        {"value": -1},
        {"value": "1000"},
        {"value": 2**128},
        {"value": "0xwrong"},
        {"value": ""},
    ],
)
def test_deserialize_uint128_throws_on_invalid_data(data):
    with pytest.raises(
        ValidationError,
        match=get_uint_error_message(Uint128, data["value"]),
    ):
        SchemaWithUint128().load(data)


def test_serialize_hex():
    class SchemaWithHex(Schema):
        value1 = NonPrefixedHex(data_key="value1")

    data = {"value1": 123}

    serialized = SchemaWithHex().dump(data)
    assert isinstance(serialized, dict)
    assert serialized["value1"] == "7b"


def test_deserialize_hex():
    class SchemaWithHex(Schema):
        value1 = NonPrefixedHex(data_key="value1")

    data = {"value1": "7b"}

    deserialized = SchemaWithHex().load(data)
    assert isinstance(deserialized, dict)
    assert deserialized["value1"] == 123


def test_serialize_status_field():
    class SchemaWithStatusField(Schema):
        value1 = StatusField(data_key="value1")

    data = {"value1": TransactionStatus.RECEIVED}

    serialized = SchemaWithStatusField().dumps(data)
    assert '"value1": "RECEIVED"' in serialized


def test_deserialize_status_field():
    class SchemaWithStatusField(Schema):
        value1 = StatusField(data_key="value1")

    data = {"value1": "RECEIVED"}

    deserialized = SchemaWithStatusField().load(data)
    assert isinstance(deserialized, dict)
    assert deserialized["value1"] == TransactionStatus.RECEIVED


def test_deserialize_status_field_throws_on_invalid_data():
    class SchemaWithStatusField(Schema):
        value1 = StatusField(data_key="value1")

    data = {"value1": "SENT"}

    with pytest.raises(
        ValidationError, match="Invalid value provided for TransactionStatus"
    ):
        SchemaWithStatusField().load(data)


def test_serialize_block_status_field():
    class SchemaWithBlockStatusField(Schema):
        value1 = BlockStatusField(data_key="value1")

    data = {"value1": BlockStatus.PENDING}

    serialized = SchemaWithBlockStatusField().dumps(data)
    assert '"value1": "PENDING"' in serialized


def test_deserialize_block_status_field():
    class SchemaWithBlockStatusField(Schema):
        value1 = BlockStatusField(data_key="value1")

    data = {"value1": "PENDING"}

    deserialized = SchemaWithBlockStatusField().load(data)
    assert isinstance(deserialized, dict)
    assert deserialized["value1"] == BlockStatus.PENDING


def test_serialize_block_status_field_throws_on_invalid_data():
    class SchemaWithBlockStatusField(Schema):
        value1 = BlockStatusField(data_key="value1")

    data = {"value1": "SENT"}

    with pytest.raises(ValidationError, match="Invalid value for BlockStatus provided"):
        SchemaWithBlockStatusField().load(data)


@pytest.mark.parametrize(
    "data",
    [{"value": DAMode.L1}, {"value": DAMode.L2}],
)
def test_serialize_damode_field(data):
    serialized = SchemaWithDAModeField().dumps(data)
    assert f'"value": "{data["value"].name}"' in serialized


@pytest.mark.parametrize(
    "data, expected_deserialized",
    (
        ({"value": DAMode.L1.name}, DAMode.L1),
        ({"value": DAMode.L2.name}, DAMode.L2),
    ),
)
def test_deserialize_damode_field(data, expected_deserialized):
    deserialized = SchemaWithDAModeField().load(data)
    assert isinstance(deserialized, dict)
    assert deserialized["value"] == expected_deserialized


def get_uint_error_message(
    class_type: Union[Type[Uint64], Type[Uint128]], value: Optional[Hash]
) -> str:
    return f"Invalid value provided for {class_type.__name__}: {str(value)}"
