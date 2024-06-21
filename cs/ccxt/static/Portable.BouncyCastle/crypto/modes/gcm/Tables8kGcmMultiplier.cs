using System;

using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Modes.Gcm
{
    public class Tables8kGcmMultiplier
        : IGcmMultiplier
    {
        private byte[] H;
        private GcmUtilities.FieldElement[][] T;

        public void Init(byte[] H)
        {
            if (T == null)
            {
                T = new GcmUtilities.FieldElement[2][];
            }
            else if (Arrays.AreEqual(this.H, H))
            {
                return;
            }

            this.H = Arrays.Clone(H);

            for (int i = 0; i < 2; ++i)
            {
                GcmUtilities.FieldElement[] t = T[i] = new GcmUtilities.FieldElement[256];

                // t[0] = 0

                if (i == 0)
                {
                    // t[1] = H.p^7
                    GcmUtilities.AsFieldElement(this.H, out t[1]);
                    GcmUtilities.MultiplyP7(ref t[1]);
                }
                else
                {
                    // t[1] = T[i-1][1].p^8
                    GcmUtilities.MultiplyP8(ref T[i - 1][1], out t[1]);
                }

                for (int n = 1; n < 128; ++n)
                {
                    // t[2.n] = t[n].p^-1
                    GcmUtilities.DivideP(ref t[n], out t[n << 1]);

                    // t[2.n + 1] = t[2.n] + t[1]
                    GcmUtilities.Xor(ref t[n << 1], ref t[1], out t[(n << 1) + 1]);
                }
            }
        }

        public void MultiplyH(byte[] x)
        {
            GcmUtilities.FieldElement[] T0 = T[0], T1 = T[1];

            //GcmUtilities.FieldElement z;
            //GcmUtilities.Xor(ref T0[x[14]], ref T1[x[15]], out z);
            //for (int i = 12; i >= 0; i -= 2)
            //{
            //    GcmUtilities.MultiplyP16(ref z);
            //    GcmUtilities.Xor(ref z, ref T0[x[i]]);
            //    GcmUtilities.Xor(ref z, ref T1[x[i + 1]]);
            //}
            //GcmUtilities.AsBytes(ref z, x);

            int vPos = x[15];
            int uPos = x[14];
            ulong z1 = T0[uPos].n1 ^ T1[vPos].n1;
            ulong z0 = T0[uPos].n0 ^ T1[vPos].n0;

            for (int i = 12; i >= 0; i -= 2)
            {
                vPos = x[i + 1];
                uPos = x[i];

                ulong c = z1 << 48;
                z1 = T0[uPos].n1 ^ T1[vPos].n1 ^ ((z1 >> 16) | (z0 << 48));
                z0 = T0[uPos].n0 ^ T1[vPos].n0 ^ (z0 >> 16) ^ c ^ (c >> 1) ^ (c >> 2) ^ (c >> 7);
            }

            GcmUtilities.AsBytes(z0, z1, x);
        }
    }
}
