package util

import (
	"testing"
)

func TestEncode(t *testing.T) {
	t.Log("raw encode:", RawEncode(map[string]string{"foo": "ébar"}))
	t.Log("url encode:", URLEncode(map[string]string{"foo": "ébar"}))
}
