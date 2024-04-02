using System;
using System.Collections.Generic;
using System.IO;

namespace Org.BouncyCastle.Tls
{
    public interface TlsClient
        : TlsPeer
    {
        void Init(TlsClientContext context);

        /// <summary>Return the session this client wants to resume, if any.</summary>
        /// <remarks>
        /// Note that the peer's certificate chain for the session (if any) may need to be periodically revalidated.
        /// </remarks>
        /// <returns>A <see cref="TlsSession"/> representing the resumable session to be used for this connection, or
        /// null to use a new session.</returns>
        /// <seealso cref="SessionParameters.PeerCertificate"/>
        TlsSession GetSessionToResume();

        /// <summary>Return the <see cref="TlsPskExternal">external PSKs</see> to offer in the ClientHello.</summary>
        /// <remarks>This will only be called when TLS 1.3 or higher is amongst the offered protocol versions.</remarks>
        /// <returns>an <see cref="IList{T}"/> of <see cref="TlsPskExternal"/> instances, or null if none should be
        /// offered.</returns>
        IList<TlsPskExternal> GetExternalPsks();

        bool IsFallback();

        /// <returns>(Int32 -> byte[])</returns>
        /// <exception cref="IOException"/>
        IDictionary<int, byte[]> GetClientExtensions();

        /// <summary>If this client is offering TLS 1.3 or higher, this method may be called to determine for which
        /// groups a key share should be included in the initial ClientHello.</summary>
        /// <remarks>
        /// Groups that were not included in the supported_groups extension (by <see cref="GetClientExtensions"/> will
        /// be ignored. The protocol will then add a suitable key_share extension to the ClientHello extensions.
        /// </remarks>
        /// <returns>an <see cref="IList{T}"/> of <see cref="NamedGroup">named group</see> values, possibly empty or
        /// null.
        /// </returns>
        IList<int> GetEarlyKeyShareGroups();

        /// <exception cref="IOException"/>
        void NotifyServerVersion(ProtocolVersion selectedVersion);

        /// <summary>Notifies the client of the session that will be offered in ClientHello for resumption, if any.
        /// </summary>
        /// <remarks>
        /// This will be either the session returned from {@link #getSessionToResume()} or null if that session was
        /// unusable. NOTE: the actual negotiated session_id is notified by <see cref="NotifySessionID(byte[])"/>.
        /// </remarks>
        /// <param name="session">The <see cref="TlsSession"/> representing the resumable session to be offered for
        /// this connection, or null if there is none.</param>
        /// <seealso cref="NotifySessionID(byte[])"/>
        void NotifySessionToResume(TlsSession session);

        /// <summary>Notifies the client of the session_id sent in the ServerHello.</summary>
        /// <param name="sessionID"/>
        /// <seealso cref="TlsContext.Session"/>
        void NotifySessionID(byte[] sessionID);

        void NotifySelectedCipherSuite(int selectedCipherSuite);

        /// <exception cref="IOException"/>
        void NotifySelectedPsk(TlsPsk selectedPsk);

        /// <summary>The protocol implementation validates that any server extensions received correspond to client
        /// extensions sent.</summary>
        /// <remarks>
        /// If further processing of the server extensions is needed, it can be done in this callback. NOTE: This is
        /// not called for session resumption handshakes.
        /// </remarks>
        /// <param name="serverExtensions">(Int32 -> byte[])</param>
        /// <exception cref="IOException"/>
        void ProcessServerExtensions(IDictionary<int, byte[]> serverExtensions);

        /// <param name="serverSupplementalData">(SupplementalDataEntry)</param>
        /// <exception cref="IOException"/>
        void ProcessServerSupplementalData(IList<SupplementalDataEntry> serverSupplementalData);

        /// <exception cref="IOException"/>
        TlsPskIdentity GetPskIdentity();

        /// <exception cref="IOException"/>
        TlsSrpIdentity GetSrpIdentity();

        /// <exception cref="IOException"/>
        TlsDHGroupVerifier GetDHGroupVerifier();

        /// <exception cref="IOException"/>
        TlsSrpConfigVerifier GetSrpConfigVerifier();

        /// <exception cref="IOException"/>
        TlsAuthentication GetAuthentication();

        /// <returns>(SupplementalDataEntry)</returns>
        /// <exception cref="IOException"/>
        IList<SupplementalDataEntry> GetClientSupplementalData();

        /// <summary>RFC 5077 3.3. NewSessionTicket Handshake Message</summary>
        /// <remarks>
        /// This method will be called (only) when a NewSessionTicket handshake message is received. The ticket is
        /// opaque to the client and clients MUST NOT examine the ticket under the assumption that it complies with e.g.
        /// RFC 5077 4. "Recommended Ticket Construction".
        /// </remarks>
        /// <param name="newSessionTicket">The ticket.</param>
        /// <exception cref="IOException"/>
        void NotifyNewSessionTicket(NewSessionTicket newSessionTicket);
    }
}
