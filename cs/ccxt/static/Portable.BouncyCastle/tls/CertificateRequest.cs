using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Tls
{
    /// <summary>Parsing and encoding of a <i>CertificateRequest</i> struct from RFC 4346.</summary>
    /// <remarks>
    /// <pre>
    /// struct {
    ///   ClientCertificateType certificate_types&lt;1..2^8-1&gt;;
    ///   DistinguishedName certificate_authorities&lt;3..2^16-1&gt;;
    /// } CertificateRequest;
    /// </pre>
    /// Updated for RFC 5246:
    /// <pre>
    /// struct {
    ///   ClientCertificateType certificate_types &lt;1..2 ^ 8 - 1&gt;;
    ///   SignatureAndHashAlgorithm supported_signature_algorithms &lt;2 ^ 16 - 1&gt;;
    ///   DistinguishedName certificate_authorities &lt;0..2 ^ 16 - 1&gt;;
    /// } CertificateRequest;
    /// </pre>
    /// Revised for RFC 8446:
    /// <pre>
    /// struct {
    ///   opaque certificate_request_context &lt;0..2 ^ 8 - 1&gt;;
    ///   Extension extensions &lt;2..2 ^ 16 - 1&gt;;
    /// } CertificateRequest;
    /// </pre>
    /// </remarks>
    /// <seealso cref="ClientCertificateType"/>
    /// <seealso cref="X509Name"/>
    public sealed class CertificateRequest
    {
        /// <exception cref="IOException"/>
        private static IList<SignatureAndHashAlgorithm> CheckSupportedSignatureAlgorithms(
            IList<SignatureAndHashAlgorithm> supportedSignatureAlgorithms, short alertDescription)
        {
            if (null == supportedSignatureAlgorithms)
                throw new TlsFatalAlert(alertDescription, "'signature_algorithms' is required");

            return supportedSignatureAlgorithms;
        }

        private readonly byte[] m_certificateRequestContext;
        private readonly short[] m_certificateTypes;
        private readonly IList<SignatureAndHashAlgorithm> m_supportedSignatureAlgorithms;
        private readonly IList<SignatureAndHashAlgorithm> m_supportedSignatureAlgorithmsCert;
        private readonly IList<X509Name> m_certificateAuthorities;

        /// <param name="certificateTypes">see <see cref="ClientCertificateType"/> for valid constants.</param>
        /// <param name="supportedSignatureAlgorithms"></param>
        /// <param name="certificateAuthorities">an <see cref="IList{T}"/> of <see cref="X509Name"/>.</param>
        public CertificateRequest(short[] certificateTypes,
            IList<SignatureAndHashAlgorithm> supportedSignatureAlgorithms, IList<X509Name> certificateAuthorities)
            : this(null, certificateTypes, supportedSignatureAlgorithms, null, certificateAuthorities)
        {
        }

        // TODO[tls13] Prefer to manage the certificateRequestContext internally only? 
        /// <exception cref="IOException"/>
        public CertificateRequest(byte[] certificateRequestContext,
            IList<SignatureAndHashAlgorithm> supportedSignatureAlgorithms,
            IList<SignatureAndHashAlgorithm> supportedSignatureAlgorithmsCert, IList<X509Name> certificateAuthorities)
            : this(certificateRequestContext, null,
                CheckSupportedSignatureAlgorithms(supportedSignatureAlgorithms, AlertDescription.internal_error),
                supportedSignatureAlgorithmsCert, certificateAuthorities)
        {
            /*
             * TODO[tls13] Removed certificateTypes, added certificate_request_context, added extensions
             * (required: signature_algorithms, optional: status_request, signed_certificate_timestamp,
             * certificate_authorities, oid_filters, signature_algorithms_cert)
             */
        }

        private CertificateRequest(byte[] certificateRequestContext, short[] certificateTypes,
            IList<SignatureAndHashAlgorithm> supportedSignatureAlgorithms,
            IList<SignatureAndHashAlgorithm> supportedSignatureAlgorithmsCert, IList<X509Name> certificateAuthorities)
        {
            if (null != certificateRequestContext && !TlsUtilities.IsValidUint8(certificateRequestContext.Length))
                throw new ArgumentException("cannot be longer than 255", "certificateRequestContext");
            if (null != certificateTypes
                && (certificateTypes.Length < 1 || !TlsUtilities.IsValidUint8(certificateTypes.Length)))
            {
                throw new ArgumentException("should have length from 1 to 255", "certificateTypes");
            }

            this.m_certificateRequestContext = TlsUtilities.Clone(certificateRequestContext);
            this.m_certificateTypes = certificateTypes;
            this.m_supportedSignatureAlgorithms = supportedSignatureAlgorithms;
            this.m_supportedSignatureAlgorithmsCert = supportedSignatureAlgorithmsCert;
            this.m_certificateAuthorities = certificateAuthorities;
        }

        public byte[] GetCertificateRequestContext()
        {
            return TlsUtilities.Clone(m_certificateRequestContext);
        }

        /// <returns>an array of certificate types</returns>
        /// <seealso cref="ClientCertificateType"/>
        public short[] CertificateTypes
        {
            get { return m_certificateTypes; }
        }

        /// <returns>an <see cref="IList{T}"/> of <see cref="SignatureAndHashAlgorithm"/> (or null before TLS 1.2).
        /// </returns>
        public IList<SignatureAndHashAlgorithm> SupportedSignatureAlgorithms
        {
            get { return m_supportedSignatureAlgorithms; }
        }

        /// <returns>an optional <see cref="IList{T}"/> of <see cref="SignatureAndHashAlgorithm"/>. May be non-null from
        /// TLS 1.3 onwards.</returns>
        public IList<SignatureAndHashAlgorithm> SupportedSignatureAlgorithmsCert
        {
            get { return m_supportedSignatureAlgorithmsCert; }
        }

        /// <returns>an <see cref="IList{T}"/> of <see cref="X509Name"/>.</returns>
        public IList<X509Name> CertificateAuthorities
        {
            get { return m_certificateAuthorities; }
        }

        public bool HasCertificateRequestContext(byte[] certificateRequestContext)
        {
            return Arrays.AreEqual(m_certificateRequestContext, certificateRequestContext);
        }

        /// <summary>Encode this <see cref="CertificateRequest"/> to a <see cref="Stream"/>.</summary>
        /// <param name="context">the <see cref="TlsContext"/> of the current connection.</param>
        /// <param name="output">the <see cref="Stream"/> to encode to.</param>
        /// <exception cref="IOException"/>
        public void Encode(TlsContext context, Stream output)
        {
            ProtocolVersion negotiatedVersion = context.ServerVersion;
            bool isTlsV12 = TlsUtilities.IsTlsV12(negotiatedVersion);
            bool isTlsV13 = TlsUtilities.IsTlsV13(negotiatedVersion);

            if (isTlsV13 != (null != m_certificateRequestContext) ||
                isTlsV13 != (null == m_certificateTypes) ||
                isTlsV12 != (null != m_supportedSignatureAlgorithms) ||
                (!isTlsV13 && (null != m_supportedSignatureAlgorithmsCert)))
            {
                throw new InvalidOperationException();
            }

            if (isTlsV13)
            {
                TlsUtilities.WriteOpaque8(m_certificateRequestContext, output);

                var extensions = new Dictionary<int, byte[]>();
                TlsExtensionsUtilities.AddSignatureAlgorithmsExtension(extensions, m_supportedSignatureAlgorithms);

                if (null != m_supportedSignatureAlgorithmsCert)
                {
                    TlsExtensionsUtilities.AddSignatureAlgorithmsCertExtension(extensions,
                        m_supportedSignatureAlgorithmsCert);
                }

                if (null != m_certificateAuthorities)
                {
                    TlsExtensionsUtilities.AddCertificateAuthoritiesExtension(extensions, m_certificateAuthorities);
                }

                byte[] extEncoding = TlsProtocol.WriteExtensionsData(extensions);

                TlsUtilities.WriteOpaque16(extEncoding, output);
                return;
            }

            TlsUtilities.WriteUint8ArrayWithUint8Length(m_certificateTypes, output);

            if (isTlsV12)
            {
                // TODO Check whether SignatureAlgorithm.anonymous is allowed here
                TlsUtilities.EncodeSupportedSignatureAlgorithms(m_supportedSignatureAlgorithms, output);
            }

            if (m_certificateAuthorities == null || m_certificateAuthorities.Count < 1)
            {
                TlsUtilities.WriteUint16(0, output);
            }
            else
            {
                var derEncodings = new List<byte[]>(m_certificateAuthorities.Count);

                int totalLength = 0;
                foreach (X509Name certificateAuthority in m_certificateAuthorities)
                {
                    byte[] derEncoding = certificateAuthority.GetEncoded(Asn1Encodable.Der);
                    derEncodings.Add(derEncoding);
                    totalLength += derEncoding.Length + 2;
                }

                TlsUtilities.CheckUint16(totalLength);
                TlsUtilities.WriteUint16(totalLength, output);

                foreach (byte[] derEncoding in derEncodings)
                {
                    TlsUtilities.WriteOpaque16(derEncoding, output);
                }
            }
        }

        /// <summary>Parse a <see cref="CertificateRequest"/> from a <see cref="Stream"/></summary>
        /// <param name="context">the <see cref="TlsContext"/> of the current connection.</param>
        /// <param name="input">the <see cref="Stream"/> to parse from.</param>
        /// <returns>a <see cref="CertificateRequest"/> object.</returns>
        /// <exception cref="IOException"/>
        public static CertificateRequest Parse(TlsContext context, Stream input)
        {
            ProtocolVersion negotiatedVersion = context.ServerVersion;
            bool isTlsV13 = TlsUtilities.IsTlsV13(negotiatedVersion);

            if (isTlsV13)
            {
                byte[] certificateRequestContext = TlsUtilities.ReadOpaque8(input);

                /*
                 * TODO[tls13] required: signature_algorithms; optional: status_request,
                 * signed_certificate_timestamp, certificate_authorities, oid_filters,
                 * signature_algorithms_cert
                 */

                byte[] extEncoding = TlsUtilities.ReadOpaque16(input);

                var extensions = TlsProtocol.ReadExtensionsData13(HandshakeType.certificate_request, extEncoding);

                var supportedSignatureAlgorithms13 = CheckSupportedSignatureAlgorithms(
                    TlsExtensionsUtilities.GetSignatureAlgorithmsExtension(extensions),
                    AlertDescription.missing_extension);
                var supportedSignatureAlgorithmsCert13 = TlsExtensionsUtilities
                    .GetSignatureAlgorithmsCertExtension(extensions);
                var certificateAuthorities13 = TlsExtensionsUtilities.GetCertificateAuthoritiesExtension(extensions);

                return new CertificateRequest(certificateRequestContext, supportedSignatureAlgorithms13,
                    supportedSignatureAlgorithmsCert13, certificateAuthorities13);
            }

            bool isTLSv12 = TlsUtilities.IsTlsV12(negotiatedVersion);

            short[] certificateTypes = TlsUtilities.ReadUint8ArrayWithUint8Length(input, 1);

            IList<SignatureAndHashAlgorithm> supportedSignatureAlgorithms = null;
            if (isTLSv12)
            {
                supportedSignatureAlgorithms = TlsUtilities.ParseSupportedSignatureAlgorithms(input);
            }

            IList<X509Name> certificateAuthorities = null;
            {
                byte[] certAuthData = TlsUtilities.ReadOpaque16(input);
                if (certAuthData.Length > 0)
                {
                    certificateAuthorities = new List<X509Name>();
                    MemoryStream bis = new MemoryStream(certAuthData, false);
                    do
                    {
                        byte[] derEncoding = TlsUtilities.ReadOpaque16(bis, 1);
                        Asn1Object asn1 = TlsUtilities.ReadAsn1Object(derEncoding);
                        X509Name ca = X509Name.GetInstance(asn1);
                        TlsUtilities.RequireDerEncoding(ca, derEncoding);
                        certificateAuthorities.Add(ca);
                    }
                    while (bis.Position < bis.Length);
                }
            }

            return new CertificateRequest(certificateTypes, supportedSignatureAlgorithms, certificateAuthorities);
        }
    }
}
