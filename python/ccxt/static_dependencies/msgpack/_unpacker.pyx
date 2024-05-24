# coding: utf-8

from cpython cimport *
cdef extern from "Python.h":
    ctypedef struct PyObject
    object PyMemoryView_GetContiguous(object obj, int buffertype, char order)

from libc.stdlib cimport *
from libc.string cimport *
from libc.limits cimport *
from libc.stdint cimport uint64_t

from .exceptions import (
    BufferFull,
    OutOfData,
    ExtraData,
    FormatError,
    StackError,
)
from .ext import ExtType, Timestamp

cdef object giga = 1_000_000_000


cdef extern from "unpack.h":
    ctypedef struct msgpack_user:
        bint use_list
        bint raw
        bint has_pairs_hook # call object_hook with k-v pairs
        bint strict_map_key
        int timestamp
        PyObject* object_hook
        PyObject* list_hook
        PyObject* ext_hook
        PyObject* timestamp_t
        PyObject *giga;
        PyObject *utc;
        char *unicode_errors
        Py_ssize_t max_str_len
        Py_ssize_t max_bin_len
        Py_ssize_t max_array_len
        Py_ssize_t max_map_len
        Py_ssize_t max_ext_len

    ctypedef struct unpack_context:
        msgpack_user user
        PyObject* obj
        Py_ssize_t count

    ctypedef int (*execute_fn)(unpack_context* ctx, const char* data,
                               Py_ssize_t len, Py_ssize_t* off) except? -1
    execute_fn unpack_construct
    execute_fn unpack_skip
    execute_fn read_array_header
    execute_fn read_map_header
    void unpack_init(unpack_context* ctx)
    object unpack_data(unpack_context* ctx)
    void unpack_clear(unpack_context* ctx)

cdef inline init_ctx(unpack_context *ctx,
                     object object_hook, object object_pairs_hook,
                     object list_hook, object ext_hook,
                     bint use_list, bint raw, int timestamp,
                     bint strict_map_key,
                     const char* unicode_errors,
                     Py_ssize_t max_str_len, Py_ssize_t max_bin_len,
                     Py_ssize_t max_array_len, Py_ssize_t max_map_len,
                     Py_ssize_t max_ext_len):
    unpack_init(ctx)
    ctx.user.use_list = use_list
    ctx.user.raw = raw
    ctx.user.strict_map_key = strict_map_key
    ctx.user.object_hook = ctx.user.list_hook = <PyObject*>NULL
    ctx.user.max_str_len = max_str_len
    ctx.user.max_bin_len = max_bin_len
    ctx.user.max_array_len = max_array_len
    ctx.user.max_map_len = max_map_len
    ctx.user.max_ext_len = max_ext_len

    if object_hook is not None and object_pairs_hook is not None:
        raise TypeError("object_pairs_hook and object_hook are mutually exclusive.")

    if object_hook is not None:
        if not PyCallable_Check(object_hook):
            raise TypeError("object_hook must be a callable.")
        ctx.user.object_hook = <PyObject*>object_hook

    if object_pairs_hook is None:
        ctx.user.has_pairs_hook = False
    else:
        if not PyCallable_Check(object_pairs_hook):
            raise TypeError("object_pairs_hook must be a callable.")
        ctx.user.object_hook = <PyObject*>object_pairs_hook
        ctx.user.has_pairs_hook = True

    if list_hook is not None:
        if not PyCallable_Check(list_hook):
            raise TypeError("list_hook must be a callable.")
        ctx.user.list_hook = <PyObject*>list_hook

    if ext_hook is not None:
        if not PyCallable_Check(ext_hook):
            raise TypeError("ext_hook must be a callable.")
        ctx.user.ext_hook = <PyObject*>ext_hook

    if timestamp < 0 or 3 < timestamp:
        raise ValueError("timestamp must be 0..3")

    # Add Timestamp type to the user object so it may be used in unpack.h
    ctx.user.timestamp = timestamp
    ctx.user.timestamp_t = <PyObject*>Timestamp
    ctx.user.giga = <PyObject*>giga
    ctx.user.utc = <PyObject*>utc
    ctx.user.unicode_errors = unicode_errors

def default_read_extended_type(typecode, data):
    raise NotImplementedError("Cannot decode extended type with typecode=%d" % typecode)

cdef inline int get_data_from_buffer(object obj,
                                     Py_buffer *view,
                                     char **buf,
                                     Py_ssize_t *buffer_len) except 0:
    cdef object contiguous
    cdef Py_buffer tmp
    if PyObject_GetBuffer(obj, view, PyBUF_FULL_RO) == -1:
        raise
    if view.itemsize != 1:
        PyBuffer_Release(view)
        raise BufferError("cannot unpack from multi-byte object")
    if PyBuffer_IsContiguous(view, b'A') == 0:
        PyBuffer_Release(view)
        # create a contiguous copy and get buffer
        contiguous = PyMemoryView_GetContiguous(obj, PyBUF_READ, b'C')
        PyObject_GetBuffer(contiguous, view, PyBUF_SIMPLE)
        # view must hold the only reference to contiguous,
        # so memory is freed when view is released
        Py_DECREF(contiguous)
    buffer_len[0] = view.len
    buf[0] = <char*> view.buf
    return 1


def unpackb(object packed, *, object object_hook=None, object list_hook=None,
            bint use_list=True, bint raw=False, int timestamp=0, bint strict_map_key=True,
            unicode_errors=None,
            object_pairs_hook=None, ext_hook=ExtType,
            Py_ssize_t max_str_len=-1,
            Py_ssize_t max_bin_len=-1,
            Py_ssize_t max_array_len=-1,
            Py_ssize_t max_map_len=-1,
            Py_ssize_t max_ext_len=-1):
    """
    Unpack packed_bytes to object. Returns an unpacked object.

    Raises ``ExtraData`` when *packed* contains extra bytes.
    Raises ``ValueError`` when *packed* is incomplete.
    Raises ``FormatError`` when *packed* is not valid msgpack.
    Raises ``StackError`` when *packed* contains too nested.
    Other exceptions can be raised during unpacking.

    See :class:`Unpacker` for options.

    *max_xxx_len* options are configured automatically from ``len(packed)``.
    """
    cdef unpack_context ctx
    cdef Py_ssize_t off = 0
    cdef int ret

    cdef Py_buffer view
    cdef char* buf = NULL
    cdef Py_ssize_t buf_len
    cdef const char* cerr = NULL

    if unicode_errors is not None:
        cerr = unicode_errors

    get_data_from_buffer(packed, &view, &buf, &buf_len)

    if max_str_len == -1:
        max_str_len = buf_len
    if max_bin_len == -1:
        max_bin_len = buf_len
    if max_array_len == -1:
        max_array_len = buf_len
    if max_map_len == -1:
        max_map_len = buf_len//2
    if max_ext_len == -1:
        max_ext_len = buf_len

    try:
        init_ctx(&ctx, object_hook, object_pairs_hook, list_hook, ext_hook,
                 use_list, raw, timestamp, strict_map_key, cerr,
                 max_str_len, max_bin_len, max_array_len, max_map_len, max_ext_len)
        ret = unpack_construct(&ctx, buf, buf_len, &off)
    finally:
        PyBuffer_Release(&view);

    if ret == 1:
        obj = unpack_data(&ctx)
        if off < buf_len:
            raise ExtraData(obj, PyBytes_FromStringAndSize(buf+off, buf_len-off))
        return obj
    unpack_clear(&ctx)
    if ret == 0:
        raise ValueError("Unpack failed: incomplete input")
    elif ret == -2:
        raise FormatError
    elif ret == -3:
        raise StackError
    raise ValueError("Unpack failed: error = %d" % (ret,))


cdef class Unpacker(object):
    """Streaming unpacker.

    Arguments:

    :param file_like:
        File-like object having `.read(n)` method.
        If specified, unpacker reads serialized data from it and `.feed()` is not usable.

    :param int read_size:
        Used as `file_like.read(read_size)`. (default: `min(16*1024, max_buffer_size)`)

    :param bool use_list:
        If true, unpack msgpack array to Python list.
        Otherwise, unpack to Python tuple. (default: True)

    :param bool raw:
        If true, unpack msgpack raw to Python bytes.
        Otherwise, unpack to Python str by decoding with UTF-8 encoding (default).

    :param int timestamp:
        Control how timestamp type is unpacked:

            0 - Timestamp
            1 - float  (Seconds from the EPOCH)
            2 - int  (Nanoseconds from the EPOCH)
            3 - datetime.datetime  (UTC).

    :param bool strict_map_key:
        If true (default), only str or bytes are accepted for map (dict) keys.

    :param object_hook:
        When specified, it should be callable.
        Unpacker calls it with a dict argument after unpacking msgpack map.
        (See also simplejson)

    :param object_pairs_hook:
        When specified, it should be callable.
        Unpacker calls it with a list of key-value pairs after unpacking msgpack map.
        (See also simplejson)

    :param str unicode_errors:
        The error handler for decoding unicode. (default: 'strict')
        This option should be used only when you have msgpack data which
        contains invalid UTF-8 string.

    :param int max_buffer_size:
        Limits size of data waiting unpacked.  0 means 2**32-1.
        The default value is 100*1024*1024 (100MiB).
        Raises `BufferFull` exception when it is insufficient.
        You should set this parameter when unpacking data from untrusted source.

    :param int max_str_len:
        Deprecated, use *max_buffer_size* instead.
        Limits max length of str. (default: max_buffer_size)

    :param int max_bin_len:
        Deprecated, use *max_buffer_size* instead.
        Limits max length of bin. (default: max_buffer_size)

    :param int max_array_len:
        Limits max length of array.
        (default: max_buffer_size)

    :param int max_map_len:
        Limits max length of map.
        (default: max_buffer_size//2)

    :param int max_ext_len:
        Deprecated, use *max_buffer_size* instead.
        Limits max size of ext type.  (default: max_buffer_size)

    Example of streaming deserialize from file-like object::

        unpacker = Unpacker(file_like)
        for o in unpacker:
            process(o)

    Example of streaming deserialize from socket::

        unpacker = Unpacker()
        while True:
            buf = sock.recv(1024**2)
            if not buf:
                break
            unpacker.feed(buf)
            for o in unpacker:
                process(o)

    Raises ``ExtraData`` when *packed* contains extra bytes.
    Raises ``OutOfData`` when *packed* is incomplete.
    Raises ``FormatError`` when *packed* is not valid msgpack.
    Raises ``StackError`` when *packed* contains too nested.
    Other exceptions can be raised during unpacking.
    """
    cdef unpack_context ctx
    cdef char* buf
    cdef Py_ssize_t buf_size, buf_head, buf_tail
    cdef object file_like
    cdef object file_like_read
    cdef Py_ssize_t read_size
    # To maintain refcnt.
    cdef object object_hook, object_pairs_hook, list_hook, ext_hook
    cdef object unicode_errors
    cdef Py_ssize_t max_buffer_size
    cdef uint64_t stream_offset

    def __cinit__(self):
        self.buf = NULL

    def __dealloc__(self):
        PyMem_Free(self.buf)
        self.buf = NULL

    def __init__(self, file_like=None, *, Py_ssize_t read_size=0,
                 bint use_list=True, bint raw=False, int timestamp=0, bint strict_map_key=True,
                 object object_hook=None, object object_pairs_hook=None, object list_hook=None,
                 unicode_errors=None, Py_ssize_t max_buffer_size=100*1024*1024,
                 object ext_hook=ExtType,
                 Py_ssize_t max_str_len=-1,
                 Py_ssize_t max_bin_len=-1,
                 Py_ssize_t max_array_len=-1,
                 Py_ssize_t max_map_len=-1,
                 Py_ssize_t max_ext_len=-1):
        cdef const char *cerr=NULL

        self.object_hook = object_hook
        self.object_pairs_hook = object_pairs_hook
        self.list_hook = list_hook
        self.ext_hook = ext_hook

        self.file_like = file_like
        if file_like:
            self.file_like_read = file_like.read
            if not PyCallable_Check(self.file_like_read):
                raise TypeError("`file_like.read` must be a callable.")

        if not max_buffer_size:
            max_buffer_size = INT_MAX
        if max_str_len == -1:
            max_str_len = max_buffer_size
        if max_bin_len == -1:
            max_bin_len = max_buffer_size
        if max_array_len == -1:
            max_array_len = max_buffer_size
        if max_map_len == -1:
            max_map_len = max_buffer_size//2
        if max_ext_len == -1:
            max_ext_len = max_buffer_size

        if read_size > max_buffer_size:
            raise ValueError("read_size should be less or equal to max_buffer_size")
        if not read_size:
            read_size = min(max_buffer_size, 1024**2)

        self.max_buffer_size = max_buffer_size
        self.read_size = read_size
        self.buf = <char*>PyMem_Malloc(read_size)
        if self.buf == NULL:
            raise MemoryError("Unable to allocate internal buffer.")
        self.buf_size = read_size
        self.buf_head = 0
        self.buf_tail = 0
        self.stream_offset = 0

        if unicode_errors is not None:
            self.unicode_errors = unicode_errors
            cerr = unicode_errors

        init_ctx(&self.ctx, object_hook, object_pairs_hook, list_hook,
                 ext_hook, use_list, raw, timestamp, strict_map_key, cerr,
                 max_str_len, max_bin_len, max_array_len,
                 max_map_len, max_ext_len)

    def feed(self, object next_bytes):
        """Append `next_bytes` to internal buffer."""
        cdef Py_buffer pybuff
        cdef char* buf
        cdef Py_ssize_t buf_len

        if self.file_like is not None:
            raise AssertionError(
                    "unpacker.feed() is not be able to use with `file_like`.")

        get_data_from_buffer(next_bytes, &pybuff, &buf, &buf_len)
        try:
            self.append_buffer(buf, buf_len)
        finally:
            PyBuffer_Release(&pybuff)

    cdef append_buffer(self, void* _buf, Py_ssize_t _buf_len):
        cdef:
            char* buf = self.buf
            char* new_buf
            Py_ssize_t head = self.buf_head
            Py_ssize_t tail = self.buf_tail
            Py_ssize_t buf_size = self.buf_size
            Py_ssize_t new_size

        if tail + _buf_len > buf_size:
            if ((tail - head) + _buf_len) <= buf_size:
                # move to front.
                memmove(buf, buf + head, tail - head)
                tail -= head
                head = 0
            else:
                # expand buffer.
                new_size = (tail-head) + _buf_len
                if new_size > self.max_buffer_size:
                    raise BufferFull
                new_size = min(new_size*2, self.max_buffer_size)
                new_buf = <char*>PyMem_Malloc(new_size)
                if new_buf == NULL:
                    # self.buf still holds old buffer and will be freed during
                    # obj destruction
                    raise MemoryError("Unable to enlarge internal buffer.")
                memcpy(new_buf, buf + head, tail - head)
                PyMem_Free(buf)

                buf = new_buf
                buf_size = new_size
                tail -= head
                head = 0

        memcpy(buf + tail, <char*>(_buf), _buf_len)
        self.buf = buf
        self.buf_head = head
        self.buf_size = buf_size
        self.buf_tail = tail + _buf_len

    cdef int read_from_file(self) except -1:
        cdef Py_ssize_t remains = self.max_buffer_size - (self.buf_tail - self.buf_head)
        if remains <= 0:
            raise BufferFull

        next_bytes = self.file_like_read(min(self.read_size, remains))
        if next_bytes:
            self.append_buffer(PyBytes_AsString(next_bytes), PyBytes_Size(next_bytes))
        else:
            self.file_like = None
        return 0

    cdef object _unpack(self, execute_fn execute, bint iter=0):
        cdef int ret
        cdef object obj
        cdef Py_ssize_t prev_head

        while 1:
            prev_head = self.buf_head
            if prev_head < self.buf_tail:
                ret = execute(&self.ctx, self.buf, self.buf_tail, &self.buf_head)
                self.stream_offset += self.buf_head - prev_head
            else:
                ret = 0

            if ret == 1:
                obj = unpack_data(&self.ctx)
                unpack_init(&self.ctx)
                return obj
            elif ret == 0:
                if self.file_like is not None:
                    self.read_from_file()
                    continue
                if iter:
                    raise StopIteration("No more data to unpack.")
                else:
                    raise OutOfData("No more data to unpack.")
            elif ret == -2:
                raise FormatError
            elif ret == -3:
                raise StackError
            else:
                raise ValueError("Unpack failed: error = %d" % (ret,))

    def read_bytes(self, Py_ssize_t nbytes):
        """Read a specified number of raw bytes from the stream"""
        cdef Py_ssize_t nread
        nread = min(self.buf_tail - self.buf_head, nbytes)
        ret = PyBytes_FromStringAndSize(self.buf + self.buf_head, nread)
        self.buf_head += nread
        if nread < nbytes and self.file_like is not None:
            ret += self.file_like.read(nbytes - nread)
            nread = len(ret)
        self.stream_offset += nread
        return ret

    def unpack(self):
        """Unpack one object

        Raises `OutOfData` when there are no more bytes to unpack.
        """
        return self._unpack(unpack_construct)

    def skip(self):
        """Read and ignore one object, returning None

        Raises `OutOfData` when there are no more bytes to unpack.
        """
        return self._unpack(unpack_skip)

    def read_array_header(self):
        """assuming the next object is an array, return its size n, such that
        the next n unpack() calls will iterate over its contents.

        Raises `OutOfData` when there are no more bytes to unpack.
        """
        return self._unpack(read_array_header)

    def read_map_header(self):
        """assuming the next object is a map, return its size n, such that the
        next n * 2 unpack() calls will iterate over its key-value pairs.

        Raises `OutOfData` when there are no more bytes to unpack.
        """
        return self._unpack(read_map_header)

    def tell(self):
        """Returns the current position of the Unpacker in bytes, i.e., the
        number of bytes that were read from the input, also the starting
        position of the next object.
        """
        return self.stream_offset

    def __iter__(self):
        return self

    def __next__(self):
        return self._unpack(unpack_construct, 1)

    # for debug.
    #def _buf(self):
    #    return PyString_FromStringAndSize(self.buf, self.buf_tail)

    #def _off(self):
    #    return self.buf_head
