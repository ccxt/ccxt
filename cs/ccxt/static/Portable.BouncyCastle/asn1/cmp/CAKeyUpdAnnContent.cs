using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Cmp
{
	public class CAKeyUpdAnnContent
		: Asn1Encodable
	{
		private readonly CmpCertificate oldWithNew;
		private readonly CmpCertificate newWithOld;
		private readonly CmpCertificate newWithNew;

		private CAKeyUpdAnnContent(Asn1Sequence seq)
		{
			oldWithNew = CmpCertificate.GetInstance(seq[0]);
			newWithOld = CmpCertificate.GetInstance(seq[1]);
			newWithNew = CmpCertificate.GetInstance(seq[2]);
		}

		public static CAKeyUpdAnnContent GetInstance(object obj)
		{
			if (obj is CAKeyUpdAnnContent)
				return (CAKeyUpdAnnContent)obj;

			if (obj is Asn1Sequence)
				return new CAKeyUpdAnnContent((Asn1Sequence)obj);

            throw new ArgumentException("Invalid object: " + Platform.GetTypeName(obj), "obj");
		}

		public virtual CmpCertificate OldWithNew
		{
			get { return oldWithNew; }
		}
		
		public virtual CmpCertificate NewWithOld
		{
			get { return newWithOld; }
		}

		public virtual CmpCertificate NewWithNew
		{
			get { return newWithNew; }
		}

		/**
		 * <pre>
		 * CAKeyUpdAnnContent ::= SEQUENCE {
		 *                             oldWithNew   CmpCertificate, -- old pub signed with new priv
		 *                             newWithOld   CmpCertificate, -- new pub signed with old priv
		 *                             newWithNew   CmpCertificate  -- new pub signed with new priv
		 *  }
		 * </pre>
		 * @return a basic ASN.1 object representation.
		 */
		public override Asn1Object ToAsn1Object()
		{
			return new DerSequence(oldWithNew, newWithOld, newWithNew);
		}
	}
}
