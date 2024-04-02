namespace Org.BouncyCastle.Bcpg
{
    /**
    * Basic tags for symmetric key algorithms
    */
    public enum SymmetricKeyAlgorithmTag
    {
        Null = 0,         // Plaintext or unencrypted data
        Idea = 1,         // IDEA [IDEA]
        TripleDes = 2,    // Triple-DES (DES-EDE, as per spec -168 bit key derived from 192)
        Cast5 = 3,        // Cast5 (128 bit key, as per RFC 2144)
        Blowfish = 4,     // Blowfish (128 bit key, 16 rounds) [Blowfish]
        Safer = 5,        // Safer-SK128 (13 rounds) [Safer]
        Des = 6,          // Reserved for DES/SK
        Aes128 = 7,       // Reserved for AES with 128-bit key
        Aes192 = 8,       // Reserved for AES with 192-bit key
        Aes256 = 9,       // Reserved for AES with 256-bit key
        Twofish = 10,     // Reserved for Twofish
        Camellia128 = 11, // Reserved for AES with 128-bit key
        Camellia192 = 12, // Reserved for AES with 192-bit key
        Camellia256 = 13  // Reserved for AES with 256-bit key
    }
}
