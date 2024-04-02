using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.CryptoPro
{
    public class Gost28147Parameters
        : Asn1Encodable
    {
        private readonly Asn1OctetString iv;
        private readonly DerObjectIdentifier paramSet;

		public static Gost28147Parameters GetInstance(Asn1TaggedObject obj, bool explicitly)
        {
            return GetInstance(Asn1Sequence.GetInstance(obj, explicitly));
        }

		public static Gost28147Parameters GetInstance(object obj)
        {
            if (obj == null || obj is Gost28147Parameters)
                return (Gost28147Parameters) obj;

            if (obj is Asn1Sequence seq)
                return new Gost28147Parameters(seq);

            throw new ArgumentException("Invalid GOST3410Parameter: " + Platform.GetTypeName(obj));
        }

        private Gost28147Parameters(Asn1Sequence seq)
        {
			if (seq.Count != 2)
				throw new ArgumentException("Wrong number of elements in sequence", "seq");

			this.iv = Asn1OctetString.GetInstance(seq[0]);
			this.paramSet = DerObjectIdentifier.GetInstance(seq[1]);
        }

		/**
         * <pre>
         * Gost28147-89-Parameters ::=
         *               SEQUENCE {
         *                       iv                   Gost28147-89-IV,
         *                       encryptionParamSet   OBJECT IDENTIFIER
         *                }
         *
         *   Gost28147-89-IV ::= OCTET STRING (SIZE (8))
         * </pre>
         */
        public override Asn1Object ToAsn1Object()
        {
			return new DerSequence(iv, paramSet);
        }
    }
}
