package ccxt

import (
	"math/big"

	// secp256k1Hash "github.com/ethereum/go-ethereum/crypto/secp256k1"
	"github.com/ethereum/go-ethereum/crypto"
)

func signSecp256k1(message []byte, seckey []byte) ([]byte, int, bool) {
	// Sign the message using Ethereum's crypto.Sign function
	// https://github.com/ethereum/go-ethereum/issues/26306
	privKey, err := crypto.ToECDSA(seckey)
	if err != nil {
		return nil, 0, false
	}

	signature, err := crypto.Sign(message, privKey)
	if err != nil {
		return nil, 0, false
	}

	recoveryID := int(signature[64])

	// Enforce low-s rule
	r := new(big.Int).SetBytes(signature[:32])
	s := new(big.Int).SetBytes(signature[32:64])
	s = enforceLowS(s)

	// Convert r and s back to byte slices
	rBytes := r.FillBytes(make([]byte, 32))
	sBytes := s.FillBytes(make([]byte, 32))

	// Reconstruct the signature
	signature = append(rBytes, sBytes...)

	return signature, recoveryID, true
}

// func signSecp256k1(message []byte, seckey []byte) ([]byte, int, bool) {
// 	// Sign the message with the secp256k1 private key
// 	// return nil, 0, false
// 	signature, err := secp256k1Hash.Sign(message, seckey)
// 	if err != nil {
// 		return nil, 0, false
// 	}

// 	recoveryID := int(signature[64])

// 	// // Split the signature into r and s components
// 	r := new(big.Int).SetBytes(signature[:32])
// 	s := new(big.Int).SetBytes(signature[32:64])

// 	// // Enforce low-s rule on the 's' value
// 	s = enforceLowS(s)

// 	// // Convert r and s back to byte slices
// 	rBytes := r.FillBytes(make([]byte, 32))
// 	sBytes := s.FillBytes(make([]byte, 32))

// 	// // Reconstruct the signature with the adjusted low-s value
// 	signature = append(rBytes, sBytes...)

// 	// The recovery ID is the last byte in the original signature

// 	return signature, recoveryID, true
// }
