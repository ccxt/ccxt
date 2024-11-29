using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Math.EC.Multiplier
{
    /**
    * Class implementing the WNAF (Window Non-Adjacent Form) multiplication
    * algorithm.
    */
    public class WNafL2RMultiplier
        : AbstractECMultiplier
    {
        /**
         * Multiplies <code>this</code> by an integer <code>k</code> using the
         * Window NAF method.
         * @param k The integer by which <code>this</code> is multiplied.
         * @return A new <code>ECPoint</code> which equals <code>this</code>
         * multiplied by <code>k</code>.
         */
        protected override ECPoint MultiplyPositive(ECPoint p, BigInteger k)
        {
            int minWidth = WNafUtilities.GetWindowSize(k.BitLength);

            WNafPreCompInfo info = WNafUtilities.Precompute(p, minWidth, true);
            ECPoint[] preComp = info.PreComp;
            ECPoint[] preCompNeg = info.PreCompNeg;
            int width = info.Width;

            int[] wnaf = WNafUtilities.GenerateCompactWindowNaf(width, k);

            ECPoint R = p.Curve.Infinity;

            int i = wnaf.Length;

            /*
             * NOTE: We try to optimize the first window using the precomputed points to substitute an
             * addition for 2 or more doublings.
             */
            if (i > 1)
            {
                int wi = wnaf[--i];
                int digit = wi >> 16, zeroes = wi & 0xFFFF;

                int n = System.Math.Abs(digit);
                ECPoint[] table = digit < 0 ? preCompNeg : preComp;

                // Optimization can only be used for values in the lower half of the table
                if ((n << 2) < (1 << width))
                {
                    int highest = 32 - Integers.NumberOfLeadingZeros(n);

                    // TODO Get addition/doubling cost ratio from curve and compare to 'scale' to see if worth substituting?
                    int scale = width - highest;
                    int lowBits = n ^ (1 << (highest - 1));

                    int i1 = ((1 << (width - 1)) - 1);
                    int i2 = (lowBits << scale) + 1;
                    R = table[i1 >> 1].Add(table[i2 >> 1]);

                    zeroes -= scale;

                    //Console.WriteLine("Optimized: 2^" + scale + " * " + n + " = " + i1 + " + " + i2);
                }
                else
                {
                    R = table[n >> 1];
                }

                R = R.TimesPow2(zeroes);
            }

            while (i > 0)
            {
                int wi = wnaf[--i];
                int digit = wi >> 16, zeroes = wi & 0xFFFF;

                int n = System.Math.Abs(digit);
                ECPoint[] table = digit < 0 ? preCompNeg : preComp;
                ECPoint r = table[n >> 1];

                R = R.TwicePlus(r);
                R = R.TimesPow2(zeroes);
            }

            return R;
        }
    }
}
