from .. import (
    curry,
    merge_with,
    merge
)


__all__ = ['merge_with', 'merge']


@curry
def merge_with(func, d, *dicts, **kwargs):
    return merge_with(func, d, *dicts, **kwargs)


@curry
def merge(d, *dicts, **kwargs):
    return merge(d, *dicts, **kwargs)


merge_with.__doc__ = merge_with.__doc__
merge.__doc__ = merge.__doc__
