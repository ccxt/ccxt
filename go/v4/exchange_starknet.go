package ccxt

// Hand-written Starknet primitives. These replace the NethermindEth/starknet.go
// re-export shim (curve.Sign / curve.PoseidonArray / utils.GetSelectorFromName)
// with direct calls to the modules that shim itself delegates to, both of which
// are already in the dependency graph via juno:
//   - github.com/consensys/gnark-crypto/ecc/stark-curve/ecdsa  (signing)
//   - github.com/NethermindEth/juno/core/crypto               (poseidon)
//   - golang.org/x/crypto/sha3                                (keccak selector)

import (
	"errors"
	"math/big"

	junocrypto "github.com/NethermindEth/juno/core/crypto"
	starkfelt "github.com/NethermindEth/juno/core/felt"
	starkcurve "github.com/consensys/gnark-crypto/ecc/stark-curve"
	starkecdsa "github.com/consensys/gnark-crypto/ecc/stark-curve/ecdsa"
	"golang.org/x/crypto/sha3"
)

// starknetSign signs msgHash with privKey on the STARK curve and returns (r, s).
// Mirrors starknet.go curve.Sign: derive the public point, marshal
// [compressed pub || 32-byte scalar] into a gnark PrivateKey, then SignForRecover.
func starknetSign(msgHash, privKey *big.Int) (r, s *big.Int, err error) {
	if privKey == nil || msgHash == nil {
		return nil, nil, errors.New("starknetSign: nil input")
	}
	if privKey.Sign() <= 0 || privKey.BitLen() > 256 {
		return nil, nil, errors.New("starknetSign: private key out of range")
	}
	var pub starkcurve.G1Affine
	pub.ScalarMultiplicationBase(privKey)
	pubBytes := pub.Bytes()

	var scalar [32]byte
	privKey.FillBytes(scalar[:])

	var key starkecdsa.PrivateKey
	if _, err = key.SetBytes(append(pubBytes[:], scalar[:]...)); err != nil {
		return nil, nil, err
	}
	_, r, s, err = key.SignForRecover(msgHash.Bytes(), nil)
	return r, s, err
}

// starknetPoseidonArray is the poseidon hash of a felt array (poseidon_hash_many).
func starknetPoseidonArray(felts ...*starkfelt.Felt) *starkfelt.Felt {
	return junocrypto.PoseidonArray(felts...)
}

// starknetGetSelectorFromName computes the Starknet function selector:
// keccak256(name) masked to its low 250 bits (sn_keccak).
func starknetGetSelectorFromName(name string) *big.Int {
	h := sha3.NewLegacyKeccak256()
	h.Write([]byte(name))
	digest := h.Sum(nil)
	digest[0] &= 0x03 // keep 250 bits: clear the top 6 bits of the 256-bit hash
	return new(big.Int).SetBytes(digest)
}
