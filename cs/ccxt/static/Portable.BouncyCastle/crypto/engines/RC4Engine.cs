using System;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Engines
{
    public class RC4Engine
		: IStreamCipher
    {
        private readonly static int STATE_LENGTH = 256;

        /*
        * variables to hold the state of the RC4 engine
        * during encryption and decryption
        */

        private byte[]	engineState;
        private int		x;
        private int		y;
        private byte[]	workingKey;

        /**
        * initialise a RC4 cipher.
        *
        * @param forEncryption whether or not we are for encryption.
        * @param parameters the parameters required to set up the cipher.
        * @exception ArgumentException if the parameters argument is
        * inappropriate.
        */
        public virtual void Init(
            bool				forEncryption,
            ICipherParameters	parameters)
        {
            if (parameters is KeyParameter)
            {
                /*
                * RC4 encryption and decryption is completely
                * symmetrical, so the 'forEncryption' is
                * irrelevant.
                */
                workingKey = ((KeyParameter)parameters).GetKey();
                SetKey(workingKey);

                return;
            }

            throw new ArgumentException("invalid parameter passed to RC4 init - " + Platform.GetTypeName(parameters));
        }

        public virtual string AlgorithmName
        {
            get { return "RC4"; }
        }

        public virtual byte ReturnByte(
			byte input)
        {
            x = (x + 1) & 0xff;
            y = (engineState[x] + y) & 0xff;

            // swap
            byte tmp = engineState[x];
            engineState[x] = engineState[y];
            engineState[y] = tmp;

            // xor
            return (byte)(input ^ engineState[(engineState[x] + engineState[y]) & 0xff]);
        }

        public virtual void ProcessBytes(
            byte[]	input,
            int		inOff,
            int		length,
            byte[]	output,
            int		outOff)
        {
            Check.DataLength(input, inOff, length, "input buffer too short");
            Check.OutputLength(output, outOff, length, "output buffer too short");

            for (int i = 0; i < length ; i++)
            {
                x = (x + 1) & 0xff;
                y = (engineState[x] + y) & 0xff;

                byte sx = engineState[x];
                byte sy = engineState[y];

                // swap
                engineState[x] = sy;
                engineState[y] = sx;

                // xor
                output[i+outOff] = (byte)(input[i + inOff] ^ engineState[(sx + sy) & 0xff]);
            }
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual void ProcessBytes(ReadOnlySpan<byte> input, Span<byte> output)
        {
            Check.OutputLength(output, input.Length, "output buffer too short");

            for (int i = 0; i < input.Length; i++)
            {
                x = (x + 1) & 0xff;
                y = (engineState[x] + y) & 0xff;

                byte sx = engineState[x];
                byte sy = engineState[y];

                // swap
                engineState[x] = sy;
                engineState[y] = sx;

                // xor
                output[i] = (byte)(input[i] ^ engineState[(sx + sy) & 0xff]);
            }
        }
#endif

        public virtual void Reset()
        {
            SetKey(workingKey);
        }

        // Private implementation

        private void SetKey(
			byte[] keyBytes)
        {
            workingKey = keyBytes;

            // System.out.println("the key length is ; "+ workingKey.Length);

            x = 0;
            y = 0;

            if (engineState == null)
            {
                engineState = new byte[STATE_LENGTH];
            }

            // reset the state of the engine
            for (int i=0; i < STATE_LENGTH; i++)
            {
                engineState[i] = (byte)i;
            }

            int i1 = 0;
            int i2 = 0;

            for (int i=0; i < STATE_LENGTH; i++)
            {
                i2 = ((keyBytes[i1] & 0xff) + engineState[i] + i2) & 0xff;
                // do the byte-swap inline
                byte tmp = engineState[i];
                engineState[i] = engineState[i2];
                engineState[i2] = tmp;
                i1 = (i1+1) % keyBytes.Length;
            }
        }
    }
}
