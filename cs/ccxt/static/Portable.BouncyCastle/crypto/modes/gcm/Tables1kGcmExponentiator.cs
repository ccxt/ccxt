using System;
using System.Collections.Generic;

namespace Org.BouncyCastle.Crypto.Modes.Gcm
{
    public class Tables1kGcmExponentiator
        : IGcmExponentiator
    {
        // A lookup table of the power-of-two powers of 'x'
        // - lookupPowX2[i] = x^(2^i)
        private IList<GcmUtilities.FieldElement> lookupPowX2;

        public void Init(byte[] x)
        {
            GcmUtilities.FieldElement y;
            GcmUtilities.AsFieldElement(x, out y);
            if (lookupPowX2 != null && y.Equals(lookupPowX2[0]))
                return;

            lookupPowX2 = new List<GcmUtilities.FieldElement>(8);
            lookupPowX2.Add(y);
        }

        public void ExponentiateX(long pow, byte[] output)
        {
            GcmUtilities.FieldElement y;
            GcmUtilities.One(out y);
            int bit = 0;
            while (pow > 0)
            {
                if ((pow & 1L) != 0)
                {
                    EnsureAvailable(bit);
                    GcmUtilities.FieldElement powX2 = (GcmUtilities.FieldElement)lookupPowX2[bit];
                    GcmUtilities.Multiply(ref y, ref powX2);
                }
                ++bit;
                pow >>= 1;
            }

            GcmUtilities.AsBytes(ref y, output);
        }

        private void EnsureAvailable(int bit)
        {
            int count = lookupPowX2.Count;
            if (count <= bit)
            {
                GcmUtilities.FieldElement powX2 = (GcmUtilities.FieldElement)lookupPowX2[count - 1];
                do
                {
                    GcmUtilities.Square(ref powX2);
                    lookupPowX2.Add(powX2);
                }
                while (++count <= bit);
            }
        }
    }
}
