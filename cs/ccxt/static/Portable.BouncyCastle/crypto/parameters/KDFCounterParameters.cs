using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Parameters
{
    public class KdfCounterParameters : IDerivationParameters
    {
        private byte[] ki;
        private byte[] fixedInputDataCounterPrefix;
        private byte[] fixedInputDataCounterSuffix;
        private int r;

        /// <summary>
        /// Base constructor - suffix fixed input data only.
        /// </summary>
        /// <param name="ki">the KDF seed</param>
        /// <param name="fixedInputDataCounterSuffix">fixed input data to follow counter.</param>
        /// <param name="r">length of the counter in bits</param>
        public KdfCounterParameters(byte[] ki, byte[] fixedInputDataCounterSuffix, int r) : this(ki, null, fixedInputDataCounterSuffix, r)
        {
        }



        /// <summary>
        /// Base constructor - prefix and suffix fixed input data.
        /// </summary>
        /// <param name="ki">the KDF seed</param>
        /// <param name="fixedInputDataCounterPrefix">fixed input data to precede counter</param>
        /// <param name="fixedInputDataCounterSuffix">fixed input data to follow counter.</param>
        /// <param name="r">length of the counter in bits.</param>
        public KdfCounterParameters(byte[] ki, byte[] fixedInputDataCounterPrefix, byte[] fixedInputDataCounterSuffix, int r)
        {
            if (ki == null)
            {
                throw new ArgumentException("A KDF requires Ki (a seed) as input");
            }
            this.ki = Arrays.Clone(ki);

            if (fixedInputDataCounterPrefix == null)
            {
                this.fixedInputDataCounterPrefix = new byte[0];
            }
            else
            {
                this.fixedInputDataCounterPrefix = Arrays.Clone(fixedInputDataCounterPrefix);
            }

            if (fixedInputDataCounterSuffix == null)
            {
                this.fixedInputDataCounterSuffix = new byte[0];
            }
            else
            {
                this.fixedInputDataCounterSuffix = Arrays.Clone(fixedInputDataCounterSuffix);
            }

            if (r != 8 && r != 16 && r != 24 && r != 32)
            {
                throw new ArgumentException("Length of counter should be 8, 16, 24 or 32");
            }
            this.r = r;
        }

        public byte[] Ki
        {
            get { return ki; }
        }

        public byte[] FixedInputData
        {
            get { return Arrays.Clone(fixedInputDataCounterSuffix); }
        }

        public byte[] FixedInputDataCounterPrefix
        {
            get { return Arrays.Clone(fixedInputDataCounterPrefix); }

        }

        public byte[] FixedInputDataCounterSuffix
        {
            get { return Arrays.Clone(fixedInputDataCounterSuffix); }
        }

        public int R
        {
            get { return r; }
        }
    }
}