using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Tls.Crypto;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Tls
{
    public class DtlsClientProtocol
        : DtlsProtocol
    {
        public DtlsClientProtocol()
            : base()
        {
        }

        /// <exception cref="IOException"/>
        public virtual DtlsTransport Connect(TlsClient client, DatagramTransport transport)
        {
            if (client == null)
                throw new ArgumentNullException("client");
            if (transport == null)
                throw new ArgumentNullException("transport");

            ClientHandshakeState state = new ClientHandshakeState();
            state.client = client;
            state.clientContext = new TlsClientContextImpl(client.Crypto);

            client.Init(state.clientContext);
            state.clientContext.HandshakeBeginning(client);

            SecurityParameters securityParameters = state.clientContext.SecurityParameters;
            securityParameters.m_extendedPadding = client.ShouldUseExtendedPadding();

            TlsSession sessionToResume = state.client.GetSessionToResume();
            if (sessionToResume != null && sessionToResume.IsResumable)
            {
                SessionParameters sessionParameters = sessionToResume.ExportSessionParameters();

                /*
                 * NOTE: If we ever enable session resumption without extended_master_secret, then
                 * renegotiation MUST be disabled (see RFC 7627 5.4).
                 */
                if (sessionParameters != null
                    && (sessionParameters.IsExtendedMasterSecret
                        || (!state.client.RequiresExtendedMasterSecret() && state.client.AllowLegacyResumption())))
                {
                    TlsSecret masterSecret = sessionParameters.MasterSecret;
                    lock (masterSecret)
                    {
                        if (masterSecret.IsAlive())
                        {
                            state.tlsSession = sessionToResume;
                            state.sessionParameters = sessionParameters;
                            state.sessionMasterSecret = state.clientContext.Crypto.AdoptSecret(masterSecret);
                        }
                    }
                }
            }

            DtlsRecordLayer recordLayer = new DtlsRecordLayer(state.clientContext, state.client, transport);
            client.NotifyCloseHandle(recordLayer);

            try
            {
                return ClientHandshake(state, recordLayer);
            }
            catch (TlsFatalAlert fatalAlert)
            {
                AbortClientHandshake(state, recordLayer, fatalAlert.AlertDescription);
                throw fatalAlert;
            }
            catch (IOException e)
            {
                AbortClientHandshake(state, recordLayer, AlertDescription.internal_error);
                throw e;
            }
            catch (Exception e)
            {
                AbortClientHandshake(state, recordLayer, AlertDescription.internal_error);
                throw new TlsFatalAlert(AlertDescription.internal_error, e);
            }
            finally
            {
                securityParameters.Clear();
            }
        }

        internal virtual void AbortClientHandshake(ClientHandshakeState state, DtlsRecordLayer recordLayer,
            short alertDescription)
        {
            recordLayer.Fail(alertDescription);
            InvalidateSession(state);
        }

        /// <exception cref="IOException"/>
        internal virtual DtlsTransport ClientHandshake(ClientHandshakeState state, DtlsRecordLayer recordLayer)
        {
            SecurityParameters securityParameters = state.clientContext.SecurityParameters;

            DtlsReliableHandshake handshake = new DtlsReliableHandshake(state.clientContext, recordLayer,
                state.client.GetHandshakeTimeoutMillis(), null);

            byte[] clientHelloBody = GenerateClientHello(state);

            recordLayer.SetWriteVersion(ProtocolVersion.DTLSv10);

            handshake.SendMessage(HandshakeType.client_hello, clientHelloBody);

            DtlsReliableHandshake.Message serverMessage = handshake.ReceiveMessage();

            // TODO Consider stricter HelloVerifyRequest protocol
            //if (serverMessage.Type == HandshakeType.hello_verify_request)
            while (serverMessage.Type == HandshakeType.hello_verify_request)
            {
                byte[] cookie = ProcessHelloVerifyRequest(state, serverMessage.Body);
                byte[] patched = PatchClientHelloWithCookie(clientHelloBody, cookie);

                handshake.ResetAfterHelloVerifyRequestClient();
                handshake.SendMessage(HandshakeType.client_hello, patched);

                serverMessage = handshake.ReceiveMessage();
            }

            if (serverMessage.Type == HandshakeType.server_hello)
            {
                ProtocolVersion recordLayerVersion = recordLayer.ReadVersion;
                ReportServerVersion(state, recordLayerVersion);
                recordLayer.SetWriteVersion(recordLayerVersion);

                ProcessServerHello(state, serverMessage.Body);
            }
            else
            {
                throw new TlsFatalAlert(AlertDescription.unexpected_message);
            }

            handshake.HandshakeHash.NotifyPrfDetermined();

            ApplyMaxFragmentLengthExtension(recordLayer, securityParameters.MaxFragmentLength);

            if (state.resumedSession)
            {
                securityParameters.m_masterSecret = state.sessionMasterSecret;
                recordLayer.InitPendingEpoch(TlsUtilities.InitCipher(state.clientContext));

                // NOTE: Calculated exclusive of the actual Finished message from the server
                securityParameters.m_peerVerifyData = TlsUtilities.CalculateVerifyData(state.clientContext,
                    handshake.HandshakeHash, true);
                ProcessFinished(handshake.ReceiveMessageBody(HandshakeType.finished),
                    securityParameters.PeerVerifyData);

                // NOTE: Calculated exclusive of the Finished message itself
                securityParameters.m_localVerifyData = TlsUtilities.CalculateVerifyData(state.clientContext,
                    handshake.HandshakeHash, false);
                handshake.SendMessage(HandshakeType.finished, securityParameters.LocalVerifyData);

                handshake.Finish();

                if (securityParameters.IsExtendedMasterSecret)
                {
                    securityParameters.m_tlsUnique = securityParameters.PeerVerifyData;
                }

                securityParameters.m_localCertificate = state.sessionParameters.LocalCertificate;
                securityParameters.m_peerCertificate = state.sessionParameters.PeerCertificate;
                securityParameters.m_pskIdentity = state.sessionParameters.PskIdentity;
                securityParameters.m_srpIdentity = state.sessionParameters.SrpIdentity;

                state.clientContext.HandshakeComplete(state.client, state.tlsSession);

                recordLayer.InitHeartbeat(state.heartbeat,
                    HeartbeatMode.peer_allowed_to_send == state.heartbeatPolicy);

                return new DtlsTransport(recordLayer);
            }

            InvalidateSession(state);
            state.tlsSession = TlsUtilities.ImportSession(securityParameters.SessionID, null);

            serverMessage = handshake.ReceiveMessage();

            if (serverMessage.Type == HandshakeType.supplemental_data)
            {
                ProcessServerSupplementalData(state, serverMessage.Body);
                serverMessage = handshake.ReceiveMessage();
            }
            else
            {
                state.client.ProcessServerSupplementalData(null);
            }

            state.keyExchange = TlsUtilities.InitKeyExchangeClient(state.clientContext, state.client);

            if (serverMessage.Type == HandshakeType.certificate)
            {
                ProcessServerCertificate(state, serverMessage.Body);
                serverMessage = handshake.ReceiveMessage();
            }
            else
            {
                // Okay, Certificate is optional
                state.authentication = null;
            }

            if (serverMessage.Type == HandshakeType.certificate_status)
            {
                if (securityParameters.StatusRequestVersion < 1)
                    throw new TlsFatalAlert(AlertDescription.unexpected_message);

                ProcessCertificateStatus(state, serverMessage.Body);
                serverMessage = handshake.ReceiveMessage();
            }
            else
            {
                // Okay, CertificateStatus is optional
            }

            TlsUtilities.ProcessServerCertificate(state.clientContext, state.certificateStatus, state.keyExchange,
                state.authentication, state.clientExtensions, state.serverExtensions);

            if (serverMessage.Type == HandshakeType.server_key_exchange)
            {
                ProcessServerKeyExchange(state, serverMessage.Body);
                serverMessage = handshake.ReceiveMessage();
            }
            else
            {
                // Okay, ServerKeyExchange is optional
                state.keyExchange.SkipServerKeyExchange();
            }

            if (serverMessage.Type == HandshakeType.certificate_request)
            {
                ProcessCertificateRequest(state, serverMessage.Body);

                TlsUtilities.EstablishServerSigAlgs(securityParameters, state.certificateRequest);

                serverMessage = handshake.ReceiveMessage();
            }
            else
            {
                // Okay, CertificateRequest is optional
            }

            if (serverMessage.Type == HandshakeType.server_hello_done)
            {
                if (serverMessage.Body.Length != 0)
                {
                    throw new TlsFatalAlert(AlertDescription.decode_error);
                }
            }
            else
            {
                throw new TlsFatalAlert(AlertDescription.unexpected_message);
            }

            TlsCredentials clientAuthCredentials = null;
            TlsCredentialedSigner clientAuthSigner = null;
            Certificate clientAuthCertificate = null;
            SignatureAndHashAlgorithm clientAuthAlgorithm = null;
            TlsStreamSigner clientAuthStreamSigner = null;

            if (state.certificateRequest != null)
            {
                clientAuthCredentials = TlsUtilities.EstablishClientCredentials(state.authentication,
                    state.certificateRequest);
                if (clientAuthCredentials != null)
                {
                    clientAuthCertificate = clientAuthCredentials.Certificate;

                    if (clientAuthCredentials is TlsCredentialedSigner)
                    {
                        clientAuthSigner = (TlsCredentialedSigner)clientAuthCredentials;
                        clientAuthAlgorithm = TlsUtilities.GetSignatureAndHashAlgorithm(
                            securityParameters.NegotiatedVersion, clientAuthSigner);
                        clientAuthStreamSigner = clientAuthSigner.GetStreamSigner();

                        if (ProtocolVersion.DTLSv12.Equals(securityParameters.NegotiatedVersion))
                        {
                            TlsUtilities.VerifySupportedSignatureAlgorithm(securityParameters.ServerSigAlgs,
                                clientAuthAlgorithm, AlertDescription.internal_error);

                            if (clientAuthStreamSigner == null)
                            {
                                TlsUtilities.TrackHashAlgorithmClient(handshake.HandshakeHash, clientAuthAlgorithm);
                            }
                        }

                        if (clientAuthStreamSigner != null)
                        {
                            handshake.HandshakeHash.ForceBuffering();
                        }
                    }
                }
            }

            handshake.HandshakeHash.SealHashAlgorithms();

            if (clientAuthCredentials == null)
            {
                state.keyExchange.SkipClientCredentials();
            }
            else
            {
                state.keyExchange.ProcessClientCredentials(clientAuthCredentials);                    
            }

            var clientSupplementalData = state.client.GetClientSupplementalData();
            if (clientSupplementalData != null)
            {
                byte[] supplementalDataBody = GenerateSupplementalData(clientSupplementalData);
                handshake.SendMessage(HandshakeType.supplemental_data, supplementalDataBody);
            }

            if (null != state.certificateRequest)
            {
                SendCertificateMessage(state.clientContext, handshake, clientAuthCertificate, null);
            }

            byte[] clientKeyExchangeBody = GenerateClientKeyExchange(state);
            handshake.SendMessage(HandshakeType.client_key_exchange, clientKeyExchangeBody);

            securityParameters.m_sessionHash = TlsUtilities.GetCurrentPrfHash(handshake.HandshakeHash);

            TlsProtocol.EstablishMasterSecret(state.clientContext, state.keyExchange);
            recordLayer.InitPendingEpoch(TlsUtilities.InitCipher(state.clientContext));

            if (clientAuthSigner != null)
            {
                DigitallySigned certificateVerify = TlsUtilities.GenerateCertificateVerifyClient(state.clientContext,
                    clientAuthSigner, clientAuthAlgorithm, clientAuthStreamSigner, handshake.HandshakeHash);
                byte[] certificateVerifyBody = GenerateCertificateVerify(state, certificateVerify);
                handshake.SendMessage(HandshakeType.certificate_verify, certificateVerifyBody);
            }

            handshake.PrepareToFinish();

            securityParameters.m_localVerifyData = TlsUtilities.CalculateVerifyData(state.clientContext,
                handshake.HandshakeHash, false);
            handshake.SendMessage(HandshakeType.finished, securityParameters.LocalVerifyData);

            if (state.expectSessionTicket)
            {
                serverMessage = handshake.ReceiveMessage();
                if (serverMessage.Type == HandshakeType.new_session_ticket)
                {
                    /*
                     * RFC 5077 3.4. If the client receives a session ticket from the server, then it
                     * discards any Session ID that was sent in the ServerHello.
                     */
                    securityParameters.m_sessionID = TlsUtilities.EmptyBytes;
                    InvalidateSession(state);
                    state.tlsSession = TlsUtilities.ImportSession(securityParameters.SessionID, null);

                    ProcessNewSessionTicket(state, serverMessage.Body);
                }
                else
                {
                    throw new TlsFatalAlert(AlertDescription.unexpected_message);
                }
            }

            // NOTE: Calculated exclusive of the actual Finished message from the server
            securityParameters.m_peerVerifyData = TlsUtilities.CalculateVerifyData(state.clientContext,
                handshake.HandshakeHash, true);
            ProcessFinished(handshake.ReceiveMessageBody(HandshakeType.finished), securityParameters.PeerVerifyData);

            handshake.Finish();

            state.sessionMasterSecret = securityParameters.MasterSecret;

            state.sessionParameters = new SessionParameters.Builder()
                .SetCipherSuite(securityParameters.CipherSuite)
                .SetExtendedMasterSecret(securityParameters.IsExtendedMasterSecret)
                .SetLocalCertificate(securityParameters.LocalCertificate)
                .SetMasterSecret(state.clientContext.Crypto.AdoptSecret(state.sessionMasterSecret))
                .SetNegotiatedVersion(securityParameters.NegotiatedVersion)
                .SetPeerCertificate(securityParameters.PeerCertificate)
                .SetPskIdentity(securityParameters.PskIdentity)
                .SetSrpIdentity(securityParameters.SrpIdentity)
                // TODO Consider filtering extensions that aren't relevant to resumed sessions
                .SetServerExtensions(state.serverExtensions)
                .Build();

            state.tlsSession = TlsUtilities.ImportSession(securityParameters.SessionID, state.sessionParameters);

            securityParameters.m_tlsUnique = securityParameters.LocalVerifyData;

            state.clientContext.HandshakeComplete(state.client, state.tlsSession);

            recordLayer.InitHeartbeat(state.heartbeat, HeartbeatMode.peer_allowed_to_send == state.heartbeatPolicy);

            return new DtlsTransport(recordLayer);
        }

        /// <exception cref="IOException"/>
        protected virtual byte[] GenerateCertificateVerify(ClientHandshakeState state,
            DigitallySigned certificateVerify)
        {
            MemoryStream buf = new MemoryStream();
            certificateVerify.Encode(buf);
            return buf.ToArray();
        }

        /// <exception cref="IOException"/>
        protected virtual byte[] GenerateClientHello(ClientHandshakeState state)
        {
            TlsClientContextImpl context = state.clientContext;
            SecurityParameters securityParameters = context.SecurityParameters;

            context.SetClientSupportedVersions(state.client.GetProtocolVersions());

            ProtocolVersion client_version = ProtocolVersion.GetLatestDtls(context.ClientSupportedVersions);
            if (!ProtocolVersion.IsSupportedDtlsVersionClient(client_version))
                throw new TlsFatalAlert(AlertDescription.internal_error);

            context.SetClientVersion(client_version);

            {
                bool useGmtUnixTime = ProtocolVersion.DTLSv12.IsEqualOrLaterVersionOf(client_version)
                    && state.client.ShouldUseGmtUnixTime();

                securityParameters.m_clientRandom = TlsProtocol.CreateRandomBlock(useGmtUnixTime, state.clientContext);
            }

            byte[] session_id = TlsUtilities.GetSessionID(state.tlsSession);

            bool fallback = state.client.IsFallback();

            state.offeredCipherSuites = state.client.GetCipherSuites();

            if (session_id.Length > 0 && state.sessionParameters != null)
            {
                if (!Arrays.Contains(state.offeredCipherSuites, state.sessionParameters.CipherSuite))
                {
                    session_id = TlsUtilities.EmptyBytes;
                }
            }

            state.clientExtensions = TlsExtensionsUtilities.EnsureExtensionsInitialised(
                state.client.GetClientExtensions());

            ProtocolVersion legacy_version = client_version;
            if (client_version.IsLaterVersionOf(ProtocolVersion.DTLSv12))
            {
                legacy_version = ProtocolVersion.DTLSv12;

                TlsExtensionsUtilities.AddSupportedVersionsExtensionClient(state.clientExtensions,
                    context.ClientSupportedVersions);
            }

            context.SetRsaPreMasterSecretVersion(legacy_version);

            securityParameters.m_clientServerNames = TlsExtensionsUtilities.GetServerNameExtensionClient(
                state.clientExtensions);

            if (TlsUtilities.IsSignatureAlgorithmsExtensionAllowed(client_version))
            {
                TlsUtilities.EstablishClientSigAlgs(securityParameters, state.clientExtensions);
            }

            securityParameters.m_clientSupportedGroups = TlsExtensionsUtilities.GetSupportedGroupsExtension(
                state.clientExtensions);

            state.clientAgreements = TlsUtilities.AddKeyShareToClientHello(state.clientContext, state.client,
                state.clientExtensions);

            if (TlsUtilities.IsExtendedMasterSecretOptionalDtls(context.ClientSupportedVersions)
                && state.client.ShouldUseExtendedMasterSecret())
            {
                TlsExtensionsUtilities.AddExtendedMasterSecretExtension(state.clientExtensions);
            }
            else if (!TlsUtilities.IsTlsV13(client_version)
                && state.client.RequiresExtendedMasterSecret())
            {
                throw new TlsFatalAlert(AlertDescription.internal_error);
            }

            // Cipher Suites (and SCSV)
            {
                /*
                 * RFC 5746 3.4. The client MUST include either an empty "renegotiation_info" extension,
                 * or the TLS_EMPTY_RENEGOTIATION_INFO_SCSV signaling cipher suite value in the
                 * ClientHello. Including both is NOT RECOMMENDED.
                 */
                bool noRenegExt = (null == TlsUtilities.GetExtensionData(state.clientExtensions,
                    ExtensionType.renegotiation_info));
                bool noRenegScsv = !Arrays.Contains(state.offeredCipherSuites,
                    CipherSuite.TLS_EMPTY_RENEGOTIATION_INFO_SCSV);

                if (noRenegExt && noRenegScsv)
                {
                    state.offeredCipherSuites = Arrays.Append(state.offeredCipherSuites,
                        CipherSuite.TLS_EMPTY_RENEGOTIATION_INFO_SCSV);
                }
            }

            /* (Fallback SCSV)
             * RFC 7507 4. If a client sends a ClientHello.client_version containing a lower value
             * than the latest (highest-valued) version supported by the client, it SHOULD include
             * the TLS_FALLBACK_SCSV cipher suite value in ClientHello.cipher_suites [..]. (The
             * client SHOULD put TLS_FALLBACK_SCSV after all cipher suites that it actually intends
             * to negotiate.)
             */
            if (fallback && !Arrays.Contains(state.offeredCipherSuites, CipherSuite.TLS_FALLBACK_SCSV))
            {
                state.offeredCipherSuites = Arrays.Append(state.offeredCipherSuites, CipherSuite.TLS_FALLBACK_SCSV);
            }

            // Heartbeats
            {
                state.heartbeat = state.client.GetHeartbeat();
                state.heartbeatPolicy = state.client.GetHeartbeatPolicy();

                if (null != state.heartbeat || HeartbeatMode.peer_allowed_to_send == state.heartbeatPolicy)
                {
                    TlsExtensionsUtilities.AddHeartbeatExtension(state.clientExtensions,
                        new HeartbeatExtension(state.heartbeatPolicy));
                }
            }



            ClientHello clientHello = new ClientHello(legacy_version, securityParameters.ClientRandom, session_id,
                TlsUtilities.EmptyBytes, state.offeredCipherSuites, state.clientExtensions, 0);

            MemoryStream buf = new MemoryStream();
            clientHello.Encode(state.clientContext, buf);
            return buf.ToArray();
        }

        /// <exception cref="IOException"/>
        protected virtual byte[] GenerateClientKeyExchange(ClientHandshakeState state)
        {
            MemoryStream buf = new MemoryStream();
            state.keyExchange.GenerateClientKeyExchange(buf);
            return buf.ToArray();
        }

        protected virtual void InvalidateSession(ClientHandshakeState state)
        {
            if (state.sessionMasterSecret != null)
            {
                state.sessionMasterSecret.Destroy();
                state.sessionMasterSecret = null;
            }

            if (state.sessionParameters != null)
            {
                state.sessionParameters.Clear();
                state.sessionParameters = null;
            }

            if (state.tlsSession != null)
            {
                state.tlsSession.Invalidate();
                state.tlsSession = null;
            }
        }

        /// <exception cref="IOException"/>
        protected virtual void ProcessCertificateRequest(ClientHandshakeState state, byte[] body)
        {
            if (null == state.authentication)
            {
                /*
                 * RFC 2246 7.4.4. It is a fatal handshake_failure alert for an anonymous server to
                 * request client identification.
                 */
                throw new TlsFatalAlert(AlertDescription.handshake_failure);
            }

            MemoryStream buf = new MemoryStream(body, false);

            CertificateRequest certificateRequest = CertificateRequest.Parse(state.clientContext, buf);

            TlsProtocol.AssertEmpty(buf);

            state.certificateRequest = TlsUtilities.ValidateCertificateRequest(certificateRequest, state.keyExchange);
        }

        /// <exception cref="IOException"/>
        protected virtual void ProcessCertificateStatus(ClientHandshakeState state, byte[] body)
        {
            MemoryStream buf = new MemoryStream(body, false);

            // TODO[tls13] Ensure this cannot happen for (D)TLS1.3+
            state.certificateStatus = CertificateStatus.Parse(state.clientContext, buf);

            TlsProtocol.AssertEmpty(buf);
        }

        /// <exception cref="IOException"/>
        protected virtual byte[] ProcessHelloVerifyRequest(ClientHandshakeState state, byte[] body)
        {
            MemoryStream buf = new MemoryStream(body, false);

            ProtocolVersion server_version = TlsUtilities.ReadVersion(buf);

            /*
             * RFC 6347 This specification increases the cookie size limit to 255 bytes for greater
             * future flexibility. The limit remains 32 for previous versions of DTLS.
             */
            int maxCookieLength = ProtocolVersion.DTLSv12.IsEqualOrEarlierVersionOf(server_version) ? 255 : 32;

            byte[] cookie = TlsUtilities.ReadOpaque8(buf, 0, maxCookieLength);

            TlsProtocol.AssertEmpty(buf);

            // TODO Seems this behaviour is not yet in line with OpenSSL for DTLS 1.2
            //ReportServerVersion(state, server_version);
            if (!server_version.IsEqualOrEarlierVersionOf(state.clientContext.ClientVersion))
                throw new TlsFatalAlert(AlertDescription.illegal_parameter);

            return cookie;
        }

        /// <exception cref="IOException"/>
        protected virtual void ProcessNewSessionTicket(ClientHandshakeState state, byte[] body)
        {
            MemoryStream buf = new MemoryStream(body, false);

            NewSessionTicket newSessionTicket = NewSessionTicket.Parse(buf);

            TlsProtocol.AssertEmpty(buf);

            state.client.NotifyNewSessionTicket(newSessionTicket);
        }

        /// <exception cref="IOException"/>
        protected virtual void ProcessServerCertificate(ClientHandshakeState state, byte[] body)
        {
            state.authentication = TlsUtilities.ReceiveServerCertificate(state.clientContext, state.client,
                new MemoryStream(body, false));
        }

        /// <exception cref="IOException"/>
        protected virtual void ProcessServerHello(ClientHandshakeState state, byte[] body)
        {
            MemoryStream buf = new MemoryStream(body, false);

            ServerHello serverHello = ServerHello.Parse(buf);
            ProtocolVersion server_version = serverHello.Version;

            state.serverExtensions = serverHello.Extensions;



            SecurityParameters securityParameters = state.clientContext.SecurityParameters;

            // TODO[dtls13] Check supported_version extension for negotiated version

            ReportServerVersion(state, server_version);

            securityParameters.m_serverRandom = serverHello.Random;

            if (!state.clientContext.ClientVersion.Equals(server_version))
            {
                TlsUtilities.CheckDowngradeMarker(server_version, securityParameters.ServerRandom);
            }

            {
                byte[] selectedSessionID = serverHello.SessionID;
                securityParameters.m_sessionID = selectedSessionID;
                state.client.NotifySessionID(selectedSessionID);
                state.resumedSession = selectedSessionID.Length > 0 && state.tlsSession != null
                    && Arrays.AreEqual(selectedSessionID, state.tlsSession.SessionID);
            }

            /*
             * Find out which CipherSuite the server has chosen and check that it was one of the offered
             * ones, and is a valid selection for the negotiated version.
             */
            {
                int cipherSuite = ValidateSelectedCipherSuite(serverHello.CipherSuite,
                    AlertDescription.illegal_parameter);

                if (!TlsUtilities.IsValidCipherSuiteSelection(state.offeredCipherSuites, cipherSuite) ||
                    !TlsUtilities.IsValidVersionForCipherSuite(cipherSuite, securityParameters.NegotiatedVersion))
                {
                    throw new TlsFatalAlert(AlertDescription.illegal_parameter);
                }

                TlsUtilities.NegotiatedCipherSuite(securityParameters, cipherSuite);
                state.client.NotifySelectedCipherSuite(cipherSuite);
            }

            /*
             * RFC3546 2.2 The extended server hello message format MAY be sent in place of the server
             * hello message when the client has requested extended functionality via the extended
             * client hello message specified in Section 2.1. ... Note that the extended server hello
             * message is only sent in response to an extended client hello message. This prevents the
             * possibility that the extended server hello message could "break" existing TLS 1.0
             * clients.
             */

            /*
             * TODO RFC 3546 2.3 If [...] the older session is resumed, then the server MUST ignore
             * extensions appearing in the client hello, and send a server hello containing no
             * extensions.
             */

            /*
             * RFC 7627 4. Clients and servers SHOULD NOT accept handshakes that do not use the extended
             * master secret [..]. (and see 5.2, 5.3)
             * 
             * RFC 8446 Appendix D. Because TLS 1.3 always hashes in the transcript up to the server
             * Finished, implementations which support both TLS 1.3 and earlier versions SHOULD indicate
             * the use of the Extended Master Secret extension in their APIs whenever TLS 1.3 is used.
             */
            if (TlsUtilities.IsTlsV13(server_version))
            {
                securityParameters.m_extendedMasterSecret = true;
            }
            else
            {
                bool acceptedExtendedMasterSecret = TlsExtensionsUtilities.HasExtendedMasterSecretExtension(
                    state.serverExtensions);

                if (acceptedExtendedMasterSecret)
                {
                    if (!state.resumedSession && !state.client.ShouldUseExtendedMasterSecret())
                        throw new TlsFatalAlert(AlertDescription.handshake_failure);
                }
                else
                {
                    if (state.client.RequiresExtendedMasterSecret()
                        || (state.resumedSession && !state.client.AllowLegacyResumption()))
                    {
                        throw new TlsFatalAlert(AlertDescription.handshake_failure);
                    }
                }

                securityParameters.m_extendedMasterSecret = acceptedExtendedMasterSecret;
            }

            /*
             * 
             * RFC 3546 2.2 Note that the extended server hello message is only sent in response to an
             * extended client hello message. However, see RFC 5746 exception below. We always include
             * the SCSV, so an Extended Server Hello is always allowed.
             */
            if (state.serverExtensions != null)
            {
                foreach (int extType in state.serverExtensions.Keys)
                {
                    /*
                     * RFC 5746 3.6. Note that sending a "renegotiation_info" extension in response to a
                     * ClientHello containing only the SCSV is an explicit exception to the prohibition
                     * in RFC 5246, Section 7.4.1.4, on the server sending unsolicited extensions and is
                     * only allowed because the client is signaling its willingness to receive the
                     * extension via the TLS_EMPTY_RENEGOTIATION_INFO_SCSV SCSV.
                     */
                    if (extType == ExtensionType.renegotiation_info)
                        continue;

                    /*
                     * RFC 5246 7.4.1.4 An extension type MUST NOT appear in the ServerHello unless the
                     * same extension type appeared in the corresponding ClientHello. If a client
                     * receives an extension type in ServerHello that it did not request in the
                     * associated ClientHello, it MUST abort the handshake with an unsupported_extension
                     * fatal alert.
                     */
                    if (null == TlsUtilities.GetExtensionData(state.clientExtensions, extType))
                        throw new TlsFatalAlert(AlertDescription.unsupported_extension);

                    /*
                     * RFC 3546 2.3. If [...] the older session is resumed, then the server MUST ignore
                     * extensions appearing in the client hello, and send a server hello containing no
                     * extensions[.]
                     */
                    if (state.resumedSession)
                    {
                        // TODO[compat-gnutls] GnuTLS test server sends server extensions e.g. ec_point_formats
                        // TODO[compat-openssl] OpenSSL test server sends server extensions e.g. ec_point_formats
                        // TODO[compat-polarssl] PolarSSL test server sends server extensions e.g. ec_point_formats
                        //throw new TlsFatalAlert(AlertDescription.illegal_parameter);
                    }
                }
            }

            /*
             * RFC 5746 3.4. Client Behavior: Initial Handshake
             */
            {
                /*
                 * When a ServerHello is received, the client MUST check if it includes the
                 * "renegotiation_info" extension:
                 */
                byte[] renegExtData = TlsUtilities.GetExtensionData(state.serverExtensions,
                    ExtensionType.renegotiation_info);
                if (renegExtData != null)
                {
                    /*
                     * If the extension is present, set the secure_renegotiation flag to TRUE. The
                     * client MUST then verify that the length of the "renegotiated_connection"
                     * field is zero, and if it is not, MUST abort the handshake (by sending a fatal
                     * handshake_failure alert).
                     */
                    securityParameters.m_secureRenegotiation = true;

                    if (!Arrays.ConstantTimeAreEqual(renegExtData,
                        TlsProtocol.CreateRenegotiationInfo(TlsUtilities.EmptyBytes)))
                    {
                        throw new TlsFatalAlert(AlertDescription.handshake_failure);
                    }
                }
            }

            // TODO[compat-gnutls] GnuTLS test server fails to send renegotiation_info extension when resuming
            state.client.NotifySecureRenegotiation(securityParameters.IsSecureRenegotiation);

            /*
             * RFC 7301 3.1. When session resumption or session tickets [...] are used, the previous
             * contents of this extension are irrelevant, and only the values in the new handshake
             * messages are considered.
             */
            securityParameters.m_applicationProtocol = TlsExtensionsUtilities.GetAlpnExtensionServer(
                state.serverExtensions);
            securityParameters.m_applicationProtocolSet = true;

            // Heartbeats
            {
                HeartbeatExtension heartbeatExtension = TlsExtensionsUtilities.GetHeartbeatExtension(
                    state.serverExtensions);
                if (null == heartbeatExtension)
                {
                    state.heartbeat = null;
                    state.heartbeatPolicy = HeartbeatMode.peer_not_allowed_to_send;
                }
                else if (HeartbeatMode.peer_allowed_to_send != heartbeatExtension.Mode)
                {
                    state.heartbeat = null;
                }
            }



            var sessionClientExtensions = state.clientExtensions;
            var sessionServerExtensions = state.serverExtensions;

            if (state.resumedSession)
            {
                if (securityParameters.CipherSuite != state.sessionParameters.CipherSuite
                    || !server_version.Equals(state.sessionParameters.NegotiatedVersion))
                {
                    throw new TlsFatalAlert(AlertDescription.illegal_parameter);
                }

                sessionClientExtensions = null;
                sessionServerExtensions = state.sessionParameters.ReadServerExtensions();
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
                    bool serverSentEncryptThenMac = TlsExtensionsUtilities.HasEncryptThenMacExtension(
                        sessionServerExtensions);
                    if (serverSentEncryptThenMac && !TlsUtilities.IsBlockCipherSuite(securityParameters.CipherSuite))
                        throw new TlsFatalAlert(AlertDescription.illegal_parameter);

                    securityParameters.m_encryptThenMac = serverSentEncryptThenMac;
                }

                securityParameters.m_maxFragmentLength = EvaluateMaxFragmentLengthExtension(state.resumedSession,
                    sessionClientExtensions, sessionServerExtensions, AlertDescription.illegal_parameter);

                securityParameters.m_truncatedHmac = TlsExtensionsUtilities.HasTruncatedHmacExtension(
                    sessionServerExtensions);

                if (!state.resumedSession)
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
                }

                state.expectSessionTicket = !state.resumedSession
                    && TlsUtilities.HasExpectedEmptyExtensionData(sessionServerExtensions,
                        ExtensionType.session_ticket, AlertDescription.illegal_parameter);
            }

            if (sessionClientExtensions != null)
            {
                state.client.ProcessServerExtensions(sessionServerExtensions);
            }
        }

        /// <exception cref="IOException"/>
        protected virtual void ProcessServerKeyExchange(ClientHandshakeState state, byte[] body)
        {
            MemoryStream buf = new MemoryStream(body, false);
            state.keyExchange.ProcessServerKeyExchange(buf);
            TlsProtocol.AssertEmpty(buf);
        }

        /// <exception cref="IOException"/>
        protected virtual void ProcessServerSupplementalData(ClientHandshakeState state, byte[] body)
        {
            MemoryStream buf = new MemoryStream(body, false);
            var serverSupplementalData = TlsProtocol.ReadSupplementalDataMessage(buf);
            state.client.ProcessServerSupplementalData(serverSupplementalData);
        }

        /// <exception cref="IOException"/>
        protected virtual void ReportServerVersion(ClientHandshakeState state, ProtocolVersion server_version)
        {
            TlsClientContextImpl context = state.clientContext;
            SecurityParameters securityParameters = context.SecurityParameters;

            ProtocolVersion currentServerVersion = securityParameters.NegotiatedVersion;
            if (null != currentServerVersion)
            {
                if (!currentServerVersion.Equals(server_version))
                    throw new TlsFatalAlert(AlertDescription.illegal_parameter);

                return;
            }

            if (!ProtocolVersion.Contains(context.ClientSupportedVersions, server_version))
                throw new TlsFatalAlert(AlertDescription.protocol_version);

            securityParameters.m_negotiatedVersion = server_version;

            TlsUtilities.NegotiatedVersionDtlsClient(state.clientContext, state.client);
        }

        /// <exception cref="IOException"/>
        protected static byte[] PatchClientHelloWithCookie(byte[] clientHelloBody, byte[] cookie)
        {
            int sessionIDPos = 34;
            int sessionIDLength = TlsUtilities.ReadUint8(clientHelloBody, sessionIDPos);

            int cookieLengthPos = sessionIDPos + 1 + sessionIDLength;
            int cookiePos = cookieLengthPos + 1;

            byte[] patched = new byte[clientHelloBody.Length + cookie.Length];
            Array.Copy(clientHelloBody, 0, patched, 0, cookieLengthPos);
            TlsUtilities.CheckUint8(cookie.Length);
            TlsUtilities.WriteUint8(cookie.Length, patched, cookieLengthPos);
            Array.Copy(cookie, 0, patched, cookiePos, cookie.Length);
            Array.Copy(clientHelloBody, cookiePos, patched, cookiePos + cookie.Length,
                clientHelloBody.Length - cookiePos);

            return patched;
        }

        protected internal class ClientHandshakeState
        {
            internal TlsClient client = null;
            internal TlsClientContextImpl clientContext = null;
            internal TlsSession tlsSession = null;
            internal SessionParameters sessionParameters = null;
            internal TlsSecret sessionMasterSecret = null;
            internal SessionParameters.Builder sessionParametersBuilder = null;
            internal int[] offeredCipherSuites = null;
            internal IDictionary<int, byte[]> clientExtensions = null;
            internal IDictionary<int, byte[]> serverExtensions = null;
            internal bool resumedSession = false;
            internal bool expectSessionTicket = false;
            internal IDictionary<int, TlsAgreement> clientAgreements = null;
            internal TlsKeyExchange keyExchange = null;
            internal TlsAuthentication authentication = null;
            internal CertificateStatus certificateStatus = null;
            internal CertificateRequest certificateRequest = null;
            internal TlsHeartbeat heartbeat = null;
            internal short heartbeatPolicy = HeartbeatMode.peer_not_allowed_to_send;
        }
    }
}
