using System;
using System.IO;

namespace Org.BouncyCastle.Asn1.X509
{
    /**
     * The object that contains the public key stored in a certficate.
     * <p>
     * The GetEncoded() method in the public keys in the JCE produces a DER
     * encoded one of these.</p>
     */
    public class SubjectPublicKeyInfo
        : Asn1Encodable
    {
        private readonly AlgorithmIdentifier	algID;
        private readonly DerBitString			keyData;

		public static SubjectPublicKeyInfo GetInstance(
            Asn1TaggedObject	obj,
            bool				explicitly)
        {
            return GetInstance(Asn1Sequence.GetInstance(obj, explicitly));
        }

		public static SubjectPublicKeyInfo GetInstance(
            object obj)
        {
            if (obj is SubjectPublicKeyInfo)
                return (SubjectPublicKeyInfo) obj;

			if (obj != null)
				return new SubjectPublicKeyInfo(Asn1Sequence.GetInstance(obj));

			return null;
        }

		public SubjectPublicKeyInfo(
            AlgorithmIdentifier	algID,
            Asn1Encodable		publicKey)
        {
            this.keyData = new DerBitString(publicKey);
            this.algID = algID;
        }

		public SubjectPublicKeyInfo(
            AlgorithmIdentifier	algID,
            byte[]				publicKey)
        {
            this.keyData = new DerBitString(publicKey);
            this.algID = algID;
        }

		private SubjectPublicKeyInfo(
            Asn1Sequence seq)
        {
			if (seq.Count != 2)
				throw new ArgumentException("Bad sequence size: " + seq.Count, "seq");

            this.algID = AlgorithmIdentifier.GetInstance(seq[0]);
			this.keyData = DerBitString.GetInstance(seq[1]);
		}

		public AlgorithmIdentifier AlgorithmID
        {
			get { return algID; }
        }

        /**
         * for when the public key is an encoded object - if the bitstring
         * can't be decoded this routine raises an IOException.
         *
         * @exception IOException - if the bit string doesn't represent a Der
         * encoded object.
         */
        public Asn1Object ParsePublicKey()
        {
            return Asn1Object.FromByteArray(keyData.GetOctets());
        }

		/**
         * for when the public key is raw bits...
         */
        public DerBitString PublicKeyData
        {
			get { return keyData; }
        }

		/**
         * Produce an object suitable for an Asn1OutputStream.
         * <pre>
         * SubjectPublicKeyInfo ::= Sequence {
         *                          algorithm AlgorithmIdentifier,
         *                          publicKey BIT STRING }
         * </pre>
         */
        public override Asn1Object ToAsn1Object()
        {
			return new DerSequence(algID, keyData);
        }
    }
}
