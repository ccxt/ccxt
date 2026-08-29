using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.X509
{
    public class AttributeCertificateInfo
        : Asn1Encodable
    {
        internal readonly DerInteger			version;
        internal readonly Holder				holder;
        internal readonly AttCertIssuer			issuer;
        internal readonly AlgorithmIdentifier	signature;
        internal readonly DerInteger			serialNumber;
        internal readonly AttCertValidityPeriod	attrCertValidityPeriod;
        internal readonly Asn1Sequence			attributes;
        internal readonly DerBitString			issuerUniqueID;
        internal readonly X509Extensions		extensions;

		public static AttributeCertificateInfo GetInstance(
            Asn1TaggedObject	obj,
            bool				isExplicit)
        {
            return GetInstance(Asn1Sequence.GetInstance(obj, isExplicit));
        }

		public static AttributeCertificateInfo GetInstance(
            object obj)
        {
            if (obj is AttributeCertificateInfo)
            {
                return (AttributeCertificateInfo) obj;
            }

			if (obj is Asn1Sequence)
            {
                return new AttributeCertificateInfo((Asn1Sequence) obj);
            }

            throw new ArgumentException("unknown object in factory: " + Platform.GetTypeName(obj), "obj");
		}

		private AttributeCertificateInfo(
            Asn1Sequence seq)
        {
			if (seq.Count < 6 || seq.Count > 9)
			{
				throw new ArgumentException("Bad sequence size: " + seq.Count);
			}

            int start;
            if (seq[0] is DerInteger)   // in version 1 certs version is DEFAULT  v1(0)
            {
                this.version = DerInteger.GetInstance(seq[0]);
                start = 1;
            }
            else
            {
                this.version = new DerInteger(0);
                start = 0;
            }

            this.holder = Holder.GetInstance(seq[start]);
            this.issuer = AttCertIssuer.GetInstance(seq[start + 1]);
            this.signature = AlgorithmIdentifier.GetInstance(seq[start + 2]);
            this.serialNumber = DerInteger.GetInstance(seq[start + 3]);
            this.attrCertValidityPeriod = AttCertValidityPeriod.GetInstance(seq[start + 4]);
            this.attributes = Asn1Sequence.GetInstance(seq[start + 5]);

			for (int i = start + 6; i < seq.Count; i++)
            {
                Asn1Encodable obj = (Asn1Encodable) seq[i];

				if (obj is DerBitString)
                {
                    this.issuerUniqueID = DerBitString.GetInstance(seq[i]);
                }
                else if (obj is Asn1Sequence || obj is X509Extensions)
                {
                    this.extensions = X509Extensions.GetInstance(seq[i]);
                }
            }
        }

		public DerInteger Version
		{
			get { return version; }
		}

		public Holder Holder
		{
			get { return holder; }
		}

		public AttCertIssuer Issuer
		{
			get { return issuer; }
		}

		public AlgorithmIdentifier Signature
		{
			get { return signature; }
		}

		public DerInteger SerialNumber
		{
			get { return serialNumber; }
		}

		public AttCertValidityPeriod AttrCertValidityPeriod
		{
			get { return attrCertValidityPeriod; }
		}

		public Asn1Sequence Attributes
		{
			get { return attributes; }
		}

		public DerBitString IssuerUniqueID
		{
			get { return issuerUniqueID; }
		}

		public X509Extensions Extensions
		{
			get { return extensions; }
		}

		/**
         * Produce an object suitable for an Asn1OutputStream.
         * <pre>
         *  AttributeCertificateInfo ::= Sequence {
         *       version              AttCertVersion -- version is v2,
         *       holder               Holder,
         *       issuer               AttCertIssuer,
         *       signature            AlgorithmIdentifier,
         *       serialNumber         CertificateSerialNumber,
         *       attrCertValidityPeriod   AttCertValidityPeriod,
         *       attributes           Sequence OF Attr,
         *       issuerUniqueID       UniqueIdentifier OPTIONAL,
         *       extensions           Extensions OPTIONAL
         *  }
         *
         *  AttCertVersion ::= Integer { v2(1) }
         * </pre>
         */
        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector(9);

            if (!version.HasValue(0))
            {
                v.Add(version);
            }

            v.Add(holder, issuer, signature, serialNumber, attrCertValidityPeriod, attributes);
            v.AddOptional(issuerUniqueID, extensions);

            return new DerSequence(v);
        }
    }
}
