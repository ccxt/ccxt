package util

import (
	"bytes"
	"net/url"
	"sort"
)

func URLEncode(items map[string]string) string {
	values := make(url.Values)
	for k, v := range items {
		values.Add(k, v)
	}
	return values.Encode()
}

func RawEncode(items map[string]string) string {
	v := make(url.Values)
	for k, item := range items {
		v.Add(k, item)
	}
	var buf bytes.Buffer
	keys := make([]string, 0, len(v))
	for k := range v {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	for _, k := range keys {
		vs := v[k]
		prefix := k + "="
		for _, v := range vs {
			if buf.Len() > 0 {
				buf.WriteByte('&')
			}
			buf.WriteString(prefix)
			buf.WriteString(string(v))
		}
	}
	return buf.String()
}
