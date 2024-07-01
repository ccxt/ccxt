# Encoder README

This README is intended for developers looking to implement new encoders for
elliptic curve keys and signatures. The below are guidelines intended to make
new encoders work correctly with the high level functions used to interact
with keys and signatures.

## Keys

Key encoders should inherit from the `fastecdsa.encoding.KeyEncoder` class. They
should implement all of `KeyEncoder`'s abstract methods as static methods. If an
encoder only operates on public or private keys then the non-applicable methods
should raise `NotImplementedError`s.

## Signatures

Signature encoders should inherit from the `fastecdsa.encoding.SigEncoder` class.
They should implement all of `SigEncoder`'s abstract methods as static methods.
