using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Esf
{
	/// <remarks>
	/// <code>
	/// SignaturePolicyIdentifier ::= CHOICE {
	///		SignaturePolicyId		SignaturePolicyId,
	///		SignaturePolicyImplied	SignaturePolicyImplied
	/// }
	/// 
	/// SignaturePolicyImplied ::= NULL
	/// </code>
	/// </remarks>
	public class SignaturePolicyIdentifier
		: Asn1Encodable, IAsn1Choice
	{
		private readonly SignaturePolicyId sigPolicy;

		public static SignaturePolicyIdentifier GetInstance(
			object obj)
		{
			if (obj == null || obj is SignaturePolicyIdentifier)
				return (SignaturePolicyIdentifier) obj;

			if (obj is SignaturePolicyId)
				return new SignaturePolicyIdentifier((SignaturePolicyId) obj);

			if (obj is Asn1Null)
				return new SignaturePolicyIdentifier();

			throw new ArgumentException(
				"Unknown object in 'SignaturePolicyIdentifier' factory: "
                    + Platform.GetTypeName(obj),
				"obj");
		}

		public SignaturePolicyIdentifier()
		{
			this.sigPolicy = null;
		}

		public SignaturePolicyIdentifier(
			SignaturePolicyId signaturePolicyId)
		{
			if (signaturePolicyId == null)
				throw new ArgumentNullException("signaturePolicyId");

			this.sigPolicy = signaturePolicyId;
		}

		public SignaturePolicyId SignaturePolicyId
		{
			get { return sigPolicy; }
		}

		public override Asn1Object ToAsn1Object()
		{
			return sigPolicy == null
				?	DerNull.Instance
				:	sigPolicy.ToAsn1Object();
		}
	}
}
