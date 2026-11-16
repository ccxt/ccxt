package ccxt

import (
	"encoding/binary"
	"fmt"
	"math"
	"reflect"
	"strings"
)

// msgpackEncode is a write-only MessagePack encoder: Go int is packed in its smallest form,
// int64 as a full int64, structs as maps in field order using `msgpack:"name[,omitempty]"` tags.
func msgpackEncode(v any) []byte {
	return msgpackAppend(nil, reflect.ValueOf(v))
}

func msgpackHead(b []byte, n int, fix, b8, b16, b32 byte, fixMax int) []byte {
	switch {
	case n < fixMax:
		return append(b, fix|byte(n))
	case b8 != 0 && n <= math.MaxUint8:
		return append(b, b8, byte(n))
	case n <= math.MaxUint16:
		return binary.BigEndian.AppendUint16(append(b, b16), uint16(n))
	}
	return binary.BigEndian.AppendUint32(append(b, b32), uint32(n))
}

func msgpackInt(b []byte, n int64) []byte {
	switch {
	case n >= 0 && n <= math.MaxInt8, n < 0 && n >= -32:
		return append(b, byte(n))
	case n > 0 && n <= math.MaxUint8:
		return append(b, 0xcc, byte(n))
	case n > 0 && n <= math.MaxUint16:
		return binary.BigEndian.AppendUint16(append(b, 0xcd), uint16(n))
	case n > 0 && n <= math.MaxUint32:
		return binary.BigEndian.AppendUint32(append(b, 0xce), uint32(n))
	case n > 0:
		return binary.BigEndian.AppendUint64(append(b, 0xcf), uint64(n))
	case n >= math.MinInt8:
		return append(b, 0xd0, byte(n))
	case n >= math.MinInt16:
		return binary.BigEndian.AppendUint16(append(b, 0xd1), uint16(n))
	case n >= math.MinInt32:
		return binary.BigEndian.AppendUint32(append(b, 0xd2), uint32(n))
	}
	return binary.BigEndian.AppendUint64(append(b, 0xd3), uint64(n))
}

func msgpackAppend(b []byte, v reflect.Value) []byte {
	switch v.Kind() {
	case reflect.Invalid:
		return append(b, 0xc0)
	case reflect.Interface, reflect.Pointer:
		if v.IsNil() {
			return append(b, 0xc0)
		}
		return msgpackAppend(b, v.Elem())
	case reflect.Bool:
		if v.Bool() {
			return append(b, 0xc3)
		}
		return append(b, 0xc2)
	case reflect.Int:
		return msgpackInt(b, v.Int())
	case reflect.Int64:
		return binary.BigEndian.AppendUint64(append(b, 0xd3), uint64(v.Int()))
	case reflect.Float64:
		return binary.BigEndian.AppendUint64(append(b, 0xcb), math.Float64bits(v.Float()))
	case reflect.String:
		return append(msgpackHead(b, v.Len(), 0xa0, 0xd9, 0xda, 0xdb, 32), v.String()...)
	case reflect.Slice:
		if v.IsNil() {
			return append(b, 0xc0)
		}
		b = msgpackHead(b, v.Len(), 0x90, 0, 0xdc, 0xdd, 16)
		for i := 0; i < v.Len(); i++ {
			b = msgpackAppend(b, v.Index(i))
		}
		return b
	case reflect.Map:
		if v.IsNil() {
			return append(b, 0xc0)
		}
		b = msgpackHead(b, v.Len(), 0x80, 0, 0xde, 0xdf, 16)
		for it := v.MapRange(); it.Next(); {
			b = msgpackAppend(msgpackAppend(b, it.Key()), it.Value())
		}
		return b
	case reflect.Struct:
		var body []byte
		n := 0
		for i := 0; i < v.NumField(); i++ {
			name, opt, _ := strings.Cut(v.Type().Field(i).Tag.Get("msgpack"), ",")
			if f := v.Field(i); opt != "omitempty" || !f.IsZero() {
				body, n = msgpackAppend(msgpackAppend(body, reflect.ValueOf(name)), f), n+1
			}
		}
		return append(msgpackHead(b, n, 0x80, 0, 0xde, 0xdf, 16), body...)
	}
	panic(fmt.Errorf("msgpack: Encode(unsupported %s)", v.Type()))
}
