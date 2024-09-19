package ccxt

import (
	"crypto"
	"crypto/hmac"
	md5Hash "crypto/md5"
	"crypto/rand"
	rsaHash "crypto/rsa"
	sha1Hash "crypto/sha1"
	sha256Hash "crypto/sha256"
	sha512Hash "crypto/sha512"
	"crypto/x509"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"encoding/pem"
	"strings"
	// "golang.org/x/crypto/sha3"
)

func Sha1() string      { return "sha1" }
func Sha256() string    { return "sha256" }
func sha256() string    { return "sha256" }
func Sha384() string    { return "sha384" }
func sha384() string    { return "sha384" }
func Sha512() string    { return "sha512" }
func sha512() string    { return "sha512" }
func Md5() string       { return "md5" }
func md5() string       { return "md5" }
func Ed25519() string   { return "ed25519" }
func ed25519() string   { return "ed25519" }
func Keccak() string    { return "keccak" }
func Secp256k1() string { return "secp256k1" }
func P256() string      { return "p256" }
func keccak() string    { return "keccak" }
func secp256k1() string { return "secp256k1" }

func (this *Exchange) Hmac(request2 interface{}, secret2 interface{}, algorithm2 func() string, args ...interface{}) string {
	digest := GetArg(args, 0, "hex").(string)
	return Hmac(request2, secret2, algorithm2, digest)
}

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
	h := hmac.New(sha256Hash.New, secret)
	h.Write([]byte(data))
	return h.Sum(nil)
}

func signHMACSHA512(data, secret []byte) []byte {
	h := hmac.New(sha512Hash.New, secret)
	h.Write([]byte(data))
	return h.Sum(nil)
}

func signHMACSHA384(data, secret []byte) []byte {
	h := hmac.New(sha512Hash.New, secret)
	h.Write([]byte(data))
	return h.Sum(nil)
}

func signHMACMD5(data, secret []byte) []byte {
	h := hmac.New(md5Hash.New, secret)
	h.Write(data)
	return h.Sum(nil)
}

func (this *Exchange) Hash(request2 interface{}, hash func() string, args ...interface{}) interface{} {
	digest2 := GetArg(args, 0, "hex")
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

func (this *Exchange) Axolotl(a interface{}, b interface{}, c interface{}) string {
	return ""
}

func signSHA256(data string) []byte {
	h := sha256Hash.New()
	h.Write([]byte(data))
	return h.Sum(nil)
}

func signSHA512(data string) []byte {
	h := sha512Hash.New()
	h.Write([]byte(data))
	return h.Sum(nil)
}

func signSHA384(data string) []byte {
	h := sha512Hash.New384()
	h.Write([]byte(data))
	return h.Sum(nil)
}

func signSHA1(data string) []byte {
	h := sha1Hash.New()
	h.Write([]byte(data))
	return h.Sum(nil)
}

func signMD5(data string) []byte {
	h := md5Hash.New()
	h.Write([]byte(data))
	return h.Sum(nil)
}

func signKeccak(data interface{}) []byte {
	var msg []byte
	// switch v := data.(type) {
	// case string:
	// 	msg = []byte(v)
	// case []byte:
	// 	msg = v
	// }
	// h := sha3.New256()
	// h.Write(msg)
	// to do implement keccak
	return msg
}

func Jwt(data interface{}, secret interface{}, hash func() string, optionalArgs ...interface{}) string {
	isRsa := GetArg(optionalArgs, 0, false).(bool)
	params := GetArg(optionalArgs, 2, map[string]interface{}{}).(map[string]interface{})
	return JwtFull(data, secret, hash, isRsa, params)
}

func JwtFull(data interface{}, secret interface{}, hash func() string, isRsa bool, options map[string]interface{}) string {
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

func Rsa(data2 interface{}, publicKey2 interface{}, hashAlgorithm2 interface{}) string {
	data := data2.(string)
	publicKey := publicKey2.(string)
	hashAlgorithm := hashAlgorithm2.(string)
	// Remove PEM headers
	pkParts := strings.Split(publicKey, "\n")
	pkParts = pkParts[1 : len(pkParts)-1]
	newPk := strings.Join(pkParts, "")

	// Decode base64 public key
	privateKey, err := base64.StdEncoding.DecodeString(newPk)
	if err != nil {
		panic(err)
	}

	// Parse the private key
	block, _ := pem.Decode(privateKey)
	if block == nil || block.Type != "RSA PRIVATE KEY" {
		panic(err)
	}

	parsedKey, err := x509.ParsePKCS1PrivateKey(block.Bytes)
	if err != nil {
		panic(err)
	}

	// Hash the data
	var hashedData []byte
	var hash crypto.Hash

	switch hashAlgorithm {
	case "sha1":
		hash = crypto.SHA1
		h := sha1Hash.New()
		h.Write([]byte(data))
		hashedData = h.Sum(nil)
	case "sha256":
		hash = crypto.SHA256
		h := sha256Hash.New()
		h.Write([]byte(data))
		hashedData = h.Sum(nil)
	case "sha384":
		hash = crypto.SHA384
		h := sha512Hash.New384()
		h.Write([]byte(data))
		hashedData = h.Sum(nil)
	case "sha512":
		hash = crypto.SHA512
		h := sha512Hash.New()
		h.Write([]byte(data))
		hashedData = h.Sum(nil)
	case "md5":
		hash = crypto.MD5
		h := md5Hash.New()
		h.Write([]byte(data))
		hashedData = h.Sum(nil)
	default:
		return ""
	}

	// Sign the data
	signData, err := rsaHash.SignPKCS1v15(rand.Reader, parsedKey, hash, hashedData)
	if err != nil {
		return ""
	}

	// Return base64 encoded signature
	return base64.StdEncoding.EncodeToString(signData)
}

func Eddsa(data2 interface{}, publicKey2 interface{}, hashAlgorithm2 interface{}) string {
	return "" // to do
}

func Ecdsa(request interface{}, secret interface{}, alg interface{}, hash interface{}) string {
	return "" // to do
}

func Crc32(request2 interface{}, encode bool) interface{} {
	return "" // to do
}
