namespace Cryptography.ECDSA.Internal.Secp256K1
{
    /// <summary>
    /// A pointer to a function to deterministically generate a nonce.
    /// Except for test cases, this function should compute some cryptographic hash of the message, the algorithm, the key and the attempt.
    /// </summary>
    /// <param name="nonce32">(Out) pointer to a 32-byte array to be filled by the function.</param>
    /// <param name="msg32">(In) the 32-byte message hash being verified (will not be NULL)</param>
    /// <param name="key32">(In) pointer to a 32-byte secret key (will not be NULL)</param>
    /// <param name="algo16">(In) pointer to a 16-byte array describing the signature algorithm(will be NULL for ECDSA for compatibility).</param>
    /// <param name="data">(In) Arbitrary data pointer that is passed through.</param>
    /// <param name="attempt">(In) how many iterations we have tried to find a nonce. This will almost always be 0, but different attempt values are required to result in a different nonce.</param>
    /// <returns></returns>
    internal delegate bool NonceFunction(byte[] nonce32, byte[] msg32, byte[] key32, byte[] algo16, byte[] data, uint attempt);
}