package ccxt

import (
	"strings"
	"unicode"

	u "github.com/google/uuid"
)

// BaseUID generates a new UUID and returns it as a string without dashes.
func (this *Exchange) BaseUID() string {
	return strings.ReplaceAll(u.New().String(), "-", "")
}

// uuid2 generates a new UUID and returns it as a string.
func (this *Exchange) Uuid2() string {
	return u.New().String()
}

// func (this *Exchange) uuid22() string {
// 	return ""
// }

// uuid is a wrapper for uuid2.
func (this *Exchange) Uuid() string {
	return this.Uuid2()
}

func (this *Exchange) Uuidv1() string {
	return u.New().String()
}

// uuid16 returns the first 16 characters of a UUID without dashes.
func (this *Exchange) Uuid16() string {
	return this.BaseUID()[:16]
}

// uuid22 returns the first 22 characters of a UUID without dashes.
func (this *Exchange) Uuid22() string {
	return this.BaseUID()[:22]
}

// strip trims whitespace from both ends of a string.
func (this *Exchange) Strip(str interface{}) interface{} {
	return strings.TrimSpace(str.(string))
}

// capitalize capitalizes the first letter of a string.
func (this *Exchange) Capitalize(str2 interface{}) string {
	str := str2.(string)
	if len(str) == 0 {
		return str
	}
	runes := []rune(str)
	runes[0] = unicode.ToUpper(runes[0])
	return string(runes)
}
