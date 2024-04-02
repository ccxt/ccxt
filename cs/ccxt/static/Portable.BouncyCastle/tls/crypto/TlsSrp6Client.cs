using System;
using System.IO;

using Org.BouncyCastle.Math;

namespace Org.BouncyCastle.Tls.Crypto
{
    /// <summary>Basic interface for an SRP-6 client implementation.</summary>
    public interface TlsSrp6Client
    {
        /// <summary>Generates the secret S given the server's credentials</summary>
        /// <param name="serverB">The server's credentials</param>
        /// <returns>Client's verification message for the server</returns>
        /// <exception cref="IOException">If server's credentials are invalid</exception>
        BigInteger CalculateSecret(BigInteger serverB);

        /// <summary>Generates client's credentials given the client's salt, identity and password</summary>
        /// <param name="salt">The salt used in the client's verifier.</param>
        /// <param name="identity">The user's identity (eg. username)</param>
        /// <param name="password">The user's password</param>
        /// <returns>Client's public value to send to server</returns>
        BigInteger GenerateClientCredentials(byte[] salt, byte[] identity, byte[] password);
    }
}
