using System;

namespace Org.BouncyCastle.Math.EC.Abc
{
    /**
    * Class holding methods for point multiplication based on the window
    * &#964;-adic nonadjacent form (WTNAF). The algorithms are based on the
    * paper "Improved Algorithms for Arithmetic on Anomalous Binary Curves"
    * by Jerome A. Solinas. The paper first appeared in the Proceedings of
    * Crypto 1997.
    */
    internal class Tnaf
    {
        private static readonly BigInteger MinusOne = BigInteger.One.Negate();
        private static readonly BigInteger MinusTwo = BigInteger.Two.Negate();
        private static readonly BigInteger MinusThree = BigInteger.Three.Negate();
        private static readonly BigInteger Four = BigInteger.ValueOf(4);

        /**
        * The window width of WTNAF. The standard value of 4 is slightly less
        * than optimal for running time, but keeps space requirements for
        * precomputation low. For typical curves, a value of 5 or 6 results in
        * a better running time. When changing this value, the
        * <code>&#945;<sub>u</sub></code>'s must be computed differently, see
        * e.g. "Guide to Elliptic Curve Cryptography", Darrel Hankerson,
        * Alfred Menezes, Scott Vanstone, Springer-Verlag New York Inc., 2004,
        * p. 121-122
        */
        public const sbyte Width = 4;

        /**
        * 2<sup>4</sup>
        */
        public const sbyte Pow2Width = 16;

        /**
        * The <code>&#945;<sub>u</sub></code>'s for <code>a=0</code> as an array
        * of <code>ZTauElement</code>s.
        */
        public static readonly ZTauElement[] Alpha0 =
        {
            null,
            new ZTauElement(BigInteger.One, BigInteger.Zero), null,
            new ZTauElement(MinusThree, MinusOne), null,
            new ZTauElement(MinusOne, MinusOne), null,
            new ZTauElement(BigInteger.One, MinusOne), null
        };

        /**
        * The <code>&#945;<sub>u</sub></code>'s for <code>a=0</code> as an array
        * of TNAFs.
        */
        public static readonly sbyte[][] Alpha0Tnaf =
        {
            null, new sbyte[]{1}, null, new sbyte[]{-1, 0, 1}, null, new sbyte[]{1, 0, 1}, null, new sbyte[]{-1, 0, 0, 1}
        };

        /**
        * The <code>&#945;<sub>u</sub></code>'s for <code>a=1</code> as an array
        * of <code>ZTauElement</code>s.
        */
        public static readonly ZTauElement[] Alpha1 =
        {
            null,
            new ZTauElement(BigInteger.One, BigInteger.Zero), null,
            new ZTauElement(MinusThree, BigInteger.One), null,
            new ZTauElement(MinusOne, BigInteger.One), null,
            new ZTauElement(BigInteger.One, BigInteger.One), null
        };

        /**
        * The <code>&#945;<sub>u</sub></code>'s for <code>a=1</code> as an array
        * of TNAFs.
        */
        public static readonly sbyte[][] Alpha1Tnaf =
        {
            null, new sbyte[]{1}, null, new sbyte[]{-1, 0, 1}, null, new sbyte[]{1, 0, 1}, null, new sbyte[]{-1, 0, 0, -1}
        };

        /**
        * Computes the norm of an element <code>&#955;</code> of
        * <code><b>Z</b>[&#964;]</code>.
        * @param mu The parameter <code>&#956;</code> of the elliptic curve.
        * @param lambda The element <code>&#955;</code> of
        * <code><b>Z</b>[&#964;]</code>.
        * @return The norm of <code>&#955;</code>.
        */
        public static BigInteger Norm(sbyte mu, ZTauElement lambda)
        {
            BigInteger norm;

            // s1 = u^2
            BigInteger s1 = lambda.u.Multiply(lambda.u);

            // s2 = u * v
            BigInteger s2 = lambda.u.Multiply(lambda.v);

            // s3 = 2 * v^2
            BigInteger s3 = lambda.v.Multiply(lambda.v).ShiftLeft(1);

            if (mu == 1)
            {
                norm = s1.Add(s2).Add(s3);
            }
            else if (mu == -1)
            {
                norm = s1.Subtract(s2).Add(s3);
            }
            else
            {
                throw new ArgumentException("mu must be 1 or -1");
            }

            return norm;
        }

        /**
        * Computes the norm of an element <code>&#955;</code> of
        * <code><b>R</b>[&#964;]</code>, where <code>&#955; = u + v&#964;</code>
        * and <code>u</code> and <code>u</code> are real numbers (elements of
        * <code><b>R</b></code>). 
        * @param mu The parameter <code>&#956;</code> of the elliptic curve.
        * @param u The real part of the element <code>&#955;</code> of
        * <code><b>R</b>[&#964;]</code>.
        * @param v The <code>&#964;</code>-adic part of the element
        * <code>&#955;</code> of <code><b>R</b>[&#964;]</code>.
        * @return The norm of <code>&#955;</code>.
        */
        public static SimpleBigDecimal Norm(sbyte mu, SimpleBigDecimal u, SimpleBigDecimal v)
        {
            SimpleBigDecimal norm;

            // s1 = u^2
            SimpleBigDecimal s1 = u.Multiply(u);

            // s2 = u * v
            SimpleBigDecimal s2 = u.Multiply(v);

            // s3 = 2 * v^2
            SimpleBigDecimal s3 = v.Multiply(v).ShiftLeft(1);

            if (mu == 1)
            {
                norm = s1.Add(s2).Add(s3);
            }
            else if (mu == -1)
            {
                norm = s1.Subtract(s2).Add(s3);
            }
            else
            {
                throw new ArgumentException("mu must be 1 or -1");
            }

            return norm;
        }

        /**
        * Rounds an element <code>&#955;</code> of <code><b>R</b>[&#964;]</code>
        * to an element of <code><b>Z</b>[&#964;]</code>, such that their difference
        * has minimal norm. <code>&#955;</code> is given as
        * <code>&#955; = &#955;<sub>0</sub> + &#955;<sub>1</sub>&#964;</code>.
        * @param lambda0 The component <code>&#955;<sub>0</sub></code>.
        * @param lambda1 The component <code>&#955;<sub>1</sub></code>.
        * @param mu The parameter <code>&#956;</code> of the elliptic curve. Must
        * equal 1 or -1.
        * @return The rounded element of <code><b>Z</b>[&#964;]</code>.
        * @throws ArgumentException if <code>lambda0</code> and
        * <code>lambda1</code> do not have same scale.
        */
        public static ZTauElement Round(SimpleBigDecimal lambda0,
            SimpleBigDecimal lambda1, sbyte mu)
        {
            int scale = lambda0.Scale;
            if (lambda1.Scale != scale)
                throw new ArgumentException("lambda0 and lambda1 do not have same scale");

            if (!((mu == 1) || (mu == -1)))
                throw new ArgumentException("mu must be 1 or -1");

            BigInteger f0 = lambda0.Round();
            BigInteger f1 = lambda1.Round();

            SimpleBigDecimal eta0 = lambda0.Subtract(f0);
            SimpleBigDecimal eta1 = lambda1.Subtract(f1);

            // eta = 2*eta0 + mu*eta1
            SimpleBigDecimal eta = eta0.Add(eta0);
            if (mu == 1)
            {
                eta = eta.Add(eta1);
            }
            else
            {
                // mu == -1
                eta = eta.Subtract(eta1);
            }

            // check1 = eta0 - 3*mu*eta1
            // check2 = eta0 + 4*mu*eta1
            SimpleBigDecimal threeEta1 = eta1.Add(eta1).Add(eta1);
            SimpleBigDecimal fourEta1 = threeEta1.Add(eta1);
            SimpleBigDecimal check1;
            SimpleBigDecimal check2;
            if (mu == 1)
            {
                check1 = eta0.Subtract(threeEta1);
                check2 = eta0.Add(fourEta1);
            }
            else
            {
                // mu == -1
                check1 = eta0.Add(threeEta1);
                check2 = eta0.Subtract(fourEta1);
            }

            sbyte h0 = 0;
            sbyte h1 = 0;

            // if eta >= 1
            if (eta.CompareTo(BigInteger.One) >= 0)
            {
                if (check1.CompareTo(MinusOne) < 0)
                {
                    h1 = mu;
                }
                else
                {
                    h0 = 1;
                }
            }
            else
            {
                // eta < 1
                if (check2.CompareTo(BigInteger.Two) >= 0)
                {
                    h1 = mu;
                }
            }

            // if eta < -1
            if (eta.CompareTo(MinusOne) < 0)
            {
                if (check1.CompareTo(BigInteger.One) >= 0)
                {
                    h1 = (sbyte)-mu;
                }
                else
                {
                    h0 = -1;
                }
            }
            else
            {
                // eta >= -1
                if (check2.CompareTo(MinusTwo) < 0)
                {
                    h1 = (sbyte)-mu;
                }
            }

            BigInteger q0 = f0.Add(BigInteger.ValueOf(h0));
            BigInteger q1 = f1.Add(BigInteger.ValueOf(h1));
            return new ZTauElement(q0, q1);
        }

        /**
        * Approximate division by <code>n</code>. For an integer
        * <code>k</code>, the value <code>&#955; = s k / n</code> is
        * computed to <code>c</code> bits of accuracy.
        * @param k The parameter <code>k</code>.
        * @param s The curve parameter <code>s<sub>0</sub></code> or
        * <code>s<sub>1</sub></code>.
        * @param vm The Lucas Sequence element <code>V<sub>m</sub></code>.
        * @param a The parameter <code>a</code> of the elliptic curve.
        * @param m The bit length of the finite field
        * <code><b>F</b><sub>m</sub></code>.
        * @param c The number of bits of accuracy, i.e. the scale of the returned
        * <code>SimpleBigDecimal</code>.
        * @return The value <code>&#955; = s k / n</code> computed to
        * <code>c</code> bits of accuracy.
        */
        public static SimpleBigDecimal ApproximateDivisionByN(BigInteger k,
            BigInteger s, BigInteger vm, sbyte a, int m, int c)
        {
            int _k = (m + 5)/2 + c;
            BigInteger ns = k.ShiftRight(m - _k - 2 + a);

            BigInteger gs = s.Multiply(ns);

            BigInteger hs = gs.ShiftRight(m);

            BigInteger js = vm.Multiply(hs);

            BigInteger gsPlusJs = gs.Add(js);
            BigInteger ls = gsPlusJs.ShiftRight(_k-c);
            if (gsPlusJs.TestBit(_k-c-1))
            {
                // round up
                ls = ls.Add(BigInteger.One);
            }

            return new SimpleBigDecimal(ls, c);
        }

        /**
        * Computes the <code>&#964;</code>-adic NAF (non-adjacent form) of an
        * element <code>&#955;</code> of <code><b>Z</b>[&#964;]</code>.
        * @param mu The parameter <code>&#956;</code> of the elliptic curve.
        * @param lambda The element <code>&#955;</code> of
        * <code><b>Z</b>[&#964;]</code>.
        * @return The <code>&#964;</code>-adic NAF of <code>&#955;</code>.
        */
        public static sbyte[] TauAdicNaf(sbyte mu, ZTauElement lambda)
        {
            if (!((mu == 1) || (mu == -1))) 
                throw new ArgumentException("mu must be 1 or -1");

            BigInteger norm = Norm(mu, lambda);

            // Ceiling of log2 of the norm 
            int log2Norm = norm.BitLength;

            // If length(TNAF) > 30, then length(TNAF) < log2Norm + 3.52
            int maxLength = log2Norm > 30 ? log2Norm + 4 : 34;

            // The array holding the TNAF
            sbyte[] u = new sbyte[maxLength];
            int i = 0;

            // The actual length of the TNAF
            int length = 0;

            BigInteger r0 = lambda.u;
            BigInteger r1 = lambda.v;

            while(!((r0.Equals(BigInteger.Zero)) && (r1.Equals(BigInteger.Zero))))
            {
                // If r0 is odd
                if (r0.TestBit(0)) 
                {
                    u[i] = (sbyte) BigInteger.Two.Subtract((r0.Subtract(r1.ShiftLeft(1))).Mod(Four)).IntValue;

                    // r0 = r0 - u[i]
                    if (u[i] == 1)
                    {
                        r0 = r0.ClearBit(0);
                    }
                    else
                    {
                        // u[i] == -1
                        r0 = r0.Add(BigInteger.One);
                    }
                    length = i;
                }
                else
                {
                    u[i] = 0;
                }

                BigInteger t = r0;
                BigInteger s = r0.ShiftRight(1);
                if (mu == 1) 
                {
                    r0 = r1.Add(s);
                }
                else
                {
                    // mu == -1
                    r0 = r1.Subtract(s);
                }

                r1 = t.ShiftRight(1).Negate();
                i++;
            }

            length++;

            // Reduce the TNAF array to its actual length
            sbyte[] tnaf = new sbyte[length];
            Array.Copy(u, 0, tnaf, 0, length);
            return tnaf;
        }

        /**
        * Applies the operation <code>&#964;()</code> to an
        * <code>AbstractF2mPoint</code>. 
        * @param p The AbstractF2mPoint to which <code>&#964;()</code> is applied.
        * @return <code>&#964;(p)</code>
        */
        public static AbstractF2mPoint Tau(AbstractF2mPoint p)
        {
            return p.Tau();
        }

        /**
        * Returns the parameter <code>&#956;</code> of the elliptic curve.
        * @param curve The elliptic curve from which to obtain <code>&#956;</code>.
        * The curve must be a Koblitz curve, i.e. <code>a</code> Equals
        * <code>0</code> or <code>1</code> and <code>b</code> Equals
        * <code>1</code>. 
        * @return <code>&#956;</code> of the elliptic curve.
        * @throws ArgumentException if the given ECCurve is not a Koblitz
        * curve.
        */
        public static sbyte GetMu(AbstractF2mCurve curve)
        {
            BigInteger a = curve.A.ToBigInteger();

            sbyte mu;
            if (a.SignValue == 0)
            {
                mu = -1;
            }
            else if (a.Equals(BigInteger.One))
            {
                mu = 1;
            }
            else
            {
                throw new ArgumentException("No Koblitz curve (ABC), TNAF multiplication not possible");
            }
            return mu;
        }

        public static sbyte GetMu(ECFieldElement curveA)
        {
            return (sbyte)(curveA.IsZero ? -1 : 1);
        }

        public static sbyte GetMu(int curveA)
        {
            return (sbyte)(curveA == 0 ? -1 : 1);
        }

        /**
        * Calculates the Lucas Sequence elements <code>U<sub>k-1</sub></code> and
        * <code>U<sub>k</sub></code> or <code>V<sub>k-1</sub></code> and
        * <code>V<sub>k</sub></code>.
        * @param mu The parameter <code>&#956;</code> of the elliptic curve.
        * @param k The index of the second element of the Lucas Sequence to be
        * returned.
        * @param doV If set to true, computes <code>V<sub>k-1</sub></code> and
        * <code>V<sub>k</sub></code>, otherwise <code>U<sub>k-1</sub></code> and
        * <code>U<sub>k</sub></code>.
        * @return An array with 2 elements, containing <code>U<sub>k-1</sub></code>
        * and <code>U<sub>k</sub></code> or <code>V<sub>k-1</sub></code>
        * and <code>V<sub>k</sub></code>.
        */
        public static BigInteger[] GetLucas(sbyte mu, int k, bool doV)
        {
            if (!(mu == 1 || mu == -1)) 
                throw new ArgumentException("mu must be 1 or -1");

            BigInteger u0;
            BigInteger u1;
            BigInteger u2;

            if (doV)
            {
                u0 = BigInteger.Two;
                u1 = BigInteger.ValueOf(mu);
            }
            else
            {
                u0 = BigInteger.Zero;
                u1 = BigInteger.One;
            }

            for (int i = 1; i < k; i++)
            {
                // u2 = mu*u1 - 2*u0;
                BigInteger s = null;
                if (mu == 1)
                {
                    s = u1;
                }
                else
                {
                    // mu == -1
                    s = u1.Negate();
                }
                
                u2 = s.Subtract(u0.ShiftLeft(1));
                u0 = u1;
                u1 = u2;
                //            System.out.println(i + ": " + u2);
                //            System.out.println();
            }

            BigInteger[] retVal = {u0, u1};
            return retVal;
        }

        /**
        * Computes the auxiliary value <code>t<sub>w</sub></code>. If the width is
        * 4, then for <code>mu = 1</code>, <code>t<sub>w</sub> = 6</code> and for
        * <code>mu = -1</code>, <code>t<sub>w</sub> = 10</code> 
        * @param mu The parameter <code>&#956;</code> of the elliptic curve.
        * @param w The window width of the WTNAF.
        * @return the auxiliary value <code>t<sub>w</sub></code>
        */
        public static BigInteger GetTw(sbyte mu, int w) 
        {
            if (w == 4)
            {
                if (mu == 1)
                {
                    return BigInteger.ValueOf(6);
                }
                else
                {
                    // mu == -1
                    return BigInteger.ValueOf(10);
                }
            }
            else
            {
                // For w <> 4, the values must be computed
                BigInteger[] us = GetLucas(mu, w, false);
                BigInteger twoToW = BigInteger.Zero.SetBit(w);
                BigInteger u1invert = us[1].ModInverse(twoToW);
                BigInteger tw;
                tw = BigInteger.Two.Multiply(us[0]).Multiply(u1invert).Mod(twoToW);
                //System.out.println("mu = " + mu);
                //System.out.println("tw = " + tw);
                return tw;
            }
        }

        /**
        * Computes the auxiliary values <code>s<sub>0</sub></code> and
        * <code>s<sub>1</sub></code> used for partial modular reduction. 
        * @param curve The elliptic curve for which to compute
        * <code>s<sub>0</sub></code> and <code>s<sub>1</sub></code>.
        * @throws ArgumentException if <code>curve</code> is not a
        * Koblitz curve (Anomalous Binary Curve, ABC).
        */
        public static BigInteger[] GetSi(AbstractF2mCurve curve)
        {
            if (!curve.IsKoblitz)
                throw new ArgumentException("si is defined for Koblitz curves only");

            int m = curve.FieldSize;
            int a = curve.A.ToBigInteger().IntValue;
            sbyte mu = GetMu(a);
            int shifts = GetShiftsForCofactor(curve.Cofactor);
            int index = m + 3 - a;
            BigInteger[] ui = GetLucas(mu, index, false);

            if (mu == 1)
            {
                ui[0] = ui[0].Negate();
                ui[1] = ui[1].Negate();
            }

            BigInteger dividend0 = BigInteger.One.Add(ui[1]).ShiftRight(shifts);
            BigInteger dividend1 = BigInteger.One.Add(ui[0]).ShiftRight(shifts).Negate();

            return new BigInteger[] { dividend0, dividend1 };
        }

        public static BigInteger[] GetSi(int fieldSize, int curveA, BigInteger cofactor)
        {
            sbyte mu = GetMu(curveA);
            int shifts = GetShiftsForCofactor(cofactor);
            int index = fieldSize + 3 - curveA;
            BigInteger[] ui = GetLucas(mu, index, false);
            if (mu == 1)
            {
                ui[0] = ui[0].Negate();
                ui[1] = ui[1].Negate();
            }

            BigInteger dividend0 = BigInteger.One.Add(ui[1]).ShiftRight(shifts);
            BigInteger dividend1 = BigInteger.One.Add(ui[0]).ShiftRight(shifts).Negate();

            return new BigInteger[] { dividend0, dividend1 };
        }

        protected static int GetShiftsForCofactor(BigInteger h)
        {
            if (h != null && h.BitLength < 4)
            {
                int hi = h.IntValue;
                if (hi == 2)
                    return 1;
                if (hi == 4)
                    return 2;
            }

            throw new ArgumentException("h (Cofactor) must be 2 or 4");
        }

        /**
        * Partial modular reduction modulo
        * <code>(&#964;<sup>m</sup> - 1)/(&#964; - 1)</code>.
        * @param k The integer to be reduced.
        * @param m The bitlength of the underlying finite field.
        * @param a The parameter <code>a</code> of the elliptic curve.
        * @param s The auxiliary values <code>s<sub>0</sub></code> and
        * <code>s<sub>1</sub></code>.
        * @param mu The parameter &#956; of the elliptic curve.
        * @param c The precision (number of bits of accuracy) of the partial
        * modular reduction.
        * @return <code>&#961; := k partmod (&#964;<sup>m</sup> - 1)/(&#964; - 1)</code>
        */
        public static ZTauElement PartModReduction(BigInteger k, int m, sbyte a,
            BigInteger[] s, sbyte mu, sbyte c)
        {
            // d0 = s[0] + mu*s[1]; mu is either 1 or -1
            BigInteger d0;
            if (mu == 1)
            {
                d0 = s[0].Add(s[1]);
            }
            else
            {
                d0 = s[0].Subtract(s[1]);
            }

            BigInteger[] v = GetLucas(mu, m, true);
            BigInteger vm = v[1];

            SimpleBigDecimal lambda0 = ApproximateDivisionByN(
                k, s[0], vm, a, m, c);
            
            SimpleBigDecimal lambda1 = ApproximateDivisionByN(
                k, s[1], vm, a, m, c);

            ZTauElement q = Round(lambda0, lambda1, mu);

            // r0 = n - d0*q0 - 2*s1*q1
            BigInteger r0 = k.Subtract(d0.Multiply(q.u)).Subtract(
                BigInteger.ValueOf(2).Multiply(s[1]).Multiply(q.v));

            // r1 = s1*q0 - s0*q1
            BigInteger r1 = s[1].Multiply(q.u).Subtract(s[0].Multiply(q.v));
            
            return new ZTauElement(r0, r1);
        }

        /**
        * Multiplies a {@link org.bouncycastle.math.ec.AbstractF2mPoint AbstractF2mPoint}
        * by a <code>BigInteger</code> using the reduced <code>&#964;</code>-adic
        * NAF (RTNAF) method.
        * @param p The AbstractF2mPoint to Multiply.
        * @param k The <code>BigInteger</code> by which to Multiply <code>p</code>.
        * @return <code>k * p</code>
        */
        public static AbstractF2mPoint MultiplyRTnaf(AbstractF2mPoint p, BigInteger k)
        {
            AbstractF2mCurve curve = (AbstractF2mCurve)p.Curve;
            int m = curve.FieldSize;
            int a = curve.A.ToBigInteger().IntValue;
            sbyte mu = GetMu(a);
            BigInteger[] s = curve.GetSi();
            ZTauElement rho = PartModReduction(k, m, (sbyte)a, s, mu, (sbyte)10);

            return MultiplyTnaf(p, rho);
        }

        /**
        * Multiplies a {@link org.bouncycastle.math.ec.AbstractF2mPoint AbstractF2mPoint}
        * by an element <code>&#955;</code> of <code><b>Z</b>[&#964;]</code>
        * using the <code>&#964;</code>-adic NAF (TNAF) method.
        * @param p The AbstractF2mPoint to Multiply.
        * @param lambda The element <code>&#955;</code> of
        * <code><b>Z</b>[&#964;]</code>.
        * @return <code>&#955; * p</code>
        */
        public static AbstractF2mPoint MultiplyTnaf(AbstractF2mPoint p, ZTauElement lambda)
        {
            AbstractF2mCurve curve = (AbstractF2mCurve)p.Curve;
            sbyte mu = GetMu(curve.A);
            sbyte[] u = TauAdicNaf(mu, lambda);

            AbstractF2mPoint q = MultiplyFromTnaf(p, u);

            return q;
        }

        /**
        * Multiplies a {@link org.bouncycastle.math.ec.AbstractF2mPoint AbstractF2mPoint}
        * by an element <code>&#955;</code> of <code><b>Z</b>[&#964;]</code>
        * using the <code>&#964;</code>-adic NAF (TNAF) method, given the TNAF
        * of <code>&#955;</code>.
        * @param p The AbstractF2mPoint to Multiply.
        * @param u The the TNAF of <code>&#955;</code>..
        * @return <code>&#955; * p</code>
        */
        public static AbstractF2mPoint MultiplyFromTnaf(AbstractF2mPoint p, sbyte[] u)
        {
            ECCurve curve = p.Curve;
            AbstractF2mPoint q = (AbstractF2mPoint)curve.Infinity;
            AbstractF2mPoint pNeg = (AbstractF2mPoint)p.Negate();
            int tauCount = 0;
            for (int i = u.Length - 1; i >= 0; i--)
            {
                ++tauCount;
                sbyte ui = u[i];
                if (ui != 0)
                {
                    q = q.TauPow(tauCount);
                    tauCount = 0;

                    ECPoint x = ui > 0 ? p : pNeg;
                    q = (AbstractF2mPoint)q.Add(x);
                }
            }
            if (tauCount > 0)
            {
                q = q.TauPow(tauCount);
            }
            return q;
        }

        /**
        * Computes the <code>[&#964;]</code>-adic window NAF of an element
        * <code>&#955;</code> of <code><b>Z</b>[&#964;]</code>.
        * @param mu The parameter &#956; of the elliptic curve.
        * @param lambda The element <code>&#955;</code> of
        * <code><b>Z</b>[&#964;]</code> of which to compute the
        * <code>[&#964;]</code>-adic NAF.
        * @param width The window width of the resulting WNAF.
        * @param pow2w 2<sup>width</sup>.
        * @param tw The auxiliary value <code>t<sub>w</sub></code>.
        * @param alpha The <code>&#945;<sub>u</sub></code>'s for the window width.
        * @return The <code>[&#964;]</code>-adic window NAF of
        * <code>&#955;</code>.
        */
        public static sbyte[] TauAdicWNaf(sbyte mu, ZTauElement lambda,
            sbyte width, BigInteger pow2w, BigInteger tw, ZTauElement[] alpha)
        {
            if (!((mu == 1) || (mu == -1))) 
                throw new ArgumentException("mu must be 1 or -1");

            BigInteger norm = Norm(mu, lambda);

            // Ceiling of log2 of the norm 
            int log2Norm = norm.BitLength;

            // If length(TNAF) > 30, then length(TNAF) < log2Norm + 3.52
            int maxLength = log2Norm > 30 ? log2Norm + 4 + width : 34 + width;

            // The array holding the TNAF
            sbyte[] u = new sbyte[maxLength];

            // 2^(width - 1)
            BigInteger pow2wMin1 = pow2w.ShiftRight(1);

            // Split lambda into two BigIntegers to simplify calculations
            BigInteger r0 = lambda.u;
            BigInteger r1 = lambda.v;
            int i = 0;

            // while lambda <> (0, 0)
            while (!((r0.Equals(BigInteger.Zero))&&(r1.Equals(BigInteger.Zero))))
            {
                // if r0 is odd
                if (r0.TestBit(0)) 
                {
                    // uUnMod = r0 + r1*tw Mod 2^width
                    BigInteger uUnMod
                        = r0.Add(r1.Multiply(tw)).Mod(pow2w);
                    
                    sbyte uLocal;
                    // if uUnMod >= 2^(width - 1)
                    if (uUnMod.CompareTo(pow2wMin1) >= 0)
                    {
                        uLocal = (sbyte) uUnMod.Subtract(pow2w).IntValue;
                    }
                    else
                    {
                        uLocal = (sbyte) uUnMod.IntValue;
                    }
                    // uLocal is now in [-2^(width-1), 2^(width-1)-1]

                    u[i] = uLocal;
                    bool s = true;
                    if (uLocal < 0) 
                    {
                        s = false;
                        uLocal = (sbyte)-uLocal;
                    }
                    // uLocal is now >= 0

                    if (s) 
                    {
                        r0 = r0.Subtract(alpha[uLocal].u);
                        r1 = r1.Subtract(alpha[uLocal].v);
                    }
                    else
                    {
                        r0 = r0.Add(alpha[uLocal].u);
                        r1 = r1.Add(alpha[uLocal].v);
                    }
                }
                else
                {
                    u[i] = 0;
                }

                BigInteger t = r0;

                if (mu == 1)
                {
                    r0 = r1.Add(r0.ShiftRight(1));
                }
                else
                {
                    // mu == -1
                    r0 = r1.Subtract(r0.ShiftRight(1));
                }
                r1 = t.ShiftRight(1).Negate();
                i++;
            }
            return u;
        }

        /**
        * Does the precomputation for WTNAF multiplication.
        * @param p The <code>ECPoint</code> for which to do the precomputation.
        * @param a The parameter <code>a</code> of the elliptic curve.
        * @return The precomputation array for <code>p</code>. 
        */
        public static AbstractF2mPoint[] GetPreComp(AbstractF2mPoint p, sbyte a)
        {
            sbyte[][] alphaTnaf = (a == 0) ? Tnaf.Alpha0Tnaf : Tnaf.Alpha1Tnaf;

            AbstractF2mPoint[] pu = new AbstractF2mPoint[(uint)(alphaTnaf.Length + 1) >> 1];
            pu[0] = p;

            uint precompLen = (uint)alphaTnaf.Length;
            for (uint i = 3; i < precompLen; i += 2)
            {
                pu[i >> 1] = Tnaf.MultiplyFromTnaf(p, alphaTnaf[i]);
            }

            p.Curve.NormalizeAll(pu);

            return pu;
        }
    }
}
