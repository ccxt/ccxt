using System;

using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Cms
{
    public class PasswordRecipientInfo
        : Asn1Encodable
    {
        private readonly DerInteger				version;
        private readonly AlgorithmIdentifier	keyDerivationAlgorithm;
        private readonly AlgorithmIdentifier	keyEncryptionAlgorithm;
        private readonly Asn1OctetString		encryptedKey;

		public PasswordRecipientInfo(
            AlgorithmIdentifier	keyEncryptionAlgorithm,
            Asn1OctetString		encryptedKey)
        {
            this.version = new DerInteger(0);
            this.keyEncryptionAlgorithm = keyEncryptionAlgorithm;
            this.encryptedKey = encryptedKey;
        }

		public PasswordRecipientInfo(
			AlgorithmIdentifier	keyDerivationAlgorithm,
			AlgorithmIdentifier	keyEncryptionAlgorithm,
			Asn1OctetString		encryptedKey)
		{
			this.version = new DerInteger(0);
			this.keyDerivationAlgorithm = keyDerivationAlgorithm;
			this.keyEncryptionAlgorithm = keyEncryptionAlgorithm;
			this.encryptedKey = encryptedKey;
		}

		public PasswordRecipientInfo(
            Asn1Sequence seq)
        {
            version = (DerInteger) seq[0];

			if (seq[1] is Asn1TaggedObject)
            {
                keyDerivationAlgorithm = AlgorithmIdentifier.GetInstance((Asn1TaggedObject) seq[1], false);
                keyEncryptionAlgorithm = AlgorithmIdentifier.GetInstance(seq[2]);
                encryptedKey = (Asn1OctetString) seq[3];
            }
            else
            {
                keyEncryptionAlgorithm = AlgorithmIdentifier.GetInstance(seq[1]);
                encryptedKey = (Asn1OctetString) seq[2];
            }
        }

		/**
         * return a PasswordRecipientInfo object from a tagged object.
         *
         * @param obj the tagged object holding the object we want.
         * @param explicitly true if the object is meant to be explicitly
         *              tagged false otherwise.
         * @exception ArgumentException if the object held by the
         *          tagged object cannot be converted.
         */
        public static PasswordRecipientInfo GetInstance(
            Asn1TaggedObject	obj,
            bool				explicitly)
        {
            return GetInstance(Asn1Sequence.GetInstance(obj, explicitly));
        }

		/**
         * return a PasswordRecipientInfo object from the given object.
         *
         * @param obj the object we want converted.
         * @exception ArgumentException if the object cannot be converted.
         */
        public static PasswordRecipientInfo GetInstance(
            object obj)
        {
            if (obj == null || obj is PasswordRecipientInfo)
                return (PasswordRecipientInfo) obj;

			if (obj is Asn1Sequence)
                return new PasswordRecipientInfo((Asn1Sequence) obj);

            throw new ArgumentException("Invalid PasswordRecipientInfo: " + Platform.GetTypeName(obj));
        }

		public DerInteger Version
		{
			get { return version; }
		}

		public AlgorithmIdentifier KeyDerivationAlgorithm
		{
			get { return keyDerivationAlgorithm; }
		}

		public AlgorithmIdentifier KeyEncryptionAlgorithm
		{
			get { return keyEncryptionAlgorithm; }
		}

		public Asn1OctetString EncryptedKey
		{
			get { return encryptedKey; }
		}

		/**
         * Produce an object suitable for an Asn1OutputStream.
         * <pre>
         * PasswordRecipientInfo ::= Sequence {
         *   version CMSVersion,   -- Always set to 0
         *   keyDerivationAlgorithm [0] KeyDerivationAlgorithmIdentifier
         *                             OPTIONAL,
         *  keyEncryptionAlgorithm KeyEncryptionAlgorithmIdentifier,
         *  encryptedKey EncryptedKey }
         * </pre>
         */
        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector(version);
            v.AddOptionalTagged(false, 0, keyDerivationAlgorithm);
			v.Add(keyEncryptionAlgorithm, encryptedKey);
			return new DerSequence(v);
        }
    }
}
