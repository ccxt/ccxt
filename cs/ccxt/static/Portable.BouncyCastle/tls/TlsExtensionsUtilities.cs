using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Tls
{
    public static class TlsExtensionsUtilities
    {
        public static IDictionary<int, byte[]> EnsureExtensionsInitialised(IDictionary<int, byte[]> extensions)
        {
            return extensions == null ? new Dictionary<int, byte[]>() : extensions;
        }

        /// <param name="extensions">(Int32 -> byte[])</param>
        /// <param name="protocolNameList">an <see cref="IList{T}"/> of <see cref="ProtocolName"/>.</param>
        /// <exception cref="IOException"/>
        public static void AddAlpnExtensionClient(IDictionary<int, byte[]> extensions,
            IList<ProtocolName> protocolNameList)
        {
            extensions[ExtensionType.application_layer_protocol_negotiation] =
                CreateAlpnExtensionClient(protocolNameList);
        }

        /// <exception cref="IOException"/>
        public static void AddAlpnExtensionServer(IDictionary<int, byte[]> extensions, ProtocolName protocolName)
        {
            extensions[ExtensionType.application_layer_protocol_negotiation] = CreateAlpnExtensionServer(protocolName);
        }

        /// <exception cref="IOException"/>
        public static void AddCertificateAuthoritiesExtension(IDictionary<int, byte[]> extensions,
            IList<X509Name> authorities)
        {
            extensions[ExtensionType.certificate_authorities] = CreateCertificateAuthoritiesExtension(authorities);
        }

        /// <exception cref="IOException"/>
        public static void AddClientCertificateTypeExtensionClient(IDictionary<int, byte[]> extensions,
            short[] certificateTypes)
        {
            extensions[ExtensionType.client_certificate_type] = CreateCertificateTypeExtensionClient(certificateTypes);
        }

        /// <exception cref="IOException"/>
        public static void AddClientCertificateTypeExtensionServer(IDictionary<int, byte[]> extensions,
            short certificateType)
        {
            extensions[ExtensionType.client_certificate_type] = CreateCertificateTypeExtensionServer(certificateType);
        }

        public static void AddClientCertificateUrlExtension(IDictionary<int, byte[]> extensions)
        {
            extensions[ExtensionType.client_certificate_url] = CreateClientCertificateUrlExtension();
        }

        /// <exception cref="IOException"/>
        public static void AddCompressCertificateExtension(IDictionary<int, byte[]> extensions, int[] algorithms)
        {
            extensions[ExtensionType.compress_certificate] = CreateCompressCertificateExtension(algorithms);
        }

        /// <exception cref="IOException"/>
        public static void AddCookieExtension(IDictionary<int, byte[]> extensions, byte[] cookie)
        {
            extensions[ExtensionType.cookie] = CreateCookieExtension(cookie);
        }

        public static void AddEarlyDataIndication(IDictionary<int, byte[]> extensions)
        {
            extensions[ExtensionType.early_data] = CreateEarlyDataIndication();
        }

        /// <exception cref="IOException"/>
        public static void AddEarlyDataMaxSize(IDictionary<int, byte[]> extensions, long maxSize)
        {
            extensions[ExtensionType.early_data] = CreateEarlyDataMaxSize(maxSize);
        }

        public static void AddEmptyExtensionData(IDictionary<int, byte[]> extensions, int extType)
        {
            extensions[extType] = CreateEmptyExtensionData();
        }

        public static void AddEncryptThenMacExtension(IDictionary<int, byte[]> extensions)
        {
            extensions[ExtensionType.encrypt_then_mac] = CreateEncryptThenMacExtension();
        }

        public static void AddExtendedMasterSecretExtension(IDictionary<int, byte[]> extensions)
        {
            extensions[ExtensionType.extended_master_secret] = CreateExtendedMasterSecretExtension();
        }

        /// <exception cref="IOException"/>
        public static void AddHeartbeatExtension(IDictionary<int, byte[]> extensions,
            HeartbeatExtension heartbeatExtension)
        {
            extensions[ExtensionType.heartbeat] = CreateHeartbeatExtension(heartbeatExtension);
        }

        /// <exception cref="IOException"/>
        public static void AddKeyShareClientHello(IDictionary<int, byte[]> extensions,
            IList<KeyShareEntry> clientShares)
        {
            extensions[ExtensionType.key_share] = CreateKeyShareClientHello(clientShares);
        }

        /// <exception cref="IOException"/>
        public static void AddKeyShareHelloRetryRequest(IDictionary<int, byte[]> extensions, int namedGroup)
        {
            extensions[ExtensionType.key_share] = CreateKeyShareHelloRetryRequest(namedGroup);
        }

        /// <exception cref="IOException"/>
        public static void AddKeyShareServerHello(IDictionary<int, byte[]> extensions, KeyShareEntry serverShare)
        {
            extensions[ExtensionType.key_share] = CreateKeyShareServerHello(serverShare);
        }

        /// <exception cref="IOException"/>
        public static void AddMaxFragmentLengthExtension(IDictionary<int, byte[]> extensions, short maxFragmentLength)
        {
            extensions[ExtensionType.max_fragment_length] = CreateMaxFragmentLengthExtension(maxFragmentLength);
        }

        /// <exception cref="IOException"/>
        public static void AddOidFiltersExtension(IDictionary<int, byte[]> extensions,
            IDictionary<DerObjectIdentifier, byte[]> filters)
        {
            extensions[ExtensionType.oid_filters] = CreateOidFiltersExtension(filters);
        }

        /// <exception cref="IOException"/>
        public static void AddPaddingExtension(IDictionary<int, byte[]> extensions, int dataLength)
        {
            extensions[ExtensionType.padding] = CreatePaddingExtension(dataLength);
        }

        public static void AddPostHandshakeAuthExtension(IDictionary<int, byte[]> extensions)
        {
            extensions[ExtensionType.post_handshake_auth] = CreatePostHandshakeAuthExtension();
        }

        /// <exception cref="IOException"/>
        public static void AddPreSharedKeyClientHello(IDictionary<int, byte[]> extensions, OfferedPsks offeredPsks)
        {
            extensions[ExtensionType.pre_shared_key] = CreatePreSharedKeyClientHello(offeredPsks);
        }

        /// <exception cref="IOException"/>
        public static void AddPreSharedKeyServerHello(IDictionary<int, byte[]> extensions, int selectedIdentity)
        {
            extensions[ExtensionType.pre_shared_key] = CreatePreSharedKeyServerHello(selectedIdentity);
        }

        /// <exception cref="IOException"/>
        public static void AddPskKeyExchangeModesExtension(IDictionary<int, byte[]> extensions, short[] modes)
        {
            extensions[ExtensionType.psk_key_exchange_modes] = CreatePskKeyExchangeModesExtension(modes);
        }

        /// <exception cref="IOException"/>
        public static void AddRecordSizeLimitExtension(IDictionary<int, byte[]> extensions, int recordSizeLimit)
        {
            extensions[ExtensionType.record_size_limit] = CreateRecordSizeLimitExtension(recordSizeLimit);
        }

        /// <exception cref="IOException"/>
        public static void AddServerCertificateTypeExtensionClient(IDictionary<int, byte[]> extensions,
            short[] certificateTypes)
        {
            extensions[ExtensionType.server_certificate_type] = CreateCertificateTypeExtensionClient(certificateTypes);
        }

        /// <exception cref="IOException"/>
        public static void AddServerCertificateTypeExtensionServer(IDictionary<int, byte[]> extensions,
            short certificateType)
        {
            extensions[ExtensionType.server_certificate_type] = CreateCertificateTypeExtensionServer(certificateType);
        }

        /// <exception cref="IOException"/>
        public static void AddServerNameExtensionClient(IDictionary<int, byte[]> extensions,
            IList<ServerName> serverNameList)
        {
            extensions[ExtensionType.server_name] = CreateServerNameExtensionClient(serverNameList);
        }

        /// <exception cref="IOException"/>
        public static void AddServerNameExtensionServer(IDictionary<int, byte[]> extensions)
        {
            extensions[ExtensionType.server_name] = CreateServerNameExtensionServer();
        }

        /// <exception cref="IOException"/>
        public static void AddSignatureAlgorithmsExtension(IDictionary<int, byte[]> extensions,
            IList<SignatureAndHashAlgorithm> supportedSignatureAlgorithms)
        {
            extensions[ExtensionType.signature_algorithms] =
                CreateSignatureAlgorithmsExtension(supportedSignatureAlgorithms);
        }

        /// <exception cref="IOException"/>
        public static void AddSignatureAlgorithmsCertExtension(IDictionary<int, byte[]> extensions,
            IList<SignatureAndHashAlgorithm> supportedSignatureAlgorithms)
        {
            extensions[ExtensionType.signature_algorithms_cert] =
                CreateSignatureAlgorithmsCertExtension(supportedSignatureAlgorithms);
        }

        /// <exception cref="IOException"/>
        public static void AddStatusRequestExtension(IDictionary<int, byte[]> extensions,
            CertificateStatusRequest statusRequest)
        {
            extensions[ExtensionType.status_request] = CreateStatusRequestExtension(statusRequest);
        }

        /// <exception cref="IOException"/>
        public static void AddStatusRequestV2Extension(IDictionary<int, byte[]> extensions,
            IList<CertificateStatusRequestItemV2> statusRequestV2)
        {
            extensions[ExtensionType.status_request_v2] = CreateStatusRequestV2Extension(statusRequestV2);
        }

        /// <exception cref="IOException"/>
        public static void AddSupportedGroupsExtension(IDictionary<int, byte[]> extensions, IList<int> namedGroups)
        {
            extensions[ExtensionType.supported_groups] = CreateSupportedGroupsExtension(namedGroups);
        }

        /// <exception cref="IOException"/>
        public static void AddSupportedPointFormatsExtension(IDictionary<int, byte[]> extensions,
            short[] ecPointFormats)
        {
            extensions[ExtensionType.ec_point_formats] = CreateSupportedPointFormatsExtension(ecPointFormats);
        }

        /// <exception cref="IOException"/>
        public static void AddSupportedVersionsExtensionClient(IDictionary<int, byte[]> extensions,
            ProtocolVersion[] versions)
        {
            extensions[ExtensionType.supported_versions] = CreateSupportedVersionsExtensionClient(versions);
        }

        /// <exception cref="IOException"/>
        public static void AddSupportedVersionsExtensionServer(IDictionary<int, byte[]> extensions,
            ProtocolVersion selectedVersion)
        {
            extensions[ExtensionType.supported_versions] = CreateSupportedVersionsExtensionServer(selectedVersion);
        }

        public static void AddTruncatedHmacExtension(IDictionary<int, byte[]> extensions)
        {
            extensions[ExtensionType.truncated_hmac] = CreateTruncatedHmacExtension();
        }

        /// <exception cref="IOException"/>
        public static void AddTrustedCAKeysExtensionClient(IDictionary<int, byte[]> extensions,
            IList<TrustedAuthority> trustedAuthoritiesList)
        {
            extensions[ExtensionType.trusted_ca_keys] = CreateTrustedCAKeysExtensionClient(trustedAuthoritiesList);
        }

        public static void AddTrustedCAKeysExtensionServer(IDictionary<int, byte[]> extensions)
        {
            extensions[ExtensionType.trusted_ca_keys] = CreateTrustedCAKeysExtensionServer();
        }

        /// <returns>an <see cref="IList{T}"/> of <see cref="ProtocolName"/>.</returns>
        /// <exception cref="IOException"/>
        public static IList<ProtocolName> GetAlpnExtensionClient(IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions,
                ExtensionType.application_layer_protocol_negotiation);
            return extensionData == null ? null : ReadAlpnExtensionClient(extensionData);
        }

        /// <exception cref="IOException"/>
        public static ProtocolName GetAlpnExtensionServer(IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions,
                ExtensionType.application_layer_protocol_negotiation);
            return extensionData == null ? null : ReadAlpnExtensionServer(extensionData);
        }

        /// <exception cref="IOException"/>
        public static IList<X509Name> GetCertificateAuthoritiesExtension(IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions, ExtensionType.certificate_authorities);
            return extensionData == null ? null : ReadCertificateAuthoritiesExtension(extensionData);
        }

        /// <exception cref="IOException"/>
        public static short[] GetClientCertificateTypeExtensionClient(IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions, ExtensionType.client_certificate_type);
            return extensionData == null ? null : ReadCertificateTypeExtensionClient(extensionData);
        }

        /// <exception cref="IOException"/>
        public static short GetClientCertificateTypeExtensionServer(IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions, ExtensionType.client_certificate_type);
            return extensionData == null ? (short)-1 : ReadCertificateTypeExtensionServer(extensionData);
        }

        /// <exception cref="IOException"/>
        public static int[] GetCompressCertificateExtension(IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions, ExtensionType.compress_certificate);
            return extensionData == null ? null : ReadCompressCertificateExtension(extensionData);
        }

        /// <exception cref="IOException"/>
        public static byte[] GetCookieExtension(IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions, ExtensionType.cookie);
            return extensionData == null ? null : ReadCookieExtension(extensionData);
        }

        /// <exception cref="IOException"/>
        public static long GetEarlyDataMaxSize(IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions, ExtensionType.early_data);
            return extensionData == null ? -1L : ReadEarlyDataMaxSize(extensionData);
        }

        /// <exception cref="IOException"/>
        public static HeartbeatExtension GetHeartbeatExtension(IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions, ExtensionType.heartbeat);
            return extensionData == null ? null : ReadHeartbeatExtension(extensionData);
        }

        /// <exception cref="IOException"/>
        public static IList<KeyShareEntry> GetKeyShareClientHello(IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions, ExtensionType.key_share);
            return extensionData == null ? null : ReadKeyShareClientHello(extensionData);
        }

        /// <exception cref="IOException"/>
        public static int GetKeyShareHelloRetryRequest(IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions, ExtensionType.key_share);
            return extensionData == null ? -1 : ReadKeyShareHelloRetryRequest(extensionData);
        }

        /// <exception cref="IOException"/>
        public static KeyShareEntry GetKeyShareServerHello(IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions, ExtensionType.key_share);
            return extensionData == null ? null : ReadKeyShareServerHello(extensionData);
        }

        /// <exception cref="IOException"/>
        public static short GetMaxFragmentLengthExtension(IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions, ExtensionType.max_fragment_length);
            return extensionData == null ? (short)-1 : ReadMaxFragmentLengthExtension(extensionData);
        }

        /// <exception cref="IOException"/>
        public static IDictionary<DerObjectIdentifier, byte[]> GetOidFiltersExtension(
            IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions, ExtensionType.oid_filters);
            return extensionData == null ? null : ReadOidFiltersExtension(extensionData);
        }

        /// <exception cref="IOException"/>
        public static int GetPaddingExtension(IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions, ExtensionType.padding);
            return extensionData == null ? -1 : ReadPaddingExtension(extensionData);
        }

        /// <exception cref="IOException"/>
        public static OfferedPsks GetPreSharedKeyClientHello(IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions, ExtensionType.pre_shared_key);
            return extensionData == null ? null : ReadPreSharedKeyClientHello(extensionData);
        }

        /// <exception cref="IOException"/>
        public static int GetPreSharedKeyServerHello(IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions, ExtensionType.pre_shared_key);
            return extensionData == null ? -1 : ReadPreSharedKeyServerHello(extensionData);
        }

        /// <exception cref="IOException"/>
        public static short[] GetPskKeyExchangeModesExtension(IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions, ExtensionType.psk_key_exchange_modes);
            return extensionData == null ? null : ReadPskKeyExchangeModesExtension(extensionData);
        }

        /// <exception cref="IOException"/>
        public static int GetRecordSizeLimitExtension(IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions, ExtensionType.record_size_limit);
            return extensionData == null ? -1 : ReadRecordSizeLimitExtension(extensionData);
        }

        /// <exception cref="IOException"/>
        public static short[] GetServerCertificateTypeExtensionClient(IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions, ExtensionType.server_certificate_type);
            return extensionData == null ? null : ReadCertificateTypeExtensionClient(extensionData);
        }

        /// <exception cref="IOException"/>
        public static short GetServerCertificateTypeExtensionServer(IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions, ExtensionType.server_certificate_type);
            return extensionData == null ? (short)-1 : ReadCertificateTypeExtensionServer(extensionData);
        }

        /// <exception cref="IOException"/>
        public static IList<ServerName> GetServerNameExtensionClient(IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions, ExtensionType.server_name);
            return extensionData == null ? null : ReadServerNameExtensionClient(extensionData);
        }

        /// <exception cref="IOException"/>
        public static IList<SignatureAndHashAlgorithm> GetSignatureAlgorithmsExtension(
            IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions, ExtensionType.signature_algorithms);
            return extensionData == null ? null : ReadSignatureAlgorithmsExtension(extensionData);
        }

        /// <exception cref="IOException"/>
        public static IList<SignatureAndHashAlgorithm> GetSignatureAlgorithmsCertExtension(
            IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions, ExtensionType.signature_algorithms_cert);
            return extensionData == null ? null : ReadSignatureAlgorithmsCertExtension(extensionData);
        }

        /// <exception cref="IOException"/>
        public static CertificateStatusRequest GetStatusRequestExtension(IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions, ExtensionType.status_request);
            return extensionData == null ? null : ReadStatusRequestExtension(extensionData);
        }

        /// <exception cref="IOException"/>
        public static IList<CertificateStatusRequestItemV2> GetStatusRequestV2Extension(
            IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions, ExtensionType.status_request_v2);
            return extensionData == null ? null : ReadStatusRequestV2Extension(extensionData);
        }

        /// <exception cref="IOException"/>
        public static int[] GetSupportedGroupsExtension(IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions, ExtensionType.supported_groups);
            return extensionData == null ? null : ReadSupportedGroupsExtension(extensionData);
        }

        /// <exception cref="IOException"/>
        public static short[] GetSupportedPointFormatsExtension(IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions, ExtensionType.ec_point_formats);
            return extensionData == null ? null : ReadSupportedPointFormatsExtension(extensionData);
        }

        /// <exception cref="IOException"/>
        public static ProtocolVersion[] GetSupportedVersionsExtensionClient(IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions, ExtensionType.supported_versions);
            return extensionData == null ? null : ReadSupportedVersionsExtensionClient(extensionData);
        }

        /// <exception cref="IOException"/>
        public static ProtocolVersion GetSupportedVersionsExtensionServer(IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions, ExtensionType.supported_versions);
            return extensionData == null ? null : ReadSupportedVersionsExtensionServer(extensionData);
        }

        /// <exception cref="IOException"/>
        public static IList<TrustedAuthority> GetTrustedCAKeysExtensionClient(IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions, ExtensionType.trusted_ca_keys);
            return extensionData == null ? null : ReadTrustedCAKeysExtensionClient(extensionData);
        }

        /// <exception cref="IOException"/>
        public static bool HasClientCertificateUrlExtension(IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions, ExtensionType.client_certificate_url);
            return extensionData == null ? false : ReadClientCertificateUrlExtension(extensionData);
        }

        /// <exception cref="IOException"/>
        public static bool HasEarlyDataIndication(IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions, ExtensionType.early_data);
            return extensionData == null ? false : ReadEarlyDataIndication(extensionData);
        }

        /// <exception cref="IOException"/>
        public static bool HasEncryptThenMacExtension(IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions, ExtensionType.encrypt_then_mac);
            return extensionData == null ? false : ReadEncryptThenMacExtension(extensionData);
        }

        /// <exception cref="IOException"/>
        public static bool HasExtendedMasterSecretExtension(IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions, ExtensionType.extended_master_secret);
            return extensionData == null ? false : ReadExtendedMasterSecretExtension(extensionData);
        }

        /// <exception cref="IOException"/>
        public static bool HasServerNameExtensionServer(IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions, ExtensionType.server_name);
            return extensionData == null ? false : ReadServerNameExtensionServer(extensionData);
        }

        /// <exception cref="IOException"/>
        public static bool HasPostHandshakeAuthExtension(IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions, ExtensionType.post_handshake_auth);
            return extensionData == null ? false : ReadPostHandshakeAuthExtension(extensionData);
        }

        /// <exception cref="IOException"/>
        public static bool HasTruncatedHmacExtension(IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions, ExtensionType.truncated_hmac);
            return extensionData == null ? false : ReadTruncatedHmacExtension(extensionData);
        }

        /// <exception cref="IOException"/>
        public static bool HasTrustedCAKeysExtensionServer(IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions, ExtensionType.trusted_ca_keys);
            return extensionData == null ? false : ReadTrustedCAKeysExtensionServer(extensionData);
        }

        /// <param name="protocolNameList">an <see cref="IList{T}"/> of <see cref="ProtocolName"/>.</param>
        /// <exception cref="IOException"/>
        public static byte[] CreateAlpnExtensionClient(IList<ProtocolName> protocolNameList)
        {
            if (protocolNameList == null || protocolNameList.Count < 1)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            MemoryStream buf = new MemoryStream();

            // Placeholder for length
            TlsUtilities.WriteUint16(0, buf);

            foreach (ProtocolName protocolName in protocolNameList)
            {
                protocolName.Encode(buf);
            }

            return PatchOpaque16(buf);
        }

        /// <exception cref="IOException"/>
        public static byte[] CreateAlpnExtensionServer(ProtocolName protocolName)
        {
            var protocol_name_list = new List<ProtocolName>();
            protocol_name_list.Add(protocolName);

            return CreateAlpnExtensionClient(protocol_name_list);
        }

        /// <exception cref="IOException"/>
        public static byte[] CreateCertificateAuthoritiesExtension(IList<X509Name> authorities)
        {
            if (null == authorities || authorities.Count < 1)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            MemoryStream buf = new MemoryStream();

            // Placeholder for length
            TlsUtilities.WriteUint16(0, buf);

            foreach (X509Name authority in authorities)
            {
                byte[] derEncoding = authority.GetEncoded(Asn1Encodable.Der);
                TlsUtilities.WriteOpaque16(derEncoding, buf);
            }

            return PatchOpaque16(buf);
        }

        /// <exception cref="IOException"/>
        public static byte[] CreateCertificateTypeExtensionClient(short[] certificateTypes)
        {
            if (TlsUtilities.IsNullOrEmpty(certificateTypes) || certificateTypes.Length > 255)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            return TlsUtilities.EncodeUint8ArrayWithUint8Length(certificateTypes);
        }

        /// <exception cref="IOException"/>
        public static byte[] CreateCertificateTypeExtensionServer(short certificateType)
        {
            return TlsUtilities.EncodeUint8(certificateType);
        }

        public static byte[] CreateClientCertificateUrlExtension()
        {
            return CreateEmptyExtensionData();
        }

        /// <exception cref="IOException"/>
        public static byte[] CreateCompressCertificateExtension(int[] algorithms)
        {
            if (TlsUtilities.IsNullOrEmpty(algorithms) || algorithms.Length > 127)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            return TlsUtilities.EncodeUint16ArrayWithUint8Length(algorithms);
        }

        /// <exception cref="IOException"/>
        public static byte[] CreateCookieExtension(byte[] cookie)
        {
            if (TlsUtilities.IsNullOrEmpty(cookie) || cookie.Length >= (1 << 16))
                throw new TlsFatalAlert(AlertDescription.internal_error);

            return TlsUtilities.EncodeOpaque16(cookie);
        }

        public static byte[] CreateEarlyDataIndication()
        {
            return CreateEmptyExtensionData();
        }

        /// <exception cref="IOException"/>
        public static byte[] CreateEarlyDataMaxSize(long maxSize)
        {
            return TlsUtilities.EncodeUint32(maxSize);
        }

        public static byte[] CreateEmptyExtensionData()
        {
            return TlsUtilities.EmptyBytes;
        }

        public static byte[] CreateEncryptThenMacExtension()
        {
            return CreateEmptyExtensionData();
        }

        public static byte[] CreateExtendedMasterSecretExtension()
        {
            return CreateEmptyExtensionData();
        }

        /// <exception cref="IOException"/>
        public static byte[] CreateHeartbeatExtension(HeartbeatExtension heartbeatExtension)
        {
            if (heartbeatExtension == null)
            {
                throw new TlsFatalAlert(AlertDescription.internal_error);
            }

            MemoryStream buf = new MemoryStream();

            heartbeatExtension.Encode(buf);

            return buf.ToArray();
        }

        /// <exception cref="IOException"/>
        public static byte[] CreateKeyShareClientHello(IList<KeyShareEntry> clientShares)
        {
            if (clientShares == null || clientShares.Count < 1)
                return TlsUtilities.EncodeUint16(0);

            MemoryStream buf = new MemoryStream();

            // Placeholder for length
            TlsUtilities.WriteUint16(0, buf);

            foreach (KeyShareEntry clientShare in clientShares)
            {
                clientShare.Encode(buf);
            }

            return PatchOpaque16(buf);
        }

        /// <exception cref="IOException"/>
        public static byte[] CreateKeyShareHelloRetryRequest(int namedGroup)
        {
            return TlsUtilities.EncodeUint16(namedGroup);
        }

        /// <exception cref="IOException"/>
        public static byte[] CreateKeyShareServerHello(KeyShareEntry serverShare)
        {
            if (serverShare == null)
            {
                throw new TlsFatalAlert(AlertDescription.internal_error);
            }

            MemoryStream buf = new MemoryStream();

            serverShare.Encode(buf);

            return buf.ToArray();
        }

        /// <exception cref="IOException"/>
        public static byte[] CreateMaxFragmentLengthExtension(short maxFragmentLength)
        {
            return TlsUtilities.EncodeUint8(maxFragmentLength);
        }

        /// <exception cref="IOException"/>
        public static byte[] CreateOidFiltersExtension(IDictionary<DerObjectIdentifier, byte[]> filters)
        {
            MemoryStream buf = new MemoryStream();

            // Placeholder for length
            TlsUtilities.WriteUint16(0, buf);

            if (null != filters)
            {
                //foreach (DerObjectIdentifier certificateExtensionOid in filters.Keys)
                foreach (var filter in filters)
                {
                    var certificateExtensionOid = filter.Key;
                    var certificateExtensionValues = filter.Value;

                    if (null == certificateExtensionOid || null == certificateExtensionValues)
                        throw new TlsFatalAlert(AlertDescription.internal_error);

                    byte[] derEncoding = certificateExtensionOid.GetEncoded(Asn1Encodable.Der);
                    TlsUtilities.WriteOpaque8(derEncoding, buf);

                    TlsUtilities.WriteOpaque16(certificateExtensionValues, buf);
                }
            }

            return PatchOpaque16(buf);
        }

        /// <exception cref="IOException"/>
        public static byte[] CreatePaddingExtension(int dataLength)
        {
            TlsUtilities.CheckUint16(dataLength);
            return new byte[dataLength];
        }

        public static byte[] CreatePostHandshakeAuthExtension()
        {
            return CreateEmptyExtensionData();
        }

        /// <exception cref="IOException"/>
        public static byte[] CreatePreSharedKeyClientHello(OfferedPsks offeredPsks)
        {
            if (offeredPsks == null)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            MemoryStream buf = new MemoryStream();

            offeredPsks.Encode(buf);

            return buf.ToArray();
        }

        /// <exception cref="IOException"/>
        public static byte[] CreatePreSharedKeyServerHello(int selectedIdentity)
        {
            return TlsUtilities.EncodeUint16(selectedIdentity);
        }

        /// <exception cref="IOException"/>
        public static byte[] CreatePskKeyExchangeModesExtension(short[] modes)
        {
            if (TlsUtilities.IsNullOrEmpty(modes) || modes.Length > 255)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            return TlsUtilities.EncodeUint8ArrayWithUint8Length(modes);
        }

        /// <exception cref="IOException"/>
        public static byte[] CreateRecordSizeLimitExtension(int recordSizeLimit)
        {
            if (recordSizeLimit < 64)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            return TlsUtilities.EncodeUint16(recordSizeLimit);
        }

        /// <exception cref="IOException"/>
        public static byte[] CreateServerNameExtensionClient(IList<ServerName> serverNameList)
        {
            if (serverNameList == null)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            MemoryStream buf = new MemoryStream();

            new ServerNameList(serverNameList).Encode(buf);

            return buf.ToArray();
        }

        public static byte[] CreateServerNameExtensionServer()
        {
            return CreateEmptyExtensionData();
        }

        /// <exception cref="IOException"/>
        public static byte[] CreateSignatureAlgorithmsExtension(
            IList<SignatureAndHashAlgorithm> supportedSignatureAlgorithms)
        {
            MemoryStream buf = new MemoryStream();

            TlsUtilities.EncodeSupportedSignatureAlgorithms(supportedSignatureAlgorithms, buf);

            return buf.ToArray();
        }

        /// <exception cref="IOException"/>
        public static byte[] CreateSignatureAlgorithmsCertExtension(
            IList<SignatureAndHashAlgorithm> supportedSignatureAlgorithms)
        {
            return CreateSignatureAlgorithmsExtension(supportedSignatureAlgorithms);
        }

        /// <exception cref="IOException"/>
        public static byte[] CreateStatusRequestExtension(CertificateStatusRequest statusRequest)
        {
            if (statusRequest == null)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            MemoryStream buf = new MemoryStream();

            statusRequest.Encode(buf);

            return buf.ToArray();
        }

        /// <exception cref="IOException"/>
        public static byte[] CreateStatusRequestV2Extension(IList<CertificateStatusRequestItemV2> statusRequestV2)
        {
            if (statusRequestV2 == null || statusRequestV2.Count < 1)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            MemoryStream buf = new MemoryStream();

            // Placeholder for length
            TlsUtilities.WriteUint16(0, buf);

            foreach (CertificateStatusRequestItemV2 entry in statusRequestV2)
            {
                entry.Encode(buf);
            }

            return PatchOpaque16(buf);
        }

        /// <exception cref="IOException"/>
        public static byte[] CreateSupportedGroupsExtension(IList<int> namedGroups)
        {
            if (namedGroups == null || namedGroups.Count < 1)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            int count = namedGroups.Count;
            int[] values = new int[count];
            for (int i = 0; i < count; ++i)
            {
                values[i] = namedGroups[i];
            }

            return TlsUtilities.EncodeUint16ArrayWithUint16Length(values);
        }

        /// <exception cref="IOException"/>
        public static byte[] CreateSupportedPointFormatsExtension(short[] ecPointFormats)
        {
            if (ecPointFormats == null || !Arrays.Contains(ecPointFormats, ECPointFormat.uncompressed))
            {
                /*
                 * RFC 4492 5.1. If the Supported Point Formats Extension is indeed sent, it MUST
                 * contain the value 0 (uncompressed) as one of the items in the list of point formats.
                 */

                // NOTE: We add it at the start (highest preference)
                ecPointFormats = Arrays.Prepend(ecPointFormats, ECPointFormat.uncompressed);
            }

            return TlsUtilities.EncodeUint8ArrayWithUint8Length(ecPointFormats);
        }

        /// <exception cref="IOException"/>
        public static byte[] CreateSupportedVersionsExtensionClient(ProtocolVersion[] versions)
        {
            if (TlsUtilities.IsNullOrEmpty(versions) || versions.Length > 127)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            int count = versions.Length;
            byte[] data = new byte[1 + count * 2];
            TlsUtilities.WriteUint8(count * 2, data, 0);
            for (int i = 0; i < count; ++i)
            {
                TlsUtilities.WriteVersion(versions[i], data, 1 + i * 2);
            }
            return data;
        }

        /// <exception cref="IOException"/>
        public static byte[] CreateSupportedVersionsExtensionServer(ProtocolVersion selectedVersion)
        {
            return TlsUtilities.EncodeVersion(selectedVersion);
        }

        public static byte[] CreateTruncatedHmacExtension()
        {
            return CreateEmptyExtensionData();
        }

        /// <exception cref="IOException"/>
        public static byte[] CreateTrustedCAKeysExtensionClient(IList<TrustedAuthority> trustedAuthoritiesList)
        {
            MemoryStream buf = new MemoryStream();

            // Placeholder for length
            TlsUtilities.WriteUint16(0, buf);

            if (trustedAuthoritiesList != null)
            {
                foreach (TrustedAuthority entry in trustedAuthoritiesList)
                {
                    entry.Encode(buf);
                }
            }

            return PatchOpaque16(buf);
        }

        public static byte[] CreateTrustedCAKeysExtensionServer()
        {
            return CreateEmptyExtensionData();
        }

        /// <exception cref="IOException"/>
        private static bool ReadEmptyExtensionData(byte[] extensionData)
        {
            if (extensionData == null)
                throw new ArgumentNullException("extensionData");

            if (extensionData.Length != 0)
                throw new TlsFatalAlert(AlertDescription.illegal_parameter);

            return true;
        }

        /// <returns>an <see cref="IList{T}"/> of <see cref="ProtocolName"/>.</returns>
        /// <exception cref="IOException"/>
        public static IList<ProtocolName> ReadAlpnExtensionClient(byte[] extensionData)
        {
            if (extensionData == null)
                throw new ArgumentNullException("extensionData");

            MemoryStream buf = new MemoryStream(extensionData);

            int length = TlsUtilities.ReadUint16(buf);
            if (length != (extensionData.Length - 2))
                throw new TlsFatalAlert(AlertDescription.decode_error);

            var protocol_name_list = new List<ProtocolName>();
            while (buf.Position < buf.Length)
            {
                ProtocolName protocolName = ProtocolName.Parse(buf);

                protocol_name_list.Add(protocolName);
            }
            return protocol_name_list;
        }

        /// <exception cref="IOException"/>
        public static ProtocolName ReadAlpnExtensionServer(byte[] extensionData)
        {
            var protocol_name_list = ReadAlpnExtensionClient(extensionData);
            if (protocol_name_list.Count != 1)
                throw new TlsFatalAlert(AlertDescription.decode_error);

            return protocol_name_list[0];
        }

        /// <exception cref="IOException"/>
        public static IList<X509Name> ReadCertificateAuthoritiesExtension(byte[] extensionData)
        {
            if (extensionData == null)
                throw new ArgumentNullException("extensionData");
            if (extensionData.Length < 5)
                throw new TlsFatalAlert(AlertDescription.decode_error);

            MemoryStream buf = new MemoryStream(extensionData);

            int length = TlsUtilities.ReadUint16(buf);
            if (length != (extensionData.Length - 2))
                throw new TlsFatalAlert(AlertDescription.decode_error);

            var authorities = new List<X509Name>();
            while (buf.Position < buf.Length)
            {
                byte[] derEncoding = TlsUtilities.ReadOpaque16(buf, 1);
                Asn1Object asn1 = TlsUtilities.ReadAsn1Object(derEncoding);
                X509Name ca = X509Name.GetInstance(asn1);
                TlsUtilities.RequireDerEncoding(ca, derEncoding);
                authorities.Add(ca);
            }
            return authorities;
        }

        /// <exception cref="IOException"/>
        public static short[] ReadCertificateTypeExtensionClient(byte[] extensionData)
        {
            short[] certificateTypes = TlsUtilities.DecodeUint8ArrayWithUint8Length(extensionData);
            if (certificateTypes.Length < 1)
                throw new TlsFatalAlert(AlertDescription.decode_error);

            return certificateTypes;
        }

        /// <exception cref="IOException"/>
        public static short ReadCertificateTypeExtensionServer(byte[] extensionData)
        {
            return TlsUtilities.DecodeUint8(extensionData);
        }

        /// <exception cref="IOException"/>
        public static bool ReadClientCertificateUrlExtension(byte[] extensionData)
        {
            return ReadEmptyExtensionData(extensionData);
        }

        /// <exception cref="IOException"/>
        public static int[] ReadCompressCertificateExtension(byte[] extensionData)
        {
            int[] algorithms = TlsUtilities.DecodeUint16ArrayWithUint8Length(extensionData);
            if (algorithms.Length < 1)
                throw new TlsFatalAlert(AlertDescription.decode_error);

            return algorithms;
        }

        /// <exception cref="IOException"/>
        public static byte[] ReadCookieExtension(byte[] extensionData)
        {
            return TlsUtilities.DecodeOpaque16(extensionData, 1);
        }

        /// <exception cref="IOException"/>
        public static bool ReadEarlyDataIndication(byte[] extensionData)
        {
            return ReadEmptyExtensionData(extensionData);
        }

        /// <exception cref="IOException"/>
        public static long ReadEarlyDataMaxSize(byte[] extensionData)
        {
            return TlsUtilities.DecodeUint32(extensionData);
        }

        /// <exception cref="IOException"/>
        public static bool ReadEncryptThenMacExtension(byte[] extensionData)
        {
            return ReadEmptyExtensionData(extensionData);
        }

        /// <exception cref="IOException"/>
        public static bool ReadExtendedMasterSecretExtension(byte[] extensionData)
        {
            return ReadEmptyExtensionData(extensionData);
        }

        /// <exception cref="IOException"/>
        public static HeartbeatExtension ReadHeartbeatExtension(byte[] extensionData)
        {
            if (extensionData == null)
                throw new ArgumentNullException("extensionData");

            MemoryStream buf = new MemoryStream(extensionData, false);

            HeartbeatExtension heartbeatExtension = HeartbeatExtension.Parse(buf);

            TlsProtocol.AssertEmpty(buf);

            return heartbeatExtension;
        }

        /// <exception cref="IOException"/>
        public static IList<KeyShareEntry> ReadKeyShareClientHello(byte[] extensionData)
        {
            if (extensionData == null)
                throw new ArgumentNullException("extensionData");

            /*
             * TODO[tls13] Clients MUST NOT offer multiple KeyShareEntry values for the same group.
             * Clients MUST NOT offer any KeyShareEntry values for groups not listed in the client's
             * "supported_groups" extension. Servers MAY check for violations of these rules and abort
             * the handshake with an "illegal_parameter" alert if one is violated.
             */

            MemoryStream buf = new MemoryStream(extensionData, false);

            int length = TlsUtilities.ReadUint16(buf);
            if (length != (extensionData.Length - 2))
                throw new TlsFatalAlert(AlertDescription.decode_error);

            var clientShares = new List<KeyShareEntry>();
            while (buf.Position < buf.Length)
            {
                KeyShareEntry clientShare = KeyShareEntry.Parse(buf);

                clientShares.Add(clientShare);
            }
            return clientShares;
        }

        /// <exception cref="IOException"/>
        public static int ReadKeyShareHelloRetryRequest(byte[] extensionData)
        {
            return TlsUtilities.DecodeUint16(extensionData);
        }

        /// <exception cref="IOException"/>
        public static KeyShareEntry ReadKeyShareServerHello(byte[] extensionData)
        {
            if (extensionData == null)
                throw new ArgumentNullException("extensionData");

            MemoryStream buf = new MemoryStream(extensionData, false);

            KeyShareEntry serverShare = KeyShareEntry.Parse(buf);

            TlsProtocol.AssertEmpty(buf);

            return serverShare;
        }

        /// <exception cref="IOException"/>
        public static short ReadMaxFragmentLengthExtension(byte[] extensionData)
        {
            return TlsUtilities.DecodeUint8(extensionData);
        }

        /// <exception cref="IOException"/>
        public static IDictionary<DerObjectIdentifier, byte[]> ReadOidFiltersExtension(byte[] extensionData)
        {
            if (extensionData == null)
                throw new ArgumentNullException("extensionData");
            if (extensionData.Length < 2)
                throw new TlsFatalAlert(AlertDescription.decode_error);

            MemoryStream buf = new MemoryStream(extensionData, false);

            int length = TlsUtilities.ReadUint16(buf);
            if (length != (extensionData.Length - 2))
                throw new TlsFatalAlert(AlertDescription.decode_error);

            var filters = new Dictionary<DerObjectIdentifier, byte[]>();
            while (buf.Position < buf.Length)
            {
                byte[] derEncoding = TlsUtilities.ReadOpaque8(buf, 1);
                Asn1Object asn1 = TlsUtilities.ReadAsn1Object(derEncoding);
                DerObjectIdentifier certificateExtensionOid = DerObjectIdentifier.GetInstance(asn1);
                TlsUtilities.RequireDerEncoding(certificateExtensionOid, derEncoding);

                if (filters.ContainsKey(certificateExtensionOid))
                    throw new TlsFatalAlert(AlertDescription.illegal_parameter);

                byte[] certificateExtensionValues = TlsUtilities.ReadOpaque16(buf);

                filters[certificateExtensionOid] = certificateExtensionValues;
            }
            return filters;
        }

        /// <exception cref="IOException"/>
        public static int ReadPaddingExtension(byte[] extensionData)
        {
            if (extensionData == null)
                throw new ArgumentNullException("extensionData");

            if (!Arrays.AreAllZeroes(extensionData, 0, extensionData.Length))
                throw new TlsFatalAlert(AlertDescription.illegal_parameter);

            return extensionData.Length;
        }

        /// <exception cref="IOException"/>
        public static bool ReadPostHandshakeAuthExtension(byte[] extensionData)
        {
            return ReadEmptyExtensionData(extensionData);
        }

        /// <exception cref="IOException"/>
        public static OfferedPsks ReadPreSharedKeyClientHello(byte[] extensionData)
        {
            if (extensionData == null)
                throw new ArgumentNullException("extensionData");

            MemoryStream buf = new MemoryStream(extensionData, false);

            OfferedPsks offeredPsks = OfferedPsks.Parse(buf);

            TlsProtocol.AssertEmpty(buf);

            return offeredPsks;
        }

        /// <exception cref="IOException"/>
        public static int ReadPreSharedKeyServerHello(byte[] extensionData)
        {
            return TlsUtilities.DecodeUint16(extensionData);
        }

        /// <exception cref="IOException"/>
        public static short[] ReadPskKeyExchangeModesExtension(byte[] extensionData)
        {
            short[] modes = TlsUtilities.DecodeUint8ArrayWithUint8Length(extensionData);
            if (modes.Length < 1)
                throw new TlsFatalAlert(AlertDescription.decode_error);

            return modes;
        }

        /// <exception cref="IOException"/>
        public static int ReadRecordSizeLimitExtension(byte[] extensionData)
        {
            int recordSizeLimit = TlsUtilities.DecodeUint16(extensionData);
            if (recordSizeLimit < 64)
                throw new TlsFatalAlert(AlertDescription.illegal_parameter);

            return recordSizeLimit;
        }

        /// <exception cref="IOException"/>
        public static IList<ServerName> ReadServerNameExtensionClient(byte[] extensionData)
        {
            if (extensionData == null)
                throw new ArgumentNullException("extensionData");

            MemoryStream buf = new MemoryStream(extensionData, false);

            ServerNameList serverNameList = ServerNameList.Parse(buf);

            TlsProtocol.AssertEmpty(buf);

            return serverNameList.ServerNames;
        }

        /// <exception cref="IOException"/>
        public static bool ReadServerNameExtensionServer(byte[] extensionData)
        {
            return ReadEmptyExtensionData(extensionData);
        }

        /// <exception cref="IOException"/>
        public static IList<SignatureAndHashAlgorithm> ReadSignatureAlgorithmsExtension(byte[] extensionData)
        {
            if (extensionData == null)
                throw new ArgumentNullException("extensionData");

            MemoryStream buf = new MemoryStream(extensionData, false);

            var supported_signature_algorithms = TlsUtilities.ParseSupportedSignatureAlgorithms(buf);

            TlsProtocol.AssertEmpty(buf);

            return supported_signature_algorithms;
        }

        /// <exception cref="IOException"/>
        public static IList<SignatureAndHashAlgorithm> ReadSignatureAlgorithmsCertExtension(byte[] extensionData)
        {
            return ReadSignatureAlgorithmsExtension(extensionData);
        }

        /// <exception cref="IOException"/>
        public static CertificateStatusRequest ReadStatusRequestExtension(byte[] extensionData)
        {
            if (extensionData == null)
                throw new ArgumentNullException("extensionData");

            MemoryStream buf = new MemoryStream(extensionData, false);

            CertificateStatusRequest statusRequest = CertificateStatusRequest.Parse(buf);

            TlsProtocol.AssertEmpty(buf);

            return statusRequest;
        }

        /// <exception cref="IOException"/>
        public static IList<CertificateStatusRequestItemV2> ReadStatusRequestV2Extension(byte[] extensionData)
        {
            if (extensionData == null)
                throw new ArgumentNullException("extensionData");
            if (extensionData.Length < 3)
                throw new TlsFatalAlert(AlertDescription.decode_error);

            MemoryStream buf = new MemoryStream(extensionData, false);

            int length = TlsUtilities.ReadUint16(buf);
            if (length != (extensionData.Length - 2))
                throw new TlsFatalAlert(AlertDescription.decode_error);

            var statusRequestV2 = new List<CertificateStatusRequestItemV2>();
            while (buf.Position < buf.Length)
            {
                CertificateStatusRequestItemV2 entry = CertificateStatusRequestItemV2.Parse(buf);
                statusRequestV2.Add(entry);
            }
            return statusRequestV2;
        }

        /// <exception cref="IOException"/>
        public static int[] ReadSupportedGroupsExtension(byte[] extensionData)
        {
            if (extensionData == null)
                throw new ArgumentNullException("extensionData");

            MemoryStream buf = new MemoryStream(extensionData, false);

            int length = TlsUtilities.ReadUint16(buf);
            if (length < 2 || (length & 1) != 0)
                throw new TlsFatalAlert(AlertDescription.decode_error);

            int[] namedGroups = TlsUtilities.ReadUint16Array(length / 2, buf);

            TlsProtocol.AssertEmpty(buf);

            return namedGroups;
        }

        /// <exception cref="IOException"/>
        public static short[] ReadSupportedPointFormatsExtension(byte[] extensionData)
        {
            short[] ecPointFormats = TlsUtilities.DecodeUint8ArrayWithUint8Length(extensionData);
            if (!Arrays.Contains(ecPointFormats, ECPointFormat.uncompressed))
            {
                /*
                 * RFC 4492 5.1. If the Supported Point Formats Extension is indeed sent, it MUST
                 * contain the value 0 (uncompressed) as one of the items in the list of point formats.
                 */
                throw new TlsFatalAlert(AlertDescription.illegal_parameter);
            }
            return ecPointFormats;
        }

        /// <exception cref="IOException"/>
        public static ProtocolVersion[] ReadSupportedVersionsExtensionClient(byte[] extensionData)
        {
            if (extensionData == null)
                throw new ArgumentNullException("extensionData");
            if (extensionData.Length < 3 || extensionData.Length > 255 || (extensionData.Length & 1) == 0)
                throw new TlsFatalAlert(AlertDescription.decode_error);

            int length = TlsUtilities.ReadUint8(extensionData, 0);
            if (length != (extensionData.Length - 1))
                throw new TlsFatalAlert(AlertDescription.decode_error);

            int count = length / 2;
            ProtocolVersion[] versions = new ProtocolVersion[count];
            for (int i = 0; i < count; ++i)
            {
                versions[i] = TlsUtilities.ReadVersion(extensionData, 1 + i * 2);
            }
            return versions;
        }

        /// <exception cref="IOException"/>
        public static ProtocolVersion ReadSupportedVersionsExtensionServer(byte[] extensionData)
        {
            if (extensionData == null)
                throw new ArgumentNullException("extensionData");
            if (extensionData.Length != 2)
                throw new TlsFatalAlert(AlertDescription.decode_error);

            return TlsUtilities.ReadVersion(extensionData, 0);
        }

        /// <exception cref="IOException"/>
        public static bool ReadTruncatedHmacExtension(byte[] extensionData)
        {
            return ReadEmptyExtensionData(extensionData);
        }

        /// <exception cref="IOException"/>
        public static IList<TrustedAuthority> ReadTrustedCAKeysExtensionClient(byte[] extensionData)
        {
            if (extensionData == null)
                throw new ArgumentNullException("extensionData");
            if (extensionData.Length < 2)
                throw new TlsFatalAlert(AlertDescription.decode_error);

            MemoryStream buf = new MemoryStream(extensionData, false);

            int length = TlsUtilities.ReadUint16(buf);
            if (length != (extensionData.Length - 2))
                throw new TlsFatalAlert(AlertDescription.decode_error);

            var trusted_authorities_list = new List<TrustedAuthority>();
            while (buf.Position < buf.Length)
            {
                TrustedAuthority entry = TrustedAuthority.Parse(buf);
                trusted_authorities_list.Add(entry);
            }
            return trusted_authorities_list;
        }

        /// <exception cref="IOException"/>
        public static bool ReadTrustedCAKeysExtensionServer(byte[] extensionData)
        {
            return ReadEmptyExtensionData(extensionData);
        }

        /// <exception cref="IOException"/>
        private static byte[] PatchOpaque16(MemoryStream buf)
        {
            int length = Convert.ToInt32(buf.Length) - 2;
            TlsUtilities.CheckUint16(length);
            byte[] extensionData = buf.ToArray();
            TlsUtilities.WriteUint16(length, extensionData, 0);
            return extensionData;
        }
    }
}
