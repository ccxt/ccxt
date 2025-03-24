
from ._cares import ffi as _ffi, lib as _lib
from .utils import maybe_str


exported_pycares_symbols = [
    'ARES_SUCCESS',
    # error codes
    'ARES_ENODATA',
    'ARES_EFORMERR',
    'ARES_ESERVFAIL',
    'ARES_ENOTFOUND',
    'ARES_ENOTIMP',
    'ARES_EREFUSED',
    'ARES_EBADQUERY',
    'ARES_EBADNAME',
    'ARES_EBADFAMILY',
    'ARES_EBADRESP',
    'ARES_ECONNREFUSED',
    'ARES_ETIMEOUT',
    'ARES_EOF',
    'ARES_EFILE',
    'ARES_ENOMEM',
    'ARES_EDESTRUCTION',
    'ARES_EBADSTR',
    'ARES_EBADFLAGS',
    'ARES_ENONAME',
    'ARES_EBADHINTS',
    'ARES_ENOTINITIALIZED',
    'ARES_ELOADIPHLPAPI',
    'ARES_EADDRGETNETWORKPARAMS',
    'ARES_ECANCELLED',
    'ARES_ESERVICE'
]

errorcode = {}

for symbol in exported_pycares_symbols:
    value = getattr(_lib, symbol)
    globals()[symbol] = value
    globals()["errorcode"][value] = symbol


def strerror(code):
    return maybe_str(_ffi.string(_lib.ares_strerror(code)))


__all__ = exported_pycares_symbols + ['errorcode', 'strerror']

del exported_pycares_symbols
