/*
 * MessagePack for Python unpacking routine
 *
 * Copyright (C) 2009 Naoki INADA
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

#define MSGPACK_EMBED_STACK_SIZE  (1024)
#include "unpack_define.h"

typedef struct unpack_user {
    bool use_list;
    bool raw;
    bool has_pairs_hook;
    bool strict_map_key;
    int timestamp;
    PyObject *object_hook;
    PyObject *list_hook;
    PyObject *ext_hook;
    PyObject *timestamp_t;
    PyObject *giga;
    PyObject *utc;
    const char *unicode_errors;
    Py_ssize_t max_str_len, max_bin_len, max_array_len, max_map_len, max_ext_len;
} unpack_user;

typedef PyObject* msgpack_unpack_object;
struct unpack_context;
typedef struct unpack_context unpack_context;
typedef int (*execute_fn)(unpack_context *ctx, const char* data, Py_ssize_t len, Py_ssize_t* off);

static inline msgpack_unpack_object unpack_callback_root(unpack_user* u)
{
    return NULL;
}

static inline int unpack_callback_uint16(unpack_user* u, uint16_t d, msgpack_unpack_object* o)
{
    PyObject *p = PyInt_FromLong((long)d);
    if (!p)
        return -1;
    *o = p;
    return 0;
}
static inline int unpack_callback_uint8(unpack_user* u, uint8_t d, msgpack_unpack_object* o)
{
    return unpack_callback_uint16(u, d, o);
}


static inline int unpack_callback_uint32(unpack_user* u, uint32_t d, msgpack_unpack_object* o)
{
    PyObject *p = PyInt_FromSize_t((size_t)d);
    if (!p)
        return -1;
    *o = p;
    return 0;
}

static inline int unpack_callback_uint64(unpack_user* u, uint64_t d, msgpack_unpack_object* o)
{
    PyObject *p;
    if (d > LONG_MAX) {
        p = PyLong_FromUnsignedLongLong((unsigned PY_LONG_LONG)d);
    } else {
        p = PyInt_FromLong((long)d);
    }
    if (!p)
        return -1;
    *o = p;
    return 0;
}

static inline int unpack_callback_int32(unpack_user* u, int32_t d, msgpack_unpack_object* o)
{
    PyObject *p = PyInt_FromLong(d);
    if (!p)
        return -1;
    *o = p;
    return 0;
}

static inline int unpack_callback_int16(unpack_user* u, int16_t d, msgpack_unpack_object* o)
{
    return unpack_callback_int32(u, d, o);
}

static inline int unpack_callback_int8(unpack_user* u, int8_t d, msgpack_unpack_object* o)
{
    return unpack_callback_int32(u, d, o);
}

static inline int unpack_callback_int64(unpack_user* u, int64_t d, msgpack_unpack_object* o)
{
    PyObject *p;
    if (d > LONG_MAX || d < LONG_MIN) {
        p = PyLong_FromLongLong((PY_LONG_LONG)d);
    } else {
        p = PyInt_FromLong((long)d);
    }
    *o = p;
    return 0;
}

static inline int unpack_callback_double(unpack_user* u, double d, msgpack_unpack_object* o)
{
    PyObject *p = PyFloat_FromDouble(d);
    if (!p)
        return -1;
    *o = p;
    return 0;
}

static inline int unpack_callback_float(unpack_user* u, float d, msgpack_unpack_object* o)
{
    return unpack_callback_double(u, d, o);
}

static inline int unpack_callback_nil(unpack_user* u, msgpack_unpack_object* o)
{ Py_INCREF(Py_None); *o = Py_None; return 0; }

static inline int unpack_callback_true(unpack_user* u, msgpack_unpack_object* o)
{ Py_INCREF(Py_True); *o = Py_True; return 0; }

static inline int unpack_callback_false(unpack_user* u, msgpack_unpack_object* o)
{ Py_INCREF(Py_False); *o = Py_False; return 0; }

static inline int unpack_callback_array(unpack_user* u, unsigned int n, msgpack_unpack_object* o)
{
    if (n > u->max_array_len) {
        PyErr_Format(PyExc_ValueError, "%u exceeds max_array_len(%zd)", n, u->max_array_len);
        return -1;
    }
    PyObject *p = u->use_list ? PyList_New(n) : PyTuple_New(n);

    if (!p)
        return -1;
    *o = p;
    return 0;
}

static inline int unpack_callback_array_item(unpack_user* u, unsigned int current, msgpack_unpack_object* c, msgpack_unpack_object o)
{
    if (u->use_list)
        PyList_SET_ITEM(*c, current, o);
    else
        PyTuple_SET_ITEM(*c, current, o);
    return 0;
}

static inline int unpack_callback_array_end(unpack_user* u, msgpack_unpack_object* c)
{
    if (u->list_hook) {
        PyObject *new_c = PyObject_CallFunctionObjArgs(u->list_hook, *c, NULL);
        if (!new_c)
            return -1;
        Py_DECREF(*c);
        *c = new_c;
    }
    return 0;
}

static inline int unpack_callback_map(unpack_user* u, unsigned int n, msgpack_unpack_object* o)
{
    if (n > u->max_map_len) {
        PyErr_Format(PyExc_ValueError, "%u exceeds max_map_len(%zd)", n, u->max_map_len);
        return -1;
    }
    PyObject *p;
    if (u->has_pairs_hook) {
        p = PyList_New(n); // Or use tuple?
    }
    else {
        p = PyDict_New();
    }
    if (!p)
        return -1;
    *o = p;
    return 0;
}

static inline int unpack_callback_map_item(unpack_user* u, unsigned int current, msgpack_unpack_object* c, msgpack_unpack_object k, msgpack_unpack_object v)
{
    if (u->strict_map_key && !PyUnicode_CheckExact(k) && !PyBytes_CheckExact(k)) {
        PyErr_Format(PyExc_ValueError, "%.100s is not allowed for map key when strict_map_key=True", Py_TYPE(k)->tp_name);
        return -1;
    }
    if (PyUnicode_CheckExact(k)) {
        PyUnicode_InternInPlace(&k);
    }
    if (u->has_pairs_hook) {
        msgpack_unpack_object item = PyTuple_Pack(2, k, v);
        if (!item)
            return -1;
        Py_DECREF(k);
        Py_DECREF(v);
        PyList_SET_ITEM(*c, current, item);
        return 0;
    }
    else if (PyDict_SetItem(*c, k, v) == 0) {
        Py_DECREF(k);
        Py_DECREF(v);
        return 0;
    }
    return -1;
}

static inline int unpack_callback_map_end(unpack_user* u, msgpack_unpack_object* c)
{
    if (u->object_hook) {
        PyObject *new_c = PyObject_CallFunctionObjArgs(u->object_hook, *c, NULL);
        if (!new_c)
            return -1;

        Py_DECREF(*c);
        *c = new_c;
    }
    return 0;
}

static inline int unpack_callback_raw(unpack_user* u, const char* b, const char* p, unsigned int l, msgpack_unpack_object* o)
{
    if (l > u->max_str_len) {
        PyErr_Format(PyExc_ValueError, "%u exceeds max_str_len(%zd)", l, u->max_str_len);
        return -1;
    }

    PyObject *py;

    if (u->raw) {
        py = PyBytes_FromStringAndSize(p, l);
    } else {
        py = PyUnicode_DecodeUTF8(p, l, u->unicode_errors);
    }
    if (!py)
        return -1;
    *o = py;
    return 0;
}

static inline int unpack_callback_bin(unpack_user* u, const char* b, const char* p, unsigned int l, msgpack_unpack_object* o)
{
    if (l > u->max_bin_len) {
        PyErr_Format(PyExc_ValueError, "%u exceeds max_bin_len(%zd)", l, u->max_bin_len);
        return -1;
    }

    PyObject *py = PyBytes_FromStringAndSize(p, l);
    if (!py)
        return -1;
    *o = py;
    return 0;
}

typedef struct msgpack_timestamp {
    int64_t tv_sec;
    uint32_t tv_nsec;
} msgpack_timestamp;

/*
 * Unpack ext buffer to a timestamp. Pulled from msgpack-c timestamp.h.
 */
static int unpack_timestamp(const char* buf, unsigned int buflen, msgpack_timestamp* ts) {
    switch (buflen) {
    case 4:
        ts->tv_nsec = 0;
        {
            uint32_t v = _msgpack_load32(uint32_t, buf);
            ts->tv_sec = (int64_t)v;
        }
        return 0;
    case 8: {
        uint64_t value =_msgpack_load64(uint64_t, buf);
        ts->tv_nsec = (uint32_t)(value >> 34);
        ts->tv_sec = value & 0x00000003ffffffffLL;
        return 0;
    }
    case 12:
        ts->tv_nsec = _msgpack_load32(uint32_t, buf);
        ts->tv_sec = _msgpack_load64(int64_t, buf + 4);
        return 0;
    default:
        return -1;
    }
}

#include "datetime.h"

static int unpack_callback_ext(unpack_user* u, const char* base, const char* pos,
                               unsigned int length, msgpack_unpack_object* o)
{
    int8_t typecode = (int8_t)*pos++;
    if (!u->ext_hook) {
        PyErr_SetString(PyExc_AssertionError, "u->ext_hook cannot be NULL");
        return -1;
    }
    if (length-1 > u->max_ext_len) {
        PyErr_Format(PyExc_ValueError, "%u exceeds max_ext_len(%zd)", length, u->max_ext_len);
        return -1;
    }

    PyObject *py = NULL;
    // length also includes the typecode, so the actual data is length-1
    if (typecode == -1) {
        msgpack_timestamp ts;
        if (unpack_timestamp(pos, length-1, &ts) < 0) {
            return -1;
        }

        if (u->timestamp == 2) {  // int
            PyObject *a = PyLong_FromLongLong(ts.tv_sec);
            if (a == NULL) return -1;

            PyObject *c = PyNumber_Multiply(a, u->giga);
            Py_DECREF(a);
            if (c == NULL) {
                return -1;
            }

            PyObject *b = PyLong_FromUnsignedLong(ts.tv_nsec);
            if (b == NULL) {
                Py_DECREF(c);
                return -1;
            }

            py = PyNumber_Add(c, b);
            Py_DECREF(c);
            Py_DECREF(b);
        }
        else if (u->timestamp == 0) {  // Timestamp
            py = PyObject_CallFunction(u->timestamp_t, "(Lk)", ts.tv_sec, ts.tv_nsec);
        }
        else if (u->timestamp == 3) {  // datetime
            // Calculate datetime using epoch + delta
            // due to limitations PyDateTime_FromTimestamp on Windows with negative timestamps
            PyObject *epoch = PyDateTimeAPI->DateTime_FromDateAndTime(1970, 1, 1, 0, 0, 0, 0, u->utc, PyDateTimeAPI->DateTimeType);
            if (epoch == NULL) {
                return -1;
            }

            PyObject* d = PyDelta_FromDSU(ts.tv_sec/(24*3600), ts.tv_sec%(24*3600), ts.tv_nsec / 1000);
            if (d == NULL) {
                Py_DECREF(epoch);
                return -1;
            }

            py = PyNumber_Add(epoch, d);

            Py_DECREF(epoch);
            Py_DECREF(d);
        }
        else { // float
            PyObject *a = PyFloat_FromDouble((double)ts.tv_nsec);
            if (a == NULL) return -1;

            PyObject *b = PyNumber_TrueDivide(a, u->giga);
            Py_DECREF(a);
            if (b == NULL) return -1;

            PyObject *c = PyLong_FromLongLong(ts.tv_sec);
            if (c == NULL) {
                Py_DECREF(b);
                return -1;
            }

            a = PyNumber_Add(b, c);
            Py_DECREF(b);
            Py_DECREF(c);
            py = a;
        }
    } else {
        py = PyObject_CallFunction(u->ext_hook, "(iy#)", (int)typecode, pos, (Py_ssize_t)length-1);
    }
    if (!py)
        return -1;
    *o = py;
    return 0;
}

#include "unpack_template.h"
