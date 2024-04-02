using Org.BouncyCastle.Pqc.Crypto.Ntru.ParameterSets;

namespace Org.BouncyCastle.Pqc.Crypto.Ntru.Polynomials
{
    internal class HrssPolynomial : Polynomial
    {
        internal HrssPolynomial(NtruParameterSet parameterSet) : base(parameterSet)
        {
        }

        public override byte[] SqToBytes(int len)
        {
            // throw new NotImplementedException();

            byte[] r = new byte[len];
            short[] t = new short[8];

            int i, j;

            for (i = 0; i < ParameterSet.PackDegree() / 8; i++)
            {
                for (j = 0; j < 8; j++)
                {
                    t[j] = (short)ModQ((uint)coeffs[8 * i + j] & 0xffff, (uint)ParameterSet.Q());
                }

                r[13 * i + 0] = (byte)(t[0] & 0xff);
                r[13 * i + 1] = (byte)((t[0] >> 8) | ((t[1] & 0x07) << 5));
                r[13 * i + 2] = (byte)((t[1] >> 3) & 0xff);
                r[13 * i + 3] = (byte)((t[1] >> 11) | ((t[2] & 0x3f) << 2));
                r[13 * i + 4] = (byte)((t[2] >> 6) | ((t[3] & 0x01) << 7));
                r[13 * i + 5] = (byte)((t[3] >> 1) & 0xff);
                r[13 * i + 6] = (byte)((t[3] >> 9) | ((t[4] & 0x0f) << 4));
                r[13 * i + 7] = (byte)((t[4] >> 4) & 0xff);
                r[13 * i + 8] = (byte)((t[4] >> 12) | ((t[5] & 0x7f) << 1));
                r[13 * i + 9] = (byte)((t[5] >> 7) | ((t[6] & 0x03) << 6));
                r[13 * i + 10] = (byte)((t[6] >> 2) & 0xff);
                r[13 * i + 11] = (byte)((t[6] >> 10) | ((t[7] & 0x1f) << 3));
                r[13 * i + 12] = (byte)((t[7] >> 5));
            }

            for (j = 0; j < ParameterSet.PackDegree() - 8 * i; j++)
            {
                t[j] = (short)ModQ((uint)coeffs[8 * i + j] & 0xffff, (uint)ParameterSet.Q());
            }

            for (; j < 8; j++)
            {
                t[j] = 0;
            }

            switch (ParameterSet.PackDegree() - 8 * (ParameterSet.PackDegree() / 8))
            {
                case 4:
                {
                    r[13 * i + 0] = (byte)(t[0] & 0xff);
                    r[13 * i + 1] = (byte)((t[0] >> 8) | ((t[1] & 0x07) << 5));
                    r[13 * i + 2] = (byte)((t[1] >> 3) & 0xff);
                    r[13 * i + 3] = (byte)((t[1] >> 11) | ((t[2] & 0x3f) << 2));
                    r[13 * i + 4] = (byte)((t[2] >> 6) | ((t[3] & 0x01) << 7));
                    r[13 * i + 5] = (byte)((t[3] >> 1) & 0xff);
                    r[13 * i + 6] = (byte)((t[3] >> 9) | ((t[4] & 0x0f) << 4));
                    break;
                }
                case 2:
                {
                    r[13 * i + 0] = (byte)(t[0] & 0xff);
                    r[13 * i + 1] = (byte)((t[0] >> 8) | ((t[1] & 0x07) << 5));
                    r[13 * i + 2] = (byte)((t[1] >> 3) & 0xff);
                    r[13 * i + 3] = (byte)((t[1] >> 11) | ((t[2] & 0x3f) << 2));
                    break;
                }
            }

            return r;
        }


        public override void SqFromBytes(byte[] a)
        {
            // throw new NotImplementedException();

            int i;

            for (i = 0; i < ParameterSet.PackDegree() / 8; i++)
            {
                coeffs[8 * i + 0] = (ushort)((a[13 * i + 0] & 0xff) | (((ushort)(a[13 * i + 1] & 0xff) & 0x1f) << 8));
                coeffs[8 * i + 1] = (ushort)(((a[13 * i + 1] & 0xff) >> 5) | (((ushort)(a[13 * i + 2] & 0xff)) << 3) |
                                             (((short)(a[13 * i + 3] & 0xff) & 0x03) << 11));
                coeffs[8 * i + 2] =
                    (ushort)(((a[13 * i + 3] & 0xff) >> 2) | (((ushort)(a[13 * i + 4] & 0xff) & 0x7f) << 6));
                coeffs[8 * i + 3] = (ushort)(((a[13 * i + 4] & 0xff) >> 7) | (((ushort)(a[13 * i + 5] & 0xff)) << 1) |
                                             (((short)(a[13 * i + 6] & 0xff) & 0x0f) << 9));
                coeffs[8 * i + 4] = (ushort)(((a[13 * i + 6] & 0xff) >> 4) | (((ushort)(a[13 * i + 7] & 0xff)) << 4) |
                                             (((short)(a[13 * i + 8] & 0xff) & 0x01) << 12));
                coeffs[8 * i + 5] =
                    (ushort)(((a[13 * i + 8] & 0xff) >> 1) | (((ushort)(a[13 * i + 9] & 0xff) & 0x3f) << 7));
                coeffs[8 * i + 6] = (ushort)(((a[13 * i + 9] & 0xff) >> 6) | (((ushort)(a[13 * i + 10] & 0xff)) << 2) |
                                             (((short)(a[13 * i + 11] & 0xff) & 0x07) << 10));
                coeffs[8 * i + 7] = (ushort)(((a[13 * i + 11] & 0xff) >> 3) | (((ushort)(a[13 * i + 12] & 0xff)) << 5));
            }

            switch (ParameterSet.PackDegree() & 0x07)
            {
                case 4:
                {
                    coeffs[8 * i + 0] =
                        (ushort)((a[13 * i + 0] & 0xff) | (((short)(a[13 * i + 1] & 0xff) & 0x1f) << 8));
                    coeffs[8 * i + 1] = (ushort)(((a[13 * i + 1] & 0xff) >> 5) |
                                                 (((short)(a[13 * i + 2] & 0xff)) << 3) |
                                                 (((short)(a[13 * i + 3] & 0xff) & 0x03) << 11));
                    coeffs[8 * i + 2] =
                        (ushort)(((a[13 * i + 3] & 0xff) >> 2) | (((short)(a[13 * i + 4] & 0xff) & 0x7f) << 6));
                    coeffs[8 * i + 3] = (ushort)(((a[13 * i + 4] & 0xff) >> 7) |
                                                 (((short)(a[13 * i + 5] & 0xff)) << 1) |
                                                 (((short)(a[13 * i + 6] & 0xff) & 0x0f) << 9));
                    break;
                }
                case 2:
                {
                    coeffs[8 * i + 0] =
                        (ushort)((a[13 * i + 0] & 0xff) | (((short)(a[13 * i + 1] & 0xff) & 0x1f) << 8));
                    coeffs[8 * i + 1] = (ushort)(((a[13 * i + 1] & 0xff) >> 5) |
                                                 (((short)(a[13 * i + 2] & 0xff)) << 3) |
                                                 (((short)(a[13 * i + 3] & 0xff) & 0x03) << 11));
                    break;
                }
            }

            coeffs[ParameterSet.N - 1] = 0;
        }

        public override void Lift(Polynomial a)
        {
            int n = coeffs.Length;

            /* NOTE: Assumes input is in {0,1,2}^N */
            /*       Produces output in [0,Q-1]^N */
            int i;
            HrssPolynomial b = new HrssPolynomial((NtruHrssParameterSet)ParameterSet);

            ushort t, zj;

            /* Define z by <z*x^i, x-1> = delta_{i,0} mod 3:      */
            /*   t      = -1/N mod p = -N mod 3                   */
            /*   z[0]   = 2 - t mod 3                             */
            /*   z[1]   = 0 mod 3                                 */
            /*   z[j]   = z[j-1] + t mod 3                        */
            /* We'll compute b = a/(x-1) mod (3, Phi) using       */
            /*   b[0] = <z, a>, b[1] = <z*x,a>, b[2] = <z*x^2,a>  */
            /*   b[i] = b[i-3] - (a[i] + a[i-1] + a[i-2])         */
            t = (ushort)(3 - (n % 3));
            b.coeffs[0] = (ushort)(a.coeffs[0] * (2 - t) + a.coeffs[1] * 0 + a.coeffs[2] * t);
            b.coeffs[1] = (ushort)(a.coeffs[1] * (2 - t) + a.coeffs[2] * 0);
            b.coeffs[2] = (ushort)(a.coeffs[2] * (2 - t));

            zj = 0; /* z[1] */
            for (i = 3; i < n; i++)
            {
                b.coeffs[0] += (ushort)(a.coeffs[i] * (zj + 2 * t));
                b.coeffs[1] += (ushort)(a.coeffs[i] * (zj + t));
                b.coeffs[2] += (ushort)(a.coeffs[i] * zj);
                zj = (ushort)((zj + t) % 3);
            }

            b.coeffs[1] += (ushort)(a.coeffs[0] * (zj + t));
            b.coeffs[2] += (ushort)(a.coeffs[0] * zj);
            b.coeffs[2] += (ushort)(a.coeffs[1] * (zj + t));
            for (i = 3; i < n; i++)
            {
                b.coeffs[i] = (ushort)(b.coeffs[i - 3] + 2 * (a.coeffs[i] + a.coeffs[i - 1] + a.coeffs[i - 2]));
            }


            /* Finish reduction mod Phi by subtracting Phi * b[N-1] */
            b.Mod3PhiN();

            /* Switch from {0,1,2} to {0,1,q-1} coefficient representation */
            b.Z3ToZq();


            /* Multiply by (x-1) */
            coeffs[0] = (ushort)-b.coeffs[0];
            for (i = 0; i < n - 1; i++)
            {
                coeffs[i + 1] = (ushort)(b.coeffs[i] - b.coeffs[i + 1]);
            }
        }

        public override void R2Inv(Polynomial a)
        {
            HrssPolynomial f = new HrssPolynomial((NtruHrssParameterSet)ParameterSet);
            HrssPolynomial g = new HrssPolynomial((NtruHrssParameterSet)ParameterSet);
            HrssPolynomial v = new HrssPolynomial((NtruHrssParameterSet)ParameterSet);
            HrssPolynomial w = new HrssPolynomial((NtruHrssParameterSet)ParameterSet);
            R2Inv(a, f, g, v, w);
        }

        public override void RqInv(Polynomial a)
        {
            HrssPolynomial ai2 = new HrssPolynomial((NtruHrssParameterSet)ParameterSet);
            HrssPolynomial b = new HrssPolynomial((NtruHrssParameterSet)ParameterSet);
            HrssPolynomial c = new HrssPolynomial((NtruHrssParameterSet)ParameterSet);
            HrssPolynomial s = new HrssPolynomial((NtruHrssParameterSet)ParameterSet);
            RqInv(a, ai2, b, c, s);
        }

        public override void S3Inv(Polynomial a)
        {
            HrssPolynomial f = new HrssPolynomial((NtruHrssParameterSet)ParameterSet);
            HrssPolynomial g = new HrssPolynomial((NtruHrssParameterSet)ParameterSet);
            HrssPolynomial v = new HrssPolynomial((NtruHrssParameterSet)ParameterSet);
            HrssPolynomial w = new HrssPolynomial((NtruHrssParameterSet)ParameterSet);
            S3Inv(a, f, g, v, w);
        }
    }
}