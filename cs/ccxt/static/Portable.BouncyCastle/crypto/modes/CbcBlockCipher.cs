using System;

using Org.BouncyCastle.Crypto.Parameters;

namespace Org.BouncyCastle.Crypto.Modes
{
    /**
    * implements Cipher-Block-Chaining (CBC) mode on top of a simple cipher.
    */
    public sealed class CbcBlockCipher
		: IBlockCipherMode
    {
        private byte[]			IV, cbcV, cbcNextV;
		private int				blockSize;
        private IBlockCipher	cipher;
        private bool			encrypting;

        /**
        * Basic constructor.
        *
        * @param cipher the block cipher to be used as the basis of chaining.
        */
        public CbcBlockCipher(
            IBlockCipher cipher)
        {
            this.cipher = cipher;
            this.blockSize = cipher.GetBlockSize();

            this.IV = new byte[blockSize];
            this.cbcV = new byte[blockSize];
            this.cbcNextV = new byte[blockSize];
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
        *
        * @param forEncryption if true the cipher is initialised for
        *  encryption, if false for decryption.
        * @param param the key and other data required by the cipher.
        * @exception ArgumentException if the parameters argument is
        * inappropriate.
        */
        public void Init(bool forEncryption, ICipherParameters parameters)
        {
            bool oldEncrypting = this.encrypting;

            this.encrypting = forEncryption;

            if (parameters is ParametersWithIV ivParam)
            {
                byte[] iv = ivParam.GetIV();

                if (iv.Length != blockSize)
                    throw new ArgumentException("initialisation vector must be the same length as block size");

                Array.Copy(iv, 0, IV, 0, iv.Length);

				parameters = ivParam.Parameters;
            }

			Reset();

            // if null it's an IV changed only.
            if (parameters != null)
            {
                cipher.Init(encrypting, parameters);
            }
            else if (oldEncrypting != encrypting)
            {
                throw new ArgumentException("cannot change encrypting state without providing key.");
            }
        }

		/**
        * return the algorithm name and mode.
        *
        * @return the name of the underlying algorithm followed by "/CBC".
        */
        public string AlgorithmName
        {
            get { return cipher.AlgorithmName + "/CBC"; }
        }

		public bool IsPartialBlockOkay
		{
			get { return false; }
		}

		/**
        * return the block size of the underlying cipher.
        *
        * @return the block size of the underlying cipher.
        */
        public int GetBlockSize()
        {
            return cipher.GetBlockSize();
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

        /**
        * reset the chaining vector back to the IV and reset the underlying
        * cipher.
        */
        public void Reset()
        {
            Array.Copy(IV, 0, cbcV, 0, IV.Length);
			Array.Clear(cbcNextV, 0, cbcNextV.Length);
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        private int EncryptBlock(ReadOnlySpan<byte> input, Span<byte> output)
        {
            Check.DataLength(input, blockSize, "input buffer too short");
            Check.OutputLength(output, blockSize, "output buffer too short");

            for (int i = 0; i < blockSize; i++)
            {
                cbcV[i] ^= input[i];
            }

            int length = cipher.ProcessBlock(cbcV, output);

            output[..blockSize].CopyTo(cbcV);

            return length;
        }

        private int DecryptBlock(ReadOnlySpan<byte> input, Span<byte> output)
        {
            Check.DataLength(input, blockSize, "input buffer too short");
            Check.OutputLength(output, blockSize, "output buffer too short");

            input[..blockSize].CopyTo(cbcNextV);

            int length = cipher.ProcessBlock(input, output);

            for (int i = 0; i < blockSize; i++)
            {
                output[i] ^= cbcV[i];
            }

            byte[] tmp = cbcV;
            cbcV = cbcNextV;
            cbcNextV = tmp;

            return length;
        }
#else
        private int EncryptBlock(byte[] input, int inOff, byte[] outBytes, int outOff)
        {
            Check.DataLength(input, inOff, blockSize, "input buffer too short");
            Check.OutputLength(outBytes, outOff, blockSize, "output buffer too short");

            for (int i = 0; i < blockSize; i++)
            {
                cbcV[i] ^= input[inOff + i];
            }

            int length = cipher.ProcessBlock(cbcV, 0, outBytes, outOff);

            Array.Copy(outBytes, outOff, cbcV, 0, cbcV.Length);

            return length;
        }

        private int DecryptBlock(byte[] input, int inOff, byte[] outBytes, int outOff)
        {
            Check.DataLength(input, inOff, blockSize, "input buffer too short");
            Check.OutputLength(outBytes, outOff, blockSize, "output buffer too short");

            Array.Copy(input, inOff, cbcNextV, 0, blockSize);

            int length = cipher.ProcessBlock(input, inOff, outBytes, outOff);

            for (int i = 0; i < blockSize; i++)
            {
                outBytes[outOff + i] ^= cbcV[i];
            }

            byte[] tmp = cbcV;
            cbcV = cbcNextV;
            cbcNextV = tmp;

            return length;
        }
#endif
    }
}
