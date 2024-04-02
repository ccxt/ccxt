using System;

using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Cms
{
    public class KekRecipientInfo
        : Asn1Encodable
    {
        private DerInteger			version;
        private KekIdentifier       kekID;
        private AlgorithmIdentifier keyEncryptionAlgorithm;
        private Asn1OctetString     encryptedKey;

		public KekRecipientInfo(
            KekIdentifier       kekID,
            AlgorithmIdentifier keyEncryptionAlgorithm,
            Asn1OctetString     encryptedKey)
        {
            this.version = new DerInteger(4);
            this.kekID = kekID;
            this.keyEncryptionAlgorithm = keyEncryptionAlgorithm;
            this.encryptedKey = encryptedKey;
        }

		public KekRecipientInfo(
            Asn1Sequence seq)
        {
            version = (DerInteger) seq[0];
            kekID = KekIdentifier.GetInstance(seq[1]);
            keyEncryptionAlgorithm = AlgorithmIdentifier.GetInstance(seq[2]);
            encryptedKey = (Asn1OctetString) seq[3];
        }

		/**
         * return a KekRecipientInfo object from a tagged object.
         *
         * @param obj the tagged object holding the object we want.
         * @param explicitly true if the object is meant to be explicitly
         *              tagged false otherwise.
         * @exception ArgumentException if the object held by the
         *          tagged object cannot be converted.
         */
        public static KekRecipientInfo GetInstance(
            Asn1TaggedObject	obj,
            bool				explicitly)
        {
            return GetInstance(Asn1Sequence.GetInstance(obj, explicitly));
        }

        /**
         * return a KekRecipientInfo object from the given object.
         *
         * @param obj the object we want converted.
         * @exception ArgumentException if the object cannot be converted.
         */
        public static KekRecipientInfo GetInstance(
            object obj)
        {
            if (obj == null || obj is KekRecipientInfo)
                return (KekRecipientInfo)obj;

			if(obj is Asn1Sequence)
                return new KekRecipientInfo((Asn1Sequence)obj);

            throw new ArgumentException("Invalid KekRecipientInfo: " + Platform.GetTypeName(obj));
        }

		public DerInteger Version
		{
			get { return version; }
		}

		public KekIdentifier KekID
		{
			get { return kekID; }
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
         * KekRecipientInfo ::= Sequence {
         *     version CMSVersion,  -- always set to 4
         *     kekID KekIdentifier,
         *     keyEncryptionAlgorithm KeyEncryptionAlgorithmIdentifier,
         *     encryptedKey EncryptedKey
         * }
         * </pre>
         */
        public override Asn1Object ToAsn1Object()
        {
			return new DerSequence(version, kekID, keyEncryptionAlgorithm, encryptedKey);
        }
    }
}
