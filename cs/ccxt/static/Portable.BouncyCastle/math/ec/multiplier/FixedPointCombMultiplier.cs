using System;

using Org.BouncyCastle.Math.Raw;

namespace Org.BouncyCastle.Math.EC.Multiplier
{
    public class FixedPointCombMultiplier
        : AbstractECMultiplier
    {
        protected override ECPoint MultiplyPositive(ECPoint p, BigInteger k)
        {
            ECCurve c = p.Curve;
            int size = FixedPointUtilities.GetCombSize(c);

            if (k.BitLength > size)
            {
                /*
                 * TODO The comb works best when the scalars are less than the (possibly unknown) order.
                 * Still, if we want to handle larger scalars, we could allow customization of the comb
                 * size, or alternatively we could deal with the 'extra' bits either by running the comb
                 * multiple times as necessary, or by using an alternative multiplier as prelude.
                 */
                throw new InvalidOperationException("fixed-point comb doesn't support scalars larger than the curve order");
            }

            FixedPointPreCompInfo info = FixedPointUtilities.Precompute(p);
            ECLookupTable lookupTable = info.LookupTable;
            int width = info.Width;

            int d = (size + width - 1) / width;

            ECPoint R = c.Infinity;

            int fullComb = d * width;
            uint[] K = Nat.FromBigInteger(fullComb, k);

            int top = fullComb - 1;
            for (int i = 0; i < d; ++i)
            {
                uint secretIndex = 0;

                for (int j = top - i; j >= 0; j -= d)
                {
                    uint secretBit = K[j >> 5] >> (j & 0x1F);
                    secretIndex ^= secretBit >> 1;
                    secretIndex <<= 1;
                    secretIndex ^= secretBit;
                }

                ECPoint add = lookupTable.Lookup((int)secretIndex);

                R = R.TwicePlus(add);
            }

            return R.Add(info.Offset);
        }
    }
}
