using System;

namespace Org.BouncyCastle.Crypto.Digests
{
    /**
     * Wrapper removes exposure to the IMemoable interface on an IDigest implementation.
     */
    public class NonMemoableDigest
        :   IDigest
    {
        protected readonly IDigest mBaseDigest;

        /**
         * Base constructor.
         *
         * @param baseDigest underlying digest to use.
         * @exception IllegalArgumentException if baseDigest is null
         */
        public NonMemoableDigest(IDigest baseDigest)
        {
            if (baseDigest == null)
                throw new ArgumentNullException("baseDigest");

            this.mBaseDigest = baseDigest;
        }

        public virtual string AlgorithmName
        {
            get { return mBaseDigest.AlgorithmName; }
        }

        public virtual int GetDigestSize()
        {
            return mBaseDigest.GetDigestSize();
        }

        public virtual void Update(byte input)
        {
            mBaseDigest.Update(input);
        }

        public virtual void BlockUpdate(byte[] input, int inOff, int len)
        {
            mBaseDigest.BlockUpdate(input, inOff, len);
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual void BlockUpdate(ReadOnlySpan<byte> input)
        {
            mBaseDigest.BlockUpdate(input);
        }
#endif

        public virtual int DoFinal(byte[] output, int outOff)
        {
            return mBaseDigest.DoFinal(output, outOff);
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual int DoFinal(Span<byte> output)
        {
            return mBaseDigest.DoFinal(output);
        }
#endif

        public virtual void Reset()
        {
            mBaseDigest.Reset();
        }

        public virtual int GetByteLength()
        {
            return mBaseDigest.GetByteLength();
        }
    }
}
