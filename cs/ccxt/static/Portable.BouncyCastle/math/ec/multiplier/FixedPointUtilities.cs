using System;

namespace Org.BouncyCastle.Math.EC.Multiplier
{
    public class FixedPointUtilities
    {
        public static readonly string PRECOMP_NAME = "bc_fixed_point";

        public static int GetCombSize(ECCurve c)
        {
            BigInteger order = c.Order;
            return order == null ? c.FieldSize + 1 : order.BitLength;
        }

        public static FixedPointPreCompInfo GetFixedPointPreCompInfo(PreCompInfo preCompInfo)
        {
            return preCompInfo as FixedPointPreCompInfo;
        }

        public static FixedPointPreCompInfo Precompute(ECPoint p)
        {
            return (FixedPointPreCompInfo)p.Curve.Precompute(p, PRECOMP_NAME, new FixedPointCallback(p));
        }

        private class FixedPointCallback
            : IPreCompCallback
        {
            private readonly ECPoint m_p;

            internal FixedPointCallback(ECPoint p)
            {
                this.m_p = p;
            }

            public PreCompInfo Precompute(PreCompInfo existing)
            {
                FixedPointPreCompInfo existingFP = existing as FixedPointPreCompInfo;

                ECCurve c = m_p.Curve;
                int bits = FixedPointUtilities.GetCombSize(c);
                int minWidth = bits > 250 ? 6 : 5;
                int n = 1 << minWidth;

                if (CheckExisting(existingFP, n))
                    return existingFP;

                int d = (bits + minWidth - 1) / minWidth;

                ECPoint[] pow2Table = new ECPoint[minWidth + 1];
                pow2Table[0] = m_p;
                for (int i = 1; i < minWidth; ++i)
                {
                    pow2Table[i] = pow2Table[i - 1].TimesPow2(d);
                }

                // This will be the 'offset' value 
                pow2Table[minWidth] = pow2Table[0].Subtract(pow2Table[1]);

                c.NormalizeAll(pow2Table);

                ECPoint[] lookupTable = new ECPoint[n];
                lookupTable[0] = pow2Table[0];

                for (int bit = minWidth - 1; bit >= 0; --bit)
                {
                    ECPoint pow2 = pow2Table[bit];

                    int step = 1 << bit;
                    for (int i = step; i < n; i += (step << 1))
                    {
                        lookupTable[i] = lookupTable[i - step].Add(pow2);
                    }
                }

                c.NormalizeAll(lookupTable);

                FixedPointPreCompInfo result = new FixedPointPreCompInfo();
                result.LookupTable = c.CreateCacheSafeLookupTable(lookupTable, 0, lookupTable.Length);
                result.Offset = pow2Table[minWidth];
                result.Width = minWidth;
                return result;
            }

            private bool CheckExisting(FixedPointPreCompInfo existingFP, int n)
            {
                return existingFP != null && CheckTable(existingFP.LookupTable, n);
            }

            private bool CheckTable(ECLookupTable table, int n)
            {
                return table != null && table.Size >= n;
            }
        }
    }
}
