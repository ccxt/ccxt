using System;
using System.IO;

using Org.BouncyCastle.Crypto.Macs;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Modes
{
    /**
    * Implements the Counter with Cipher Block Chaining mode (CCM) detailed in
    * NIST Special Publication 800-38C.
    * <p>
    * <b>Note</b>: this mode is a packet mode - it needs all the data up front.
    * </p>
    */
    public class CcmBlockCipher
        : IAeadBlockCipher
    {
        private static readonly int BlockSize = 16;

        private readonly IBlockCipher	cipher;
        private readonly byte[]			macBlock;
        private bool					forEncryption;
        private byte[]					nonce;
        private byte[]					initialAssociatedText;
        private int						macSize;
        private ICipherParameters		keyParam;
        private readonly MemoryStream   associatedText = new MemoryStream();
        private readonly MemoryStream   data = new MemoryStream();

        /**
        * Basic constructor.
        *
        * @param cipher the block cipher to be used.
        */
        public CcmBlockCipher(
            IBlockCipher cipher)
        {
            this.cipher = cipher;
            this.macBlock = new byte[BlockSize];

            if (cipher.GetBlockSize() != BlockSize)
                throw new ArgumentException("cipher required with a block size of " + BlockSize + ".");
        }

        /**
        * return the underlying block cipher that we are wrapping.
        *
        * @return the underlying block cipher that we are wrapping.
        */
        public virtual IBlockCipher UnderlyingCipher => cipher;

        public virtual void Init(bool forEncryption, ICipherParameters parameters)
        {
            this.forEncryption = forEncryption;

            ICipherParameters cipherParameters;
            if (parameters is AeadParameters aeadParameters)
            {
                nonce = aeadParameters.GetNonce();
                initialAssociatedText = aeadParameters.GetAssociatedText();
                macSize = GetMacSize(forEncryption, aeadParameters.MacSize);
                cipherParameters = aeadParameters.Key;
            }
            else if (parameters is ParametersWithIV parametersWithIV)
            {
                nonce = parametersWithIV.GetIV();
                initialAssociatedText = null;
                macSize = GetMacSize(forEncryption, 64);
                cipherParameters = parametersWithIV.Parameters;
            }
            else
            {
                throw new ArgumentException("invalid parameters passed to CCM");
            }

            // NOTE: Very basic support for key re-use, but no performance gain from it
            if (cipherParameters != null)
            {
                keyParam = cipherParameters;
            }

            if (nonce == null || nonce.Length < 7 || nonce.Length > 13)
                throw new ArgumentException("nonce must have length from 7 to 13 octets");

            Reset();
        }

        public virtual string AlgorithmName => cipher.AlgorithmName + "/CCM";

        public virtual int GetBlockSize()
        {
            return cipher.GetBlockSize();
        }

        public virtual void ProcessAadByte(byte input)
        {
            associatedText.WriteByte(input);
        }

        public virtual void ProcessAadBytes(byte[] inBytes, int inOff, int len)
        {
            // TODO: Process AAD online
            associatedText.Write(inBytes, inOff, len);
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual void ProcessAadBytes(ReadOnlySpan<byte> input)
        {
            // TODO: Process AAD online
            associatedText.Write(input);
        }
#endif

        public virtual int ProcessByte(byte input, byte[] outBytes, int outOff)
        {
            data.WriteByte(input);

            return 0;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual int ProcessByte(byte input, Span<byte> output)
        {
            data.WriteByte(input);

            return 0;
        }
#endif

        public virtual int ProcessBytes(byte[] inBytes, int inOff, int inLen, byte[] outBytes, int outOff)
        {
            Check.DataLength(inBytes, inOff, inLen, "input buffer too short");

            data.Write(inBytes, inOff, inLen);

            return 0;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual int ProcessBytes(ReadOnlySpan<byte> input, Span<byte> output)
        {
            data.Write(input);

            return 0;
        }
#endif

        public virtual int DoFinal(byte[] outBytes, int outOff)
        {
#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
            return DoFinal(outBytes.AsSpan(outOff));
#else
            byte[] input = data.GetBuffer();
            int inLen = Convert.ToInt32(data.Length);

            int len = ProcessPacket(input, 0, inLen, outBytes, outOff);

            Reset();

            return len;
#endif
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual int DoFinal(Span<byte> output)
        {
            byte[] input = data.GetBuffer();
            int inLen = Convert.ToInt32(data.Length);

            int len = ProcessPacket(input.AsSpan(0, inLen), output);

            Reset();

            return len;
        }
#endif

        public virtual void Reset()
        {
            associatedText.SetLength(0);
            data.SetLength(0);
        }

        /**
        * Returns a byte array containing the mac calculated as part of the
        * last encrypt or decrypt operation.
        *
        * @return the last mac calculated.
        */
        public virtual byte[] GetMac()
        {
            return Arrays.CopyOfRange(macBlock, 0, macSize);
        }

        public virtual int GetUpdateOutputSize(int len)
        {
            return 0;
        }

        public virtual int GetOutputSize(int len)
        {
            int totalData = Convert.ToInt32(data.Length) + len;

            if (forEncryption)
            {
                return totalData + macSize;
            }

            return totalData < macSize ? 0 : totalData - macSize;
        }

        /**
         * Process a packet of data for either CCM decryption or encryption.
         *
         * @param in data for processing.
         * @param inOff offset at which data starts in the input array.
         * @param inLen length of the data in the input array.
         * @return a byte array containing the processed input..
         * @throws IllegalStateException if the cipher is not appropriately set up.
         * @throws InvalidCipherTextException if the input data is truncated or the mac check fails.
         */
        public virtual byte[] ProcessPacket(byte[] input, int inOff, int inLen)
        {
            byte[] output;

            if (forEncryption)
            {
                output = new byte[inLen + macSize];
            }
            else
            {
                if (inLen < macSize)
                    throw new InvalidCipherTextException("data too short");

                output = new byte[inLen - macSize];
            }

            ProcessPacket(input, inOff, inLen, output, 0);

            return output;
        }

        /**
         * Process a packet of data for either CCM decryption or encryption.
         *
         * @param in data for processing.
         * @param inOff offset at which data starts in the input array.
         * @param inLen length of the data in the input array.
         * @param output output array.
         * @param outOff offset into output array to start putting processed bytes.
         * @return the number of bytes added to output.
         * @throws IllegalStateException if the cipher is not appropriately set up.
         * @throws InvalidCipherTextException if the input data is truncated or the mac check fails.
         * @throws DataLengthException if output buffer too short.
         */
        public virtual int ProcessPacket(byte[] input, int inOff, int inLen, byte[] output, int outOff)
        {
            // TODO: handle null keyParam (e.g. via RepeatedKeySpec)
            // Need to keep the CTR and CBC Mac parts around and reset
            if (keyParam == null)
                throw new InvalidOperationException("CCM cipher unitialized.");

            int n = nonce.Length;
            int q = 15 - n;
            if (q < 4)
            {
                int limitLen = 1 << (8 * q);
                if (inLen >= limitLen)
                    throw new InvalidOperationException("CCM packet too large for choice of q.");
            }

            byte[] iv = new byte[BlockSize];
            iv[0] = (byte)((q - 1) & 0x7);
            nonce.CopyTo(iv, 1);

            IBlockCipher ctrCipher = new SicBlockCipher(cipher);
            ctrCipher.Init(forEncryption, new ParametersWithIV(keyParam, iv));

            int outputLen;
            int inIndex = inOff;
            int outIndex = outOff;

            if (forEncryption)
            {
                outputLen = inLen + macSize;
                Check.OutputLength(output, outOff, outputLen, "Output buffer too short.");

                CalculateMac(input, inOff, inLen, macBlock);

                byte[] encMac = new byte[BlockSize];
                ctrCipher.ProcessBlock(macBlock, 0, encMac, 0);   // S0

                while (inIndex < (inOff + inLen - BlockSize))                 // S1...
                {
                    ctrCipher.ProcessBlock(input, inIndex, output, outIndex);
                    outIndex += BlockSize;
                    inIndex += BlockSize;
                }

                byte[] block = new byte[BlockSize];

                Array.Copy(input, inIndex, block, 0, inLen + inOff - inIndex);

                ctrCipher.ProcessBlock(block, 0, block, 0);

                Array.Copy(block, 0, output, outIndex, inLen + inOff - inIndex);

                Array.Copy(encMac, 0, output, outOff + inLen, macSize);
            }
            else
            {
                if (inLen < macSize)
                    throw new InvalidCipherTextException("data too short");

                outputLen = inLen - macSize;
                Check.OutputLength(output, outOff, outputLen, "Output buffer too short.");

                Array.Copy(input, inOff + outputLen, macBlock, 0, macSize);

                ctrCipher.ProcessBlock(macBlock, 0, macBlock, 0);

                for (int i = macSize; i != macBlock.Length; i++)
                {
                    macBlock[i] = 0;
                }

                while (inIndex < (inOff + outputLen - BlockSize))
                {
                    ctrCipher.ProcessBlock(input, inIndex, output, outIndex);
                    outIndex += BlockSize;
                    inIndex += BlockSize;
                }

                byte[] block = new byte[BlockSize];

                Array.Copy(input, inIndex, block, 0, outputLen - (inIndex - inOff));

                ctrCipher.ProcessBlock(block, 0, block, 0);

                Array.Copy(block, 0, output, outIndex, outputLen - (inIndex - inOff));

                byte[] calculatedMacBlock = new byte[BlockSize];

                CalculateMac(output, outOff, outputLen, calculatedMacBlock);

                if (!Arrays.ConstantTimeAreEqual(macBlock, calculatedMacBlock))
                    throw new InvalidCipherTextException("mac check in CCM failed");
            }

            return outputLen;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual int ProcessPacket(ReadOnlySpan<byte> input, Span<byte> output)
        {
            int inLen = input.Length;

            // TODO: handle null keyParam (e.g. via RepeatedKeySpec)
            // Need to keep the CTR and CBC Mac parts around and reset
            if (keyParam == null)
                throw new InvalidOperationException("CCM cipher unitialized.");

            int n = nonce.Length;
            int q = 15 - n;
            if (q < 4)
            {
                int limitLen = 1 << (8 * q);
                if (inLen >= limitLen)
                    throw new InvalidOperationException("CCM packet too large for choice of q.");
            }

            byte[] iv = new byte[BlockSize];
            iv[0] = (byte)((q - 1) & 0x7);
            nonce.CopyTo(iv, 1);

            IBlockCipher ctrCipher = new SicBlockCipher(cipher);
            ctrCipher.Init(forEncryption, new ParametersWithIV(keyParam, iv));

            int outputLen;
            int index = 0;
            Span<byte> block = stackalloc byte[BlockSize];

            if (forEncryption)
            {
                outputLen = inLen + macSize;
                Check.OutputLength(output, outputLen, "output buffer too short");

                CalculateMac(input, macBlock);

                byte[] encMac = new byte[BlockSize];
                ctrCipher.ProcessBlock(macBlock, encMac);   // S0

                while (index < (inLen - BlockSize))                 // S1...
                {
                    ctrCipher.ProcessBlock(input[index..], output[index..]);
                    index += BlockSize;
                }

                input[index..].CopyTo(block);

                ctrCipher.ProcessBlock(block, block);

                block[..(inLen - index)].CopyTo(output[index..]);

                encMac.AsSpan(0, macSize).CopyTo(output[inLen..]);
            }
            else
            {
                if (inLen < macSize)
                    throw new InvalidCipherTextException("data too short");

                outputLen = inLen - macSize;
                Check.OutputLength(output, outputLen, "output buffer too short");

                input[outputLen..].CopyTo(macBlock);

                ctrCipher.ProcessBlock(macBlock, macBlock);

                for (int i = macSize; i != macBlock.Length; i++)
                {
                    macBlock[i] = 0;
                }

                while (index < (outputLen - BlockSize))
                {
                    ctrCipher.ProcessBlock(input[index..], output[index..]);
                    index += BlockSize;
                }

                input[index..outputLen].CopyTo(block);

                ctrCipher.ProcessBlock(block, block);

                block[..(outputLen - index)].CopyTo(output[index..]);

                Span<byte> calculatedMacBlock = stackalloc byte[BlockSize];

                CalculateMac(output[..outputLen], calculatedMacBlock);

                if (!Arrays.ConstantTimeAreEqual(macBlock, calculatedMacBlock))
                    throw new InvalidCipherTextException("mac check in CCM failed");
            }

            return outputLen;
        }
#endif

        private int CalculateMac(byte[] data, int dataOff, int dataLen, byte[] macBlock)
        {
#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
            return CalculateMac(data.AsSpan(dataOff, dataLen), macBlock);
#else
            IMac cMac = new CbcBlockCipherMac(cipher, macSize * 8);

            cMac.Init(keyParam);

            //
            // build b0
            //
            byte[] b0 = new byte[16];

            if (HasAssociatedText())
            {
                b0[0] |= 0x40;
            }

            b0[0] |= (byte)((((cMac.GetMacSize() - 2) / 2) & 0x7) << 3);

            b0[0] |= (byte)(((15 - nonce.Length) - 1) & 0x7);

            Array.Copy(nonce, 0, b0, 1, nonce.Length);

            int q = dataLen;
            int count = 1;
            while (q > 0)
            {
                b0[b0.Length - count] = (byte)(q & 0xff);
                q >>= 8;
                count++;
            }

            cMac.BlockUpdate(b0, 0, b0.Length);

            //
            // process associated text
            //
            if (HasAssociatedText())
            {
                int extra;

                int textLength = GetAssociatedTextLength();
                if (textLength < ((1 << 16) - (1 << 8)))
                {
                    cMac.Update((byte)(textLength >> 8));
                    cMac.Update((byte)textLength);

                    extra = 2;
                }
                else // can't go any higher than 2^32
                {
                    cMac.Update((byte)0xff);
                    cMac.Update((byte)0xfe);
                    cMac.Update((byte)(textLength >> 24));
                    cMac.Update((byte)(textLength >> 16));
                    cMac.Update((byte)(textLength >> 8));
                    cMac.Update((byte)textLength);

                    extra = 6;
                }

                if (initialAssociatedText != null)
                {
                    cMac.BlockUpdate(initialAssociatedText, 0, initialAssociatedText.Length);
                }
                if (associatedText.Length > 0)
                {
                    byte[] input = associatedText.GetBuffer();
                    int len = Convert.ToInt32(associatedText.Length);

                    cMac.BlockUpdate(input, 0, len);
                }

                extra = (extra + textLength) % 16;
                if (extra != 0)
                {
                    for (int i = extra; i < 16; ++i)
                    {
                        cMac.Update((byte)0x00);
                    }
                }
            }

            //
            // add the text
            //
            cMac.BlockUpdate(data, dataOff, dataLen);

            return cMac.DoFinal(macBlock, 0);
#endif
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        private int CalculateMac(ReadOnlySpan<byte> data, Span<byte> macBlock)
        {
            IMac cMac = new CbcBlockCipherMac(cipher, macSize * 8);

            cMac.Init(keyParam);

            //
            // build b0
            //
            byte[] b0 = new byte[16];

            if (HasAssociatedText())
            {
                b0[0] |= 0x40;
            }

            b0[0] |= (byte)((((cMac.GetMacSize() - 2) / 2) & 0x7) << 3);

            b0[0] |= (byte)(((15 - nonce.Length) - 1) & 0x7);

            Array.Copy(nonce, 0, b0, 1, nonce.Length);

            int q = data.Length;
            int count = 1;
            while (q > 0)
            {
                b0[b0.Length - count] = (byte)(q & 0xff);
                q >>= 8;
                count++;
            }

            cMac.BlockUpdate(b0, 0, b0.Length);

            //
            // process associated text
            //
            if (HasAssociatedText())
            {
                int extra;

                int textLength = GetAssociatedTextLength();
                if (textLength < ((1 << 16) - (1 << 8)))
                {
                    cMac.Update((byte)(textLength >> 8));
                    cMac.Update((byte)textLength);

                    extra = 2;
                }
                else // can't go any higher than 2^32
                {
                    cMac.Update((byte)0xff);
                    cMac.Update((byte)0xfe);
                    cMac.Update((byte)(textLength >> 24));
                    cMac.Update((byte)(textLength >> 16));
                    cMac.Update((byte)(textLength >> 8));
                    cMac.Update((byte)textLength);

                    extra = 6;
                }

                if (initialAssociatedText != null)
                {
                    cMac.BlockUpdate(initialAssociatedText, 0, initialAssociatedText.Length);
                }
                if (associatedText.Length > 0)
                {
                    byte[] input = associatedText.GetBuffer();
                    int len = Convert.ToInt32(associatedText.Length);

                    cMac.BlockUpdate(input, 0, len);
                }

                extra = (extra + textLength) % 16;
                if (extra != 0)
                {
                    for (int i = extra; i < 16; ++i)
                    {
                        cMac.Update((byte)0x00);
                    }
                }
            }

            //
            // add the text
            //
            cMac.BlockUpdate(data);

            return cMac.DoFinal(macBlock);
        }
#endif

        private int GetMacSize(bool forEncryption, int requestedMacBits)
        {
            if (forEncryption && (requestedMacBits < 32 || requestedMacBits > 128 || 0 != (requestedMacBits & 15)))
                throw new ArgumentException("tag length in octets must be one of {4,6,8,10,12,14,16}");

            return requestedMacBits >> 3;
        }

        private int GetAssociatedTextLength()
        {
            return Convert.ToInt32(associatedText.Length) +
                (initialAssociatedText == null ? 0 : initialAssociatedText.Length);
        }

        private bool HasAssociatedText()
        {
            return GetAssociatedTextLength() > 0;
        }
    }
}
