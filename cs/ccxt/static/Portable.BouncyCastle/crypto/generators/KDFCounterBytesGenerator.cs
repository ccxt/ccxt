using System;

using Org.BouncyCastle.Crypto.Macs;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Generators
{
    public class KdfCounterBytesGenerator : IMacDerivationFunction
    {

        private static readonly BigInteger IntegerMax = BigInteger.ValueOf(0x7fffffff);
        private static readonly BigInteger Two = BigInteger.Two;


        private readonly IMac prf;
        private readonly int h;

        private byte[] fixedInputDataCtrPrefix;
        private byte[] fixedInputData_afterCtr;
        private int maxSizeExcl;
        // ios is i defined as an octet string (the binary representation)
        private byte[] ios;

        // operational
        private int generatedBytes;
        // k is used as buffer for all K(i) values
        private byte[] k;

        public KdfCounterBytesGenerator(IMac prf)
        {
            this.prf = prf;
            this.h = prf.GetMacSize();
            this.k = new byte[h];
        }

        public void Init(IDerivationParameters param)
        {
            KdfCounterParameters kdfParams = param as KdfCounterParameters;
            if (kdfParams == null)
            {
                throw new ArgumentException("Wrong type of arguments given");
            }



            // --- init mac based PRF ---

            this.prf.Init(new KeyParameter(kdfParams.Ki));

            // --- set arguments ---

            this.fixedInputDataCtrPrefix = kdfParams.FixedInputDataCounterPrefix;
            this.fixedInputData_afterCtr = kdfParams.FixedInputDataCounterSuffix;

            int r = kdfParams.R;
            this.ios = new byte[r / 8];

            BigInteger maxSize = Two.Pow(r).Multiply(BigInteger.ValueOf(h));
            this.maxSizeExcl = maxSize.CompareTo(IntegerMax) == 1 ?
                int.MaxValue : maxSize.IntValue;

            // --- set operational state ---

            generatedBytes = 0;
        }


        public IMac GetMac()
        {
            return prf;
        }

        public IDigest Digest
        {
            get { return prf is HMac ? ((HMac)prf).GetUnderlyingDigest() : null; }
        }

        public int GenerateBytes(byte[] output, int outOff, int length)
        {
            int generatedBytesAfter = generatedBytes + length;
            if (generatedBytesAfter < 0 || generatedBytesAfter >= maxSizeExcl)
            {
                throw new DataLengthException(
                    "Current KDFCTR may only be used for " + maxSizeExcl + " bytes");
            }

            if (generatedBytes % h == 0)
            {
                generateNext();
            }

            // copy what is left in the currentT (1..hash
            int toGenerate = length;
            int posInK = generatedBytes % h;
            int leftInK = h - generatedBytes % h;
            int toCopy = System.Math.Min(leftInK, toGenerate);
            Array.Copy(k, posInK, output, outOff, toCopy);
            generatedBytes += toCopy;
            toGenerate -= toCopy;
            outOff += toCopy;

            while (toGenerate > 0)
            {
                generateNext();
                toCopy = System.Math.Min(h, toGenerate);
                Array.Copy(k, 0, output, outOff, toCopy);
                generatedBytes += toCopy;
                toGenerate -= toCopy;
                outOff += toCopy;
            }

            return length;

        }

        private void generateNext()
        {

            int i = generatedBytes / h + 1;

            // encode i into counter buffer
            switch (ios.Length)
            {
                case 4:
                    ios[0] = (byte)(i >> 24);
                    goto case 3;
                // fall through
                case 3:
                    ios[ios.Length - 3] = (byte)(i >> 16);
                    // fall through
                    goto case 2;
                case 2:
                    ios[ios.Length - 2] = (byte)(i >> 8);
                    // fall through
                    goto case 1;
                case 1:
                    ios[ios.Length - 1] = (byte)i;
                    break;
                default:
                    throw new InvalidOperationException("Unsupported size of counter i");
            }



            // special case for K(0): K(0) is empty, so no update
            prf.BlockUpdate(fixedInputDataCtrPrefix, 0, fixedInputDataCtrPrefix.Length);
            prf.BlockUpdate(ios, 0, ios.Length);
            prf.BlockUpdate(fixedInputData_afterCtr, 0, fixedInputData_afterCtr.Length);
            prf.DoFinal(k, 0);
        }
    }
}