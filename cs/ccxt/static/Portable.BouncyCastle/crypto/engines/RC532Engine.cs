using System;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Engines
{
    /**
    * The specification for RC5 came from the <code>RC5 Encryption Algorithm</code>
    * publication in RSA CryptoBytes, Spring of 1995.
    * <em>http://www.rsasecurity.com/rsalabs/cryptobytes</em>.
    * <p>
    * This implementation has a word size of 32 bits.</p>
    */
    public class RC532Engine
		: IBlockCipher
    {
        /*
        * the number of rounds to perform
        */
        private int _noRounds;

        /*
        * the expanded key array of size 2*(rounds + 1)
        */
        private int [] _S;

        /*
        * our "magic constants" for 32 32
        *
        * Pw = Odd((e-2) * 2^wordsize)
        * Qw = Odd((o-2) * 2^wordsize)
        *
        * where e is the base of natural logarithms (2.718281828...)
        * and o is the golden ratio (1.61803398...)
        */
        private static readonly int P32 = unchecked((int) 0xb7e15163);
        private static readonly int Q32 = unchecked((int) 0x9e3779b9);

        private bool forEncryption;

        /**
        * Create an instance of the RC5 encryption algorithm
        * and set some defaults
        */
        public RC532Engine()
        {
            _noRounds     = 12;         // the default
        }

        public virtual string AlgorithmName
        {
            get { return "RC5-32"; }
        }

        public virtual int GetBlockSize()
        {
            return 2 * 4;
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
            if (parameters is RC5Parameters rc5Parameters)
            {
                _noRounds = rc5Parameters.Rounds;

                SetKey(rc5Parameters.GetKey());
            }
            else if (parameters is KeyParameter keyParameter)
            {
                SetKey(keyParameter.GetKey());
            }
            else
            {
                throw new ArgumentException("invalid parameter passed to RC532 init - " + Platform.GetTypeName(parameters));
            }

            this.forEncryption = forEncryption;
        }

        public virtual int ProcessBlock(byte[] input, int inOff, byte[]	output, int outOff)
        {
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
            return forEncryption
                ? EncryptBlock(input, output)
                : DecryptBlock(input, output);
        }
#endif

        /**
        * Re-key the cipher.
        *
        * @param  key  the key to be used
        */
        private void SetKey(byte[] key)
        {
            //
            // KEY EXPANSION:
            //
            // There are 3 phases to the key expansion.
            //
            // Phase 1:
            //   Copy the secret key K[0...b-1] into an array L[0..c-1] of
            //   c = ceil(b/u), where u = 32/8 in little-endian order.
            //   In other words, we fill up L using u consecutive key bytes
            //   of K. Any unfilled byte positions in L are zeroed. In the
            //   case that b = c = 0, set c = 1 and L[0] = 0.
            //
            int[]   L = new int[(key.Length + 3) / 4];

            for (int i = 0; i != key.Length; i++)
            {
                L[i / 4] += (key[i] & 0xff) << (8 * (i % 4));
            }

            //
            // Phase 2:
            //   Initialize S to a particular fixed pseudo-random bit pattern
            //   using an arithmetic progression modulo 2^wordsize determined
            //   by the magic numbers, Pw & Qw.
            //
            _S            = new int[2*(_noRounds + 1)];

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

            int A = 0, B = 0;
            int ii = 0, jj = 0;

            for (int k = 0; k < iter; k++)
            {
                A = _S[ii] = Integers.RotateLeft(_S[ii] + A + B, 3);
                B =  L[jj] = Integers.RotateLeft(L[jj] + A + B, A + B);
                ii = (ii+1) % _S.Length;
                jj = (jj+1) %  L.Length;
            }
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        private int EncryptBlock(ReadOnlySpan<byte> input, Span<byte> output)
        {
            int A = (int)Pack.LE_To_UInt32(input) + _S[0];
            int B = (int)Pack.LE_To_UInt32(input[4..]) + _S[1];

            for (int i = 1; i <= _noRounds; i++)
            {
                A = Integers.RotateLeft(A ^ B, B) + _S[2*i];
                B = Integers.RotateLeft(B ^ A, A) + _S[2*i+1];
            }

            Pack.UInt32_To_LE((uint)A, output);
            Pack.UInt32_To_LE((uint)B, output[4..]);

            return 8;
        }

        private int DecryptBlock(ReadOnlySpan<byte> input, Span<byte> output)
        {
            int A = (int)Pack.LE_To_UInt32(input);
            int B = (int)Pack.LE_To_UInt32(input[4..]);

            for (int i = _noRounds; i >= 1; i--)
            {
                B = Integers.RotateRight(B - _S[2*i+1], A) ^ A;
                A = Integers.RotateRight(A - _S[2*i],   B) ^ B;
            }

            Pack.UInt32_To_LE((uint)(A - _S[0]), output);
            Pack.UInt32_To_LE((uint)(B - _S[1]), output[4..]);

            return 8;
        }
#else
        private int EncryptBlock(byte[] input, int inOff, byte[] outBytes, int outOff)
        {
            int A = (int)Pack.LE_To_UInt32(input, inOff) + _S[0];
            int B = (int)Pack.LE_To_UInt32(input, inOff + 4) + _S[1];

            for (int i = 1; i <= _noRounds; i++)
            {
                A = Integers.RotateLeft(A ^ B, B) + _S[2*i];
                B = Integers.RotateLeft(B ^ A, A) + _S[2*i+1];
            }

            Pack.UInt32_To_LE((uint)A, outBytes, outOff);
            Pack.UInt32_To_LE((uint)B, outBytes, outOff + 4);

            return 8;
        }

        private int DecryptBlock(byte[] input, int inOff, byte[] outBytes, int outOff)
        {
            int A = (int)Pack.LE_To_UInt32(input, inOff);
            int B = (int)Pack.LE_To_UInt32(input, inOff + 4);

            for (int i = _noRounds; i >= 1; i--)
            {
                B = Integers.RotateRight(B - _S[2*i+1], A) ^ A;
                A = Integers.RotateRight(A - _S[2*i],   B) ^ B;
            }

            Pack.UInt32_To_LE((uint)(A - _S[0]), outBytes, outOff);
            Pack.UInt32_To_LE((uint)(B - _S[1]), outBytes, outOff + 4);

            return 8;
        }
#endif
    }
}
