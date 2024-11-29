using System.IO;

namespace Org.BouncyCastle.Asn1
{
	public class BerSetGenerator
		: BerGenerator
	{
		public BerSetGenerator(
			Stream outStream)
			: base(outStream)
		{
			WriteBerHeader(Asn1Tags.Constructed | Asn1Tags.Set);
		}

		public BerSetGenerator(
			Stream	outStream,
			int		tagNo,
			bool	isExplicit)
			: base(outStream, tagNo, isExplicit)
		{
			WriteBerHeader(Asn1Tags.Constructed | Asn1Tags.Set);
		}
	}
}
