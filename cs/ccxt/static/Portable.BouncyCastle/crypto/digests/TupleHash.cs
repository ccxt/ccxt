using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Digests
{
    /// <summary>
    /// TupleHash - a hash designed  to  simply  hash  a  tuple  of  input  strings,  any  or  all  of  which  may  be  empty  strings,
    /// in  an  unambiguous way with an optional XOF mode.
    /// <para>
    /// From NIST Special Publication 800-185 - SHA-3 Derived Functions:cSHAKE, KMAC, TupleHash and ParallelHash
    /// </para>
    /// </summary>
    public class TupleHash
        : IXof, IDigest
    {
        private static readonly byte[] N_TUPLE_HASH = Strings.ToByteArray("TupleHash");

        private readonly CShakeDigest cshake;
        private readonly int bitLength;
        private readonly int outputLength;

        private bool firstOutput;

        /**
	     * Base constructor.
	     *
	     * @param bitLength bit length of the underlying SHAKE function, 128 or 256.
	     * @param S         the customization string - available for local use.
	     */
        public TupleHash(int bitLength, byte[] S)
            : this(bitLength, S, bitLength * 2)
        {

        }

        public TupleHash(int bitLength, byte[] S, int outputSize)
        {
            this.cshake = new CShakeDigest(bitLength, N_TUPLE_HASH, S);
            this.bitLength = bitLength;
            this.outputLength = (outputSize + 7) / 8;

            Reset();
        }

        public TupleHash(TupleHash original)
        {
            this.cshake = new CShakeDigest(original.cshake);
            this.bitLength = cshake.fixedOutputLength;
            this.outputLength = bitLength * 2 / 8;
            this.firstOutput = original.firstOutput;
        }

        public virtual string AlgorithmName
        {
            get { return "TupleHash" + cshake.AlgorithmName.Substring(6); }
        }

        public virtual int GetByteLength()
        {
            return cshake.GetByteLength();
        }

        public virtual int GetDigestSize()
        {
            return outputLength;
        }

        public virtual void Update(byte b)
        {
            byte[] bytes = XofUtilities.Encode(b);
            cshake.BlockUpdate(bytes, 0, bytes.Length);
        }

        public virtual void BlockUpdate(byte[] inBuf, int inOff, int len)
        {
            byte[] bytes = XofUtilities.Encode(inBuf, inOff, len);
            cshake.BlockUpdate(bytes, 0, bytes.Length);
        }

        private void WrapUp(int outputSize)
        {
            byte[] encOut = XofUtilities.RightEncode(outputSize * 8);

            cshake.BlockUpdate(encOut, 0, encOut.Length);

            firstOutput = false;
        }

        public virtual int DoFinal(byte[] outBuf, int outOff)
        {
            return DoFinal(outBuf, outOff, GetDigestSize());
        }

        public virtual int DoFinal(byte[] outBuf, int outOff, int outLen)
        {
            if (firstOutput)
            {
                WrapUp(GetDigestSize());
            }

            int rv = cshake.DoFinal(outBuf, outOff, outLen);

            Reset();

            return rv;
        }

        public virtual int DoOutput(byte[] outBuf, int outOff, int outLen)
        {
            if (firstOutput)
            {
                WrapUp(0);
            }

            return cshake.DoOutput(outBuf, outOff, outLen);
        }

        public virtual void Reset()
        {
            cshake.Reset();
            firstOutput = true;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual void BlockUpdate(ReadOnlySpan<byte> input)
        {
            XofUtilities.EncodeTo(cshake, input);
        }

        public virtual int DoFinal(Span<byte> output)
        {
            return OutputFinal(output[..GetDigestSize()]);
        }

        public virtual int OutputFinal(Span<byte> output)
        {
            if (firstOutput)
            {
                WrapUp(GetDigestSize());
            }

            int rv = cshake.OutputFinal(output);

            Reset();

            return rv;
        }

        public virtual int Output(Span<byte> output)
        {
            if (firstOutput)
            {
                WrapUp(0);
            }

            return cshake.Output(output);
        }
#endif
    }
}
