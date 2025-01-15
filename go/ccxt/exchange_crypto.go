package ccxt

import (
	"crypto"
	"crypto/ecdsa"
	"crypto/elliptic"
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
	"encoding/pem"
	"hash/crc32"
	"math/big"
	"strings"

	secp256k1Hash "github.com/ethereum/go-ethereum/crypto/secp256k1"
	"golang.org/x/crypto/sha3"
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
	var input []byte

	switch v := data.(type) {
	case string:
		input = []byte(v)
	case []byte:
		input = v
	default:
		return []byte{}
	}

	hash := sha3.NewLegacyKeccak256()
	hash.Write(input)
	return hash.Sum(nil)
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
	algPrefix := "HS"
	if isRsa {
		algPrefix = "RS"
	}
	alg := algPrefix + strings.ToUpper(algorithm[3:])
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

	encodedHeader := base64.RawURLEncoding.EncodeToString([]byte(Json(header)))
	encodedData := base64.RawURLEncoding.EncodeToString([]byte(Json(data)))
	token := encodedHeader + "." + encodedData

	var signature string
	if isRsa {
		signature = Rsa(token, secret, hash)
	} else if alg[:2] == "ES" {
		// Ecdsa signing logic here (omitted for simplicity)
	} else {
		signature = base64.RawURLEncoding.EncodeToString(signHMACSHA256([]byte(token), []byte(secret.(string))))
	}
	// dirty quicky
	signature = strings.Replace(signature, "+", "-", -1)
	signature = strings.Replace(signature, "/", "_", -1)
	signature = strings.TrimRight(signature, "==")
	return token + "." + signature
}

func Rsa(data2 interface{}, privateKey2 interface{}, algorithm2 func() string) string {
	data := data2.(string)
	publicKey := privateKey2.(string)
	// hashAlgorithm := hashAlgorithm2.(string)
	hashAlgorithm := algorithm2()
	// Remove PEM headers
	// pkParts := strings.Split(publicKey, "\n")
	// pkParts = pkParts[1 : len(pkParts)-1]
	// newPk := strings.Join(pkParts, "")

	// Decode base64 public key
	// privateKey, err := base64.StdEncoding.DecodeString(newPk)
	// if err != nil {
	// 	panic(err)
	// }
	privateKey := []byte(publicKey)

	// Parse the private key
	block, _ := pem.Decode(privateKey)
	if block == nil || block.Type != "RSA PRIVATE KEY" {
		panic("RSA PRIVATE KEY")
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

// func Ecdsa(request interface{}, secret interface{}, alg interface{}, hash interface{}) string {
// 	return "" // to do
// }

func stringToPrivateKey(privKeyStr string) *ecdsa.PrivateKey {
	// Decode PEM formatted private key
	block, _ := pem.Decode([]byte(privKeyStr))
	if block == nil {
		return nil
	}

	// Parse the ECDSA private key
	privKey, err := x509.ParseECPrivateKey(block.Bytes)
	if err != nil {
		return nil
	}

	return privKey
}

var secp256k1Curve = &elliptic.CurveParams{
	Name:    "secp256k1",
	BitSize: 256,
	P:       fromHex("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F"),
	N:       fromHex("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141"),
	B:       fromHex("07"),
	Gx:      fromHex("79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798"),
	Gy:      fromHex("483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8"),
}

// Helper function to convert hex string to big.Int
func fromHex(s string) *big.Int {
	b, _ := new(big.Int).SetString(s, 16)
	return b
}

// Helper function to convert a string hex to byte array
func hexToBytes(hexStr string) ([]byte, bool) {
	bytes, err := hex.DecodeString(hexStr)
	if err != nil {
		return nil, false
	}
	return bytes, true
}

// Helper function to convert byte array to hex string
func toHex(bytes []byte) string {
	return hex.EncodeToString(bytes)
}

func enforceLowS(s *big.Int) *big.Int {
	// secp256k1 curve order
	curveOrder := fromHex("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141")

	// If s is greater than curveOrder / 2, calculate the new s as curveOrder - s
	halfOrder := new(big.Int).Div(curveOrder, big.NewInt(2))
	if s.Cmp(halfOrder) > 0 {
		s.Sub(curveOrder, s)
	}
	return s
}

// Sign the message with secp256k1 curve using Go's native ecdsa package

func signSecp256k1(message []byte, seckey []byte) ([]byte, int, bool) {
	// Sign the message with the secp256k1 private key
	// return nil, 0, false
	signature, err := secp256k1Hash.Sign(message, seckey)
	if err != nil {
		return nil, 0, false
	}

	recoveryID := int(signature[64])

	// // Split the signature into r and s components
	r := new(big.Int).SetBytes(signature[:32])
	s := new(big.Int).SetBytes(signature[32:64])

	// // Enforce low-s rule on the 's' value
	s = enforceLowS(s)

	// // Convert r and s back to byte slices
	rBytes := r.FillBytes(make([]byte, 32))
	sBytes := s.FillBytes(make([]byte, 32))

	// // Reconstruct the signature with the adjusted low-s value
	signature = append(rBytes, sBytes...)

	// The recovery ID is the last byte in the original signature

	return signature, recoveryID, true
}

// Helper function to sign with P256 (Go's native implementation)
func signP256(message []byte, seckey []byte) ([]byte, int, bool) {
	curve := elliptic.P256()
	privKey := new(ecdsa.PrivateKey)
	privKey.PublicKey.Curve = curve
	privKey.D = new(big.Int).SetBytes(seckey)

	r, s, err := ecdsa.Sign(rand.Reader, privKey, message)
	if err != nil {
		return nil, 0, false
	}

	rBytes := r.Bytes()
	sBytes := s.Bytes()
	signature := append(rBytes, sBytes...)

	return signature, 0, true // P256 does not need a recovery ID
}

// Main Ecdsa function
func Ecdsa(request interface{}, secret interface{}, curveFunc func() string, hashFunc func() string) map[string]interface{} {
	// Initialize return structure
	result := map[string]interface{}{
		"r": "",
		"s": "",
		"v": 0,
	}

	// Determine the curve
	curveName := "secp256k1"
	if curveFunc != nil {
		curveName = curveFunc()
	}
	if curveName != "secp256k1" && curveName != "p256" {
		return result
	}

	// Hash the message if needed
	var messageHash []byte
	requestStr, ok := request.(string)
	if !ok {
		return result
	}

	if hashFunc != nil {
		hashName := hashFunc()
		if hashName == "sha256" {
			h := sha256Hash.New()
			h.Write([]byte(requestStr))
			messageHash = h.Sum(nil)
		} else {
			return result
		}
	} else {
		messageHash, ok = hexToBytes(requestStr)
		if !ok {
			return result
		}
	}

	// Convert secret key to bytes
	secretStr, ok := secret.(string)
	if !ok {
		return result
	}
	secretKeyBytes, ok := hexToBytes(secretStr)
	if !ok {
		return result
	}

	// Sign the message depending on the curve
	var signature []byte
	var recoveryId int
	success := false
	if curveName == "secp256k1" {
		signature, recoveryId, success = signSecp256k1(messageHash, secretKeyBytes)
	} else {
		signature, recoveryId, success = signP256(messageHash, secretKeyBytes)
	}
	if !success {
		return result
	}

	// Extract r and s components
	rBytes := signature[:32]
	sBytes := signature[32:]

	rHex := toHex(rBytes)
	sHex := toHex(sBytes)

	// Update the result map with signature components
	result["r"] = rHex
	result["s"] = sHex
	result["v"] = recoveryId

	return result
}

func Crc32(str string, signed2 ...bool) int64 {
	signed := false
	if len(signed2) > 0 {
		signed = signed2[0]
	}

	// Compute the CRC32 checksum using IEEE polynomial
	crc := crc32.ChecksumIEEE([]byte(str))

	if signed {
		// Convert unsigned CRC32 to signed 32-bit integer
		return int64(int32(crc))
	}

	// Return unsigned 32-bit integer as int64
	return int64(crc)
}
