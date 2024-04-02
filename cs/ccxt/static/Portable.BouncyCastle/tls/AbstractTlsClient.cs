using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Tls.Crypto;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Tls
{
    /// <summary>Base class for a TLS client.</summary>
    public abstract class AbstractTlsClient
        : AbstractTlsPeer, TlsClient
    {
        protected TlsClientContext m_context;
        protected ProtocolVersion[] m_protocolVersions;
        protected int[] m_cipherSuites;

        protected IList<int> m_supportedGroups;
        protected IList<SignatureAndHashAlgorithm> m_supportedSignatureAlgorithms;
        protected IList<SignatureAndHashAlgorithm> m_supportedSignatureAlgorithmsCert;

        protected AbstractTlsClient(TlsCrypto crypto)
            : base(crypto)
        {
        }

        /// <exception cref="IOException"/>
        protected virtual bool AllowUnexpectedServerExtension(int extensionType, byte[] extensionData)
        {
            switch (extensionType)
            {
            case ExtensionType.supported_groups:
                /*
                 * Exception added based on field reports that some servers do send this, although the
                 * Supported Elliptic Curves Extension is clearly intended to be client-only. If
                 * present, we still require that it is a valid EllipticCurveList.
                 */
                TlsExtensionsUtilities.ReadSupportedGroupsExtension(extensionData);
                return true;

            case ExtensionType.ec_point_formats:
                /*
                 * Exception added based on field reports that some servers send this even when they
                 * didn't negotiate an ECC cipher suite. If present, we still require that it is a valid
                 * ECPointFormatList.
                 */
                TlsExtensionsUtilities.ReadSupportedPointFormatsExtension(extensionData);
                return true;

            default:
                return false;
            }
        }

        protected virtual IList<int> GetNamedGroupRoles()
        {
            var namedGroupRoles = TlsUtilities.GetNamedGroupRoles(GetCipherSuites());
            var sigAlgs = m_supportedSignatureAlgorithms;
            var sigAlgsCert = m_supportedSignatureAlgorithmsCert;

            if ((null == sigAlgs || TlsUtilities.ContainsAnySignatureAlgorithm(sigAlgs, SignatureAlgorithm.ecdsa)) ||
                (null != sigAlgsCert && TlsUtilities.ContainsAnySignatureAlgorithm(sigAlgsCert, SignatureAlgorithm.ecdsa)))
            {
                TlsUtilities.AddToSet(namedGroupRoles, NamedGroupRole.ecdsa);
            }

            return namedGroupRoles;
        }

        /// <exception cref="IOException"/>
        protected virtual void CheckForUnexpectedServerExtension(IDictionary<int, byte[]> serverExtensions,
            int extensionType)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(serverExtensions, extensionType);
            if (extensionData != null && !AllowUnexpectedServerExtension(extensionType, extensionData))
                throw new TlsFatalAlert(AlertDescription.illegal_parameter);
        }

        /// <exception cref="IOException"/>
        public virtual TlsPskIdentity GetPskIdentity()
        {
            return null;
        }

        /// <exception cref="IOException"/>
        public virtual TlsSrpIdentity GetSrpIdentity()
        {
            return null;
        }

        public virtual TlsDHGroupVerifier GetDHGroupVerifier()
        {
            return new DefaultTlsDHGroupVerifier();
        }

        public virtual TlsSrpConfigVerifier GetSrpConfigVerifier()
        {
            return new DefaultTlsSrpConfigVerifier();
        }

        protected virtual IList<X509Name> GetCertificateAuthorities()
        {
            return null;
        }

        protected virtual IList<ProtocolName> GetProtocolNames()
        {
            return null;
        }

        protected virtual CertificateStatusRequest GetCertificateStatusRequest()
        {
            return new CertificateStatusRequest(CertificateStatusType.ocsp, new OcspStatusRequest(null, null));
        }

        /// <returns>an <see cref="IList{T}"/> of <see cref="CertificateStatusRequestItemV2"/> (or null).</returns>
        protected virtual IList<CertificateStatusRequestItemV2> GetMultiCertStatusRequest()
        {
            return null;
        }

        protected virtual IList<ServerName> GetSniServerNames()
        {
            return null;
        }

        /// <summary>The default <see cref="GetClientExtensions"/> implementation calls this to determine which named
        /// groups to include in the supported_groups extension for the ClientHello.</summary>
        /// <param name="namedGroupRoles">The <see cref="NamedGroupRole">named group roles</see> for which there should
        /// be at least one supported group. By default this is inferred from the offered cipher suites and signature
        /// algorithms.</param>
        /// <returns>an <see cref="IList{T}"/> of <see cref="Int32"/>. See <see cref="NamedGroup"/> for group constants.
        /// </returns>
        protected virtual IList<int> GetSupportedGroups(IList<int> namedGroupRoles)
        {
            TlsCrypto crypto = Crypto;
            var supportedGroups = new List<int>();

            if (namedGroupRoles.Contains(NamedGroupRole.ecdh))
            {
                TlsUtilities.AddIfSupported(supportedGroups, crypto,
                    new int[]{ NamedGroup.x25519, NamedGroup.x448 });
            }

            if (namedGroupRoles.Contains(NamedGroupRole.ecdh) ||
                namedGroupRoles.Contains(NamedGroupRole.ecdsa))
            {
                TlsUtilities.AddIfSupported(supportedGroups, crypto,
                    new int[]{ NamedGroup.secp256r1, NamedGroup.secp384r1 });
            }

            if (namedGroupRoles.Contains(NamedGroupRole.dh))
            {
                TlsUtilities.AddIfSupported(supportedGroups, crypto,
                    new int[]{ NamedGroup.ffdhe2048, NamedGroup.ffdhe3072, NamedGroup.ffdhe4096 });
            }

            return supportedGroups;
        }

        protected virtual IList<SignatureAndHashAlgorithm> GetSupportedSignatureAlgorithms()
        {
            return TlsUtilities.GetDefaultSupportedSignatureAlgorithms(m_context);
        }

        protected virtual IList<SignatureAndHashAlgorithm> GetSupportedSignatureAlgorithmsCert()
        {
            return null;
        }

        protected virtual IList<TrustedAuthority> GetTrustedCAIndication()
        {
            return null;
        }

        public virtual void Init(TlsClientContext context)
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

        /// <exception cref="IOException"/>
        public override void NotifyHandshakeBeginning()
        {
            base.NotifyHandshakeBeginning();

            this.m_supportedGroups = null;
            this.m_supportedSignatureAlgorithms = null;
            this.m_supportedSignatureAlgorithmsCert = null;
        }

        public virtual TlsSession GetSessionToResume()
        {
            return null;
        }

        public virtual IList<TlsPskExternal> GetExternalPsks()
        {
            return null;
        }

        public virtual bool IsFallback()
        {
            /*
             * RFC 7507 4. The TLS_FALLBACK_SCSV cipher suite value is meant for use by clients that
             * repeat a connection attempt with a downgraded protocol (perform a "fallback retry") in
             * order to work around interoperability problems with legacy servers.
             */
            return false;
        }

        /// <exception cref="IOException"/>
        public virtual IDictionary<int, byte[]> GetClientExtensions()
        {
            var clientExtensions = new Dictionary<int, byte[]>();

            bool offeringTlsV13Plus = false;
            bool offeringPreTlsV13 = false;
            {
                ProtocolVersion[] supportedVersions = GetProtocolVersions();
                for (int i = 0; i < supportedVersions.Length; ++i)
                {
                    if (TlsUtilities.IsTlsV13(supportedVersions[i]))
                    {
                        offeringTlsV13Plus = true;
                    }
                    else
                    {
                        offeringPreTlsV13 = true;
                    }
                }
            }

            var protocolNames = GetProtocolNames();
            if (protocolNames != null)
            {
                TlsExtensionsUtilities.AddAlpnExtensionClient(clientExtensions, protocolNames);
            }

            var sniServerNames = GetSniServerNames();
            if (sniServerNames != null)
            {
                TlsExtensionsUtilities.AddServerNameExtensionClient(clientExtensions, sniServerNames);
            }

            CertificateStatusRequest statusRequest = GetCertificateStatusRequest();
            if (statusRequest != null)
            {
                TlsExtensionsUtilities.AddStatusRequestExtension(clientExtensions, statusRequest);
            }

            if (offeringTlsV13Plus)
            {
                var certificateAuthorities = GetCertificateAuthorities();
                if (certificateAuthorities != null)
                {
                    TlsExtensionsUtilities.AddCertificateAuthoritiesExtension(clientExtensions, certificateAuthorities);
                }
            }

            if (offeringPreTlsV13)
            {
                // TODO Shouldn't add if no offered cipher suite uses a block cipher?
                TlsExtensionsUtilities.AddEncryptThenMacExtension(clientExtensions);

                var statusRequestV2 = GetMultiCertStatusRequest();
                if (statusRequestV2 != null)
                {
                    TlsExtensionsUtilities.AddStatusRequestV2Extension(clientExtensions, statusRequestV2);
                }

                var trustedCAKeys = GetTrustedCAIndication();
                if (trustedCAKeys != null)
                {
                    TlsExtensionsUtilities.AddTrustedCAKeysExtensionClient(clientExtensions, trustedCAKeys);
                }
            }

            ProtocolVersion clientVersion = m_context.ClientVersion;

            /*
             * RFC 5246 7.4.1.4.1. Note: this extension is not meaningful for TLS versions prior to 1.2.
             * Clients MUST NOT offer it if they are offering prior versions.
             */
            if (TlsUtilities.IsSignatureAlgorithmsExtensionAllowed(clientVersion))
            {
                var supportedSigAlgs = GetSupportedSignatureAlgorithms();
                if (null != supportedSigAlgs && supportedSigAlgs.Count > 0)
                {
                    this.m_supportedSignatureAlgorithms = supportedSigAlgs;

                    TlsExtensionsUtilities.AddSignatureAlgorithmsExtension(clientExtensions, supportedSigAlgs);
                }

                var supportedSigAlgsCert = GetSupportedSignatureAlgorithmsCert();
                if (null != supportedSigAlgsCert && supportedSigAlgsCert.Count > 0)
                {
                    this.m_supportedSignatureAlgorithmsCert = supportedSigAlgsCert;

                    TlsExtensionsUtilities.AddSignatureAlgorithmsCertExtension(clientExtensions, supportedSigAlgsCert);
                }
            }

            var namedGroupRoles = GetNamedGroupRoles();

            var supportedGroups = GetSupportedGroups(namedGroupRoles);
            if (supportedGroups != null && supportedGroups.Count > 0)
            {
                this.m_supportedGroups = supportedGroups;

                TlsExtensionsUtilities.AddSupportedGroupsExtension(clientExtensions, supportedGroups);
            }

            if (offeringPreTlsV13)
            {
                if (namedGroupRoles.Contains(NamedGroupRole.ecdh) ||
                    namedGroupRoles.Contains(NamedGroupRole.ecdsa))
                {
                    TlsExtensionsUtilities.AddSupportedPointFormatsExtension(clientExtensions,
                        new short[]{ ECPointFormat.uncompressed });
                }
            }

            return clientExtensions;
        }

        public virtual IList<int> GetEarlyKeyShareGroups()
        {
            /*
             * RFC 8446 4.2.8. Each KeyShareEntry value MUST correspond to a group offered in the
             * "supported_groups" extension and MUST appear in the same order. However, the values MAY
             * be a non-contiguous subset of the "supported_groups" extension and MAY omit the most
             * preferred groups.
             */

            if (null == m_supportedGroups || m_supportedGroups.Count < 1)
                return null;

            if (m_supportedGroups.Contains(NamedGroup.x25519))
                return TlsUtilities.VectorOfOne(NamedGroup.x25519);

            if (m_supportedGroups.Contains(NamedGroup.secp256r1))
                return TlsUtilities.VectorOfOne(NamedGroup.secp256r1);

            return TlsUtilities.VectorOfOne(m_supportedGroups[0]);
        }

        /// <exception cref="IOException"/>
        public virtual void NotifyServerVersion(ProtocolVersion serverVersion)
        {
        }

        public virtual void NotifySessionToResume(TlsSession session)
        {
        }

        public virtual void NotifySessionID(byte[] sessionID)
        {
        }

        public virtual void NotifySelectedCipherSuite(int selectedCipherSuite)
        {
        }

        /// <exception cref="IOException"/>
        public virtual void NotifySelectedPsk(TlsPsk selectedPsk)
        {
        }

        /// <exception cref="IOException"/>
        public virtual void ProcessServerExtensions(IDictionary<int, byte[]> serverExtensions)
        {
            if (null == serverExtensions)
                return;

            SecurityParameters securityParameters = m_context.SecurityParameters;
            bool isTlsV13 = TlsUtilities.IsTlsV13(securityParameters.NegotiatedVersion);

            if (isTlsV13)
            {
                /*
                 * NOTE: From TLS 1.3 the protocol classes are strict about what extensions can appear.
                 */
            }
            else
            {
                /*
                 * RFC 5246 7.4.1.4.1. Servers MUST NOT send this extension.
                 */
                CheckForUnexpectedServerExtension(serverExtensions, ExtensionType.signature_algorithms);
                CheckForUnexpectedServerExtension(serverExtensions, ExtensionType.signature_algorithms_cert);

                CheckForUnexpectedServerExtension(serverExtensions, ExtensionType.supported_groups);

                int selectedCipherSuite = securityParameters.CipherSuite;

                if (TlsEccUtilities.IsEccCipherSuite(selectedCipherSuite))
                {
                    // We only support uncompressed format, this is just to validate the extension, if present.
                    TlsExtensionsUtilities.GetSupportedPointFormatsExtension(serverExtensions);
                }
                else
                {
                    CheckForUnexpectedServerExtension(serverExtensions, ExtensionType.ec_point_formats);
                }

                /*
                 * RFC 7685 3. The server MUST NOT echo the extension.
                 */
                CheckForUnexpectedServerExtension(serverExtensions, ExtensionType.padding);
            }
        }

        /// <exception cref="IOException"/>
        public virtual void ProcessServerSupplementalData(IList<SupplementalDataEntry> serverSupplementalData)
        {
            if (serverSupplementalData != null)
                throw new TlsFatalAlert(AlertDescription.unexpected_message);
        }

        public abstract TlsAuthentication GetAuthentication();

        /// <exception cref="IOException"/>
        public virtual IList<SupplementalDataEntry> GetClientSupplementalData()
        {
            return null;
        }

        /// <exception cref="IOException"/>
        public virtual void NotifyNewSessionTicket(NewSessionTicket newSessionTicket)
        {
        }
    }
}
