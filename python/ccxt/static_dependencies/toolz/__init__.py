from .itertoolz import *

from .functoolz import *

from .dicttoolz import *

from .recipes import *

from functools import partial, reduce

sorted = sorted

map = map

filter = filter

# Aliases
comp = compose

from . import curried

# functoolz._sigs.create_signature_registry()

#from ._version import get_versions
__version__ = 'ccxt'  # custom ccxt version
#del get_versions
