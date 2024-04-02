using System;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Misc
{
    public class Cast5CbcParameters
        : Asn1Encodable
    {
        private readonly DerInteger keyLength;
        private readonly Asn1OctetString iv;

		public static Cast5CbcParameters GetInstance(
            object o)
        {
            if (o is Cast5CbcParameters)
            {
                return (Cast5CbcParameters) o;
            }

			if (o is Asn1Sequence)
            {
                return new Cast5CbcParameters((Asn1Sequence) o);
            }

			throw new ArgumentException("unknown object in Cast5CbcParameters factory");
        }

		public Cast5CbcParameters(
            byte[]	iv,
            int		keyLength)
        {
            this.iv = new DerOctetString(iv);
            this.keyLength = new DerInteger(keyLength);
        }

		private Cast5CbcParameters(
            Asn1Sequence seq)
        {
			if (seq.Count != 2)
				throw new ArgumentException("Wrong number of elements in sequence", "seq");

			iv = (Asn1OctetString) seq[0];
            keyLength = (DerInteger) seq[1];
        }

		public byte[] GetIV()
        {
			return Arrays.Clone(iv.GetOctets());
		}

		public int KeyLength
		{
            get { return keyLength.IntValueExact; }
		}

		/**
         * Produce an object suitable for an Asn1OutputStream.
         * <pre>
         * cast5CBCParameters ::= Sequence {
         *                           iv         OCTET STRING DEFAULT 0,
         *                                  -- Initialization vector
         *                           keyLength  Integer
         *                                  -- Key length, in bits
         *                      }
         * </pre>
         */
        public override Asn1Object ToAsn1Object()
        {
			return new DerSequence(iv, keyLength);
        }
    }
}
