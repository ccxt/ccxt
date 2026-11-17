package ccxt

import (
	"crypto/rand"
	"encoding/hex"
	"strings"
	"unicode"
)

// newUuidV4 returns a random RFC 4122 version 4 UUID in 8-4-4-4-12 lowercase hex form.
func newUuidV4() string {
	var b [16]byte
	if _, err := rand.Read(b[:]); err != nil {
		panic(err)
	}
	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80
	h := hex.EncodeToString(b[:])
	return h[0:8] + "-" + h[8:12] + "-" + h[12:16] + "-" + h[16:20] + "-" + h[20:32]
}

// BaseUID generates a new UUID and returns it as a string without dashes.
func (this *BaseExchange) BaseUID() string {
	return strings.ReplaceAll(newUuidV4(), "-", "")
}

// uuid2 generates a new UUID and returns it as a string.
func (this *BaseExchange) Uuid2() string {
	return newUuidV4()
}

// uuid is a wrapper for uuid2.
func (this *BaseExchange) Uuid() string {
	return newUuidV4()
}

// uuid16 returns the first 16 characters of a UUID without dashes.
func (this *BaseExchange) Uuid16() string {
	return this.BaseUID()[:16]
}

// uuid22 returns the first 22 characters of a UUID without dashes.
func (this *BaseExchange) Uuid22() string {
	return this.BaseUID()[:22]
}

// strip trims whitespace from both ends of a string.
func (this *BaseExchange) Strip(str any) string {
	return strings.TrimSpace(derefScalar(str).(string))
}

// capitalize capitalizes the first letter of a string.
func (this *BaseExchange) Capitalize(str2 any) string {
	str := derefScalar(str2).(string)
	if len(str) == 0 {
		return str
	}
	runes := []rune(str)
	runes[0] = unicode.ToUpper(runes[0])
	return string(runes)
}
