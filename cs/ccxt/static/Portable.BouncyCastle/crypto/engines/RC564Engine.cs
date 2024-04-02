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
    * This implementation is set to work with a 64 bit word size.</p>
    */
    public class RC564Engine
		: IBlockCipher
    {
        /*
        * the number of rounds to perform
        */
        private int _noRounds;

        /*
        * the expanded key array of size 2*(rounds + 1)
        */
        private long [] _S;

        /*
        * our "magic constants" for wordSize 62
        *
        * Pw = Odd((e-2) * 2^wordsize)
        * Qw = Odd((o-2) * 2^wordsize)
        *
        * where e is the base of natural logarithms (2.718281828...)
        * and o is the golden ratio (1.61803398...)
        */
        private static readonly long P64 = unchecked( (long) 0xb7e151628aed2a6bL);
        private static readonly long Q64 = unchecked( (long) 0x9e3779b97f4a7c15L);

        private bool forEncryption;

        /**
        * Create an instance of the RC5 encryption algorithm
        * and set some defaults
        */
        public RC564Engine()
        {
            _noRounds     = 12;
//            _S            = null;
        }

        public virtual string AlgorithmName
        {
            get { return "RC5-64"; }
        }

        public virtual int GetBlockSize()
        {
            return 16;
        }

        /**
        * initialise a RC5-64 cipher.
        *
        * @param forEncryption whether or not we are for encryption.
        * @param parameters the parameters required to set up the cipher.
        * @exception ArgumentException if the parameters argument is
        * inappropriate.
        */
        public virtual void Init(bool forEncryption, ICipherParameters parameters)
        {
            if (!(parameters is RC5Parameters rc5Parameters))
                throw new ArgumentException("invalid parameter passed to RC564 init - " + Platform.GetTypeName(parameters));

            this.forEncryption = forEncryption;

            _noRounds = rc5Parameters.Rounds;

            SetKey(rc5Parameters.GetKey());
        }

        public virtual int ProcessBlock(byte[] input, int inOff, byte[] output, int outOff)
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
            //   c = ceil(b/u), where u = wordSize/8 in little-endian order.
            //   In other words, we fill up L using u consecutive key bytes
            //   of K. Any unfilled byte positions in L are zeroed. In the
            //   case that b = c = 0, set c = 1 and L[0] = 0.
            //
            long[] L = new long[(key.Length + 7) / 8];

            for (int i = 0; i != key.Length; i++)
            {
                L[i / 8] += (long)(key[i] & 0xff) << (8 * (i % 8));
            }

            //
            // Phase 2:
            //   Initialize S to a particular fixed pseudo-random bit pattern
            //   using an arithmetic progression modulo 2^wordsize determined
            //   by the magic numbers, Pw & Qw.
            //
            _S            = new long[2*(_noRounds + 1)];

            _S[0] = P64;
            for (int i=1; i < _S.Length; i++)
            {
                _S[i] = (_S[i-1] + Q64);
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

            long A = 0, B = 0;
            int ii = 0, jj = 0;

            for (int k = 0; k < iter; k++)
            {
                A = _S[ii] = Longs.RotateLeft(_S[ii] + A + B, 3);
                B =  L[jj] = Longs.RotateLeft(L[jj] + A + B, (int)(A + B));
                ii = (ii+1) % _S.Length;
                jj = (jj+1) %  L.Length;
            }
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        private int EncryptBlock(ReadOnlySpan<byte> input, Span<byte> output)
        {
            long A = (long)Pack.LE_To_UInt64(input) + _S[0];
            long B = (long)Pack.LE_To_UInt64(input[8..]) + _S[1];

            for (int i = 1; i <= _noRounds; i++)
            {
                A = Longs.RotateLeft(A ^ B, (int)B) + _S[2*i];
                B = Longs.RotateLeft(B ^ A, (int)A) + _S[2*i+1];
            }

            Pack.UInt64_To_LE((ulong)A, output);
            Pack.UInt64_To_LE((ulong)B, output[8..]);

            return 16;
        }

        private int DecryptBlock(ReadOnlySpan<byte> input, Span<byte> output)
        {
            long A = (long)Pack.LE_To_UInt64(input);
            long B = (long)Pack.LE_To_UInt64(input[8..]);

            for (int i = _noRounds; i >= 1; i--)
            {
                B = Longs.RotateRight(B - _S[2*i+1], (int)A) ^ A;
                A = Longs.RotateRight(A - _S[2*i], (int)B) ^ B;
            }

            Pack.UInt64_To_LE((ulong)(A - _S[0]), output);
            Pack.UInt64_To_LE((ulong)(B - _S[1]), output[8..]);

            return 16;
        }
#else
        private int EncryptBlock(byte[] input, int inOff, byte[] outBytes, int outOff)
        {
            long A = (long)Pack.LE_To_UInt64(input, inOff) + _S[0];
            long B = (long)Pack.LE_To_UInt64(input, inOff + 8) + _S[1];

            for (int i = 1; i <= _noRounds; i++)
            {
                A = Longs.RotateLeft(A ^ B, (int)B) + _S[2*i];
                B = Longs.RotateLeft(B ^ A, (int)A) + _S[2*i+1];
            }

            Pack.UInt64_To_LE((ulong)A, outBytes, outOff);
            Pack.UInt64_To_LE((ulong)B, outBytes, outOff + 8);

            return 16;
        }

        private int DecryptBlock(byte[] input, int inOff, byte[] outBytes, int outOff)
        {
            long A = (long)Pack.LE_To_UInt64(input, inOff);
            long B = (long)Pack.LE_To_UInt64(input, inOff + 8);

            for (int i = _noRounds; i >= 1; i--)
            {
                B = Longs.RotateRight(B - _S[2*i+1], (int)A) ^ A;
                A = Longs.RotateRight(A - _S[2*i], (int)B) ^ B;
            }

            Pack.UInt64_To_LE((ulong)(A - _S[0]), outBytes, outOff);
            Pack.UInt64_To_LE((ulong)(B - _S[1]), outBytes, outOff + 8);

            return 16;
        }
#endif
    }
}
