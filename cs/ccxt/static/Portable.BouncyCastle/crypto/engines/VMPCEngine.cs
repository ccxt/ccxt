using System;

using Org.BouncyCastle.Crypto.Parameters;

namespace Org.BouncyCastle.Crypto.Engines
{
    public class VmpcEngine
        : IStreamCipher
    {
        /*
        * variables to hold the state of the VMPC engine during encryption and
        * decryption
        */
        protected byte n = 0;
        protected byte[] P = null;
        protected byte s = 0;

        protected byte[] workingIV;
        protected byte[] workingKey;

        public virtual string AlgorithmName
        {
            get { return "VMPC"; }
        }

        /**
        * initialise a VMPC cipher.
        * 
        * @param forEncryption
        *    whether or not we are for encryption.
        * @param params
        *    the parameters required to set up the cipher.
        * @exception ArgumentException
        *    if the params argument is inappropriate.
        */
        public virtual void Init(
            bool				forEncryption,
            ICipherParameters	parameters)
        {
            if (!(parameters is ParametersWithIV))
                throw new ArgumentException("VMPC Init parameters must include an IV");

            ParametersWithIV ivParams = (ParametersWithIV) parameters;

            if (!(ivParams.Parameters is KeyParameter))
                throw new ArgumentException("VMPC Init parameters must include a key");

            KeyParameter key = (KeyParameter)ivParams.Parameters;

            this.workingIV = ivParams.GetIV();

            if (workingIV == null || workingIV.Length < 1 || workingIV.Length > 768)
                throw new ArgumentException("VMPC requires 1 to 768 bytes of IV");

            this.workingKey = key.GetKey();

            InitKey(this.workingKey, this.workingIV);
        }

        protected virtual void InitKey(
            byte[]	keyBytes,
            byte[]	ivBytes)
        {
            s = 0;
            P = new byte[256];
            for (int i = 0; i < 256; i++)
            {
                P[i] = (byte) i;
            }

            for (int m = 0; m < 768; m++)
            {
                s = P[(s + P[m & 0xff] + keyBytes[m % keyBytes.Length]) & 0xff];
                byte temp = P[m & 0xff];
                P[m & 0xff] = P[s & 0xff];
                P[s & 0xff] = temp;
            }
            for (int m = 0; m < 768; m++)
            {
                s = P[(s + P[m & 0xff] + ivBytes[m % ivBytes.Length]) & 0xff];
                byte temp = P[m & 0xff];
                P[m & 0xff] = P[s & 0xff];
                P[s & 0xff] = temp;
            }
            n = 0;
        }

        public virtual void ProcessBytes(
            byte[]	input,
            int		inOff,
            int		len,
            byte[]	output,
            int		outOff)
        {
            Check.DataLength(input, inOff, len, "input buffer too short");
            Check.OutputLength(output, outOff, len, "output buffer too short");

            for (int i = 0; i < len; i++)
            {
                s = P[(s + P[n & 0xff]) & 0xff];
                byte z = P[(P[(P[s & 0xff]) & 0xff] + 1) & 0xff];
                // encryption
                byte temp = P[n & 0xff];
                P[n & 0xff] = P[s & 0xff];
                P[s & 0xff] = temp;
                n = (byte) ((n + 1) & 0xff);

                // xor
                output[i + outOff] = (byte) (input[i + inOff] ^ z);
            }
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual void ProcessBytes(ReadOnlySpan<byte> input, Span<byte> output)
        {
            Check.OutputLength(output, input.Length, "output buffer too short");

            for (int i = 0; i < input.Length; i++)
            {
                s = P[(s + P[n & 0xff]) & 0xff];
                byte z = P[(P[(P[s & 0xff]) & 0xff] + 1) & 0xff];
                // encryption
                byte temp = P[n & 0xff];
                P[n & 0xff] = P[s & 0xff];
                P[s & 0xff] = temp;
                n = (byte)((n + 1) & 0xff);

                // xor
                output[i] = (byte)(input[i] ^ z);
            }
        }
#endif

        public virtual void Reset()
        {
            InitKey(this.workingKey, this.workingIV);
        }

        public virtual byte ReturnByte(
            byte input)
        {
            s = P[(s + P[n & 0xff]) & 0xff];
            byte z = P[(P[(P[s & 0xff]) & 0xff] + 1) & 0xff];
            // encryption
            byte temp = P[n & 0xff];
            P[n & 0xff] = P[s & 0xff];
            P[s & 0xff] = temp;
            n = (byte) ((n + 1) & 0xff);

            // xor
            return (byte) (input ^ z);
        }
    }
}
