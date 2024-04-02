using System;
using System.IO;

using Org.BouncyCastle.Tls.Crypto;

namespace Org.BouncyCastle.Tls
{
    /// <summary>Support interface for generating a secret based on the credentials sent by a TLS peer.</summary>
    public interface TlsCredentialedAgreement
        : TlsCredentials
    {
        /// <summary>Calculate an agreed secret based on our credentials and the public key credentials of our peer.
        /// </summary>
        /// <param name="peerCertificate">public key certificate of our TLS peer.</param>
        /// <returns>the agreed secret.</returns>
        /// <exception cref="IOException">in case of an exception on generation of the secret.</exception>
        TlsSecret GenerateAgreement(TlsCertificate peerCertificate);
    }
}
