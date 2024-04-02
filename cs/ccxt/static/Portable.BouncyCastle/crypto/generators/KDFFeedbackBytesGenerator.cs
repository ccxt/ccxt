using System;

using Org.BouncyCastle.Crypto.Macs;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Math;

namespace Org.BouncyCastle.Crypto.Generators
{
    public class KdfFeedbackBytesGenerator : IMacDerivationFunction
    {
        private static readonly BigInteger IntegerMax = BigInteger.ValueOf(0x7fffffff);
        private static readonly BigInteger Two = BigInteger.Two;

        // please refer to the standard for the meaning of the variable names
        // all field lengths are in bytes, not in bits as specified by the standard

        // fields set by the constructor
        private readonly IMac prf;
        private readonly int h;

        // fields set by init
        private byte[] fixedInputData;
        private int maxSizeExcl;
        // ios is i defined as an octet string (the binary representation)
        private byte[] ios;
        private byte[] iv;
        private bool useCounter;

        // operational
        private int generatedBytes;
        // k is used as buffer for all K(i) values
        private byte[] k;

        public KdfFeedbackBytesGenerator(IMac prf)
        {
            this.prf = prf;
            this.h = prf.GetMacSize();
            this.k = new byte[h];
        }


        public void Init(IDerivationParameters parameters)
        {
            KdfFeedbackParameters feedbackParams = parameters as KdfFeedbackParameters;
            if (feedbackParams == null)
            {
                throw new ArgumentException("Wrong type of arguments given");
            }


            // --- init mac based PRF ---

            this.prf.Init(new KeyParameter(feedbackParams.Ki));

            // --- set arguments ---

            this.fixedInputData = feedbackParams.FixedInputData;

            int r = feedbackParams.R;
            this.ios = new byte[r / 8];

            if (feedbackParams.UseCounter)
            {
                // this is more conservative than the spec
                BigInteger maxSize = Two.Pow(r).Multiply(BigInteger.ValueOf(h));
                this.maxSizeExcl = maxSize.CompareTo(IntegerMax) == 1 ?
                    int.MaxValue : maxSize.IntValue;
            }
            else
            {
                this.maxSizeExcl = int.MaxValue;
            }

            this.iv = feedbackParams.Iv;
            this.useCounter = feedbackParams.UseCounter;

            // --- set operational state ---

            generatedBytes = 0;
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

            // TODO enable IV
            if (generatedBytes == 0)
            {
                prf.BlockUpdate(iv, 0, iv.Length);
            }
            else
            {
                prf.BlockUpdate(k, 0, k.Length);
            }

            if (useCounter)
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
                prf.BlockUpdate(ios, 0, ios.Length);
            }

            prf.BlockUpdate(fixedInputData, 0, fixedInputData.Length);
            prf.DoFinal(k, 0);
        }

        public IMac GetMac()
        {
            return prf;
        }
    }
}