using System;

namespace Org.BouncyCastle.Asn1
{
    public class BerSequenceParser
        : Asn1SequenceParser
    {
        private readonly Asn1StreamParser _parser;

        internal BerSequenceParser(Asn1StreamParser parser)
        {
            this._parser = parser;
        }

        public IAsn1Convertible ReadObject()
        {
            return _parser.ReadObject();
        }

        public Asn1Object ToAsn1Object()
        {
            return Parse(_parser);
        }

        internal static BerSequence Parse(Asn1StreamParser sp)
        {
            return new BerSequence(sp.ReadVector());
        }
    }
}
