using System;

using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Cms
{
    public class OriginatorPublicKey
        : Asn1Encodable
    {
        private readonly AlgorithmIdentifier mAlgorithm;
        private readonly DerBitString        mPublicKey;

        public OriginatorPublicKey(
            AlgorithmIdentifier algorithm,
            byte[]              publicKey)
        {
            this.mAlgorithm = algorithm;
            this.mPublicKey = new DerBitString(publicKey);
        }

		private OriginatorPublicKey(Asn1Sequence seq)
        {
            this.mAlgorithm = AlgorithmIdentifier.GetInstance(seq[0]);
            this.mPublicKey = DerBitString.GetInstance(seq[1]);
        }

		/**
         * return an OriginatorPublicKey object from a tagged object.
         *
         * @param obj the tagged object holding the object we want.
         * @param explicitly true if the object is meant to be explicitly
         *              tagged false otherwise.
         * @exception ArgumentException if the object held by the
         *          tagged object cannot be converted.
         */
        public static OriginatorPublicKey GetInstance(
            Asn1TaggedObject	obj,
            bool				explicitly)
        {
            return GetInstance(Asn1Sequence.GetInstance(obj, explicitly));
        }

		/**
         * return an OriginatorPublicKey object from the given object.
         *
         * @param obj the object we want converted.
         * @exception ArgumentException if the object cannot be converted.
         */
        public static OriginatorPublicKey GetInstance(
            object obj)
        {
            if (obj == null || obj is OriginatorPublicKey)
                return (OriginatorPublicKey)obj;

			if (obj is Asn1Sequence)
                return new OriginatorPublicKey(Asn1Sequence.GetInstance(obj));

            throw new ArgumentException("Invalid OriginatorPublicKey: " + Platform.GetTypeName(obj));
        }

		public AlgorithmIdentifier Algorithm
		{
			get { return mAlgorithm; }
		}

		public DerBitString PublicKey
		{
			get { return mPublicKey; }
		}

		/**
         * Produce an object suitable for an Asn1OutputStream.
         * <pre>
         * OriginatorPublicKey ::= Sequence {
         *     algorithm AlgorithmIdentifier,
         *     publicKey BIT STRING
         * }
         * </pre>
         */
        public override Asn1Object ToAsn1Object()
        {
			return new DerSequence(mAlgorithm, mPublicKey);
        }
    }
}
