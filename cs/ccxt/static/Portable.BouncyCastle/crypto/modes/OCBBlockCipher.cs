using System;
using System.Collections.Generic;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Modes
{
    /**
     * An implementation of <a href="http://tools.ietf.org/html/rfc7253">RFC 7253 on The OCB
     * Authenticated-Encryption Algorithm</a>, licensed per:
     * 
     * <blockquote><p><a href="http://www.cs.ucdavis.edu/~rogaway/ocb/license1.pdf">License for
     * Open-Source Software Implementations of OCB</a> (Jan 9, 2013) - 'License 1'<br/>
     * Under this license, you are authorized to make, use, and distribute open-source software
     * implementations of OCB. This license terminates for you if you sue someone over their open-source
     * software implementation of OCB claiming that you have a patent covering their implementation.
     * </p><p>
     * This is a non-binding summary of a legal document (the link above). The parameters of the license
     * are specified in the license document and that document is controlling.</p></blockquote>
     */
    public class OcbBlockCipher
        : IAeadBlockCipher
    {
        private const int BLOCK_SIZE = 16;

        private readonly IBlockCipher hashCipher;
        private readonly IBlockCipher mainCipher;

        /*
         * CONFIGURATION
         */
        private bool forEncryption;
        private int macSize;
        private byte[] initialAssociatedText;

        /*
         * KEY-DEPENDENT
         */
        // NOTE: elements are lazily calculated
        private IList<byte[]> L;
        private byte[] L_Asterisk, L_Dollar;

        /*
         * NONCE-DEPENDENT
         */
        private byte[] KtopInput = null;
        private byte[] Stretch = new byte[24];
        private byte[] OffsetMAIN_0 = new byte[16];

        /*
         * PER-ENCRYPTION/DECRYPTION
         */
        private byte[] hashBlock, mainBlock;
        private int hashBlockPos, mainBlockPos;
        private long hashBlockCount, mainBlockCount;
        private byte[] OffsetHASH;
        private byte[] Sum;
        private byte[] OffsetMAIN = new byte[16];
        private byte[] Checksum;

        // NOTE: The MAC value is preserved after doFinal
        private byte[] macBlock;

        public OcbBlockCipher(IBlockCipher hashCipher, IBlockCipher mainCipher)
        {
            if (hashCipher == null)
                throw new ArgumentNullException("hashCipher");
            if (hashCipher.GetBlockSize() != BLOCK_SIZE)
                throw new ArgumentException("must have a block size of " + BLOCK_SIZE, "hashCipher");
            if (mainCipher == null)
                throw new ArgumentNullException("mainCipher");
            if (mainCipher.GetBlockSize() != BLOCK_SIZE)
                throw new ArgumentException("must have a block size of " + BLOCK_SIZE, "mainCipher");

            if (!hashCipher.AlgorithmName.Equals(mainCipher.AlgorithmName))
                throw new ArgumentException("'hashCipher' and 'mainCipher' must be the same algorithm");

            this.hashCipher = hashCipher;
            this.mainCipher = mainCipher;
        }

        public virtual string AlgorithmName => mainCipher.AlgorithmName + "/OCB";

        public virtual IBlockCipher UnderlyingCipher => mainCipher;

        public virtual void Init(bool forEncryption, ICipherParameters parameters)
        {
            bool oldForEncryption = this.forEncryption;
            this.forEncryption = forEncryption;
            this.macBlock = null;

            KeyParameter keyParameter;

            byte[] N;
            if (parameters is AeadParameters aeadParameters)
            {
                N = aeadParameters.GetNonce();
                initialAssociatedText = aeadParameters.GetAssociatedText();

                int macSizeBits = aeadParameters.MacSize;
                if (macSizeBits < 64 || macSizeBits > 128 || macSizeBits % 8 != 0)
                    throw new ArgumentException("Invalid value for MAC size: " + macSizeBits);

                macSize = macSizeBits / 8;
                keyParameter = aeadParameters.Key;
            }
            else if (parameters is ParametersWithIV parametersWithIV)
            {
                N = parametersWithIV.GetIV();
                initialAssociatedText = null;
                macSize = 16;
                keyParameter = (KeyParameter) parametersWithIV.Parameters;
            }
            else
            {
                throw new ArgumentException("invalid parameters passed to OCB");
            }

            this.hashBlock = new byte[16];
            this.mainBlock = new byte[forEncryption ? BLOCK_SIZE : (BLOCK_SIZE + macSize)];

            if (N == null)
            {
                N = new byte[0];
            }

            if (N.Length > 15)
            {
                throw new ArgumentException("IV must be no more than 15 bytes");
            }

            /*
             * KEY-DEPENDENT INITIALISATION
             */

            if (keyParameter != null)
            {
                // hashCipher always used in forward mode
                hashCipher.Init(true, keyParameter);
                mainCipher.Init(forEncryption, keyParameter);
                KtopInput = null;
            }
            else if (oldForEncryption != forEncryption)
            {
                throw new ArgumentException("cannot change encrypting state without providing key.");
            }

            this.L_Asterisk = new byte[16];
            hashCipher.ProcessBlock(L_Asterisk, 0, L_Asterisk, 0);

            this.L_Dollar = OCB_double(L_Asterisk);

            this.L = new List<byte[]>();
            this.L.Add(OCB_double(L_Dollar));

            /*
             * NONCE-DEPENDENT AND PER-ENCRYPTION/DECRYPTION INITIALISATION
             */

            int bottom = ProcessNonce(N);

            int bits = bottom % 8, bytes = bottom / 8;
            if (bits == 0)
            {
                Array.Copy(Stretch, bytes, OffsetMAIN_0, 0, 16);
            }
            else
            {
                for (int i = 0; i < 16; ++i)
                {
                    uint b1 = Stretch[bytes];
                    uint b2 = Stretch[++bytes];
                    this.OffsetMAIN_0[i] = (byte) ((b1 << bits) | (b2 >> (8 - bits)));
                }
            }

            this.hashBlockPos = 0;
            this.mainBlockPos = 0;

            this.hashBlockCount = 0;
            this.mainBlockCount = 0;

            this.OffsetHASH = new byte[16];
            this.Sum = new byte[16];
            Array.Copy(OffsetMAIN_0, 0, OffsetMAIN, 0, 16);
            this.Checksum = new byte[16];

            if (initialAssociatedText != null)
            {
                ProcessAadBytes(initialAssociatedText, 0, initialAssociatedText.Length);
            }
        }

        protected virtual int ProcessNonce(byte[] N)
        {
            byte[] nonce = new byte[16];
            Array.Copy(N, 0, nonce, nonce.Length - N.Length, N.Length);
            nonce[0] = (byte)(macSize << 4);
            nonce[15 - N.Length] |= 1;

            int bottom = nonce[15] & 0x3F;
            nonce[15] &= 0xC0;

            /*
             * When used with incrementing nonces, the cipher is only applied once every 64 inits.
             */
            if (KtopInput == null || !Arrays.AreEqual(nonce, KtopInput))
            {
                byte[] Ktop = new byte[16];
                KtopInput = nonce;
                hashCipher.ProcessBlock(KtopInput, 0, Ktop, 0);
                Array.Copy(Ktop, 0, Stretch, 0, 16);
                for (int i = 0; i < 8; ++i)
                {
                    Stretch[16 + i] = (byte)(Ktop[i] ^ Ktop[i + 1]);
                }
            }

            return bottom;
        }

        public virtual int GetBlockSize()
        {
            return BLOCK_SIZE;
        }

        public virtual byte[] GetMac()
        {
            return macBlock == null
                ? new byte[macSize]
                : Arrays.Clone(macBlock);
        }

        public virtual int GetOutputSize(int len)
        {
            int totalData = len + mainBlockPos;
            if (forEncryption)
            {
                return totalData + macSize;
            }
            return totalData < macSize ? 0 : totalData - macSize;
        }

        public virtual int GetUpdateOutputSize(int len)
        {
            int totalData = len + mainBlockPos;
            if (!forEncryption)
            {
                if (totalData < macSize)
                {
                    return 0;
                }
                totalData -= macSize;
            }
            return totalData - totalData % BLOCK_SIZE;
        }

        public virtual void ProcessAadByte(byte input)
        {
            hashBlock[hashBlockPos] = input;
            if (++hashBlockPos == hashBlock.Length)
            {
                ProcessHashBlock();
            }
        }

        public virtual void ProcessAadBytes(byte[] input, int off, int len)
        {
            for (int i = 0; i < len; ++i)
            {
                hashBlock[hashBlockPos] = input[off + i];
                if (++hashBlockPos == hashBlock.Length)
                {
                    ProcessHashBlock();
                }
            }
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual void ProcessAadBytes(ReadOnlySpan<byte> input)
        {
            for (int i = 0; i < input.Length; ++i)
            {
                hashBlock[hashBlockPos] = input[i];
                if (++hashBlockPos == hashBlock.Length)
                {
                    ProcessHashBlock();
                }
            }
        }
#endif

        public virtual int ProcessByte(byte input, byte[] output, int outOff)
        {
            mainBlock[mainBlockPos] = input;
            if (++mainBlockPos == mainBlock.Length)
            {
                ProcessMainBlock(output, outOff);
                return BLOCK_SIZE;
            }
            return 0;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual int ProcessByte(byte input, Span<byte> output)
        {
            mainBlock[mainBlockPos] = input;
            if (++mainBlockPos == mainBlock.Length)
            {
                ProcessMainBlock(output);
                return BLOCK_SIZE;
            }
            return 0;
        }
#endif

        public virtual int ProcessBytes(byte[] input, int inOff, int len, byte[] output, int outOff)
        {
#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
            return ProcessBytes(input.AsSpan(inOff, len), Spans.FromNullable(output, outOff));
#else
            int resultLen = 0;

            for (int i = 0; i < len; ++i)
            {
                mainBlock[mainBlockPos] = input[inOff + i];
                if (++mainBlockPos == mainBlock.Length)
                {
                    ProcessMainBlock(output, outOff + resultLen);
                    resultLen += BLOCK_SIZE;
                }
            }

            return resultLen;
#endif
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual int ProcessBytes(ReadOnlySpan<byte> input, Span<byte> output)
        {
            int len = input.Length;
            int resultLen = 0;

            for (int i = 0; i < len; ++i)
            {
                mainBlock[mainBlockPos] = input[i];
                if (++mainBlockPos == mainBlock.Length)
                {
                    ProcessMainBlock(output[resultLen..]);
                    resultLen += BLOCK_SIZE;
                }
            }

            return resultLen;
        }
#endif

        public virtual int DoFinal(byte[] output, int outOff)
        {
#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
            return DoFinal(output.AsSpan(outOff));
#else
            /*
             * For decryption, get the tag from the end of the message
             */
            byte[] tag = null;
            if (!forEncryption) {
                if (mainBlockPos < macSize)
                    throw new InvalidCipherTextException("data too short");

                mainBlockPos -= macSize;
                tag = new byte[macSize];
                Array.Copy(mainBlock, mainBlockPos, tag, 0, macSize);
            }

            /*
             * HASH: Process any final partial block; compute final hash value
             */
            if (hashBlockPos > 0)
            {
                OCB_extend(hashBlock, hashBlockPos);
                UpdateHASH(L_Asterisk);
            }

            /*
             * OCB-ENCRYPT/OCB-DECRYPT: Process any final partial block
             */
            if (mainBlockPos > 0)
            {
                if (forEncryption)
                {
                    OCB_extend(mainBlock, mainBlockPos);
                    Xor(Checksum, mainBlock);
                }

                Xor(OffsetMAIN, L_Asterisk);

                byte[] Pad = new byte[16];
                hashCipher.ProcessBlock(OffsetMAIN, 0, Pad, 0);

                Xor(mainBlock, Pad);

                Check.OutputLength(output, outOff, mainBlockPos, "output buffer too short");
                Array.Copy(mainBlock, 0, output, outOff, mainBlockPos);

                if (!forEncryption)
                {
                    OCB_extend(mainBlock, mainBlockPos);
                    Xor(Checksum, mainBlock);
                }
            }

            /*
             * OCB-ENCRYPT/OCB-DECRYPT: Compute raw tag
             */
            Xor(Checksum, OffsetMAIN);
            Xor(Checksum, L_Dollar);
            hashCipher.ProcessBlock(Checksum, 0, Checksum, 0);
            Xor(Checksum, Sum);

            this.macBlock = new byte[macSize];
            Array.Copy(Checksum, 0, macBlock, 0, macSize);

            /*
             * Validate or append tag and reset this cipher for the next run
             */
            int resultLen = mainBlockPos;

            if (forEncryption)
            {
                Check.OutputLength(output, outOff, resultLen + macSize, "output buffer too short");

                // Append tag to the message
                Array.Copy(macBlock, 0, output, outOff + resultLen, macSize);
                resultLen += macSize;
            }
            else
            {
                // Compare the tag from the message with the calculated one
                if (!Arrays.ConstantTimeAreEqual(macBlock, tag))
                    throw new InvalidCipherTextException("mac check in OCB failed");
            }

            Reset(false);

            return resultLen;
#endif
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual int DoFinal(Span<byte> output)
        {
            /*
             * For decryption, get the tag from the end of the message
             */
            byte[] tag = null;
            if (!forEncryption)
            {
                if (mainBlockPos < macSize)
                    throw new InvalidCipherTextException("data too short");

                mainBlockPos -= macSize;
                tag = new byte[macSize];
                Array.Copy(mainBlock, mainBlockPos, tag, 0, macSize);
            }

            /*
             * HASH: Process any final partial block; compute final hash value
             */
            if (hashBlockPos > 0)
            {
                OCB_extend(hashBlock, hashBlockPos);
                UpdateHASH(L_Asterisk);
            }

            /*
             * OCB-ENCRYPT/OCB-DECRYPT: Process any final partial block
             */
            if (mainBlockPos > 0)
            {
                if (forEncryption)
                {
                    OCB_extend(mainBlock, mainBlockPos);
                    Xor(Checksum, mainBlock);
                }

                Xor(OffsetMAIN, L_Asterisk);

                byte[] Pad = new byte[16];
                hashCipher.ProcessBlock(OffsetMAIN, 0, Pad, 0);

                Xor(mainBlock, Pad);

                Check.OutputLength(output, mainBlockPos, "output buffer too short");
                mainBlock.AsSpan(0, mainBlockPos).CopyTo(output);

                if (!forEncryption)
                {
                    OCB_extend(mainBlock, mainBlockPos);
                    Xor(Checksum, mainBlock);
                }
            }

            /*
             * OCB-ENCRYPT/OCB-DECRYPT: Compute raw tag
             */
            Xor(Checksum, OffsetMAIN);
            Xor(Checksum, L_Dollar);
            hashCipher.ProcessBlock(Checksum, 0, Checksum, 0);
            Xor(Checksum, Sum);

            this.macBlock = new byte[macSize];
            Array.Copy(Checksum, 0, macBlock, 0, macSize);

            /*
             * Validate or append tag and reset this cipher for the next run
             */
            int resultLen = mainBlockPos;

            if (forEncryption)
            {
                // Append tag to the message
                Check.OutputLength(output, resultLen + macSize, "output buffer too short");
                macBlock.AsSpan(0, macSize).CopyTo(output[resultLen..]);
                resultLen += macSize;
            }
            else
            {
                // Compare the tag from the message with the calculated one
                if (!Arrays.ConstantTimeAreEqual(macBlock, tag))
                    throw new InvalidCipherTextException("mac check in OCB failed");
            }

            Reset(false);

            return resultLen;
        }
#endif

        public virtual void Reset()
        {
            Reset(true);
        }

        protected virtual void Clear(byte[] bs)
        {
            if (bs != null)
            {
                Array.Clear(bs, 0, bs.Length);
            }
        }

        protected virtual byte[] GetLSub(int n)
        {
            while (n >= L.Count)
            {
                L.Add(OCB_double(L[L.Count - 1]));
            }
            return L[n];
        }

        protected virtual void ProcessHashBlock()
        {
            /*
             * HASH: Process any whole blocks
             */
            UpdateHASH(GetLSub(OCB_ntz(++hashBlockCount)));
            hashBlockPos = 0;
        }

        protected virtual void ProcessMainBlock(byte[] output, int outOff)
        {
            Check.DataLength(output, outOff, BLOCK_SIZE, "Output buffer too short");

            /*
             * OCB-ENCRYPT/OCB-DECRYPT: Process any whole blocks
             */

            if (forEncryption)
            {
                Xor(Checksum, mainBlock);
                mainBlockPos = 0;
            }

            Xor(OffsetMAIN, GetLSub(OCB_ntz(++mainBlockCount)));

            Xor(mainBlock, OffsetMAIN);
            mainCipher.ProcessBlock(mainBlock, 0, mainBlock, 0);
            Xor(mainBlock, OffsetMAIN);

            Array.Copy(mainBlock, 0, output, outOff, 16);

            if (!forEncryption)
            {
                Xor(Checksum, mainBlock);
                Array.Copy(mainBlock, BLOCK_SIZE, mainBlock, 0, macSize);
                mainBlockPos = macSize;
            }
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        protected virtual void ProcessMainBlock(Span<byte> output)
        {
            Check.DataLength(output, BLOCK_SIZE, "output buffer too short");

            /*
             * OCB-ENCRYPT/OCB-DECRYPT: Process any whole blocks
             */

            if (forEncryption)
            {
                Xor(Checksum, mainBlock);
                mainBlockPos = 0;
            }

            Xor(OffsetMAIN, GetLSub(OCB_ntz(++mainBlockCount)));

            Xor(mainBlock, OffsetMAIN);
            mainCipher.ProcessBlock(mainBlock, 0, mainBlock, 0);
            Xor(mainBlock, OffsetMAIN);

            mainBlock.AsSpan(0, BLOCK_SIZE).CopyTo(output);

            if (!forEncryption)
            {
                Xor(Checksum, mainBlock);
                Array.Copy(mainBlock, BLOCK_SIZE, mainBlock, 0, macSize);
                mainBlockPos = macSize;
            }
        }
#endif

        protected virtual void Reset(bool clearMac)
        {
            Clear(hashBlock);
            Clear(mainBlock);

            hashBlockPos = 0;
            mainBlockPos = 0;

            hashBlockCount = 0;
            mainBlockCount = 0;

            Clear(OffsetHASH);
            Clear(Sum);
            Array.Copy(OffsetMAIN_0, 0, OffsetMAIN, 0, 16);
            Clear(Checksum);

            if (clearMac)
            {
                macBlock = null;
            }

            if (initialAssociatedText != null)
            {
                ProcessAadBytes(initialAssociatedText, 0, initialAssociatedText.Length);
            }
        }

        protected virtual void UpdateHASH(byte[] LSub)
        {
            Xor(OffsetHASH, LSub);
            Xor(hashBlock, OffsetHASH);
            hashCipher.ProcessBlock(hashBlock, 0, hashBlock, 0);
            Xor(Sum, hashBlock);
        }

        protected static byte[] OCB_double(byte[] block)
        {
            byte[] result = new byte[16];
            int carry = ShiftLeft(block, result);

            /*
             * NOTE: This construction is an attempt at a constant-time implementation.
             */
            result[15] ^= (byte)(0x87 >> ((1 - carry) << 3));

            return result;
        }

        protected static void OCB_extend(byte[] block, int pos)
        {
            block[pos] = (byte) 0x80;
            while (++pos < 16)
            {
                block[pos] = 0;
            }
        }

        protected static int OCB_ntz(long x)
        {
            if (x == 0)
            {
                return 64;
            }

            int n = 0;
            ulong ux = (ulong)x;
            while ((ux & 1UL) == 0UL)
            {
                ++n;
                ux >>= 1;
            }
            return n;
        }

        protected static int ShiftLeft(byte[] block, byte[] output)
        {
            int i = 16;
            uint bit = 0;
            while (--i >= 0)
            {
                uint b = block[i];
                output[i] = (byte) ((b << 1) | bit);
                bit = (b >> 7) & 1;
            }
            return (int)bit;
        }

        protected static void Xor(byte[] block, byte[] val)
        {
            for (int i = 15; i >= 0; --i)
            {
                block[i] ^= val[i];
            }
        }
    }
}
