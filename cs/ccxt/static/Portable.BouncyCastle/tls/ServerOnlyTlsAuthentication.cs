using System;

namespace Org.BouncyCastle.Tls
{
    public abstract class ServerOnlyTlsAuthentication
        : TlsAuthentication
    {
        public abstract void NotifyServerCertificate(TlsServerCertificate serverCertificate);

        public TlsCredentials GetClientCredentials(CertificateRequest certificateRequest)
        {
            return null;
        }
    }
}
