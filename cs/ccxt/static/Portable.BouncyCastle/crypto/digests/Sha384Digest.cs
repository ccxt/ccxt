using System;

using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Digests
{
    /**
     * Draft FIPS 180-2 implementation of SHA-384. <b>Note:</b> As this is
     * based on a draft this implementation is subject to change.
     *
     * <pre>
     *         block  word  digest
     * SHA-1   512    32    160
     * SHA-256 512    32    256
     * SHA-384 1024   64    384
     * SHA-512 1024   64    512
     * </pre>
     */
    public class Sha384Digest
		: LongDigest
    {
        private const int DigestLength = 48;

		public Sha384Digest()
        {
        }

        /**
         * Copy constructor.  This will copy the state of the provided
         * message digest.
         */
        public Sha384Digest(
			Sha384Digest t)
			: base(t)
		{
		}

		public override string AlgorithmName
		{
			get { return "SHA-384"; }
		}

		public override int GetDigestSize()
		{
			return DigestLength;
		}

		public override int DoFinal(
            byte[]  output,
            int     outOff)
        {
            Finish();

            Pack.UInt64_To_BE(H1, output, outOff);
            Pack.UInt64_To_BE(H2, output, outOff + 8);
            Pack.UInt64_To_BE(H3, output, outOff + 16);
            Pack.UInt64_To_BE(H4, output, outOff + 24);
            Pack.UInt64_To_BE(H5, output, outOff + 32);
            Pack.UInt64_To_BE(H6, output, outOff + 40);

            Reset();

            return DigestLength;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public override int DoFinal(Span<byte> output)
        {
            Finish();

            Pack.UInt64_To_BE(H1, output);
            Pack.UInt64_To_BE(H2, output[8..]);
            Pack.UInt64_To_BE(H3, output[16..]);
            Pack.UInt64_To_BE(H4, output[24..]);
            Pack.UInt64_To_BE(H5, output[32..]);
            Pack.UInt64_To_BE(H6, output[40..]);

            Reset();

            return DigestLength;
        }
#endif

        /**
        * reset the chaining variables
        */
        public override void Reset()
        {
            base.Reset();

            /* SHA-384 initial hash value
             * The first 64 bits of the fractional parts of the square roots
             * of the 9th through 16th prime numbers
              */
            H1 = 0xcbbb9d5dc1059ed8;
            H2 = 0x629a292a367cd507;
            H3 = 0x9159015a3070dd17;
            H4 = 0x152fecd8f70e5939;
            H5 = 0x67332667ffc00b31;
            H6 = 0x8eb44a8768581511;
            H7 = 0xdb0c2e0d64f98fa7;
            H8 = 0x47b5481dbefa4fa4;
        }
		
		public override IMemoable Copy()
		{
			return new Sha384Digest(this);
		}

		public override void Reset(IMemoable other)
		{
			Sha384Digest d = (Sha384Digest)other;

			CopyIn(d);
		}
    }
}
