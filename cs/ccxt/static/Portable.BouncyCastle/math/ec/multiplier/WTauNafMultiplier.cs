using System;

using Org.BouncyCastle.Math.EC.Abc;

namespace Org.BouncyCastle.Math.EC.Multiplier
{
    /**
    * Class implementing the WTNAF (Window
    * <code>&#964;</code>-adic Non-Adjacent Form) algorithm.
    */
    public class WTauNafMultiplier
        : AbstractECMultiplier
    {
        // TODO Create WTauNafUtilities class and move various functionality into it
        internal static readonly string PRECOMP_NAME = "bc_wtnaf";

        /**
        * Multiplies a {@link org.bouncycastle.math.ec.AbstractF2mPoint AbstractF2mPoint}
        * by <code>k</code> using the reduced <code>&#964;</code>-adic NAF (RTNAF)
        * method.
        * @param p The AbstractF2mPoint to multiply.
        * @param k The integer by which to multiply <code>k</code>.
        * @return <code>p</code> multiplied by <code>k</code>.
        */
        protected override ECPoint MultiplyPositive(ECPoint point, BigInteger k)
        {
            AbstractF2mPoint p = point as AbstractF2mPoint;
            if (p == null)
                throw new ArgumentException("Only AbstractF2mPoint can be used in WTauNafMultiplier");

            AbstractF2mCurve curve = (AbstractF2mCurve)p.Curve;
            int m = curve.FieldSize;
            sbyte a = (sbyte)curve.A.ToBigInteger().IntValue;
            sbyte mu = Tnaf.GetMu(a);
            BigInteger[] s = curve.GetSi();

            ZTauElement rho = Tnaf.PartModReduction(k, m, a, s, mu, (sbyte)10);

            return MultiplyWTnaf(p, rho, a, mu);
        }

        /**
        * Multiplies a {@link org.bouncycastle.math.ec.AbstractF2mPoint AbstractF2mPoint}
        * by an element <code>&#955;</code> of <code><b>Z</b>[&#964;]</code> using
        * the <code>&#964;</code>-adic NAF (TNAF) method.
        * @param p The AbstractF2mPoint to multiply.
        * @param lambda The element <code>&#955;</code> of
        * <code><b>Z</b>[&#964;]</code> of which to compute the
        * <code>[&#964;]</code>-adic NAF.
        * @return <code>p</code> multiplied by <code>&#955;</code>.
        */
        private AbstractF2mPoint MultiplyWTnaf(AbstractF2mPoint p, ZTauElement lambda,
            sbyte a, sbyte mu)
        {
            ZTauElement[] alpha = (a == 0) ? Tnaf.Alpha0 : Tnaf.Alpha1;

            BigInteger tw = Tnaf.GetTw(mu, Tnaf.Width);

            sbyte[]u = Tnaf.TauAdicWNaf(mu, lambda, Tnaf.Width,
                BigInteger.ValueOf(Tnaf.Pow2Width), tw, alpha);

            return MultiplyFromWTnaf(p, u);
        }
        
        /**
        * Multiplies a {@link org.bouncycastle.math.ec.AbstractF2mPoint AbstractF2mPoint}
        * by an element <code>&#955;</code> of <code><b>Z</b>[&#964;]</code>
        * using the window <code>&#964;</code>-adic NAF (TNAF) method, given the
        * WTNAF of <code>&#955;</code>.
        * @param p The AbstractF2mPoint to multiply.
        * @param u The the WTNAF of <code>&#955;</code>..
        * @return <code>&#955; * p</code>
        */
        private static AbstractF2mPoint MultiplyFromWTnaf(AbstractF2mPoint p, sbyte[] u)
        {
            AbstractF2mCurve curve = (AbstractF2mCurve)p.Curve;
            sbyte a = (sbyte)curve.A.ToBigInteger().IntValue;

            WTauNafCallback callback = new WTauNafCallback(p, a);
            WTauNafPreCompInfo preCompInfo = (WTauNafPreCompInfo)curve.Precompute(p, PRECOMP_NAME, callback);
            AbstractF2mPoint[] pu = preCompInfo.PreComp;

            // TODO Include negations in precomp (optionally) and use from here
            AbstractF2mPoint[] puNeg = new AbstractF2mPoint[pu.Length];
            for (int i = 0; i < pu.Length; ++i)
            {
                puNeg[i] = (AbstractF2mPoint)pu[i].Negate();
            }

            
            // q = infinity
            AbstractF2mPoint q = (AbstractF2mPoint) p.Curve.Infinity;

            int tauCount = 0;
            for (int i = u.Length - 1; i >= 0; i--)
            {
                ++tauCount;
                int ui = u[i];
                if (ui != 0)
                {
                    q = q.TauPow(tauCount);
                    tauCount = 0;

                    ECPoint x = ui > 0 ? pu[ui >> 1] : puNeg[(-ui) >> 1];
                    q = (AbstractF2mPoint)q.Add(x);
                }
            }
            if (tauCount > 0)
            {
                q = q.TauPow(tauCount);
            }
            return q;
        }

        private class WTauNafCallback
            : IPreCompCallback
        {
            private readonly AbstractF2mPoint m_p;
            private readonly sbyte m_a;

            internal WTauNafCallback(AbstractF2mPoint p, sbyte a)
            {
                this.m_p = p;
                this.m_a = a;
            }

            public PreCompInfo Precompute(PreCompInfo existing)
            {
                if (existing is WTauNafPreCompInfo)
                    return existing;

                WTauNafPreCompInfo result = new WTauNafPreCompInfo();
                result.PreComp = Tnaf.GetPreComp(m_p, m_a);
                return result;
            }
        }
    }
}
