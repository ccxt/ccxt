using System;

using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Ocsp
{
    public class Signature
        : Asn1Encodable
    {
        internal AlgorithmIdentifier	signatureAlgorithm;
        internal DerBitString			signatureValue;
        internal Asn1Sequence			certs;

		public static Signature GetInstance(
			Asn1TaggedObject	obj,
			bool				explicitly)
		{
			return GetInstance(Asn1Sequence.GetInstance(obj, explicitly));
		}

		public static Signature GetInstance(
			object  obj)
		{
			if (obj == null || obj is Signature)
			{
				return (Signature)obj;
			}

			if (obj is Asn1Sequence)
			{
				return new Signature((Asn1Sequence)obj);
			}

            throw new ArgumentException("unknown object in factory: " + Platform.GetTypeName(obj), "obj");
		}

		public Signature(
            AlgorithmIdentifier signatureAlgorithm,
            DerBitString        signatureValue)
			: this(signatureAlgorithm, signatureValue, null)
        {
        }

		public Signature(
            AlgorithmIdentifier	signatureAlgorithm,
            DerBitString		signatureValue,
            Asn1Sequence		certs)
        {
			if (signatureAlgorithm == null)
				throw new ArgumentException("signatureAlgorithm");
			if (signatureValue == null)
				throw new ArgumentException("signatureValue");

			this.signatureAlgorithm = signatureAlgorithm;
            this.signatureValue = signatureValue;
            this.certs = certs;
        }

		private Signature(
            Asn1Sequence seq)
        {
            signatureAlgorithm = AlgorithmIdentifier.GetInstance(seq[0]);
            signatureValue = (DerBitString)seq[1];

			if (seq.Count == 3)
            {
                certs = Asn1Sequence.GetInstance(
					(Asn1TaggedObject)seq[2], true);
            }
        }

		public AlgorithmIdentifier SignatureAlgorithm
		{
			get { return signatureAlgorithm; }
		}

		public DerBitString SignatureValue
		{
			get { return signatureValue; }
		}

        public byte[] GetSignatureOctets()
        {
            return signatureValue.GetOctets();
        }

        public Asn1Sequence Certs
		{
			get { return certs; }
		}

		/**
         * Produce an object suitable for an Asn1OutputStream.
         * <pre>
         * Signature       ::=     Sequence {
         *     signatureAlgorithm      AlgorithmIdentifier,
         *     signature               BIT STRING,
         *     certs               [0] EXPLICIT Sequence OF Certificate OPTIONAL}
         * </pre>
         */
        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector(signatureAlgorithm, signatureValue);
            v.AddOptionalTagged(true, 0, certs);
            return new DerSequence(v);
        }
    }
}
