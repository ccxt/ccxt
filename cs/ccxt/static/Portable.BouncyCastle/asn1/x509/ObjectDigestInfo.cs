using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.X509
{
	/**
	 * ObjectDigestInfo ASN.1 structure used in v2 attribute certificates.
	 * 
	 * <pre>
	 *  
	 *    ObjectDigestInfo ::= SEQUENCE {
	 *         digestedObjectType  ENUMERATED {
	 *                 publicKey            (0),
	 *                 publicKeyCert        (1),
	 *                 otherObjectTypes     (2) },
	 *                         -- otherObjectTypes MUST NOT
	 *                         -- be used in this profile
	 *         otherObjectTypeID   OBJECT IDENTIFIER OPTIONAL,
	 *         digestAlgorithm     AlgorithmIdentifier,
	 *         objectDigest        BIT STRING
	 *    }
	 *   
	 * </pre>
	 * 
	 */
	public class ObjectDigestInfo
        : Asn1Encodable
    {
		/**
		 * The public key is hashed.
		 */
		public const int PublicKey = 0;

		/**
		 * The public key certificate is hashed.
		 */
		public const int PublicKeyCert = 1;

		/**
		 * An other object is hashed.
		 */
		public const int OtherObjectDigest = 2;

		internal readonly DerEnumerated			digestedObjectType;
        internal readonly DerObjectIdentifier	otherObjectTypeID;
        internal readonly AlgorithmIdentifier	digestAlgorithm;
        internal readonly DerBitString			objectDigest;

		public static ObjectDigestInfo GetInstance(
            object obj)
        {
            if (obj == null || obj is ObjectDigestInfo)
            {
                return (ObjectDigestInfo) obj;
            }

			if (obj is Asn1Sequence)
            {
                return new ObjectDigestInfo((Asn1Sequence) obj);
            }

            throw new ArgumentException("unknown object in factory: " + Platform.GetTypeName(obj), "obj");
		}

		public static ObjectDigestInfo GetInstance(
            Asn1TaggedObject	obj,
            bool				isExplicit)
        {
            return GetInstance(Asn1Sequence.GetInstance(obj, isExplicit));
        }

		/**
		 * Constructor from given details.
		 * <p>
		 * If <code>digestedObjectType</code> is not {@link #publicKeyCert} or
		 * {@link #publicKey} <code>otherObjectTypeID</code> must be given,
		 * otherwise it is ignored.</p>
		 * 
		 * @param digestedObjectType The digest object type.
		 * @param otherObjectTypeID The object type ID for
		 *            <code>otherObjectDigest</code>.
		 * @param digestAlgorithm The algorithm identifier for the hash.
		 * @param objectDigest The hash value.
		 */
		public ObjectDigestInfo(
			int					digestedObjectType,
			string				otherObjectTypeID,
			AlgorithmIdentifier	digestAlgorithm,
			byte[]				objectDigest)
		{
			this.digestedObjectType = new DerEnumerated(digestedObjectType);

			if (digestedObjectType == OtherObjectDigest)
			{
				this.otherObjectTypeID = new DerObjectIdentifier(otherObjectTypeID);
			}

			this.digestAlgorithm = digestAlgorithm; 

			this.objectDigest = new DerBitString(objectDigest);
		}

		private ObjectDigestInfo(
			Asn1Sequence seq)
        {
			if (seq.Count > 4 || seq.Count < 3)
			{
				throw new ArgumentException("Bad sequence size: " + seq.Count);
			}

			digestedObjectType = DerEnumerated.GetInstance(seq[0]);

			int offset = 0;

			if (seq.Count == 4)
            {
                otherObjectTypeID = DerObjectIdentifier.GetInstance(seq[1]);
                offset++;
            }

			digestAlgorithm = AlgorithmIdentifier.GetInstance(seq[1 + offset]);
			objectDigest = DerBitString.GetInstance(seq[2 + offset]);
		}

		public DerEnumerated DigestedObjectType
		{
			get { return digestedObjectType; }
		}

		public DerObjectIdentifier OtherObjectTypeID
		{
			get { return otherObjectTypeID; }
		}

		public AlgorithmIdentifier DigestAlgorithm
		{
			get { return digestAlgorithm; }
		}

		public DerBitString ObjectDigest
		{
			get { return objectDigest; }
		}

		/**
		 * Produce an object suitable for an Asn1OutputStream.
		 * 
		 * <pre>
		 *  
		 *    ObjectDigestInfo ::= SEQUENCE {
		 *         digestedObjectType  ENUMERATED {
		 *                 publicKey            (0),
		 *                 publicKeyCert        (1),
		 *                 otherObjectTypes     (2) },
		 *                         -- otherObjectTypes MUST NOT
		 *                         -- be used in this profile
		 *         otherObjectTypeID   OBJECT IDENTIFIER OPTIONAL,
		 *         digestAlgorithm     AlgorithmIdentifier,
		 *         objectDigest        BIT STRING
		 *    }
		 *   
		 * </pre>
		 */
        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector(digestedObjectType);
            v.AddOptional(otherObjectTypeID);
            v.Add(digestAlgorithm, objectDigest);
            return new DerSequence(v);
        }
    }
}
