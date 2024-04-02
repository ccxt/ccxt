using Org.BouncyCastle.Pqc.Crypto.Ntru.ParameterSets;

namespace Org.BouncyCastle.Pqc.Crypto.Ntru.Polynomials
{
    internal class Hps4096Polynomial : HpsPolynomial
    {
        public Hps4096Polynomial(NtruParameterSet parameterSet) : base(parameterSet)
        {
        }

        public override byte[] SqToBytes(int len)
        {
            byte[] r = new byte[len];
            uint q = (uint)ParameterSet.Q();
            int i;

            for (i = 0; i < ParameterSet.PackDegree() / 2; i++)
            {
                r[3 * i + 0] = (byte)(ModQ(((uint)coeffs[2 * i + 0] & 0xffff), q) & 0xff);
                r[3 * i + 1] = (byte)((ModQ(((uint)coeffs[2 * i + 0] & 0xffff), q) >> 8) |
                                      ((ModQ((uint)(coeffs[2 * i + 1] & 0xffff), q) & 0x0f) << 4));
                r[3 * i + 2] = (byte)((ModQ(((uint)coeffs[2 * i + 1] & 0xffff), q) >> 4));
            }

            return r;
        }

        public override void SqFromBytes(byte[] a)
        {
            int i;
            for (i = 0; i < ParameterSet.PackDegree() / 2; i++)
            {
                coeffs[2 * i + 0] =
                    (ushort)(((a[3 * i + 0] & 0xff) >> 0) | (((ushort)(a[3 * i + 1] & 0xff) & 0x0f) << 8));
                coeffs[2 * i + 1] =
                    (ushort)(((a[3 * i + 1] & 0xff) >> 4) | (((ushort)(a[3 * i + 2] & 0xff) & 0xff) << 4));
            }

            coeffs[ParameterSet.N - 1] = 0;
        }
    }
}