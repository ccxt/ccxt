using System;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Signers
{
    public class StandardDsaEncoding
        : IDsaEncoding
    {
        public static readonly StandardDsaEncoding Instance = new StandardDsaEncoding();

        public virtual BigInteger[] Decode(BigInteger n, byte[] encoding)
        {
            Asn1Sequence seq = (Asn1Sequence)Asn1Object.FromByteArray(encoding);
            if (seq.Count == 2)
            {
                BigInteger r = DecodeValue(n, seq, 0);
                BigInteger s = DecodeValue(n, seq, 1);

                byte[] expectedEncoding = Encode(n, r, s);
                if (Arrays.AreEqual(expectedEncoding,  encoding))
                    return new BigInteger[]{ r, s };
            }

            throw new ArgumentException("Malformed signature", "encoding");
        }

        public virtual byte[] Encode(BigInteger n, BigInteger r, BigInteger s)
        {
            return new DerSequence(
                EncodeValue(n, r),
                EncodeValue(n, s)
            ).GetEncoded(Asn1Encodable.Der);
        }

        protected virtual BigInteger CheckValue(BigInteger n, BigInteger x)
        {
            if (x.SignValue < 0 || (null != n && x.CompareTo(n) >= 0))
                throw new ArgumentException("Value out of range", "x");

            return x;
        }

        protected virtual BigInteger DecodeValue(BigInteger n, Asn1Sequence s, int pos)
        {
            return CheckValue(n, ((DerInteger)s[pos]).Value);
        }

        protected virtual DerInteger EncodeValue(BigInteger n, BigInteger x)
        {
            return new DerInteger(CheckValue(n, x));
        }
    }
}
