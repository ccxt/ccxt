using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Esf
{
    public class CommitmentTypeIndication
        : Asn1Encodable
    {
        private readonly DerObjectIdentifier	commitmentTypeId;
        private readonly Asn1Sequence			commitmentTypeQualifier;

		public static CommitmentTypeIndication GetInstance(
			object obj)
		{
			if (obj == null || obj is CommitmentTypeIndication)
				return (CommitmentTypeIndication) obj;

			if (obj is Asn1Sequence)
				return new CommitmentTypeIndication((Asn1Sequence) obj);

			throw new ArgumentException(
				"Unknown object in 'CommitmentTypeIndication' factory: "
                    + Platform.GetTypeName(obj),
				"obj");
		}

		public CommitmentTypeIndication(
            Asn1Sequence seq)
        {
			if (seq == null)
				throw new ArgumentNullException("seq");
			if (seq.Count < 1 || seq.Count > 2)
				throw new ArgumentException("Bad sequence size: " + seq.Count, "seq");

			this.commitmentTypeId = (DerObjectIdentifier) seq[0].ToAsn1Object();

			if (seq.Count > 1)
            {
                this.commitmentTypeQualifier = (Asn1Sequence) seq[1].ToAsn1Object();
            }
        }

		public CommitmentTypeIndication(
            DerObjectIdentifier commitmentTypeId)
			: this(commitmentTypeId, null)
        {
        }

		public CommitmentTypeIndication(
            DerObjectIdentifier	commitmentTypeId,
            Asn1Sequence		commitmentTypeQualifier)
        {
			if (commitmentTypeId == null)
				throw new ArgumentNullException("commitmentTypeId");

			this.commitmentTypeId = commitmentTypeId;

			if (commitmentTypeQualifier != null)
			{
				this.commitmentTypeQualifier = commitmentTypeQualifier;
			}
        }

		public DerObjectIdentifier CommitmentTypeID
		{
			get { return commitmentTypeId; }
		}

		public Asn1Sequence CommitmentTypeQualifier
		{
			get { return commitmentTypeQualifier; }
		}

		/**
        * <pre>
        * CommitmentTypeIndication ::= SEQUENCE {
        *      commitmentTypeId   CommitmentTypeIdentifier,
        *      commitmentTypeQualifier   SEQUENCE SIZE (1..MAX) OF
        *              CommitmentTypeQualifier OPTIONAL }
        * </pre>
        */
        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector(commitmentTypeId);
            v.AddOptional(commitmentTypeQualifier);
			return new DerSequence(v);
        }
    }
}
