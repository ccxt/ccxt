import typing

from ..marshmallow import Schema, ValidationError


class OneOfSchema(Schema):
    """
    This is a special kind of schema that actually multiplexes other schemas
    based on object type. When serializing values, it uses get_obj_type() method
    to get object type name. Then it uses `type_schemas` name-to-Schema mapping
    to get schema for that particular object type, serializes object using that
    schema and adds an extra "type" field with name of object type.
    Deserialization is reverse.

    Example:

        class Foo(object):
            def __init__(self, foo):
                self.foo = foo

        class Bar(object):
            def __init__(self, bar):
                self.bar = bar

        class FooSchema(marshmallow.Schema):
            foo = marshmallow.fields.String(required=True)

            @marshmallow.post_load
            def make_foo(self, data, **kwargs):
                return Foo(**data)

        class BarSchema(marshmallow.Schema):
            bar = marshmallow.fields.Integer(required=True)

            @marshmallow.post_load
            def make_bar(self, data, **kwargs):
                return Bar(**data)

        class MyUberSchema(marshmallow.OneOfSchema):
            type_schemas = {
                'foo': FooSchema,
                'bar': BarSchema,
            }

            def get_obj_type(self, obj):
                if isinstance(obj, Foo):
                    return 'foo'
                elif isinstance(obj, Bar):
                    return 'bar'
                else:
                    raise Exception('Unknown object type: %s' % repr(obj))

        MyUberSchema().dump([Foo(foo='hello'), Bar(bar=123)], many=True)
        # => [{'type': 'foo', 'foo': 'hello'}, {'type': 'bar', 'bar': 123}]

    You can control type field name added to serialized object representation by
    setting `type_field` class property.
    """

    type_field = "type"
    type_field_remove = True
    type_schemas: typing.Mapping[str, typing.Union[typing.Type[Schema], Schema]] = {}

    def get_obj_type(self, obj):
        """Returns name of the schema during dump() calls, given the object
        being dumped."""
        return obj.__class__.__name__

    def get_data_type(self, data):
        """Returns name of the schema during load() calls, given the data being
        loaded. Defaults to looking up `type_field` in the data."""
        data_type = data.get(self.type_field)
        if self.type_field in data and self.type_field_remove:
            data.pop(self.type_field)
        return data_type

    def dump(self, obj, *, many=None, **kwargs):
        errors = {}
        result_data = []
        result_errors = {}
        many = self.many if many is None else bool(many)
        if not many:
            result = result_data = self._dump(obj, **kwargs)
        else:
            for idx, o in enumerate(obj):
                try:
                    result = self._dump(o, **kwargs)
                    result_data.append(result)
                except ValidationError as error:
                    result_errors[idx] = error.normalized_messages()
                    result_data.append(error.valid_data)

        result = result_data
        errors = result_errors

        if not errors:
            return result
        else:
            exc = ValidationError(errors, data=obj, valid_data=result)
            raise exc

    def _dump(self, obj, *, update_fields=True, **kwargs):
        obj_type = self.get_obj_type(obj)
        if obj_type is None:
            return (
                None,
                {"_schema": f"Unknown object class: {obj.__class__.__name__}"},
            )

        type_schema = self.type_schemas.get(obj_type)
        if not type_schema:
            return None, {"_schema": f"Unsupported object type: {obj_type}"}

        schema = type_schema if isinstance(type_schema, Schema) else type_schema()

        schema.context.update(getattr(self, "context", {}))

        result = schema.dump(obj, many=False, **kwargs)
        if result is not None:
            result[self.type_field] = obj_type
        return result

    def load(self, data, *, many=None, partial=None, unknown=None, **kwargs):
        errors = {}
        result_data = []
        result_errors = {}
        many = self.many if many is None else bool(many)
        if partial is None:
            partial = self.partial
        if not many:
            try:
                result = result_data = self._load(
                    data, partial=partial, unknown=unknown, **kwargs
                )
                #  result_data.append(result)
            except ValidationError as error:
                result_errors = error.normalized_messages()
                result_data.append(error.valid_data)
        else:
            for idx, item in enumerate(data):
                try:
                    result = self._load(item, partial=partial, **kwargs)
                    result_data.append(result)
                except ValidationError as error:
                    result_errors[idx] = error.normalized_messages()
                    result_data.append(error.valid_data)

        result = result_data
        errors = result_errors

        if not errors:
            return result
        else:
            exc = ValidationError(errors, data=data, valid_data=result)
            raise exc

    def _load(self, data, *, partial=None, unknown=None, **kwargs):
        if not isinstance(data, dict):
            raise ValidationError({"_schema": f"Invalid data type: {data}"})

        data = dict(data)
        unknown = unknown or self.unknown
        data_type = self.get_data_type(data)

        if data_type is None:
            raise ValidationError(
                {self.type_field: ["Missing data for required field."]}
            )

        try:
            type_schema = self.type_schemas.get(data_type)
        except TypeError as error:
            # data_type could be unhashable
            raise ValidationError(
                {self.type_field: [f"Invalid value: {data_type}"]}
            ) from error
        if not type_schema:
            raise ValidationError(
                {self.type_field: [f"Unsupported value: {data_type}"]}
            )

        schema = type_schema if isinstance(type_schema, Schema) else type_schema()

        schema.context.update(getattr(self, "context", {}))

        return schema.load(data, many=False, partial=partial, unknown=unknown, **kwargs)

    def validate(self, data, *, many=None, partial=None):
        try:
            self.load(data, many=many, partial=partial)
        except ValidationError as ve:
            return ve.messages
        return {}
