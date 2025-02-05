//go:build windows
// +build windows

package ccxt

func signSecp256k1(message []byte, seckey []byte) ([]byte, int, bool) {
	byteArray := make([]byte, 0)
	return byteArray, 0, false
}
