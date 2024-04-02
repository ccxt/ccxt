using System;

using Org.BouncyCastle.Tls.Crypto;

namespace Org.BouncyCastle.Tls
{
    /// <summary>Base interface for a TLS context implementation.</summary>
    public interface TlsContext
    {
        TlsCrypto Crypto { get; }

        TlsNonceGenerator NonceGenerator { get; }

        SecurityParameters SecurityParameters { get; }

        /// <summary>Return true if this context is for a server, false otherwise.</summary>
        /// <returns>true for a server based context, false for a client based one.</returns>
        bool IsServer { get; }

        ProtocolVersion[] ClientSupportedVersions { get; }

        ProtocolVersion ClientVersion { get; }

        ProtocolVersion RsaPreMasterSecretVersion { get; }

        ProtocolVersion ServerVersion { get; }

        /// <summary>Used to get the resumable session, if any, used by this connection.</summary>
        /// <remarks>
        /// Only available after the handshake has successfully completed.
        /// </remarks>
        /// <returns>A <see cref="TlsSession"/> representing the resumable session used by this connection, or null if
        /// no resumable session available.</returns>
        /// <seealso cref="TlsPeer.NotifyHandshakeComplete"/>
        TlsSession ResumableSession { get; }

        /// <summary>Used to get the session information for this connection.</summary>
        /// <remarks>
        /// Only available after the handshake has successfully completed. Use <see cref="TlsSession.IsResumable"/>
        /// to find out if the session is resumable.
        /// </remarks>
        /// <returns>A <see cref="TlsSession"/> representing the session used by this connection.</returns>
        /// <seealso cref="TlsPeer.NotifyHandshakeComplete"/>
        TlsSession Session { get; }

        object UserObject { get; set; }

        /// <summary>Export the value of the specified channel binding.</summary>
        /// <remarks>
        /// Only available after the handshake has successfully completed.
        /// </remarks>
        /// <param name="channelBinding">A <see cref="ChannelBinding"/> constant specifying the channel binding to
        /// export.</param>
        /// <returns>A copy of the channel binding data as a <c>byte[]</c>, or null if the binding could not be
        /// determined.</returns>
        byte[] ExportChannelBinding(int channelBinding);

        /// <summary>Export (early data) keying material according to RFC 5705: "Keying Material Exporters for TLS", as
        /// updated for TLS 1.3 (RFC 8446).</summary>
        /// <remarks>
        /// NOTE: for use in settings where an exporter is needed for 0-RTT data.
        /// </remarks>
        /// <param name="asciiLabel">indicates which application will use the exported keys.</param>
        /// <param name="context_value">allows the application using the exporter to mix its own data with the TLS PRF
        /// for the exporter output.</param>
        /// <param name="length">the number of bytes to generate.</param>
        /// <returns>a pseudorandom bit string of 'length' bytes generated from the (exporter_)master_secret.</returns>
        byte[] ExportEarlyKeyingMaterial(string asciiLabel, byte[] context_value, int length);

        /// <summary>Export keying material according to RFC 5705: "Keying Material Exporters for TLS", as updated for
        /// TLS 1.3 (RFC 8446) when negotiated.</summary>
        /// <param name="asciiLabel">indicates which application will use the exported keys.</param>
        /// <param name="context_value">allows the application using the exporter to mix its own data with the TLS PRF
        /// for the exporter output.</param>
        /// <param name="length">the number of bytes to generate.</param>
        /// <returns>a pseudorandom bit string of 'length' bytes generated from the (exporter_)master_secret.</returns>
        byte[] ExportKeyingMaterial(string asciiLabel, byte[] context_value, int length);
    }
}
