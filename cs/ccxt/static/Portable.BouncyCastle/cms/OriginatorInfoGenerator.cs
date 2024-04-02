using System;
using System.Collections.Generic;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Cms;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities.Collections;
using Org.BouncyCastle.X509;

namespace Org.BouncyCastle.Cms
{
    public class OriginatorInfoGenerator
    {
        private readonly List<X509CertificateStructure> origCerts;
        private readonly List<CertificateList> origCrls;

        public OriginatorInfoGenerator(X509Certificate origCert)
        {
            this.origCerts = new List<X509CertificateStructure>();
            this.origCrls = null;
            origCerts.Add(origCert.CertificateStructure);
        }

        public OriginatorInfoGenerator(IStore<X509Certificate> origCerts)
            : this(origCerts, null)
        {
        }

        public OriginatorInfoGenerator(IStore<X509Certificate> origCerts, IStore<X509Crl> origCrls)
        {
            this.origCerts = CmsUtilities.GetCertificatesFromStore(origCerts);
            this.origCrls = origCrls == null ? null : CmsUtilities.GetCrlsFromStore(origCrls);
        }
 
        public virtual OriginatorInfo Generate()
        {
            Asn1Set certSet = CmsUtilities.CreateDerSetFromList(origCerts);
            Asn1Set crlSet = origCrls == null ? null : CmsUtilities.CreateDerSetFromList(origCrls);
            return new OriginatorInfo(certSet, crlSet);
        }
    }
}
