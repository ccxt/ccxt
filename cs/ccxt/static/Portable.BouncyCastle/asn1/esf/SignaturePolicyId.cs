using System;
using System.Collections.Generic;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Esf
{
	/// <remarks>
	/// <code>
	/// SignaturePolicyId ::= SEQUENCE {
	/// 	sigPolicyIdentifier		SigPolicyId,
	/// 	sigPolicyHash			SigPolicyHash,
	/// 	sigPolicyQualifiers		SEQUENCE SIZE (1..MAX) OF SigPolicyQualifierInfo OPTIONAL
	/// }
	/// 
	/// SigPolicyId ::= OBJECT IDENTIFIER
	/// 
	/// SigPolicyHash ::= OtherHashAlgAndValue
	/// </code>
	/// </remarks>
	public class SignaturePolicyId
		: Asn1Encodable
	{
		private readonly DerObjectIdentifier	sigPolicyIdentifier;
		private readonly OtherHashAlgAndValue	sigPolicyHash;
		private readonly Asn1Sequence			sigPolicyQualifiers;

		public static SignaturePolicyId GetInstance(
			object obj)
		{
			if (obj == null || obj is SignaturePolicyId)
				return (SignaturePolicyId) obj;

			if (obj is Asn1Sequence)
				return new SignaturePolicyId((Asn1Sequence) obj);

			throw new ArgumentException(
				"Unknown object in 'SignaturePolicyId' factory: "
                    + Platform.GetTypeName(obj),
				"obj");
		}

		private SignaturePolicyId(
			Asn1Sequence seq)
		{
			if (seq == null)
				throw new ArgumentNullException("seq");
			if (seq.Count < 2 || seq.Count > 3)
				throw new ArgumentException("Bad sequence size: " + seq.Count, "seq");

			this.sigPolicyIdentifier = (DerObjectIdentifier) seq[0].ToAsn1Object();
			this.sigPolicyHash = OtherHashAlgAndValue.GetInstance(seq[1].ToAsn1Object());

			if (seq.Count > 2)
			{
				this.sigPolicyQualifiers = (Asn1Sequence) seq[2].ToAsn1Object();
			}
		}

		public SignaturePolicyId(
			DerObjectIdentifier		sigPolicyIdentifier,
			OtherHashAlgAndValue	sigPolicyHash)
			: this(sigPolicyIdentifier, sigPolicyHash, null)
		{
		}

		public SignaturePolicyId(
			DerObjectIdentifier				sigPolicyIdentifier,
			OtherHashAlgAndValue			sigPolicyHash,
			params SigPolicyQualifierInfo[]	sigPolicyQualifiers)
		{
			if (sigPolicyIdentifier == null)
				throw new ArgumentNullException("sigPolicyIdentifier");
			if (sigPolicyHash == null)
				throw new ArgumentNullException("sigPolicyHash");

			this.sigPolicyIdentifier = sigPolicyIdentifier;
			this.sigPolicyHash = sigPolicyHash;

			if (sigPolicyQualifiers != null)
			{
				this.sigPolicyQualifiers = new DerSequence(sigPolicyQualifiers);
			}
		}

		public SignaturePolicyId(
			DerObjectIdentifier sigPolicyIdentifier,
			OtherHashAlgAndValue sigPolicyHash,
			IEnumerable<SigPolicyQualifierInfo> sigPolicyQualifiers)
		{
			if (sigPolicyIdentifier == null)
				throw new ArgumentNullException("sigPolicyIdentifier");
			if (sigPolicyHash == null)
				throw new ArgumentNullException("sigPolicyHash");

			this.sigPolicyIdentifier = sigPolicyIdentifier;
			this.sigPolicyHash = sigPolicyHash;

			if (sigPolicyQualifiers != null)
			{
				this.sigPolicyQualifiers = new DerSequence(
					Asn1EncodableVector.FromEnumerable(sigPolicyQualifiers));
			}
		}

		public DerObjectIdentifier SigPolicyIdentifier
		{
			get { return sigPolicyIdentifier; }
		}

		public OtherHashAlgAndValue SigPolicyHash
		{
			get { return sigPolicyHash; }
		}

		public SigPolicyQualifierInfo[] GetSigPolicyQualifiers()
		{
			if (sigPolicyQualifiers == null)
				return null;

			SigPolicyQualifierInfo[] infos = new SigPolicyQualifierInfo[sigPolicyQualifiers.Count];
			for (int i = 0; i < sigPolicyQualifiers.Count; ++i)
			{
				infos[i] = SigPolicyQualifierInfo.GetInstance(sigPolicyQualifiers[i]);
			}
			return infos;
		}

		public override Asn1Object ToAsn1Object()
		{
			Asn1EncodableVector v = new Asn1EncodableVector(
				sigPolicyIdentifier, sigPolicyHash.ToAsn1Object());

			if (sigPolicyQualifiers != null)
			{
				v.Add(sigPolicyQualifiers.ToAsn1Object());
			}

			return new DerSequence(v);
		}
	}
}
