using System;
using System.IO;

namespace Org.BouncyCastle.Tls
{
    /// <summary>Base interface to provide TLS authentication credentials.</summary>
    public interface TlsAuthentication
    {
        /// <summary>Called by the protocol handler to report the server certificate.</summary>
        /// <remarks>
        /// Note: this method is responsible for certificate verification and validation.
        /// </remarks>
        /// <param name="serverCertificate">the server certificate received.</param>
        /// <exception cref="IOException"/>
        void NotifyServerCertificate(TlsServerCertificate serverCertificate);

        /// <summary>Return client credentials in response to server's certificate request.</summary>
        /// <remarks>
        /// The returned value may be null, or else it MUST implement <em>exactly one</em> of
        /// <see cref="TlsCredentialedAgreement"/>, <see cref="TlsCredentialedDecryptor"/>, or
        /// <see cref="TlsCredentialedSigner"/>, depending on the key exchange that was negotiated and the details of
        /// the <see cref="CertificateRequest"/>.
        /// </remarks>
        /// <param name="certificateRequest">details of the certificate request.</param>
        /// <returns>a <see cref="TlsCredentials"/> object or null for no client authentication.</returns>
        /// <exception cref="IOException"/>
        TlsCredentials GetClientCredentials(CertificateRequest certificateRequest);
    }
}
