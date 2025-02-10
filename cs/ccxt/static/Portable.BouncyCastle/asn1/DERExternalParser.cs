using System;

namespace Org.BouncyCastle.Asn1
{
	public class DerExternalParser
		: Asn1Encodable
	{
		private readonly Asn1StreamParser m_parser;

		internal DerExternalParser(Asn1StreamParser parser)
		{
			m_parser = parser;
		}

		public IAsn1Convertible ReadObject()
		{
			return m_parser.ReadObject();
		}

		public override Asn1Object ToAsn1Object()
		{
            return Parse(m_parser);
		}

        internal static DerExternal Parse(Asn1StreamParser sp)
        {
            return new DerExternal(sp.ReadVector());
        }
    }
}
