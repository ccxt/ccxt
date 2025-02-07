using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.X509
{
	/**
	 * The Holder object.
	 * <p>
	 * For an v2 attribute certificate this is:
	 * 
	 * <pre>
	 *            Holder ::= SEQUENCE {
	 *                  baseCertificateID   [0] IssuerSerial OPTIONAL,
	 *                           -- the issuer and serial number of
	 *                           -- the holder's Public Key Certificate
	 *                  entityName          [1] GeneralNames OPTIONAL,
	 *                           -- the name of the claimant or role
	 *                  objectDigestInfo    [2] ObjectDigestInfo OPTIONAL
	 *                           -- used to directly authenticate the holder,
	 *                           -- for example, an executable
	 *            }
	 * </pre>
	 * </p>
	 * <p>
	 * For an v1 attribute certificate this is:
	 * 
	 * <pre>
	 *         subject CHOICE {
	 *          baseCertificateID [0] EXPLICIT IssuerSerial,
	 *          -- associated with a Public Key Certificate
	 *          subjectName [1] EXPLICIT GeneralNames },
	 *          -- associated with a name
	 * </pre>
	 * </p>
	 */
	public class Holder
        : Asn1Encodable
    {
		internal readonly IssuerSerial		baseCertificateID;
        internal readonly GeneralNames		entityName;
        internal readonly ObjectDigestInfo	objectDigestInfo;
		private readonly int version;

		public static Holder GetInstance(
            object obj)
        {
            if (obj is Holder)
            {
                return (Holder) obj;
            }

			if (obj is Asn1Sequence)
            {
                return new Holder((Asn1Sequence) obj);
            }

			if (obj is Asn1TaggedObject)
			{
				return new Holder((Asn1TaggedObject) obj);
			}

            throw new ArgumentException("unknown object in factory: " + Platform.GetTypeName(obj), "obj");
		}

		/**
		 * Constructor for a holder for an v1 attribute certificate.
		 * 
		 * @param tagObj The ASN.1 tagged holder object.
		 */
		public Holder(
			Asn1TaggedObject tagObj)
		{
			switch (tagObj.TagNo)
			{
				case 0:
					baseCertificateID = IssuerSerial.GetInstance(tagObj, true);
					break;
				case 1:
					entityName = GeneralNames.GetInstance(tagObj, true);
					break;
				default:
					throw new ArgumentException("unknown tag in Holder");
			}

			this.version = 0;
		}

		/**
		 * Constructor for a holder for an v2 attribute certificate. *
		 * 
		 * @param seq The ASN.1 sequence.
		 */
		private Holder(
            Asn1Sequence seq)
        {
			if (seq.Count > 3)
				throw new ArgumentException("Bad sequence size: " + seq.Count);

			for (int i = 0; i != seq.Count; i++)
            {
				Asn1TaggedObject tObj = Asn1TaggedObject.GetInstance(seq[i]);

				switch (tObj.TagNo)
                {
                    case 0:
                        baseCertificateID = IssuerSerial.GetInstance(tObj, false);
                        break;
                    case 1:
                        entityName = GeneralNames.GetInstance(tObj, false);
                        break;
                    case 2:
                        objectDigestInfo = ObjectDigestInfo.GetInstance(tObj, false);
                        break;
                    default:
                        throw new ArgumentException("unknown tag in Holder");
                }
            }

			this.version = 1;
		}

		public Holder(
			IssuerSerial baseCertificateID)
			: this(baseCertificateID, 1)
		{
		}

		/**
		 * Constructs a holder from a IssuerSerial.
		 * @param baseCertificateID The IssuerSerial.
		 * @param version The version of the attribute certificate. 
		 */
		public Holder(
			IssuerSerial	baseCertificateID,
			int				version)
		{
			this.baseCertificateID = baseCertificateID;
			this.version = version;
		}

		/**
		 * Returns 1 for v2 attribute certificates or 0 for v1 attribute
		 * certificates. 
		 * @return The version of the attribute certificate.
		 */
		public int Version
		{
			get { return version; }
		}

		/**
		 * Constructs a holder with an entityName for v2 attribute certificates or
		 * with a subjectName for v1 attribute certificates.
		 * 
		 * @param entityName The entity or subject name.
		 */
		public Holder(
			GeneralNames entityName)
			: this(entityName, 1)
		{
		}

		/**
		 * Constructs a holder with an entityName for v2 attribute certificates or
		 * with a subjectName for v1 attribute certificates.
		 * 
		 * @param entityName The entity or subject name.
		 * @param version The version of the attribute certificate. 
		 */
		public Holder(
			GeneralNames	entityName,
			int				version)
		{
			this.entityName = entityName;
			this.version = version;
		}

		/**
		 * Constructs a holder from an object digest info.
		 * 
		 * @param objectDigestInfo The object digest info object.
		 */
		public Holder(
			ObjectDigestInfo objectDigestInfo)
		{
			this.objectDigestInfo = objectDigestInfo;
			this.version = 1;
		}

		public IssuerSerial BaseCertificateID
		{
			get { return baseCertificateID; }
		}

		/**
		 * Returns the entityName for an v2 attribute certificate or the subjectName
		 * for an v1 attribute certificate.
		 * 
		 * @return The entityname or subjectname.
		 */
		public GeneralNames EntityName
		{
			get { return entityName; }
		}

		public ObjectDigestInfo ObjectDigestInfo
		{
			get { return objectDigestInfo; }
		}

		/**
         * The Holder object.
         * <pre>
         *  Holder ::= Sequence {
         *        baseCertificateID   [0] IssuerSerial OPTIONAL,
         *                 -- the issuer and serial number of
         *                 -- the holder's Public Key Certificate
         *        entityName          [1] GeneralNames OPTIONAL,
         *                 -- the name of the claimant or role
         *        objectDigestInfo    [2] ObjectDigestInfo OPTIONAL
         *                 -- used to directly authenticate the holder,
         *                 -- for example, an executable
         *  }
         * </pre>
         */
        public override Asn1Object ToAsn1Object()
        {
            if (version == 1)
            {
                Asn1EncodableVector v = new Asn1EncodableVector(3);
                v.AddOptionalTagged(false, 0, baseCertificateID);
                v.AddOptionalTagged(false, 1, entityName);
                v.AddOptionalTagged(false, 2, objectDigestInfo);
                return new DerSequence(v);
            }

            if (entityName != null)
            {
                return new DerTaggedObject(true, 1, entityName);
            }

            return new DerTaggedObject(true, 0, baseCertificateID);
        }
	}
}
