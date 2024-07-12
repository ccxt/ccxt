package ccxt

import (
	"crypto/hmac"
	"crypto/md5"
	"crypto/sha1"
	"crypto/sha256"
	"crypto/sha512"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"strings"

	"github.com/ethereum/go-ethereum/crypto/sha3"
)

func sha1Hash() string      { return "sha1" }
func sha256Hash() string    { return "sha256" }
func sha384Hash() string    { return "sha384" }
func sha512Hash() string    { return "sha512" }
func md5Hash() string       { return "md5" }
func ed25519Hash() string   { return "ed25519" }
func keccakHash() string    { return "keccak" }
func secp256k1Hash() string { return "secp256k1" }
func p256Hash() string      { return "p256" }

func Hmac(request2 interface{}, secret2 interface{}, algorithm2 func() string, digest string) string {
	var request []byte
	switch v := request2.(type) {
	case string:
		request = []byte(v)
	case []byte:
		request = v
	}

	var secretBytes []byte
	switch v := secret2.(type) {
	case string:
		secretBytes = []byte(v)
	case []byte:
		secretBytes = v
	}

	algorithm := "md5"
	if algorithm2 != nil {
		algorithm = algorithm2()
	}

	var signature []byte
	switch algorithm {
	case "sha256":
		signature = signHMACSHA256(request, secretBytes)
	case "sha512":
		signature = signHMACSHA512(request, secretBytes)
	case "sha384":
		signature = signHMACSHA384(request, secretBytes)
	case "md5":
		signature = signHMACMD5(request, secretBytes)
	}

	if digest == "hex" {
		return hex.EncodeToString(signature)
	}
	return base64.StdEncoding.EncodeToString(signature)
}

func signHMACSHA256(data, secret []byte) []byte {
	h := hmac.New(sha256.New, secret)
	h.Write(data)
	return h.Sum(nil)
}

func signHMACSHA512(data, secret []byte) []byte {
	h := hmac.New(sha512.New, secret)
	h.Write(data)
	return h.Sum(nil)
}

func signHMACSHA384(data, secret []byte) []byte {
	h := hmac.New(sha512.New, secret)
	h.Write(data)
	return h.Sum(nil)
}

func signHMACMD5(data, secret []byte) []byte {
	h := hmac.New(md5.New, secret)
	h.Write(data)
	return h.Sum(nil)
}

func (this *Exchange) hash(request2 interface{}, hash func() string, digest2 interface{}) interface{} {
	return Hash(request2, hash, digest2)
}

func Hash(request2 interface{}, hash func() string, digest2 interface{}) interface{} {
	var request string
	switch v := request2.(type) {
	case string:
		request = v
	}

	algorithm := hash()
	digest := "hex"
	if digest2 != nil {
		digest = digest2.(string)
	}

	var signature []byte
	switch algorithm {
	case "sha256":
		signature = signSHA256(request)
	case "sha512":
		signature = signSHA512(request)
	case "sha384":
		signature = signSHA384(request)
	case "sha1":
		signature = signSHA1(request)
	case "md5":
		signature = signMD5(request)
	case "keccak":
		signature = signKeccak(request2)
	case "sha3":
		signature = signKeccak(request)
	}

	if digest == "binary" {
		return signature
	}
	if digest == "hex" {
		return hex.EncodeToString(signature)
	}
	return base64.StdEncoding.EncodeToString(signature)
}

func signSHA256(data string) []byte {
	h := sha256.New()
	h.Write([]byte(data))
	return h.Sum(nil)
}

func signSHA512(data string) []byte {
	h := sha512.New()
	h.Write([]byte(data))
	return h.Sum(nil)
}

func signSHA384(data string) []byte {
	h := sha512.New384()
	h.Write([]byte(data))
	return h.Sum(nil)
}

func signSHA1(data string) []byte {
	h := sha1.New()
	h.Write([]byte(data))
	return h.Sum(nil)
}

func signMD5(data string) []byte {
	h := md5.New()
	h.Write([]byte(data))
	return h.Sum(nil)
}

func signKeccak(data interface{}) []byte {
	var msg []byte
	switch v := data.(type) {
	case string:
		msg = []byte(v)
	case []byte:
		msg = v
	}
	h := sha3.NewLegacyKeccak256()
	h.Write(msg)
	return h.Sum(nil)
}

func Jwt(data interface{}, secret interface{}, hash func() string, isRsa bool, options map[string]interface{}) string {
	if options == nil {
		options = make(map[string]interface{})
	}
	algorithm := hash()
	alg := "HS" + strings.ToUpper(algorithm[3:])
	if algOpt, ok := options["alg"]; ok {
		alg = algOpt.(string)
	}
	header := map[string]interface{}{
		"alg": alg,
		"typ": "JWT",
	}
	for k, v := range options {
		header[k] = v
	}

	if iat, ok := header["iat"]; ok {
		if dataMap, ok := data.(map[string]interface{}); ok {
			dataMap["iat"] = iat
		}
		delete(header, "iat")
	}

	headerJson, _ := json.Marshal(header)
	encodedHeader := base64.RawURLEncoding.EncodeToString(headerJson)
	dataJson, _ := json.Marshal(data)
	encodedData := base64.RawURLEncoding.EncodeToString(dataJson)
	token := encodedHeader + "." + encodedData

	var signature string
	if isRsa {
		// Rsa signing logic here (omitted for simplicity)
	} else if alg[:2] == "ES" {
		// Ecdsa signing logic here (omitted for simplicity)
	} else {
		signature = base64.RawURLEncoding.EncodeToString(signHMACSHA256([]byte(token), []byte(secret.(string))))
	}
	return token + "." + signature
}
