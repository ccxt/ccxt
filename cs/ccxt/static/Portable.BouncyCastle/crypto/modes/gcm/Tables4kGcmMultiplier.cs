using System;

using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Modes.Gcm
{
    public class Tables4kGcmMultiplier
        : IGcmMultiplier
    {
        private byte[] H;
        private GcmUtilities.FieldElement[] T;

        public void Init(byte[] H)
        {
            if (T == null)
            {
                T = new GcmUtilities.FieldElement[256];
            }
            else if (Arrays.AreEqual(this.H, H))
            {
                return;
            }

            this.H = Arrays.Clone(H);

            // T[0] = 0

            // T[1] = H.p^7
            GcmUtilities.AsFieldElement(this.H, out T[1]);
            GcmUtilities.MultiplyP7(ref T[1]);

            for (int n = 1; n < 128; ++n)
            {
                // T[2.n] = T[n].p^-1
                GcmUtilities.DivideP(ref T[n], out T[n << 1]);

                // T[2.n + 1] = T[2.n] + T[1]
                GcmUtilities.Xor(ref T[n << 1], ref T[1], out T[(n << 1) + 1]);
            }
        }

        public void MultiplyH(byte[] x)
        {
            //GcmUtilities.FieldElement z = T[x[15]];
            //for (int i = 14; i >= 0; --i)
            //{
            //    GcmUtilities.MultiplyP8(ref z);
            //    GcmUtilities.Xor(ref z, ref T[x[i]]);
            //}
            //GcmUtilities.AsBytes(ref z, x);

            int pos = x[15];
            ulong z0 = T[pos].n0, z1 = T[pos].n1;

            for (int i = 14; i >= 0; --i)
            {
                pos = x[i];

                ulong c = z1 << 56;
                z1 = T[pos].n1 ^ ((z1 >> 8) | (z0 << 56));
                z0 = T[pos].n0 ^ (z0 >> 8) ^ c ^ (c >> 1) ^ (c >> 2) ^ (c >> 7);
            }

            GcmUtilities.AsBytes(z0, z1, x);
        }
    }
}
