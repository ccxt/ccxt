using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.X509
{
    public class IssuerSerial
        : Asn1Encodable
    {
        internal readonly GeneralNames	issuer;
        internal readonly DerInteger	serial;
        internal readonly DerBitString	issuerUid;

		public static IssuerSerial GetInstance(
            object obj)
        {
            if (obj == null || obj is IssuerSerial)
            {
                return (IssuerSerial) obj;
            }

			if (obj is Asn1Sequence)
            {
                return new IssuerSerial((Asn1Sequence) obj);
            }

            throw new ArgumentException("unknown object in factory: " + Platform.GetTypeName(obj), "obj");
		}

        public static IssuerSerial GetInstance(
            Asn1TaggedObject	obj,
            bool				explicitly)
        {
            return GetInstance(Asn1Sequence.GetInstance(obj, explicitly));
        }

		private IssuerSerial(
            Asn1Sequence seq)
        {
			if (seq.Count != 2 && seq.Count != 3)
			{
				throw new ArgumentException("Bad sequence size: " + seq.Count);
			}

			issuer = GeneralNames.GetInstance(seq[0]);
			serial = DerInteger.GetInstance(seq[1]);

			if (seq.Count == 3)
            {
				issuerUid = DerBitString.GetInstance(seq[2]);
			}
        }

		public IssuerSerial(
			GeneralNames	issuer,
			DerInteger		serial)
		{
			this.issuer = issuer;
			this.serial = serial;
		}

		public GeneralNames Issuer
		{
			get { return issuer; }
		}

		public DerInteger Serial
		{
			get { return serial; }
		}

		public DerBitString IssuerUid
		{
			get { return issuerUid; }
		}

		/**
         * Produce an object suitable for an Asn1OutputStream.
         * <pre>
         *  IssuerSerial  ::=  Sequence {
         *       issuer         GeneralNames,
         *       serial         CertificateSerialNumber,
         *       issuerUid      UniqueIdentifier OPTIONAL
         *  }
         * </pre>
         */
        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector(issuer, serial);
            v.AddOptional(issuerUid);
            return new DerSequence(v);
        }
	}
}
