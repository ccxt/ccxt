using System;
using System.IO;

namespace Org.BouncyCastle.Tls.Crypto
{
    /// <summary>Base interface for a TLS signer that works on raw message digests.</summary>
    public interface TlsSigner
    {
        /// <summary>Generate an encoded signature based on the passed in hash.</summary>
        /// <param name="algorithm">the signature algorithm to use.</param>
        /// <param name="hash">the hash calculated for the signature.</param>
        /// <returns>an encoded signature.</returns>
        /// <exception cref="IOException">in case of an exception processing the hash.</exception>
        byte[] GenerateRawSignature(SignatureAndHashAlgorithm algorithm, byte[] hash);

        /// <exception cref="IOException"/>
        TlsStreamSigner GetStreamSigner(SignatureAndHashAlgorithm algorithm);
    }
}
