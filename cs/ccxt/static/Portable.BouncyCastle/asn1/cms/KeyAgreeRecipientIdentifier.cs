using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Cms
{
	public class KeyAgreeRecipientIdentifier
		: Asn1Encodable, IAsn1Choice
	{
		/**
		 * return an KeyAgreeRecipientIdentifier object from a tagged object.
		 *
		 * @param obj the tagged object holding the object we want.
		 * @param isExplicit true if the object is meant to be explicitly
		 *              tagged false otherwise.
		 * @exception ArgumentException if the object held by the
		 *          tagged object cannot be converted.
		 */
		public static KeyAgreeRecipientIdentifier GetInstance(
			Asn1TaggedObject	obj,
			bool				isExplicit)
		{
			return GetInstance(Asn1Sequence.GetInstance(obj, isExplicit));
		}
    
		/**
		 * return an KeyAgreeRecipientIdentifier object from the given object.
		 *
		 * @param obj the object we want converted.
		 * @exception ArgumentException if the object cannot be converted.
		 */
		public static KeyAgreeRecipientIdentifier GetInstance(
			object obj)
		{
			if (obj == null || obj is KeyAgreeRecipientIdentifier)
				return (KeyAgreeRecipientIdentifier)obj;

			if (obj is Asn1Sequence)
				return new KeyAgreeRecipientIdentifier(IssuerAndSerialNumber.GetInstance(obj));

			if (obj is Asn1TaggedObject && ((Asn1TaggedObject)obj).TagNo == 0)
			{
				return new KeyAgreeRecipientIdentifier(RecipientKeyIdentifier.GetInstance(
					(Asn1TaggedObject)obj, false));
			}

			throw new ArgumentException("Invalid KeyAgreeRecipientIdentifier: " + Platform.GetTypeName(obj), "obj");
		} 

		private readonly IssuerAndSerialNumber issuerSerial;
		private readonly RecipientKeyIdentifier rKeyID;

		public KeyAgreeRecipientIdentifier(
			IssuerAndSerialNumber issuerSerial)
		{
			this.issuerSerial = issuerSerial;
		}

		public KeyAgreeRecipientIdentifier(
			RecipientKeyIdentifier rKeyID)
		{
			this.rKeyID = rKeyID;
		}

		public IssuerAndSerialNumber IssuerAndSerialNumber
		{
			get { return issuerSerial; }
		}

		public RecipientKeyIdentifier RKeyID
		{
			get { return rKeyID; }
		}

		/** 
		 * Produce an object suitable for an Asn1OutputStream.
		 * <pre>
		 * KeyAgreeRecipientIdentifier ::= CHOICE {
		 *     issuerAndSerialNumber IssuerAndSerialNumber,
		 *     rKeyId [0] IMPLICIT RecipientKeyIdentifier
		 * }
		 * </pre>
		 */
		public override Asn1Object ToAsn1Object()
		{
			if (issuerSerial != null)
			{
				return issuerSerial.ToAsn1Object();
			}

			return new DerTaggedObject(false, 0, rKeyID);
		}
	}
}
