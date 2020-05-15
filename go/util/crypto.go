package util

import (
	"crypto/hmac"
	"crypto/md5"
	"crypto/sha1"
	"crypto/sha256"
	"crypto/sha512"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"github.com/dgrijalva/jwt-go"
	"hash"
)

var hashers = map[string]func() hash.Hash{
	"sha1":   sha1.New,
	"sha256": sha256.New,
	"sha512": sha512.New,
	"sha384": sha512.New384,
	"md5":    md5.New,
}

func Hash(payload, algo, encoding string) (string, error) {
	if hashers[algo] == nil {
		return "", fmt.Errorf("hash: unsupported algo \"%s\"", algo)
	}
	h := hashers[algo]()
	_, err := h.Write([]byte(payload))
	if err != nil {
		return "", fmt.Errorf("hash: %s", err)
	}
	return string(encode(h.Sum(nil), encoding)), nil
}

func HMAC(payload, key, algo, encoding string) (string, error) {
	if hashers[algo] == nil {
		return "", fmt.Errorf("HMAC: unsupported hashing algo \"%s\"", algo)
	}
	h := hmac.New(hashers[algo], []byte(key))
	_, err := h.Write([]byte(payload))
	if err != nil {
		return "", fmt.Errorf("hmac: %s", err)
	}
	return string(encode(h.Sum(nil), encoding)), nil
}

func JWT(claims map[string]interface{}, secret string) (string, error) {
	var signer jwt.SigningMethod = jwt.SigningMethodHS256
	token := jwt.New(signer)
	token.Claims = jwt.MapClaims(claims)
	return token.SignedString([]byte(secret))
}

func encode(payload []byte, encoding string) []byte {
	var result []byte
	switch encoding {
	case "hex":
		result = []byte(hex.EncodeToString(payload))
	case "base64":
		buf := make([]byte, base64.StdEncoding.EncodedLen(len(payload)))
		base64.StdEncoding.Encode(buf, payload)
		result = buf
	default:
		result = payload
	}
	return result
}
