using System;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto.Utilities;

namespace Org.BouncyCastle.Crypto.Modes
{
	/**
	* implements the GOST 28147 OFB counter mode (GCTR).
	*/
	public class GOfbBlockCipher
		: IBlockCipherMode
    {
		private byte[]	IV;
		private byte[]	ofbV;
		private byte[]	ofbOutV;

		private readonly int			blockSize;
		private readonly IBlockCipher	cipher;

		bool firstStep = true;
		int N3;
		int N4;
		const int C1 = 16843012; //00000001000000010000000100000100
		const int C2 = 16843009; //00000001000000010000000100000001

		/**
		* Basic constructor.
		*
		* @param cipher the block cipher to be used as the basis of the
		* counter mode (must have a 64 bit block size).
		*/
		public GOfbBlockCipher(
			IBlockCipher cipher)
		{
			this.cipher = cipher;
			this.blockSize = cipher.GetBlockSize();

			if (blockSize != 8)
			{
				throw new ArgumentException("GCTR only for 64 bit block ciphers");
			}

			this.IV = new byte[cipher.GetBlockSize()];
			this.ofbV = new byte[cipher.GetBlockSize()];
			this.ofbOutV = new byte[cipher.GetBlockSize()];
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
		* @param encrypting if true the cipher is initialised for
		*  encryption, if false for decryption.
		* @param parameters the key and other data required by the cipher.
		* @exception ArgumentException if the parameters argument is inappropriate.
		*/
		public void Init(
			bool				forEncryption, //ignored by this CTR mode
			ICipherParameters	parameters)
		{
			firstStep = true;
			N3 = 0;
			N4 = 0;

			if (parameters is ParametersWithIV)
			{
				ParametersWithIV ivParam = (ParametersWithIV)parameters;
				byte[]      iv = ivParam.GetIV();

				if (iv.Length < IV.Length)
				{
					// prepend the supplied IV with zeros (per FIPS PUB 81)
					Array.Copy(iv, 0, IV, IV.Length - iv.Length, iv.Length);
					for (int i = 0; i < IV.Length - iv.Length; i++)
					{
						IV[i] = 0;
					}
				}
				else
				{
					Array.Copy(iv, 0, IV, 0, IV.Length);
				}

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
		* @return the name of the underlying algorithm followed by "/GCTR"
		* and the block size in bits
		*/
		public string AlgorithmName
		{
			get { return cipher.AlgorithmName + "/GCTR"; }
		}

		public bool IsPartialBlockOkay
		{
			get { return true; }
		}

		/**
		* return the block size we are operating at (in bytes).
		*
		* @return the block size we are operating at (in bytes).
		*/
		public int GetBlockSize()
		{
			return blockSize;
		}

		public int ProcessBlock(byte[] input, int inOff, byte[]	output, int outOff)
		{
			Check.DataLength(input, inOff, blockSize, "input buffer too short");
			Check.OutputLength(output, outOff, blockSize, "output buffer too short");

			if (firstStep)
			{
				firstStep = false;
				cipher.ProcessBlock(ofbV, 0, ofbOutV, 0);
				N3 = (int)Pack.LE_To_UInt32(ofbOutV, 0);
				N4 = (int)Pack.LE_To_UInt32(ofbOutV, 4);
			}
			N3 += C2;
			N4 += C1;
            if (N4 < C1)  // addition is mod (2**32 - 1)
            {
                if (N4 > 0)
                {
                    N4++;
                }
            }
			Pack.UInt32_To_LE((uint)N3, ofbV, 0);
			Pack.UInt32_To_LE((uint)N4, ofbV, 4);

			cipher.ProcessBlock(ofbV, 0, ofbOutV, 0);

			//
			// XOR the ofbV with the plaintext producing the cipher text (and
			// the next input block).
			//
			for (int i = 0; i < blockSize; i++)
			{
				output[outOff + i] = (byte)(ofbOutV[i] ^ input[inOff + i]);
			}

			//
			// change over the input block.
			//
			Array.Copy(ofbV, blockSize, ofbV, 0, ofbV.Length - blockSize);
			Array.Copy(ofbOutV, 0, ofbV, ofbV.Length - blockSize, blockSize);

			return blockSize;
		}

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
		public int ProcessBlock(ReadOnlySpan<byte> input, Span<byte> output)
		{
			Check.DataLength(input, blockSize, "input buffer too short");
			Check.OutputLength(output, blockSize, "output buffer too short");

			if (firstStep)
			{
				firstStep = false;
				cipher.ProcessBlock(ofbV, ofbOutV);
				N3 = (int)Pack.LE_To_UInt32(ofbOutV, 0);
				N4 = (int)Pack.LE_To_UInt32(ofbOutV, 4);
			}
			N3 += C2;
			N4 += C1;
			if (N4 < C1)  // addition is mod (2**32 - 1)
			{
				if (N4 > 0)
				{
					N4++;
				}
			}
			Pack.UInt32_To_LE((uint)N3, ofbV, 0);
			Pack.UInt32_To_LE((uint)N4, ofbV, 4);

			cipher.ProcessBlock(ofbV, ofbOutV);

			//
			// XOR the ofbV with the plaintext producing the cipher text (and
			// the next input block).
			//
			for (int i = 0; i < blockSize; i++)
			{
				output[i] = (byte)(ofbOutV[i] ^ input[i]);
			}

			//
			// change over the input block.
			//
			Array.Copy(ofbV, blockSize, ofbV, 0, ofbV.Length - blockSize);
			Array.Copy(ofbOutV, 0, ofbV, ofbV.Length - blockSize, blockSize);

			return blockSize;
		}
#endif

		/**
		* reset the feedback vector back to the IV and reset the underlying
		* cipher.
		*/
		public void Reset()
		{
			Array.Copy(IV, 0, ofbV, 0, IV.Length);
		}
	}
}
