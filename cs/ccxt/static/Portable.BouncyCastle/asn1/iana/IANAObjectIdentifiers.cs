namespace Org.BouncyCastle.Asn1.Iana
{
	public abstract class IanaObjectIdentifiers
	{
		// id-SHA1 OBJECT IDENTIFIER ::=
		// {iso(1) identified-organization(3) dod(6) internet(1) security(5) mechanisms(5) ipsec(8) isakmpOakley(1)}
		//

		public static readonly DerObjectIdentifier IsakmpOakley = new DerObjectIdentifier("1.3.6.1.5.5.8.1");

		public static readonly DerObjectIdentifier HmacMD5 = new DerObjectIdentifier(IsakmpOakley + ".1");
		public static readonly DerObjectIdentifier HmacSha1 = new DerObjectIdentifier(IsakmpOakley + ".2");

		public static readonly DerObjectIdentifier HmacTiger = new DerObjectIdentifier(IsakmpOakley + ".3");

		public static readonly DerObjectIdentifier HmacRipeMD160 = new DerObjectIdentifier(IsakmpOakley + ".4");
	}
}
