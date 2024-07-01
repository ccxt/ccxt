from typing import Any, Dict, Optional, Type

import marshmallow.fields as mfields
import marshmallow.utils

from starkware.starkware_utils.field_validators import validate_in_range
from starkware.starkware_utils.marshmallow_dataclass_fields import (
    BytesAsBase64Str,
    BytesAsHex,
    IntAsHex,
    IntAsStr,
)
from starkware.starkware_utils.validated_fields import ValidatedField


def _generate_metadata(
    marshmallow_field_cls: Type[mfields.Field],
    validated_field: Optional[ValidatedField],
    required: Optional[bool] = None,
) -> Dict[str, Any]:
    if required is None:
        required = True

    metadata: Dict[str, Any] = dict(marshmallow_field=marshmallow_field_cls(required=required))
    if validated_field is not None:
        metadata.update(validated_field=validated_field)

    return metadata


def int_metadata(
    validated_field: Optional[ValidatedField], required: Optional[bool] = None
) -> Dict[str, Any]:
    return _generate_metadata(
        marshmallow_field_cls=mfields.Integer, validated_field=validated_field, required=required
    )


def int_as_hex_metadata(
    validated_field: Optional[ValidatedField], required: Optional[bool] = None
) -> Dict[str, Any]:
    return _generate_metadata(
        marshmallow_field_cls=IntAsHex, validated_field=validated_field, required=required
    )


def int_as_str_metadata(
    validated_field: Optional[ValidatedField], required: Optional[bool] = None
) -> Dict[str, Any]:
    return _generate_metadata(
        marshmallow_field_cls=IntAsStr, validated_field=validated_field, required=required
    )


def bytes_as_hex_metadata(
    validated_field: Optional[ValidatedField], required: Optional[bool] = None
) -> Dict[str, Any]:
    return _generate_metadata(
        marshmallow_field_cls=BytesAsHex, validated_field=validated_field, required=required
    )


def bytes_as_base64_str_metadata(
    validated_field: Optional[ValidatedField], required: Optional[bool] = None
) -> Dict[str, Any]:
    return _generate_metadata(
        marshmallow_field_cls=BytesAsBase64Str, validated_field=validated_field, required=required
    )


def sequential_id_metadata(
    field_name: str,
    required: bool = True,
    allow_previous_id: bool = False,
    load_default: Any = marshmallow.utils.missing,
) -> Dict[str, Any]:
    load_default_value = load_default() if callable(load_default) else load_default
    validator = validate_in_range(
        field_name=field_name,
        min_value=-1 if allow_previous_id else 0,
        allow_none=load_default_value is None,
    )
    return dict(
        marshmallow_field=mfields.Integer(
            strict=True, required=required, validate=validator, load_default=load_default
        )
    )
