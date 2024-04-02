using System;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Engines
{
    /**
    * An RC6 engine.
    */
    public class RC6Engine
		: IBlockCipher
    {
        /*
        * the number of rounds to perform
        */
        private static readonly int _noRounds = 20;

        /*
        * the expanded key array of size 2*(rounds + 1)
        */
        private int [] _S;

        /*
        * our "magic constants" for wordSize 32
        *
        * Pw = Odd((e-2) * 2^wordsize)
        * Qw = Odd((o-2) * 2^wordsize)
        *
        * where e is the base of natural logarithms (2.718281828...)
        * and o is the golden ratio (1.61803398...)
        */
        private static readonly int    P32 = unchecked((int) 0xb7e15163);
        private static readonly int    Q32 = unchecked((int) 0x9e3779b9);

        private static readonly int    LGW = 5;        // log2(32)

        private bool forEncryption;

        /**
        * Create an instance of the RC6 encryption algorithm
        * and set some defaults
        */
        public RC6Engine()
        {
        }

        public virtual string AlgorithmName
        {
            get { return "RC6"; }
        }

        public virtual int GetBlockSize()
        {
            return 16;
        }

        /**
        * initialise a RC5-32 cipher.
        *
        * @param forEncryption whether or not we are for encryption.
        * @param parameters the parameters required to set up the cipher.
        * @exception ArgumentException if the parameters argument is
        * inappropriate.
        */
        public virtual void Init(bool forEncryption, ICipherParameters parameters)
        {
            if (!(parameters is KeyParameter keyParameter))
                throw new ArgumentException("invalid parameter passed to RC6 init - " + Platform.GetTypeName(parameters));

            this.forEncryption = forEncryption;

			SetKey(keyParameter.GetKey());
        }

        public virtual int ProcessBlock(byte[] input, int inOff, byte[] output, int outOff)
        {
			if (_S == null)
				throw new InvalidOperationException("RC6 engine not initialised");

            int blockSize = GetBlockSize();
            Check.DataLength(input, inOff, blockSize, "input buffer too short");
            Check.OutputLength(output, outOff, blockSize, "output buffer too short");

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
            return forEncryption
                ? EncryptBlock(input.AsSpan(inOff), output.AsSpan(outOff))
                : DecryptBlock(input.AsSpan(inOff), output.AsSpan(outOff));
#else
            return forEncryption
				? EncryptBlock(input, inOff, output, outOff)
				: DecryptBlock(input, inOff, output, outOff);
#endif
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual int ProcessBlock(ReadOnlySpan<byte> input, Span<byte> output)
        {
            if (_S == null)
                throw new InvalidOperationException("RC6 engine not initialised");

            int blockSize = GetBlockSize();
            Check.DataLength(input, blockSize, "input buffer too short");
            Check.OutputLength(output, blockSize, "output buffer too short");

            return forEncryption
                ? EncryptBlock(input, output)
                : DecryptBlock(input, output);
        }
#endif

        /**
        * Re-key the cipher.
        *
        * @param inKey the key to be used
        */
        private void SetKey(
            byte[] key)
        {
            //
            // KEY EXPANSION:
            //
            // There are 3 phases to the key expansion.
            //
            // Phase 1:
            //   Copy the secret key K[0...b-1] into an array L[0..c-1] of
            //   c = ceil(b/u), where u = wordSize/8 in little-endian order.
            //   In other words, we fill up L using u consecutive key bytes
            //   of K. Any unfilled byte positions in L are zeroed. In the
            //   case that b = c = 0, set c = 1 and L[0] = 0.
            //
            // compute number of dwords
            int c = (key.Length + 3) / 4;
            if (c == 0)
            {
                c = 1;
            }
            int[]   L = new int[(key.Length + 3) / 4];

            // load all key bytes into array of key dwords
            for (int i = key.Length - 1; i >= 0; i--)
            {
                L[i / 4] = (L[i / 4] << 8) + (key[i] & 0xff);
            }

            //
            // Phase 2:
            //   Key schedule is placed in a array of 2+2*ROUNDS+2 = 44 dwords.
            //   Initialize S to a particular fixed pseudo-random bit pattern
            //   using an arithmetic progression modulo 2^wordsize determined
            //   by the magic numbers, Pw & Qw.
            //
            _S            = new int[2+2*_noRounds+2];

            _S[0] = P32;
            for (int i=1; i < _S.Length; i++)
            {
                _S[i] = (_S[i-1] + Q32);
            }

            //
            // Phase 3:
            //   Mix in the user's secret key in 3 passes over the arrays S & L.
            //   The max of the arrays sizes is used as the loop control
            //
            int iter;

            if (L.Length > _S.Length)
            {
                iter = 3 * L.Length;
            }
            else
            {
                iter = 3 * _S.Length;
            }

            int A = 0;
            int B = 0;
            int ii = 0, jj = 0;

            for (int k = 0; k < iter; k++)
            {
                A = _S[ii] = Integers.RotateLeft(_S[ii] + A + B, 3);
                B =  L[jj] = Integers.RotateLeft( L[jj] + A + B, A + B);
                ii = (ii+1) % _S.Length;
                jj = (jj+1) %  L.Length;
            }
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        private int EncryptBlock(ReadOnlySpan<byte> input, Span<byte> output)
        {
            // load A,B,C and D registers from in.
            int A = (int)Pack.LE_To_UInt32(input);
            int B = (int)Pack.LE_To_UInt32(input[4..]);
            int C = (int)Pack.LE_To_UInt32(input[8..]);
            int D = (int)Pack.LE_To_UInt32(input[12..]);

            // Do pseudo-round #0: pre-whitening of B and D
            B += _S[0];
            D += _S[1];

            // perform round #1,#2 ... #ROUNDS of encryption
            for (int i = 1; i <= _noRounds; i++)
            {
                int t = 0, u = 0;

                t = B * (2 * B + 1);
                t = Integers.RotateLeft(t, 5);

                u = D * (2 * D + 1);
                u = Integers.RotateLeft(u, 5);

                A ^= t;
                A = Integers.RotateLeft(A, u);
                A += _S[2 * i];

                C ^= u;
                C = Integers.RotateLeft(C, t);
                C += _S[2 * i + 1];

                int temp = A;
                A = B;
                B = C;
                C = D;
                D = temp;
            }

            // do pseudo-round #(ROUNDS+1) : post-whitening of A and C
            A += _S[2 * _noRounds + 2];
            C += _S[2 * _noRounds + 3];

            // store A, B, C and D registers to out
            Pack.UInt32_To_LE((uint)A, output);
            Pack.UInt32_To_LE((uint)B, output[4..]);
            Pack.UInt32_To_LE((uint)C, output[8..]);
            Pack.UInt32_To_LE((uint)D, output[12..]);

            return 16;
        }

        private int DecryptBlock(ReadOnlySpan<byte> input, Span<byte> output)
        {
            // load A,B,C and D registers from out.
            int A = (int)Pack.LE_To_UInt32(input);
            int B = (int)Pack.LE_To_UInt32(input[4..]);
            int C = (int)Pack.LE_To_UInt32(input[8..]);
            int D = (int)Pack.LE_To_UInt32(input[12..]);

            // Undo pseudo-round #(ROUNDS+1) : post whitening of A and C
            C -= _S[2 * _noRounds + 3];
            A -= _S[2 * _noRounds + 2];

            // Undo round #ROUNDS, .., #2,#1 of encryption
            for (int i = _noRounds; i >= 1; i--)
            {
                int t = 0, u = 0;

                int temp = D;
                D = C;
                C = B;
                B = A;
                A = temp;

                t = B * (2 * B + 1);
                t = Integers.RotateLeft(t, LGW);

                u = D * (2 * D + 1);
                u = Integers.RotateLeft(u, LGW);

                C -= _S[2 * i + 1];
                C = Integers.RotateRight(C, t);
                C ^= u;

                A -= _S[2 * i];
                A = Integers.RotateRight(A, u);
                A ^= t;
            }

            // Undo pseudo-round #0: pre-whitening of B and D
            D -= _S[1];
            B -= _S[0];

            Pack.UInt32_To_LE((uint)A, output);
            Pack.UInt32_To_LE((uint)B, output[4..]);
            Pack.UInt32_To_LE((uint)C, output[8..]);
            Pack.UInt32_To_LE((uint)D, output[12..]);

            return 16;
        }
#else
        private int EncryptBlock(byte[] input, int inOff, byte[] outBytes, int outOff)
        {
            // load A,B,C and D registers from in.
            int A = (int)Pack.LE_To_UInt32(input, inOff);
            int B = (int)Pack.LE_To_UInt32(input, inOff + 4);
            int C = (int)Pack.LE_To_UInt32(input, inOff + 8);
            int D = (int)Pack.LE_To_UInt32(input, inOff + 12);

            // Do pseudo-round #0: pre-whitening of B and D
            B += _S[0];
            D += _S[1];

            // perform round #1,#2 ... #ROUNDS of encryption
            for (int i = 1; i <= _noRounds; i++)
            {
                int t = 0,u = 0;

                t = B*(2*B+1);
                t = Integers.RotateLeft(t,5);

                u = D*(2*D+1);
                u = Integers.RotateLeft(u,5);

                A ^= t;
                A = Integers.RotateLeft(A,u);
                A += _S[2*i];

                C ^= u;
                C = Integers.RotateLeft(C,t);
                C += _S[2*i+1];

                int temp = A;
                A = B;
                B = C;
                C = D;
                D = temp;
            }

            // do pseudo-round #(ROUNDS+1) : post-whitening of A and C
            A += _S[2*_noRounds+2];
            C += _S[2*_noRounds+3];

            // store A, B, C and D registers to out
            Pack.UInt32_To_LE((uint)A, outBytes, outOff);
            Pack.UInt32_To_LE((uint)B, outBytes, outOff + 4);
            Pack.UInt32_To_LE((uint)C, outBytes, outOff + 8);
            Pack.UInt32_To_LE((uint)D, outBytes, outOff + 12);

            return 16;
        }

        private int DecryptBlock(byte[] input, int inOff, byte[] outBytes, int outOff)
        {
            // load A,B,C and D registers from out.
            int A = (int)Pack.LE_To_UInt32(input, inOff);
            int B = (int)Pack.LE_To_UInt32(input, inOff + 4);
            int C = (int)Pack.LE_To_UInt32(input, inOff + 8);
            int D = (int)Pack.LE_To_UInt32(input, inOff + 12);

            // Undo pseudo-round #(ROUNDS+1) : post whitening of A and C
            C -= _S[2*_noRounds+3];
            A -= _S[2*_noRounds+2];

            // Undo round #ROUNDS, .., #2,#1 of encryption
            for (int i = _noRounds; i >= 1; i--)
            {
                int t=0,u = 0;

                int temp = D;
                D = C;
                C = B;
                B = A;
                A = temp;

                t = B*(2*B+1);
                t = Integers.RotateLeft(t, LGW);

                u = D*(2*D+1);
                u = Integers.RotateLeft(u, LGW);

                C -= _S[2*i+1];
                C = Integers.RotateRight(C,t);
                C ^= u;

                A -= _S[2*i];
                A = Integers.RotateRight(A,u);
                A ^= t;
            }

            // Undo pseudo-round #0: pre-whitening of B and D
            D -= _S[1];
            B -= _S[0];

            Pack.UInt32_To_LE((uint)A, outBytes, outOff);
            Pack.UInt32_To_LE((uint)B, outBytes, outOff + 4);
            Pack.UInt32_To_LE((uint)C, outBytes, outOff + 8);
            Pack.UInt32_To_LE((uint)D, outBytes, outOff + 12);

            return 16;
        }
#endif
    }
}
