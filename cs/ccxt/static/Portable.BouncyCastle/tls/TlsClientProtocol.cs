using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Tls.Crypto;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Tls
{
    public class TlsClientProtocol
        : TlsProtocol
    {
        protected TlsClient m_tlsClient = null;
        internal TlsClientContextImpl m_tlsClientContext = null;

        protected IDictionary<int, TlsAgreement> m_clientAgreements = null;
        internal OfferedPsks.BindersConfig m_clientBinders = null;
        protected ClientHello m_clientHello = null;
        protected TlsKeyExchange m_keyExchange = null;
        protected TlsAuthentication m_authentication = null;

        protected CertificateStatus m_certificateStatus = null;
        protected CertificateRequest m_certificateRequest = null;

        /// <summary>Constructor for non-blocking mode.</summary>
        /// <remarks>
        /// When data is received, use <see cref="TlsProtocol.OfferInput(byte[])"/> to provide the received ciphertext,
        /// then use <see cref="TlsProtocol.ReadInput(byte[],int,int)"/> to read the corresponding cleartext.<br/><br/>
        /// Similarly, when data needs to be sent, use <see cref="TlsProtocol.WriteApplicationData(byte[],int,int)"/>
        /// to provide the cleartext, then use <see cref="TlsProtocol.ReadOutput(byte[],int,int)"/> to get the
        /// corresponding ciphertext.
        /// </remarks>
        public TlsClientProtocol()
            : base()
        {
        }

        /// <summary>Constructor for blocking mode.</summary>
        /// <param name="stream">The <see cref="Stream"/> of data to/from the server.</param>
        public TlsClientProtocol(Stream stream)
            : base(stream)
        {
        }

        /// <summary>Constructor for blocking mode.</summary>
        /// <param name="input">The <see cref="Stream"/> of data from the server.</param>
        /// <param name="output">The <see cref="Stream"/> of data to the server.</param>
        public TlsClientProtocol(Stream input, Stream output)
            : base(input, output)
        {
        }

        /// <summary>Initiates a TLS handshake in the role of client.</summary>
        /// <remarks>
        /// In blocking mode, this will not return until the handshake is complete. In non-blocking mode, use
        /// <see cref="TlsPeer.NotifyHandshakeComplete"/> to receive a callback when the handshake is complete.
        /// </remarks>
        /// <param name="tlsClient">The <see cref="TlsClient"/> to use for the handshake.</param>
        /// <exception cref="IOException">If in blocking mode and handshake was not successful.</exception>
        public virtual void Connect(TlsClient tlsClient)
        {
            if (tlsClient == null)
                throw new ArgumentNullException("tlsClient");
            if (m_tlsClient != null)
                throw new InvalidOperationException("'Connect' can only be called once");

            this.m_tlsClient = tlsClient;
            this.m_tlsClientContext = new TlsClientContextImpl(tlsClient.Crypto);

            tlsClient.Init(m_tlsClientContext);
            tlsClient.NotifyCloseHandle(this);

            BeginHandshake();

            if (m_blocking)
            {
                BlockForHandshake();
            }
        }

        protected override void BeginHandshake()
        {
            base.BeginHandshake();

            SendClientHello();
            this.m_connectionState = CS_CLIENT_HELLO;
        }

        protected override void CleanupHandshake()
        {
            base.CleanupHandshake();

            this.m_clientAgreements = null;
            this.m_clientBinders = null;
            this.m_clientHello = null;
            this.m_keyExchange = null;
            this.m_authentication = null;

            this.m_certificateStatus = null;
            this.m_certificateRequest = null;
        }

        protected override TlsContext Context
        {
            get { return m_tlsClientContext; }
        }

        internal override AbstractTlsContext ContextAdmin
        {
            get { return m_tlsClientContext; }
        }

        protected override TlsPeer Peer
        {
            get { return m_tlsClient; }
        }

        /// <exception cref="IOException"/>
        protected virtual void Handle13HandshakeMessage(short type, HandshakeMessageInput buf)
        {
            if (!IsTlsV13ConnectionState())
                throw new TlsFatalAlert(AlertDescription.internal_error);

            switch (type)
            {
            case HandshakeType.certificate:
            {
                switch (m_connectionState)
                {
                case CS_SERVER_ENCRYPTED_EXTENSIONS:
                case CS_SERVER_CERTIFICATE_REQUEST:
                {
                    if (m_connectionState != CS_SERVER_CERTIFICATE_REQUEST)
                    {
                        Skip13CertificateRequest();
                    }

                    Receive13ServerCertificate(buf);
                    this.m_connectionState = CS_SERVER_CERTIFICATE;
                    break;
                }
                default:
                    throw new TlsFatalAlert(AlertDescription.unexpected_message);
                }
                break;
            }
            case HandshakeType.certificate_request:
            {
                switch (m_connectionState)
                {
                case CS_END:
                {
                    // TODO[tls13] Permit post-handshake authentication if we sent post_handshake_auth extension
                    throw new TlsFatalAlert(AlertDescription.unexpected_message);
                }
                case CS_SERVER_ENCRYPTED_EXTENSIONS:
                {
                    Receive13CertificateRequest(buf, false);
                    this.m_connectionState = CS_SERVER_CERTIFICATE_REQUEST;
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
                case CS_SERVER_CERTIFICATE:
                {
                    Receive13ServerCertificateVerify(buf);
                    buf.UpdateHash(m_handshakeHash);
                    this.m_connectionState = CS_SERVER_CERTIFICATE_VERIFY;
                    break;
                }
                default:
                    throw new TlsFatalAlert(AlertDescription.unexpected_message);
                }
                break;
            }
            case HandshakeType.encrypted_extensions:
            {
                switch (m_connectionState)
                {
                case CS_SERVER_HELLO:
                {
                    Receive13EncryptedExtensions(buf);
                    this.m_connectionState = CS_SERVER_ENCRYPTED_EXTENSIONS;
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
                case CS_SERVER_ENCRYPTED_EXTENSIONS:
                case CS_SERVER_CERTIFICATE_REQUEST:
                case CS_SERVER_CERTIFICATE_VERIFY:
                {
                    if (m_connectionState == CS_SERVER_ENCRYPTED_EXTENSIONS)
                    {
                        Skip13CertificateRequest();
                    }
                    if (m_connectionState != CS_SERVER_CERTIFICATE_VERIFY)
                    {
                        Skip13ServerCertificate();
                    }

                    Receive13ServerFinished(buf);
                    buf.UpdateHash(m_handshakeHash);
                    this.m_connectionState = CS_SERVER_FINISHED;

                    byte[] serverFinishedTranscriptHash = TlsUtilities.GetCurrentPrfHash(m_handshakeHash);

                    // See RFC 8446 D.4.
                    m_recordStream.SetIgnoreChangeCipherSpec(false);

                    /*
                     * TODO[tls13] After receiving the server's Finished message, if the server has accepted early
                     * data, an EndOfEarlyData message will be sent to indicate the key change. This message will
                     * be encrypted with the 0-RTT traffic keys.
                     */

                    if (null != m_certificateRequest)
                    {
                        TlsCredentialedSigner clientCredentials = TlsUtilities.Establish13ClientCredentials(
                            m_authentication, m_certificateRequest);

                        Certificate clientCertificate = null;
                        if (null != clientCredentials)
                        {
                            clientCertificate = clientCredentials.Certificate;
                        }

                        if (null == clientCertificate)
                        {
                            // In this calling context, certificate_request_context is length 0
                            clientCertificate = Certificate.EmptyChainTls13;
                        }

                        Send13CertificateMessage(clientCertificate);
                        this.m_connectionState = CS_CLIENT_CERTIFICATE;

                        if (null != clientCredentials)
                        {
                            DigitallySigned certificateVerify = TlsUtilities.Generate13CertificateVerify(
                                m_tlsClientContext, clientCredentials, m_handshakeHash);
                            Send13CertificateVerifyMessage(certificateVerify);
                            this.m_connectionState = CS_CLIENT_CERTIFICATE_VERIFY;
                        }
                    }

                    Send13FinishedMessage();
                    this.m_connectionState = CS_CLIENT_FINISHED;

                    TlsUtilities.Establish13PhaseApplication(m_tlsClientContext, serverFinishedTranscriptHash,
                        m_recordStream);

                    m_recordStream.EnablePendingCipherWrite();
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
            case HandshakeType.new_session_ticket:
            {
                Receive13NewSessionTicket(buf);
                break;
            }
            case HandshakeType.server_hello:
            {
                switch (m_connectionState)
                {
                case CS_CLIENT_HELLO:
                {
                    // NOTE: Legacy handler should be dispatching initial ServerHello/HelloRetryRequest.
                    throw new TlsFatalAlert(AlertDescription.internal_error);
                }
                case CS_CLIENT_HELLO_RETRY:
                {
                    ServerHello serverHello = ReceiveServerHelloMessage(buf);
                    if (serverHello.IsHelloRetryRequest())
                        throw new TlsFatalAlert(AlertDescription.unexpected_message);

                    Process13ServerHello(serverHello, true);
                    buf.UpdateHash(m_handshakeHash);
                    this.m_connectionState = CS_SERVER_HELLO;

                    Process13ServerHelloCoda(serverHello, true);
                    break;
                }
                default:
                    throw new TlsFatalAlert(AlertDescription.unexpected_message);
                }
                break;
            }

            case HandshakeType.certificate_status:
            case HandshakeType.certificate_url:
            case HandshakeType.client_hello:
            case HandshakeType.client_key_exchange:
            case HandshakeType.compressed_certificate:
            case HandshakeType.end_of_early_data:
            case HandshakeType.hello_request:
            case HandshakeType.hello_verify_request:
            case HandshakeType.message_hash:
            case HandshakeType.server_hello_done:
            case HandshakeType.server_key_exchange:
            case HandshakeType.supplemental_data:
            default:
                throw new TlsFatalAlert(AlertDescription.unexpected_message);
            }
        }

        protected override void HandleHandshakeMessage(short type, HandshakeMessageInput buf)
        {
            SecurityParameters securityParameters = m_tlsClientContext.SecurityParameters;

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
                if (type != HandshakeType.finished || m_connectionState != CS_SERVER_HELLO)
                    throw new TlsFatalAlert(AlertDescription.unexpected_message);

                ProcessFinishedMessage(buf);
                buf.UpdateHash(m_handshakeHash);
                this.m_connectionState = CS_SERVER_FINISHED;

                SendChangeCipherSpec();
                SendFinishedMessage();
                this.m_connectionState = CS_CLIENT_FINISHED;

                CompleteHandshake();
                return;
            }

            switch (type)
            {
            case HandshakeType.certificate:
            {
                switch (m_connectionState)
                {
                case CS_SERVER_HELLO:
                case CS_SERVER_SUPPLEMENTAL_DATA:
                {
                    if (m_connectionState != CS_SERVER_SUPPLEMENTAL_DATA)
                    {
                        HandleSupplementalData(null);
                    }

                    /*
                     * NOTE: Certificate processing (including authentication) is delayed to allow for a
                     * possible CertificateStatus message.
                     */
                    this.m_authentication = TlsUtilities.ReceiveServerCertificate(m_tlsClientContext, m_tlsClient,
                        buf);
                    break;
                }
                default:
                    throw new TlsFatalAlert(AlertDescription.unexpected_message);
                }

                this.m_connectionState = CS_SERVER_CERTIFICATE;
                break;
            }
            case HandshakeType.certificate_status:
            {
                switch (m_connectionState)
                {
                case CS_SERVER_CERTIFICATE:
                {
                    if (securityParameters.StatusRequestVersion < 1)
                        throw new TlsFatalAlert(AlertDescription.unexpected_message);

                    this.m_certificateStatus = CertificateStatus.Parse(m_tlsClientContext, buf);

                    AssertEmpty(buf);

                    this.m_connectionState = CS_SERVER_CERTIFICATE_STATUS;
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
                case CS_CLIENT_FINISHED:
                case CS_SERVER_SESSION_TICKET:
                {
                    if (m_connectionState != CS_SERVER_SESSION_TICKET)
                    {
                        /*
                         * RFC 5077 3.3. This message MUST be sent if the server included a
                         * SessionTicket extension in the ServerHello.
                         */
                        if (m_expectSessionTicket)
                            throw new TlsFatalAlert(AlertDescription.unexpected_message);
                    }

                    ProcessFinishedMessage(buf);
                    this.m_connectionState = CS_SERVER_FINISHED;

                    CompleteHandshake();
                    break;
                }
                default:
                    throw new TlsFatalAlert(AlertDescription.unexpected_message);
                }
                break;
            }
            case HandshakeType.server_hello:
            {
                switch (m_connectionState)
                {
                case CS_CLIENT_HELLO:
                {
                    ServerHello serverHello = ReceiveServerHelloMessage(buf);

                    // TODO[tls13] Only treat as HRR if it's TLS 1.3??
                    if (serverHello.IsHelloRetryRequest())
                    {
                        Process13HelloRetryRequest(serverHello);
                        m_handshakeHash.NotifyPrfDetermined();
                        m_handshakeHash.SealHashAlgorithms();
                        TlsUtilities.AdjustTranscriptForRetry(m_handshakeHash);
                        buf.UpdateHash(m_handshakeHash);
                        this.m_connectionState = CS_SERVER_HELLO_RETRY_REQUEST;

                        Send13ClientHelloRetry();
                        this.m_connectionState = CS_CLIENT_HELLO_RETRY;
                    }
                    else
                    {
                        ProcessServerHello(serverHello);
                        m_handshakeHash.NotifyPrfDetermined();
                        if (TlsUtilities.IsTlsV13(securityParameters.NegotiatedVersion))
                        {
                            m_handshakeHash.SealHashAlgorithms();
                        }
                        buf.UpdateHash(m_handshakeHash);
                        this.m_connectionState = CS_SERVER_HELLO;

                        if (TlsUtilities.IsTlsV13(securityParameters.NegotiatedVersion))
                        {
                            Process13ServerHelloCoda(serverHello, false);
                        }
                    }

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
                case CS_SERVER_HELLO:
                {
                    HandleSupplementalData(ReadSupplementalDataMessage(buf));
                    break;
                }
                default:
                    throw new TlsFatalAlert(AlertDescription.unexpected_message);
                }
                break;
            }
            case HandshakeType.server_hello_done:
            {
                switch (m_connectionState)
                {
                case CS_SERVER_HELLO:
                case CS_SERVER_SUPPLEMENTAL_DATA:
                case CS_SERVER_CERTIFICATE:
                case CS_SERVER_CERTIFICATE_STATUS:
                case CS_SERVER_KEY_EXCHANGE:
                case CS_SERVER_CERTIFICATE_REQUEST:
                {
                    if (m_connectionState == CS_SERVER_HELLO)
                    {
                        HandleSupplementalData(null);
                    }
                    if (m_connectionState == CS_SERVER_HELLO ||
                        m_connectionState == CS_SERVER_SUPPLEMENTAL_DATA)
                    {
                        this.m_authentication = null;
                    }
                    if (m_connectionState != CS_SERVER_KEY_EXCHANGE &&
                        m_connectionState != CS_SERVER_CERTIFICATE_REQUEST)
                    {
                        HandleServerCertificate();

                        // There was no server key exchange message; check it's OK
                        m_keyExchange.SkipServerKeyExchange();
                    }

                    AssertEmpty(buf);

                    this.m_connectionState = CS_SERVER_HELLO_DONE;

                    TlsCredentials clientAuthCredentials = null;
                    TlsCredentialedSigner clientAuthSigner = null;
                    Certificate clientAuthCertificate = null;
                    SignatureAndHashAlgorithm clientAuthAlgorithm = null;
                    TlsStreamSigner clientAuthStreamSigner = null;

                    if (m_certificateRequest != null)
                    {
                        clientAuthCredentials = TlsUtilities.EstablishClientCredentials(m_authentication,
                            m_certificateRequest);
                        if (clientAuthCredentials != null)
                        {
                            clientAuthCertificate = clientAuthCredentials.Certificate;

                            if (clientAuthCredentials is TlsCredentialedSigner)
                            {
                                clientAuthSigner = (TlsCredentialedSigner)clientAuthCredentials;
                                clientAuthAlgorithm = TlsUtilities.GetSignatureAndHashAlgorithm(
                                    securityParameters.NegotiatedVersion, clientAuthSigner);
                                clientAuthStreamSigner = clientAuthSigner.GetStreamSigner();

                                if (ProtocolVersion.TLSv12.Equals(securityParameters.NegotiatedVersion))
                                {
                                    TlsUtilities.VerifySupportedSignatureAlgorithm(securityParameters.ServerSigAlgs,
                                        clientAuthAlgorithm, AlertDescription.internal_error);

                                    if (clientAuthStreamSigner == null)
                                    {
                                        TlsUtilities.TrackHashAlgorithmClient(m_handshakeHash, clientAuthAlgorithm);
                                    }
                                }

                                if (clientAuthStreamSigner != null)
                                {
                                    m_handshakeHash.ForceBuffering();
                                }
                            }
                        }
                    }

                    m_handshakeHash.SealHashAlgorithms();

                    if (clientAuthCredentials == null)
                    {
                        m_keyExchange.SkipClientCredentials();
                    }
                    else
                    {
                        m_keyExchange.ProcessClientCredentials(clientAuthCredentials);                    
                    }

                    var clientSupplementalData = m_tlsClient.GetClientSupplementalData();
                    if (clientSupplementalData != null)
                    {
                        SendSupplementalDataMessage(clientSupplementalData);
                        this.m_connectionState = CS_CLIENT_SUPPLEMENTAL_DATA;
                    }

                    if (m_certificateRequest != null)
                    {
                        SendCertificateMessage(clientAuthCertificate, null);
                        this.m_connectionState = CS_CLIENT_CERTIFICATE;                    
                    }

                    SendClientKeyExchange();
                    this.m_connectionState = CS_CLIENT_KEY_EXCHANGE;

                    bool isSsl = TlsUtilities.IsSsl(m_tlsClientContext);
                    if (isSsl)
                    {
                        // NOTE: For SSLv3 (only), master_secret needed to calculate session hash
                        EstablishMasterSecret(m_tlsClientContext, m_keyExchange);
                    }

                    securityParameters.m_sessionHash = TlsUtilities.GetCurrentPrfHash(m_handshakeHash);

                    if (!isSsl)
                    {
                        // NOTE: For (D)TLS, session hash potentially needed for extended_master_secret
                        EstablishMasterSecret(m_tlsClientContext, m_keyExchange);
                    }

                    m_recordStream.SetPendingCipher(TlsUtilities.InitCipher(m_tlsClientContext));

                    if (clientAuthSigner != null)
                    {
                        DigitallySigned certificateVerify = TlsUtilities.GenerateCertificateVerifyClient(
                            m_tlsClientContext, clientAuthSigner, clientAuthAlgorithm, clientAuthStreamSigner,
                            m_handshakeHash);
                        SendCertificateVerifyMessage(certificateVerify);
                        this.m_connectionState = CS_CLIENT_CERTIFICATE_VERIFY;
                    }

                    m_handshakeHash.StopTracking();

                    SendChangeCipherSpec();
                    SendFinishedMessage();
                    break;
                }
                default:
                    throw new TlsFatalAlert(AlertDescription.unexpected_message);
                }

                this.m_connectionState = CS_CLIENT_FINISHED;
                break;
            }
            case HandshakeType.server_key_exchange:
            {
                switch (m_connectionState)
                {
                case CS_SERVER_HELLO:
                case CS_SERVER_SUPPLEMENTAL_DATA:
                case CS_SERVER_CERTIFICATE:
                case CS_SERVER_CERTIFICATE_STATUS:
                {
                    if (m_connectionState == CS_SERVER_HELLO)
                    {
                        HandleSupplementalData(null);
                    }
                    if (m_connectionState != CS_SERVER_CERTIFICATE &&
                        m_connectionState != CS_SERVER_CERTIFICATE_STATUS)
                    {
                        this.m_authentication = null;
                    }

                    HandleServerCertificate();

                    m_keyExchange.ProcessServerKeyExchange(buf);

                    AssertEmpty(buf);
                    break;
                }
                default:
                    throw new TlsFatalAlert(AlertDescription.unexpected_message);
                }

                this.m_connectionState = CS_SERVER_KEY_EXCHANGE;
                break;
            }
            case HandshakeType.certificate_request:
            {
                switch (m_connectionState)
                {
                case CS_SERVER_CERTIFICATE:
                case CS_SERVER_CERTIFICATE_STATUS:
                case CS_SERVER_KEY_EXCHANGE:
                {
                    if (m_connectionState != CS_SERVER_KEY_EXCHANGE)
                    {
                        HandleServerCertificate();

                        // There was no server key exchange message; check it's OK
                        m_keyExchange.SkipServerKeyExchange();
                    }

                    ReceiveCertificateRequest(buf);

                    TlsUtilities.EstablishServerSigAlgs(securityParameters, m_certificateRequest);
                    break;
                }
                default:
                    throw new TlsFatalAlert(AlertDescription.unexpected_message);
                }

                this.m_connectionState = CS_SERVER_CERTIFICATE_REQUEST;
                break;
            }
            case HandshakeType.new_session_ticket:
            {
                switch (m_connectionState)
                {
                case CS_CLIENT_FINISHED:
                {
                    if (!m_expectSessionTicket)
                    {
                        /*
                         * RFC 5077 3.3. This message MUST NOT be sent if the server did not include a
                         * SessionTicket extension in the ServerHello.
                         */
                        throw new TlsFatalAlert(AlertDescription.unexpected_message);
                    }

                    /*
                     * RFC 5077 3.4. If the client receives a session ticket from the server, then it
                     * discards any Session ID that was sent in the ServerHello.
                     */
                    securityParameters.m_sessionID = TlsUtilities.EmptyBytes;
                    InvalidateSession();
                    this.m_tlsSession = TlsUtilities.ImportSession(securityParameters.SessionID, null);

                    ReceiveNewSessionTicket(buf);
                    break;
                }
                default:
                    throw new TlsFatalAlert(AlertDescription.unexpected_message);
                }

                this.m_connectionState = CS_SERVER_SESSION_TICKET;
                break;
            }
            case HandshakeType.hello_request:
            {
                AssertEmpty(buf);

                /*
                 * RFC 2246 7.4.1.1 Hello request This message will be ignored by the client if the
                 * client is currently negotiating a session. This message may be ignored by the client
                 * if it does not wish to renegotiate a session, or the client may, if it wishes,
                 * respond with a no_renegotiation alert.
                 */
                if (IsApplicationDataReady)
                {
                    RefuseRenegotiation();
                }
                break;
            }

            case HandshakeType.certificate_url:
            case HandshakeType.certificate_verify:
            case HandshakeType.client_hello:
            case HandshakeType.client_key_exchange:
            case HandshakeType.compressed_certificate:
            case HandshakeType.encrypted_extensions:
            case HandshakeType.end_of_early_data:
            case HandshakeType.hello_verify_request:
            case HandshakeType.key_update:
            case HandshakeType.message_hash:
            default:
                throw new TlsFatalAlert(AlertDescription.unexpected_message);
            }
        }

        /// <exception cref="IOException"/>
        protected virtual void HandleServerCertificate()
        {
            TlsUtilities.ProcessServerCertificate(m_tlsClientContext, m_certificateStatus, m_keyExchange,
                m_authentication, m_clientExtensions, m_serverExtensions);
        }

        /// <exception cref="IOException"/>
        protected virtual void HandleSupplementalData(IList<SupplementalDataEntry> serverSupplementalData)
        {
            m_tlsClient.ProcessServerSupplementalData(serverSupplementalData);
            this.m_connectionState = CS_SERVER_SUPPLEMENTAL_DATA;

            this.m_keyExchange = TlsUtilities.InitKeyExchangeClient(m_tlsClientContext, m_tlsClient);
        }

        /// <exception cref="IOException"/>
        protected virtual void Process13HelloRetryRequest(ServerHello helloRetryRequest)
        {
            ProtocolVersion legacy_record_version = ProtocolVersion.TLSv12;
            m_recordStream.SetWriteVersion(legacy_record_version);

            SecurityParameters securityParameters = m_tlsClientContext.SecurityParameters;

            /*
             * RFC 8446 4.1.4. Upon receipt of a HelloRetryRequest, the client MUST check the
             * legacy_version, legacy_session_id_echo, cipher_suite, and legacy_compression_method as
             * specified in Section 4.1.3 and then process the extensions, starting with determining the
             * version using "supported_versions".
             */
            ProtocolVersion legacy_version = helloRetryRequest.Version;
            byte[] legacy_session_id_echo = helloRetryRequest.SessionID;
            int cipherSuite = helloRetryRequest.CipherSuite;
            // NOTE: legacy_compression_method checked during ServerHello parsing

            if (!ProtocolVersion.TLSv12.Equals(legacy_version) ||
                !Arrays.AreEqual(m_clientHello.SessionID, legacy_session_id_echo) ||
                !TlsUtilities.IsValidCipherSuiteSelection(m_clientHello.CipherSuites, cipherSuite))
            {
                throw new TlsFatalAlert(AlertDescription.illegal_parameter);
            }

            var extensions = helloRetryRequest.Extensions;
            if (null == extensions)
                throw new TlsFatalAlert(AlertDescription.illegal_parameter);

            TlsUtilities.CheckExtensionData13(extensions, HandshakeType.hello_retry_request,
                AlertDescription.illegal_parameter);

            {
                /*
                 * RFC 8446 4.2. Implementations MUST NOT send extension responses if the remote
                 * endpoint did not send the corresponding extension requests, with the exception of the
                 * "cookie" extension in the HelloRetryRequest. Upon receiving such an extension, an
                 * endpoint MUST abort the handshake with an "unsupported_extension" alert.
                 */
                foreach (int extType in extensions.Keys)
                {
                    if (ExtensionType.cookie == extType)
                        continue;

                    if (null == TlsUtilities.GetExtensionData(m_clientExtensions, extType))
                        throw new TlsFatalAlert(AlertDescription.unsupported_extension);
                }
            }

            ProtocolVersion server_version = TlsExtensionsUtilities.GetSupportedVersionsExtensionServer(extensions);
            if (null == server_version)
                throw new TlsFatalAlert(AlertDescription.missing_extension);

            if (!ProtocolVersion.TLSv13.IsEqualOrEarlierVersionOf(server_version) ||
                !ProtocolVersion.Contains(m_tlsClientContext.ClientSupportedVersions, server_version) ||
                !TlsUtilities.IsValidVersionForCipherSuite(cipherSuite, server_version))
            {
                throw new TlsFatalAlert(AlertDescription.illegal_parameter);
            }

            if (null != m_clientBinders)
            {
                if (!Arrays.Contains(m_clientBinders.m_pskKeyExchangeModes, PskKeyExchangeMode.psk_dhe_ke))
                {
                    this.m_clientBinders = null;

                    m_tlsClient.NotifySelectedPsk(null);
                }
            }

            /*
             * RFC 8446 4.2.8. Upon receipt of this [Key Share] extension in a HelloRetryRequest, the
             * client MUST verify that (1) the selected_group field corresponds to a group which was
             * provided in the "supported_groups" extension in the original ClientHello and (2) the
             * selected_group field does not correspond to a group which was provided in the "key_share"
             * extension in the original ClientHello. If either of these checks fails, then the client
             * MUST abort the handshake with an "illegal_parameter" alert.
             */
            int selected_group = TlsExtensionsUtilities.GetKeyShareHelloRetryRequest(extensions);

            if (!TlsUtilities.IsValidKeyShareSelection(server_version, securityParameters.ClientSupportedGroups,
                m_clientAgreements, selected_group))
            {
                throw new TlsFatalAlert(AlertDescription.illegal_parameter);
            }

            byte[] cookie = TlsExtensionsUtilities.GetCookieExtension(extensions);



            securityParameters.m_negotiatedVersion = server_version;
            TlsUtilities.NegotiatedVersionTlsClient(m_tlsClientContext, m_tlsClient);

            securityParameters.m_resumedSession = false;
            securityParameters.m_sessionID = TlsUtilities.EmptyBytes;
            m_tlsClient.NotifySessionID(TlsUtilities.EmptyBytes);

            TlsUtilities.NegotiatedCipherSuite(securityParameters, cipherSuite);
            m_tlsClient.NotifySelectedCipherSuite(cipherSuite);

            this.m_clientAgreements = null;
            this.m_retryCookie = cookie;
            this.m_retryGroup = selected_group;
        }

        /// <exception cref="IOException"/>
        protected virtual void Process13ServerHello(ServerHello serverHello, bool afterHelloRetryRequest)
        {
            SecurityParameters securityParameters = m_tlsClientContext.SecurityParameters;

            ProtocolVersion legacy_version = serverHello.Version;
            byte[] legacy_session_id_echo = serverHello.SessionID;
            int cipherSuite = serverHello.CipherSuite;
            // NOTE: legacy_compression_method checked during ServerHello parsing

            if (!ProtocolVersion.TLSv12.Equals(legacy_version) ||
                !Arrays.AreEqual(m_clientHello.SessionID, legacy_session_id_echo))
            {
                throw new TlsFatalAlert(AlertDescription.illegal_parameter);
            }

            var extensions = serverHello.Extensions;
            if (null == extensions)
                throw new TlsFatalAlert(AlertDescription.illegal_parameter);

            TlsUtilities.CheckExtensionData13(extensions, HandshakeType.server_hello,
                AlertDescription.illegal_parameter);

            if (afterHelloRetryRequest)
            {
                ProtocolVersion server_version = TlsExtensionsUtilities.GetSupportedVersionsExtensionServer(extensions);
                if (null == server_version)
                    throw new TlsFatalAlert(AlertDescription.missing_extension);

                if (!securityParameters.NegotiatedVersion.Equals(server_version) ||
                    securityParameters.CipherSuite != cipherSuite)
                {
                    throw new TlsFatalAlert(AlertDescription.illegal_parameter);
                }
            }
            else
            {
                if (!TlsUtilities.IsValidCipherSuiteSelection(m_clientHello.CipherSuites, cipherSuite) ||
                    !TlsUtilities.IsValidVersionForCipherSuite(cipherSuite, securityParameters.NegotiatedVersion))
                {
                    throw new TlsFatalAlert(AlertDescription.illegal_parameter);
                }

                securityParameters.m_resumedSession = false;
                securityParameters.m_sessionID = TlsUtilities.EmptyBytes;
                m_tlsClient.NotifySessionID(TlsUtilities.EmptyBytes);

                TlsUtilities.NegotiatedCipherSuite(securityParameters, cipherSuite);
                m_tlsClient.NotifySelectedCipherSuite(cipherSuite);
            }

            this.m_clientHello = null;

            // NOTE: Apparently downgrade marker mechanism not used for TLS 1.3+?
            securityParameters.m_serverRandom = serverHello.Random;

            securityParameters.m_secureRenegotiation = false;

            /*
             * RFC 8446 Appendix D. Because TLS 1.3 always hashes in the transcript up to the server
             * Finished, implementations which support both TLS 1.3 and earlier versions SHOULD indicate
             * the use of the Extended Master Secret extension in their APIs whenever TLS 1.3 is used.
             */
            securityParameters.m_extendedMasterSecret = true;

            /*
             * TODO[tls13] RFC 8446 4.4.2.1. OCSP Status and SCT Extensions.
             * 
             * OCSP information is carried in an extension for a CertificateEntry.
             */
            securityParameters.m_statusRequestVersion =
                m_clientExtensions.ContainsKey(ExtensionType.status_request) ? 1 : 0;

            TlsSecret pskEarlySecret = null;
            {
                int selected_identity = TlsExtensionsUtilities.GetPreSharedKeyServerHello(extensions);
                TlsPsk selectedPsk = null;

                if (selected_identity >= 0)
                {
                    if (null == m_clientBinders || selected_identity >= m_clientBinders.m_psks.Length)
                        throw new TlsFatalAlert(AlertDescription.illegal_parameter);

                    selectedPsk = m_clientBinders.m_psks[selected_identity];
                    if (selectedPsk.PrfAlgorithm != securityParameters.PrfAlgorithm)
                        throw new TlsFatalAlert(AlertDescription.illegal_parameter);

                    pskEarlySecret = m_clientBinders.m_earlySecrets[selected_identity];

                    this.m_selectedPsk13 = true;
                }

                m_tlsClient.NotifySelectedPsk(selectedPsk);
            }

            TlsSecret sharedSecret = null;
            {
                KeyShareEntry keyShareEntry = TlsExtensionsUtilities.GetKeyShareServerHello(extensions);
                if (null == keyShareEntry)
                {
                    if (afterHelloRetryRequest
                        || null == pskEarlySecret
                        || !Arrays.Contains(m_clientBinders.m_pskKeyExchangeModes, PskKeyExchangeMode.psk_ke))
                    {
                        throw new TlsFatalAlert(AlertDescription.illegal_parameter);
                    }
                }
                else
                {
                    if (null != pskEarlySecret
                        && !Arrays.Contains(m_clientBinders.m_pskKeyExchangeModes, PskKeyExchangeMode.psk_dhe_ke))
                    {
                        throw new TlsFatalAlert(AlertDescription.illegal_parameter);
                    }

                    TlsAgreement agreement = (TlsAgreement)m_clientAgreements[keyShareEntry.NamedGroup];
                    if (null == agreement)
                        throw new TlsFatalAlert(AlertDescription.illegal_parameter);

                    agreement.ReceivePeerValue(keyShareEntry.KeyExchange);
                    sharedSecret = agreement.CalculateSecret();
                }
            }

            this.m_clientAgreements = null;
            this.m_clientBinders = null;

            TlsUtilities.Establish13PhaseSecrets(m_tlsClientContext, pskEarlySecret, sharedSecret);

            InvalidateSession();
            this.m_tlsSession = TlsUtilities.ImportSession(securityParameters.SessionID, null);
        }

        /// <exception cref="IOException"/>
        protected virtual void Process13ServerHelloCoda(ServerHello serverHello, bool afterHelloRetryRequest)
        {
            byte[] serverHelloTranscriptHash = TlsUtilities.GetCurrentPrfHash(m_handshakeHash);

            TlsUtilities.Establish13PhaseHandshake(m_tlsClientContext, serverHelloTranscriptHash, m_recordStream);

            // See RFC 8446 D.4.
            if (!afterHelloRetryRequest)
            {
                m_recordStream.SetIgnoreChangeCipherSpec(true);

                /*
                 * TODO[tls13] If offering early_data, the record is placed immediately after the first
                 * ClientHello.
                 */
                /*
                 * TODO[tls13] Ideally wait until just after Server Finished received, but then we'd need to defer
                 * the enabling of the pending write cipher
                 */
                SendChangeCipherSpecMessage();
            }

            m_recordStream.EnablePendingCipherWrite();
            m_recordStream.EnablePendingCipherRead(false);
        }

        /// <exception cref="IOException"/>
        protected virtual void ProcessServerHello(ServerHello serverHello)
        {
            var serverHelloExtensions = serverHello.Extensions;

            ProtocolVersion legacy_version = serverHello.Version;
            ProtocolVersion supported_version = TlsExtensionsUtilities.GetSupportedVersionsExtensionServer(
                serverHelloExtensions);

            ProtocolVersion server_version;
            if (null == supported_version)
            {
                server_version = legacy_version;
            }
            else
            {
                if (!ProtocolVersion.TLSv12.Equals(legacy_version) ||
                    !ProtocolVersion.TLSv13.IsEqualOrEarlierVersionOf(supported_version))
                {
                    throw new TlsFatalAlert(AlertDescription.illegal_parameter);
                }

                server_version = supported_version;
            }

            SecurityParameters securityParameters = m_tlsClientContext.SecurityParameters;

            // NOT renegotiating
            {
                if (!ProtocolVersion.Contains(m_tlsClientContext.ClientSupportedVersions, server_version))
                    throw new TlsFatalAlert(AlertDescription.protocol_version);

                ProtocolVersion legacy_record_version = server_version.IsLaterVersionOf(ProtocolVersion.TLSv12)
                    ? ProtocolVersion.TLSv12
                    : server_version;

                m_recordStream.SetWriteVersion(legacy_record_version);
                securityParameters.m_negotiatedVersion = server_version;
            }

            TlsUtilities.NegotiatedVersionTlsClient(m_tlsClientContext, m_tlsClient);

            if (ProtocolVersion.TLSv13.IsEqualOrEarlierVersionOf(server_version))
            {
                Process13ServerHello(serverHello, false);
                return;
            }

            int[] offeredCipherSuites = m_clientHello.CipherSuites;

            this.m_clientHello = null;
            this.m_retryCookie = null;
            this.m_retryGroup = -1;

            securityParameters.m_serverRandom = serverHello.Random;

            if (!m_tlsClientContext.ClientVersion.Equals(server_version))
            {
                TlsUtilities.CheckDowngradeMarker(server_version, securityParameters.ServerRandom);
            }

            {
                byte[] selectedSessionID = serverHello.SessionID;
                securityParameters.m_sessionID = selectedSessionID;
                m_tlsClient.NotifySessionID(selectedSessionID);
                securityParameters.m_resumedSession = selectedSessionID.Length > 0 && m_tlsSession != null
                    && Arrays.AreEqual(selectedSessionID, m_tlsSession.SessionID);
            }

            /*
             * Find out which CipherSuite the server has chosen and check that it was one of the offered
             * ones, and is a valid selection for the negotiated version.
             */
            {
                int cipherSuite = serverHello.CipherSuite;

                if (!TlsUtilities.IsValidCipherSuiteSelection(offeredCipherSuites, cipherSuite) ||
                    !TlsUtilities.IsValidVersionForCipherSuite(cipherSuite, securityParameters.NegotiatedVersion))
                {
                    throw new TlsFatalAlert(AlertDescription.illegal_parameter);
                }

                TlsUtilities.NegotiatedCipherSuite(securityParameters, cipherSuite);
                m_tlsClient.NotifySelectedCipherSuite(cipherSuite);
            }

            /*
             * RFC 3546 2.2 Note that the extended server hello message is only sent in response to an
             * extended client hello message.
             * 
             * However, see RFC 5746 exception below. We always include the SCSV, so an Extended Server
             * Hello is always allowed.
             */
            this.m_serverExtensions = serverHelloExtensions;
            if (m_serverExtensions != null)
            {
                foreach (int extType in m_serverExtensions.Keys)
                {
                    /*
                     * RFC 5746 3.6. Note that sending a "renegotiation_info" extension in response to a
                     * ClientHello containing only the SCSV is an explicit exception to the prohibition
                     * in RFC 5246, Section 7.4.1.4, on the server sending unsolicited extensions and is
                     * only allowed because the client is signaling its willingness to receive the
                     * extension via the TLS_EMPTY_RENEGOTIATION_INFO_SCSV SCSV.
                     */
                    if (ExtensionType.renegotiation_info == extType)
                        continue;

                    /*
                     * RFC 5246 7.4.1.4 An extension type MUST NOT appear in the ServerHello unless the
                     * same extension type appeared in the corresponding ClientHello. If a client
                     * receives an extension type in ServerHello that it did not request in the
                     * associated ClientHello, it MUST abort the handshake with an unsupported_extension
                     * fatal alert.
                     */
                    if (null == TlsUtilities.GetExtensionData(m_clientExtensions, extType))
                        throw new TlsFatalAlert(AlertDescription.unsupported_extension);

                    /*
                     * RFC 3546 2.3. If [...] the older session is resumed, then the server MUST ignore
                     * extensions appearing in the client hello, and send a server hello containing no
                     * extensions[.]
                     */
                    if (securityParameters.IsResumedSession)
                    {
                        // TODO[compat-gnutls] GnuTLS test server sends server extensions e.g. ec_point_formats
                        // TODO[compat-openssl] OpenSSL test server sends server extensions e.g. ec_point_formats
                        // TODO[compat-polarssl] PolarSSL test server sends server extensions e.g. ec_point_formats
    //                    throw new TlsFatalAlert(AlertDescription.illegal_parameter);
                    }
                }
            }

            byte[] renegExtData = TlsUtilities.GetExtensionData(m_serverExtensions, ExtensionType.renegotiation_info);

            // NOT renegotiating
            {
                /*
                 * RFC 5746 3.4. Client Behavior: Initial Handshake (both full and session-resumption)
                 */

                /*
                 * When a ServerHello is received, the client MUST check if it includes the
                 * "renegotiation_info" extension:
                 */
                if (renegExtData == null)
                {
                    /*
                     * If the extension is not present, the server does not support secure
                     * renegotiation; set secure_renegotiation flag to FALSE. In this case, some clients
                     * may want to terminate the handshake instead of continuing; see Section 4.1 for
                     * discussion.
                     */
                    securityParameters.m_secureRenegotiation = false;
                }
                else
                {
                    /*
                     * If the extension is present, set the secure_renegotiation flag to TRUE. The
                     * client MUST then verify that the length of the "renegotiated_connection"
                     * field is zero, and if it is not, MUST abort the handshake (by sending a fatal
                     * handshake_failure alert).
                     */
                    securityParameters.m_secureRenegotiation = true;

                    if (!Arrays.ConstantTimeAreEqual(renegExtData, CreateRenegotiationInfo(TlsUtilities.EmptyBytes)))
                        throw new TlsFatalAlert(AlertDescription.handshake_failure);
                }
            }

            // TODO[compat-gnutls] GnuTLS test server fails to send renegotiation_info extension when resuming
            m_tlsClient.NotifySecureRenegotiation(securityParameters.IsSecureRenegotiation);

            /*
             * RFC 7627 4. Clients and servers SHOULD NOT accept handshakes that do not use the extended
             * master secret [..]. (and see 5.2, 5.3)
             * 
             * RFC 8446 Appendix D. Because TLS 1.3 always hashes in the transcript up to the server
             * Finished, implementations which support both TLS 1.3 and earlier versions SHOULD indicate
             * the use of the Extended Master Secret extension in their APIs whenever TLS 1.3 is used.
             */
            {
                bool acceptedExtendedMasterSecret = TlsExtensionsUtilities.HasExtendedMasterSecretExtension(
                    m_serverExtensions);
                bool resumedSession = securityParameters.IsResumedSession;

                if (acceptedExtendedMasterSecret)
                {
                    if (server_version.IsSsl
                        || (!resumedSession && !m_tlsClient.ShouldUseExtendedMasterSecret()))
                    {
                        throw new TlsFatalAlert(AlertDescription.handshake_failure);
                    }
                }
                else
                {
                    if (m_tlsClient.RequiresExtendedMasterSecret()
                        || (resumedSession && !m_tlsClient.AllowLegacyResumption()))
                    {
                        throw new TlsFatalAlert(AlertDescription.handshake_failure);
                    }
                }

                securityParameters.m_extendedMasterSecret = acceptedExtendedMasterSecret;
            }

            /*
             * RFC 7301 3.1. When session resumption or session tickets [...] are used, the previous
             * contents of this extension are irrelevant, and only the values in the new handshake
             * messages are considered.
             */
            securityParameters.m_applicationProtocol = TlsExtensionsUtilities.GetAlpnExtensionServer(
                m_serverExtensions);
            securityParameters.m_applicationProtocolSet = true;

            var sessionClientExtensions = m_clientExtensions;
            var sessionServerExtensions = m_serverExtensions;
            if (securityParameters.IsResumedSession)
            {
                if (securityParameters.CipherSuite != m_sessionParameters.CipherSuite
                    || !server_version.Equals(m_sessionParameters.NegotiatedVersion))
                {
                    throw new TlsFatalAlert(AlertDescription.illegal_parameter);
                }

                sessionClientExtensions = null;
                sessionServerExtensions = m_sessionParameters.ReadServerExtensions();
            }

            if (sessionServerExtensions != null && sessionServerExtensions.Count > 0)
            {
                {
                    /*
                     * RFC 7366 3. If a server receives an encrypt-then-MAC request extension from a client
                     * and then selects a stream or Authenticated Encryption with Associated Data (AEAD)
                     * ciphersuite, it MUST NOT send an encrypt-then-MAC response extension back to the
                     * client.
                     */
                    bool serverSentEncryptThenMAC = TlsExtensionsUtilities.HasEncryptThenMacExtension(
                        sessionServerExtensions);
                    if (serverSentEncryptThenMAC && !TlsUtilities.IsBlockCipherSuite(securityParameters.CipherSuite))
                        throw new TlsFatalAlert(AlertDescription.illegal_parameter);

                    securityParameters.m_encryptThenMac = serverSentEncryptThenMAC;
                }

                securityParameters.m_maxFragmentLength = ProcessMaxFragmentLengthExtension(sessionClientExtensions,
                    sessionServerExtensions, AlertDescription.illegal_parameter);

                securityParameters.m_truncatedHmac = TlsExtensionsUtilities.HasTruncatedHmacExtension(
                    sessionServerExtensions);

                /*
                 * TODO It's surprising that there's no provision to allow a 'fresh' CertificateStatus to be sent in
                 * a session resumption handshake.
                 */
                if (!securityParameters.IsResumedSession)
                {
                    // TODO[tls13] See RFC 8446 4.4.2.1
                    if (TlsUtilities.HasExpectedEmptyExtensionData(sessionServerExtensions,
                        ExtensionType.status_request_v2, AlertDescription.illegal_parameter))
                    {
                        securityParameters.m_statusRequestVersion = 2;
                    }
                    else if (TlsUtilities.HasExpectedEmptyExtensionData(sessionServerExtensions,
                        ExtensionType.status_request, AlertDescription.illegal_parameter))
                    {
                        securityParameters.m_statusRequestVersion = 1;
                    }

                    this.m_expectSessionTicket = TlsUtilities.HasExpectedEmptyExtensionData(sessionServerExtensions,
                        ExtensionType.session_ticket, AlertDescription.illegal_parameter);
                }
            }

            if (sessionClientExtensions != null)
            {
                m_tlsClient.ProcessServerExtensions(sessionServerExtensions);
            }

            ApplyMaxFragmentLengthExtension(securityParameters.MaxFragmentLength);

            if (securityParameters.IsResumedSession)
            {
                securityParameters.m_masterSecret = m_sessionMasterSecret;
                m_recordStream.SetPendingCipher(TlsUtilities.InitCipher(m_tlsClientContext));
            }
            else
            {
                InvalidateSession();
                this.m_tlsSession = TlsUtilities.ImportSession(securityParameters.SessionID, null);
            }
        }

        /// <exception cref="IOException"/>
        protected virtual void Receive13CertificateRequest(MemoryStream buf, bool postHandshakeAuth)
        {
            // TODO[tls13] Support for post_handshake_auth
            if (postHandshakeAuth)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            /* 
             * RFC 8446 4.3.2. A server which is authenticating with a certificate MAY optionally
             * request a certificate from the client.
             */

            if (m_selectedPsk13)
                throw new TlsFatalAlert(AlertDescription.unexpected_message);

            CertificateRequest certificateRequest = CertificateRequest.Parse(m_tlsClientContext, buf);

            AssertEmpty(buf);

            if (!certificateRequest.HasCertificateRequestContext(TlsUtilities.EmptyBytes))
                throw new TlsFatalAlert(AlertDescription.illegal_parameter);

            this.m_certificateRequest = certificateRequest;

            TlsUtilities.EstablishServerSigAlgs(m_tlsClientContext.SecurityParameters, certificateRequest);
        }

        /// <exception cref="IOException"/>
        protected virtual void Receive13EncryptedExtensions(MemoryStream buf)
        {
            byte[] extBytes = TlsUtilities.ReadOpaque16(buf);

            AssertEmpty(buf);


            this.m_serverExtensions = ReadExtensionsData13(HandshakeType.encrypted_extensions, extBytes);

            {
                /*
                 * RFC 8446 4.2. Implementations MUST NOT send extension responses if the remote
                 * endpoint did not send the corresponding extension requests, with the exception of the
                 * "cookie" extension in the HelloRetryRequest. Upon receiving such an extension, an
                 * endpoint MUST abort the handshake with an "unsupported_extension" alert.
                 */
                foreach (int extType in m_serverExtensions.Keys)
                {
                    if (null == TlsUtilities.GetExtensionData(m_clientExtensions, extType))
                        throw new TlsFatalAlert(AlertDescription.unsupported_extension);
                }
            }


            SecurityParameters securityParameters = m_tlsClientContext.SecurityParameters;
            ProtocolVersion negotiatedVersion = securityParameters.NegotiatedVersion;

            securityParameters.m_applicationProtocol = TlsExtensionsUtilities.GetAlpnExtensionServer(
                m_serverExtensions);
            securityParameters.m_applicationProtocolSet = true;

            var sessionClientExtensions = m_clientExtensions;
            var sessionServerExtensions = m_serverExtensions;
            if (securityParameters.IsResumedSession)
            {
                if (securityParameters.CipherSuite != m_sessionParameters.CipherSuite
                    || !negotiatedVersion.Equals(m_sessionParameters.NegotiatedVersion))
                {
                    throw new TlsFatalAlert(AlertDescription.illegal_parameter);
                }

                sessionClientExtensions = null;
                sessionServerExtensions = m_sessionParameters.ReadServerExtensions();
            }

            securityParameters.m_maxFragmentLength = ProcessMaxFragmentLengthExtension(sessionClientExtensions,
                sessionServerExtensions, AlertDescription.illegal_parameter);

            securityParameters.m_encryptThenMac = false;
            securityParameters.m_truncatedHmac = false;

            /*
             * TODO[tls13] RFC 8446 4.4.2.1. OCSP Status and SCT Extensions.
             * 
             * OCSP information is carried in an extension for a CertificateEntry.
             */
            securityParameters.m_statusRequestVersion =
                m_clientExtensions.ContainsKey(ExtensionType.status_request) ? 1 : 0;

            this.m_expectSessionTicket = false;

            if (null != sessionClientExtensions)
            {
                m_tlsClient.ProcessServerExtensions(m_serverExtensions);
            }

            ApplyMaxFragmentLengthExtension(securityParameters.MaxFragmentLength);
        }

        /// <exception cref="IOException"/>
        protected virtual void Receive13NewSessionTicket(MemoryStream buf)
        {
            if (!IsApplicationDataReady)
                throw new TlsFatalAlert(AlertDescription.unexpected_message);

            // TODO[tls13] Do something more than just ignore them

    //        struct {
    //            uint32 ticket_lifetime;
    //            uint32 ticket_age_add;
    //            opaque ticket_nonce<0..255>;
    //            opaque ticket<1..2^16-1>;
    //            Extension extensions<0..2^16-2>;
    //        } NewSessionTicket;

            TlsUtilities.ReadUint32(buf);
            TlsUtilities.ReadUint32(buf);
            TlsUtilities.ReadOpaque8(buf);
            TlsUtilities.ReadOpaque16(buf);
            TlsUtilities.ReadOpaque16(buf);
            AssertEmpty(buf);
        }

        /// <exception cref="IOException"/>
        protected virtual void Receive13ServerCertificate(MemoryStream buf)
        {
            if (m_selectedPsk13)
                throw new TlsFatalAlert(AlertDescription.unexpected_message);

            this.m_authentication = TlsUtilities.Receive13ServerCertificate(m_tlsClientContext, m_tlsClient, buf);

            // NOTE: In TLS 1.3 we don't have to wait for a possible CertificateStatus message.
            HandleServerCertificate();
        }

        /// <exception cref="IOException"/>
        protected virtual void Receive13ServerCertificateVerify(MemoryStream buf)
        {
            Certificate serverCertificate = m_tlsClientContext.SecurityParameters.PeerCertificate;
            if (null == serverCertificate || serverCertificate.IsEmpty)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            CertificateVerify certificateVerify = CertificateVerify.Parse(m_tlsClientContext, buf);

            AssertEmpty(buf);

            TlsUtilities.Verify13CertificateVerifyServer(m_tlsClientContext, m_handshakeHash, certificateVerify);
        }

        /// <exception cref="IOException"/>
        protected virtual void Receive13ServerFinished(MemoryStream buf)
        {
            Process13FinishedMessage(buf);
        }

        /// <exception cref="IOException"/>
        protected virtual void ReceiveCertificateRequest(MemoryStream buf)
        {
            if (null == m_authentication)
            {
                /*
                 * RFC 2246 7.4.4. It is a fatal handshake_failure alert for an anonymous server to
                 * request client identification.
                 */
                throw new TlsFatalAlert(AlertDescription.handshake_failure);
            }

            CertificateRequest certificateRequest = CertificateRequest.Parse(m_tlsClientContext, buf);

            AssertEmpty(buf);

            this.m_certificateRequest = TlsUtilities.ValidateCertificateRequest(certificateRequest, m_keyExchange);
        }

        /// <exception cref="IOException"/>
        protected virtual void ReceiveNewSessionTicket(MemoryStream buf)
        {
            NewSessionTicket newSessionTicket = NewSessionTicket.Parse(buf);

            AssertEmpty(buf);

            m_tlsClient.NotifyNewSessionTicket(newSessionTicket);
        }

        /// <exception cref="IOException"/>
        protected virtual ServerHello ReceiveServerHelloMessage(MemoryStream buf)
        {
            return ServerHello.Parse(buf);
        }

        /// <exception cref="IOException"/>
        protected virtual void Send13ClientHelloRetry()
        {
            var clientHelloExtensions = m_clientHello.Extensions;

            clientHelloExtensions.Remove(ExtensionType.cookie);
            clientHelloExtensions.Remove(ExtensionType.early_data);
            clientHelloExtensions.Remove(ExtensionType.key_share);
            clientHelloExtensions.Remove(ExtensionType.pre_shared_key);

            /*
             * RFC 4.2.2. When sending the new ClientHello, the client MUST copy the contents of the
             * extension received in the HelloRetryRequest into a "cookie" extension in the new
             * ClientHello.
             */
            if (null != m_retryCookie)
            {
                /*
                 * - Including a "cookie" extension if one was provided in the HelloRetryRequest.
                 */
                TlsExtensionsUtilities.AddCookieExtension(clientHelloExtensions, m_retryCookie);
                this.m_retryCookie = null;
            }

            /*
             * - Updating the "pre_shared_key" extension if present by recomputing the "obfuscated_ticket_age"
             * and binder values and (optionally) removing any PSKs which are incompatible with the server's
             * indicated cipher suite.
             */
            if (null != m_clientBinders)
            {
                this.m_clientBinders = TlsUtilities.AddPreSharedKeyToClientHelloRetry(m_tlsClientContext,
                    m_clientBinders, clientHelloExtensions);
                if (null == m_clientBinders)
                {
                    m_tlsClient.NotifySelectedPsk(null);
                }
            }

            /*
             * RFC 8446 4.2.8. [..] when sending the new ClientHello, the client MUST replace the
             * original "key_share" extension with one containing only a new KeyShareEntry for the group
             * indicated in the selected_group field of the triggering HelloRetryRequest.
             */
            if (m_retryGroup < 0)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            /*
             * - If a "key_share" extension was supplied in the HelloRetryRequest, replacing the list of shares
             * with a list containing a single KeyShareEntry from the indicated group
             */
            this.m_clientAgreements = TlsUtilities.AddKeyShareToClientHelloRetry(m_tlsClientContext,
                clientHelloExtensions, m_retryGroup);

            /*
             * TODO[tls13] Optionally adding, removing, or changing the length of the "padding"
             * extension [RFC7685].
             */

            // See RFC 8446 D.4.
            {
                m_recordStream.SetIgnoreChangeCipherSpec(true);

                /*
                 * TODO[tls13] If offering early_data, the record is placed immediately after the first
                 * ClientHello.
                 */
                SendChangeCipherSpecMessage();
            }

            SendClientHelloMessage();
        }

        /// <exception cref="IOException"/>
        protected virtual void SendCertificateVerifyMessage(DigitallySigned certificateVerify)
        {
            HandshakeMessageOutput message = new HandshakeMessageOutput(HandshakeType.certificate_verify);
            certificateVerify.Encode(message);
            message.Send(this);
        }

        /// <exception cref="IOException"/>
        protected virtual void SendClientHello()
        {
            SecurityParameters securityParameters = m_tlsClientContext.SecurityParameters;

            ProtocolVersion[] supportedVersions;
            ProtocolVersion earliestVersion, latestVersion;

            // NOT renegotiating
            {
                supportedVersions = m_tlsClient.GetProtocolVersions();

                if (ProtocolVersion.Contains(supportedVersions, ProtocolVersion.SSLv3))
                {
                    // TODO[tls13] Prevent offering SSLv3 AND TLSv13?
                    m_recordStream.SetWriteVersion(ProtocolVersion.SSLv3);
                }
                else
                {
                    m_recordStream.SetWriteVersion(ProtocolVersion.TLSv10);
                }

                earliestVersion = ProtocolVersion.GetEarliestTls(supportedVersions);
                latestVersion = ProtocolVersion.GetLatestTls(supportedVersions);

                if (!ProtocolVersion.IsSupportedTlsVersionClient(latestVersion))
                    throw new TlsFatalAlert(AlertDescription.internal_error);

                m_tlsClientContext.SetClientVersion(latestVersion);
            }

            m_tlsClientContext.SetClientSupportedVersions(supportedVersions);

            bool offeringTlsV12Minus = ProtocolVersion.TLSv12.IsEqualOrLaterVersionOf(earliestVersion);
            bool offeringTlsV13Plus = ProtocolVersion.TLSv13.IsEqualOrEarlierVersionOf(latestVersion);

            {
                bool useGmtUnixTime = !offeringTlsV13Plus && m_tlsClient.ShouldUseGmtUnixTime();

                securityParameters.m_clientRandom = CreateRandomBlock(useGmtUnixTime, m_tlsClientContext);
            }

            EstablishSession(offeringTlsV12Minus ? m_tlsClient.GetSessionToResume() : null);
            m_tlsClient.NotifySessionToResume(m_tlsSession);

            /*
             * TODO RFC 5077 3.4. When presenting a ticket, the client MAY generate and include a
             * Session ID in the TLS ClientHello.
             */
            byte[] legacy_session_id = TlsUtilities.GetSessionID(m_tlsSession);

            bool fallback = m_tlsClient.IsFallback();

            int[] offeredCipherSuites = m_tlsClient.GetCipherSuites();

            if (legacy_session_id.Length > 0 && m_sessionParameters != null)
            {
                if (!Arrays.Contains(offeredCipherSuites, m_sessionParameters.CipherSuite))
                {
                    legacy_session_id = TlsUtilities.EmptyBytes;
                }
            }

            this.m_clientExtensions = TlsExtensionsUtilities.EnsureExtensionsInitialised(
                m_tlsClient.GetClientExtensions());

            ProtocolVersion legacy_version = latestVersion;
            if (offeringTlsV13Plus)
            {
                legacy_version = ProtocolVersion.TLSv12;

                TlsExtensionsUtilities.AddSupportedVersionsExtensionClient(m_clientExtensions, supportedVersions);

                /*
                 * RFC 8446 4.2.1. In compatibility mode [..], this field MUST be non-empty, so a client
                 * not offering a pre-TLS 1.3 session MUST generate a new 32-byte value.
                 */
                if (legacy_session_id.Length < 1)
                {
                    legacy_session_id = m_tlsClientContext.NonceGenerator.GenerateNonce(32);
                }
            }

            m_tlsClientContext.SetRsaPreMasterSecretVersion(legacy_version);

            securityParameters.m_clientServerNames = TlsExtensionsUtilities.GetServerNameExtensionClient(
                m_clientExtensions);

            if (TlsUtilities.IsSignatureAlgorithmsExtensionAllowed(latestVersion))
            {
                TlsUtilities.EstablishClientSigAlgs(securityParameters, m_clientExtensions);
            }

            securityParameters.m_clientSupportedGroups = TlsExtensionsUtilities.GetSupportedGroupsExtension(
                m_clientExtensions);

            this.m_clientBinders = TlsUtilities.AddPreSharedKeyToClientHello(m_tlsClientContext, m_tlsClient,
                m_clientExtensions, offeredCipherSuites);

            // TODO[tls13-psk] Perhaps don't add key_share if external PSK(s) offered and 'psk_dhe_ke' not offered  
            this.m_clientAgreements = TlsUtilities.AddKeyShareToClientHello(m_tlsClientContext, m_tlsClient,
                m_clientExtensions);

            if (TlsUtilities.IsExtendedMasterSecretOptionalTls(supportedVersions)
                && (m_tlsClient.ShouldUseExtendedMasterSecret() ||
                    (null != m_sessionParameters && m_sessionParameters.IsExtendedMasterSecret)))
            {
                TlsExtensionsUtilities.AddExtendedMasterSecretExtension(m_clientExtensions);
            }
            else if (!offeringTlsV13Plus && m_tlsClient.RequiresExtendedMasterSecret())
            {
                throw new TlsFatalAlert(AlertDescription.internal_error);
            }

            // NOT renegotiating
            {
                /*
                 * RFC 5746 3.4. Client Behavior: Initial Handshake (both full and session-resumption)
                 */

                /*
                 * The client MUST include either an empty "renegotiation_info" extension, or the
                 * TLS_EMPTY_RENEGOTIATION_INFO_SCSV signaling cipher suite value in the ClientHello.
                 * Including both is NOT RECOMMENDED.
                 */
                bool noRenegExt = (null == TlsUtilities.GetExtensionData(m_clientExtensions,
                    ExtensionType.renegotiation_info));
                bool noRenegScsv = !Arrays.Contains(offeredCipherSuites, CipherSuite.TLS_EMPTY_RENEGOTIATION_INFO_SCSV);

                if (noRenegExt && noRenegScsv)
                {
                    // TODO[tls13] Probably want to not add this if no pre-TLSv13 versions offered?
                    offeredCipherSuites = Arrays.Append(offeredCipherSuites, CipherSuite.TLS_EMPTY_RENEGOTIATION_INFO_SCSV);
                }
            }

            /*
             * (Fallback SCSV)
             * RFC 7507 4. If a client sends a ClientHello.client_version containing a lower value
             * than the latest (highest-valued) version supported by the client, it SHOULD include
             * the TLS_FALLBACK_SCSV cipher suite value in ClientHello.cipher_suites [..]. (The
             * client SHOULD put TLS_FALLBACK_SCSV after all cipher suites that it actually intends
             * to negotiate.)
             */
            if (fallback && !Arrays.Contains(offeredCipherSuites, CipherSuite.TLS_FALLBACK_SCSV))
            {
                offeredCipherSuites = Arrays.Append(offeredCipherSuites, CipherSuite.TLS_FALLBACK_SCSV);
            }



            int bindersSize = null == m_clientBinders ? 0 : m_clientBinders.m_bindersSize;

            this.m_clientHello = new ClientHello(legacy_version, securityParameters.ClientRandom, legacy_session_id,
                null, offeredCipherSuites, m_clientExtensions, bindersSize);

            SendClientHelloMessage();
        }

        /// <exception cref="IOException"/>
        protected virtual void SendClientHelloMessage()
        {
            HandshakeMessageOutput message = new HandshakeMessageOutput(HandshakeType.client_hello);
            m_clientHello.Encode(m_tlsClientContext, message);

            message.PrepareClientHello(m_handshakeHash, m_clientHello.BindersSize);

            if (null != m_clientBinders)
            {
                OfferedPsks.EncodeBinders(message, m_tlsClientContext.Crypto, m_handshakeHash, m_clientBinders);
            }

            message.SendClientHello(this, m_handshakeHash, m_clientHello.BindersSize);
        }

        /// <exception cref="IOException"/>
        protected virtual void SendClientKeyExchange()
        {
            HandshakeMessageOutput message = new HandshakeMessageOutput(HandshakeType.client_key_exchange);
            m_keyExchange.GenerateClientKeyExchange(message);
            message.Send(this);
        }

        /// <exception cref="IOException"/>
        protected virtual void Skip13CertificateRequest()
        {
            this.m_certificateRequest = null;
        }

        /// <exception cref="IOException"/>
        protected virtual void Skip13ServerCertificate()
        {
            if (!m_selectedPsk13)
                throw new TlsFatalAlert(AlertDescription.unexpected_message);

            this.m_authentication = TlsUtilities.Skip13ServerCertificate(m_tlsClientContext);
        }
    }
}
