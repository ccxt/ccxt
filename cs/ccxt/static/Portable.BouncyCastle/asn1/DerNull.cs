using System;

namespace Org.BouncyCastle.Asn1
{
	/**
	 * A Null object.
	 */
	public class DerNull
		: Asn1Null
	{
		public static readonly DerNull Instance = new DerNull();

		private static readonly byte[] ZeroBytes = new byte[0];

		protected internal DerNull()
		{
		}

        internal override IAsn1Encoding GetEncoding(int encoding)
        {
            return new PrimitiveEncoding(Asn1Tags.Universal, Asn1Tags.Null, ZeroBytes);
        }

        internal override IAsn1Encoding GetEncodingImplicit(int encoding, int tagClass, int tagNo)
        {
            return new PrimitiveEncoding(tagClass, tagNo, ZeroBytes);
        }

        protected override bool Asn1Equals(Asn1Object asn1Object)
		{
			return asn1Object is DerNull;
		}

		protected override int Asn1GetHashCode()
		{
			return -1;
		}
	}
}
