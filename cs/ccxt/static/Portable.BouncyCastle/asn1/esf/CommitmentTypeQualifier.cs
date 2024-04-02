using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Esf
{
    /**
    * Commitment type qualifiers, used in the Commitment-Type-Indication attribute (RFC3126).
    *
    * <pre>
    *   CommitmentTypeQualifier ::= SEQUENCE {
    *       commitmentTypeIdentifier  CommitmentTypeIdentifier,
    *       qualifier          ANY DEFINED BY commitmentTypeIdentifier OPTIONAL }
    * </pre>
    */
    public class CommitmentTypeQualifier
        : Asn1Encodable
    {
        private readonly DerObjectIdentifier	commitmentTypeIdentifier;
        private readonly Asn1Object				qualifier;

        /**
        * Creates a new <code>CommitmentTypeQualifier</code> instance.
        *
        * @param commitmentTypeIdentifier a <code>CommitmentTypeIdentifier</code> value
        */
        public CommitmentTypeQualifier(
            DerObjectIdentifier commitmentTypeIdentifier)
            : this(commitmentTypeIdentifier, null)
        {
        }

    /**
        * Creates a new <code>CommitmentTypeQualifier</code> instance.
        *
        * @param commitmentTypeIdentifier a <code>CommitmentTypeIdentifier</code> value
        * @param qualifier the qualifier, defined by the above field.
        */
        public CommitmentTypeQualifier(
            DerObjectIdentifier	commitmentTypeIdentifier,
            Asn1Encodable		qualifier)
        {
			if (commitmentTypeIdentifier == null)
				throw new ArgumentNullException("commitmentTypeIdentifier");

			this.commitmentTypeIdentifier = commitmentTypeIdentifier;

			if (qualifier != null)
			{
				this.qualifier = qualifier.ToAsn1Object();
			}
        }

        /**
        * Creates a new <code>CommitmentTypeQualifier</code> instance.
        *
        * @param as <code>CommitmentTypeQualifier</code> structure
        * encoded as an Asn1Sequence.
        */
        public CommitmentTypeQualifier(
            Asn1Sequence seq)
        {
			if (seq == null)
				throw new ArgumentNullException("seq");
			if (seq.Count < 1 || seq.Count > 2)
				throw new ArgumentException("Bad sequence size: " + seq.Count, "seq");

			commitmentTypeIdentifier = (DerObjectIdentifier) seq[0].ToAsn1Object();

			if (seq.Count > 1)
            {
                qualifier = seq[1].ToAsn1Object();
            }
        }

		public static CommitmentTypeQualifier GetInstance(
			object obj)
		{
			if (obj == null || obj is CommitmentTypeQualifier)
				return (CommitmentTypeQualifier) obj;

			if (obj is Asn1Sequence)
				return new CommitmentTypeQualifier((Asn1Sequence) obj);

			throw new ArgumentException(
				"Unknown object in 'CommitmentTypeQualifier' factory: "
                    + Platform.GetTypeName(obj),
				"obj");
		}

		public DerObjectIdentifier CommitmentTypeIdentifier
		{
			get { return commitmentTypeIdentifier; }
		}

		public Asn1Object Qualifier
		{
			get { return qualifier; }
		}

		/**
        * Returns a DER-encodable representation of this instance.
        *
        * @return a <code>Asn1Object</code> value
        */
		public override Asn1Object ToAsn1Object()
		{
			Asn1EncodableVector v = new Asn1EncodableVector(commitmentTypeIdentifier);
            v.AddOptional(qualifier);
			return new DerSequence(v);
		}
    }
}
