using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Parameters
{
    public class KdfDoublePipelineIterationParameters : IDerivationParameters
    {
        // could be any valid value, using 32, don't know why
        private static readonly int UNUSED_R = 32;

        private readonly byte[] ki;
        private readonly bool useCounter;
        private readonly int r;
        private readonly byte[] fixedInputData;

        private KdfDoublePipelineIterationParameters(byte[] ki, byte[] fixedInputData, int r, bool useCounter)
        {
            if (ki == null)
            {
                throw new ArgumentException("A KDF requires Ki (a seed) as input");
            }

            this.ki = Arrays.Clone(ki);

            if (fixedInputData == null)
            {
                this.fixedInputData = new byte[0];
            }
            else
            {
                this.fixedInputData = Arrays.Clone(fixedInputData);
            }

            if (r != 8 && r != 16 && r != 24 && r != 32)
            {
                throw new ArgumentException("Length of counter should be 8, 16, 24 or 32");
            }

            this.r = r;

            this.useCounter = useCounter;
        }

        public static KdfDoublePipelineIterationParameters CreateWithCounter(
            byte[] ki, byte[] fixedInputData, int r)
        {
            return new KdfDoublePipelineIterationParameters(ki, fixedInputData, r, true);
        }

        public static KdfDoublePipelineIterationParameters CreateWithoutCounter(
            byte[] ki, byte[] fixedInputData)
        {
            return new KdfDoublePipelineIterationParameters(ki, fixedInputData, UNUSED_R, false);
        }

        public byte[] Ki
        {
            get { return Arrays.Clone(ki); }
        }

        public bool UseCounter
        {
            get { return useCounter; }
        }

        public int R
        {
            get { return r; }
        }

        public byte[] FixedInputData
        {
            get { return Arrays.Clone(fixedInputData); }
        }
    }
}