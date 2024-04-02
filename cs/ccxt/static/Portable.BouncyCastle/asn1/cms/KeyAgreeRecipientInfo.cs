using System;

using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Cms
{
    public class KeyAgreeRecipientInfo
        : Asn1Encodable
    {
        private DerInteger                  version;
        private OriginatorIdentifierOrKey   originator;
        private Asn1OctetString             ukm;
        private AlgorithmIdentifier         keyEncryptionAlgorithm;
        private Asn1Sequence                recipientEncryptedKeys;

		public KeyAgreeRecipientInfo(
            OriginatorIdentifierOrKey   originator,
            Asn1OctetString             ukm,
            AlgorithmIdentifier         keyEncryptionAlgorithm,
            Asn1Sequence                recipientEncryptedKeys)
        {
            this.version = new DerInteger(3);
            this.originator = originator;
            this.ukm = ukm;
            this.keyEncryptionAlgorithm = keyEncryptionAlgorithm;
            this.recipientEncryptedKeys = recipientEncryptedKeys;
        }

		public KeyAgreeRecipientInfo(
            Asn1Sequence seq)
        {
            int index = 0;

            version = (DerInteger) seq[index++];
            originator = OriginatorIdentifierOrKey.GetInstance(
				(Asn1TaggedObject) seq[index++], true);

			if (seq[index] is Asn1TaggedObject)
            {
                ukm = Asn1OctetString.GetInstance(
					(Asn1TaggedObject) seq[index++], true);
            }

			keyEncryptionAlgorithm = AlgorithmIdentifier.GetInstance(
				seq[index++]);

			recipientEncryptedKeys = (Asn1Sequence) seq[index++];
        }

		/**
         * return a KeyAgreeRecipientInfo object from a tagged object.
         *
         * @param obj the tagged object holding the object we want.
         * @param explicitly true if the object is meant to be explicitly
         *              tagged false otherwise.
         * @exception ArgumentException if the object held by the
         *          tagged object cannot be converted.
         */
        public static KeyAgreeRecipientInfo GetInstance(
            Asn1TaggedObject	obj,
            bool				explicitly)
        {
            return GetInstance(Asn1Sequence.GetInstance(obj, explicitly));
        }

		/**
         * return a KeyAgreeRecipientInfo object from the given object.
         *
         * @param obj the object we want converted.
         * @exception ArgumentException if the object cannot be converted.
         */
        public static KeyAgreeRecipientInfo GetInstance(
            object obj)
        {
            if (obj == null || obj is KeyAgreeRecipientInfo)
                return (KeyAgreeRecipientInfo)obj;

			if (obj is Asn1Sequence)
                return new KeyAgreeRecipientInfo((Asn1Sequence)obj);

			throw new ArgumentException(
                "Illegal object in KeyAgreeRecipientInfo: " + Platform.GetTypeName(obj));

        }

		public DerInteger Version
		{
			get { return version; }
		}

		public OriginatorIdentifierOrKey Originator
		{
			get { return originator; }
		}

		public Asn1OctetString UserKeyingMaterial
		{
			get { return ukm; }
		}

		public AlgorithmIdentifier KeyEncryptionAlgorithm
		{
			get { return keyEncryptionAlgorithm; }
		}

		public Asn1Sequence RecipientEncryptedKeys
		{
			get { return recipientEncryptedKeys; }
		}

		/**
         * Produce an object suitable for an Asn1OutputStream.
         * <pre>
         * KeyAgreeRecipientInfo ::= Sequence {
         *     version CMSVersion,  -- always set to 3
         *     originator [0] EXPLICIT OriginatorIdentifierOrKey,
         *     ukm [1] EXPLICIT UserKeyingMaterial OPTIONAL,
         *     keyEncryptionAlgorithm KeyEncryptionAlgorithmIdentifier,
         *     recipientEncryptedKeys RecipientEncryptedKeys
         * }
		 *
		 * UserKeyingMaterial ::= OCTET STRING
         * </pre>
         */
        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector(version, new DerTaggedObject(true, 0, originator));
            v.AddOptionalTagged(true, 1, ukm);
			v.Add(keyEncryptionAlgorithm, recipientEncryptedKeys);
			return new DerSequence(v);
        }
    }
}
