class CairoSerializerException(Exception):
    """Exception thrown by CairoSerializer."""


class InvalidTypeException(CairoSerializerException, TypeError):
    """Exception thrown when invalid type was provided."""


class InvalidValueException(CairoSerializerException, ValueError):
    """Exception thrown when invalid value was provided."""
