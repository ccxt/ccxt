using System;
using System.IO;

namespace Org.BouncyCastle.Tls
{
    /// <summary>Implementation of the RFC 6961 2.2. CertificateStatusRequestItemV2.</summary>
    public sealed class CertificateStatusRequestItemV2
    {
        private readonly short m_statusType;
        private readonly object m_request;

        public CertificateStatusRequestItemV2(short statusType, object request)
        {
            if (!IsCorrectType(statusType, request))
                throw new ArgumentException("not an instance of the correct type", "request");

            this.m_statusType = statusType;
            this.m_request = request;
        }

        public short StatusType
        {
            get { return m_statusType; }
        }

        public object Request
        {
            get { return m_request; }
        }

        public OcspStatusRequest OcspStatusRequest
        {
            get
            {
                if (!(m_request is OcspStatusRequest))
                    throw new InvalidOperationException("'request' is not an OcspStatusRequest");

                return (OcspStatusRequest)m_request;
            }
        }

        /// <summary>Encode this <see cref="CertificateStatusRequestItemV2"/> to a <see cref="Stream"/>.</summary>
        /// <param name="output">the <see cref="Stream"/> to encode to.</param>
        /// <exception cref="IOException"/>
        public void Encode(Stream output)
        {
            TlsUtilities.WriteUint8(m_statusType, output);

            MemoryStream buf = new MemoryStream();
            switch (m_statusType)
            {
            case CertificateStatusType.ocsp:
            case CertificateStatusType.ocsp_multi:
                ((OcspStatusRequest)m_request).Encode(buf);
                break;
            default:
                throw new TlsFatalAlert(AlertDescription.internal_error);
            }
            byte[] requestBytes = buf.ToArray();
            TlsUtilities.WriteOpaque16(requestBytes, output);
        }

        /// <summary>Parse a <see cref="CertificateStatusRequestItemV2"/> from a <see cref="Stream"/>.</summary>
        /// <param name="input">the <see cref="Stream"/> to parse from.</param>
        /// <returns>a <see cref="CertificateStatusRequestItemV2"/> object.</returns>
        /// <exception cref="IOException"/>
        public static CertificateStatusRequestItemV2 Parse(Stream input)
        {
            short status_type = TlsUtilities.ReadUint8(input);

            object request;
            byte[] requestBytes = TlsUtilities.ReadOpaque16(input);
            MemoryStream buf = new MemoryStream(requestBytes, false);
            switch (status_type)
            {
            case CertificateStatusType.ocsp:
            case CertificateStatusType.ocsp_multi:
                request = OcspStatusRequest.Parse(buf);
                break;
            default:
                throw new TlsFatalAlert(AlertDescription.decode_error);
            }
            TlsProtocol.AssertEmpty(buf);

            return new CertificateStatusRequestItemV2(status_type, request);
        }

        private static bool IsCorrectType(short statusType, object request)
        {
            switch (statusType)
            {
            case CertificateStatusType.ocsp:
            case CertificateStatusType.ocsp_multi:
                return request is OcspStatusRequest;
            default:
                throw new ArgumentException("unsupported CertificateStatusType", "statusType");
            }
        }
    }
}
