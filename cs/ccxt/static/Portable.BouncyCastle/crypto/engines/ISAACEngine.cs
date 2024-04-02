using System;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Engines
{
    /**
    * Implementation of Bob Jenkin's ISAAC (Indirection Shift Accumulate Add and Count).
    * see: http://www.burtleburtle.net/bob/rand/isaacafa.html
    */
    public class IsaacEngine
        : IStreamCipher
    {
        // Constants
        private static readonly int sizeL          = 8,
                                    stateArraySize = sizeL<<5; // 256

        // Cipher's internal state
        private uint[]   engineState   = null, // mm                
                        results       = null; // randrsl
        private uint     a = 0, b = 0, c = 0;

        // Engine state
        private int     index         = 0;
        private byte[]  keyStream     = new byte[stateArraySize<<2], // results expanded into bytes
                        workingKey    = null;
        private bool	initialised   = false;

        /**
        * initialise an ISAAC cipher.
        *
        * @param forEncryption whether or not we are for encryption.
        * @param params the parameters required to set up the cipher.
        * @exception ArgumentException if the params argument is
        * inappropriate.
        */
        public virtual void Init(
            bool				forEncryption, 
            ICipherParameters	parameters)
        {
            if (!(parameters is KeyParameter))
                throw new ArgumentException(
                    "invalid parameter passed to ISAAC Init - " + Platform.GetTypeName(parameters),
                    "parameters");

            /* 
            * ISAAC encryption and decryption is completely
            * symmetrical, so the 'forEncryption' is 
            * irrelevant.
            */
            KeyParameter p = (KeyParameter) parameters;
            setKey(p.GetKey());
        }

        public virtual byte ReturnByte(
            byte input)
        {
            if (index == 0) 
            {
                isaac();
                keyStream = Pack.UInt32_To_BE(results);
            }

            byte output = (byte)(keyStream[index]^input);
            index = (index + 1) & 1023;

            return output;
        }

        public virtual void ProcessBytes(
            byte[]	input, 
            int		inOff, 
            int		len, 
            byte[]	output, 
            int		outOff)
        {
            if (!initialised)
                throw new InvalidOperationException(AlgorithmName + " not initialised");

            Check.DataLength(input, inOff, len, "input buffer too short");
            Check.OutputLength(output, outOff, len, "output buffer too short");

            for (int i = 0; i < len; i++)
            {
                if (index == 0) 
                {
                    isaac();
                    keyStream = Pack.UInt32_To_BE(results);
                }
                output[i+outOff] = (byte)(keyStream[index]^input[i+inOff]);
                index = (index + 1) & 1023;
            }
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual void ProcessBytes(ReadOnlySpan<byte> input, Span<byte> output)
        {
            if (!initialised)
                throw new InvalidOperationException(AlgorithmName + " not initialised");

            Check.OutputLength(output, input.Length, "output buffer too short");

            for (int i = 0; i < input.Length; i++)
            {
                if (index == 0)
                {
                    isaac();
                    keyStream = Pack.UInt32_To_BE(results);
                }
                output[i] = (byte)(keyStream[index++] ^ input[i]);
                index &= 1023;
            }
        }
#endif

        public virtual string AlgorithmName
        {
            get { return "ISAAC"; }
        }

        public virtual void Reset()
        {
            setKey(workingKey);
        }

        // Private implementation
        private void setKey(
            byte[] keyBytes)
        {
            workingKey = keyBytes;

            if (engineState == null)
            {
                engineState = new uint[stateArraySize];
            }

            if (results == null)
            {
                results = new uint[stateArraySize];
            }

            int i, j, k;

            // Reset state
            for (i = 0; i < stateArraySize; i++)
            {
                engineState[i] = results[i] = 0;
            }
            a = b = c = 0;

            // Reset index counter for output
            index = 0;

            // Convert the key bytes to ints and put them into results[] for initialization
            byte[] t = new byte[keyBytes.Length + (keyBytes.Length & 3)];
            Array.Copy(keyBytes, 0, t, 0, keyBytes.Length);
            for (i = 0; i < t.Length; i+=4)
            {
                results[i >> 2] = Pack.LE_To_UInt32(t, i);
            }

            // It has begun?
            uint[] abcdefgh = new uint[sizeL];

            for (i = 0; i < sizeL; i++)
            {
                abcdefgh[i] = 0x9e3779b9; // Phi (golden ratio)
            }

            for (i = 0; i < 4; i++)
            {
                mix(abcdefgh);
            }

            for (i = 0; i < 2; i++)
            {
                for (j = 0; j < stateArraySize; j+=sizeL)
                {
                    for (k = 0; k < sizeL; k++)
                    {
                        abcdefgh[k] += (i<1) ? results[j+k] : engineState[j+k];
                    }

                    mix(abcdefgh);

                    for (k = 0; k < sizeL; k++)
                    {
                        engineState[j+k] = abcdefgh[k];
                    }
                }
            }

            isaac();

            initialised = true;
        }    

        private void isaac()
        {
            uint x, y;

            b += ++c;
            for (int i = 0; i < stateArraySize; i++)
            {
                x = engineState[i];
                switch (i & 3)
                {
                    case 0: a ^= (a << 13); break;
                    case 1: a ^= (a >>  6); break;
                    case 2: a ^= (a <<  2); break;
                    case 3: a ^= (a >> 16); break;
                }
                a += engineState[(i+128) & 0xFF];
                engineState[i] = y = engineState[(int)((uint)x >> 2) & 0xFF] + a + b;
                results[i] = b = engineState[(int)((uint)y >> 10) & 0xFF] + x;
            }
        }

        private void mix(uint[] x)
        {
            x[0]^=x[1]<< 11; x[3]+=x[0]; x[1]+=x[2];
            x[1]^=x[2]>>  2; x[4]+=x[1]; x[2]+=x[3];
            x[2]^=x[3]<<  8; x[5]+=x[2]; x[3]+=x[4];
            x[3]^=x[4]>> 16; x[6]+=x[3]; x[4]+=x[5];
            x[4]^=x[5]<< 10; x[7]+=x[4]; x[5]+=x[6];
            x[5]^=x[6]>>  4; x[0]+=x[5]; x[6]+=x[7];
            x[6]^=x[7]<<  8; x[1]+=x[6]; x[7]+=x[0];
            x[7]^=x[0]>>  9; x[2]+=x[7]; x[0]+=x[1];
        }
    }
}
