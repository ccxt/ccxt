namespace Cryptography.ECDSA.Internal.Secp256K1
{
    /// <summary>
    /// Opaque data structure that holds a parsed and valid public key. The exact representation of data inside is implementation defined and not guaranteed to be portable between different platforms or versions. It is however guaranteed to be 64 bytes in size, and can be safely copied/moved. If you need to convert to a format suitable for storage, transmission, or comparison, use EcPubkeySerialize and secp256k1_ec_pubkey_parse.
    /// </summary>
    internal class PubKey
    {
        public const int Size = 64;
        public byte[] Data = new byte[Size];
    }
}