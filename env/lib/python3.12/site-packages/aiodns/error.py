
import pycares

for code, name in pycares.errno.errorcode.items():
    globals()[name] = code


class DNSError(Exception):
    pass

