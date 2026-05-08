using System;
using System.IO;

namespace Org.BouncyCastle.Asn1
{
    public class LazyAsn1InputStream
        : Asn1InputStream
    {
        public LazyAsn1InputStream(byte[] input)
            : base(input)
        {
        }

        public LazyAsn1InputStream(Stream inputStream)
            : base(inputStream)
        {
        }

        internal LazyAsn1InputStream(Stream input, int limit, byte[][] tmpBuffers)
            : base(input, limit, tmpBuffers)
        {
        }

        internal override Asn1Sequence CreateDLSequence(DefiniteLengthInputStream defIn)
        {
            return new LazyDLSequence(defIn.ToArray());
        }

        internal override Asn1Set CreateDLSet(DefiniteLengthInputStream defIn)
        {
            return new LazyDLSet(defIn.ToArray());
        }

        internal override Asn1EncodableVector ReadVector(DefiniteLengthInputStream defIn)
        {
            int remaining = defIn.Remaining;
            if (remaining < 1)
                return new Asn1EncodableVector(0);

            return new LazyAsn1InputStream(defIn, remaining, tmpBuffers).ReadVector();
        }
    }
}
