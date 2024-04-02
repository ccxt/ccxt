using System;
using Org.BouncyCastle.Pqc.Crypto.Ntru.ParameterSets;

namespace Org.BouncyCastle.Pqc.Crypto.Ntru.Polynomials
{
    internal class HpsPolynomial : Polynomial
    {
        public HpsPolynomial(NtruParameterSet parameterSet) : base(parameterSet)
        {
        }

        public override byte[] SqToBytes(int len)
        {
            byte[] r = new byte[len];

            int i, j;
            short[] t = new short[8];
            for (i = 0;
                 i < ParameterSet.PackDegree() / 8;
                 i++)
            {
                for (j = 0; j < 8; j++)
                {
                    t[j] = (short)ModQ((uint)coeffs[8 * i + j] & 0xffff, (uint)ParameterSet.Q());
                }

                r[11 * i + 0] = (byte)(t[0] & 0xff);
                r[11 * i + 1] = (byte)((t[0] >> 8) | ((t[1] & 0x1f) << 3));
                r[11 * i + 2] = (byte)((t[1] >> 5) | ((t[2] & 0x03) << 6));
                r[11 * i + 3] = (byte)((t[2] >> 2) & 0xff);
                r[11 * i + 4] = (byte)((t[2] >> 10) | ((t[3] & 0x7f) << 1));
                r[11 * i + 5] = (byte)((t[3] >> 7) | ((t[4] & 0x0f) << 4));
                r[11 * i + 6] = (byte)((t[4] >> 4) | ((t[5] & 0x01) << 7));
                r[11 * i + 7] = (byte)((t[5] >> 1) & 0xff);
                r[11 * i + 8] = (byte)((t[5] >> 9) | ((t[6] & 0x3f) << 2));
                r[11 * i + 9] = (byte)((t[6] >> 6) | ((t[7] & 0x07) << 5));
                r[11 * i + 10] = (byte)(t[7] >> 3);
            }

            for (j = 0; j < ParameterSet.PackDegree() - 8 * i; j++)
            {
                t[j] = (short)ModQ((uint)coeffs[8 * i + j] & 0xffff, (uint)ParameterSet.Q());
            }

            for (; j < 8; j++)
            {
                t[j] = 0;
            }

            switch (ParameterSet.PackDegree() & 0x07)
            {
                case 4:
                {
                    r[11 * i + 0] = (byte)(t[0] & 0xff);
                    r[11 * i + 1] = (byte)((t[0] >> 8) | ((t[1] & 0x1f) << 3));
                    r[11 * i + 2] = (byte)((t[1] >> 5) | ((t[2] & 0x03) << 6));
                    r[11 * i + 3] = (byte)((t[2] >> 2) & 0xff);
                    r[11 * i + 4] = (byte)((t[2] >> 10) | ((t[3] & 0x7f) << 1));
                    r[11 * i + 5] = (byte)((t[3] >> 7) | ((t[4] & 0x0f) << 4));
                    break;
                }
                case 2:
                {
                    r[11 * i + 0] = (byte)(t[0] & 0xff);
                    r[11 * i + 1] = (byte)((t[0] >> 8) | ((t[1] & 0x1f) << 3));
                    r[11 * i + 2] = (byte)((t[1] >> 5) | ((t[2] & 0x03) << 6));
                    break;
                }
            }

            return r;
        }

        public override void SqFromBytes(byte[] a)
        {
            int n = coeffs.Length;
            int i;
            for (i = 0; i < ParameterSet.PackDegree() / 8; i++)
            {
                coeffs[8 * i + 0] =
                    (ushort)(((a[11 * i + 0] & 0xff) >> 0) | (((ushort)(a[11 * i + 1] & 0xff) & 0x07) << 8));
                coeffs[8 * i + 1] =
                    (ushort)(((a[11 * i + 1] & 0xff) >> 3) | (((ushort)(a[11 * i + 2] & 0xff) & 0x3f) << 5));
                coeffs[8 * i + 2] = (ushort)(((a[11 * i + 2] & 0xff) >> 6) |
                                             (((ushort)(a[11 * i + 3] & 0xff) & 0xff) << 2) |
                                             (((ushort)(a[11 * i + 4] & 0xff) & 0x01) << 10));
                coeffs[8 * i + 3] =
                    (ushort)(((a[11 * i + 4] & 0xff) >> 1) | (((ushort)(a[11 * i + 5] & 0xff) & 0x0f) << 7));
                coeffs[8 * i + 4] =
                    (ushort)(((a[11 * i + 5] & 0xff) >> 4) | (((ushort)(a[11 * i + 6] & 0xff) & 0x7f) << 4));
                coeffs[8 * i + 5] = (ushort)(((a[11 * i + 6] & 0xff) >> 7) |
                                             (((ushort)(a[11 * i + 7] & 0xff) & 0xff) << 1) |
                                             (((ushort)(a[11 * i + 8] & 0xff) & 0x03) << 9));
                coeffs[8 * i + 6] =
                    (ushort)(((a[11 * i + 8] & 0xff) >> 2) | (((ushort)(a[11 * i + 9] & 0xff) & 0x1f) << 6));
                coeffs[8 * i + 7] =
                    (ushort)(((a[11 * i + 9] & 0xff) >> 5) | (((ushort)(a[11 * i + 10] & 0xff) & 0xff) << 3));
            }

            switch (ParameterSet.PackDegree() & 0x07)
            {
                case 4:
                {
                    coeffs[8 * i + 0] =
                        (ushort)(((a[11 * i + 0] & 0xff) >> 0) | (((ushort)(a[11 * i + 1] & 0xff) & 0x07) << 8));
                    coeffs[8 * i + 1] =
                        (ushort)(((a[11 * i + 1] & 0xff) >> 3) | (((ushort)(a[11 * i + 2] & 0xff) & 0x3f) << 5));
                    coeffs[8 * i + 2] = (ushort)(((a[11 * i + 2] & 0xff) >> 6) |
                                                 (((ushort)(a[11 * i + 3] & 0xff) & 0xff) << 2) |
                                                 (((ushort)(a[11 * i + 4] & 0xff) & 0x01) << 10));
                    coeffs[8 * i + 3] =
                        (ushort)(((a[11 * i + 4] & 0xff) >> 1) | (((ushort)(a[11 * i + 5] & 0xff) & 0x0f) << 7));
                    break;
                }
                case 2:
                {
                    coeffs[8 * i + 0] =
                        (ushort)(((a[11 * i + 0] & 0xff) >> 0) | (((ushort)(a[11 * i + 1] & 0xff) & 0x07) << 8));
                    coeffs[8 * i + 1] =
                        (ushort)(((a[11 * i + 1] & 0xff) >> 3) | (((ushort)(a[11 * i + 2] & 0xff) & 0x3f) << 5));
                    break;
                }
            }

            coeffs[n - 1] = 0;
        }

        public override void Lift(Polynomial a)
        {
            int n = coeffs.Length;
            Array.Copy(a.coeffs, 0, coeffs, 0, n);
            Z3ToZq();
        }

        public override void R2Inv(Polynomial a)
        {
            HpsPolynomial f = new HpsPolynomial((NtruHpsParameterSet)ParameterSet);
            HpsPolynomial g = new HpsPolynomial((NtruHpsParameterSet)ParameterSet);
            HpsPolynomial v = new HpsPolynomial((NtruHpsParameterSet)ParameterSet);
            HpsPolynomial w = new HpsPolynomial((NtruHpsParameterSet)ParameterSet);
            R2Inv(a, f, g, v, w);
        }

        public override void RqInv(Polynomial a)
        {
            HpsPolynomial ai2 = new HpsPolynomial((NtruHpsParameterSet)ParameterSet);
            HpsPolynomial b = new HpsPolynomial((NtruHpsParameterSet)ParameterSet);
            HpsPolynomial c = new HpsPolynomial((NtruHpsParameterSet)ParameterSet);
            HpsPolynomial s = new HpsPolynomial((NtruHpsParameterSet)ParameterSet);
            RqInv(a, ai2, b, c, s);
        }

        public override void S3Inv(Polynomial a)
        {
            HpsPolynomial f = new HpsPolynomial((NtruHpsParameterSet)ParameterSet);
            HpsPolynomial g = new HpsPolynomial((NtruHpsParameterSet)ParameterSet);
            HpsPolynomial v = new HpsPolynomial((NtruHpsParameterSet)ParameterSet);
            HpsPolynomial w = new HpsPolynomial((NtruHpsParameterSet)ParameterSet);
            S3Inv(a, f, g, v, w);
        }
    }
}