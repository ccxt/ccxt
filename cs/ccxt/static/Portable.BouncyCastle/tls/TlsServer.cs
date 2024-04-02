using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Tls.Crypto;

namespace Org.BouncyCastle.Tls
{
    /// <summary>Interface describing a TLS server endpoint.</summary>
    public interface TlsServer
        : TlsPeer
    {
        void Init(TlsServerContext context);

        /// <summary>Return the specified session, if available.</summary>
        /// <remarks>
        /// Note that the peer's certificate chain for the session (if any) may need to be periodically revalidated.
        /// </remarks>
        /// <param name="sessionID">the ID of the session to resume.</param>
        /// <returns>A <see cref="TlsSession"/> with the specified session ID, or null.</returns>
        /// <seealso cref="SessionParameters.PeerCertificate"/>
        TlsSession GetSessionToResume(byte[] sessionID);

        byte[] GetNewSessionID();

        /// <summary>Return the <see cref="TlsPskExternal">external PSK</see> to select from the ClientHello.</summary>
        /// <remarks>
        /// WARNING: EXPERIMENTAL FEATURE, UNSTABLE API
        /// Note that this will only be called when TLS 1.3 or higher is amongst the offered protocol versions, and one
        /// or more PSKs are actually offered.
        /// </remarks>
        /// <param name="identities">an <see cref="IList{T}"/> of <see cref="PskIdentity"/> instances.</param>
        /// <returns>The <see cref="TlsPskExternal"/> corresponding to the selected identity, or null to not select
        /// any.</returns>
        TlsPskExternal GetExternalPsk(IList<PskIdentity> identities);

        void NotifySession(TlsSession session);

        /// <exception cref="IOException"/>
        void NotifyClientVersion(ProtocolVersion clientVersion);

        /// <exception cref="IOException"/>
        void NotifyFallback(bool isFallback);

        /// <exception cref="IOException"/>
        void NotifyOfferedCipherSuites(int[] offeredCipherSuites);

        /// <param name="clientExtensions">(Int32 -> byte[])</param>
        /// <exception cref="IOException"/>
        void ProcessClientExtensions(IDictionary<int, byte[]> clientExtensions);

        /// <exception cref="IOException"/>
        ProtocolVersion GetServerVersion();

        /// <exception cref="IOException"/>
        int[] GetSupportedGroups();

        /// <exception cref="IOException"/>
        int GetSelectedCipherSuite();

        /// <returns>(Int32 -> byte[])</returns>
        /// <exception cref="IOException"/>
        IDictionary<int, byte[]> GetServerExtensions();

        /// <param name="serverExtensions">(Int32 -> byte[])</param>
        /// <exception cref="IOException"/>
        void GetServerExtensionsForConnection(IDictionary<int, byte[]> serverExtensions);

        /// <returns>(SupplementalDataEntry)</returns>
        /// <exception cref="IOException"/>
        IList<SupplementalDataEntry> GetServerSupplementalData();

        /// <summary>Return server credentials to use.</summary>
        /// <remarks>
        /// The returned value may be null, or else it MUST implement <em>exactly one</em> of
        /// <see cref="TlsCredentialedAgreement"/>, <see cref="TlsCredentialedDecryptor"/>, or
        /// <see cref = "TlsCredentialedSigner"/>, depending on the key exchange that was negotiated.
        /// </remarks>
        /// <returns>a <see cref="TlsCredentials"/> object or null for anonymous key exchanges.</returns>
        /// <exception cref="IOException"/>
        TlsCredentials GetCredentials();

        /// <remarks>
        /// This method will be called (only) if the server included an extension of type "status_request" with empty
        /// "extension_data" in the extended server hello. See <i>RFC 3546 3.6. Certificate Status Request</i>. If a
        /// non-null <see cref="CertificateStatus"/> is returned, it is sent to the client as a handshake message of
        /// type "certificate_status".
        /// </remarks>
        /// <returns>A <see cref="CertificateStatus"/> to be sent to the client (or null for none).</returns>
        /// <exception cref="IOException"/>
        CertificateStatus GetCertificateStatus();

        /// <exception cref="IOException"/>
        CertificateRequest GetCertificateRequest();

        /// <exception cref="IOException"/>
        TlsPskIdentityManager GetPskIdentityManager();

        /// <exception cref="IOException"/>
        TlsSrpLoginParameters GetSrpLoginParameters();

        /// <exception cref="IOException"/>
        TlsDHConfig GetDHConfig();

        /// <exception cref="IOException"/>
        TlsECConfig GetECDHConfig();

        /// <param name="clientSupplementalData">(SupplementalDataEntry)</param>
        /// <exception cref="IOException"/>
        void ProcessClientSupplementalData(IList<SupplementalDataEntry> clientSupplementalData);

        /// <summary>Called by the protocol handler to report the client certificate, only if
        /// <see cref="GetCertificateRequest"/> returned non-null.</summary>
        /// <remarks>
        /// Note: this method is responsible for certificate verification and validation.
        /// </remarks>
        /// <param name="clientCertificate">the effective client certificate (may be an empty chain).</param>
        /// <exception cref="IOException"/>
        void NotifyClientCertificate(Certificate clientCertificate);

        /// <summary>RFC 5077 3.3. NewSessionTicket Handshake Message.</summary>
        /// <remarks>
        /// This method will be called (only) if a NewSessionTicket extension was sent by the server. See <i>RFC 5077
        /// 4. Recommended Ticket Construction</i> for recommended format and protection.
        /// </remarks>
        /// <returns>The ticket.</returns>
        /// <exception cref="IOException"/>
        NewSessionTicket GetNewSessionTicket();
    }
}
