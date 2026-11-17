import struct

# Write-only MessagePack encoder, byte-identical to msgpack-python's default packb (use_bin_type=True, float64).

_INT_FORMATS = (
    (0, 0x7F, 'B', None), (-0x20, -1, 'b', None),
    (0x80, 0xFF, '>BB', 0xCC), (-0x80, -1, '>Bb', 0xD0),
    (0x100, 0xFFFF, '>BH', 0xCD), (-0x8000, -1, '>Bh', 0xD1),
    (0x10000, 0xFFFFFFFF, '>BI', 0xCE), (-0x80000000, -1, '>Bi', 0xD2),
    (0x100000000, 0xFFFFFFFFFFFFFFFF, '>BQ', 0xCF), (-0x8000000000000000, -1, '>Bq', 0xD3),
)


def _header(n, small, codes, what):
    if small is not None and n <= small[0]:
        return struct.pack('B', small[1] + n)
    for limit, fmt, code in zip((0xFF, 0xFFFF, 0xFFFFFFFF), ('>BB', '>BH', '>BI'), codes):
        if code is not None and n <= limit:
            return struct.pack(fmt, code, n)
    raise ValueError(what + ' is too large')


def _pack(obj, out, nest_limit=511):
    if nest_limit < 0:
        raise ValueError('recursion limit exceeded')
    if obj is None:
        out.append(b'\xc0')
    elif isinstance(obj, bool):
        out.append(b'\xc3' if obj else b'\xc2')
    elif isinstance(obj, int):
        for low, high, fmt, code in _INT_FORMATS:
            if low <= obj <= high:
                out.append(struct.pack(fmt, obj) if code is None else struct.pack(fmt, code, obj))
                return
        raise OverflowError('Integer value out of range')
    elif isinstance(obj, (bytes, bytearray, memoryview)):
        data = obj.tobytes() if isinstance(obj, memoryview) else bytes(obj)
        out.append(_header(len(data), None, (0xC4, 0xC5, 0xC6), 'Bin') + data)
    elif isinstance(obj, str):
        data = obj.encode('utf-8')
        out.append(_header(len(data), (0x1F, 0xA0), (0xD9, 0xDA, 0xDB), 'String') + data)
    elif isinstance(obj, float):
        out.append(struct.pack('>Bd', 0xCB, obj))
    elif isinstance(obj, (list, tuple)):
        out.append(_header(len(obj), (0x0F, 0x90), (None, 0xDC, 0xDD), 'Array'))
        for item in obj:
            _pack(item, out, nest_limit - 1)
    elif isinstance(obj, dict):
        out.append(_header(len(obj), (0x0F, 0x80), (None, 0xDE, 0xDF), 'Dict'))
        for key, value in obj.items():
            _pack(key, out, nest_limit - 2)
            _pack(value, out, nest_limit - 2)
    else:
        raise TypeError(f'Cannot serialize {obj!r}')


def packb(obj):
    out = []
    _pack(obj, out)
    return b''.join(out)
