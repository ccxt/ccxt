using System;

namespace Org.BouncyCastle.Asn1
{
    public class Asn1Tags
    {
        public const int Boolean = 0x01;
        public const int Integer = 0x02;
        public const int BitString = 0x03;
        public const int OctetString = 0x04;
        public const int Null = 0x05;
        public const int ObjectIdentifier = 0x06;
        public const int ObjectDescriptor = 0x07;
        public const int External = 0x08;
        public const int Real = 0x09;
        public const int Enumerated = 0x0a;
        public const int EmbeddedPdv = 0x0b;
        public const int Utf8String = 0x0c;
        public const int RelativeOid = 0x0d;
                                                        // NOTE: 14-15 are reserved.
        public const int Sequence = 0x10;
        public const int SequenceOf = 0x10; // for completeness
        public const int Set = 0x11;
        public const int SetOf = 0x11; // for completeness

        public const int NumericString = 0x12;
        public const int PrintableString = 0x13;
        public const int T61String = 0x14;
        public const int VideotexString = 0x15;
        public const int IA5String = 0x16;
        public const int UtcTime = 0x17;
        public const int GeneralizedTime = 0x18;
        public const int GraphicString = 0x19;
        public const int VisibleString = 0x1a;
        public const int GeneralString = 0x1b;
        public const int UniversalString = 0x1c;
        public const int UnrestrictedString = 0x1d;
        public const int BmpString = 0x1e;

        public const int Constructed = 0x20;

        public const int Universal = 0x00;
        public const int Application = 0x40;
        public const int ContextSpecific = 0x80;
        public const int Private = 0xC0;

        public const int Flags = 0xE0;
    }
}
