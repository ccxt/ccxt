using System;

using Org.BouncyCastle.Crypto.Utilities;

namespace Org.BouncyCastle.Crypto.Engines
{
    /**
     * A class that provides CAST6 key encryption operations,
     * such as encoding data and generating keys.
     *
     * All the algorithms herein are from the Internet RFC
     *
     * RFC2612 - CAST6 (128bit block, 128-256bit key)
     *
     * and implement a simplified cryptography interface.
     */
    public sealed class Cast6Engine
		: Cast5Engine
    {
        //====================================
        // Useful constants
        //====================================
        private const int ROUNDS = 12;
        private const int BLOCK_SIZE = 16;  // bytes = 128 bits

		/*
        * Put the round and mask keys into an array.
        * Kr0[i] => _Kr[i*4 + 0]
        */
        private int []_Kr = new int[ROUNDS*4]; // the rotating round key(s)
        private uint []_Km = new uint[ROUNDS*4]; // the masking round key(s)

		/*
        * Key setup
        */
        private int []_Tr = new int[24 * 8];
        private uint []_Tm = new uint[24 * 8];
        private uint[] _workingKey = new uint[8];

		public Cast6Engine()
        {
        }

		public override string AlgorithmName
        {
            get { return "CAST6"; }
        }

		public override int GetBlockSize()
        {
            return BLOCK_SIZE;
        }

		//==================================
        // Private Implementation
        //==================================
        /*
        * Creates the subkeys using the same nomenclature
        * as described in RFC2612.
        *
        * See section 2.4
        */
        internal override void SetKey(
			byte[] key)
        {
            uint Cm = 0x5a827999;
            uint Mm = 0x6ed9eba1;
            int Cr = 19;
            int Mr = 17;
            /*
            * Determine the key size here, if required
            *
            * if keysize < 256 bytes, pad with 0
            *
            * Typical key sizes => 128, 160, 192, 224, 256
            */
            for (int i=0; i< 24; i++)
            {
                for (int j=0; j< 8; j++)
                {
                    _Tm[i*8 + j] = Cm;
                    Cm += Mm; //mod 2^32;
                    _Tr[i*8 + j] = Cr;
                    Cr = (Cr + Mr) & 0x1f;            // mod 32
                }
            }

			byte[] tmpKey = new byte[64];
			key.CopyTo(tmpKey, 0);

			// now create ABCDEFGH
            for (int i = 0; i < 8; i++)
            {
                _workingKey[i] = Pack.BE_To_UInt32(tmpKey, i*4);
            }

			// Generate the key schedule
            for (int i = 0; i < 12; i++)
            {
                // KAPPA <- W2i(KAPPA)
                int i2 = i*2 *8;
                _workingKey[6] ^= F1(_workingKey[7], _Tm[i2], _Tr[i2]);
                _workingKey[5] ^= F2(_workingKey[6], _Tm[i2+1], _Tr[i2+1]);
                _workingKey[4] ^= F3(_workingKey[5], _Tm[i2+2], _Tr[i2+2]);
                _workingKey[3] ^= F1(_workingKey[4], _Tm[i2+3], _Tr[i2+3]);
                _workingKey[2] ^= F2(_workingKey[3], _Tm[i2+4], _Tr[i2+4]);
                _workingKey[1] ^= F3(_workingKey[2], _Tm[i2+5], _Tr[i2+5]);
                _workingKey[0] ^= F1(_workingKey[1], _Tm[i2+6], _Tr[i2+6]);
                _workingKey[7] ^= F2(_workingKey[0], _Tm[i2+7], _Tr[i2+7]);
                // KAPPA <- W2i+1(KAPPA)
                i2 = (i*2 + 1)*8;
                _workingKey[6] ^= F1(_workingKey[7], _Tm[i2], _Tr[i2]);
                _workingKey[5] ^= F2(_workingKey[6], _Tm[i2+1], _Tr[i2+1]);
                _workingKey[4] ^= F3(_workingKey[5], _Tm[i2+2], _Tr[i2+2]);
                _workingKey[3] ^= F1(_workingKey[4], _Tm[i2+3], _Tr[i2+3]);
                _workingKey[2] ^= F2(_workingKey[3], _Tm[i2+4], _Tr[i2+4]);
                _workingKey[1] ^= F3(_workingKey[2], _Tm[i2+5], _Tr[i2+5]);
                _workingKey[0] ^= F1(_workingKey[1], _Tm[i2+6], _Tr[i2+6]);
                _workingKey[7] ^= F2(_workingKey[0], _Tm[i2+7], _Tr[i2+7]);
                // Kr_(i) <- KAPPA
                _Kr[i*4] = (int)(_workingKey[0] & 0x1f);
                _Kr[i*4 + 1] = (int)(_workingKey[2] & 0x1f);
                _Kr[i*4 + 2] = (int)(_workingKey[4] & 0x1f);
                _Kr[i*4 + 3] = (int)(_workingKey[6] & 0x1f);
                // Km_(i) <- KAPPA
                _Km[i*4] = _workingKey[7];
                _Km[i*4 + 1] = _workingKey[5];
                _Km[i*4 + 2] = _workingKey[3];
                _Km[i*4 + 3] = _workingKey[1];
            }
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        internal override int EncryptBlock(ReadOnlySpan<byte> input, Span<byte> output)
        {
            // process the input block
            // batch the units up into 4x32 bit chunks and go for it
            uint A = Pack.BE_To_UInt32(input);
            uint B = Pack.BE_To_UInt32(input[4..]);
            uint C = Pack.BE_To_UInt32(input[8..]);
            uint D = Pack.BE_To_UInt32(input[12..]);
            uint[] result = new uint[4];
            CAST_Encipher(A, B, C, D, result);
            // now stuff them into the destination block
            Pack.UInt32_To_BE(result[0], output);
            Pack.UInt32_To_BE(result[1], output[4..]);
            Pack.UInt32_To_BE(result[2], output[8..]);
            Pack.UInt32_To_BE(result[3], output[12..]);
            return BLOCK_SIZE;
        }

        internal override int DecryptBlock(ReadOnlySpan<byte> input, Span<byte> output)
        {
            // process the input block
            // batch the units up into 4x32 bit chunks and go for it
            uint A = Pack.BE_To_UInt32(input);
            uint B = Pack.BE_To_UInt32(input[4..]);
            uint C = Pack.BE_To_UInt32(input[8..]);
            uint D = Pack.BE_To_UInt32(input[12..]);
            uint[] result = new uint[4];
            CAST_Decipher(A, B, C, D, result);
            // now stuff them into the destination block
            Pack.UInt32_To_BE(result[0], output);
            Pack.UInt32_To_BE(result[1], output[4..]);
            Pack.UInt32_To_BE(result[2], output[8..]);
            Pack.UInt32_To_BE(result[3], output[12..]);
            return BLOCK_SIZE;
        }
#else
        internal override int EncryptBlock(byte[] src, int srcIndex, byte[] dst, int dstIndex)
        {
            // process the input block
            // batch the units up into 4x32 bit chunks and go for it
            uint A = Pack.BE_To_UInt32(src, srcIndex);
            uint B = Pack.BE_To_UInt32(src, srcIndex + 4);
            uint C = Pack.BE_To_UInt32(src, srcIndex + 8);
            uint D = Pack.BE_To_UInt32(src, srcIndex + 12);
            uint[] result = new uint[4];
            CAST_Encipher(A, B, C, D, result);
            // now stuff them into the destination block
            Pack.UInt32_To_BE(result[0], dst, dstIndex);
            Pack.UInt32_To_BE(result[1], dst, dstIndex + 4);
            Pack.UInt32_To_BE(result[2], dst, dstIndex + 8);
            Pack.UInt32_To_BE(result[3], dst, dstIndex + 12);
            return BLOCK_SIZE;
        }

        internal override int DecryptBlock(byte[] src, int srcIndex, byte[] dst, int dstIndex)
        {
            // process the input block
            // batch the units up into 4x32 bit chunks and go for it
            uint A = Pack.BE_To_UInt32(src, srcIndex);
            uint B = Pack.BE_To_UInt32(src, srcIndex + 4);
            uint C = Pack.BE_To_UInt32(src, srcIndex + 8);
            uint D = Pack.BE_To_UInt32(src, srcIndex + 12);
            uint[] result = new uint[4];
            CAST_Decipher(A, B, C, D, result);
            // now stuff them into the destination block
            Pack.UInt32_To_BE(result[0], dst, dstIndex);
            Pack.UInt32_To_BE(result[1], dst, dstIndex + 4);
            Pack.UInt32_To_BE(result[2], dst, dstIndex + 8);
            Pack.UInt32_To_BE(result[3], dst, dstIndex + 12);
            return BLOCK_SIZE;
        }
#endif

        /**
        * Does the 12 quad rounds rounds to encrypt the block.
        *
        * @param A    the 00-31  bits of the plaintext block
        * @param B    the 32-63  bits of the plaintext block
        * @param C    the 64-95  bits of the plaintext block
        * @param D    the 96-127 bits of the plaintext block
        * @param result the resulting ciphertext
        */
        private void CAST_Encipher(
			uint	A,
			uint	B,
			uint	C,
			uint	D,
			uint[]	result)
        {
            for (int i = 0; i < 6; i++)
            {
                int x = i*4;
                // BETA <- Qi(BETA)
                C ^= F1(D, _Km[x], _Kr[x]);
                B ^= F2(C, _Km[x + 1], _Kr[x + 1]);
                A ^= F3(B, _Km[x + 2], _Kr[x + 2]);
                D ^= F1(A, _Km[x + 3], _Kr[x + 3]);
            }
            for (int i = 6; i < 12; i++)
            {
                int x = i*4;
                // BETA <- QBARi(BETA)
                D ^= F1(A, _Km[x + 3], _Kr[x + 3]);
                A ^= F3(B, _Km[x + 2], _Kr[x + 2]);
                B ^= F2(C, _Km[x + 1], _Kr[x + 1]);
                C ^= F1(D, _Km[x], _Kr[x]);
            }
            result[0] = A;
            result[1] = B;
            result[2] = C;
            result[3] = D;
        }

		/**
        * Does the 12 quad rounds rounds to decrypt the block.
        *
        * @param A    the 00-31  bits of the ciphertext block
        * @param B    the 32-63  bits of the ciphertext block
        * @param C    the 64-95  bits of the ciphertext block
        * @param D    the 96-127 bits of the ciphertext block
        * @param result the resulting plaintext
        */
        private void CAST_Decipher(
			uint	A,
			uint	B,
			uint	C,
			uint	D,
			uint[]	result)
        {
            for (int i = 0; i < 6; i++)
            {
                int x = (11-i)*4;
                // BETA <- Qi(BETA)
                C ^= F1(D, _Km[x], _Kr[x]);
                B ^= F2(C, _Km[x + 1], _Kr[x + 1]);
                A ^= F3(B, _Km[x + 2], _Kr[x + 2]);
                D ^= F1(A, _Km[x + 3], _Kr[x + 3]);
            }
            for (int i=6; i<12; i++)
            {
                int x = (11-i)*4;
                // BETA <- QBARi(BETA)
                D ^= F1(A, _Km[x + 3], _Kr[x + 3]);
                A ^= F3(B, _Km[x + 2], _Kr[x + 2]);
                B ^= F2(C, _Km[x + 1], _Kr[x + 1]);
                C ^= F1(D, _Km[x], _Kr[x]);
            }
            result[0] = A;
            result[1] = B;
            result[2] = C;
            result[3] = D;
        }
    }
}
