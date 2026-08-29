using System;

namespace Org.BouncyCastle.Crypto.Modes.Gcm
{
    public class BasicGcmExponentiator
        : IGcmExponentiator
    {
        private GcmUtilities.FieldElement x;

        public void Init(byte[] x)
        {
            GcmUtilities.AsFieldElement(x, out this.x);
        }

        public void ExponentiateX(long pow, byte[] output)
        {
            GcmUtilities.FieldElement y;
            GcmUtilities.One(out y);

            if (pow > 0)
            {
                GcmUtilities.FieldElement powX = x;
                do
                {
                    if ((pow & 1L) != 0)
                    {
                        GcmUtilities.Multiply(ref y, ref powX);
                    }
                    GcmUtilities.Square(ref powX);
                    pow >>= 1;
                }
                while (pow > 0);
            }

            GcmUtilities.AsBytes(ref y, output);
        }
    }
}
