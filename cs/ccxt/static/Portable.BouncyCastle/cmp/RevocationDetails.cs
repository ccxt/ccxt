using System;

using Org.BouncyCastle.Asn1.Cmp;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Math;

namespace Org.BouncyCastle.Cmp
{
    public class RevocationDetails
    {
        private readonly RevDetails revDetails;

        public RevocationDetails(RevDetails revDetails)
        {
            this.revDetails = revDetails;
        }

        public X509Name Subject
        {
            get { return revDetails.CertDetails.Subject; }
        }

        public X509Name Issuer
        {
            get { return revDetails.CertDetails.Issuer; }
        }

        public BigInteger SerialNumber
        {
            get { return revDetails.CertDetails.SerialNumber.Value; }
        }

        public RevDetails ToASN1Structure()
        {
            return revDetails;
        }
    }
}
