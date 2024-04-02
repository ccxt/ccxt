using System;

using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Digests
{
    /*
      The BLAKE2 cryptographic hash function was designed by Jean-
      Philippe Aumasson, Samuel Neves, Zooko Wilcox-O'Hearn, and Christian
      Winnerlein.

      Reference Implementation and Description can be found at: https://blake2.net/
      RFC: https://tools.ietf.org/html/rfc7693

      This implementation does not support the Tree Hashing Mode.

      For unkeyed hashing, developers adapting BLAKE2 to ASN.1 - based
      message formats SHOULD use the OID tree at x = 1.3.6.1.4.1.1722.12.2.

             Algorithm     | Target | Collision | Hash | Hash ASN.1 |
                Identifier |  Arch  |  Security |  nn  | OID Suffix |
            ---------------+--------+-----------+------+------------+
             id-blake2s128 | 32-bit |   2**64   |  16  |   x.2.4    |
             id-blake2s160 | 32-bit |   2**80   |  20  |   x.2.5    |
             id-blake2s224 | 32-bit |   2**112  |  28  |   x.2.7    |
             id-blake2s256 | 32-bit |   2**128  |  32  |   x.2.8    |
            ---------------+--------+-----------+------+------------+
     */

    /**
     * Implementation of the cryptographic hash function BLAKE2s.
     * <p/>
     * BLAKE2s offers a built-in keying mechanism to be used directly
     * for authentication ("Prefix-MAC") rather than a HMAC construction.
     * <p/>
     * BLAKE2s offers a built-in support for a salt for randomized hashing
     * and a personal string for defining a unique hash function for each application.
     * <p/>
     * BLAKE2s is optimized for 32-bit platforms and produces digests of any size
     * between 1 and 32 bytes.
     */
    public class Blake2sDigest
        : IDigest
    {
        /**
         * BLAKE2s Initialization Vector
         **/
        private static readonly uint[] blake2s_IV =
            // Produced from the square root of primes 2, 3, 5, 7, 11, 13, 17, 19.
            // The same as SHA-256 IV.
            {
                0x6a09e667, 0xbb67ae85, 0x3c6ef372,
                0xa54ff53a, 0x510e527f, 0x9b05688c,
                0x1f83d9ab, 0x5be0cd19
            };

        /**
         * Message word permutations
         **/
        private static readonly byte[,] blake2s_sigma =
            {
                { 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 },
                { 14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3 },
                { 11, 8, 12, 0, 5, 2, 15, 13, 10, 14, 3, 6, 7, 1, 9, 4 },
                { 7, 9, 3, 1, 13, 12, 11, 14, 2, 6, 5, 10, 4, 0, 15, 8 },
                { 9, 0, 5, 7, 2, 4, 10, 15, 14, 1, 11, 12, 6, 8, 3, 13 },
                { 2, 12, 6, 10, 0, 11, 8, 3, 4, 13, 7, 5, 15, 14, 1, 9 },
                { 12, 5, 1, 15, 14, 13, 4, 10, 0, 7, 6, 3, 9, 2, 8, 11 },
                { 13, 11, 7, 14, 12, 1, 3, 9, 5, 0, 15, 4, 8, 6, 2, 10 },
                { 6, 15, 14, 9, 11, 3, 0, 8, 12, 2, 13, 7, 1, 4, 10, 5 },
                { 10, 2, 8, 4, 7, 6, 1, 5, 15, 11, 9, 14, 3, 12, 13, 0 }
            };

        private const int ROUNDS = 10; // to use for Catenas H'
        private const int BLOCK_LENGTH_BYTES = 64;// bytes

        // General parameters:
        private int digestLength = 32; // 1- 32 bytes
        private int keyLength = 0; // 0 - 32 bytes for keyed hashing for MAC
        private byte[] salt = null;
        private byte[] personalization = null;
        private byte[] key = null;

        // Tree hashing parameters:
        // Because this class does not implement the Tree Hashing Mode,
        // these parameters can be treated as constants (see Init() function)
	    /*
	     * private int fanout = 1; // 0-255
	     * private int depth = 1; // 1 - 255
	     * private int leafLength= 0;
	     * private long nodeOffset = 0L;
	     * private int nodeDepth = 0;
	     * private int innerHashLength = 0;
	     */

        /**
         * Whenever this buffer overflows, it will be processed in the Compress()
         * function. For performance issues, long messages will not use this buffer.
         */
        private byte[] buffer = null;
        /**
         * Position of last inserted byte
         **/
        private int bufferPos = 0;// a value from 0 up to BLOCK_LENGTH_BYTES

        /**
         * Internal state, in the BLAKE2 paper it is called v
         **/
        private uint[] internalState = new uint[16];
        /**
         * State vector, in the BLAKE2 paper it is called h
         **/
        private uint[] chainValue = null;

        // counter (counts bytes): Length up to 2^64 are supported
        /**
         * holds least significant bits of counter
         **/
        private uint t0 = 0;
        /**
         * holds most significant bits of counter
         **/
        private uint t1 = 0;
        /**
         * finalization flag, for last block: ~0
         **/
        private uint f0 = 0;

        // For Tree Hashing Mode, not used here:
        // private long f1 = 0L; // finalization flag, for last node: ~0L

        /**
         * BLAKE2s-256 for hashing.
         */
        public Blake2sDigest()
            : this(256)
        {
        }

        public Blake2sDigest(Blake2sDigest digest)
        {
            this.bufferPos = digest.bufferPos;
            this.buffer = Arrays.Clone(digest.buffer);
            this.keyLength = digest.keyLength;
            this.key = Arrays.Clone(digest.key);
            this.digestLength = digest.digestLength;
            this.chainValue = Arrays.Clone(digest.chainValue);
            this.personalization = Arrays.Clone(digest.personalization);
        }

        /**
         * BLAKE2s for hashing.
         *
         * @param digestBits the desired digest length in bits. Must be a multiple of 8 and less than 256.
         */
        public Blake2sDigest(int digestBits)
        {
            if (digestBits < 8 || digestBits > 256 || digestBits % 8 != 0)
                throw new ArgumentException("BLAKE2s digest bit length must be a multiple of 8 and not greater than 256");

            buffer = new byte[BLOCK_LENGTH_BYTES];
            keyLength = 0;
            digestLength = digestBits / 8;
            Init();
        }

        /**
         * BLAKE2s for authentication ("Prefix-MAC mode").
         * <p/>
         * After calling the doFinal() method, the key will remain to be used for
         * further computations of this instance. The key can be overwritten using
         * the clearKey() method.
         *
         * @param key a key up to 32 bytes or null
         */
        public Blake2sDigest(byte[] key)
        {
            buffer = new byte[BLOCK_LENGTH_BYTES];
            if (key != null)
            {
                if (key.Length > 32)
                    throw new ArgumentException("Keys > 32 are not supported");

                this.key = new byte[key.Length];
                Array.Copy(key, 0, this.key, 0, key.Length);

                keyLength = key.Length;
                Array.Copy(key, 0, buffer, 0, key.Length);
                bufferPos = BLOCK_LENGTH_BYTES; // zero padding
            }
            digestLength = 32;
            Init();
        }

        /**
         * BLAKE2s with key, required digest length, salt and personalization.
         * <p/>
         * After calling the doFinal() method, the key, the salt and the personal
         * string will remain and might be used for further computations with this
         * instance. The key can be overwritten using the clearKey() method, the
         * salt (pepper) can be overwritten using the clearSalt() method.
         *
         * @param key             a key up to 32 bytes or null
         * @param digestBytes     from 1 up to 32 bytes
         * @param salt            8 bytes or null
         * @param personalization 8 bytes or null
         */
        public Blake2sDigest(byte[] key, int digestBytes, byte[] salt,
                             byte[] personalization)
        {
            if (digestBytes < 1 || digestBytes > 32)
                throw new ArgumentException("Invalid digest length (required: 1 - 32)");

            this.digestLength = digestBytes;
            this.buffer = new byte[BLOCK_LENGTH_BYTES];

            if (salt != null)
            {
                if (salt.Length != 8)
                    throw new ArgumentException("Salt length must be exactly 8 bytes");

                this.salt = new byte[8];
                Array.Copy(salt, 0, this.salt, 0, salt.Length);
            }
            if (personalization != null)
            {
                if (personalization.Length != 8)
                    throw new ArgumentException("Personalization length must be exactly 8 bytes");

                this.personalization = new byte[8];
                Array.Copy(personalization, 0, this.personalization, 0, personalization.Length);
            }
            if (key != null)
            {
                if (key.Length > 32)
                    throw new ArgumentException("Keys > 32 bytes are not supported");

                this.key = new byte[key.Length];
                Array.Copy(key, 0, this.key, 0, key.Length);

                keyLength = key.Length;
                Array.Copy(key, 0, buffer, 0, key.Length);
                bufferPos = BLOCK_LENGTH_BYTES; // zero padding
            }
            Init();
        }

        // initialize chainValue
        private void Init()
        {
            if (chainValue == null)
            {
                chainValue = new uint[8];

                chainValue[0] = blake2s_IV[0] ^ (uint)(digestLength | (keyLength << 8) | 0x1010000);
                // 0x1010000 = ((fanout << 16) | (depth << 24));
                // with fanout = 1; depth = 0;
                chainValue[1] = blake2s_IV[1];// ^ leafLength; with leafLength = 0;
                chainValue[2] = blake2s_IV[2];// ^ nodeOffset; with nodeOffset = 0;
                chainValue[3] = blake2s_IV[3];// ^ ( (nodeOffset << 32) | (nodeDepth << 16) | (innerHashLength << 24) );
                // with nodeDepth = 0; innerHashLength = 0;

                chainValue[4] = blake2s_IV[4];
                chainValue[5] = blake2s_IV[5];
                if (salt != null)
                {
                    chainValue[4] ^= Pack.LE_To_UInt32(salt, 0);
                    chainValue[5] ^= Pack.LE_To_UInt32(salt, 4);
                }

                chainValue[6] = blake2s_IV[6];
                chainValue[7] = blake2s_IV[7];
                if (personalization != null)
                {
                    chainValue[6] ^= Pack.LE_To_UInt32(personalization, 0);
                    chainValue[7] ^= Pack.LE_To_UInt32(personalization, 4);
                }
            }
        }

        private void InitializeInternalState()
        {
            // initialize v:
            Array.Copy(chainValue, 0, internalState, 0, chainValue.Length);
            Array.Copy(blake2s_IV, 0, internalState, chainValue.Length, 4);
            internalState[12] = t0 ^ blake2s_IV[4];
            internalState[13] = t1 ^ blake2s_IV[5];
            internalState[14] = f0 ^ blake2s_IV[6];
            internalState[15] = blake2s_IV[7];// ^ f1 with f1 = 0
        }

        /**
         * Update the message digest with a single byte.
         *
         * @param b the input byte to be entered.
         */
        public virtual void Update(byte b)
        {
            int remainingLength; // left bytes of buffer

            // process the buffer if full else add to buffer:
            remainingLength = BLOCK_LENGTH_BYTES - bufferPos;
            if (remainingLength == 0)
            { // full buffer
                t0 += BLOCK_LENGTH_BYTES;
                if (t0 == 0)
                { // if message > 2^32
                    t1++;
                }
                Compress(buffer, 0);
                Array.Clear(buffer, 0, buffer.Length);// clear buffer
                buffer[0] = b;
                bufferPos = 1;
            }
            else
            {
                buffer[bufferPos] = b;
                bufferPos++;
            }
        }

        /**
         * Update the message digest with a block of bytes.
         *
         * @param message the byte array containing the data.
         * @param offset  the offset into the byte array where the data starts.
         * @param len     the length of the data.
         */
        public virtual void BlockUpdate(byte[] message, int offset, int len)
        {
            if (message == null || len == 0)
                return;

            int remainingLength = 0; // left bytes of buffer

            if (bufferPos != 0)
            { // commenced, incomplete buffer

                // complete the buffer:
                remainingLength = BLOCK_LENGTH_BYTES - bufferPos;
                if (remainingLength < len)
                { // full buffer + at least 1 byte
                    Array.Copy(message, offset, buffer, bufferPos, remainingLength);
                    t0 += BLOCK_LENGTH_BYTES;
                    if (t0 == 0)
                    { // if message > 2^32
                        t1++;
                    }
                    Compress(buffer, 0);
                    bufferPos = 0;
                    Array.Clear(buffer, 0, buffer.Length);// clear buffer
                }
                else
                {
                    Array.Copy(message, offset, buffer, bufferPos, len);
                    bufferPos += len;
                    return;
                }
            }

            // process blocks except last block (also if last block is full)
            int messagePos;
            int blockWiseLastPos = offset + len - BLOCK_LENGTH_BYTES;
            for (messagePos = offset + remainingLength;
                 messagePos < blockWiseLastPos;
                 messagePos += BLOCK_LENGTH_BYTES)
            { // block wise 64 bytes
                // without buffer:
                t0 += BLOCK_LENGTH_BYTES;
                if (t0 == 0)
                {
                    t1++;
                }
                Compress(message, messagePos);
            }

            // fill the buffer with left bytes, this might be a full block
            Array.Copy(message, messagePos, buffer, 0, offset + len
                - messagePos);
            bufferPos += offset + len - messagePos;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual void BlockUpdate(ReadOnlySpan<byte> input)
        {
            if (input.IsEmpty)
                return;

            int remainingLength = 0; // left bytes of buffer

            if (bufferPos != 0)
            { // commenced, incomplete buffer

                // complete the buffer:
                remainingLength = BLOCK_LENGTH_BYTES - bufferPos;
                if (remainingLength < input.Length)
                { // full buffer + at least 1 byte
                    input[..remainingLength].CopyTo(buffer.AsSpan(bufferPos));
                    t0 += BLOCK_LENGTH_BYTES;
                    if (t0 == 0)
                    { // if message > 2^32
                        t1++;
                    }
                    Compress(buffer, 0);
                    bufferPos = 0;
                    Array.Clear(buffer, 0, buffer.Length);// clear buffer
                }
                else
                {
                    input.CopyTo(buffer.AsSpan(bufferPos));
                    bufferPos += input.Length;
                    return;
                }
            }

            // process blocks except last block (also if last block is full)
            int messagePos;
            int blockWiseLastPos = input.Length - BLOCK_LENGTH_BYTES;
            for (messagePos = remainingLength;
                 messagePos < blockWiseLastPos;
                 messagePos += BLOCK_LENGTH_BYTES)
            { // block wise 64 bytes
                // without buffer:
                t0 += BLOCK_LENGTH_BYTES;
                if (t0 == 0)
                {
                    t1++;
                }
                Compress(input[messagePos..]);
            }

            // fill the buffer with left bytes, this might be a full block
            input[messagePos..].CopyTo(buffer.AsSpan());
            bufferPos += input.Length - messagePos;
        }
#endif

        /**
         * Close the digest, producing the final digest value. The doFinal() call
         * leaves the digest reset. Key, salt and personal string remain.
         *
         * @param out       the array the digest is to be copied into.
         * @param outOffset the offset into the out array the digest is to start at.
         */
        public virtual int DoFinal(byte[] output, int outOffset)
        {
            f0 = 0xFFFFFFFFU;
            t0 += (uint)bufferPos;
            // bufferPos may be < 64, so (t0 == 0) does not work
            // for 2^32 < message length > 2^32 - 63
            if ((t0 < 0) && (bufferPos > -t0))
            {
                t1++;
            }
            Compress(buffer, 0);
            Array.Clear(buffer, 0, buffer.Length);// Holds eventually the key if input is null
            Array.Clear(internalState, 0, internalState.Length);

            int full = digestLength >> 2, partial = digestLength & 3;
            Pack.UInt32_To_LE(chainValue, 0, full, output, outOffset);
            if (partial > 0)
            {
                byte[] bytes = new byte[4];
                Pack.UInt32_To_LE(chainValue[full], bytes, 0);
                Array.Copy(bytes, 0, output, outOffset + digestLength - partial, partial);
            }

            Array.Clear(chainValue, 0, chainValue.Length);

            Reset();

            return digestLength;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual int DoFinal(Span<byte> output)
        {
            f0 = 0xFFFFFFFFU;
            t0 += (uint)bufferPos;
            // bufferPos may be < 64, so (t0 == 0) does not work
            // for 2^32 < message length > 2^32 - 63
            if ((t0 < 0) && (bufferPos > -t0))
            {
                t1++;
            }
            Compress(buffer, 0);
            Array.Clear(buffer, 0, buffer.Length);// Holds eventually the key if input is null
            Array.Clear(internalState, 0, internalState.Length);

            int full = digestLength >> 2, partial = digestLength & 3;
            Pack.UInt32_To_LE(chainValue.AsSpan(0, full), output);
            if (partial > 0)
            {
                Span<byte> bytes = stackalloc byte[4];
                Pack.UInt32_To_LE(chainValue[full], bytes);
                bytes[..partial].CopyTo(output[(digestLength - partial)..]);
            }

            Array.Clear(chainValue, 0, chainValue.Length);

            Reset();

            return digestLength;
        }
#endif

        /**
         * Reset the digest back to its initial state. The key, the salt and the
         * personal string will remain for further computations.
         */
        public virtual void Reset()
        {
            bufferPos = 0;
            f0 = 0;
            t0 = 0;
            t1 = 0;
            chainValue = null;
            Array.Clear(buffer, 0, buffer.Length);
            if (key != null)
            {
                Array.Copy(key, 0, buffer, 0, key.Length);
                bufferPos = BLOCK_LENGTH_BYTES; // zero padding
            }
            Init();
        }

        private void Compress(byte[] message, int messagePos)
        {
            InitializeInternalState();

            uint[] m = new uint[16];
            Pack.LE_To_UInt32(message, messagePos, m);

            for (int round = 0; round < ROUNDS; round++)
            {
                // G apply to columns of internalState: m[blake2s_sigma[round][2 * blockPos]] /+1
                G(m[blake2s_sigma[round,0]], m[blake2s_sigma[round,1]], 0, 4, 8, 12);
                G(m[blake2s_sigma[round,2]], m[blake2s_sigma[round,3]], 1, 5, 9, 13);
                G(m[blake2s_sigma[round,4]], m[blake2s_sigma[round,5]], 2, 6, 10, 14);
                G(m[blake2s_sigma[round,6]], m[blake2s_sigma[round,7]], 3, 7, 11, 15);
                // G apply to diagonals of internalState:
                G(m[blake2s_sigma[round,8]], m[blake2s_sigma[round,9]], 0, 5, 10, 15);
                G(m[blake2s_sigma[round,10]], m[blake2s_sigma[round,11]], 1, 6, 11, 12);
                G(m[blake2s_sigma[round,12]], m[blake2s_sigma[round,13]], 2, 7, 8, 13);
                G(m[blake2s_sigma[round,14]], m[blake2s_sigma[round,15]], 3, 4, 9, 14);
            }

            // update chain values:
            for (int offset = 0; offset < chainValue.Length; offset++)
            {
                chainValue[offset] = chainValue[offset] ^ internalState[offset] ^ internalState[offset + 8];
            }
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        private void Compress(ReadOnlySpan<byte> message)
        {
            InitializeInternalState();

            Span<uint> m = stackalloc uint[16];
            Pack.LE_To_UInt32(message, m);

            for (int round = 0; round < ROUNDS; round++)
            {
                // G apply to columns of internalState: m[blake2s_sigma[round][2 * blockPos]] /+1
                G(m[blake2s_sigma[round, 0]], m[blake2s_sigma[round, 1]], 0, 4, 8, 12);
                G(m[blake2s_sigma[round, 2]], m[blake2s_sigma[round, 3]], 1, 5, 9, 13);
                G(m[blake2s_sigma[round, 4]], m[blake2s_sigma[round, 5]], 2, 6, 10, 14);
                G(m[blake2s_sigma[round, 6]], m[blake2s_sigma[round, 7]], 3, 7, 11, 15);
                // G apply to diagonals of internalState:
                G(m[blake2s_sigma[round, 8]], m[blake2s_sigma[round, 9]], 0, 5, 10, 15);
                G(m[blake2s_sigma[round, 10]], m[blake2s_sigma[round, 11]], 1, 6, 11, 12);
                G(m[blake2s_sigma[round, 12]], m[blake2s_sigma[round, 13]], 2, 7, 8, 13);
                G(m[blake2s_sigma[round, 14]], m[blake2s_sigma[round, 15]], 3, 4, 9, 14);
            }

            // update chain values:
            for (int offset = 0; offset < chainValue.Length; offset++)
            {
                chainValue[offset] = chainValue[offset] ^ internalState[offset] ^ internalState[offset + 8];
            }
        }
#endif

        private void G(uint m1, uint m2, int posA, int posB, int posC, int posD)
        {
            internalState[posA] = internalState[posA] + internalState[posB] + m1;
            internalState[posD] = rotr32(internalState[posD] ^ internalState[posA], 16);
            internalState[posC] = internalState[posC] + internalState[posD];
            internalState[posB] = rotr32(internalState[posB] ^ internalState[posC], 12);
            internalState[posA] = internalState[posA] + internalState[posB] + m2;
            internalState[posD] = rotr32(internalState[posD] ^ internalState[posA], 8);
            internalState[posC] = internalState[posC] + internalState[posD];
            internalState[posB] = rotr32(internalState[posB] ^ internalState[posC], 7);
        }

        private uint rotr32(uint x, int rot)
        {
            return x >> rot | x << -rot;
        }

        /**
         * Return the algorithm name.
         *
         * @return the algorithm name
         */
        public virtual string AlgorithmName
        {
            get { return "BLAKE2s"; }
        }

        /**
         * Return the size in bytes of the digest produced by this message digest.
         *
         * @return the size in bytes of the digest produced by this message digest.
         */
        public virtual int GetDigestSize()
        {
            return digestLength;
        }

        /**
         * Return the size in bytes of the internal buffer the digest applies its
         * compression function to.
         *
         * @return byte length of the digest's internal buffer.
         */
        public virtual int GetByteLength()
        {
            return BLOCK_LENGTH_BYTES;
        }

        /**
         * Overwrite the key if it is no longer used (zeroization).
         */
        public virtual void ClearKey()
        {
            if (key != null)
            {
                Array.Clear(key, 0, key.Length);
                Array.Clear(buffer, 0, buffer.Length);
            }
        }

        /**
         * Overwrite the salt (pepper) if it is secret and no longer used
         * (zeroization).
         */
        public virtual void ClearSalt()
        {
            if (salt != null)
            {
                Array.Clear(salt, 0, salt.Length);
            }
        }
    }
}
