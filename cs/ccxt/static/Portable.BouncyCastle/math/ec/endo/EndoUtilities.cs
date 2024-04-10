using System;

using Org.BouncyCastle.Math.EC.Multiplier;

namespace Org.BouncyCastle.Math.EC.Endo
{
    public abstract class EndoUtilities
    {
        public static readonly string PRECOMP_NAME = "bc_endo";

        public static BigInteger[] DecomposeScalar(ScalarSplitParameters p, BigInteger k)
        {
            int bits = p.Bits;
            BigInteger b1 = CalculateB(k, p.G1, bits);
            BigInteger b2 = CalculateB(k, p.G2, bits);

            BigInteger a = k.Subtract((b1.Multiply(p.V1A)).Add(b2.Multiply(p.V2A)));
            BigInteger b = (b1.Multiply(p.V1B)).Add(b2.Multiply(p.V2B)).Negate();

            return new BigInteger[]{ a, b };
        }

        public static ECPoint MapPoint(ECEndomorphism endomorphism, ECPoint p)
        {
            EndoPreCompInfo precomp = (EndoPreCompInfo)p.Curve.Precompute(p, PRECOMP_NAME,
                new MapPointCallback(endomorphism, p));
            return precomp.MappedPoint;
        }

        private static BigInteger CalculateB(BigInteger k, BigInteger g, int t)
        {
            bool negative = (g.SignValue < 0);
            BigInteger b = k.Multiply(g.Abs());
            bool extra = b.TestBit(t - 1);
            b = b.ShiftRight(t);
            if (extra)
            {
                b = b.Add(BigInteger.One);
            }
            return negative ? b.Negate() : b;
        }

        private class MapPointCallback
            : IPreCompCallback
        {
            private readonly ECEndomorphism m_endomorphism;
            private readonly ECPoint m_point;

            internal MapPointCallback(ECEndomorphism endomorphism, ECPoint point)
            {
                this.m_endomorphism = endomorphism;
                this.m_point = point;
            }

            public PreCompInfo Precompute(PreCompInfo existing)
            {
                EndoPreCompInfo existingEndo = existing as EndoPreCompInfo;

                if (CheckExisting(existingEndo, m_endomorphism))
                    return existingEndo;

                ECPoint mappedPoint = m_endomorphism.PointMap.Map(m_point);

                EndoPreCompInfo result = new EndoPreCompInfo();
                result.Endomorphism = m_endomorphism;
                result.MappedPoint = mappedPoint;
                return result;
            }

            private bool CheckExisting(EndoPreCompInfo existingEndo, ECEndomorphism endomorphism)
            {
                return null != existingEndo
                    && existingEndo.Endomorphism == endomorphism
                    && existingEndo.MappedPoint != null;
            }

        }
    }
}
