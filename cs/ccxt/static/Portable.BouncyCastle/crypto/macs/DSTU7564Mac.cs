using System;

using Org.BouncyCastle.Crypto.Digests;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto.Utilities;

namespace Org.BouncyCastle.Crypto.Macs
{
    /// <summary>
    /// Implementation of DSTU7564 mac mode
    /// </summary>
    public class Dstu7564Mac
        : IMac
    {
        private Dstu7564Digest engine;
        private int macSize;

        private ulong inputLength;

        byte[] paddedKey;
        byte[] invertedKey;

        public string AlgorithmName
        {
            get { return "DSTU7564Mac"; }
        }

        public Dstu7564Mac(int macSizeBits)
        {
            engine = new Dstu7564Digest(macSizeBits);
            macSize = macSizeBits / 8;
        }

        public void Init(ICipherParameters parameters)
        {
            if (parameters is KeyParameter)
            {
                byte[] key = ((KeyParameter)parameters).GetKey();

                invertedKey = new byte[key.Length];

                paddedKey = PadKey(key);

                for (int byteIndex = 0; byteIndex < invertedKey.Length; byteIndex++)
                {
                    invertedKey[byteIndex] = (byte)(key[byteIndex] ^ (byte)0xFF);
                }
            }
            else
            {
                throw new ArgumentException("Bad parameter passed");
            }

            engine.BlockUpdate(paddedKey, 0, paddedKey.Length);
        }

        public int GetMacSize()
        {
            return macSize;
        }

        public void BlockUpdate(byte[] input, int inOff, int len)
        {
            Check.DataLength(input, inOff, len, "input buffer too short");

            if (paddedKey == null)
                throw new InvalidOperationException(AlgorithmName + " not initialised");

            engine.BlockUpdate(input, inOff, len);
            inputLength += (ulong)len;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public void BlockUpdate(ReadOnlySpan<byte> input)
        {
            if (paddedKey == null)
                throw new InvalidOperationException(AlgorithmName + " not initialised");

            engine.BlockUpdate(input);
            inputLength += (ulong)input.Length;
        }
#endif

        public void Update(byte input)
        {
            engine.Update(input);
            inputLength++;
        }

        public int DoFinal(byte[] output, int outOff)
        {
            if (paddedKey == null)
                throw new InvalidOperationException(AlgorithmName + " not initialised");

            Check.OutputLength(output, outOff, macSize, "output buffer too short");

            Pad();

            engine.BlockUpdate(invertedKey, 0, invertedKey.Length);

            inputLength = 0;

            return engine.DoFinal(output, outOff);
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public int DoFinal(Span<byte> output)
        {
            if (paddedKey == null)
                throw new InvalidOperationException(AlgorithmName + " not initialised");

            Check.OutputLength(output, macSize, "output buffer too short");

            Pad();

            engine.BlockUpdate(invertedKey);

            inputLength = 0;

            return engine.DoFinal(output);
        }
#endif

        public void Reset()
        {
            inputLength = 0;
            engine.Reset();
            if (paddedKey != null)
            {
                engine.BlockUpdate(paddedKey, 0, paddedKey.Length);
            }
        }

        private void Pad()
        {
            int extra = engine.GetByteLength() - (int)(inputLength % (ulong)engine.GetByteLength());
            if (extra < 13)  // terminator byte + 96 bits of length
            {
                extra += engine.GetByteLength();
            }

            byte[] padded = new byte[extra];

            padded[0] = (byte)0x80; // Defined in standard;

            // Defined in standard;
            Pack.UInt64_To_LE(inputLength * 8, padded, padded.Length - 12);

            engine.BlockUpdate(padded, 0, padded.Length);
        }

        private byte[] PadKey(byte[] input)
        {
            int paddedLen = ((input.Length + engine.GetByteLength() - 1) / engine.GetByteLength()) * engine.GetByteLength();

            int extra = engine.GetByteLength() - (int)(input.Length % engine.GetByteLength());
            if (extra < 13)  // terminator byte + 96 bits of length
            {
                paddedLen += engine.GetByteLength();
            }

            byte[] padded = new byte[paddedLen];

            Array.Copy(input, 0, padded, 0, input.Length);

            padded[input.Length] = (byte)0x80; // Defined in standard;
            Pack.UInt32_To_LE((uint)(input.Length * 8), padded, padded.Length - 12); // Defined in standard;

            return padded;
        }
    }
}
