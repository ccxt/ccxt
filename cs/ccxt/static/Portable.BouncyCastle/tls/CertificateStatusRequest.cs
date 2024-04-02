using System;
using System.IO;

namespace Org.BouncyCastle.Tls
{
    /// <summary>Implementation of the RFC 3546 3.6. CertificateStatusRequest.</summary>
    public sealed class CertificateStatusRequest
    {
        private short m_statusType;
        private object m_request;

        public CertificateStatusRequest(short statusType, object request)
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
                if (!IsCorrectType(CertificateStatusType.ocsp, m_request))
                    throw new InvalidOperationException("'request' is not an OCSPStatusRequest");

                return (OcspStatusRequest)m_request;
            }
        }

        /// <summary>Encode this <see cref="CertificateStatusRequest"/> to a <see cref="Stream"/>.</summary>
        /// <param name="output">the <see cref="Stream"/> to encode to.</param>
        /// <exception cref="IOException"/>
        public void Encode(Stream output)
        {
            TlsUtilities.WriteUint8(m_statusType, output);

            switch (m_statusType)
            {
            case CertificateStatusType.ocsp:
                ((OcspStatusRequest)m_request).Encode(output);
                break;
            default:
                throw new TlsFatalAlert(AlertDescription.internal_error);
            }
        }

        /// <summary>Parse a <see cref="CertificateStatusRequest"/> from a <see cref="Stream"/>.</summary>
        /// <param name="input">the <see cref="Stream"/> to parse from.</param>
        /// <returns>a <see cref="CertificateStatusRequest"/> object.</returns>
        /// <exception cref="IOException"/>
        public static CertificateStatusRequest Parse(Stream input)
        {
            short status_type = TlsUtilities.ReadUint8(input);
            object request;

            switch (status_type)
            {
            case CertificateStatusType.ocsp:
                request = OcspStatusRequest.Parse(input);
                break;
            default:
                throw new TlsFatalAlert(AlertDescription.decode_error);
            }

            return new CertificateStatusRequest(status_type, request);
        }

        private static bool IsCorrectType(short statusType, object request)
        {
            switch (statusType)
            {
            case CertificateStatusType.ocsp:
                return request is OcspStatusRequest;
            default:
                throw new ArgumentException("unsupported CertificateStatusType", "statusType");
            }
        }
    }
}
