
try:
    import idna as idna2008
except ImportError:
    idna2008 = None


def ascii_bytes(data):
    if isinstance(data, str):
        return data.encode('ascii')
    if isinstance(data, bytes):
        return data
    raise TypeError('only str (ascii encoding) and bytes are supported')


def maybe_str(data):
    if isinstance(data, str):
        return data
    if isinstance(data, bytes):
        try:
            return data.decode('ascii')
        except UnicodeDecodeError:
            return data
    raise TypeError('only str (ascii encoding) and bytes are supported')


def is_all_ascii(text):
    for c in text:
        if ord(c) > 0x7f:
            return False
    return True

def parse_name_idna2008(name):
    parts = name.split('.')
    r = []
    for part in parts:
        if is_all_ascii(part):
            r.append(part.encode('ascii'))
        else:
            r.append(idna2008.encode(part))
    return b'.'.join(r)

def parse_name(name):
    if isinstance(name, str):
        if is_all_ascii(name):
            return name.encode('ascii')
        if idna2008 is not None:
            return parse_name_idna2008(name)
        return name.encode('idna')
    if isinstance(name, bytes):
        return name
    raise TypeError('only str and bytes are supported')


__all__ = ['ascii_bytes', 'maybe_str', 'parse_name']

