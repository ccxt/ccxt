#pragma once

// Starknet crypto for the paradex signing path, the C++ side of what TS gets from
// @scure/starknet + static_dependencies/starknet (and C# gets from its vendored
// StarknetOps): the Stark curve, the Pedersen hash, key grinding, the legacy (rev 0)
// SNIP-12 typed-data hash and deterministic RFC-6979 signing over the Stark curve.
//
// Everything is verified against the vendored TS implementation's outputs -- see
// the vectors in the commit that introduced this file.

#include "Value.h"

#include <string>
#include <utility>

namespace ccxt {
namespace starkcrypto {

// eth signature (0x + 130 hex) -> stark private key (unpadded lowercase hex, no 0x)
std::string ethSigToPrivate (const std::string& ethSignatureHex);

// stark private key hex -> public key x-coordinate ('0x' + unpadded lowercase hex)
std::string getStarkKey (const std::string& privateKeyHex);

// keccak-based cairo selector: '0x' + unpadded hex of keccak256(name) & (2^250 - 1)
std::string getSelectorFromName (const std::string& name);

// pedersen(a, b) over decimal/hex felt strings -> '0x' + unpadded hex (test hook)
std::string pedersenHash (const std::string& a, const std::string& b);

// grindKey over a hex seed (test hook; ethSigToPrivate = grindKey of sig[0..64))
std::string grindKey (const std::string& seedHex);

// the argent account address paradex derives: calldata = [classHash,
// selector('initialize'), 2, publicKey, 0], address = pedersen-chain per
// calculateContractAddressFromHash(salt=publicKey, classHash=proxyClassHash,
// calldata, deployer=0) mod (2^251 - 256). Returns '0x' + unpadded hex.
std::string computeAccountAddress (const std::string& accountClassHash,
                                   const std::string& accountProxyClassHash,
                                   const std::string& publicKeyHex);

// legacy-revision SNIP-12 message hash: pedersen chain over
// ['StarkNet Message', structHash(StarkNetDomain, domain), account,
//  structHash(primaryType, message)]. messageTypes carries ONLY the primary type
// (field lists of {name, type} dicts); StarkNetDomain is injected internally.
// Returns '0x' + unpadded hex.
std::string messageHashLegacy (const ccxt::dict& messageTypes,
                               const ccxt::dict& domain,
                               const ccxt::dict& message,
                               const std::string& account);

// deterministic RFC-6979(SHA-256) signature over the Stark curve with the
// StarkWare bits2int truncation quirks; returns (r, s) as DECIMAL strings
std::pair<std::string, std::string> sign (const std::string& msgHashHex,
                                          const std::string& privateKeyHex);

} // namespace starkcrypto
} // namespace ccxt
