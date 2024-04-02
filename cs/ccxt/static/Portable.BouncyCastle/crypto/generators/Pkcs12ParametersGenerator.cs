using System;

using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Crypto.Generators
{
    /**
     * Generator for Pbe derived keys and ivs as defined by Pkcs 12 V1.0.
     * <p>
     * The document this implementation is based on can be found at
     * <a href="http://www.rsasecurity.com/rsalabs/pkcs/pkcs-12/index.html">
     * RSA's Pkcs12 Page</a>
     * </p>
     */
    public class Pkcs12ParametersGenerator
        : PbeParametersGenerator
    {
        public const int KeyMaterial = 1;
        public const int IVMaterial  = 2;
        public const int MacMaterial = 3;

        private readonly IDigest digest;

        private readonly int u;
        private readonly int v;

        /**
         * Construct a Pkcs 12 Parameters generator.
         *
         * @param digest the digest to be used as the source of derived keys.
         * @exception ArgumentException if an unknown digest is passed in.
         */
        public Pkcs12ParametersGenerator(
            IDigest digest)
        {
            this.digest = digest;

            u = digest.GetDigestSize();
            v = digest.GetByteLength();
        }

        /**
         * add a + b + 1, returning the result in a. The a value is treated
         * as a BigInteger of length (b.Length * 8) bits. The result is
         * modulo 2^b.Length in case of overflow.
         */
        private void Adjust(
            byte[]  a,
            int     aOff,
            byte[]  b)
        {
            int  x = (b[b.Length - 1] & 0xff) + (a[aOff + b.Length - 1] & 0xff) + 1;

            a[aOff + b.Length - 1] = (byte)x;
            x = (int) ((uint) x >> 8);

            for (int i = b.Length - 2; i >= 0; i--)
            {
                x += (b[i] & 0xff) + (a[aOff + i] & 0xff);
                a[aOff + i] = (byte)x;
                x = (int) ((uint) x >> 8);
            }
        }

        /**
         * generation of a derived key ala Pkcs12 V1.0.
         */
        private byte[] GenerateDerivedKey(
            int idByte,
            int n)
        {
            byte[] D = new byte[v];
            byte[] dKey = new byte[n];

            for (int i = 0; i != D.Length; i++)
            {
                D[i] = (byte)idByte;
            }

            byte[] S;

            if ((mSalt != null) && (mSalt.Length != 0))
            {
                S = new byte[v * ((mSalt.Length + v - 1) / v)];

                for (int i = 0; i != S.Length; i++)
                {
                    S[i] = mSalt[i % mSalt.Length];
                }
            }
            else
            {
                S = new byte[0];
            }

            byte[] P;

            if ((mPassword != null) && (mPassword.Length != 0))
            {
                P = new byte[v * ((mPassword.Length + v - 1) / v)];

                for (int i = 0; i != P.Length; i++)
                {
                    P[i] = mPassword[i % mPassword.Length];
                }
            }
            else
            {
                P = new byte[0];
            }

            byte[]  I = new byte[S.Length + P.Length];

            Array.Copy(S, 0, I, 0, S.Length);
            Array.Copy(P, 0, I, S.Length, P.Length);

            byte[]  B = new byte[v];
            int     c = (n + u - 1) / u;
            byte[]  A = new byte[u];

            for (int i = 1; i <= c; i++)
            {
                digest.BlockUpdate(D, 0, D.Length);
                digest.BlockUpdate(I, 0, I.Length);
                digest.DoFinal(A, 0);

                for (int j = 1; j != mIterationCount; j++)
                {
                    digest.BlockUpdate(A, 0, A.Length);
                    digest.DoFinal(A, 0);
                }

                for (int j = 0; j != B.Length; j++)
                {
                    B[j] = A[j % A.Length];
                }

                for (int j = 0; j != I.Length / v; j++)
                {
                    Adjust(I, j * v, B);
                }

                if (i == c)
                {
                    Array.Copy(A, 0, dKey, (i - 1) * u, dKey.Length - ((i - 1) * u));
                }
                else
                {
                    Array.Copy(A, 0, dKey, (i - 1) * u, A.Length);
                }
            }

            return dKey;
        }

        public override ICipherParameters GenerateDerivedParameters(
            string	algorithm,
            int		keySize)
        {
            keySize /= 8;

            byte[] dKey = GenerateDerivedKey(KeyMaterial, keySize);

            return ParameterUtilities.CreateKeyParameter(algorithm, dKey, 0, keySize);
        }

        public override ICipherParameters GenerateDerivedParameters(
            string	algorithm,
            int		keySize,
            int		ivSize)
        {
            keySize /= 8;
            ivSize /= 8;

            byte[] dKey = GenerateDerivedKey(KeyMaterial, keySize);
            KeyParameter key = ParameterUtilities.CreateKeyParameter(algorithm, dKey, 0, keySize);

            byte[] iv = GenerateDerivedKey(IVMaterial, ivSize);

            return new ParametersWithIV(key, iv, 0, ivSize);
        }

        /**
         * Generate a key parameter for use with a MAC derived from the password,
         * salt, and iteration count we are currently initialised with.
         *
         * @param keySize the size of the key we want (in bits)
         * @return a KeyParameter object.
         */
        public override ICipherParameters GenerateDerivedMacParameters(
            int keySize)
        {
            keySize /= 8;

            byte[] dKey = GenerateDerivedKey(MacMaterial, keySize);

            return new KeyParameter(dKey, 0, keySize);
        }
    }
}
