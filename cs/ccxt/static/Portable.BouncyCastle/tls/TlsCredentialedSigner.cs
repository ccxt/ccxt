using System;
using System.IO;

using Org.BouncyCastle.Tls.Crypto;

namespace Org.BouncyCastle.Tls
{
    /// <summary>Support interface for generating a signature based on our private credentials.</summary>
    public interface TlsCredentialedSigner
        : TlsCredentials
    {
        /// <summary>Generate a signature against the passed in hash.</summary>
        /// <param name="hash">a message digest calculated across the message the signature is to apply to.</param>
        /// <returns>an encoded signature.</returns>
        /// <exception cref="IOException">if the hash cannot be processed, or there is an issue with the private
        /// credentials.</exception>
        byte[] GenerateRawSignature(byte[] hash);

        /// <summary>Return the algorithm IDs for the signature algorithm and the associated hash it uses.</summary>
        /// <returns>the full algorithm details for the signature.</returns>
        SignatureAndHashAlgorithm SignatureAndHashAlgorithm { get; }

        /// <exception cref="IOException"/>
        TlsStreamSigner GetStreamSigner();
    }
}
