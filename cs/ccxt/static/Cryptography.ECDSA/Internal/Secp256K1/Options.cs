using System;

namespace Cryptography.ECDSA.Internal.Secp256K1
{
    [Flags]
    internal enum Options : uint
    {
        // All flags' lower 8 bits indicate what they're for. Do not use directly.
        FlagsTypeMask = ((1 << 8) - 1),
        FlagsTypeContext = (1 << 0),
        FlagsTypeCompression = (1 << 1),
        // The higher bits contain the actual data. Do not use directly. 
        FlagsBitContextVerify = (1 << 8),
        FlagsBitContextSign = (1 << 9),
        FlagsBitCompression = (1 << 8),

        /** Flags to pass to secp256k1_context_create. */
        ContextVerify = (FlagsTypeContext | FlagsBitContextVerify),
        ContextSign = (FlagsTypeContext | FlagsBitContextSign),
        ContextNone = (FlagsTypeContext),

        /** Flag to pass to EcPubkeySerialize and secp256k1_ec_privkey_export. */
        EcCompressed = (FlagsTypeCompression | FlagsBitCompression),
        EcUncompressed = (FlagsTypeCompression)
    }
}