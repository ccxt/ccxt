package util

import (
	"strings"
	"testing"
)

func TestHMAC(t *testing.T) {
	results := map[string]string{
		"sha256/hex":  "147933218aaabc0b8b10a2b3a5c34684c8d94341bcf10a4736dc7270f7741851",
		"sha1/base64": "hdFVxV7ShqMAvRzxJN4I2H6RTzo=",
	}
	for method, expected := range results {
		s := strings.Split(method, "/")
		result, err := HMAC("foo", "bar", s[0], s[1])
		if err != nil {
			t.Error(err)
		} else if result != expected {
			t.Errorf("%s:\n     got: %s\nexpected: %s", method, result, expected)
		}
	}
}

func TestJWT(t *testing.T) {
	expected := "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmb28iOiJiYXIifQ.sLoOvOXnOK490o8iHakkNCMmsMMUwrZK9prFvjqOtYI"
	result, err := JWT(map[string]interface{}{
		"foo": "bar",
	}, "baz")
	if err != nil {
		t.Error(err)
	} else if result != expected {
		t.Errorf("\nexpected: %s\n     got: %s", expected, result)
	}
}

func TestHash(t *testing.T) {
	expected := "iEPX+SQWIR3p67lj/0zigSWTKHg="
	result, _ := Hash("foobar", "sha1", "base64")
	if expected != result {
		t.Error("nope" + " " + result)
	}
}
