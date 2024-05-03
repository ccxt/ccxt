from typing import (
    NewType,
)

BLSPubkey = NewType("BLSPubkey", bytes)  # bytes48
BLSPrivateKey = NewType("BLSPrivateKey", int)
BLSSignature = NewType("BLSSignature", bytes)  # bytes96
