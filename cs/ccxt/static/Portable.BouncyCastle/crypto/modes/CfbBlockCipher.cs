using System;

using Org.BouncyCastle.Crypto.Parameters;

namespace Org.BouncyCastle.Crypto.Modes
{
    /**
    * implements a Cipher-FeedBack (CFB) mode on top of a simple cipher.
    */
    public class CfbBlockCipher
		: IBlockCipherMode
    {
        private byte[]	IV;
        private byte[]	cfbV;
        private byte[]	cfbOutV;
		private bool	encrypting;

		private readonly int			blockSize;
        private readonly IBlockCipher	cipher;

		/**
        * Basic constructor.
        *
        * @param cipher the block cipher to be used as the basis of the
        * feedback mode.
        * @param blockSize the block size in bits (note: a multiple of 8)
        */
        public CfbBlockCipher(
            IBlockCipher cipher,
            int          bitBlockSize)
        {
            if (bitBlockSize < 8 || (bitBlockSize & 7) != 0)
                throw new ArgumentException("CFB" + bitBlockSize + " not supported", "bitBlockSize");

            this.cipher = cipher;
            this.blockSize = bitBlockSize / 8;
            this.IV = new byte[cipher.GetBlockSize()];
            this.cfbV = new byte[cipher.GetBlockSize()];
            this.cfbOutV = new byte[cipher.GetBlockSize()];
        }
        /**
        * return the underlying block cipher that we are wrapping.
        *
        * @return the underlying block cipher that we are wrapping.
        */
        public IBlockCipher UnderlyingCipher => cipher;

        /**
        * Initialise the cipher and, possibly, the initialisation vector (IV).
        * If an IV isn't passed as part of the parameter, the IV will be all zeros.
        * An IV which is too short is handled in FIPS compliant fashion.
        *
        * @param forEncryption if true the cipher is initialised for
        *  encryption, if false for decryption.
        * @param param the key and other data required by the cipher.
        * @exception ArgumentException if the parameters argument is
        * inappropriate.
        */
        public void Init(
            bool forEncryption,
            ICipherParameters parameters)
        {
            this.encrypting = forEncryption;
            if (parameters is ParametersWithIV)
            {
                ParametersWithIV ivParam = (ParametersWithIV) parameters;
                byte[] iv = ivParam.GetIV();
                int diff = IV.Length - iv.Length;
                Array.Copy(iv, 0, IV, diff, iv.Length);
                Array.Clear(IV, 0, diff);

                parameters = ivParam.Parameters;
            }
            Reset();

            // if it's null, key is to be reused.
            if (parameters != null)
            {
                cipher.Init(true, parameters);
            }
        }

        /**
        * return the algorithm name and mode.
        *
        * @return the name of the underlying algorithm followed by "/CFB"
        * and the block size in bits.
        */
        public string AlgorithmName
        {
            get { return cipher.AlgorithmName + "/CFB" + (blockSize * 8); }
        }

		public bool IsPartialBlockOkay
		{
			get { return true; }
		}

		/**
        * return the block size we are operating at.
        *
        * @return the block size we are operating at (in bytes).
        */
        public int GetBlockSize()
        {
            return blockSize;
        }

        public int ProcessBlock(byte[] input, int inOff, byte[] output, int outOff)
        {
#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
            return encrypting
                ? EncryptBlock(input.AsSpan(inOff), output.AsSpan(outOff))
                : DecryptBlock(input.AsSpan(inOff), output.AsSpan(outOff));
#else
            return encrypting
				? EncryptBlock(input, inOff, output, outOff)
				: DecryptBlock(input, inOff, output, outOff);
#endif
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public int ProcessBlock(ReadOnlySpan<byte> input, Span<byte> output)
        {
            return encrypting
                ? EncryptBlock(input, output)
                : DecryptBlock(input, output);
        }
#endif

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public int EncryptBlock(ReadOnlySpan<byte> input, Span<byte> output)
        {
            Check.DataLength(input, blockSize, "input buffer too short");
            Check.OutputLength(output, blockSize, "output buffer too short");

            cipher.ProcessBlock(cfbV, cfbOutV);
            //
            // XOR the cfbV with the plaintext producing the ciphertext
            //
            for (int i = 0; i < blockSize; i++)
            {
                output[i] = (byte)(cfbOutV[i] ^ input[i]);
            }
            //
            // change over the input block.
            //
            Array.Copy(cfbV, blockSize, cfbV, 0, cfbV.Length - blockSize);
            output[..blockSize].CopyTo(cfbV.AsSpan(cfbV.Length - blockSize));
            return blockSize;
        }

        public int DecryptBlock(ReadOnlySpan<byte> input, Span<byte> output)
        {
            Check.DataLength(input, blockSize, "input buffer too short");
            Check.OutputLength(output, blockSize, "output buffer too short");

            cipher.ProcessBlock(cfbV, 0, cfbOutV, 0);
            //
            // change over the input block.
            //
            Array.Copy(cfbV, blockSize, cfbV, 0, cfbV.Length - blockSize);
            input[..blockSize].CopyTo(cfbV.AsSpan(cfbV.Length - blockSize));
            //
            // XOR the cfbV with the ciphertext producing the plaintext
            //
            for (int i = 0; i < blockSize; i++)
            {
                output[i] = (byte)(cfbOutV[i] ^ input[i]);
            }
            return blockSize;
        }
#else
        public int EncryptBlock(byte[] input, int inOff, byte[] outBytes, int outOff)
        {
            Check.DataLength(input, inOff, blockSize, "input buffer too short");
            Check.OutputLength(outBytes, outOff, blockSize, "output buffer too short");

            cipher.ProcessBlock(cfbV, 0, cfbOutV, 0);
            //
            // XOR the cfbV with the plaintext producing the ciphertext
            //
            for (int i = 0; i < blockSize; i++)
            {
                outBytes[outOff + i] = (byte)(cfbOutV[i] ^ input[inOff + i]);
            }
            //
            // change over the input block.
            //
            Array.Copy(cfbV, blockSize, cfbV, 0, cfbV.Length - blockSize);
            Array.Copy(outBytes, outOff, cfbV, cfbV.Length - blockSize, blockSize);
            return blockSize;
        }

        public int DecryptBlock(byte[] input, int inOff, byte[] outBytes, int outOff)
        {
            Check.DataLength(input, inOff, blockSize, "input buffer too short");
            Check.OutputLength(outBytes, outOff, blockSize, "output buffer too short");

            cipher.ProcessBlock(cfbV, 0, cfbOutV, 0);
            //
            // change over the input block.
            //
            Array.Copy(cfbV, blockSize, cfbV, 0, cfbV.Length - blockSize);
            Array.Copy(input, inOff, cfbV, cfbV.Length - blockSize, blockSize);
            //
            // XOR the cfbV with the ciphertext producing the plaintext
            //
            for (int i = 0; i < blockSize; i++)
            {
                outBytes[outOff + i] = (byte)(cfbOutV[i] ^ input[inOff + i]);
            }
            return blockSize;
        }
#endif

        /**
        * reset the chaining vector back to the IV and reset the underlying
        * cipher.
        */
        public void Reset()
        {
            Array.Copy(IV, 0, cfbV, 0, IV.Length);
        }
    }
}
