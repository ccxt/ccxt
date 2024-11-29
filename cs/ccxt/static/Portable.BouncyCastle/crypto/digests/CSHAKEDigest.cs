using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Digests
{
    /// <summary>
    /// Customizable SHAKE function.
    /// </summary>
    public class CShakeDigest
        : ShakeDigest
    {
        private static readonly byte[] padding = new byte[100];

        private static byte[] EncodeString(byte[] str)
        {
            if (Arrays.IsNullOrEmpty(str))
            {
                return XofUtilities.LeftEncode(0L);
            }

            return Arrays.Concatenate(XofUtilities.LeftEncode(str.Length * 8L), str);
        }

        private readonly byte[] diff;

        /// <summary>
        /// Base constructor
        /// </summary>
        /// <param name="bitLength">bit length of the underlying SHAKE function, 128 or 256.</param>
        /// <param name="N">the function name string, note this is reserved for use by NIST. Avoid using it if not required.</param>
        /// <param name="S">the customization string - available for local use.</param>
        public CShakeDigest(int bitLength, byte[] N, byte[] S)
            : base(bitLength)
        {
            if ((N == null || N.Length == 0) && (S == null || S.Length == 0))
            {
                diff = null;
            }
            else
            {
                diff = Arrays.ConcatenateAll(XofUtilities.LeftEncode(rate / 8), EncodeString(N), EncodeString(S));
                DiffPadAndAbsorb();
            }
        }

        public CShakeDigest(CShakeDigest source)
            : base(source)
        {
            this.diff = Arrays.Clone(source.diff);
        }

        // bytepad in SP 800-185
        private void DiffPadAndAbsorb()
        {
            int blockSize = rate / 8;
            Absorb(diff, 0, diff.Length);

            int delta = diff.Length % blockSize;

            // only add padding if needed
            if (delta != 0)
            {
                int required = blockSize - delta;

                while (required > padding.Length)
                {
                    Absorb(padding, 0, padding.Length);
                    required -= padding.Length;
                }

                Absorb(padding, 0, required);
            }
        }

        public override string AlgorithmName
        {
            get { return "CSHAKE" + fixedOutputLength; }
        }

        public override int DoOutput(byte[] output, int outOff, int outLen)
        {
            if (diff == null)
            {
                return base.DoOutput(output, outOff, outLen);
            }

            if (!squeezing)
            {
                AbsorbBits(0x00, 2);
            }

            Squeeze(output, outOff, ((long)outLen) << 3);

            return outLen;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public override int Output(Span<byte> output)
        {
            if (diff == null)
            {
                return base.Output(output);
            }

            if (!squeezing)
            {
                AbsorbBits(0x00, 2);
            }

            Squeeze(output);

            return output.Length;
        }
#endif

        public override void Reset()
        {
            base.Reset();

            if (diff != null)
            {
                DiffPadAndAbsorb();
            }
        }
    }
}
