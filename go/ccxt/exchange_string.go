package ccxt

import (
	"strings"
	"unicode"
)

// BaseUID generates a new UUID and returns it as a string without dashes.
func BaseUID() string {
	return strings.ReplaceAll(uuid.New().String(), "-", "")
}

// uuid2 generates a new UUID and returns it as a string.
func uuid2() string {
	return uuid.New().String()
}

// uuid is a wrapper for uuid2.
func uuid() string {
	return uuid2()
}

// uuid16 returns the first 16 characters of a UUID without dashes.
func uuid16() string {
	return BaseUID()[:16]
}

// uuid22 returns the first 22 characters of a UUID without dashes.
func uuid22() string {
	return BaseUID()[:22]
}

// strip trims whitespace from both ends of a string.
func strip(str interface{}) interface{} {
	return strings.TrimSpace(str.(string))
}

// capitalize capitalizes the first letter of a string.
func capitalize(str2 interface{}) string {
	str := str2.(string)
	if len(str) == 0 {
		return str
	}
	runes := []rune(str)
	runes[0] = unicode.ToUpper(runes[0])
	return string(runes)
}
