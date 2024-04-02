using System;
using Org.BouncyCastle.Pqc.Crypto.Ntru.ParameterSets;
using Org.BouncyCastle.Pqc.Crypto.Ntru.Polynomials;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.Ntru.Owcpa
{
    /// <summary>
    /// An OW-CPA secure deterministic public key encryption scheme (DPKE).
    /// </summary>
    internal class NtruOwcpa
    {
        private readonly NtruParameterSet _parameterSet;
        private readonly NtruSampling _sampling;

        internal NtruOwcpa(NtruParameterSet parameterSet)
        {
            _parameterSet = parameterSet;
            _sampling = new NtruSampling(parameterSet);
        }

        /// <summary>
        /// Generate a DPKE key pair.
        /// </summary>
        /// <param name="seed">a random byte array</param>
        /// <returns>DPKE key pair</returns>
        internal OwcpaKeyPair KeyPair(byte[] seed)
        {
            byte[] publicKey;
            var privateKey = new byte[_parameterSet.OwcpaSecretKeyBytes()];
            var n = _parameterSet.N;
            var q = _parameterSet.Q();
            int i;
            PolynomialPair pair;
            Polynomial x1, x2, x3, x4, x5;
            x1 = _parameterSet.CreatePolynomial();
            x2 = _parameterSet.CreatePolynomial();
            x3 = _parameterSet.CreatePolynomial();
            x4 = _parameterSet.CreatePolynomial();
            x5 = _parameterSet.CreatePolynomial();

            Polynomial f, g, invfMod3 = x3;
            Polynomial gf = x3, invgf = x4, tmp = x5;
            Polynomial invh = x3, h = x3;

            pair = _sampling.SampleFg(seed);
            f = pair.F();
            g = pair.G();

            invfMod3.S3Inv(f);
            var fs3ToBytes = f.S3ToBytes(_parameterSet.OwcpaMsgBytes());
            Array.Copy(fs3ToBytes, 0, privateKey, 0, fs3ToBytes.Length);
            var s3Res = invfMod3.S3ToBytes(privateKey.Length - _parameterSet.PackTrinaryBytes());
            Array.Copy(s3Res, 0, privateKey, _parameterSet.PackTrinaryBytes(), s3Res.Length);

            f.Z3ToZq();
            g.Z3ToZq();

            if (_parameterSet is NtruHrssParameterSet)
            {
                /* g = 3*(x-1)*g */
                for (i = n - 1; i > 0; i--)
                {
                    g.coeffs[i] = (ushort)(3 * (g.coeffs[i - 1] - g.coeffs[i]));
                }

                g.coeffs[0] = (ushort)-(3 * g.coeffs[0]);
            }
            else
            {
                for (i = 0; i < n; i++)
                {
                    g.coeffs[i] = (ushort)(3 * g.coeffs[i]);
                }
            }

            gf.RqMul(g, f);
            invgf.RqInv(gf);

            tmp.RqMul(invgf, f);
            invh.SqMul(tmp, f);
            var sqRes = invh.SqToBytes(privateKey.Length - 2 * _parameterSet.PackTrinaryBytes());
            Array.Copy(sqRes, 0, privateKey, 2 * _parameterSet.PackTrinaryBytes(), sqRes.Length);

            tmp.RqMul(invgf, g);
            h.RqMul(tmp, g);
            publicKey = h.RqSumZeroToBytes(_parameterSet.OwcpaPublicKeyBytes());

            return new OwcpaKeyPair(publicKey, privateKey);
        }

        /// <summary>
        /// DPKE encryption.
        /// </summary>
        /// <param name="r"></param>
        /// <param name="m"></param>
        /// <param name="publicKey"></param>
        /// <returns>DPKE ciphertext</returns>
        internal byte[] Encrypt(Polynomial r, Polynomial m, byte[] publicKey)
        {
            int i;
            Polynomial x1 = _parameterSet.CreatePolynomial(), x2 = _parameterSet.CreatePolynomial();
            Polynomial h = x1, liftm = x1;
            Polynomial ct = x2;

            h.RqSumZeroFromBytes(publicKey);

            ct.RqMul(r, h);

            liftm.Lift(m);

            for (i = 0; i < _parameterSet.N; i++)
            {
                ct.coeffs[i] += liftm.coeffs[i];
            }

            return ct.RqSumZeroToBytes(_parameterSet.NtruCiphertextBytes());
        }

        /// <summary>
        /// DPKE decryption.
        /// </summary>
        /// <param name="ciphertext"></param>
        /// <param name="privateKey"></param>
        /// <returns>an instance of <see cref="OwcpaDecryptResult"/> containing <c>packed_rm</c> an  fail flag</returns>
        internal OwcpaDecryptResult Decrypt(byte[] ciphertext, byte[] privateKey)
        {
            byte[] sk = privateKey;
            byte[] rm = new byte[_parameterSet.OwcpaMsgBytes()];
            int i, fail;
            Polynomial x1 = _parameterSet.CreatePolynomial();
            Polynomial x2 = _parameterSet.CreatePolynomial();
            Polynomial x3 = _parameterSet.CreatePolynomial();
            Polynomial x4 = _parameterSet.CreatePolynomial();

            Polynomial c = x1, f = x2, cf = x3;
            Polynomial mf = x2, finv3 = x3, m = x4;
            Polynomial liftm = x2, invh = x3, r = x4;
            Polynomial b = x1;

            c.RqSumZeroFromBytes(ciphertext);
            f.S3FromBytes(sk);

            f.Z3ToZq();

            cf.RqMul(c, f);

            mf.RqToS3(cf);

            finv3.S3FromBytes(Arrays.CopyOfRange(sk, _parameterSet.PackTrinaryBytes(), sk.Length));

            m.S3Mul(mf, finv3);

            byte[] arr1 = m.S3ToBytes(rm.Length - _parameterSet.PackTrinaryBytes());

            fail = 0;

            /* Check that the unused bits of the last byte of the ciphertext are zero */
            fail |= CheckCiphertext(ciphertext);

            /* For the IND-CCA2 KEM we must ensure that c = Enc(h, (r,m)).             */
            /* We can avoid re-computing r*h + Lift(m) as long as we check that        */
            /* r (defined as b/h mod (q, Phi_n)) and m are in the message space.       */
            /* (m can take any value in S3 in NTRU_HRSS) */


            if (_parameterSet is NtruHpsParameterSet)
            {
                fail |= CheckM((HpsPolynomial)m);
            }

            /* b = c - Lift(m) mod (q, x^n - 1) */
            liftm.Lift(m);

            for (i = 0; i < _parameterSet.N; i++)
            {
                b.coeffs[i] = (ushort)(c.coeffs[i] - liftm.coeffs[i]);
            }

            /* r = b / h mod (q, Phi_n) */
            invh.SqFromBytes(Arrays.CopyOfRange(sk, 2 * _parameterSet.PackTrinaryBytes(), sk.Length));
            r.SqMul(b, invh);

            fail |= CheckR(r);

            r.TrinaryZqToZ3();
            byte[] arr2 = r.S3ToBytes(_parameterSet.OwcpaMsgBytes());
            Array.Copy(arr2, 0, rm, 0, arr2.Length);
            Array.Copy(arr1, 0, rm, _parameterSet.PackTrinaryBytes(), arr1.Length);

            return new OwcpaDecryptResult(rm, fail);
        }

        private int CheckCiphertext(byte[] ciphertext)
        {
            ushort t;
            t = ciphertext[_parameterSet.NtruCiphertextBytes() - 1];
            t &= (ushort)(0xff << (8 - (7 & (_parameterSet.LogQ * _parameterSet.PackDegree()))));

            /* We have 0 <= t < 256 */
            /* Return 0 on success (t=0), 1 on failure */
            return 1 & ((~t + 1) >> 15);
        }

        private int CheckR(Polynomial r)
        {
            /* A valid r has coefficients in {0,1,q-1} and has r[N-1] = 0 */
            /* Note: We may assume that 0 <= r[i] <= q-1 for all i        */
            int i;
            int t = 0; // unsigned
            ushort c; // unsigned
            for (i = 0; i < _parameterSet.N - 1; i++)
            {
                c = r.coeffs[i];
                t |= (c + 1) & (_parameterSet.Q() - 4); /* 0 iff c is in {-1,0,1,2} */
                t |= (c + 2) & 4; /* 1 if c = 2, 0 if c is in {-1,0,1} */
            }

            t |= r.coeffs[_parameterSet.N - 1]; /* Coefficient n-1 must be zero */

            /* We have 0 <= t < 2^16. */
            /* Return 0 on success (t=0), 1 on failure */
            return (1 & ((~t + 1) >> 31));
        }

        private int CheckM(HpsPolynomial m)
        {
            int i;
            int t = 0; // unsigned
            ushort ps = 0; // unsigned
            ushort ms = 0; // unsigned
            for (i = 0; i < _parameterSet.N - 1; i++)
            {
                ps += (ushort)(m.coeffs[i] & 1);
                ms += (ushort)(m.coeffs[i] & 2);
            }

            t |= ps ^ (ms >> 1);
            t |= ms ^ ((NtruHpsParameterSet)_parameterSet).Weight();

            /* We have 0 <= t < 2^16. */
            /* Return 0 on success (t=0), 1 on failure */
            return (1 & ((~t + 1) >> 31));
        }
    }
}