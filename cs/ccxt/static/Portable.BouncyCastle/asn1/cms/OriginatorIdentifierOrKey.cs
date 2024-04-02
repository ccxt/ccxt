using System;

using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Cms
{
    public class OriginatorIdentifierOrKey
        : Asn1Encodable, IAsn1Choice
    {
        private readonly Asn1Encodable id;

        public OriginatorIdentifierOrKey(IssuerAndSerialNumber id)
        {
            this.id = id;
        }

        public OriginatorIdentifierOrKey(SubjectKeyIdentifier id)
        {
            this.id = new DerTaggedObject(false, 0, id);
        }

        public OriginatorIdentifierOrKey(OriginatorPublicKey id)
        {
            this.id = new DerTaggedObject(false, 1, id);
        }

		private OriginatorIdentifierOrKey(Asn1TaggedObject id)
		{
			// TODO Add validation
			this.id = id;
		}

		/**
         * return an OriginatorIdentifierOrKey object from a tagged object.
         *
         * @param o the tagged object holding the object we want.
         * @param explicitly true if the object is meant to be explicitly
         *              tagged false otherwise.
         * @exception ArgumentException if the object held by the
         *          tagged object cannot be converted.
         */
        public static OriginatorIdentifierOrKey GetInstance(
            Asn1TaggedObject	o,
            bool				explicitly)
        {
            if (!explicitly)
            {
                throw new ArgumentException(
                        "Can't implicitly tag OriginatorIdentifierOrKey");
            }

			return GetInstance(o.GetObject());
        }

        /**
         * return an OriginatorIdentifierOrKey object from the given object.
         *
         * @param o the object we want converted.
         * @exception ArgumentException if the object cannot be converted.
         */
        public static OriginatorIdentifierOrKey GetInstance(
            object o)
        {
            if (o == null || o is OriginatorIdentifierOrKey)
                return (OriginatorIdentifierOrKey)o;

			if (o is IssuerAndSerialNumber)
				return new OriginatorIdentifierOrKey((IssuerAndSerialNumber)o);

			if (o is SubjectKeyIdentifier)
				return new OriginatorIdentifierOrKey((SubjectKeyIdentifier)o);

			if (o is OriginatorPublicKey)
				return new OriginatorIdentifierOrKey((OriginatorPublicKey)o);

			if (o is Asn1TaggedObject)
				return new OriginatorIdentifierOrKey((Asn1TaggedObject)o);

            throw new ArgumentException("Invalid OriginatorIdentifierOrKey: " + Platform.GetTypeName(o));
        }

		public Asn1Encodable ID
		{
			get { return id; }
		}

		public IssuerAndSerialNumber IssuerAndSerialNumber
		{
			get
			{
				if (id is IssuerAndSerialNumber)
				{
					return (IssuerAndSerialNumber)id;
				}

				return null;
			}
		}

		public SubjectKeyIdentifier SubjectKeyIdentifier
		{
			get
			{
				if (id is Asn1TaggedObject && ((Asn1TaggedObject)id).TagNo == 0)
				{
					return SubjectKeyIdentifier.GetInstance((Asn1TaggedObject)id, false);
				}

				return null;
			}
		}

		public OriginatorPublicKey OriginatorPublicKey
		{
			get
			{
				if (id is Asn1TaggedObject && ((Asn1TaggedObject)id).TagNo == 1)
				{
					return OriginatorPublicKey.GetInstance((Asn1TaggedObject)id, false);
				}

				return null;
			}
		}

		/**
         * Produce an object suitable for an Asn1OutputStream.
         * <pre>
         * OriginatorIdentifierOrKey ::= CHOICE {
         *     issuerAndSerialNumber IssuerAndSerialNumber,
         *     subjectKeyIdentifier [0] SubjectKeyIdentifier,
         *     originatorKey [1] OriginatorPublicKey
         * }
         *
         * SubjectKeyIdentifier ::= OCTET STRING
         * </pre>
         */
        public override Asn1Object ToAsn1Object()
        {
            return id.ToAsn1Object();
        }
    }
}
