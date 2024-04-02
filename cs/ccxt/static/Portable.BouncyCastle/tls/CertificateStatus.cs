using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Ocsp;

namespace Org.BouncyCastle.Tls
{
    public sealed class CertificateStatus
    {
        private readonly short m_statusType;
        private readonly object m_response;

        public CertificateStatus(short statusType, object response)
        {
            if (!IsCorrectType(statusType, response))
                throw new ArgumentException("not an instance of the correct type", "response");

            this.m_statusType = statusType;
            this.m_response = response;
        }

        public short StatusType
        {
            get { return m_statusType; }
        }

        public object Response
        {
            get { return m_response; }
        }

        public OcspResponse OcspResponse
        {
            get
            {
                if (!IsCorrectType(CertificateStatusType.ocsp, m_response))
                    throw new InvalidOperationException("'response' is not an OCSPResponse");

                return (OcspResponse)m_response;
            }
        }

        /// <summary>an <see cref="IList{T}"/> of (possibly null) <see cref="Asn1.Ocsp.OcspResponse"/>.</summary>
        public IList<OcspResponse> OcspResponseList
        {
            get
            {
                if (!IsCorrectType(CertificateStatusType.ocsp_multi, m_response))
                    throw new InvalidOperationException("'response' is not an OCSPResponseList");

                return (IList<OcspResponse>)m_response;
            }
        }

        /// <summary>Encode this <see cref="CertificateStatus"/> to a <see cref="Stream"/>.</summary>
        /// <param name="output">the <see cref="Stream"/> to encode to.</param>
        /// <exception cref="IOException"/>
        public void Encode(Stream output)
        {
            TlsUtilities.WriteUint8(m_statusType, output);

            switch (m_statusType)
            {
            case CertificateStatusType.ocsp:
            {
                OcspResponse ocspResponse = (OcspResponse)m_response;
                byte[] derEncoding = ocspResponse.GetEncoded(Asn1Encodable.Der);
                TlsUtilities.WriteOpaque24(derEncoding, output);
                break;
            }
            case CertificateStatusType.ocsp_multi:
            {
                var ocspResponseList = (IList<OcspResponse>)m_response;
                int count = ocspResponseList.Count;

                var derEncodings = new List<byte[]>(count);
                long totalLength = 0;
                foreach (OcspResponse ocspResponse in ocspResponseList)
                {
                    if (ocspResponse == null)
                    {
                        derEncodings.Add(TlsUtilities.EmptyBytes);
                    }
                    else
                    {
                        byte[] derEncoding = ocspResponse.GetEncoded(Asn1Encodable.Der);
                        derEncodings.Add(derEncoding);
                        totalLength += derEncoding.Length;
                    }
                    totalLength += 3;
                }

                TlsUtilities.CheckUint24(totalLength);
                TlsUtilities.WriteUint24((int)totalLength, output);

                foreach (byte[] derEncoding in derEncodings)
                {
                    TlsUtilities.WriteOpaque24(derEncoding, output);
                }

                break;
            }
            default:
                throw new TlsFatalAlert(AlertDescription.internal_error);
            }
        }

        /// <summary>Parse a <see cref="CertificateStatus"/> from a <see cref="Stream"/>.</summary>
        /// <param name="context">the <see cref="TlsContext"/> of the current connection.</param>
        /// <param name="input">the <see cref="Stream"/> to parse from.</param>
        /// <returns>a <see cref="CertificateStatus"/> object.</returns>
        /// <exception cref="IOException"/>
        public static CertificateStatus Parse(TlsContext context, Stream input)
        {
            SecurityParameters securityParameters = context.SecurityParameters;

            Certificate peerCertificate = securityParameters.PeerCertificate;
            if (null == peerCertificate || peerCertificate.IsEmpty
                || CertificateType.X509 != peerCertificate.CertificateType)
            {
                throw new TlsFatalAlert(AlertDescription.internal_error);
            }

            int certificateCount = peerCertificate.Length;
            int statusRequestVersion = securityParameters.StatusRequestVersion;

            short status_type = TlsUtilities.ReadUint8(input);
            object response;

            switch (status_type)
            {
            case CertificateStatusType.ocsp:
            {
                RequireStatusRequestVersion(1, statusRequestVersion);

                byte[] derEncoding = TlsUtilities.ReadOpaque24(input, 1);
                response = ParseOcspResponse(derEncoding);
                break;
            }
            case CertificateStatusType.ocsp_multi:
            {
                RequireStatusRequestVersion(2, statusRequestVersion);

                byte[] ocsp_response_list = TlsUtilities.ReadOpaque24(input, 1);
                MemoryStream buf = new MemoryStream(ocsp_response_list, false);

                var ocspResponseList = new List<OcspResponse>();
                while (buf.Position < buf.Length)
                {
                    if (ocspResponseList.Count >= certificateCount)
                        throw new TlsFatalAlert(AlertDescription.illegal_parameter);

                    int length = TlsUtilities.ReadUint24(buf);
                    if (length < 1)
                    {
                        ocspResponseList.Add(null);
                    }
                    else
                    {
                        byte[] derEncoding = TlsUtilities.ReadFully(length, buf);
                        ocspResponseList.Add(ParseOcspResponse(derEncoding));
                    }
                }

                response = ocspResponseList;
                break;
            }
            default:
                throw new TlsFatalAlert(AlertDescription.decode_error);
            }

            return new CertificateStatus(status_type, response);
        }

        private static bool IsCorrectType(short statusType, object response)
        {
            switch (statusType)
            {
            case CertificateStatusType.ocsp:
                return response is OcspResponse;
            case CertificateStatusType.ocsp_multi:
                return IsOcspResponseList(response);
            default:
                throw new ArgumentException("unsupported CertificateStatusType", "statusType");
            }
        }

        private static bool IsOcspResponseList(object response)
        {
            return response is IList<OcspResponse> v && v.Count > 0;
        }

        /// <exception cref="IOException"/>
        private static OcspResponse ParseOcspResponse(byte[] derEncoding)
        {
            Asn1Object asn1 = TlsUtilities.ReadAsn1Object(derEncoding);
            OcspResponse ocspResponse = OcspResponse.GetInstance(asn1);
            TlsUtilities.RequireDerEncoding(ocspResponse, derEncoding);
            return ocspResponse;
        }

        /// <exception cref="IOException"/>
        private static void RequireStatusRequestVersion(int minVersion, int statusRequestVersion)
        {
            if (statusRequestVersion < minVersion)
                throw new TlsFatalAlert(AlertDescription.decode_error);
        }
    }
}
