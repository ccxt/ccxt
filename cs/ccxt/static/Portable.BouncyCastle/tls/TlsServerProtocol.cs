using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Tls.Crypto;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Tls
{
    public class TlsServerProtocol
        : TlsProtocol
    {
        protected TlsServer m_tlsServer = null;
        internal TlsServerContextImpl m_tlsServerContext = null;

        protected int[] m_offeredCipherSuites = null;
        protected TlsKeyExchange m_keyExchange = null;
        protected CertificateRequest m_certificateRequest = null;

        /// <summary>Constructor for non-blocking mode.</summary>
        /// <remarks>
        /// When data is received, use <see cref="TlsProtocol.OfferInput(byte[])"/> to provide the received ciphertext,
        /// then use <see cref="TlsProtocol.ReadInput(byte[],int,int)"/> to read the corresponding cleartext.<br/><br/>
        /// Similarly, when data needs to be sent, use <see cref="TlsProtocol.WriteApplicationData(byte[],int,int)"/>
        /// to provide the cleartext, then use <see cref="TlsProtocol.ReadOutput(byte[],int,int)"/> to get the
        /// corresponding ciphertext.
        /// </remarks>
        public TlsServerProtocol()
            : base()
        {
        }

        /// <summary>Constructor for blocking mode.</summary>
        /// <param name="stream">The <see cref="Stream"/> of data to/from the server.</param>
        public TlsServerProtocol(Stream stream)
            : base(stream)
        {
        }

        /// <summary>Constructor for blocking mode.</summary>
        /// <param name="input">The <see cref="Stream"/> of data from the server.</param>
        /// <param name="output">The <see cref="Stream"/> of data to the server.</param>
        public TlsServerProtocol(Stream input, Stream output)
            : base(input, output)
        {
        }

        /// <summary>Receives a TLS handshake in the role of server.</summary>
        /// <remarks>
        /// In blocking mode, this will not return until the handshake is complete. In non-blocking mode, use
        /// <see cref="TlsPeer.NotifyHandshakeComplete"/> to receive a callback when the handshake is complete.
        /// </remarks>
        /// <param name="tlsServer">The <see cref="TlsServer"/> to use for the handshake.</param>
        /// <exception cref="IOException">If in blocking mode and handshake was not successful.</exception>
        public void Accept(TlsServer tlsServer)
        {
            if (tlsServer == null)
                throw new ArgumentNullException("tlsServer");
            if (m_tlsServer != null)
                throw new InvalidOperationException("'Accept' can only be called once");

            this.m_tlsServer = tlsServer;
            this.m_tlsServerContext = new TlsServerContextImpl(tlsServer.Crypto);

            tlsServer.Init(m_tlsServerContext);
            tlsServer.NotifyCloseHandle(this);

            BeginHandshake();

            if (m_blocking)
            {
                BlockForHandshake();
            }
        }

        protected override void CleanupHandshake()
        {
            base.CleanupHandshake();

            this.m_offeredCipherSuites = null;
            this.m_keyExchange = null;
            this.m_certificateRequest = null;
        }

        protected virtual bool ExpectCertificateVerifyMessage()
        {
            if (null == m_certificateRequest)
                return false;

            Certificate clientCertificate = m_tlsServerContext.SecurityParameters.PeerCertificate;

            return null != clientCertificate && !clientCertificate.IsEmpty
                && (null == m_keyExchange || m_keyExchange.RequiresCertificateVerify);
        }

        /// <exception cref="IOException"/>
        protected virtual ServerHello Generate13HelloRetryRequest(ClientHello clientHello)
        {
            // TODO[tls13] In future there might be other reasons for a HelloRetryRequest.
            if (m_retryGroup < 0)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            SecurityParameters securityParameters = m_tlsServerContext.SecurityParameters;
            ProtocolVersion serverVersion = securityParameters.NegotiatedVersion;

            var serverHelloExtensions = new Dictionary<int, byte[]>();
            TlsExtensionsUtilities.AddSupportedVersionsExtensionServer(serverHelloExtensions, serverVersion);
            if (m_retryGroup >= 0)
            {
                TlsExtensionsUtilities.AddKeyShareHelloRetryRequest(serverHelloExtensions, m_retryGroup);
            }
            if (null != m_retryCookie)
            {
                TlsExtensionsUtilities.AddCookieExtension(serverHelloExtensions, m_retryCookie);
            }

            TlsUtilities.CheckExtensionData13(serverHelloExtensions, HandshakeType.hello_retry_request,
                AlertDescription.internal_error);

            return new ServerHello(clientHello.SessionID, securityParameters.CipherSuite, serverHelloExtensions);
        }

        /// <exception cref="IOException"/>
        protected virtual ServerHello Generate13ServerHello(ClientHello clientHello,
            HandshakeMessageInput clientHelloMessage, bool afterHelloRetryRequest)
        {
            SecurityParameters securityParameters = m_tlsServerContext.SecurityParameters;


            byte[] legacy_session_id = clientHello.SessionID;

            var clientHelloExtensions = clientHello.Extensions;
            if (null == clientHelloExtensions)
                throw new TlsFatalAlert(AlertDescription.missing_extension);


            ProtocolVersion serverVersion = securityParameters.NegotiatedVersion;
            TlsCrypto crypto = m_tlsServerContext.Crypto;

            // NOTE: Will only select for psk_dhe_ke
            OfferedPsks.SelectedConfig selectedPsk = TlsUtilities.SelectPreSharedKey(m_tlsServerContext, m_tlsServer,
                clientHelloExtensions, clientHelloMessage, m_handshakeHash, afterHelloRetryRequest);

            var clientShares = TlsExtensionsUtilities.GetKeyShareClientHello(clientHelloExtensions);
            KeyShareEntry clientShare = null;

            if (afterHelloRetryRequest)
            {
                if (m_retryGroup < 0)
                    throw new TlsFatalAlert(AlertDescription.internal_error);

                if (null == selectedPsk)
                {
                    /*
                     * RFC 8446 4.2.3. If a server is authenticating via a certificate and the client has
                     * not sent a "signature_algorithms" extension, then the server MUST abort the handshake
                     * with a "missing_extension" alert.
                     */
                    if (null == securityParameters.ClientSigAlgs)
                        throw new TlsFatalAlert(AlertDescription.missing_extension);
                }
                else
                {
                    // TODO[tls13] Maybe filter the offered PSKs by PRF algorithm before server selection instead
                    if (selectedPsk.m_psk.PrfAlgorithm != securityParameters.PrfAlgorithm)
                        throw new TlsFatalAlert(AlertDescription.illegal_parameter);
                }

                /*
                 * TODO[tls13] Confirm fields in the ClientHello haven't changed
                 * 
                 * RFC 8446 4.1.2 [..] when the server has responded to its ClientHello with a
                 * HelloRetryRequest [..] the client MUST send the same ClientHello without
                 * modification, except as follows: [key_share, early_data, cookie, pre_shared_key,
                 * padding].
                 */

                byte[] cookie = TlsExtensionsUtilities.GetCookieExtension(clientHelloExtensions);
                if (!Arrays.AreEqual(m_retryCookie, cookie))
                    throw new TlsFatalAlert(AlertDescription.illegal_parameter);

                this.m_retryCookie = null;

                clientShare = TlsUtilities.SelectKeyShare(clientShares, m_retryGroup);
                if (null == clientShare)
                    throw new TlsFatalAlert(AlertDescription.illegal_parameter);
            }
            else
            {
                {
                    securityParameters.m_serverRandom = CreateRandomBlock(false, m_tlsServerContext);

                    if (!serverVersion.Equals(ProtocolVersion.GetLatestTls(m_tlsServer.GetProtocolVersions())))
                    {
                        TlsUtilities.WriteDowngradeMarker(serverVersion, securityParameters.ServerRandom);
                    }
                }

                this.m_clientExtensions = clientHelloExtensions;

                securityParameters.m_secureRenegotiation = false;

                // NOTE: Validates the padding extension data, if present
                TlsExtensionsUtilities.GetPaddingExtension(clientHelloExtensions);

                securityParameters.m_clientServerNames = TlsExtensionsUtilities
                    .GetServerNameExtensionClient(clientHelloExtensions);

                TlsUtilities.EstablishClientSigAlgs(securityParameters, clientHelloExtensions);

                /*
                 * RFC 8446 4.2.3. If a server is authenticating via a certificate and the client has
                 * not sent a "signature_algorithms" extension, then the server MUST abort the handshake
                 * with a "missing_extension" alert.
                 */
                if (null == selectedPsk && null == securityParameters.ClientSigAlgs)
                    throw new TlsFatalAlert(AlertDescription.missing_extension);

                m_tlsServer.ProcessClientExtensions(clientHelloExtensions);

                /*
                 * NOTE: Currently no server support for session resumption
                 * 
                 * If adding support, ensure securityParameters.tlsUnique is set to the localVerifyData, but
                 * ONLY when extended_master_secret has been negotiated (otherwise NULL).
                 */
                {
                    // TODO[tls13] Resumption/PSK
                    securityParameters.m_resumedSession = false;

                    this.m_tlsSession = TlsUtilities.ImportSession(TlsUtilities.EmptyBytes, null);
                    this.m_sessionParameters = null;
                    this.m_sessionMasterSecret = null;
                }

                securityParameters.m_sessionID = m_tlsSession.SessionID;

                m_tlsServer.NotifySession(m_tlsSession);

                TlsUtilities.NegotiatedVersionTlsServer(m_tlsServerContext);

                {
                    // TODO[tls13] Constrain selection when PSK selected
                    int cipherSuite = m_tlsServer.GetSelectedCipherSuite();

                    if (!TlsUtilities.IsValidCipherSuiteSelection(m_offeredCipherSuites, cipherSuite) ||
                        !TlsUtilities.IsValidVersionForCipherSuite(cipherSuite, serverVersion))
                    {
                        throw new TlsFatalAlert(AlertDescription.internal_error);
                    }

                    TlsUtilities.NegotiatedCipherSuite(securityParameters, cipherSuite);
                }

                int[] clientSupportedGroups = securityParameters.ClientSupportedGroups;
                int[] serverSupportedGroups = securityParameters.ServerSupportedGroups;

                clientShare = TlsUtilities.SelectKeyShare(crypto, serverVersion, clientShares, clientSupportedGroups,
                    serverSupportedGroups);

                if (null == clientShare)
                {
                    this.m_retryGroup = TlsUtilities.SelectKeyShareGroup(crypto, serverVersion, clientSupportedGroups,
                        serverSupportedGroups);
                    if (m_retryGroup < 0)
                        throw new TlsFatalAlert(AlertDescription.handshake_failure);

                    this.m_retryCookie = m_tlsServerContext.NonceGenerator.GenerateNonce(16);

                    return Generate13HelloRetryRequest(clientHello);
                }

                if (clientShare.NamedGroup != serverSupportedGroups[0])
                {
                    /*
                     * TODO[tls13] RFC 8446 4.2.7. As of TLS 1.3, servers are permitted to send the
                     * "supported_groups" extension to the client. Clients MUST NOT act upon any
                     * information found in "supported_groups" prior to successful completion of the
                     * handshake but MAY use the information learned from a successfully completed
                     * handshake to change what groups they use in their "key_share" extension in
                     * subsequent connections. If the server has a group it prefers to the ones in the
                     * "key_share" extension but is still willing to accept the ClientHello, it SHOULD
                     * send "supported_groups" to update the client's view of its preferences; this
                     * extension SHOULD contain all groups the server supports, regardless of whether
                     * they are currently supported by the client.
                     */
                }
            }


            var serverHelloExtensions = new Dictionary<int, byte[]>();
            var serverEncryptedExtensions = TlsExtensionsUtilities.EnsureExtensionsInitialised(
                m_tlsServer.GetServerExtensions());

            m_tlsServer.GetServerExtensionsForConnection(serverEncryptedExtensions);

            ProtocolVersion serverLegacyVersion = ProtocolVersion.TLSv12;
            TlsExtensionsUtilities.AddSupportedVersionsExtensionServer(serverHelloExtensions, serverVersion);

            /*
             * RFC 8446 Appendix D. Because TLS 1.3 always hashes in the transcript up to the server
             * Finished, implementations which support both TLS 1.3 and earlier versions SHOULD indicate
             * the use of the Extended Master Secret extension in their APIs whenever TLS 1.3 is used.
             */
            securityParameters.m_extendedMasterSecret = true;

            /*
             * RFC 7301 3.1. When session resumption or session tickets [...] are used, the previous
             * contents of this extension are irrelevant, and only the values in the new handshake
             * messages are considered.
             */
            securityParameters.m_applicationProtocol = TlsExtensionsUtilities.GetAlpnExtensionServer(
                serverEncryptedExtensions);
            securityParameters.m_applicationProtocolSet = true;

            if (serverEncryptedExtensions.Count > 0)
            {
                securityParameters.m_maxFragmentLength = ProcessMaxFragmentLengthExtension(
                    securityParameters.IsResumedSession ? null : clientHelloExtensions, serverEncryptedExtensions,
                    AlertDescription.internal_error);
            }

            securityParameters.m_encryptThenMac = false;
            securityParameters.m_truncatedHmac = false;

            /*
             * TODO[tls13] RFC 8446 4.4.2.1. OCSP Status and SCT Extensions.
             * 
             * OCSP information is carried in an extension for a CertificateEntry.
             */
            securityParameters.m_statusRequestVersion =
                clientHelloExtensions.ContainsKey(ExtensionType.status_request) ? 1 : 0;

            this.m_expectSessionTicket = false;

            TlsSecret pskEarlySecret = null;
            if (null != selectedPsk)
            {
                pskEarlySecret = selectedPsk.m_earlySecret;

                this.m_selectedPsk13 = true;

                TlsExtensionsUtilities.AddPreSharedKeyServerHello(serverHelloExtensions, selectedPsk.m_index);
            }

            TlsSecret sharedSecret;
            {
                int namedGroup = clientShare.NamedGroup;

                TlsAgreement agreement;
                if (NamedGroup.RefersToASpecificCurve(namedGroup))
                {
                    agreement = crypto.CreateECDomain(new TlsECConfig(namedGroup)).CreateECDH();
                }
                else if (NamedGroup.RefersToASpecificFiniteField(namedGroup))
                {
                    agreement = crypto.CreateDHDomain(new TlsDHConfig(namedGroup, true)).CreateDH();
                }
                else
                {
                    throw new TlsFatalAlert(AlertDescription.internal_error);
                }

                byte[] key_exchange = agreement.GenerateEphemeral();
                KeyShareEntry serverShare = new KeyShareEntry(namedGroup, key_exchange);
                TlsExtensionsUtilities.AddKeyShareServerHello(serverHelloExtensions, serverShare);

                agreement.ReceivePeerValue(clientShare.KeyExchange);
                sharedSecret = agreement.CalculateSecret();
            }

            TlsUtilities.Establish13PhaseSecrets(m_tlsServerContext, pskEarlySecret, sharedSecret);

            this.m_serverExtensions = serverEncryptedExtensions;

            ApplyMaxFragmentLengthExtension(securityParameters.MaxFragmentLength);

            TlsUtilities.CheckExtensionData13(serverHelloExtensions, HandshakeType.server_hello,
                AlertDescription.internal_error);

            return new ServerHello(serverLegacyVersion, securityParameters.ServerRandom, legacy_session_id,
                securityParameters.CipherSuite, serverHelloExtensions);
        }

        /// <exception cref="IOException"/>
        protected virtual ServerHello GenerateServerHello(ClientHello clientHello,
            HandshakeMessageInput clientHelloMessage)
        {
            ProtocolVersion clientLegacyVersion = clientHello.Version;
            if (!clientLegacyVersion.IsTls)
                throw new TlsFatalAlert(AlertDescription.illegal_parameter);

            this.m_offeredCipherSuites = clientHello.CipherSuites;


 
            SecurityParameters securityParameters = m_tlsServerContext.SecurityParameters;

            m_tlsServerContext.SetClientSupportedVersions(
                TlsExtensionsUtilities.GetSupportedVersionsExtensionClient(clientHello.Extensions));

            ProtocolVersion clientVersion = clientLegacyVersion;
            if (null == m_tlsServerContext.ClientSupportedVersions)
            {
                if (clientVersion.IsLaterVersionOf(ProtocolVersion.TLSv12))
                {
                    clientVersion = ProtocolVersion.TLSv12;
                }

                m_tlsServerContext.SetClientSupportedVersions(clientVersion.DownTo(ProtocolVersion.SSLv3));
            }
            else
            {
                clientVersion = ProtocolVersion.GetLatestTls(m_tlsServerContext.ClientSupportedVersions);
            }

            // Set the legacy_record_version to use for early alerts 
            m_recordStream.SetWriteVersion(clientVersion);

            if (!ProtocolVersion.SERVER_EARLIEST_SUPPORTED_TLS.IsEqualOrEarlierVersionOf(clientVersion))
                throw new TlsFatalAlert(AlertDescription.protocol_version);

            // NOT renegotiating
            {
                m_tlsServerContext.SetClientVersion(clientVersion);
            }

            m_tlsServer.NotifyClientVersion(m_tlsServerContext.ClientVersion);

            securityParameters.m_clientRandom = clientHello.Random;

            m_tlsServer.NotifyFallback(Arrays.Contains(m_offeredCipherSuites, CipherSuite.TLS_FALLBACK_SCSV));

            m_tlsServer.NotifyOfferedCipherSuites(m_offeredCipherSuites);

            // TODO[tls13] Negotiate cipher suite first?

            ProtocolVersion serverVersion;

            // NOT renegotiating
            {
                serverVersion = m_tlsServer.GetServerVersion();
                if (!ProtocolVersion.Contains(m_tlsServerContext.ClientSupportedVersions, serverVersion))
                    throw new TlsFatalAlert(AlertDescription.internal_error);

                securityParameters.m_negotiatedVersion = serverVersion;
            }

            securityParameters.m_clientSupportedGroups = TlsExtensionsUtilities.GetSupportedGroupsExtension(
                clientHello.Extensions);
            securityParameters.m_serverSupportedGroups = m_tlsServer.GetSupportedGroups();

            if (ProtocolVersion.TLSv13.IsEqualOrEarlierVersionOf(serverVersion))
            {
                // See RFC 8446 D.4.
                m_recordStream.SetIgnoreChangeCipherSpec(true);

                m_recordStream.SetWriteVersion(ProtocolVersion.TLSv12);

                return Generate13ServerHello(clientHello, clientHelloMessage, false);
            }

            m_recordStream.SetWriteVersion(serverVersion);

            {
                bool useGmtUnixTime = m_tlsServer.ShouldUseGmtUnixTime();

                securityParameters.m_serverRandom = CreateRandomBlock(useGmtUnixTime, m_tlsServerContext);

                if (!serverVersion.Equals(ProtocolVersion.GetLatestTls(m_tlsServer.GetProtocolVersions())))
                {
                    TlsUtilities.WriteDowngradeMarker(serverVersion, securityParameters.ServerRandom);
                }
            }

            this.m_clientExtensions = clientHello.Extensions;

            byte[] clientRenegExtData = TlsUtilities.GetExtensionData(m_clientExtensions, ExtensionType.renegotiation_info);

            // NOT renegotiating
            {
                /*
                 * RFC 5746 3.6. Server Behavior: Initial Handshake (both full and session-resumption)
                 */

                /*
                 * RFC 5746 3.4. The client MUST include either an empty "renegotiation_info" extension,
                 * or the TLS_EMPTY_RENEGOTIATION_INFO_SCSV signaling cipher suite value in the
                 * ClientHello. Including both is NOT RECOMMENDED.
                 */

                /*
                 * When a ClientHello is received, the server MUST check if it includes the
                 * TLS_EMPTY_RENEGOTIATION_INFO_SCSV SCSV. If it does, set the secure_renegotiation flag
                 * to TRUE.
                 */
                if (Arrays.Contains(m_offeredCipherSuites, CipherSuite.TLS_EMPTY_RENEGOTIATION_INFO_SCSV))
                {
                    securityParameters.m_secureRenegotiation = true;
                }

                /*
                 * The server MUST check if the "renegotiation_info" extension is included in the
                 * ClientHello.
                 */
                if (clientRenegExtData != null)
                {
                    /*
                     * If the extension is present, set secure_renegotiation flag to TRUE. The
                     * server MUST then verify that the length of the "renegotiated_connection"
                     * field is zero, and if it is not, MUST abort the handshake.
                     */
                    securityParameters.m_secureRenegotiation = true;

                    if (!Arrays.ConstantTimeAreEqual(clientRenegExtData,
                        CreateRenegotiationInfo(TlsUtilities.EmptyBytes)))
                    {
                        throw new TlsFatalAlert(AlertDescription.handshake_failure);
                    }
                }
            }

            m_tlsServer.NotifySecureRenegotiation(securityParameters.IsSecureRenegotiation);

            bool offeredExtendedMasterSecret = TlsExtensionsUtilities.HasExtendedMasterSecretExtension(
                m_clientExtensions);

            if (m_clientExtensions != null)
            {
                // NOTE: Validates the padding extension data, if present
                TlsExtensionsUtilities.GetPaddingExtension(m_clientExtensions);

                securityParameters.m_clientServerNames = TlsExtensionsUtilities.GetServerNameExtensionClient(
                    m_clientExtensions);

                /*
                 * RFC 5246 7.4.1.4.1. Note: this extension is not meaningful for TLS versions prior
                 * to 1.2. Clients MUST NOT offer it if they are offering prior versions.
                 */
                if (TlsUtilities.IsSignatureAlgorithmsExtensionAllowed(clientVersion))
                {
                    TlsUtilities.EstablishClientSigAlgs(securityParameters, m_clientExtensions);
                }

                securityParameters.m_clientSupportedGroups = TlsExtensionsUtilities.GetSupportedGroupsExtension(
                    m_clientExtensions);

                m_tlsServer.ProcessClientExtensions(m_clientExtensions);
            }

            bool resumedSession = EstablishSession(m_tlsServer.GetSessionToResume(clientHello.SessionID));
            securityParameters.m_resumedSession = resumedSession;

            if (!resumedSession)
            {
                byte[] newSessionID = m_tlsServer.GetNewSessionID();
                if (null == newSessionID)
                {
                    newSessionID = TlsUtilities.EmptyBytes;
                }

                this.m_tlsSession = TlsUtilities.ImportSession(newSessionID, null);
                this.m_sessionParameters = null;
                this.m_sessionMasterSecret = null;
            }

            securityParameters.m_sessionID = m_tlsSession.SessionID;

            m_tlsServer.NotifySession(m_tlsSession);

            TlsUtilities.NegotiatedVersionTlsServer(m_tlsServerContext);

            {
                int cipherSuite = resumedSession
                    ?   m_sessionParameters.CipherSuite
                    :   m_tlsServer.GetSelectedCipherSuite();

                if (!TlsUtilities.IsValidCipherSuiteSelection(m_offeredCipherSuites, cipherSuite) ||
                    !TlsUtilities.IsValidVersionForCipherSuite(cipherSuite, serverVersion))
                {
                    throw new TlsFatalAlert(AlertDescription.internal_error);
                }

                TlsUtilities.NegotiatedCipherSuite(securityParameters, cipherSuite);
            }

            m_tlsServerContext.SetRsaPreMasterSecretVersion(clientLegacyVersion);

            {
                var sessionServerExtensions = resumedSession
                    ?   m_sessionParameters.ReadServerExtensions()
                    :   m_tlsServer.GetServerExtensions();

                this.m_serverExtensions = TlsExtensionsUtilities.EnsureExtensionsInitialised(sessionServerExtensions);
            }

            m_tlsServer.GetServerExtensionsForConnection(m_serverExtensions);

            // NOT renegotiating
            {
                /*
                 * RFC 5746 3.6. Server Behavior: Initial Handshake (both full and session-resumption)
                 */
                if (securityParameters.IsSecureRenegotiation)
                {
                    byte[] serverRenegExtData = TlsUtilities.GetExtensionData(m_serverExtensions,
                        ExtensionType.renegotiation_info);
                    bool noRenegExt = (null == serverRenegExtData);

                    if (noRenegExt)
                    {
                        /*
                         * Note that sending a "renegotiation_info" extension in response to a ClientHello
                         * containing only the SCSV is an explicit exception to the prohibition in RFC 5246,
                         * Section 7.4.1.4, on the server sending unsolicited extensions and is only allowed
                         * because the client is signaling its willingness to receive the extension via the
                         * TLS_EMPTY_RENEGOTIATION_INFO_SCSV SCSV.
                         */

                        /*
                         * If the secure_renegotiation flag is set to TRUE, the server MUST include an empty
                         * "renegotiation_info" extension in the ServerHello message.
                         */
                        this.m_serverExtensions[ExtensionType.renegotiation_info] = CreateRenegotiationInfo(
                            TlsUtilities.EmptyBytes);
                    }
                }
            }

            /*
             * RFC 7627 4. Clients and servers SHOULD NOT accept handshakes that do not use the extended
             * master secret [..]. (and see 5.2, 5.3)
             */
            if (resumedSession)
            {
                if (!m_sessionParameters.IsExtendedMasterSecret)
                {
                    /*
                     * TODO[resumption] ProvTlsServer currently only resumes EMS sessions. Revisit this
                     * in relation to 'tlsServer.allowLegacyResumption()'.
                     */
                    throw new TlsFatalAlert(AlertDescription.internal_error);
                }

                if (!offeredExtendedMasterSecret)
                    throw new TlsFatalAlert(AlertDescription.handshake_failure);

                securityParameters.m_extendedMasterSecret = true;

                TlsExtensionsUtilities.AddExtendedMasterSecretExtension(m_serverExtensions);
            }
            else
            {
                securityParameters.m_extendedMasterSecret = offeredExtendedMasterSecret && !serverVersion.IsSsl
                    && m_tlsServer.ShouldUseExtendedMasterSecret();

                if (securityParameters.IsExtendedMasterSecret)
                {
                    TlsExtensionsUtilities.AddExtendedMasterSecretExtension(m_serverExtensions);
                }
                else if (m_tlsServer.RequiresExtendedMasterSecret())
                {
                    throw new TlsFatalAlert(AlertDescription.handshake_failure);
                }
            }

            securityParameters.m_applicationProtocol = TlsExtensionsUtilities.GetAlpnExtensionServer(m_serverExtensions);
            securityParameters.m_applicationProtocolSet = true;

            if (m_serverExtensions.Count > 0)
            {
                securityParameters.m_encryptThenMac = TlsExtensionsUtilities.HasEncryptThenMacExtension(
                    m_serverExtensions);

                securityParameters.m_maxFragmentLength = ProcessMaxFragmentLengthExtension(
                    resumedSession ? null : m_clientExtensions, m_serverExtensions, AlertDescription.internal_error);

                securityParameters.m_truncatedHmac = TlsExtensionsUtilities.HasTruncatedHmacExtension(
                    m_serverExtensions);

                if (!resumedSession)
                {
                    if (TlsUtilities.HasExpectedEmptyExtensionData(m_serverExtensions, ExtensionType.status_request_v2,
                        AlertDescription.internal_error))
                    {
                        securityParameters.m_statusRequestVersion = 2;
                    }
                    else if (TlsUtilities.HasExpectedEmptyExtensionData(m_serverExtensions, ExtensionType.status_request,
                        AlertDescription.internal_error))
                    {
                        securityParameters.m_statusRequestVersion = 1;
                    }

                    this.m_expectSessionTicket = TlsUtilities.HasExpectedEmptyExtensionData(m_serverExtensions,
                        ExtensionType.session_ticket, AlertDescription.internal_error);
                }
            }

            ApplyMaxFragmentLengthExtension(securityParameters.MaxFragmentLength);

            return new ServerHello(serverVersion, securityParameters.ServerRandom, m_tlsSession.SessionID,
                securityParameters.CipherSuite, m_serverExtensions);
        }

        protected override TlsContext Context
        {
            get { return m_tlsServerContext; }
        }

        internal override AbstractTlsContext ContextAdmin
        {
            get { return m_tlsServerContext; }
        }

        protected override TlsPeer Peer
        {
            get { return m_tlsServer; }
        }

        /// <exception cref="IOException"/>
        protected virtual void Handle13HandshakeMessage(short type, HandshakeMessageInput buf)
        {
            if (!IsTlsV13ConnectionState())
                throw new TlsFatalAlert(AlertDescription.internal_error);

            /*
             * TODO[tls13] Abbreviated handshakes (PSK resumption)
             * 
             * NOTE: No CertificateRequest, Certificate, CertificateVerify messages, but client
             * might now send EndOfEarlyData after receiving server Finished message.
             */

            switch (type)
            {
            case HandshakeType.certificate:
            {
                switch (m_connectionState)
                {
                case CS_SERVER_FINISHED:
                {
                    Receive13ClientCertificate(buf);
                    this.m_connectionState = CS_CLIENT_CERTIFICATE;
                    break;
                }
                default:
                    throw new TlsFatalAlert(AlertDescription.unexpected_message);
                }
                break;
            }
            case HandshakeType.certificate_verify:
            {
                switch (m_connectionState)
                {
                case CS_CLIENT_CERTIFICATE:
                {
                    Receive13ClientCertificateVerify(buf);
                    buf.UpdateHash(m_handshakeHash);
                    this.m_connectionState = CS_CLIENT_CERTIFICATE_VERIFY;
                    break;
                }
                default:
                    throw new TlsFatalAlert(AlertDescription.unexpected_message);
                }
                break;
            }
            case HandshakeType.client_hello:
            {
                switch (m_connectionState)
                {
                case CS_START:
                {
                    // NOTE: Legacy handler should be dispatching initial ClientHello.
                    throw new TlsFatalAlert(AlertDescription.internal_error);
                }
                case CS_SERVER_HELLO_RETRY_REQUEST:
                {
                    ClientHello clientHelloRetry = ReceiveClientHelloMessage(buf);
                    this.m_connectionState = CS_CLIENT_HELLO_RETRY;

                    ServerHello serverHello = Generate13ServerHello(clientHelloRetry, buf, true);
                    SendServerHelloMessage(serverHello);
                    this.m_connectionState = CS_SERVER_HELLO;

                    Send13ServerHelloCoda(serverHello, true);
                    break;
                }
                default:
                    throw new TlsFatalAlert(AlertDescription.unexpected_message);
                }
                break;
            }
            case HandshakeType.finished:
            {
                switch (m_connectionState)
                {
                case CS_SERVER_FINISHED:
                case CS_CLIENT_CERTIFICATE:
                case CS_CLIENT_CERTIFICATE_VERIFY:
                {
                    if (m_connectionState == CS_SERVER_FINISHED)
                    {
                        Skip13ClientCertificate();
                    }
                    if (m_connectionState != CS_CLIENT_CERTIFICATE_VERIFY)
                    {
                        Skip13ClientCertificateVerify();
                    }

                    Receive13ClientFinished(buf);
                    this.m_connectionState = CS_CLIENT_FINISHED;

                    // See RFC 8446 D.4.
                    m_recordStream.SetIgnoreChangeCipherSpec(false);

                    // NOTE: Completes the switch to application-data phase (server entered after CS_SERVER_FINISHED).
                    m_recordStream.EnablePendingCipherRead(false);

                    CompleteHandshake();
                    break;
                }
                default:
                    throw new TlsFatalAlert(AlertDescription.unexpected_message);
                }
                break;
            }
            case HandshakeType.key_update:
            {
                Receive13KeyUpdate(buf);
                break;
            }

            case HandshakeType.certificate_request:
            case HandshakeType.certificate_status:
            case HandshakeType.certificate_url:
            case HandshakeType.client_key_exchange:
            case HandshakeType.compressed_certificate:
            case HandshakeType.encrypted_extensions:
            case HandshakeType.end_of_early_data:
            case HandshakeType.hello_request:
            case HandshakeType.hello_verify_request:
            case HandshakeType.message_hash:
            case HandshakeType.new_session_ticket:
            case HandshakeType.server_hello:
            case HandshakeType.server_hello_done:
            case HandshakeType.server_key_exchange:
            case HandshakeType.supplemental_data:
            default:
                throw new TlsFatalAlert(AlertDescription.unexpected_message);
            }
        }

        protected override void HandleHandshakeMessage(short type, HandshakeMessageInput buf)
        {
            SecurityParameters securityParameters = m_tlsServerContext.SecurityParameters;

            if (m_connectionState > CS_CLIENT_HELLO
                && TlsUtilities.IsTlsV13(securityParameters.NegotiatedVersion))
            {
                if (securityParameters.IsResumedSession)
                    throw new TlsFatalAlert(AlertDescription.internal_error);

                Handle13HandshakeMessage(type, buf);
                return;
            }

            if (!IsLegacyConnectionState())
                throw new TlsFatalAlert(AlertDescription.internal_error);

            if (securityParameters.IsResumedSession)
            {
                if (type != HandshakeType.finished || m_connectionState != CS_SERVER_FINISHED)
                    throw new TlsFatalAlert(AlertDescription.unexpected_message);

                ProcessFinishedMessage(buf);
                this.m_connectionState = CS_CLIENT_FINISHED;

                CompleteHandshake();
                return;
            }

            switch (type)
            {
            case HandshakeType.client_hello:
            {
                if (IsApplicationDataReady)
                {
                    RefuseRenegotiation();
                    break;
                }

                switch (m_connectionState)
                {
                case CS_END:
                {
                    throw new TlsFatalAlert(AlertDescription.internal_error);
                }
                case CS_START:
                {
                    ClientHello clientHello = ReceiveClientHelloMessage(buf);
                    this.m_connectionState = CS_CLIENT_HELLO;

                    ServerHello serverHello = GenerateServerHello(clientHello, buf);
                    m_handshakeHash.NotifyPrfDetermined();

                    if (TlsUtilities.IsTlsV13(securityParameters.NegotiatedVersion))
                    {
                        m_handshakeHash.SealHashAlgorithms();

                        if (serverHello.IsHelloRetryRequest())
                        {
                            TlsUtilities.AdjustTranscriptForRetry(m_handshakeHash);

                            SendServerHelloMessage(serverHello);
                            this.m_connectionState = CS_SERVER_HELLO_RETRY_REQUEST;

                            // See RFC 8446 D.4.
                            SendChangeCipherSpecMessage();
                        }
                        else
                        {
                            SendServerHelloMessage(serverHello);
                            this.m_connectionState = CS_SERVER_HELLO;

                            // See RFC 8446 D.4.
                            SendChangeCipherSpecMessage();

                            Send13ServerHelloCoda(serverHello, false);
                        }
                        break;
                    }

                    // For TLS 1.3+, this was already done by GenerateServerHello
                    buf.UpdateHash(m_handshakeHash);

                    SendServerHelloMessage(serverHello);
                    this.m_connectionState = CS_SERVER_HELLO;

                    if (securityParameters.IsResumedSession)
                    {
                        securityParameters.m_masterSecret = m_sessionMasterSecret;
                        m_recordStream.SetPendingCipher(TlsUtilities.InitCipher(m_tlsServerContext));

                        SendChangeCipherSpec();
                        SendFinishedMessage();
                        this.m_connectionState = CS_SERVER_FINISHED;
                        break;
                    }

                    var serverSupplementalData = m_tlsServer.GetServerSupplementalData();
                    if (serverSupplementalData != null)
                    {
                        SendSupplementalDataMessage(serverSupplementalData);
                        this.m_connectionState = CS_SERVER_SUPPLEMENTAL_DATA;
                    }

                    this.m_keyExchange = TlsUtilities.InitKeyExchangeServer(m_tlsServerContext, m_tlsServer);

                    TlsCredentials serverCredentials = null;

                    if (!KeyExchangeAlgorithm.IsAnonymous(securityParameters.KeyExchangeAlgorithm))
                    {
                        serverCredentials = TlsUtilities.EstablishServerCredentials(m_tlsServer);
                    }

                    // Server certificate
                    {
                        Certificate serverCertificate = null;

                        MemoryStream endPointHash = new MemoryStream();
                        if (null == serverCredentials)
                        {
                            m_keyExchange.SkipServerCredentials();
                        }
                        else
                        {
                            m_keyExchange.ProcessServerCredentials(serverCredentials);

                            serverCertificate = serverCredentials.Certificate;
                            SendCertificateMessage(serverCertificate, endPointHash);
                            this.m_connectionState = CS_SERVER_CERTIFICATE;
                        }

                        securityParameters.m_tlsServerEndPoint = endPointHash.ToArray();

                        // TODO[RFC 3546] Check whether empty certificates is possible, allowed, or excludes
                        // CertificateStatus
                        if (null == serverCertificate || serverCertificate.IsEmpty)
                        {
                            securityParameters.m_statusRequestVersion = 0;
                        }
                    }

                    if (securityParameters.StatusRequestVersion > 0)
                    {
                        CertificateStatus certificateStatus = m_tlsServer.GetCertificateStatus();
                        if (certificateStatus != null)
                        {
                            SendCertificateStatusMessage(certificateStatus);
                            this.m_connectionState = CS_SERVER_CERTIFICATE_STATUS;
                        }
                    }

                    byte[] serverKeyExchange = m_keyExchange.GenerateServerKeyExchange();
                    if (serverKeyExchange != null)
                    {
                        SendServerKeyExchangeMessage(serverKeyExchange);
                        this.m_connectionState = CS_SERVER_KEY_EXCHANGE;
                    }

                    if (null != serverCredentials)
                    {
                        this.m_certificateRequest = m_tlsServer.GetCertificateRequest();

                        if (null == m_certificateRequest)
                        {
                            /*
                             * For static agreement key exchanges, CertificateRequest is required since
                             * the client Certificate message is mandatory but can only be sent if the
                             * server requests it.
                             */
                            if (!m_keyExchange.RequiresCertificateVerify)
                                throw new TlsFatalAlert(AlertDescription.internal_error);
                        }
                        else
                        {
                            if (TlsUtilities.IsTlsV12(m_tlsServerContext)
                                != (m_certificateRequest.SupportedSignatureAlgorithms != null))
                            {
                                throw new TlsFatalAlert(AlertDescription.internal_error);
                            }

                            this.m_certificateRequest = TlsUtilities.ValidateCertificateRequest(m_certificateRequest,
                                m_keyExchange);

                            TlsUtilities.EstablishServerSigAlgs(securityParameters, m_certificateRequest);

                            if (ProtocolVersion.TLSv12.Equals(securityParameters.NegotiatedVersion))
                            {
                                TlsUtilities.TrackHashAlgorithms(m_handshakeHash, securityParameters.ServerSigAlgs);

                                if (m_tlsServerContext.Crypto.HasAnyStreamVerifiers(securityParameters.ServerSigAlgs))
                                {
                                    m_handshakeHash.ForceBuffering();
                                }
                            }
                            else
                            {
                                if (m_tlsServerContext.Crypto.HasAnyStreamVerifiersLegacy(m_certificateRequest.CertificateTypes))
                                {
                                    m_handshakeHash.ForceBuffering();
                                }
                            }
                        }
                    }

                    m_handshakeHash.SealHashAlgorithms();

                    if (null != m_certificateRequest)
                    {
                        SendCertificateRequestMessage(m_certificateRequest);
                        this.m_connectionState = CS_SERVER_CERTIFICATE_REQUEST;
                    }

                    SendServerHelloDoneMessage();
                    this.m_connectionState = CS_SERVER_HELLO_DONE;

                    break;
                }
                default:
                    throw new TlsFatalAlert(AlertDescription.unexpected_message);
                }
                break;
            }
            case HandshakeType.supplemental_data:
            {
                switch (m_connectionState)
                {
                case CS_SERVER_HELLO_DONE:
                {
                    m_tlsServer.ProcessClientSupplementalData(ReadSupplementalDataMessage(buf));
                    this.m_connectionState = CS_CLIENT_SUPPLEMENTAL_DATA;
                    break;
                }
                default:
                    throw new TlsFatalAlert(AlertDescription.unexpected_message);
                }
                break;
            }
            case HandshakeType.certificate:
            {
                switch (m_connectionState)
                {
                case CS_SERVER_HELLO_DONE:
                case CS_CLIENT_SUPPLEMENTAL_DATA:
                {
                    if (m_connectionState != CS_CLIENT_SUPPLEMENTAL_DATA)
                    {
                        m_tlsServer.ProcessClientSupplementalData(null);
                    }

                    ReceiveCertificateMessage(buf);
                    this.m_connectionState = CS_CLIENT_CERTIFICATE;
                    break;
                }
                default:
                    throw new TlsFatalAlert(AlertDescription.unexpected_message);
                }
                break;
            }
            case HandshakeType.client_key_exchange:
            {
                switch (m_connectionState)
                {
                case CS_SERVER_HELLO_DONE:
                case CS_CLIENT_SUPPLEMENTAL_DATA:
                case CS_CLIENT_CERTIFICATE:
                {
                    if (m_connectionState == CS_SERVER_HELLO_DONE)
                    {
                        m_tlsServer.ProcessClientSupplementalData(null);
                    }
                    if (m_connectionState != CS_CLIENT_CERTIFICATE)
                    {
                        if (null == m_certificateRequest)
                        {
                            m_keyExchange.SkipClientCredentials();
                        }
                        else if (TlsUtilities.IsTlsV12(m_tlsServerContext))
                        {
                            /*
                             * RFC 5246 If no suitable certificate is available, the client MUST send a
                             * certificate message containing no certificates.
                             * 
                             * NOTE: In previous RFCs, this was SHOULD instead of MUST.
                             */
                            throw new TlsFatalAlert(AlertDescription.unexpected_message);
                        }
                        else if (TlsUtilities.IsSsl(m_tlsServerContext))
                        {
                            /*
                             * SSL 3.0 If the server has sent a certificate request Message, the client must
                             * send either the certificate message or a no_certificate alert.
                             */
                            throw new TlsFatalAlert(AlertDescription.unexpected_message);
                        }
                        else
                        {
                            NotifyClientCertificate(Certificate.EmptyChain);
                        }
                    }

                    ReceiveClientKeyExchangeMessage(buf);
                    this.m_connectionState = CS_CLIENT_KEY_EXCHANGE;
                    break;
                }
                default:
                    throw new TlsFatalAlert(AlertDescription.unexpected_message);
                }
                break;
            }
            case HandshakeType.certificate_verify:
            {
                switch (m_connectionState)
                {
                case CS_CLIENT_KEY_EXCHANGE:
                {
                    /*
                     * RFC 5246 7.4.8 This message is only sent following a client certificate that has
                     * signing capability (i.e., all certificates except those containing fixed
                     * Diffie-Hellman parameters).
                     */
                    if (!ExpectCertificateVerifyMessage())
                        throw new TlsFatalAlert(AlertDescription.unexpected_message);

                    ReceiveCertificateVerifyMessage(buf);
                    buf.UpdateHash(m_handshakeHash);
                    this.m_connectionState = CS_CLIENT_CERTIFICATE_VERIFY;
                    break;
                }
                default:
                    throw new TlsFatalAlert(AlertDescription.unexpected_message);
                }
                break;
            }
            case HandshakeType.finished:
            {
                switch (m_connectionState)
                {
                case CS_CLIENT_KEY_EXCHANGE:
                case CS_CLIENT_CERTIFICATE_VERIFY:
                {
                    if (m_connectionState != CS_CLIENT_CERTIFICATE_VERIFY)
                    {
                        if (ExpectCertificateVerifyMessage())
                            throw new TlsFatalAlert(AlertDescription.unexpected_message);
                    }

                    ProcessFinishedMessage(buf);
                    buf.UpdateHash(m_handshakeHash);
                    this.m_connectionState = CS_CLIENT_FINISHED;

                    if (m_expectSessionTicket)
                    {
                        /*
                         * TODO[new_session_ticket] Check the server-side rules regarding the session ID, since
                         * the client is going to ignore any session ID it received once it sees the
                         * new_session_ticket message.
                         */

                        SendNewSessionTicketMessage(m_tlsServer.GetNewSessionTicket());
                        this.m_connectionState = CS_SERVER_SESSION_TICKET;
                    }

                    SendChangeCipherSpec();
                    SendFinishedMessage();
                    this.m_connectionState = CS_SERVER_FINISHED;

                    CompleteHandshake();
                    break;
                }
                default:
                    throw new TlsFatalAlert(AlertDescription.unexpected_message);
                }
                break;
            }

            case HandshakeType.certificate_request:
            case HandshakeType.certificate_status:
            case HandshakeType.certificate_url:
            case HandshakeType.compressed_certificate:
            case HandshakeType.encrypted_extensions:
            case HandshakeType.end_of_early_data:
            case HandshakeType.hello_request:
            case HandshakeType.hello_verify_request:
            case HandshakeType.key_update:
            case HandshakeType.message_hash:
            case HandshakeType.new_session_ticket:
            case HandshakeType.server_hello:
            case HandshakeType.server_hello_done:
            case HandshakeType.server_key_exchange:
            default:
                throw new TlsFatalAlert(AlertDescription.unexpected_message);
            }
        }

        protected override void HandleAlertWarningMessage(short alertDescription)
        {
            /*
             * SSL 3.0 If the server has sent a certificate request Message, the client must send
             * either the certificate message or a no_certificate alert.
             */
            if (AlertDescription.no_certificate == alertDescription && null != m_certificateRequest
                && TlsUtilities.IsSsl(m_tlsServerContext))
            {
                switch (m_connectionState)
                {
                case CS_SERVER_HELLO_DONE:
                case CS_CLIENT_SUPPLEMENTAL_DATA:
                {
                    if (m_connectionState != CS_CLIENT_SUPPLEMENTAL_DATA)
                    {
                        m_tlsServer.ProcessClientSupplementalData(null);
                    }

                    NotifyClientCertificate(Certificate.EmptyChain);
                    this.m_connectionState = CS_CLIENT_CERTIFICATE;
                    return;
                }
                }
            }

            base.HandleAlertWarningMessage(alertDescription);
        }

        /// <exception cref="IOException"/>
        protected virtual void NotifyClientCertificate(Certificate clientCertificate)
        {
            if (null == m_certificateRequest)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            TlsUtilities.ProcessClientCertificate(m_tlsServerContext, clientCertificate, m_keyExchange, m_tlsServer);
        }

        /// <exception cref="IOException"/>
        protected virtual void Receive13ClientCertificate(MemoryStream buf)
        {
            // TODO[tls13] This currently just duplicates 'receiveCertificateMessage'

            if (null == m_certificateRequest)
                throw new TlsFatalAlert(AlertDescription.unexpected_message);

            Certificate.ParseOptions options = new Certificate.ParseOptions()
                .SetMaxChainLength(m_tlsServer.GetMaxCertificateChainLength());

            Certificate clientCertificate = Certificate.Parse(options, m_tlsServerContext, buf, null);

            AssertEmpty(buf);

            NotifyClientCertificate(clientCertificate);
        }

        /// <exception cref="IOException"/>
        protected void Receive13ClientCertificateVerify(MemoryStream buf)
        {
            Certificate clientCertificate = m_tlsServerContext.SecurityParameters.PeerCertificate;
            if (null == clientCertificate || clientCertificate.IsEmpty)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            CertificateVerify certificateVerify = CertificateVerify.Parse(m_tlsServerContext, buf);

            AssertEmpty(buf);

            TlsUtilities.Verify13CertificateVerifyClient(m_tlsServerContext, m_handshakeHash, certificateVerify);
        }

        /// <exception cref="IOException"/>
        protected virtual void Receive13ClientFinished(MemoryStream buf)
        {
            Process13FinishedMessage(buf);
        }

        /// <exception cref="IOException"/>
        protected virtual void ReceiveCertificateMessage(MemoryStream buf)
        {
            if (null == m_certificateRequest)
                throw new TlsFatalAlert(AlertDescription.unexpected_message);

            Certificate.ParseOptions options = new Certificate.ParseOptions()
                .SetMaxChainLength(m_tlsServer.GetMaxCertificateChainLength());

            Certificate clientCertificate = Certificate.Parse(options, m_tlsServerContext, buf, null);

            AssertEmpty(buf);

            NotifyClientCertificate(clientCertificate);
        }

        /// <exception cref="IOException"/>
        protected virtual void ReceiveCertificateVerifyMessage(MemoryStream buf)
        {
            DigitallySigned certificateVerify = DigitallySigned.Parse(m_tlsServerContext, buf);

            AssertEmpty(buf);

            TlsUtilities.VerifyCertificateVerifyClient(m_tlsServerContext, m_certificateRequest, certificateVerify,
                m_handshakeHash);

            m_handshakeHash.StopTracking();
        }

        /// <exception cref="IOException"/>
        protected virtual ClientHello ReceiveClientHelloMessage(MemoryStream buf)
        {
            return ClientHello.Parse(buf, null);
        }

        /// <exception cref="IOException"/>
        protected virtual void ReceiveClientKeyExchangeMessage(MemoryStream buf)
        {
            m_keyExchange.ProcessClientKeyExchange(buf);

            AssertEmpty(buf);

            bool isSsl = TlsUtilities.IsSsl(m_tlsServerContext);
            if (isSsl)
            {
                // NOTE: For SSLv3 (only), master_secret needed to calculate session hash
                EstablishMasterSecret(m_tlsServerContext, m_keyExchange);
            }

            m_tlsServerContext.SecurityParameters.m_sessionHash = TlsUtilities.GetCurrentPrfHash(m_handshakeHash);

            if (!isSsl)
            {
                // NOTE: For (D)TLS, session hash potentially needed for extended_master_secret
                EstablishMasterSecret(m_tlsServerContext, m_keyExchange);
            }

            m_recordStream.SetPendingCipher(TlsUtilities.InitCipher(m_tlsServerContext));

            if (!ExpectCertificateVerifyMessage())
            {
                m_handshakeHash.StopTracking();
            }
        }

        /// <exception cref="IOException"/>
        protected virtual void Send13EncryptedExtensionsMessage(IDictionary<int, byte[]> serverExtensions)
        {
            // TODO[tls13] Avoid extra copy; use placeholder to write opaque-16 data directly to message buffer

            byte[] extBytes = WriteExtensionsData(serverExtensions);

            HandshakeMessageOutput message = new HandshakeMessageOutput(HandshakeType.encrypted_extensions);
            TlsUtilities.WriteOpaque16(extBytes, message);
            message.Send(this);
        }

        /// <exception cref="IOException"/>
        protected virtual void Send13ServerHelloCoda(ServerHello serverHello, bool afterHelloRetryRequest)
        {
            SecurityParameters securityParameters = m_tlsServerContext.SecurityParameters;

            byte[] serverHelloTranscriptHash = TlsUtilities.GetCurrentPrfHash(m_handshakeHash);

            TlsUtilities.Establish13PhaseHandshake(m_tlsServerContext, serverHelloTranscriptHash, m_recordStream);

            m_recordStream.EnablePendingCipherWrite();
            m_recordStream.EnablePendingCipherRead(true);

            Send13EncryptedExtensionsMessage(m_serverExtensions);
            this.m_connectionState = CS_SERVER_ENCRYPTED_EXTENSIONS;

            if (m_selectedPsk13)
            {
                /*
                 * For PSK-only key exchange, there's no CertificateRequest, Certificate, CertificateVerify.
                 */
            }
            else
            {
                // CertificateRequest
                {
                    this.m_certificateRequest = m_tlsServer.GetCertificateRequest();
                    if (null != m_certificateRequest)
                    {
                        if (!m_certificateRequest.HasCertificateRequestContext(TlsUtilities.EmptyBytes))
                            throw new TlsFatalAlert(AlertDescription.internal_error);

                        TlsUtilities.EstablishServerSigAlgs(securityParameters, m_certificateRequest);

                        SendCertificateRequestMessage(m_certificateRequest);
                        this.m_connectionState = CS_SERVER_CERTIFICATE_REQUEST;
                    }
                }

                TlsCredentialedSigner serverCredentials = TlsUtilities.Establish13ServerCredentials(m_tlsServer);
                if (null == serverCredentials)
                    throw new TlsFatalAlert(AlertDescription.internal_error);

                // Certificate
                {
                    /*
                     * TODO[tls13] Note that we are expecting the TlsServer implementation to take care of
                     * e.g. adding optional "status_request" extension to each CertificateEntry.
                     */
                    /*
                     * No CertificateStatus message is sent; TLS 1.3 uses per-CertificateEntry
                     * "status_request" extension instead.
                     */

                    Certificate serverCertificate = serverCredentials.Certificate;
                    Send13CertificateMessage(serverCertificate);
                    securityParameters.m_tlsServerEndPoint = null;
                    this.m_connectionState = CS_SERVER_CERTIFICATE;
                }

                // CertificateVerify
                {
                    DigitallySigned certificateVerify = TlsUtilities.Generate13CertificateVerify(m_tlsServerContext,
                        serverCredentials, m_handshakeHash);
                    Send13CertificateVerifyMessage(certificateVerify);
                    this.m_connectionState = CS_CLIENT_CERTIFICATE_VERIFY;
                }
            }

            // Finished
            {
                Send13FinishedMessage();
                this.m_connectionState = CS_SERVER_FINISHED;
            }

            byte[] serverFinishedTranscriptHash = TlsUtilities.GetCurrentPrfHash(m_handshakeHash);

            TlsUtilities.Establish13PhaseApplication(m_tlsServerContext, serverFinishedTranscriptHash, m_recordStream);

            m_recordStream.EnablePendingCipherWrite();
        }

        /// <exception cref="IOException"/>
        protected virtual void SendCertificateRequestMessage(CertificateRequest certificateRequest)
        {
            HandshakeMessageOutput message = new HandshakeMessageOutput(HandshakeType.certificate_request);
            certificateRequest.Encode(m_tlsServerContext, message);
            message.Send(this);
        }

        /// <exception cref="IOException"/>
        protected virtual void SendCertificateStatusMessage(CertificateStatus certificateStatus)
        {
            HandshakeMessageOutput message = new HandshakeMessageOutput(HandshakeType.certificate_status);
            // TODO[tls13] Ensure this cannot happen for (D)TLS1.3+
            certificateStatus.Encode(message);
            message.Send(this);
        }

        /// <exception cref="IOException"/>
        protected virtual void SendHelloRequestMessage()
        {
            HandshakeMessageOutput.Send(this, HandshakeType.hello_request, TlsUtilities.EmptyBytes);
        }

        /// <exception cref="IOException"/>
        protected virtual void SendNewSessionTicketMessage(NewSessionTicket newSessionTicket)
        {
            if (newSessionTicket == null)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            HandshakeMessageOutput message = new HandshakeMessageOutput(HandshakeType.new_session_ticket);
            newSessionTicket.Encode(message);
            message.Send(this);
        }

        /// <exception cref="IOException"/>
        protected virtual void SendServerHelloDoneMessage()
        {
            HandshakeMessageOutput.Send(this, HandshakeType.server_hello_done, TlsUtilities.EmptyBytes);
        }

        /// <exception cref="IOException"/>
        protected virtual void SendServerHelloMessage(ServerHello serverHello)
        {
            HandshakeMessageOutput message = new HandshakeMessageOutput(HandshakeType.server_hello);
            serverHello.Encode(m_tlsServerContext, message);
            message.Send(this);
        }

        /// <exception cref="IOException"/>
        protected virtual void SendServerKeyExchangeMessage(byte[] serverKeyExchange)
        {
            HandshakeMessageOutput.Send(this, HandshakeType.server_key_exchange, serverKeyExchange);
        }

        /// <exception cref="IOException"/>
        protected virtual void Skip13ClientCertificate()
        {
            if (null != m_certificateRequest)
                throw new TlsFatalAlert(AlertDescription.unexpected_message);
        }

        /// <exception cref="IOException"/>
        protected virtual void Skip13ClientCertificateVerify()
        {
            if (ExpectCertificateVerifyMessage())
                throw new TlsFatalAlert(AlertDescription.unexpected_message);
        }
    }
}
