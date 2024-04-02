using System;

using Org.BouncyCastle.Crypto.Macs;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Modes
{
	/**
	* A Two-Pass Authenticated-Encryption Scheme Optimized for Simplicity and 
	* Efficiency - by M. Bellare, P. Rogaway, D. Wagner.
	* 
	* http://www.cs.ucdavis.edu/~rogaway/papers/eax.pdf
	* 
	* EAX is an AEAD scheme based on CTR and OMAC1/CMAC, that uses a single block 
	* cipher to encrypt and authenticate data. It's on-line (the length of a 
	* message isn't needed to begin processing it), has good performances, it's
	* simple and provably secure (provided the underlying block cipher is secure).
	* 
	* Of course, this implementations is NOT thread-safe.
	*/
	public class EaxBlockCipher
		: IAeadBlockCipher
	{
		private enum Tag : byte { N, H, C };

		private SicBlockCipher cipher;

		private bool forEncryption;

		private int blockSize;

		private IMac mac;

		private byte[] nonceMac;
		private byte[] associatedTextMac;
		private byte[] macBlock;

		private int macSize;
		private byte[] bufBlock;
		private int bufOff;

        private bool cipherInitialized;
        private byte[] initialAssociatedText;

		/**
		* Constructor that accepts an instance of a block cipher engine.
		*
		* @param cipher the engine to use
		*/
		public EaxBlockCipher(
			IBlockCipher cipher)
		{
			blockSize = cipher.GetBlockSize();
			mac = new CMac(cipher);
			macBlock = new byte[blockSize];
			associatedTextMac = new byte[mac.GetMacSize()];
			nonceMac = new byte[mac.GetMacSize()];
			this.cipher = new SicBlockCipher(cipher);
		}

		public virtual string AlgorithmName => cipher.UnderlyingCipher.AlgorithmName + "/EAX";

		public virtual IBlockCipher UnderlyingCipher => cipher;

		public virtual int GetBlockSize()
		{
			return cipher.GetBlockSize();
		}

		public virtual void Init(bool forEncryption, ICipherParameters parameters)
		{
			this.forEncryption = forEncryption;

			byte[] nonce;
			ICipherParameters keyParam;

			if (parameters is AeadParameters aeadParameters)
			{
				nonce = aeadParameters.GetNonce();
                initialAssociatedText = aeadParameters.GetAssociatedText();
				macSize = aeadParameters.MacSize / 8;
				keyParam = aeadParameters.Key;
			}
			else if (parameters is ParametersWithIV parametersWithIV)
			{
				nonce = parametersWithIV.GetIV();
                initialAssociatedText = null;
				macSize = mac.GetMacSize() / 2;
				keyParam = parametersWithIV.Parameters;
			}
			else
			{
				throw new ArgumentException("invalid parameters passed to EAX");
			}

            bufBlock = new byte[forEncryption ? blockSize : (blockSize + macSize)];

            byte[] tag = new byte[blockSize];

            // Key reuse implemented in CBC mode of underlying CMac
            mac.Init(keyParam);

            tag[blockSize - 1] = (byte)Tag.N;
            mac.BlockUpdate(tag, 0, blockSize);
            mac.BlockUpdate(nonce, 0, nonce.Length);
            mac.DoFinal(nonceMac, 0);

            // Same BlockCipher underlies this and the mac, so reuse last key on cipher
            cipher.Init(true, new ParametersWithIV(null, nonceMac));

            Reset();
		}

        private void InitCipher()
        {
            if (cipherInitialized)
            {
                return;
            }

            cipherInitialized = true;

            mac.DoFinal(associatedTextMac, 0);

            byte[] tag = new byte[blockSize];
            tag[blockSize - 1] = (byte)Tag.C;
            mac.BlockUpdate(tag, 0, blockSize);
        }

        private void CalculateMac()
		{
			byte[] outC = new byte[blockSize];
			mac.DoFinal(outC, 0);

			for (int i = 0; i < macBlock.Length; i++)
			{
				macBlock[i] = (byte)(nonceMac[i] ^ associatedTextMac[i] ^ outC[i]);
			}
		}

		public virtual void Reset()
		{
			Reset(true);
		}

		private void Reset(
			bool clearMac)
		{
            cipher.Reset(); // TODO Redundant since the mac will reset it?
			mac.Reset();

			bufOff = 0;
			Array.Clear(bufBlock, 0, bufBlock.Length);

			if (clearMac)
			{
				Array.Clear(macBlock, 0, macBlock.Length);
			}

            byte[] tag = new byte[blockSize];
            tag[blockSize - 1] = (byte)Tag.H;
            mac.BlockUpdate(tag, 0, blockSize);

            cipherInitialized = false;

            if (initialAssociatedText != null)
            {
                ProcessAadBytes(initialAssociatedText, 0, initialAssociatedText.Length);
            }
        }
        
        public virtual void ProcessAadByte(byte input)
        {
            if (cipherInitialized)
            {
                throw new InvalidOperationException("AAD data cannot be added after encryption/decryption processing has begun.");
            }
            mac.Update(input);
        }

        public virtual void ProcessAadBytes(byte[] inBytes, int inOff, int len)
        {
            if (cipherInitialized)
                throw new InvalidOperationException("AAD data cannot be added after encryption/decryption processing has begun.");

            mac.BlockUpdate(inBytes, inOff, len);
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
		public virtual void ProcessAadBytes(ReadOnlySpan<byte> input)
		{
			if (cipherInitialized)
				throw new InvalidOperationException("AAD data cannot be added after encryption/decryption processing has begun.");

			mac.BlockUpdate(input);
		}
#endif

        public virtual int ProcessByte(byte input, byte[] outBytes, int outOff)
		{
            InitCipher();

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
			return Process(input, Spans.FromNullable(outBytes, outOff));
#else
			return Process(input, outBytes, outOff);
#endif
		}

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual int ProcessByte(byte input, Span<byte> output)
        {
            InitCipher();

            return Process(input, output);
        }
#endif

        public virtual int ProcessBytes(byte[] inBytes, int inOff, int len, byte[] outBytes, int outOff)
        {
            InitCipher();

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
			return ProcessBytes(inBytes.AsSpan(inOff, len), Spans.FromNullable(outBytes, outOff));
#else
            int resultLen = 0;

			for (int i = 0; i != len; i++)
			{
				resultLen += Process(inBytes[inOff + i], outBytes, outOff + resultLen);
			}

            return resultLen;
#endif
		}

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual int ProcessBytes(ReadOnlySpan<byte> input, Span<byte> output)
        {
            InitCipher();

			int len = input.Length;
            int resultLen = 0;

            for (int i = 0; i != len; i++)
            {
                resultLen += Process(input[i], output[resultLen..]);
            }

            return resultLen;
        }
#endif

        public virtual int DoFinal(byte[] outBytes, int outOff)
		{
#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
			return DoFinal(outBytes.AsSpan(outOff));
#else
			InitCipher();

            int extra = bufOff;
			byte[] tmp = new byte[bufBlock.Length];

            bufOff = 0;

			if (forEncryption)
			{
                Check.OutputLength(outBytes, outOff, extra + macSize, "output buffer too short");

                cipher.ProcessBlock(bufBlock, 0, tmp, 0);

                Array.Copy(tmp, 0, outBytes, outOff, extra);

				mac.BlockUpdate(tmp, 0, extra);

				CalculateMac();

				Array.Copy(macBlock, 0, outBytes, outOff + extra, macSize);

				Reset(false);

				return extra + macSize;
			}
			else
			{
                if (extra < macSize)
                    throw new InvalidCipherTextException("data too short");

                Check.OutputLength(outBytes, outOff, extra - macSize, "output buffer too short");

                if (extra > macSize)
				{
					mac.BlockUpdate(bufBlock, 0, extra - macSize);

					cipher.ProcessBlock(bufBlock, 0, tmp, 0);

                    Array.Copy(tmp, 0, outBytes, outOff, extra - macSize);
				}

				CalculateMac();

				if (!VerifyMac(bufBlock, extra - macSize))
					throw new InvalidCipherTextException("mac check in EAX failed");

				Reset(false);

				return extra - macSize;
			}
#endif
		}

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual int DoFinal(Span<byte> output)
		{
            InitCipher();

            int extra = bufOff;
			Span<byte> tmp = stackalloc byte[bufBlock.Length];

            bufOff = 0;

			if (forEncryption)
			{
                Check.OutputLength(output, extra + macSize, "output buffer too short");

                cipher.ProcessBlock(bufBlock, tmp);

				tmp[..extra].CopyTo(output);

				mac.BlockUpdate(tmp[..extra]);

				CalculateMac();

				macBlock.AsSpan(0, macSize).CopyTo(output[extra..]);

				Reset(false);

				return extra + macSize;
			}
			else
			{
                if (extra < macSize)
                    throw new InvalidCipherTextException("data too short");

                Check.OutputLength(output, extra - macSize, "output buffer too short");

                if (extra > macSize)
				{
					mac.BlockUpdate(bufBlock.AsSpan(0, extra - macSize));

					cipher.ProcessBlock(bufBlock, tmp);

					tmp[..(extra - macSize)].CopyTo(output);
				}

				CalculateMac();

				if (!VerifyMac(bufBlock, extra - macSize))
					throw new InvalidCipherTextException("mac check in EAX failed");

				Reset(false);

				return extra - macSize;
			}
		}
#endif

        public virtual byte[] GetMac()
		{
			byte[] mac = new byte[macSize];

			Array.Copy(macBlock, 0, mac, 0, macSize);

			return mac;
		}

        public virtual int GetUpdateOutputSize(
			int len)
		{
            int totalData = len + bufOff;
            if (!forEncryption)
            {
                if (totalData < macSize)
                {
                    return 0;
                }
                totalData -= macSize;
            }
            return totalData - totalData % blockSize;
        }

		public virtual int GetOutputSize(
			int len)
		{
            int totalData = len + bufOff;

            if (forEncryption)
            {
                return totalData + macSize;
            }

            return totalData < macSize ? 0 : totalData - macSize;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        private int Process(byte b, Span<byte> output)
        {
            bufBlock[bufOff++] = b;

            if (bufOff == bufBlock.Length)
            {
                Check.OutputLength(output, blockSize, "output buffer too short");

                // TODO Could move the ProcessByte(s) calls to here
                //InitCipher();

                int size;

                if (forEncryption)
                {
                    size = cipher.ProcessBlock(bufBlock, output);

					mac.BlockUpdate(output[..blockSize]);
                }
                else
                {
                    mac.BlockUpdate(bufBlock.AsSpan(0, blockSize));

                    size = cipher.ProcessBlock(bufBlock, output);
                }

                bufOff = 0;
                if (!forEncryption)
                {
                    Array.Copy(bufBlock, blockSize, bufBlock, 0, macSize);
                    bufOff = macSize;
                }

                return size;
            }

            return 0;
        }
#else
        private int Process(byte b, byte[] outBytes, int outOff)
        {
            bufBlock[bufOff++] = b;

			if (bufOff == bufBlock.Length)
			{
                Check.OutputLength(outBytes, outOff, blockSize, "Output buffer is too short");

                // TODO Could move the ProcessByte(s) calls to here
//                InitCipher();

				int size;

				if (forEncryption)
				{
					size = cipher.ProcessBlock(bufBlock, 0, outBytes, outOff);

					mac.BlockUpdate(outBytes, outOff, blockSize);
				}
				else
				{
					mac.BlockUpdate(bufBlock, 0, blockSize);

					size = cipher.ProcessBlock(bufBlock, 0, outBytes, outOff);
				}

                bufOff = 0;
                if (!forEncryption)
                {
                    Array.Copy(bufBlock, blockSize, bufBlock, 0, macSize);
                    bufOff = macSize;
                }

                return size;
			}

			return 0;
		}
#endif

        private bool VerifyMac(byte[] mac, int off)
		{
            int nonEqual = 0;

            for (int i = 0; i < macSize; i++)
            {
                nonEqual |= (macBlock[i] ^ mac[off + i]);
            }

            return nonEqual == 0;
		}
	}
}
