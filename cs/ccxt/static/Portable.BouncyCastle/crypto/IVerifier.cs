namespace Org.BouncyCastle.Crypto
{
    /// <summary>
    /// Operators that reduce their input to the validation of a signature produce this type.
    /// </summary>
    public interface IVerifier
    {
        /// <summary>
        /// Return true if the passed in data matches what is expected by the verification result.
        /// </summary>
        /// <param name="data">The bytes representing the signature.</param>
        /// <returns>true if the signature verifies, false otherwise.</returns>
        bool IsVerified(byte[] data);

        /// <summary>
        /// Return true if the length bytes from off in the source array match the signature
        /// expected by the verification result.
        /// </summary>
        /// <param name="source">Byte array containing the signature.</param>
        /// <param name="off">The offset into the source array where the signature starts.</param>
        /// <param name="length">The number of bytes in source making up the signature.</param>
        /// <returns>true if the signature verifies, false otherwise.</returns>
        bool IsVerified(byte[] source, int off, int length);
    }
}
