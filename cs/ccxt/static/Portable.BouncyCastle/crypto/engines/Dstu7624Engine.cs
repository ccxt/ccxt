using System;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto.Utilities;

namespace Org.BouncyCastle.Crypto.Engines
{
    /**
    * implementation of DSTU 7624 (Kalyna)
    */
    public class Dstu7624Engine
         : IBlockCipher
    {
        private ulong[] internalState;
        private ulong[] workingKey;
        private ulong[][] roundKeys;

        /* Number of 64-bit words in block */
        private int wordsInBlock;

        /* Number of 64-bit words in key */
        private int wordsInKey;

        /* Number of encryption rounds depending on key length */
        private const int ROUNDS_128 = 10;
        private const int ROUNDS_256 = 14;
        private const int ROUNDS_512 = 18;

        private int roundsAmount;

        private bool forEncryption;

        public Dstu7624Engine(int blockSizeBits)
        {
            /* DSTU7624 supports 128 | 256 | 512 key/block sizes */
            if (blockSizeBits != 128 && blockSizeBits != 256 && blockSizeBits != 512)
            {
                throw new ArgumentException("unsupported block length: only 128/256/512 are allowed");
            }

            wordsInBlock = blockSizeBits / 64;
            internalState = new ulong[wordsInBlock];
        }

        #region INITIALIZATION

        public virtual void Init(bool forEncryption, ICipherParameters parameters)
        {
            if (!(parameters is KeyParameter))
                throw new ArgumentException("Invalid parameter passed to Dstu7624Engine Init");

            this.forEncryption = forEncryption;

            byte[] keyBytes = ((KeyParameter)parameters).GetKey();
            int keyBitLength = keyBytes.Length << 3;
            int blockBitLength = wordsInBlock << 6;

            if (keyBitLength != 128 && keyBitLength != 256 && keyBitLength != 512)
            {
                throw new ArgumentException("unsupported key length: only 128/256/512 are allowed");
            }

            /* Limitations on key lengths depending on block lengths. See table 6.1 in standard */
            if (keyBitLength != blockBitLength && keyBitLength != (2 * blockBitLength))
            {
                throw new ArgumentException("Unsupported key length");
            }

            switch (keyBitLength)
            {
            case 128:
                roundsAmount = ROUNDS_128;
                break;
            case 256:
                roundsAmount = ROUNDS_256;
                break;
            case 512:
                roundsAmount = ROUNDS_512;
                break;
            }

            wordsInKey = keyBitLength / 64;

            /* +1 round key as defined in standard */
            roundKeys = new ulong[roundsAmount + 1][];
            for (int roundKeyIndex = 0; roundKeyIndex < roundKeys.Length; roundKeyIndex++)
            {
                roundKeys[roundKeyIndex] = new ulong[wordsInBlock];
            }

            workingKey = new ulong[wordsInKey];

            if (keyBytes.Length != wordsInKey * 8)
            {
                throw new ArgumentException("Invalid key parameter passed to Dstu7624Engine Init");
            }

            /* Unpack encryption key bytes to words */
            Pack.LE_To_UInt64(keyBytes, 0, workingKey);

            ulong[] tempKeys = new ulong[wordsInBlock];

            /* KSA in DSTU7624 is strengthened to mitigate known weaknesses in AES KSA (eprint.iacr.org/2012/260.pdf) */
            WorkingKeyExpandKT(workingKey, tempKeys);
            WorkingKeyExpandEven(workingKey, tempKeys);
            WorkingKeyExpandOdd();
        }

        private void WorkingKeyExpandKT(ulong[] workingKey, ulong[] tempKeys)
        {
            ulong[] k0 = new ulong[wordsInBlock];
            ulong[] k1 = new ulong[wordsInBlock];

            internalState = new ulong[wordsInBlock];
            internalState[0] += (ulong)(wordsInBlock + wordsInKey + 1);

            if (wordsInBlock == wordsInKey)
            {
                Array.Copy(workingKey, 0, k0, 0, k0.Length);
                Array.Copy(workingKey, 0, k1, 0, k1.Length);
            }
            else
            {
                Array.Copy(workingKey, 0, k0, 0, wordsInBlock);
                Array.Copy(workingKey, wordsInBlock, k1, 0, wordsInBlock);
            }

            
            for (int wordIndex = 0; wordIndex < internalState.Length; wordIndex++)
            {
                internalState[wordIndex] += k0[wordIndex];
            }

            EncryptionRound();

            for (int wordIndex = 0; wordIndex < internalState.Length; wordIndex++)
            {
                internalState[wordIndex] ^= k1[wordIndex];
            }

            EncryptionRound();

            for (int wordIndex = 0; wordIndex < internalState.Length; wordIndex++)
            {
                internalState[wordIndex] += k0[wordIndex];
            }

            EncryptionRound();

            Array.Copy(internalState, 0, tempKeys, 0, wordsInBlock);
        }

        private void WorkingKeyExpandEven(ulong[] workingKey, ulong[] tempKey)
        {
            ulong[] initialData = new ulong[wordsInKey];
            ulong[] tempRoundKey = new ulong[wordsInBlock];

            int round = 0;

            Array.Copy(workingKey, 0, initialData, 0, wordsInKey);

            ulong tmv = 0x0001000100010001UL;

            while (true)
            {
                for (int wordIndex = 0; wordIndex < wordsInBlock; wordIndex++)
                {
                    tempRoundKey[wordIndex] = tempKey[wordIndex] + tmv;
                }

                for (int wordIndex = 0; wordIndex < wordsInBlock; wordIndex++)
                {
                    internalState[wordIndex] = initialData[wordIndex] + tempRoundKey[wordIndex];
                }

                EncryptionRound();

                for (int wordIndex = 0; wordIndex < wordsInBlock; wordIndex++)
                {
                    internalState[wordIndex] ^= tempRoundKey[wordIndex];
                }

                EncryptionRound();

                for (int wordIndex = 0; wordIndex < wordsInBlock; wordIndex++)
                {
                    internalState[wordIndex] += tempRoundKey[wordIndex];
                }

                Array.Copy(internalState, 0, roundKeys[round], 0, wordsInBlock);

                if (roundsAmount == round)
                {
                    break;
                }

                if (wordsInKey != wordsInBlock)
                {
                    round += 2;
                    tmv <<= 1;

                    for (int wordIndex = 0; wordIndex < wordsInBlock; wordIndex++)
                    {
                        tempRoundKey[wordIndex] = tempKey[wordIndex] + tmv;
                    }

                    for (int wordIndex = 0; wordIndex < wordsInBlock; wordIndex++)
                    {
                        internalState[wordIndex] = initialData[wordsInBlock + wordIndex] + tempRoundKey[wordIndex];
                    }

                    EncryptionRound();

                    for (int wordIndex = 0; wordIndex < wordsInBlock; wordIndex++)
                    {
                        internalState[wordIndex] ^= tempRoundKey[wordIndex];
                    }

                    EncryptionRound();

                    for (int wordIndex = 0; wordIndex < wordsInBlock; wordIndex++)
                    {
                        internalState[wordIndex] += tempRoundKey[wordIndex];
                    }

                    Array.Copy(internalState, 0, roundKeys[round], 0, wordsInBlock);

                    if (roundsAmount == round)
                    {
                        break;
                    }
                }

                round += 2;
                tmv <<= 1;

                ulong temp = initialData[0];
                for (int i = 1; i < initialData.Length; ++i)
                {
                    initialData[i - 1] = initialData[i];
                }
                initialData[initialData.Length - 1] = temp;
            }
        }

        private void WorkingKeyExpandOdd()
        {
            for (int roundIndex = 1; roundIndex < roundsAmount; roundIndex += 2)
            {
                RotateLeft(roundKeys[roundIndex - 1], roundKeys[roundIndex]);
            }
        }

        #endregion

        public virtual int ProcessBlock(byte[] input, int inOff, byte[] output, int outOff)
        {
            if (workingKey == null)
                throw new InvalidOperationException("Dstu7624Engine not initialised");

            Check.DataLength(input, inOff, GetBlockSize(), "input buffer too short");
            Check.OutputLength(output, outOff, GetBlockSize(), "output buffer too short");

            if (forEncryption)
            {
                /* Encrypt */
                switch (wordsInBlock)
                {
                case 2:
                {
#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
                    EncryptBlock_128(input.AsSpan(inOff), output.AsSpan(outOff));
#else
                    EncryptBlock_128(input, inOff, output, outOff);
#endif
                    break;
                }
                default:
                {
                    Pack.LE_To_UInt64(input, inOff, internalState);
                    AddRoundKey(0);
                    for (int round = 0;;)
                    {
                        EncryptionRound();

                        if (++round == roundsAmount)
                        {
                            break;
                        }

                        XorRoundKey(round);
                    }
                    AddRoundKey(roundsAmount);
                    Pack.UInt64_To_LE(internalState, output, outOff);
                    Array.Clear(internalState, 0, internalState.Length);
                    break;
                }
                }
            }
            else
            {
                /* Decrypt */
                switch (wordsInBlock)
                {
                case 2:
                {
#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
                    DecryptBlock_128(input.AsSpan(inOff), output.AsSpan(outOff));
#else
                    DecryptBlock_128(input, inOff, output, outOff);
#endif
                    break;
                }
                default:
                {
                    Pack.LE_To_UInt64(input, inOff, internalState);
                    SubRoundKey(roundsAmount);
                    for (int round = roundsAmount;;)
                    {
                        DecryptionRound();

                        if (--round == 0)
                        {
                            break;
                        }
    
                        XorRoundKey(round);
                    }
                    SubRoundKey(0);
                    Pack.UInt64_To_LE(internalState, output, outOff);
                    Array.Clear(internalState, 0, internalState.Length);
                    break;
                }
                }
            }

            return GetBlockSize();
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual int ProcessBlock(ReadOnlySpan<byte> input, Span<byte> output)
        {
            if (workingKey == null)
                throw new InvalidOperationException("Dstu7624Engine not initialised");

            Check.DataLength(input, GetBlockSize(), "input buffer too short");
            Check.OutputLength(output, GetBlockSize(), "output buffer too short");

            if (forEncryption)
            {
                /* Encrypt */
                switch (wordsInBlock)
                {
                case 2:
                {
                    EncryptBlock_128(input, output);
                    break;
                }
                default:
                {
                    Pack.LE_To_UInt64(input, internalState);
                    AddRoundKey(0);
                    for (int round = 0;;)
                    {
                        EncryptionRound();

                        if (++round == roundsAmount)
                        {
                            break;
                        }

                        XorRoundKey(round);
                    }
                    AddRoundKey(roundsAmount);
                    Pack.UInt64_To_LE(internalState, output);
                    Array.Clear(internalState, 0, internalState.Length);
                    break;
                }
                }
            }
            else
            {
                /* Decrypt */
                switch (wordsInBlock)
                {
                case 2:
                {
                    DecryptBlock_128(input, output);
                    break;
                }
                default:
                {
                    Pack.LE_To_UInt64(input, internalState);
                    SubRoundKey(roundsAmount);
                    for (int round = roundsAmount;;)
                    {
                        DecryptionRound();

                        if (--round == 0)
                        {
                            break;
                        }
    
                        XorRoundKey(round);
                    }
                    SubRoundKey(0);
                    Pack.UInt64_To_LE(internalState, output);
                    Array.Clear(internalState, 0, internalState.Length);
                    break;
                }
                }
            }

            return GetBlockSize();
        }
#endif

        private void EncryptionRound()
        {
            SubBytes();
            ShiftRows();
            MixColumns();
        }

        private void DecryptionRound()
        {
            MixColumnsInv();
            InvShiftRows();
            InvSubBytes();
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        private void DecryptBlock_128(ReadOnlySpan<byte> input, Span<byte> output)
        {
            ulong c0 = Pack.LE_To_UInt64(input);
            ulong c1 = Pack.LE_To_UInt64(input[8..]);

            ulong[] roundKey = roundKeys[roundsAmount];
            c0 -= roundKey[0];
            c1 -= roundKey[1];

            for (int round = roundsAmount; ;)
            {
                c0 = MixColumnInv(c0);
                c1 = MixColumnInv(c1);

                uint lo0 = (uint)c0, hi0 = (uint)(c0 >> 32);
                uint lo1 = (uint)c1, hi1 = (uint)(c1 >> 32);

                {
                    byte t0 = T0[lo0 & 0xFF];
                    byte t1 = T1[(lo0 >> 8) & 0xFF];
                    byte t2 = T2[(lo0 >> 16) & 0xFF];
                    byte t3 = T3[lo0 >> 24];
                    lo0 = (uint)t0 | ((uint)t1 << 8) | ((uint)t2 << 16) | ((uint)t3 << 24);
                    byte t4 = T0[hi1 & 0xFF];
                    byte t5 = T1[(hi1 >> 8) & 0xFF];
                    byte t6 = T2[(hi1 >> 16) & 0xFF];
                    byte t7 = T3[hi1 >> 24];
                    hi1 = (uint)t4 | ((uint)t5 << 8) | ((uint)t6 << 16) | ((uint)t7 << 24);
                    c0 = (ulong)lo0 | ((ulong)hi1 << 32);
                }

                {
                    byte t0 = T0[lo1 & 0xFF];
                    byte t1 = T1[(lo1 >> 8) & 0xFF];
                    byte t2 = T2[(lo1 >> 16) & 0xFF];
                    byte t3 = T3[lo1 >> 24];
                    lo1 = (uint)t0 | ((uint)t1 << 8) | ((uint)t2 << 16) | ((uint)t3 << 24);
                    byte t4 = T0[hi0 & 0xFF];
                    byte t5 = T1[(hi0 >> 8) & 0xFF];
                    byte t6 = T2[(hi0 >> 16) & 0xFF];
                    byte t7 = T3[hi0 >> 24];
                    hi0 = (uint)t4 | ((uint)t5 << 8) | ((uint)t6 << 16) | ((uint)t7 << 24);
                    c1 = (ulong)lo1 | ((ulong)hi0 << 32);
                }

                if (--round == 0)
                {
                    break;
                }

                roundKey = roundKeys[round];
                c0 ^= roundKey[0];
                c1 ^= roundKey[1];
            }

            roundKey = roundKeys[0];
            c0 -= roundKey[0];
            c1 -= roundKey[1];

            Pack.UInt64_To_LE(c0, output);
            Pack.UInt64_To_LE(c1, output[8..]);
        }

        private void EncryptBlock_128(ReadOnlySpan<byte> input, Span<byte> output)
        {
            ulong c0 = Pack.LE_To_UInt64(input);
            ulong c1 = Pack.LE_To_UInt64(input[8..]);

            ulong[] roundKey = roundKeys[0];
            c0 += roundKey[0];
            c1 += roundKey[1];

            for (int round = 0; ;)
            {
                uint lo0 = (uint)c0, hi0 = (uint)(c0 >> 32);
                uint lo1 = (uint)c1, hi1 = (uint)(c1 >> 32);

                {
                    byte t0 = S0[lo0 & 0xFF];
                    byte t1 = S1[(lo0 >> 8) & 0xFF];
                    byte t2 = S2[(lo0 >> 16) & 0xFF];
                    byte t3 = S3[lo0 >> 24];
                    lo0 = (uint)t0 | ((uint)t1 << 8) | ((uint)t2 << 16) | ((uint)t3 << 24);
                    byte t4 = S0[hi1 & 0xFF];
                    byte t5 = S1[(hi1 >> 8) & 0xFF];
                    byte t6 = S2[(hi1 >> 16) & 0xFF];
                    byte t7 = S3[hi1 >> 24];
                    hi1 = (uint)t4 | ((uint)t5 << 8) | ((uint)t6 << 16) | ((uint)t7 << 24);
                    c0 = (ulong)lo0 | ((ulong)hi1 << 32);
                }

                {
                    byte t0 = S0[lo1 & 0xFF];
                    byte t1 = S1[(lo1 >> 8) & 0xFF];
                    byte t2 = S2[(lo1 >> 16) & 0xFF];
                    byte t3 = S3[lo1 >> 24];
                    lo1 = (uint)t0 | ((uint)t1 << 8) | ((uint)t2 << 16) | ((uint)t3 << 24);
                    byte t4 = S0[hi0 & 0xFF];
                    byte t5 = S1[(hi0 >> 8) & 0xFF];
                    byte t6 = S2[(hi0 >> 16) & 0xFF];
                    byte t7 = S3[hi0 >> 24];
                    hi0 = (uint)t4 | ((uint)t5 << 8) | ((uint)t6 << 16) | ((uint)t7 << 24);
                    c1 = (ulong)lo1 | ((ulong)hi0 << 32);
                }

                c0 = MixColumn(c0);
                c1 = MixColumn(c1);

                if (++round == roundsAmount)
                {
                    break;
                }

                roundKey = roundKeys[round];
                c0 ^= roundKey[0];
                c1 ^= roundKey[1];
            }

            roundKey = roundKeys[roundsAmount];
            c0 += roundKey[0];
            c1 += roundKey[1];

            Pack.UInt64_To_LE(c0, output);
            Pack.UInt64_To_LE(c1, output[8..]);
        }
#else
        private void DecryptBlock_128(byte[] input, int inOff, byte[] output, int outOff)
        {
            ulong c0 = Pack.LE_To_UInt64(input, inOff);
            ulong c1 = Pack.LE_To_UInt64(input, inOff + 8);

            ulong[] roundKey = roundKeys[roundsAmount];
            c0 -= roundKey[0];
            c1 -= roundKey[1];

            for (int round = roundsAmount;;)
            {
                c0 = MixColumnInv(c0);
                c1 = MixColumnInv(c1);

                uint lo0 = (uint)c0, hi0 = (uint)(c0 >> 32);
                uint lo1 = (uint)c1, hi1 = (uint)(c1 >> 32);

                {
                    byte t0 = T0[lo0 & 0xFF];
                    byte t1 = T1[(lo0 >> 8) & 0xFF];
                    byte t2 = T2[(lo0 >> 16) & 0xFF];
                    byte t3 = T3[lo0 >> 24];
                    lo0 = (uint)t0 | ((uint)t1 << 8) | ((uint)t2 << 16) | ((uint)t3 << 24);
                    byte t4 = T0[hi1 & 0xFF];
                    byte t5 = T1[(hi1 >> 8) & 0xFF];
                    byte t6 = T2[(hi1 >> 16) & 0xFF];
                    byte t7 = T3[hi1 >> 24];
                    hi1 = (uint)t4 | ((uint)t5 << 8) | ((uint)t6 << 16) | ((uint)t7 << 24);
                    c0 = (ulong)lo0 | ((ulong)hi1 << 32);
                }

                {
                    byte t0 = T0[lo1 & 0xFF];
                    byte t1 = T1[(lo1 >> 8) & 0xFF];
                    byte t2 = T2[(lo1 >> 16) & 0xFF];
                    byte t3 = T3[lo1 >> 24];
                    lo1 = (uint)t0 | ((uint)t1 << 8) | ((uint)t2 << 16) | ((uint)t3 << 24);
                    byte t4 = T0[hi0 & 0xFF];
                    byte t5 = T1[(hi0 >> 8) & 0xFF];
                    byte t6 = T2[(hi0 >> 16) & 0xFF];
                    byte t7 = T3[hi0 >> 24];
                    hi0 = (uint)t4 | ((uint)t5 << 8) | ((uint)t6 << 16) | ((uint)t7 << 24);
                    c1 = (ulong)lo1 | ((ulong)hi0 << 32);
                }

                if (--round == 0)
                {
                    break;
                }

                roundKey = roundKeys[round];
                c0 ^= roundKey[0];
                c1 ^= roundKey[1];
            }

            roundKey = roundKeys[0];
            c0 -= roundKey[0];
            c1 -= roundKey[1];

            Pack.UInt64_To_LE(c0, output, outOff);
            Pack.UInt64_To_LE(c1, output, outOff + 8);
        }

        private void EncryptBlock_128(byte[] input, int inOff, byte[] output, int outOff)
        {
            ulong c0 = Pack.LE_To_UInt64(input, inOff);
            ulong c1 = Pack.LE_To_UInt64(input, inOff + 8);

            ulong[] roundKey = roundKeys[0];
            c0 += roundKey[0];
            c1 += roundKey[1];

            for (int round = 0;;)
            {
                uint lo0 = (uint)c0, hi0 = (uint)(c0 >> 32);
                uint lo1 = (uint)c1, hi1 = (uint)(c1 >> 32);

                {
                    byte t0 = S0[lo0 & 0xFF];
                    byte t1 = S1[(lo0 >> 8) & 0xFF];
                    byte t2 = S2[(lo0 >> 16) & 0xFF];
                    byte t3 = S3[lo0 >> 24];
                    lo0 = (uint)t0 | ((uint)t1 << 8) | ((uint)t2 << 16) | ((uint)t3 << 24);
                    byte t4 = S0[hi1 & 0xFF];
                    byte t5 = S1[(hi1 >> 8) & 0xFF];
                    byte t6 = S2[(hi1 >> 16) & 0xFF];
                    byte t7 = S3[hi1 >> 24];
                    hi1 = (uint)t4 | ((uint)t5 << 8) | ((uint)t6 << 16) | ((uint)t7 << 24);
                    c0 = (ulong)lo0 | ((ulong)hi1 << 32);
                }

                {
                    byte t0 = S0[lo1 & 0xFF];
                    byte t1 = S1[(lo1 >> 8) & 0xFF];
                    byte t2 = S2[(lo1 >> 16) & 0xFF];
                    byte t3 = S3[lo1 >> 24];
                    lo1 = (uint)t0 | ((uint)t1 << 8) | ((uint)t2 << 16) | ((uint)t3 << 24);
                    byte t4 = S0[hi0 & 0xFF];
                    byte t5 = S1[(hi0 >> 8) & 0xFF];
                    byte t6 = S2[(hi0 >> 16) & 0xFF];
                    byte t7 = S3[hi0 >> 24];
                    hi0 = (uint)t4 | ((uint)t5 << 8) | ((uint)t6 << 16) | ((uint)t7 << 24);
                    c1 = (ulong)lo1 | ((ulong)hi0 << 32);
                }

                c0 = MixColumn(c0);
                c1 = MixColumn(c1);

                if (++round == roundsAmount)
                {
                    break;
                }

                roundKey = roundKeys[round];
                c0 ^= roundKey[0];
                c1 ^= roundKey[1];
            }

            roundKey = roundKeys[roundsAmount];
            c0 += roundKey[0];
            c1 += roundKey[1];

            Pack.UInt64_To_LE(c0, output, outOff);
            Pack.UInt64_To_LE(c1, output, outOff + 8);
        }
#endif

        private void SubBytes()
        {
            for (int i = 0; i < wordsInBlock; i++)
            {
                ulong u = internalState[i];
                uint lo = (uint)u, hi = (uint)(u >> 32);
                byte t0 = S0[lo & 0xFF];
                byte t1 = S1[(lo >> 8) & 0xFF];
                byte t2 = S2[(lo >> 16) & 0xFF];
                byte t3 = S3[lo >> 24];
                lo = (uint)t0 | ((uint)t1 << 8) | ((uint)t2 << 16) | ((uint)t3 << 24);
                byte t4 = S0[hi & 0xFF];
                byte t5 = S1[(hi >> 8) & 0xFF];
                byte t6 = S2[(hi >> 16) & 0xFF];
                byte t7 = S3[hi >> 24];
                hi = (uint)t4 | ((uint)t5 << 8) | ((uint)t6 << 16) | ((uint)t7 << 24);
                internalState[i] = (ulong)lo | ((ulong)hi << 32);
            }
        }

        private void InvSubBytes()
        {
            for (int i = 0; i < wordsInBlock; i++)
            {
                ulong u = internalState[i];
                uint lo = (uint)u, hi = (uint)(u >> 32);
                byte t0 = T0[lo & 0xFF];
                byte t1 = T1[(lo >> 8) & 0xFF];
                byte t2 = T2[(lo >> 16) & 0xFF];
                byte t3 = T3[lo >> 24];
                lo = (uint)t0 | ((uint)t1 << 8) | ((uint)t2 << 16) | ((uint)t3 << 24);
                byte t4 = T0[hi & 0xFF];
                byte t5 = T1[(hi >> 8) & 0xFF];
                byte t6 = T2[(hi >> 16) & 0xFF];
                byte t7 = T3[hi >> 24];
                hi = (uint)t4 | ((uint)t5 << 8) | ((uint)t6 << 16) | ((uint)t7 << 24);
                internalState[i] = (ulong)lo | ((ulong)hi << 32);
            }
        }

        private void ShiftRows()
        {
            switch (wordsInBlock)
            {
            case 2:
            {
                ulong c0 = internalState[0], c1 = internalState[1];
                ulong d;

                d = (c0 ^ c1) & 0xFFFFFFFF00000000UL; c0 ^= d; c1 ^= d;

                internalState[0] = c0;
                internalState[1] = c1;
                break;
            }
            case 4:
            {
                ulong c0 = internalState[0], c1 = internalState[1], c2 = internalState[2], c3 = internalState[3];
                ulong d;

                d = (c0 ^ c2) & 0xFFFFFFFF00000000UL; c0 ^= d; c2 ^= d;
                d = (c1 ^ c3) & 0x0000FFFFFFFF0000UL; c1 ^= d; c3 ^= d;

                d = (c0 ^ c1) & 0xFFFF0000FFFF0000UL; c0 ^= d; c1 ^= d;
                d = (c2 ^ c3) & 0xFFFF0000FFFF0000UL; c2 ^= d; c3 ^= d;

                internalState[0] = c0;
                internalState[1] = c1;
                internalState[2] = c2;
                internalState[3] = c3;
                break;
            }
            case 8:
            {
                ulong c0 = internalState[0], c1 = internalState[1], c2 = internalState[2], c3 = internalState[3];
                ulong c4 = internalState[4], c5 = internalState[5], c6 = internalState[6], c7 = internalState[7];
                ulong d;

                d = (c0 ^ c4) & 0xFFFFFFFF00000000UL; c0 ^= d; c4 ^= d;
                d = (c1 ^ c5) & 0x00FFFFFFFF000000UL; c1 ^= d; c5 ^= d;
                d = (c2 ^ c6) & 0x0000FFFFFFFF0000UL; c2 ^= d; c6 ^= d;
                d = (c3 ^ c7) & 0x000000FFFFFFFF00UL; c3 ^= d; c7 ^= d;

                d = (c0 ^ c2) & 0xFFFF0000FFFF0000UL; c0 ^= d; c2 ^= d;
                d = (c1 ^ c3) & 0x00FFFF0000FFFF00UL; c1 ^= d; c3 ^= d;
                d = (c4 ^ c6) & 0xFFFF0000FFFF0000UL; c4 ^= d; c6 ^= d;
                d = (c5 ^ c7) & 0x00FFFF0000FFFF00UL; c5 ^= d; c7 ^= d;

                d = (c0 ^ c1) & 0xFF00FF00FF00FF00UL; c0 ^= d; c1 ^= d;
                d = (c2 ^ c3) & 0xFF00FF00FF00FF00UL; c2 ^= d; c3 ^= d;
                d = (c4 ^ c5) & 0xFF00FF00FF00FF00UL; c4 ^= d; c5 ^= d;
                d = (c6 ^ c7) & 0xFF00FF00FF00FF00UL; c6 ^= d; c7 ^= d;

                internalState[0] = c0;
                internalState[1] = c1;
                internalState[2] = c2;
                internalState[3] = c3;
                internalState[4] = c4;
                internalState[5] = c5;
                internalState[6] = c6;
                internalState[7] = c7;
                break;
            }
            default:
            {
                throw new InvalidOperationException("unsupported block length: only 128/256/512 are allowed");
            }
            }
        }

        private void InvShiftRows()
        {
            switch (wordsInBlock)
            {
            case 2:
            {
                ulong c0 = internalState[0], c1 = internalState[1];
                ulong d;

                d = (c0 ^ c1) & 0xFFFFFFFF00000000UL; c0 ^= d; c1 ^= d;

                internalState[0] = c0;
                internalState[1] = c1;
                break;
            }
            case 4:
            {
                ulong c0 = internalState[0], c1 = internalState[1], c2 = internalState[2], c3 = internalState[3];
                ulong d;

                d = (c0 ^ c1) & 0xFFFF0000FFFF0000UL; c0 ^= d; c1 ^= d;
                d = (c2 ^ c3) & 0xFFFF0000FFFF0000UL; c2 ^= d; c3 ^= d;

                d = (c0 ^ c2) & 0xFFFFFFFF00000000UL; c0 ^= d; c2 ^= d;
                d = (c1 ^ c3) & 0x0000FFFFFFFF0000UL; c1 ^= d; c3 ^= d;

                internalState[0] = c0;
                internalState[1] = c1;
                internalState[2] = c2;
                internalState[3] = c3;
                break;
            }
            case 8:
            {
                ulong c0 = internalState[0], c1 = internalState[1], c2 = internalState[2], c3 = internalState[3];
                ulong c4 = internalState[4], c5 = internalState[5], c6 = internalState[6], c7 = internalState[7];
                ulong d;

                d = (c0 ^ c1) & 0xFF00FF00FF00FF00UL; c0 ^= d; c1 ^= d;
                d = (c2 ^ c3) & 0xFF00FF00FF00FF00UL; c2 ^= d; c3 ^= d;
                d = (c4 ^ c5) & 0xFF00FF00FF00FF00UL; c4 ^= d; c5 ^= d;
                d = (c6 ^ c7) & 0xFF00FF00FF00FF00UL; c6 ^= d; c7 ^= d;

                d = (c0 ^ c2) & 0xFFFF0000FFFF0000UL; c0 ^= d; c2 ^= d;
                d = (c1 ^ c3) & 0x00FFFF0000FFFF00UL; c1 ^= d; c3 ^= d;
                d = (c4 ^ c6) & 0xFFFF0000FFFF0000UL; c4 ^= d; c6 ^= d;
                d = (c5 ^ c7) & 0x00FFFF0000FFFF00UL; c5 ^= d; c7 ^= d;

                d = (c0 ^ c4) & 0xFFFFFFFF00000000UL; c0 ^= d; c4 ^= d;
                d = (c1 ^ c5) & 0x00FFFFFFFF000000UL; c1 ^= d; c5 ^= d;
                d = (c2 ^ c6) & 0x0000FFFFFFFF0000UL; c2 ^= d; c6 ^= d;
                d = (c3 ^ c7) & 0x000000FFFFFFFF00UL; c3 ^= d; c7 ^= d;

                internalState[0] = c0;
                internalState[1] = c1;
                internalState[2] = c2;
                internalState[3] = c3;
                internalState[4] = c4;
                internalState[5] = c5;
                internalState[6] = c6;
                internalState[7] = c7;
                break;
            }
            default:
            {
                throw new InvalidOperationException("unsupported block length: only 128/256/512 are allowed");
            }
            }
        }

        private void AddRoundKey(int round)
        {
            ulong[] roundKey = roundKeys[round];
            for (int i = 0; i < wordsInBlock; ++i)
            {
                internalState[i] += roundKey[i];
            }
        }

        private void SubRoundKey(int round)
        {
            ulong[] roundKey = roundKeys[round];
            for (int i = 0; i < wordsInBlock; ++i)
            {
                internalState[i] -= roundKey[i];
            }
        }

        private void XorRoundKey(int round)
        {
            ulong[] roundKey = roundKeys[round];
            for (int i = 0; i < wordsInBlock; i++)
            {
                internalState[i] ^= roundKey[i];
            }
        }

        private static ulong MixColumn(ulong c)
        {
            //// Calculate column multiplied by powers of 'x'
            //ulong x0 = c;
            //ulong x1 = MulX(x0);
            //ulong x2 = MulX(x1);
            //ulong x3 = MulX(x2);

            //// Calculate products with circulant matrix from (0x01, 0x01, 0x05, 0x01, 0x08, 0x06, 0x07, 0x04)
            //ulong m0 = x0;
            //ulong m1 = x0;
            //ulong m2 = x0 ^ x2;
            //ulong m3 = x0;
            //ulong m4 = x3;
            //ulong m5 = x1 ^ x2;
            //ulong m6 = x0 ^ x1 ^ x2;
            //ulong m7 = x2;

            //// Assemble the rotated products
            //return m0
            //    ^ Rotate(8, m1)
            //    ^ Rotate(16, m2)
            //    ^ Rotate(24, m3)
            //    ^ Rotate(32, m4)
            //    ^ Rotate(40, m5)
            //    ^ Rotate(48, m6)
            //    ^ Rotate(56, m7);

            ulong x1 = MulX(c);
            ulong u, v;

            u  = Rotate(8, c) ^ c;
            u ^= Rotate(16, u);
            u ^= Rotate(48, c);

            v  = MulX2(u ^ c ^ x1);

            return u ^ Rotate(32, v) ^ Rotate(40, x1) ^ Rotate(48, x1);
        }

        private void MixColumns()
        {
            for (int col = 0; col < wordsInBlock; ++col)
            {
                internalState[col] = MixColumn(internalState[col]);
            }
        }

        private static ulong MixColumnInv(ulong c)
        {
/*
            // Calculate column multiplied by powers of 'x'
            ulong x0 = c;
            ulong x1 = MulX(x0);
            ulong x2 = MulX(x1);
            ulong x3 = MulX(x2);
            ulong x4 = MulX(x3);
            ulong x5 = MulX(x4);
            ulong x6 = MulX(x5);
            ulong x7 = MulX(x6);

            // Calculate products with circulant matrix from (0xAD,0x95,0x76,0xA8,0x2F,0x49,0xD7,0xCA)
            //long m0 = x0 ^ x2 ^ x3 ^ x5 ^ x7;
            //long m1 = x0 ^ x2 ^ x4 ^ x7;
            //long m2 = x1 ^ x2 ^ x4 ^ x5 ^ x6;
            //long m3 = x3 ^ x5 ^ x7;
            //long m4 = x0 ^ x1 ^ x2 ^ x3 ^ x5;
            //long m5 = x0 ^ x3 ^ x6;
            //long m6 = x0 ^ x1 ^ x2 ^ x4 ^ x6 ^ x7;
            //long m7 = x1 ^ x3 ^ x6 ^ x7;

            ulong m5 = x0 ^ x3 ^ x6;
            x0 ^= x2;
            ulong m3 = x3 ^ x5 ^ x7;
            ulong m0 = m3 ^ x0;
            ulong m6 = x0 ^ x4;
            ulong m1 = m6 ^ x7;
            x5 ^= x1;
            x7 ^= x1 ^ x6;
            ulong m2 = x2 ^ x4 ^ x5 ^ x6;
            ulong m4 = x0 ^ x3 ^ x5;
            m6 ^= x7;
            ulong m7 = x3 ^ x7;

            // Assemble the rotated products
            return m0
                ^ Rotate(8, m1)
                ^ Rotate(16, m2)
                ^ Rotate(24, m3)
                ^ Rotate(32, m4)
                ^ Rotate(40, m5)
                ^ Rotate(48, m6)
                ^ Rotate(56, m7);
*/

            ulong u0 = c;
            u0 ^= Rotate( 8, u0);
            u0 ^= Rotate(32, u0);
            u0 ^= Rotate(48, c);

            ulong t = u0 ^ c;

            ulong c48 = Rotate(48, c);
            ulong c56 = Rotate(56, c);

            ulong u7 = t ^ c56;
            ulong u6 = Rotate(56, t);
            u6 ^= MulX(u7);
            ulong u5 = Rotate(16, t) ^ c;
            u5 ^= Rotate(40, MulX(u6) ^ c);
            ulong u4 = t ^ c48;
            u4 ^= MulX(u5);
            ulong u3 = Rotate(16, u0);
            u3 ^= MulX(u4);
            ulong u2 = t ^ Rotate(24, c) ^ c48 ^ c56;
            u2 ^= MulX(u3);
            ulong u1 = Rotate(32, t) ^ c ^ c56;
            u1 ^= MulX(u2);
            u0 ^= MulX(Rotate(40, u1));

            return u0;
        }

        private void MixColumnsInv()
        {
            for (int col = 0; col < wordsInBlock; ++col)
            {
                internalState[col] = MixColumnInv(internalState[col]);
            }
        }

        private static ulong MulX(ulong n)
        {
            return ((n & 0x7F7F7F7F7F7F7F7FUL) << 1) ^ (((n & 0x8080808080808080UL) >> 7) * 0x1DUL);
        }

        private static ulong MulX2(ulong n)
        {
            return ((n & 0x3F3F3F3F3F3F3F3FUL) << 2) ^ (((n & 0x8080808080808080UL) >> 6) * 0x1DUL) ^ (((n & 0x4040404040404040UL) >> 6) * 0x1DUL);
        }

        //private static ulong MulX4(ulong n)
        //{
        //    ulong u = n & 0xF0F0F0F0F0F0F0F0UL;
        //    return ((n & 0x0F0F0F0F0F0F0F0FUL) << 4) ^ u ^ (u >> 1) ^ (u >> 2) ^ (u >> 4);
        //}

        /*
         * Pair-wise modular multiplication of 8 byte-pairs.
         * 
         * REDUCTION_POLYNOMIAL is x^8 + x^4 + x^3 + x^2 + 1
         */  
        //private static ulong MultiplyGFx8(ulong u, ulong v, int vMaxDegree)
        //{
        //    ulong r = u & ((v & 0x0101010101010101UL) * 0xFFUL);
        //    for (int i = 1; i <= vMaxDegree; ++i)
        //    {
        //        u = ((u & 0x7F7F7F7F7F7F7F7FUL) << 1) ^ (((u >> 7) & 0x0101010101010101UL) * 0x1DUL);
        //        v >>= 1;

        //        r ^= u & ((v & 0x0101010101010101UL) * 0xFFUL);
        //    }

        //    return r;
        //}

        //private static ulong MultiplyMds(ulong u)
        //{
        //    ulong r = 0, s = 0, t = (u >> 8);
        //    r ^= u & 0x0000001F00000000UL; r <<= 1;
        //    s ^= t & 0x00000000E0000000UL; s <<= 1;
        //    r ^= u & 0x3F3F3F00003F0000UL; r <<= 1;
        //    s ^= t & 0x00C0C0C00000C000UL; s <<= 1;
        //    r ^= u & 0x007F7F0000000000UL; r <<= 1;
        //    s ^= t & 0x0000808000000000UL; s <<= 1;
        //    r ^= u & 0x00FF0000FFFFFFFFUL;
        //    r ^= s ^ (s << 2) ^ (s << 3) ^ (s << 4);
        //    return r;
        //}

        private static ulong Rotate(int n, ulong x)
        {
            return (x >> n) | (x << -n);
        }

        private void RotateLeft(ulong[] x, ulong[] z)
        {
            switch (wordsInBlock)
            {
            case 2:
            {
                ulong x0 = x[0], x1 = x[1];
                z[0] = (x0 >> 56) | (x1 << 8);
                z[1] = (x1 >> 56) | (x0 << 8);
                break;
            }
            case 4:
            {
                ulong x0 = x[0], x1 = x[1], x2 = x[2], x3 = x[3];
                z[0] = (x1 >> 24) | (x2 << 40);
                z[1] = (x2 >> 24) | (x3 << 40);
                z[2] = (x3 >> 24) | (x0 << 40);
                z[3] = (x0 >> 24) | (x1 << 40);
                break;
            }
            case 8:
            {
                ulong x0 = x[0], x1 = x[1], x2 = x[2], x3 = x[3];
                ulong x4 = x[4], x5 = x[5], x6 = x[6], x7 = x[7];
                z[0] = (x2 >> 24) | (x3 << 40);
                z[1] = (x3 >> 24) | (x4 << 40);
                z[2] = (x4 >> 24) | (x5 << 40);
                z[3] = (x5 >> 24) | (x6 << 40);
                z[4] = (x6 >> 24) | (x7 << 40);
                z[5] = (x7 >> 24) | (x0 << 40);
                z[6] = (x0 >> 24) | (x1 << 40);
                z[7] = (x1 >> 24) | (x2 << 40);
                break;
            }
            default:
            {
                throw new InvalidOperationException("unsupported block length: only 128/256/512 are allowed");
            }
            }
        }

#region TABLES AND S-BOXES

        private const ulong mdsMatrix = 0x0407060801050101UL;
        private const ulong mdsInvMatrix = 0xCAD7492FA87695ADUL;

        private static readonly byte[] S0 = new byte[]{
            0xa8, 0x43, 0x5f, 0x06, 0x6b, 0x75, 0x6c, 0x59, 0x71, 0xdf, 0x87, 0x95, 0x17, 0xf0, 0xd8, 0x09, 
            0x6d, 0xf3, 0x1d, 0xcb, 0xc9, 0x4d, 0x2c, 0xaf, 0x79, 0xe0, 0x97, 0xfd, 0x6f, 0x4b, 0x45, 0x39, 
            0x3e, 0xdd, 0xa3, 0x4f, 0xb4, 0xb6, 0x9a, 0x0e, 0x1f, 0xbf, 0x15, 0xe1, 0x49, 0xd2, 0x93, 0xc6, 
            0x92, 0x72, 0x9e, 0x61, 0xd1, 0x63, 0xfa, 0xee, 0xf4, 0x19, 0xd5, 0xad, 0x58, 0xa4, 0xbb, 0xa1, 
            0xdc, 0xf2, 0x83, 0x37, 0x42, 0xe4, 0x7a, 0x32, 0x9c, 0xcc, 0xab, 0x4a, 0x8f, 0x6e, 0x04, 0x27, 
            0x2e, 0xe7, 0xe2, 0x5a, 0x96, 0x16, 0x23, 0x2b, 0xc2, 0x65, 0x66, 0x0f, 0xbc, 0xa9, 0x47, 0x41, 
            0x34, 0x48, 0xfc, 0xb7, 0x6a, 0x88, 0xa5, 0x53, 0x86, 0xf9, 0x5b, 0xdb, 0x38, 0x7b, 0xc3, 0x1e, 
            0x22, 0x33, 0x24, 0x28, 0x36, 0xc7, 0xb2, 0x3b, 0x8e, 0x77, 0xba, 0xf5, 0x14, 0x9f, 0x08, 0x55, 
            0x9b, 0x4c, 0xfe, 0x60, 0x5c, 0xda, 0x18, 0x46, 0xcd, 0x7d, 0x21, 0xb0, 0x3f, 0x1b, 0x89, 0xff, 
            0xeb, 0x84, 0x69, 0x3a, 0x9d, 0xd7, 0xd3, 0x70, 0x67, 0x40, 0xb5, 0xde, 0x5d, 0x30, 0x91, 0xb1, 
            0x78, 0x11, 0x01, 0xe5, 0x00, 0x68, 0x98, 0xa0, 0xc5, 0x02, 0xa6, 0x74, 0x2d, 0x0b, 0xa2, 0x76, 
            0xb3, 0xbe, 0xce, 0xbd, 0xae, 0xe9, 0x8a, 0x31, 0x1c, 0xec, 0xf1, 0x99, 0x94, 0xaa, 0xf6, 0x26, 
            0x2f, 0xef, 0xe8, 0x8c, 0x35, 0x03, 0xd4, 0x7f, 0xfb, 0x05, 0xc1, 0x5e, 0x90, 0x20, 0x3d, 0x82, 
            0xf7, 0xea, 0x0a, 0x0d, 0x7e, 0xf8, 0x50, 0x1a, 0xc4, 0x07, 0x57, 0xb8, 0x3c, 0x62, 0xe3, 0xc8, 
            0xac, 0x52, 0x64, 0x10, 0xd0, 0xd9, 0x13, 0x0c, 0x12, 0x29, 0x51, 0xb9, 0xcf, 0xd6, 0x73, 0x8d, 
            0x81, 0x54, 0xc0, 0xed, 0x4e, 0x44, 0xa7, 0x2a, 0x85, 0x25, 0xe6, 0xca, 0x7c, 0x8b, 0x56, 0x80 
        };

        private static readonly byte[] S1 = new byte[]{
            0xce, 0xbb, 0xeb, 0x92, 0xea, 0xcb, 0x13, 0xc1, 0xe9, 0x3a, 0xd6, 0xb2, 0xd2, 0x90, 0x17, 0xf8, 
            0x42, 0x15, 0x56, 0xb4, 0x65, 0x1c, 0x88, 0x43, 0xc5, 0x5c, 0x36, 0xba, 0xf5, 0x57, 0x67, 0x8d, 
            0x31, 0xf6, 0x64, 0x58, 0x9e, 0xf4, 0x22, 0xaa, 0x75, 0x0f, 0x02, 0xb1, 0xdf, 0x6d, 0x73, 0x4d, 
            0x7c, 0x26, 0x2e, 0xf7, 0x08, 0x5d, 0x44, 0x3e, 0x9f, 0x14, 0xc8, 0xae, 0x54, 0x10, 0xd8, 0xbc, 
            0x1a, 0x6b, 0x69, 0xf3, 0xbd, 0x33, 0xab, 0xfa, 0xd1, 0x9b, 0x68, 0x4e, 0x16, 0x95, 0x91, 0xee, 
            0x4c, 0x63, 0x8e, 0x5b, 0xcc, 0x3c, 0x19, 0xa1, 0x81, 0x49, 0x7b, 0xd9, 0x6f, 0x37, 0x60, 0xca, 
            0xe7, 0x2b, 0x48, 0xfd, 0x96, 0x45, 0xfc, 0x41, 0x12, 0x0d, 0x79, 0xe5, 0x89, 0x8c, 0xe3, 0x20, 
            0x30, 0xdc, 0xb7, 0x6c, 0x4a, 0xb5, 0x3f, 0x97, 0xd4, 0x62, 0x2d, 0x06, 0xa4, 0xa5, 0x83, 0x5f, 
            0x2a, 0xda, 0xc9, 0x00, 0x7e, 0xa2, 0x55, 0xbf, 0x11, 0xd5, 0x9c, 0xcf, 0x0e, 0x0a, 0x3d, 0x51, 
            0x7d, 0x93, 0x1b, 0xfe, 0xc4, 0x47, 0x09, 0x86, 0x0b, 0x8f, 0x9d, 0x6a, 0x07, 0xb9, 0xb0, 0x98, 
            0x18, 0x32, 0x71, 0x4b, 0xef, 0x3b, 0x70, 0xa0, 0xe4, 0x40, 0xff, 0xc3, 0xa9, 0xe6, 0x78, 0xf9, 
            0x8b, 0x46, 0x80, 0x1e, 0x38, 0xe1, 0xb8, 0xa8, 0xe0, 0x0c, 0x23, 0x76, 0x1d, 0x25, 0x24, 0x05, 
            0xf1, 0x6e, 0x94, 0x28, 0x9a, 0x84, 0xe8, 0xa3, 0x4f, 0x77, 0xd3, 0x85, 0xe2, 0x52, 0xf2, 0x82, 
            0x50, 0x7a, 0x2f, 0x74, 0x53, 0xb3, 0x61, 0xaf, 0x39, 0x35, 0xde, 0xcd, 0x1f, 0x99, 0xac, 0xad, 
            0x72, 0x2c, 0xdd, 0xd0, 0x87, 0xbe, 0x5e, 0xa6, 0xec, 0x04, 0xc6, 0x03, 0x34, 0xfb, 0xdb, 0x59, 
            0xb6, 0xc2, 0x01, 0xf0, 0x5a, 0xed, 0xa7, 0x66, 0x21, 0x7f, 0x8a, 0x27, 0xc7, 0xc0, 0x29, 0xd7 
        };

        private static readonly byte[] S2 = new byte[]{
            0x93, 0xd9, 0x9a, 0xb5, 0x98, 0x22, 0x45, 0xfc, 0xba, 0x6a, 0xdf, 0x02, 0x9f, 0xdc, 0x51, 0x59, 
            0x4a, 0x17, 0x2b, 0xc2, 0x94, 0xf4, 0xbb, 0xa3, 0x62, 0xe4, 0x71, 0xd4, 0xcd, 0x70, 0x16, 0xe1, 
            0x49, 0x3c, 0xc0, 0xd8, 0x5c, 0x9b, 0xad, 0x85, 0x53, 0xa1, 0x7a, 0xc8, 0x2d, 0xe0, 0xd1, 0x72, 
            0xa6, 0x2c, 0xc4, 0xe3, 0x76, 0x78, 0xb7, 0xb4, 0x09, 0x3b, 0x0e, 0x41, 0x4c, 0xde, 0xb2, 0x90, 
            0x25, 0xa5, 0xd7, 0x03, 0x11, 0x00, 0xc3, 0x2e, 0x92, 0xef, 0x4e, 0x12, 0x9d, 0x7d, 0xcb, 0x35, 
            0x10, 0xd5, 0x4f, 0x9e, 0x4d, 0xa9, 0x55, 0xc6, 0xd0, 0x7b, 0x18, 0x97, 0xd3, 0x36, 0xe6, 0x48, 
            0x56, 0x81, 0x8f, 0x77, 0xcc, 0x9c, 0xb9, 0xe2, 0xac, 0xb8, 0x2f, 0x15, 0xa4, 0x7c, 0xda, 0x38, 
            0x1e, 0x0b, 0x05, 0xd6, 0x14, 0x6e, 0x6c, 0x7e, 0x66, 0xfd, 0xb1, 0xe5, 0x60, 0xaf, 0x5e, 0x33, 
            0x87, 0xc9, 0xf0, 0x5d, 0x6d, 0x3f, 0x88, 0x8d, 0xc7, 0xf7, 0x1d, 0xe9, 0xec, 0xed, 0x80, 0x29, 
            0x27, 0xcf, 0x99, 0xa8, 0x50, 0x0f, 0x37, 0x24, 0x28, 0x30, 0x95, 0xd2, 0x3e, 0x5b, 0x40, 0x83, 
            0xb3, 0x69, 0x57, 0x1f, 0x07, 0x1c, 0x8a, 0xbc, 0x20, 0xeb, 0xce, 0x8e, 0xab, 0xee, 0x31, 0xa2, 
            0x73, 0xf9, 0xca, 0x3a, 0x1a, 0xfb, 0x0d, 0xc1, 0xfe, 0xfa, 0xf2, 0x6f, 0xbd, 0x96, 0xdd, 0x43, 
            0x52, 0xb6, 0x08, 0xf3, 0xae, 0xbe, 0x19, 0x89, 0x32, 0x26, 0xb0, 0xea, 0x4b, 0x64, 0x84, 0x82, 
            0x6b, 0xf5, 0x79, 0xbf, 0x01, 0x5f, 0x75, 0x63, 0x1b, 0x23, 0x3d, 0x68, 0x2a, 0x65, 0xe8, 0x91, 
            0xf6, 0xff, 0x13, 0x58, 0xf1, 0x47, 0x0a, 0x7f, 0xc5, 0xa7, 0xe7, 0x61, 0x5a, 0x06, 0x46, 0x44, 
            0x42, 0x04, 0xa0, 0xdb, 0x39, 0x86, 0x54, 0xaa, 0x8c, 0x34, 0x21, 0x8b, 0xf8, 0x0c, 0x74, 0x67 
        };

        private static readonly byte[] S3 = new byte[]{
            0x68, 0x8d, 0xca, 0x4d, 0x73, 0x4b, 0x4e, 0x2a, 0xd4, 0x52, 0x26, 0xb3, 0x54, 0x1e, 0x19, 0x1f, 
            0x22, 0x03, 0x46, 0x3d, 0x2d, 0x4a, 0x53, 0x83, 0x13, 0x8a, 0xb7, 0xd5, 0x25, 0x79, 0xf5, 0xbd, 
            0x58, 0x2f, 0x0d, 0x02, 0xed, 0x51, 0x9e, 0x11, 0xf2, 0x3e, 0x55, 0x5e, 0xd1, 0x16, 0x3c, 0x66, 
            0x70, 0x5d, 0xf3, 0x45, 0x40, 0xcc, 0xe8, 0x94, 0x56, 0x08, 0xce, 0x1a, 0x3a, 0xd2, 0xe1, 0xdf, 
            0xb5, 0x38, 0x6e, 0x0e, 0xe5, 0xf4, 0xf9, 0x86, 0xe9, 0x4f, 0xd6, 0x85, 0x23, 0xcf, 0x32, 0x99, 
            0x31, 0x14, 0xae, 0xee, 0xc8, 0x48, 0xd3, 0x30, 0xa1, 0x92, 0x41, 0xb1, 0x18, 0xc4, 0x2c, 0x71, 
            0x72, 0x44, 0x15, 0xfd, 0x37, 0xbe, 0x5f, 0xaa, 0x9b, 0x88, 0xd8, 0xab, 0x89, 0x9c, 0xfa, 0x60, 
            0xea, 0xbc, 0x62, 0x0c, 0x24, 0xa6, 0xa8, 0xec, 0x67, 0x20, 0xdb, 0x7c, 0x28, 0xdd, 0xac, 0x5b, 
            0x34, 0x7e, 0x10, 0xf1, 0x7b, 0x8f, 0x63, 0xa0, 0x05, 0x9a, 0x43, 0x77, 0x21, 0xbf, 0x27, 0x09, 
            0xc3, 0x9f, 0xb6, 0xd7, 0x29, 0xc2, 0xeb, 0xc0, 0xa4, 0x8b, 0x8c, 0x1d, 0xfb, 0xff, 0xc1, 0xb2, 
            0x97, 0x2e, 0xf8, 0x65, 0xf6, 0x75, 0x07, 0x04, 0x49, 0x33, 0xe4, 0xd9, 0xb9, 0xd0, 0x42, 0xc7, 
            0x6c, 0x90, 0x00, 0x8e, 0x6f, 0x50, 0x01, 0xc5, 0xda, 0x47, 0x3f, 0xcd, 0x69, 0xa2, 0xe2, 0x7a, 
            0xa7, 0xc6, 0x93, 0x0f, 0x0a, 0x06, 0xe6, 0x2b, 0x96, 0xa3, 0x1c, 0xaf, 0x6a, 0x12, 0x84, 0x39, 
            0xe7, 0xb0, 0x82, 0xf7, 0xfe, 0x9d, 0x87, 0x5c, 0x81, 0x35, 0xde, 0xb4, 0xa5, 0xfc, 0x80, 0xef, 
            0xcb, 0xbb, 0x6b, 0x76, 0xba, 0x5a, 0x7d, 0x78, 0x0b, 0x95, 0xe3, 0xad, 0x74, 0x98, 0x3b, 0x36, 
            0x64, 0x6d, 0xdc, 0xf0, 0x59, 0xa9, 0x4c, 0x17, 0x7f, 0x91, 0xb8, 0xc9, 0x57, 0x1b, 0xe0, 0x61 
        };

        private static readonly byte[] T0 = new byte[]{
	        0xa4, 0xa2, 0xa9, 0xc5, 0x4e, 0xc9, 0x03, 0xd9, 0x7e, 0x0f, 0xd2, 0xad, 0xe7, 0xd3, 0x27, 0x5b, 
	        0xe3, 0xa1, 0xe8, 0xe6, 0x7c, 0x2a, 0x55, 0x0c, 0x86, 0x39, 0xd7, 0x8d, 0xb8, 0x12, 0x6f, 0x28, 
	        0xcd, 0x8a, 0x70, 0x56, 0x72, 0xf9, 0xbf, 0x4f, 0x73, 0xe9, 0xf7, 0x57, 0x16, 0xac, 0x50, 0xc0, 
	        0x9d, 0xb7, 0x47, 0x71, 0x60, 0xc4, 0x74, 0x43, 0x6c, 0x1f, 0x93, 0x77, 0xdc, 0xce, 0x20, 0x8c, 
	        0x99, 0x5f, 0x44, 0x01, 0xf5, 0x1e, 0x87, 0x5e, 0x61, 0x2c, 0x4b, 0x1d, 0x81, 0x15, 0xf4, 0x23, 
	        0xd6, 0xea, 0xe1, 0x67, 0xf1, 0x7f, 0xfe, 0xda, 0x3c, 0x07, 0x53, 0x6a, 0x84, 0x9c, 0xcb, 0x02, 
	        0x83, 0x33, 0xdd, 0x35, 0xe2, 0x59, 0x5a, 0x98, 0xa5, 0x92, 0x64, 0x04, 0x06, 0x10, 0x4d, 0x1c, 
	        0x97, 0x08, 0x31, 0xee, 0xab, 0x05, 0xaf, 0x79, 0xa0, 0x18, 0x46, 0x6d, 0xfc, 0x89, 0xd4, 0xc7, 
	        0xff, 0xf0, 0xcf, 0x42, 0x91, 0xf8, 0x68, 0x0a, 0x65, 0x8e, 0xb6, 0xfd, 0xc3, 0xef, 0x78, 0x4c, 
	        0xcc, 0x9e, 0x30, 0x2e, 0xbc, 0x0b, 0x54, 0x1a, 0xa6, 0xbb, 0x26, 0x80, 0x48, 0x94, 0x32, 0x7d, 
	        0xa7, 0x3f, 0xae, 0x22, 0x3d, 0x66, 0xaa, 0xf6, 0x00, 0x5d, 0xbd, 0x4a, 0xe0, 0x3b, 0xb4, 0x17, 
	        0x8b, 0x9f, 0x76, 0xb0, 0x24, 0x9a, 0x25, 0x63, 0xdb, 0xeb, 0x7a, 0x3e, 0x5c, 0xb3, 0xb1, 0x29, 
	        0xf2, 0xca, 0x58, 0x6e, 0xd8, 0xa8, 0x2f, 0x75, 0xdf, 0x14, 0xfb, 0x13, 0x49, 0x88, 0xb2, 0xec, 
	        0xe4, 0x34, 0x2d, 0x96, 0xc6, 0x3a, 0xed, 0x95, 0x0e, 0xe5, 0x85, 0x6b, 0x40, 0x21, 0x9b, 0x09, 
	        0x19, 0x2b, 0x52, 0xde, 0x45, 0xa3, 0xfa, 0x51, 0xc2, 0xb5, 0xd1, 0x90, 0xb9, 0xf3, 0x37, 0xc1, 
	        0x0d, 0xba, 0x41, 0x11, 0x38, 0x7b, 0xbe, 0xd0, 0xd5, 0x69, 0x36, 0xc8, 0x62, 0x1b, 0x82, 0x8f
        };

        private static readonly byte[] T1 = new byte[]{
            0x83, 0xf2, 0x2a, 0xeb, 0xe9, 0xbf, 0x7b, 0x9c, 0x34, 0x96, 0x8d, 0x98, 0xb9, 0x69, 0x8c, 0x29, 
            0x3d, 0x88, 0x68, 0x06, 0x39, 0x11, 0x4c, 0x0e, 0xa0, 0x56, 0x40, 0x92, 0x15, 0xbc, 0xb3, 0xdc, 
            0x6f, 0xf8, 0x26, 0xba, 0xbe, 0xbd, 0x31, 0xfb, 0xc3, 0xfe, 0x80, 0x61, 0xe1, 0x7a, 0x32, 0xd2, 
            0x70, 0x20, 0xa1, 0x45, 0xec, 0xd9, 0x1a, 0x5d, 0xb4, 0xd8, 0x09, 0xa5, 0x55, 0x8e, 0x37, 0x76, 
            0xa9, 0x67, 0x10, 0x17, 0x36, 0x65, 0xb1, 0x95, 0x62, 0x59, 0x74, 0xa3, 0x50, 0x2f, 0x4b, 0xc8, 
            0xd0, 0x8f, 0xcd, 0xd4, 0x3c, 0x86, 0x12, 0x1d, 0x23, 0xef, 0xf4, 0x53, 0x19, 0x35, 0xe6, 0x7f, 
            0x5e, 0xd6, 0x79, 0x51, 0x22, 0x14, 0xf7, 0x1e, 0x4a, 0x42, 0x9b, 0x41, 0x73, 0x2d, 0xc1, 0x5c, 
            0xa6, 0xa2, 0xe0, 0x2e, 0xd3, 0x28, 0xbb, 0xc9, 0xae, 0x6a, 0xd1, 0x5a, 0x30, 0x90, 0x84, 0xf9, 
            0xb2, 0x58, 0xcf, 0x7e, 0xc5, 0xcb, 0x97, 0xe4, 0x16, 0x6c, 0xfa, 0xb0, 0x6d, 0x1f, 0x52, 0x99, 
            0x0d, 0x4e, 0x03, 0x91, 0xc2, 0x4d, 0x64, 0x77, 0x9f, 0xdd, 0xc4, 0x49, 0x8a, 0x9a, 0x24, 0x38, 
            0xa7, 0x57, 0x85, 0xc7, 0x7c, 0x7d, 0xe7, 0xf6, 0xb7, 0xac, 0x27, 0x46, 0xde, 0xdf, 0x3b, 0xd7, 
            0x9e, 0x2b, 0x0b, 0xd5, 0x13, 0x75, 0xf0, 0x72, 0xb6, 0x9d, 0x1b, 0x01, 0x3f, 0x44, 0xe5, 0x87, 
            0xfd, 0x07, 0xf1, 0xab, 0x94, 0x18, 0xea, 0xfc, 0x3a, 0x82, 0x5f, 0x05, 0x54, 0xdb, 0x00, 0x8b, 
            0xe3, 0x48, 0x0c, 0xca, 0x78, 0x89, 0x0a, 0xff, 0x3e, 0x5b, 0x81, 0xee, 0x71, 0xe2, 0xda, 0x2c, 
            0xb8, 0xb5, 0xcc, 0x6e, 0xa8, 0x6b, 0xad, 0x60, 0xc6, 0x08, 0x04, 0x02, 0xe8, 0xf5, 0x4f, 0xa4, 
            0xf3, 0xc0, 0xce, 0x43, 0x25, 0x1c, 0x21, 0x33, 0x0f, 0xaf, 0x47, 0xed, 0x66, 0x63, 0x93, 0xaa
        };

        private static readonly byte[] T2 = new byte[]{
            0x45, 0xd4, 0x0b, 0x43, 0xf1, 0x72, 0xed, 0xa4, 0xc2, 0x38, 0xe6, 0x71, 0xfd, 0xb6, 0x3a, 0x95, 
            0x50, 0x44, 0x4b, 0xe2, 0x74, 0x6b, 0x1e, 0x11, 0x5a, 0xc6, 0xb4, 0xd8, 0xa5, 0x8a, 0x70, 0xa3, 
            0xa8, 0xfa, 0x05, 0xd9, 0x97, 0x40, 0xc9, 0x90, 0x98, 0x8f, 0xdc, 0x12, 0x31, 0x2c, 0x47, 0x6a, 
            0x99, 0xae, 0xc8, 0x7f, 0xf9, 0x4f, 0x5d, 0x96, 0x6f, 0xf4, 0xb3, 0x39, 0x21, 0xda, 0x9c, 0x85, 
            0x9e, 0x3b, 0xf0, 0xbf, 0xef, 0x06, 0xee, 0xe5, 0x5f, 0x20, 0x10, 0xcc, 0x3c, 0x54, 0x4a, 0x52, 
            0x94, 0x0e, 0xc0, 0x28, 0xf6, 0x56, 0x60, 0xa2, 0xe3, 0x0f, 0xec, 0x9d, 0x24, 0x83, 0x7e, 0xd5, 
            0x7c, 0xeb, 0x18, 0xd7, 0xcd, 0xdd, 0x78, 0xff, 0xdb, 0xa1, 0x09, 0xd0, 0x76, 0x84, 0x75, 0xbb, 
            0x1d, 0x1a, 0x2f, 0xb0, 0xfe, 0xd6, 0x34, 0x63, 0x35, 0xd2, 0x2a, 0x59, 0x6d, 0x4d, 0x77, 0xe7, 
            0x8e, 0x61, 0xcf, 0x9f, 0xce, 0x27, 0xf5, 0x80, 0x86, 0xc7, 0xa6, 0xfb, 0xf8, 0x87, 0xab, 0x62, 
            0x3f, 0xdf, 0x48, 0x00, 0x14, 0x9a, 0xbd, 0x5b, 0x04, 0x92, 0x02, 0x25, 0x65, 0x4c, 0x53, 0x0c, 
            0xf2, 0x29, 0xaf, 0x17, 0x6c, 0x41, 0x30, 0xe9, 0x93, 0x55, 0xf7, 0xac, 0x68, 0x26, 0xc4, 0x7d, 
            0xca, 0x7a, 0x3e, 0xa0, 0x37, 0x03, 0xc1, 0x36, 0x69, 0x66, 0x08, 0x16, 0xa7, 0xbc, 0xc5, 0xd3, 
            0x22, 0xb7, 0x13, 0x46, 0x32, 0xe8, 0x57, 0x88, 0x2b, 0x81, 0xb2, 0x4e, 0x64, 0x1c, 0xaa, 0x91, 
            0x58, 0x2e, 0x9b, 0x5c, 0x1b, 0x51, 0x73, 0x42, 0x23, 0x01, 0x6e, 0xf3, 0x0d, 0xbe, 0x3d, 0x0a, 
            0x2d, 0x1f, 0x67, 0x33, 0x19, 0x7b, 0x5e, 0xea, 0xde, 0x8b, 0xcb, 0xa9, 0x8c, 0x8d, 0xad, 0x49, 
            0x82, 0xe4, 0xba, 0xc3, 0x15, 0xd1, 0xe0, 0x89, 0xfc, 0xb1, 0xb9, 0xb5, 0x07, 0x79, 0xb8, 0xe1
        };

        private static readonly byte[] T3 = new byte[]{
            0xb2, 0xb6, 0x23, 0x11, 0xa7, 0x88, 0xc5, 0xa6, 0x39, 0x8f, 0xc4, 0xe8, 0x73, 0x22, 0x43, 0xc3, 
            0x82, 0x27, 0xcd, 0x18, 0x51, 0x62, 0x2d, 0xf7, 0x5c, 0x0e, 0x3b, 0xfd, 0xca, 0x9b, 0x0d, 0x0f, 
            0x79, 0x8c, 0x10, 0x4c, 0x74, 0x1c, 0x0a, 0x8e, 0x7c, 0x94, 0x07, 0xc7, 0x5e, 0x14, 0xa1, 0x21, 
            0x57, 0x50, 0x4e, 0xa9, 0x80, 0xd9, 0xef, 0x64, 0x41, 0xcf, 0x3c, 0xee, 0x2e, 0x13, 0x29, 0xba, 
            0x34, 0x5a, 0xae, 0x8a, 0x61, 0x33, 0x12, 0xb9, 0x55, 0xa8, 0x15, 0x05, 0xf6, 0x03, 0x06, 0x49, 
            0xb5, 0x25, 0x09, 0x16, 0x0c, 0x2a, 0x38, 0xfc, 0x20, 0xf4, 0xe5, 0x7f, 0xd7, 0x31, 0x2b, 0x66, 
            0x6f, 0xff, 0x72, 0x86, 0xf0, 0xa3, 0x2f, 0x78, 0x00, 0xbc, 0xcc, 0xe2, 0xb0, 0xf1, 0x42, 0xb4, 
            0x30, 0x5f, 0x60, 0x04, 0xec, 0xa5, 0xe3, 0x8b, 0xe7, 0x1d, 0xbf, 0x84, 0x7b, 0xe6, 0x81, 0xf8, 
            0xde, 0xd8, 0xd2, 0x17, 0xce, 0x4b, 0x47, 0xd6, 0x69, 0x6c, 0x19, 0x99, 0x9a, 0x01, 0xb3, 0x85, 
            0xb1, 0xf9, 0x59, 0xc2, 0x37, 0xe9, 0xc8, 0xa0, 0xed, 0x4f, 0x89, 0x68, 0x6d, 0xd5, 0x26, 0x91, 
            0x87, 0x58, 0xbd, 0xc9, 0x98, 0xdc, 0x75, 0xc0, 0x76, 0xf5, 0x67, 0x6b, 0x7e, 0xeb, 0x52, 0xcb, 
            0xd1, 0x5b, 0x9f, 0x0b, 0xdb, 0x40, 0x92, 0x1a, 0xfa, 0xac, 0xe4, 0xe1, 0x71, 0x1f, 0x65, 0x8d, 
            0x97, 0x9e, 0x95, 0x90, 0x5d, 0xb7, 0xc1, 0xaf, 0x54, 0xfb, 0x02, 0xe0, 0x35, 0xbb, 0x3a, 0x4d, 
            0xad, 0x2c, 0x3d, 0x56, 0x08, 0x1b, 0x4a, 0x93, 0x6a, 0xab, 0xb8, 0x7a, 0xf2, 0x7d, 0xda, 0x3f, 
            0xfe, 0x3e, 0xbe, 0xea, 0xaa, 0x44, 0xc6, 0xd0, 0x36, 0x48, 0x70, 0x96, 0x77, 0x24, 0x53, 0xdf, 
            0xf3, 0x83, 0x28, 0x32, 0x45, 0x1e, 0xa4, 0xd3, 0xa2, 0x46, 0x6e, 0x9c, 0xdd, 0x63, 0xd4, 0x9d
        };

#endregion

        public virtual string AlgorithmName
        {
            get { return "DSTU7624"; }
        }

        public virtual int GetBlockSize()
        {
            return wordsInBlock << 3;
        }
    }
}
