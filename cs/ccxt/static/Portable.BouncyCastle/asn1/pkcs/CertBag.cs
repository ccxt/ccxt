using System;

namespace Org.BouncyCastle.Asn1.Pkcs
{
    public class CertBag
        : Asn1Encodable
    {
        public static CertBag GetInstance(object obj)
        {
            if (obj is CertBag)
                return (CertBag)obj;
            if (obj == null)
                return null;
            return new CertBag(Asn1Sequence.GetInstance(obj));
        }

        private readonly DerObjectIdentifier certID;
        private readonly Asn1Object certValue;

		private CertBag(Asn1Sequence seq)
        {
			if (seq.Count != 2)
				throw new ArgumentException("Wrong number of elements in sequence", "seq");

            this.certID = DerObjectIdentifier.GetInstance(seq[0]);
            this.certValue = Asn1TaggedObject.GetInstance(seq[1]).GetObject();
        }

		public CertBag(
            DerObjectIdentifier	certID,
            Asn1Object			certValue)
        {
            this.certID = certID;
            this.certValue = certValue;
        }

		public virtual DerObjectIdentifier CertID
		{
			get { return certID; }
		}

		public virtual Asn1Object CertValue
		{
			get { return certValue; }
		}

		public override Asn1Object ToAsn1Object()
        {
			return new DerSequence(certID, new DerTaggedObject(0, certValue));
        }
    }
}
