namespace Org.BouncyCastle.Asn1.Ntt
{
	/// <summary>From RFC 3657</summary>
	public abstract class NttObjectIdentifiers
	{
		public static readonly DerObjectIdentifier IdCamellia128Cbc = new DerObjectIdentifier("1.2.392.200011.61.1.1.1.2");
		public static readonly DerObjectIdentifier IdCamellia192Cbc = new DerObjectIdentifier("1.2.392.200011.61.1.1.1.3");
		public static readonly DerObjectIdentifier IdCamellia256Cbc = new DerObjectIdentifier("1.2.392.200011.61.1.1.1.4");

		public static readonly DerObjectIdentifier IdCamellia128Wrap = new DerObjectIdentifier("1.2.392.200011.61.1.1.3.2");
		public static readonly DerObjectIdentifier IdCamellia192Wrap = new DerObjectIdentifier("1.2.392.200011.61.1.1.3.3");
		public static readonly DerObjectIdentifier IdCamellia256Wrap = new DerObjectIdentifier("1.2.392.200011.61.1.1.3.4");
	}
}
