import sys

import marshmallow.fields

if sys.version_info >= (3, 9):
    from typing import Annotated
else:
    from typing_extensions import Annotated

Url = Annotated[str, marshmallow.fields.Url]
Email = Annotated[str, marshmallow.fields.Email]

# Aliases
URL = Url
