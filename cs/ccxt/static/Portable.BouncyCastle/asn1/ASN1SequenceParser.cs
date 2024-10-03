namespace Org.BouncyCastle.Asn1
{
	public interface Asn1SequenceParser
		: IAsn1Convertible
	{
		IAsn1Convertible ReadObject();
	}
}
