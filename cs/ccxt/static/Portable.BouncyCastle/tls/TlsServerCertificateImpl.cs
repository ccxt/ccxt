using System;

namespace Org.BouncyCastle.Tls
{
    internal sealed class TlsServerCertificateImpl
        : TlsServerCertificate
    {
        private readonly Certificate m_certificate;
        private readonly CertificateStatus m_certificateStatus;

        internal TlsServerCertificateImpl(Certificate certificate, CertificateStatus certificateStatus)
        {
            this.m_certificate = certificate;
            this.m_certificateStatus = certificateStatus;
        }

        public Certificate Certificate
        {
            get { return m_certificate; }
        }

        public CertificateStatus CertificateStatus
        {
            get { return m_certificateStatus; }
        }
    }
}
