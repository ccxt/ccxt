namespace Cryptography.ECDSA.Internal.Secp256K1
{
    /// <summary>
    /// Opaque data structured that holds a parsed ECDSA signature,
    /// supporting pubkey recovery.
    /// 
    /// The exact representation of data inside is implementation defined and not
    /// guaranteed to be portable between different platforms or versions. It is
    /// however guaranteed to be 65 bytes in size, and can be safely copied/moved.
    /// If you need to convert to a format suitable for storage or transmission, use
    /// the secp256k1_ecdsa_signature_serialize_* and
    /// secp256k1_ecdsa_signature_parse_* functions.
    /// 
    /// Furthermore, it is guaranteed that identical signatures (including their
    /// recoverability) will have identical representation, so they can be
    /// memcmp'ed.
    /// </summary>
    internal class EcdsaRecoverableSignature
    {
        public const int Size = 65;
        public byte[] Data = new byte[Size];
    }
}