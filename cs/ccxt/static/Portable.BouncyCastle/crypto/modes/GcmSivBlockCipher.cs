using System;
using System.IO;

using Org.BouncyCastle.Crypto.Modes.Gcm;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.IO;

namespace Org.BouncyCastle.Crypto.Modes
{
    /**
     * GCM-SIV Mode.
     * <p>It should be noted that the specified limit of 2<sup>36</sup> bytes is not supported. This is because all bytes are
     * cached in a <b>ByteArrayOutputStream</b> object (which has a limit of a little less than 2<sup>31</sup> bytes),
     * and are output on the <b>DoFinal</b>() call (which can only process a maximum of 2<sup>31</sup> bytes).</p>
     * <p>The practical limit of 2<sup>31</sup> - 24 bytes is policed, and attempts to breach the limit will be rejected</p>
     * <p>In order to properly support the higher limit, an extended form of <b>ByteArrayOutputStream</b> would be needed
     * which would use multiple arrays to store the data. In addition, a new <b>doOutput</b> method would be required (similar
     * to that in <b>XOF</b> digests), which would allow the data to be output over multiple calls. Alternatively an extended
     * form of <b>ByteArrayInputStream</b> could be used to deliver the data.</p>
     */
    public class GcmSivBlockCipher
        : IAeadBlockCipher
    {
        /// <summary>The buffer length.</summary>
        private static readonly int BUFLEN = 16;

        /// <summary>The halfBuffer length.</summary>
        private static readonly int HALFBUFLEN = BUFLEN >> 1;

        /// <summary>The nonce length.</summary>
        private static readonly int NONCELEN = 12;

        /**
        * The maximum data length (AEAD/PlainText). Due to implementation constraints this is restricted to the maximum
        * array length (https://programming.guide/java/array-maximum-length.html) minus the BUFLEN to allow for the MAC
        */
        private static readonly int MAX_DATALEN = int.MaxValue - 8 - BUFLEN;

        /**
        * The top bit mask.
        */
        private static readonly byte MASK = 0x80;

        /**
        * The addition constant.
        */
        private static readonly byte ADD = 0xE1;

        /**
        * The initialisation flag.
        */
        private static readonly int INIT = 1;

        /**
        * The aeadComplete flag.
        */
        private static readonly int AEAD_COMPLETE = 2;

        /**
        * The cipher.
        */
        private readonly IBlockCipher theCipher;

        /**
        * The multiplier.
        */
        private readonly IGcmMultiplier theMultiplier;

        /**
        * The gHash buffer.
        */
        internal readonly byte[] theGHash = new byte[BUFLEN];

        /**
        * The reverse buffer.
        */
        internal readonly byte[] theReverse = new byte[BUFLEN];

        /**
        * The aeadHasher.
        */
        private readonly GcmSivHasher theAEADHasher;

        /**
        * The dataHasher.
        */
        private readonly GcmSivHasher theDataHasher;

        /**
        * The plainDataStream.
        */
        private GcmSivCache thePlain;

        /**
        * The encryptedDataStream (decryption only).
        */
        private GcmSivCache theEncData;

        /**
        * Are we encrypting?
        */
        private bool forEncryption;

        /**
        * The initialAEAD.
        */
        private byte[] theInitialAEAD;

        /**
        * The nonce.
        */
        private byte[] theNonce;

        /**
        * The flags.
        */
        private int theFlags;

        /**
        * Constructor.
        */
        public GcmSivBlockCipher()
            : this(AesUtilities.CreateEngine())
        {
        }

        /**
        * Constructor.
        * @param pCipher the underlying cipher
        */
        public GcmSivBlockCipher(IBlockCipher pCipher)
            : this(pCipher, new Tables4kGcmMultiplier())
        {
        }

        /**
        * Constructor.
        * @param pCipher the underlying cipher
        * @param pMultiplier the multiplier
        */
        public GcmSivBlockCipher(IBlockCipher pCipher, IGcmMultiplier pMultiplier)
        {
            /* Ensure that the cipher is the correct size */
            if (pCipher.GetBlockSize() != BUFLEN)
                throw new ArgumentException("Cipher required with a block size of " + BUFLEN + ".");

            /* Store parameters */
            theCipher = pCipher;
            theMultiplier = pMultiplier;

            /* Create the hashers */
            theAEADHasher = new GcmSivHasher(this);
            theDataHasher = new GcmSivHasher(this);
        }

        public virtual IBlockCipher UnderlyingCipher => theCipher;

        public virtual int GetBlockSize()
        {
            return theCipher.GetBlockSize();
        }

        public virtual void Init(bool pEncrypt, ICipherParameters cipherParameters)
        {
            /* Set defaults */
            byte[] myInitialAEAD = null;
            byte[] myNonce;
            KeyParameter myKey;

            /* Access parameters */
            if (cipherParameters is AeadParameters)
            {
                AeadParameters myAEAD = (AeadParameters)cipherParameters;
                myInitialAEAD = myAEAD.GetAssociatedText();
                myNonce = myAEAD.GetNonce();
                myKey = myAEAD.Key;
            }
            else if (cipherParameters is ParametersWithIV)
            {
                ParametersWithIV myParms = (ParametersWithIV)cipherParameters;
                myNonce = myParms.GetIV();
                myKey = (KeyParameter)myParms.Parameters;
            }
            else
            {
                throw new ArgumentException("invalid parameters passed to GCM_SIV");
            }

            /* Check nonceSize */
            if (myNonce == null || myNonce.Length != NONCELEN)
            {
                throw new ArgumentException("Invalid nonce");
            }

            /* Check keysize */
            if (myKey == null)
            {
                throw new ArgumentException("Invalid key");
            }

            byte[] k = myKey.GetKey();

            if (k.Length != BUFLEN && k.Length != (BUFLEN << 1))
            {
                throw new ArgumentException("Invalid key");
            }

            /* Reset details */
            forEncryption = pEncrypt;
            theInitialAEAD = myInitialAEAD;
            theNonce = myNonce;

            /* Initialise the keys */
            DeriveKeys(myKey);
            ResetStreams();
        }

        public virtual string AlgorithmName => theCipher.AlgorithmName + "-GCM-SIV";

        /**
        * check AEAD status.
        * @param pLen the aeadLength
        */
        private void CheckAeadStatus(int pLen)
        {
            /* Check we are initialised */
            if ((theFlags & INIT) == 0)
            {
                throw new InvalidOperationException("Cipher is not initialised");
            }

            /* Check AAD is allowed */
            if ((theFlags & AEAD_COMPLETE) != 0)
            {
                throw new InvalidOperationException("AEAD data cannot be processed after ordinary data");
            }

            /* Make sure that we haven't breached AEAD data limit */
            if ((long)theAEADHasher.getBytesProcessed() + long.MinValue > (MAX_DATALEN - pLen) + long.MinValue)
            {
                throw new InvalidOperationException("AEAD byte count exceeded");
            }
        }

        /**
        * check status.
        * @param pLen the dataLength
        */
        private void CheckStatus(int pLen)
        {
            /* Check we are initialised */
            if ((theFlags & INIT) == 0)
            {
                throw new InvalidOperationException("Cipher is not initialised");
            }

            /* Complete the AEAD section if this is the first data */
            if ((theFlags & AEAD_COMPLETE) == 0)
            {
                theAEADHasher.completeHash();
                theFlags |= AEAD_COMPLETE;
            }

            /* Make sure that we haven't breached data limit */
            long dataLimit = MAX_DATALEN;
            long currBytes = thePlain.Length;
            if (!forEncryption)
            {
                dataLimit += BUFLEN;
                currBytes = theEncData.Length;
            }
            if (currBytes + long.MinValue > (dataLimit - pLen) + long.MinValue)
            {
                throw new InvalidOperationException("byte count exceeded");
            }
        }

        public virtual void ProcessAadByte(byte pByte)
        {
            /* Check that we can supply AEAD */
            CheckAeadStatus(1);

            /* Process the aead */
            theAEADHasher.UpdateHash(pByte);
        }

        public virtual void ProcessAadBytes(byte[] pData, int pOffset, int pLen)
        {
            Check.DataLength(pData, pOffset, pLen, "input buffer too short");

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
            ProcessAadBytes(pData.AsSpan(pOffset, pLen));
#else
            /* Check that we can supply AEAD */
            CheckAeadStatus(pLen);

            /* Process the aead */
            theAEADHasher.UpdateHash(pData, pOffset, pLen);
#endif
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual void ProcessAadBytes(ReadOnlySpan<byte> input)
        {
            /* Check that we can supply AEAD */
            CheckAeadStatus(input.Length);

            /* Process the aead */
            theAEADHasher.UpdateHash(input);
        }
#endif

        public virtual int ProcessByte(byte pByte, byte[] pOutput, int pOutOffset)
        {
            /* Check that we have initialised */
            CheckStatus(1);

            /* Store the data */
            if (forEncryption)
            {
                thePlain.WriteByte(pByte);
                theDataHasher.UpdateHash(pByte);
            }
            else
            {
                theEncData.WriteByte(pByte);
            }

            /* No data returned */
            return 0;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual int ProcessByte(byte input, Span<byte> output)
        {
            /* Check that we have initialised */
            CheckStatus(1);

            /* Store the data */
            if (forEncryption)
            {
                thePlain.WriteByte(input);
                theDataHasher.UpdateHash(input);
            }
            else
            {
                theEncData.WriteByte(input);
            }

            /* No data returned */
            return 0;
        }
#endif

        public virtual int ProcessBytes(byte[] pData, int pOffset, int pLen, byte[] pOutput, int pOutOffset)
        {
            Check.DataLength(pData, pOffset, pLen, "input buffer too short");

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
            return ProcessBytes(pData.AsSpan(pOffset, pLen), Spans.FromNullable(pOutput, pOutOffset));
#else
            /* Check that we have initialised */
            CheckStatus(pLen);

            /* Store the data */
            if (forEncryption)
            {
                thePlain.Write(pData, pOffset, pLen);
                theDataHasher.UpdateHash(pData, pOffset, pLen);
            }
            else
            {
                theEncData.Write(pData, pOffset, pLen);
            }

            /* No data returned */
            return 0;
#endif
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual int ProcessBytes(ReadOnlySpan<byte> input, Span<byte> output)
        {
            /* Check that we have initialised */
            CheckStatus(input.Length);

            /* Store the data */
            if (forEncryption)
            {
                thePlain.Write(input);
                theDataHasher.UpdateHash(input);
            }
            else
            {
                theEncData.Write(input);
            }

            /* No data returned */
            return 0;
        }
#endif

        public virtual int DoFinal(byte[] pOutput, int pOffset)
        {
            Check.OutputLength(pOutput, pOffset, GetOutputSize(0), "output buffer too short");

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
            return DoFinal(pOutput.AsSpan(pOffset));
#else
            /* Check that we have initialised */
            CheckStatus(0);

            /* If we are encrypting */
            if (forEncryption)
            {
                /* Derive the tag */
                byte[] myTag = CalculateTag();

                /* encrypt the plain text */
                int myDataLen = BUFLEN + EncryptPlain(myTag, pOutput, pOffset);

                /* Add the tag to the output */
                Array.Copy(myTag, 0, pOutput, pOffset + Convert.ToInt32(thePlain.Length), BUFLEN);

                /* Reset the streams */
                ResetStreams();
                return myDataLen;

                /* else we are decrypting */
            }
            else
            {
                /* decrypt to plain text */
                DecryptPlain();

                /* Release plain text */
                int myDataLen = Streams.WriteBufTo(thePlain, pOutput, pOffset);

                /* Reset the streams */
                ResetStreams();
                return myDataLen;
            }
#endif
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual int DoFinal(Span<byte> output)
        {
            /* Check that we have initialised */
            CheckStatus(0);

            Check.OutputLength(output, GetOutputSize(0), "output buffer too short");

            /* If we are encrypting */
            if (forEncryption)
            {
                /* Derive the tag */
                byte[] myTag = CalculateTag();

                /* encrypt the plain text */
                int myDataLen = BUFLEN + EncryptPlain(myTag, output);

                /* Add the tag to the output */
                myTag.AsSpan(0, BUFLEN).CopyTo(output[Convert.ToInt32(thePlain.Length)..]);

                /* Reset the streams */
                ResetStreams();
                return myDataLen;

                /* else we are decrypting */
            }
            else
            {
                /* decrypt to plain text */
                DecryptPlain();

                /* Release plain text */
                if (!thePlain.TryGetBuffer(out var buffer))
                    throw new InvalidOperationException();

                buffer.AsSpan().CopyTo(output);
                int myDataLen = buffer.Count;

                /* Reset the streams */
                ResetStreams();
                return myDataLen;
            }
        }
#endif

        public virtual byte[] GetMac()
        {
            throw new InvalidOperationException();
        }

        public virtual int GetUpdateOutputSize(int pLen)
        {
            return 0;
        }

        public virtual int GetOutputSize(int pLen)
        {
            if (forEncryption)
            {
                return pLen + Convert.ToInt32(thePlain.Length) + BUFLEN;
            }
            int myCurr = pLen + Convert.ToInt32(theEncData.Length);
            return myCurr > BUFLEN ? myCurr - BUFLEN : 0;
        }

        public virtual void Reset()
        {
            ResetStreams();
        }

        /**
        * Reset Streams.
        */
        private void ResetStreams()
        {
            /* Clear the plainText buffer */
            if (thePlain != null)
            {
                int count = Convert.ToInt32(thePlain.Length);
                Array.Clear(thePlain.GetBuffer(), 0, count);
                thePlain.SetLength(0);
            }

            /* Reset hashers */
            theAEADHasher.Reset();
            theDataHasher.Reset();

            /* Recreate streams (to release memory) */
            thePlain = new GcmSivCache();
            theEncData = forEncryption ? null : new GcmSivCache();

            /* Initialise AEAD if required */
            theFlags &= ~AEAD_COMPLETE;
            Arrays.Fill(theGHash, (byte)0);
            if (theInitialAEAD != null)
            {
                theAEADHasher.UpdateHash(theInitialAEAD, 0, theInitialAEAD.Length);
            }
        }

        /**
        * Obtain buffer length (allowing for null).
        * @param pBuffer the buffere
        * @return the length
        */
        private static int bufLength(byte[] pBuffer)
        {
            return pBuffer == null ? 0 : pBuffer.Length;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        private int EncryptPlain(byte[] pCounter, Span<byte> target)
        {
            byte[] thePlainBuf = thePlain.GetBuffer();
            int thePlainLen = Convert.ToInt32(thePlain.Length);

            byte[] mySrc = thePlainBuf;
            byte[] myCounter = Arrays.Clone(pCounter);
            myCounter[BUFLEN - 1] |= MASK;
            byte[] myMask = new byte[BUFLEN];
            long myRemaining = thePlainLen;
            int myOff = 0;

            /* While we have data to process */
            while (myRemaining > 0)
            {
                /* Generate the next mask */
                theCipher.ProcessBlock(myCounter, 0, myMask, 0);

                /* Xor data into mask */
                int myLen = (int)System.Math.Min(BUFLEN, myRemaining);
                xorBlock(myMask, mySrc, myOff, myLen);

                /* Copy encrypted data to output */
                myMask.AsSpan(0, myLen).CopyTo(target[myOff..]);

                /* Adjust counters */
                myRemaining -= myLen;
                myOff += myLen;
                incrementCounter(myCounter);
            }

            /* Return the amount of data processed */
            return thePlainLen;
        }
#else
        private int EncryptPlain(byte[] pCounter, byte[] pTarget, int pOffset)
        {
            byte[] thePlainBuf = thePlain.GetBuffer();
            int thePlainLen = Convert.ToInt32(thePlain.Length);

            byte[] mySrc = thePlainBuf;
            byte[] myCounter = Arrays.Clone(pCounter);
            myCounter[BUFLEN - 1] |= MASK;
            byte[] myMask = new byte[BUFLEN];
            long myRemaining = thePlainLen;
            int myOff = 0;

            /* While we have data to process */
            while (myRemaining > 0)
            {
                /* Generate the next mask */
                theCipher.ProcessBlock(myCounter, 0, myMask, 0);

                /* Xor data into mask */
                int myLen = (int)System.Math.Min(BUFLEN, myRemaining);
                xorBlock(myMask, mySrc, myOff, myLen);

                /* Copy encrypted data to output */
                Array.Copy(myMask, 0, pTarget, pOffset + myOff, myLen);

                /* Adjust counters */
                myRemaining -= myLen;
                myOff += myLen;
                incrementCounter(myCounter);
            }

            /* Return the amount of data processed */
            return thePlainLen;
        }
#endif

        private void DecryptPlain()
        {
            byte[] theEncDataBuf = theEncData.GetBuffer();
            int theEncDataLen = Convert.ToInt32(theEncData.Length);

            byte[] mySrc = theEncDataBuf;
            int myRemaining = theEncDataLen - BUFLEN;

            /* Check for insufficient data */
            if (myRemaining < 0)
            {
                throw new InvalidCipherTextException("Data too short");
            }

            /* Access counter */
            byte[] myExpected = Arrays.CopyOfRange(mySrc, myRemaining, myRemaining + BUFLEN);
            byte[] myCounter = Arrays.Clone(myExpected);
            myCounter[BUFLEN - 1] |= MASK;
            byte[] myMask = new byte[BUFLEN];
            int myOff = 0;

            /* While we have data to process */
            while (myRemaining > 0)
            {
                /* Generate the next mask */
                theCipher.ProcessBlock(myCounter, 0, myMask, 0);

                /* Xor data into mask */
                int myLen = System.Math.Min(BUFLEN, myRemaining);
                xorBlock(myMask, mySrc, myOff, myLen);

                /* Write data to plain dataStream */
                thePlain.Write(myMask, 0, myLen);
                theDataHasher.UpdateHash(myMask, 0, myLen);

                /* Adjust counters */
                myRemaining -= myLen;
                myOff += myLen;
                incrementCounter(myCounter);
            }

            /* Derive and check the tag */
            byte[] myTag = CalculateTag();
            if (!Arrays.ConstantTimeAreEqual(myTag, myExpected))
            {
                Reset();
                throw new InvalidCipherTextException("mac check failed");
            }
        }

        /**
        * calculate tag.
        * @return the calculated tag
        */
        private byte[] CalculateTag()
        {
            /* Complete the hash */
            theDataHasher.completeHash();
            byte[] myPolyVal = completePolyVal();

            /* calculate polyVal */
            byte[] myResult = new byte[BUFLEN];

            /* Fold in the nonce */
            for (int i = 0; i < NONCELEN; i++)
            {
                myPolyVal[i] ^= theNonce[i];
            }

            /* Clear top bit */
            myPolyVal[BUFLEN - 1] &= (byte)(MASK - 1);

            /* Calculate tag and return it */
            theCipher.ProcessBlock(myPolyVal, 0, myResult, 0);
            return myResult;
        }

        /**
        * complete polyVAL.
        * @return the calculated value
        */
        private byte[] completePolyVal()
        {
            /* Build the polyVal result */
            byte[] myResult = new byte[BUFLEN];
            gHashLengths();
            fillReverse(theGHash, 0, BUFLEN, myResult);
            return myResult;
        }

        /**
        * process lengths.
        */
        private void gHashLengths()
        {
            /* Create reversed bigEndian buffer to keep it simple */
            byte[] myIn = new byte[BUFLEN];
            Pack.UInt64_To_BE((ulong)Bytes.NumBits * theDataHasher.getBytesProcessed(), myIn, 0);
            Pack.UInt64_To_BE((ulong)Bytes.NumBits * theAEADHasher.getBytesProcessed(), myIn, Longs.NumBytes);

            /* hash value */
            gHASH(myIn);
        }

        /**
        * perform the next GHASH step.
        * @param pNext the next value
        */
        private void gHASH(byte[] pNext)
        {
            xorBlock(theGHash, pNext);
            theMultiplier.MultiplyH(theGHash);
        }

        private static void fillReverse(byte[] pInput, int pOffset, int pLength, byte[] pOutput)
        {
            /* Loop through the buffer */
            for (int i = 0, j = BUFLEN - 1; i < pLength; i++, j--)
            {
                /* Copy byte */
                pOutput[j] = pInput[pOffset + i];
            }
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        private static void fillReverse(ReadOnlySpan<byte> input, Span<byte> output)
        {
            /* Loop through the buffer */
            for (int i = 0, j = BUFLEN - 1; i < input.Length; i++, j--)
            {
                /* Copy byte */
                output[j] = input[i];
            }
        }
#endif

        /**
        * xor a full block buffer.
        * @param pLeft the left operand and result
        * @param pRight the right operand
        */
        private static void xorBlock(byte[] pLeft, byte[] pRight)
        {
            /* Loop through the bytes */
            for (int i = 0; i < BUFLEN; i++)
            {
                pLeft[i] ^= pRight[i];
            }
        }

        /**
        * xor a partial block buffer.
        * @param pLeft the left operand and result
        * @param pRight the right operand
        * @param pOffset the offset in the right operand
        * @param pLength the length of data in the right operand
        */
        private static void xorBlock(byte[] pLeft, byte[] pRight, int pOffset, int pLength)
        {
            /* Loop through the bytes */
            for (int i = 0; i < pLength; i++)
            {
                pLeft[i] ^= pRight[i + pOffset];
            }
        }

        /**
        * increment the counter.
        * @param pCounter the counter to increment
        */
        private static void incrementCounter(byte[] pCounter)
        {
            /* Loop through the bytes incrementing counter */
            for (int i = 0; i < Integers.NumBytes; i++)
            {
                if (++pCounter[i] != 0)
                {
                    break;
                }
            }
        }

        /**
        * multiply by X.
        * @param pValue the value to adjust
        */
        private static void mulX(byte[] pValue)
        {
            /* Loop through the bytes */
            byte myMask = (byte)0;
            for (int i = 0; i < BUFLEN; i++)
            {
                byte myValue = pValue[i];
                pValue[i] = (byte)(((myValue >> 1) & ~MASK) | myMask);
                myMask = (byte)((myValue & 1) == 0 ? (byte)0 : MASK);
            }

            /* Xor in addition if last bit was set */
            if (myMask != 0)
            {
                pValue[0] ^= ADD;
            }
        }

        /**
        * Derive Keys.
        * @param pKey the keyGeneration key
        */
        private void DeriveKeys(KeyParameter pKey)
        {
            /* Create the buffers */
            byte[] myIn = new byte[BUFLEN];
            byte[] myOut = new byte[BUFLEN];
            byte[] myResult = new byte[BUFLEN];
            byte[] myEncKey = new byte[pKey.GetKey().Length];

            /* Prepare for encryption */
            Array.Copy(theNonce, 0, myIn, BUFLEN - NONCELEN, NONCELEN);
            theCipher.Init(true, pKey);

            /* Derive authentication key */
            int myOff = 0;
            theCipher.ProcessBlock(myIn, 0, myOut, 0);
            Array.Copy(myOut, 0, myResult, myOff, HALFBUFLEN);
            myIn[0]++;
            myOff += HALFBUFLEN;
            theCipher.ProcessBlock(myIn, 0, myOut, 0);
            Array.Copy(myOut, 0, myResult, myOff, HALFBUFLEN);

            /* Derive encryption key */
            myIn[0]++;
            myOff = 0;
            theCipher.ProcessBlock(myIn, 0, myOut, 0);
            Array.Copy(myOut, 0, myEncKey, myOff, HALFBUFLEN);
            myIn[0]++;
            myOff += HALFBUFLEN;
            theCipher.ProcessBlock(myIn, 0, myOut, 0);
            Array.Copy(myOut, 0, myEncKey, myOff, HALFBUFLEN);

            /* If we have a 32byte key */
            if (myEncKey.Length == BUFLEN << 1)
            {
                /* Derive remainder of encryption key */
                myIn[0]++;
                myOff += HALFBUFLEN;
                theCipher.ProcessBlock(myIn, 0, myOut, 0);
                Array.Copy(myOut, 0, myEncKey, myOff, HALFBUFLEN);
                myIn[0]++;
                myOff += HALFBUFLEN;
                theCipher.ProcessBlock(myIn, 0, myOut, 0);
                Array.Copy(myOut, 0, myEncKey, myOff, HALFBUFLEN);
            }

            /* Initialise the Cipher */
            theCipher.Init(true, new KeyParameter(myEncKey));

            /* Initialise the multiplier */
            fillReverse(myResult, 0, BUFLEN, myOut);
            mulX(myOut);
            theMultiplier.Init(myOut);
            theFlags |= INIT;
        }

        private class GcmSivCache
            : MemoryStream
        {
            internal GcmSivCache()
            {
            }
        }

        /**
        * Hash Control.
        */
        private class GcmSivHasher
        {
            /**
            * Cache.
            */
            private readonly byte[] theBuffer = new byte[BUFLEN];

            /**
            * Single byte cache.
            */
            private readonly byte[] theByte = new byte[1];

            /**
            * Count of active bytes in cache.
            */
            private int numActive;

            /**
            * Count of hashed bytes.
            */
            private ulong numHashed;

            private readonly GcmSivBlockCipher parent;

            internal GcmSivHasher(GcmSivBlockCipher parent)
            {
                this.parent = parent;
            }

            /**
            * Obtain the count of bytes hashed.
            * @return the count
            */
            internal ulong getBytesProcessed()
            {
                return numHashed;
            }

            /**
            * Reset the hasher.
            */
            internal void Reset()
            {
                numActive = 0;
                numHashed = 0;
            }

            /**
            * update hash.
            * @param pByte the byte
            */
            internal void UpdateHash(byte pByte)
            {
                theByte[0] = pByte;
                UpdateHash(theByte, 0, 1);
            }

            /**
            * update hash.
            * @param pBuffer the buffer
            * @param pOffset the offset within the buffer
            * @param pLen the length of data
            */
            internal void UpdateHash(byte[] pBuffer, int pOffset, int pLen)
            {
                /* If we should process the cache */
                int mySpace = BUFLEN - numActive;
                int numProcessed = 0;
                int myRemaining = pLen;
                if (numActive > 0 && pLen >= mySpace)
                {
                    /* Copy data into the cache and hash it */
                    Array.Copy(pBuffer, pOffset, theBuffer, numActive, mySpace);
                    fillReverse(theBuffer, 0, BUFLEN, parent.theReverse);
                    parent.gHASH(parent.theReverse);

                    /* Adjust counters */
                    numProcessed += mySpace;
                    myRemaining -= mySpace;
                    numActive = 0;
                }

                /* While we have full blocks */
                while (myRemaining >= BUFLEN)
                {
                    /* Access the next data */
                    fillReverse(pBuffer, pOffset + numProcessed, BUFLEN, parent.theReverse);
                    parent.gHASH(parent.theReverse);

                    /* Adjust counters */
                    numProcessed += BUFLEN;
                    myRemaining -= BUFLEN;
                }

                /* If we have remaining data */
                if (myRemaining > 0)
                {
                    /* Copy data into the cache */
                    Array.Copy(pBuffer, pOffset + numProcessed, theBuffer, numActive, myRemaining);
                    numActive += myRemaining;
                }

                /* Adjust the number of bytes processed */
                numHashed += (ulong)pLen;
            }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
            internal void UpdateHash(ReadOnlySpan<byte> buffer)
            {
                int pLen = buffer.Length;

                /* If we should process the cache */
                int mySpace = BUFLEN - numActive;
                if (numActive > 0 && buffer.Length >= mySpace)
                {
                    /* Copy data into the cache and hash it */
                    buffer[..mySpace].CopyTo(theBuffer.AsSpan(numActive));
                    fillReverse(theBuffer, parent.theReverse);
                    parent.gHASH(parent.theReverse);

                    /* Adjust counters */
                    buffer = buffer[mySpace..];
                    numActive = 0;
                }

                /* While we have full blocks */
                while (buffer.Length >= BUFLEN)
                {
                    /* Access the next data */
                    fillReverse(buffer[..BUFLEN], parent.theReverse);
                    parent.gHASH(parent.theReverse);

                    /* Adjust counters */
                    buffer = buffer[BUFLEN..];
                }

                /* If we have remaining data */
                if (!buffer.IsEmpty)
                {
                    /* Copy data into the cache */
                    buffer.CopyTo(theBuffer.AsSpan(numActive));
                    numActive += buffer.Length;
                }

                /* Adjust the number of bytes processed */
                numHashed += (ulong)pLen;
            }
#endif

            /**
            * complete hash.
            */
            internal void completeHash()
            {
                /* If we have remaining data */
                if (numActive > 0)
                {
                    /* Access the next data */
                    Arrays.Fill(parent.theReverse, (byte)0);
                    fillReverse(theBuffer, 0, numActive, parent.theReverse);

                    /* hash value */
                    parent.gHASH(parent.theReverse);
                }
            }
        }
    }
}
