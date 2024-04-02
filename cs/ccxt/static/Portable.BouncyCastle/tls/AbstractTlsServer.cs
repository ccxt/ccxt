using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Tls.Crypto;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Tls
{
    /// <summary>Base class for a TLS server.</summary>
    public abstract class AbstractTlsServer
        : AbstractTlsPeer, TlsServer
    {
        protected TlsServerContext m_context;
        protected ProtocolVersion[] m_protocolVersions;
        protected int[] m_cipherSuites;

        protected int[] m_offeredCipherSuites;
        protected IDictionary<int, byte[]> m_clientExtensions;

        protected bool m_encryptThenMACOffered;
        protected short m_maxFragmentLengthOffered;
        protected bool m_truncatedHMacOffered;
        protected bool m_clientSentECPointFormats;
        protected CertificateStatusRequest m_certificateStatusRequest;
        protected IList<CertificateStatusRequestItemV2> m_statusRequestV2;
        protected IList<TrustedAuthority> m_trustedCAKeys;

        protected int m_selectedCipherSuite;
        protected IList<ProtocolName> m_clientProtocolNames;
        protected ProtocolName m_selectedProtocolName;

        protected readonly IDictionary<int, byte[]> m_serverExtensions = new Dictionary<int, byte[]>();

        public AbstractTlsServer(TlsCrypto crypto)
            : base(crypto)
        {
        }

        protected virtual bool AllowCertificateStatus()
        {
            return true;
        }

        protected virtual bool AllowEncryptThenMac()
        {
            return true;
        }

        protected virtual bool AllowMultiCertStatus()
        {
            return false;
        }

        protected virtual bool AllowTruncatedHmac()
        {
            return false;
        }

        protected virtual bool AllowTrustedCAIndication()
        {
            return false;
        }

        protected virtual int GetMaximumNegotiableCurveBits()
        {
            int[] clientSupportedGroups = m_context.SecurityParameters.ClientSupportedGroups;
            if (clientSupportedGroups == null)
            {
                /*
                 * RFC 4492 4. A client that proposes ECC cipher suites may choose not to include these
                 * extensions. In this case, the server is free to choose any one of the elliptic curves
                 * or point formats [...].
                 */
                return NamedGroup.GetMaximumCurveBits();
            }

            int maxBits = 0;
            for (int i = 0; i < clientSupportedGroups.Length; ++i)
            {
                maxBits = System.Math.Max(maxBits, NamedGroup.GetCurveBits(clientSupportedGroups[i]));
            }
            return maxBits;
        }

        protected virtual int GetMaximumNegotiableFiniteFieldBits()
        {
            int[] clientSupportedGroups = m_context.SecurityParameters.ClientSupportedGroups;
            if (clientSupportedGroups == null)
            {
                return NamedGroup.GetMaximumFiniteFieldBits();
            }

            int maxBits = 0;
            for (int i = 0; i < clientSupportedGroups.Length; ++i)
            {
                maxBits = System.Math.Max(maxBits, NamedGroup.GetFiniteFieldBits(clientSupportedGroups[i]));
            }
            return maxBits;
        }

        protected virtual IList<ProtocolName> GetProtocolNames()
        {
            return null;
        }

        protected virtual bool IsSelectableCipherSuite(int cipherSuite, int availCurveBits, int availFiniteFieldBits,
            IList<short> sigAlgs)
        {
            // TODO[tls13] The version check should be separated out (eventually select ciphersuite before version)
            return TlsUtilities.IsValidVersionForCipherSuite(cipherSuite, m_context.ServerVersion)
                && availCurveBits >= TlsEccUtilities.GetMinimumCurveBits(cipherSuite)
                && availFiniteFieldBits >= TlsDHUtilities.GetMinimumFiniteFieldBits(cipherSuite)
                && TlsUtilities.IsValidCipherSuiteForSignatureAlgorithms(cipherSuite, sigAlgs);
        }

        protected virtual bool PreferLocalCipherSuites()
        {
            return false;
        }

        /// <exception cref="IOException"/>
        protected virtual bool SelectCipherSuite(int cipherSuite)
        {
            this.m_selectedCipherSuite = cipherSuite;
            return true;
        }

        protected virtual int SelectDH(int minimumFiniteFieldBits)
        {
            int[] clientSupportedGroups = m_context.SecurityParameters.ClientSupportedGroups;
            if (clientSupportedGroups == null)
                return SelectDHDefault(minimumFiniteFieldBits);

            // Try to find a supported named group of the required size from the client's list.
            for (int i = 0; i < clientSupportedGroups.Length; ++i)
            {
                int namedGroup = clientSupportedGroups[i];
                if (NamedGroup.GetFiniteFieldBits(namedGroup) >= minimumFiniteFieldBits)
                    return namedGroup;
            }

            return -1;
        }

        protected virtual int SelectDHDefault(int minimumFiniteFieldBits)
        {
            return minimumFiniteFieldBits <= 2048 ? NamedGroup.ffdhe2048
                :  minimumFiniteFieldBits <= 3072 ? NamedGroup.ffdhe3072
                :  minimumFiniteFieldBits <= 4096 ? NamedGroup.ffdhe4096
                :  minimumFiniteFieldBits <= 6144 ? NamedGroup.ffdhe6144
                :  minimumFiniteFieldBits <= 8192 ? NamedGroup.ffdhe8192
                :  -1;
        }

        protected virtual int SelectECDH(int minimumCurveBits)
        {
            int[] clientSupportedGroups = m_context.SecurityParameters.ClientSupportedGroups;
            if (clientSupportedGroups == null)
                return SelectECDHDefault(minimumCurveBits);

            // Try to find a supported named group of the required size from the client's list.
            for (int i = 0; i < clientSupportedGroups.Length; ++i)
            {
                int namedGroup = clientSupportedGroups[i];
                if (NamedGroup.GetCurveBits(namedGroup) >= minimumCurveBits)
                    return namedGroup;
            }

            return -1;
        }

        protected virtual int SelectECDHDefault(int minimumCurveBits)
        {
            return minimumCurveBits <= 256 ? NamedGroup.secp256r1
                :  minimumCurveBits <= 384 ? NamedGroup.secp384r1
                :  minimumCurveBits <= 521 ? NamedGroup.secp521r1
                :  -1;
        }

        protected virtual ProtocolName SelectProtocolName()
        {
            IList<ProtocolName> serverProtocolNames = GetProtocolNames();
            if (null == serverProtocolNames || serverProtocolNames.Count < 1)
                return null;

            ProtocolName result = SelectProtocolName(m_clientProtocolNames, serverProtocolNames);
            if (null == result)
                throw new TlsFatalAlert(AlertDescription.no_application_protocol);

            return result;
        }

        protected virtual ProtocolName SelectProtocolName(IList<ProtocolName> clientProtocolNames,
            IList<ProtocolName> serverProtocolNames)
        {
            foreach (ProtocolName serverProtocolName in serverProtocolNames)
            {
                if (clientProtocolNames.Contains(serverProtocolName))
                    return serverProtocolName;
            }
            return null;
        }

        protected virtual bool ShouldSelectProtocolNameEarly()
        {
            return true;
        }

        public virtual void Init(TlsServerContext context)
        {
            this.m_context = context;

            this.m_protocolVersions = GetSupportedVersions();
            this.m_cipherSuites = GetSupportedCipherSuites();
        }

        public override ProtocolVersion[] GetProtocolVersions()
        {
            return m_protocolVersions;
        }

        public override int[] GetCipherSuites()
        {
            return m_cipherSuites;
        }

        public override void NotifyHandshakeBeginning()
        {
            base.NotifyHandshakeBeginning();

            this.m_offeredCipherSuites = null;
            this.m_clientExtensions = null;
            this.m_encryptThenMACOffered = false;
            this.m_maxFragmentLengthOffered = 0;
            this.m_truncatedHMacOffered = false;
            this.m_clientSentECPointFormats = false;
            this.m_certificateStatusRequest = null;
            this.m_selectedCipherSuite = -1;
            this.m_selectedProtocolName = null;
            this.m_serverExtensions.Clear();
        }

        public virtual TlsSession GetSessionToResume(byte[] sessionID)
        {
            return null;
        }

        public virtual byte[] GetNewSessionID()
        {
            return null;
        }

        public virtual TlsPskExternal GetExternalPsk(IList<PskIdentity> identities)
        {
            return null;
        }

        public virtual void NotifySession(TlsSession session)
        {
        }

        public virtual void NotifyClientVersion(ProtocolVersion clientVersion)
        {
        }

        public virtual void NotifyFallback(bool isFallback)
        {
            /*
             * RFC 7507 3. If TLS_FALLBACK_SCSV appears in ClientHello.cipher_suites and the highest
             * protocol version supported by the server is higher than the version indicated in
             * ClientHello.client_version, the server MUST respond with a fatal inappropriate_fallback
             * alert [..].
             */
            if (isFallback)
            {
                ProtocolVersion[] serverVersions = GetProtocolVersions();
                ProtocolVersion clientVersion = m_context.ClientVersion;

                ProtocolVersion latestServerVersion;
                if (clientVersion.IsTls)
                {
                    latestServerVersion = ProtocolVersion.GetLatestTls(serverVersions);
                }
                else if (clientVersion.IsDtls)
                {
                    latestServerVersion = ProtocolVersion.GetLatestDtls(serverVersions);
                }
                else
                {
                    throw new TlsFatalAlert(AlertDescription.internal_error);
                }

                if (null != latestServerVersion && latestServerVersion.IsLaterVersionOf(clientVersion))
                {
                    throw new TlsFatalAlert(AlertDescription.inappropriate_fallback);
                }
            }
        }

        public virtual void NotifyOfferedCipherSuites(int[] offeredCipherSuites)
        {
            this.m_offeredCipherSuites = offeredCipherSuites;
        }

        public virtual void ProcessClientExtensions(IDictionary<int, byte[]> clientExtensions)
        {
            this.m_clientExtensions = clientExtensions;

            if (null != clientExtensions)
            {
                this.m_clientProtocolNames = TlsExtensionsUtilities.GetAlpnExtensionClient(clientExtensions);

                if (ShouldSelectProtocolNameEarly())
                {
                    if (null != m_clientProtocolNames && m_clientProtocolNames.Count > 0)
                    {
                        this.m_selectedProtocolName = SelectProtocolName();
                    }
                }

                // TODO[tls13] Don't need these if we have negotiated (D)TLS 1.3+
                {
                    this.m_encryptThenMACOffered = TlsExtensionsUtilities.HasEncryptThenMacExtension(clientExtensions);
                    this.m_truncatedHMacOffered = TlsExtensionsUtilities.HasTruncatedHmacExtension(clientExtensions);
                    this.m_statusRequestV2 = TlsExtensionsUtilities.GetStatusRequestV2Extension(clientExtensions);
                    this.m_trustedCAKeys = TlsExtensionsUtilities.GetTrustedCAKeysExtensionClient(clientExtensions);

                    // We only support uncompressed format, this is just to validate the extension, and note its presence.
                    this.m_clientSentECPointFormats =
                        null != TlsExtensionsUtilities.GetSupportedPointFormatsExtension(clientExtensions);
                }

                this.m_certificateStatusRequest = TlsExtensionsUtilities.GetStatusRequestExtension(clientExtensions);

                this.m_maxFragmentLengthOffered = TlsExtensionsUtilities.GetMaxFragmentLengthExtension(clientExtensions);
                if (m_maxFragmentLengthOffered >= 0 && !MaxFragmentLength.IsValid(m_maxFragmentLengthOffered))
                    throw new TlsFatalAlert(AlertDescription.illegal_parameter);
            }
        }

        public virtual ProtocolVersion GetServerVersion()
        {
            ProtocolVersion[] serverVersions = GetProtocolVersions();
            ProtocolVersion[] clientVersions = m_context.ClientSupportedVersions;

            foreach (ProtocolVersion clientVersion in clientVersions)
            {
                if (ProtocolVersion.Contains(serverVersions, clientVersion))
                    return clientVersion;
            }

            throw new TlsFatalAlert(AlertDescription.protocol_version);
        }

        public virtual int[] GetSupportedGroups()
        {
            // TODO[tls13] The rest of this class assumes all named groups are supported
            return new int[]{ NamedGroup.x25519, NamedGroup.x448, NamedGroup.secp256r1, NamedGroup.secp384r1,
                NamedGroup.ffdhe2048, NamedGroup.ffdhe3072, NamedGroup.ffdhe4096 };
        }

        public virtual int GetSelectedCipherSuite()
        {
            SecurityParameters securityParameters = m_context.SecurityParameters;
            ProtocolVersion negotiatedVersion = securityParameters.NegotiatedVersion;

            if (TlsUtilities.IsTlsV13(negotiatedVersion))
            {
                int commonCipherSuite13 = TlsUtilities.GetCommonCipherSuite13(negotiatedVersion, m_offeredCipherSuites,
                    GetCipherSuites(), PreferLocalCipherSuites());

                if (commonCipherSuite13 >= 0 && SelectCipherSuite(commonCipherSuite13))
                {
                    return commonCipherSuite13;
                }
            }
            else
            {
                /*
                 * RFC 5246 7.4.3. In order to negotiate correctly, the server MUST check any candidate
                 * cipher suites against the "signature_algorithms" extension before selecting them. This is
                 * somewhat inelegant but is a compromise designed to minimize changes to the original
                 * cipher suite design.
                 */
                var sigAlgs = TlsUtilities.GetUsableSignatureAlgorithms(securityParameters.ClientSigAlgs);

                /*
                 * RFC 4429 5.1. A server that receives a ClientHello containing one or both of these
                 * extensions MUST use the client's enumerated capabilities to guide its selection of an
                 * appropriate cipher suite. One of the proposed ECC cipher suites must be negotiated only
                 * if the server can successfully complete the handshake while using the curves and point
                 * formats supported by the client [...].
                 */
                int availCurveBits = GetMaximumNegotiableCurveBits();
                int availFiniteFieldBits = GetMaximumNegotiableFiniteFieldBits();

                int[] cipherSuites = TlsUtilities.GetCommonCipherSuites(m_offeredCipherSuites, GetCipherSuites(),
                    PreferLocalCipherSuites());

                for (int i = 0; i < cipherSuites.Length; ++i)
                {
                    int cipherSuite = cipherSuites[i];
                    if (IsSelectableCipherSuite(cipherSuite, availCurveBits, availFiniteFieldBits, sigAlgs)
                        && SelectCipherSuite(cipherSuite))
                    {
                        return cipherSuite;
                    }
                }
            }

            throw new TlsFatalAlert(AlertDescription.handshake_failure, "No selectable cipher suite");
        }

        // IDictionary is (Int32 -> byte[])
        public virtual IDictionary<int, byte[]> GetServerExtensions()
        {
            bool isTlsV13 = TlsUtilities.IsTlsV13(m_context);

            if (isTlsV13)
            {
                if (null != m_certificateStatusRequest && AllowCertificateStatus())
                {
                    /*
                     * TODO[tls13] RFC 8446 4.4.2.1. OCSP Status and SCT Extensions.
                     * 
                     * OCSP information is carried in an extension for a CertificateEntry.
                     */
                }
            }
            else
            {
                if (m_encryptThenMACOffered && AllowEncryptThenMac())
                {
                    /*
                     * RFC 7366 3. If a server receives an encrypt-then-MAC request extension from a client
                     * and then selects a stream or Authenticated Encryption with Associated Data (AEAD)
                     * ciphersuite, it MUST NOT send an encrypt-then-MAC response extension back to the
                     * client.
                     */
                    if (TlsUtilities.IsBlockCipherSuite(m_selectedCipherSuite))
                    {
                        TlsExtensionsUtilities.AddEncryptThenMacExtension(m_serverExtensions);
                    }
                }

                if (m_truncatedHMacOffered && AllowTruncatedHmac())
                {
                    TlsExtensionsUtilities.AddTruncatedHmacExtension(m_serverExtensions);
                }

                if (m_clientSentECPointFormats && TlsEccUtilities.IsEccCipherSuite(m_selectedCipherSuite))
                {
                    /*
                     * RFC 4492 5.2. A server that selects an ECC cipher suite in response to a ClientHello
                     * message including a Supported Point Formats Extension appends this extension (along
                     * with others) to its ServerHello message, enumerating the point formats it can parse.
                     */
                    TlsExtensionsUtilities.AddSupportedPointFormatsExtension(m_serverExtensions,
                        new short[]{ ECPointFormat.uncompressed });
                }

                // TODO[tls13] See RFC 8446 4.4.2.1
                if (null != m_statusRequestV2 && AllowMultiCertStatus())
                {
                    /*
                     * RFC 6961 2.2. If a server returns a "CertificateStatus" message in response to a
                     * "status_request_v2" request, then the server MUST have included an extension of type
                     * "status_request_v2" with empty "extension_data" in the extended server hello..
                     */
                    TlsExtensionsUtilities.AddEmptyExtensionData(m_serverExtensions, ExtensionType.status_request_v2);
                }
                else if (null != this.m_certificateStatusRequest && AllowCertificateStatus())
                {
                    /*
                     * RFC 6066 8. If a server returns a "CertificateStatus" message, then the server MUST
                     * have included an extension of type "status_request" with empty "extension_data" in
                     * the extended server hello.
                     */
                    TlsExtensionsUtilities.AddEmptyExtensionData(m_serverExtensions, ExtensionType.status_request);
                }

                if (null != m_trustedCAKeys && AllowTrustedCAIndication())
                {
                    TlsExtensionsUtilities.AddTrustedCAKeysExtensionServer(m_serverExtensions);
                }
            }

            if (m_maxFragmentLengthOffered >= 0 && MaxFragmentLength.IsValid(m_maxFragmentLengthOffered))
            {
                TlsExtensionsUtilities.AddMaxFragmentLengthExtension(m_serverExtensions, m_maxFragmentLengthOffered);
            }

            return m_serverExtensions;
        }

        public virtual void GetServerExtensionsForConnection(IDictionary<int, byte[]> serverExtensions)
        {
            if (!ShouldSelectProtocolNameEarly())
            {
                if (null != m_clientProtocolNames && m_clientProtocolNames.Count > 0)
                {
                    this.m_selectedProtocolName = SelectProtocolName();
                }
            }

            /*
             * RFC 7301 3.1. When session resumption or session tickets [...] are used, the previous
             * contents of this extension are irrelevant, and only the values in the new handshake
             * messages are considered.
             */
            if (null == m_selectedProtocolName)
            {
                serverExtensions.Remove(ExtensionType.application_layer_protocol_negotiation);
            }
            else
            {
                TlsExtensionsUtilities.AddAlpnExtensionServer(serverExtensions, m_selectedProtocolName);
            }
        }

        public virtual IList<SupplementalDataEntry> GetServerSupplementalData()
        {
            return null;
        }

        public abstract TlsCredentials GetCredentials();

        public virtual CertificateStatus GetCertificateStatus()
        {
            return null;
        }

        public virtual CertificateRequest GetCertificateRequest()
        {
            return null;
        }

        public virtual TlsPskIdentityManager GetPskIdentityManager()
        {
            return null;
        }

        public virtual TlsSrpLoginParameters GetSrpLoginParameters()
        {
            return null;
        }

        public virtual TlsDHConfig GetDHConfig()
        {
            int minimumFiniteFieldBits = TlsDHUtilities.GetMinimumFiniteFieldBits(m_selectedCipherSuite);
            int namedGroup = SelectDH(minimumFiniteFieldBits);
            return TlsDHUtilities.CreateNamedDHConfig(m_context, namedGroup);
        }

        public virtual TlsECConfig GetECDHConfig()
        {
            int minimumCurveBits = TlsEccUtilities.GetMinimumCurveBits(m_selectedCipherSuite);
            int namedGroup = SelectECDH(minimumCurveBits);
            return TlsEccUtilities.CreateNamedECConfig(m_context, namedGroup);
        }

        public virtual void ProcessClientSupplementalData(IList<SupplementalDataEntry> clientSupplementalData)
        {
            if (clientSupplementalData != null)
                throw new TlsFatalAlert(AlertDescription.unexpected_message);
        }

        public virtual void NotifyClientCertificate(Certificate clientCertificate)
        {
            throw new TlsFatalAlert(AlertDescription.internal_error);
        }

        public virtual NewSessionTicket GetNewSessionTicket()
        {
            /*
             * RFC 5077 3.3. If the server determines that it does not want to include a ticket after it
             * has included the SessionTicket extension in the ServerHello, then it sends a zero-length
             * ticket in the NewSessionTicket handshake message.
             */
            return new NewSessionTicket(0L, TlsUtilities.EmptyBytes);
        }
    }
}
