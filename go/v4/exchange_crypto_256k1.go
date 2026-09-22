package ccxt

import (
	dcrsecp256k1 "github.com/decred/dcrd/dcrec/secp256k1/v4"
	secp256k1ecdsa "github.com/decred/dcrd/dcrec/secp256k1/v4/ecdsa"
)

// signSecp256k1 produces a 64-byte [r || s] signature and the recovery id for a
// 32-byte digest, using deterministic RFC6979 nonces and canonical low-s.
//
// This is byte-for-byte what go-ethereum's crypto.Sign returned (both its cgo
// libsecp256k1 path and its pure-Go signature_nocgo.go path, which is this very
// SignCompact call), but without pulling go-ethereum/crypto into CCXT's own code.
func signSecp256k1(message []byte, seckey []byte) ([]byte, int, bool) {
	if len(message) != 32 || len(seckey) != 32 {
		return nil, 0, false
	}
	var privKey dcrsecp256k1.PrivateKey
	if overflow := privKey.Key.SetByteSlice(seckey); overflow || privKey.Key.IsZero() {
		return nil, 0, false
	}
	defer privKey.Zero()

	// compact form is [v+27 || r || s]; s is already normalised to the low half
	// of the curve order and v adjusted accordingly.
	compact := secp256k1ecdsa.SignCompact(&privKey, message, false)
	recoveryID := int(compact[0] - 27)
	signature := make([]byte, 64)
	copy(signature, compact[1:])
	return signature, recoveryID, true
}

// secp256k1PublicKeyUncompressed returns the 65-byte 0x04-prefixed public key
// for a 32-byte secret, or false if the secret is not a valid scalar.
func secp256k1PublicKeyUncompressed(seckey []byte) ([]byte, bool) {
	if len(seckey) != 32 {
		return nil, false
	}
	var privKey dcrsecp256k1.PrivateKey
	if overflow := privKey.Key.SetByteSlice(seckey); overflow || privKey.Key.IsZero() {
		return nil, false
	}
	defer privKey.Zero()
	return privKey.PubKey().SerializeUncompressed(), true
}
