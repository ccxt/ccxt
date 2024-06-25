import pytest

from serialization.tuple_dataclass import TupleDataclass


def test_wrapped_named_tuple():
    input_dict = {
        "first": 1,
        "second": 2,
        "third": {"key": "value"},
    }
    input_tuple = tuple(input_dict.values())

    result = TupleDataclass.from_dict(input_dict)

    # __eq__ check
    assert input_tuple == result
    assert result == input_tuple
    assert result == TupleDataclass.from_dict(input_dict, name="OtherNAme")

    assert result.as_tuple() == input_tuple
    assert result.as_dict() == input_dict
    assert result._asdict() == input_dict
    assert (result[0], result[1], result[2]) == input_tuple
    assert (result.first, result.second, result.third) == input_tuple
    assert str(result) == "TupleDataclass(first=1, second=2, third={'key': 'value'})"
    assert repr(result) == "TupleDataclass(first=1, second=2, third={'key': 'value'})"

    result = TupleDataclass.from_dict(input_dict, name="CustomClass")
    assert str(result) == "CustomClass(first=1, second=2, third={'key': 'value'})"
    assert repr(result) == "CustomClass(first=1, second=2, third={'key': 'value'})"

    with pytest.raises(
        AttributeError, match="object has no attribute 'unknown_attribute'"
    ):
        result.unknown_attribute()
