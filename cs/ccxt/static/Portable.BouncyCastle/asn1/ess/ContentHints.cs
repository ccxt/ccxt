using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Ess
{
	public class ContentHints
		: Asn1Encodable
	{
		private readonly DerUtf8String contentDescription;
		private readonly DerObjectIdentifier contentType;

		public static ContentHints GetInstance(
			object o)
		{
			if (o == null || o is ContentHints)
			{
				return (ContentHints)o;
			}

			if (o is Asn1Sequence)
			{
				return new ContentHints((Asn1Sequence)o);
			}

			throw new ArgumentException("unknown object in 'ContentHints' factory : "
                + Platform.GetTypeName(o) + ".");
		}

		/**
		 * constructor
		 */
		private ContentHints(
			Asn1Sequence seq)
		{
			IAsn1Convertible field = seq[0];
			if (field.ToAsn1Object() is DerUtf8String)
			{
				contentDescription = DerUtf8String.GetInstance(field);
				contentType = DerObjectIdentifier.GetInstance(seq[1]);
			}
			else
			{
				contentType = DerObjectIdentifier.GetInstance(seq[0]);
			}
		}

		public ContentHints(
			DerObjectIdentifier contentType)
		{
			this.contentType = contentType;
			this.contentDescription = null;
		}

		public ContentHints(
			DerObjectIdentifier	contentType,
			DerUtf8String		contentDescription)
		{
			this.contentType = contentType;
			this.contentDescription = contentDescription;
		}

		public DerObjectIdentifier ContentType
		{
			get { return contentType; }
		}

		public DerUtf8String ContentDescription
		{
			get { return contentDescription; }
		}

		/**
		 * <pre>
		 * ContentHints ::= SEQUENCE {
		 *   contentDescription UTF8String (SIZE (1..MAX)) OPTIONAL,
		 *   contentType ContentType }
		 * </pre>
		 */
		public override Asn1Object ToAsn1Object()
		{
			Asn1EncodableVector v = new Asn1EncodableVector();
            v.AddOptional(contentDescription);
			v.Add(contentType);
			return new DerSequence(v);
		}
	}
}
