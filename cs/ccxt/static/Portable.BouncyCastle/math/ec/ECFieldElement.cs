using System;
using System.Diagnostics;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Math.EC
{
    public abstract class ECFieldElement
    {
        public abstract BigInteger ToBigInteger();
        public abstract string FieldName { get; }
        public abstract int FieldSize { get; }
        public abstract ECFieldElement Add(ECFieldElement b);
        public abstract ECFieldElement AddOne();
        public abstract ECFieldElement Subtract(ECFieldElement b);
        public abstract ECFieldElement Multiply(ECFieldElement b);
        public abstract ECFieldElement Divide(ECFieldElement b);
        public abstract ECFieldElement Negate();
        public abstract ECFieldElement Square();
        public abstract ECFieldElement Invert();
        public abstract ECFieldElement Sqrt();

        public virtual int BitLength
        {
            get { return ToBigInteger().BitLength; }
        }

        public virtual bool IsOne
        {
            get { return BitLength == 1; }
        }

        public virtual bool IsZero
        {
            get { return 0 == ToBigInteger().SignValue; }
        }

        public virtual ECFieldElement MultiplyMinusProduct(ECFieldElement b, ECFieldElement x, ECFieldElement y)
        {
            return Multiply(b).Subtract(x.Multiply(y));
        }

        public virtual ECFieldElement MultiplyPlusProduct(ECFieldElement b, ECFieldElement x, ECFieldElement y)
        {
            return Multiply(b).Add(x.Multiply(y));
        }

        public virtual ECFieldElement SquareMinusProduct(ECFieldElement x, ECFieldElement y)
        {
            return Square().Subtract(x.Multiply(y));
        }

        public virtual ECFieldElement SquarePlusProduct(ECFieldElement x, ECFieldElement y)
        {
            return Square().Add(x.Multiply(y));
        }

        public virtual ECFieldElement SquarePow(int pow)
        {
            ECFieldElement r = this;
            for (int i = 0; i < pow; ++i)
            {
                r = r.Square();
            }
            return r;
        }

        public virtual bool TestBitZero()
        {
            return ToBigInteger().TestBit(0);
        }

        public override bool Equals(object obj)
        {
            return Equals(obj as ECFieldElement);
        }

        public virtual bool Equals(ECFieldElement other)
        {
            if (this == other)
                return true;
            if (null == other)
                return false;
            return ToBigInteger().Equals(other.ToBigInteger());
        }

        public override int GetHashCode()
        {
            return ToBigInteger().GetHashCode();
        }

        public override string ToString()
        {
            return this.ToBigInteger().ToString(16);
        }

        public virtual byte[] GetEncoded()
        {
            return BigIntegers.AsUnsignedByteArray((FieldSize + 7) / 8, ToBigInteger());
        }
    }

    public abstract class AbstractFpFieldElement
        : ECFieldElement
    {
    }

    public class FpFieldElement
        : AbstractFpFieldElement
    {
        private readonly BigInteger q, r, x;

        internal static BigInteger CalculateResidue(BigInteger p)
        {
            int bitLength = p.BitLength;
            if (bitLength >= 96)
            {
                BigInteger firstWord = p.ShiftRight(bitLength - 64);
                if (firstWord.LongValue == -1L)
                {
                    return BigInteger.One.ShiftLeft(bitLength).Subtract(p);
                }
                if ((bitLength & 7) == 0)
                {
                    return BigInteger.One.ShiftLeft(bitLength << 1).Divide(p).Negate();
                }
            }
            return null;
        }

        internal FpFieldElement(BigInteger q, BigInteger r, BigInteger x)
        {
            this.q = q;
            this.r = r;
            this.x = x;
        }

        public override BigInteger ToBigInteger()
        {
            return x;
        }

        /**
         * return the field name for this field.
         *
         * @return the string "Fp".
         */
        public override string FieldName
        {
            get { return "Fp"; }
        }

        public override int FieldSize
        {
            get { return q.BitLength; }
        }

        public BigInteger Q
        {
            get { return q; }
        }

        public override ECFieldElement Add(
            ECFieldElement b)
        {
            return new FpFieldElement(q, r, ModAdd(x, b.ToBigInteger()));
        }

        public override ECFieldElement AddOne()
        {
            BigInteger x2 = x.Add(BigInteger.One);
            if (x2.CompareTo(q) == 0)
            {
                x2 = BigInteger.Zero;
            }
            return new FpFieldElement(q, r, x2);
        }

        public override ECFieldElement Subtract(
            ECFieldElement b)
        {
            return new FpFieldElement(q, r, ModSubtract(x, b.ToBigInteger()));
        }

        public override ECFieldElement Multiply(
            ECFieldElement b)
        {
            return new FpFieldElement(q, r, ModMult(x, b.ToBigInteger()));
        }

        public override ECFieldElement MultiplyMinusProduct(ECFieldElement b, ECFieldElement x, ECFieldElement y)
        {
            BigInteger ax = this.x, bx = b.ToBigInteger(), xx = x.ToBigInteger(), yx = y.ToBigInteger();
            BigInteger ab = ax.Multiply(bx);
            BigInteger xy = xx.Multiply(yx);
            return new FpFieldElement(q, r, ModReduce(ab.Subtract(xy)));
        }

        public override ECFieldElement MultiplyPlusProduct(ECFieldElement b, ECFieldElement x, ECFieldElement y)
        {
            BigInteger ax = this.x, bx = b.ToBigInteger(), xx = x.ToBigInteger(), yx = y.ToBigInteger();
            BigInteger ab = ax.Multiply(bx);
            BigInteger xy = xx.Multiply(yx);
            BigInteger sum = ab.Add(xy);
            if (r != null && r.SignValue < 0 && sum.BitLength > (q.BitLength << 1))
            {
                sum = sum.Subtract(q.ShiftLeft(q.BitLength));
            }
            return new FpFieldElement(q, r, ModReduce(sum));
        }

        public override ECFieldElement Divide(
            ECFieldElement b)
        {
            return new FpFieldElement(q, r, ModMult(x, ModInverse(b.ToBigInteger())));
        }

        public override ECFieldElement Negate()
        {
            return x.SignValue == 0 ? this : new FpFieldElement(q, r, q.Subtract(x));
        }

        public override ECFieldElement Square()
        {
            return new FpFieldElement(q, r, ModMult(x, x));
        }

        public override ECFieldElement SquareMinusProduct(ECFieldElement x, ECFieldElement y)
        {
            BigInteger ax = this.x, xx = x.ToBigInteger(), yx = y.ToBigInteger();
            BigInteger aa = ax.Multiply(ax);
            BigInteger xy = xx.Multiply(yx);
            return new FpFieldElement(q, r, ModReduce(aa.Subtract(xy)));
        }

        public override ECFieldElement SquarePlusProduct(ECFieldElement x, ECFieldElement y)
        {
            BigInteger ax = this.x, xx = x.ToBigInteger(), yx = y.ToBigInteger();
            BigInteger aa = ax.Multiply(ax);
            BigInteger xy = xx.Multiply(yx);
            BigInteger sum = aa.Add(xy);
            if (r != null && r.SignValue < 0 && sum.BitLength > (q.BitLength << 1))
            {
                sum = sum.Subtract(q.ShiftLeft(q.BitLength));
            }
            return new FpFieldElement(q, r, ModReduce(sum));
        }

        public override ECFieldElement Invert()
        {
            // TODO Modular inversion can be faster for a (Generalized) Mersenne Prime.
            return new FpFieldElement(q, r, ModInverse(x));
        }

        /**
         * return a sqrt root - the routine verifies that the calculation
         * returns the right value - if none exists it returns null.
         */
        public override ECFieldElement Sqrt()
        {
            if (IsZero || IsOne)
                return this;

            if (!q.TestBit(0))
                throw new NotImplementedException("even value of q");

            if (q.TestBit(1)) // q == 4m + 3
            {
                BigInteger e = q.ShiftRight(2).Add(BigInteger.One);
                return CheckSqrt(new FpFieldElement(q, r, x.ModPow(e, q)));
            }

            if (q.TestBit(2)) // q == 8m + 5
            {
                BigInteger t1 = x.ModPow(q.ShiftRight(3), q);
                BigInteger t2 = ModMult(t1, x);
                BigInteger t3 = ModMult(t2, t1);

                if (t3.Equals(BigInteger.One))
                {
                    return CheckSqrt(new FpFieldElement(q, r, t2));
                }

                // TODO This is constant and could be precomputed
                BigInteger t4 = BigInteger.Two.ModPow(q.ShiftRight(2), q);

                BigInteger y = ModMult(t2, t4);

                return CheckSqrt(new FpFieldElement(q, r, y));
            }

            // q == 8m + 1

            BigInteger legendreExponent = q.ShiftRight(1);
            if (!(x.ModPow(legendreExponent, q).Equals(BigInteger.One)))
                return null;

            BigInteger X = this.x;
            BigInteger fourX = ModDouble(ModDouble(X)); ;

            BigInteger k = legendreExponent.Add(BigInteger.One), qMinusOne = q.Subtract(BigInteger.One);

            BigInteger U, V;
            do
            {
                BigInteger P;
                do
                {
                    P = BigInteger.Arbitrary(q.BitLength);
                }
                while (P.CompareTo(q) >= 0
                    || !ModReduce(P.Multiply(P).Subtract(fourX)).ModPow(legendreExponent, q).Equals(qMinusOne));

                BigInteger[] result = LucasSequence(P, X, k);
                U = result[0];
                V = result[1];

                if (ModMult(V, V).Equals(fourX))
                {
                    return new FpFieldElement(q, r, ModHalfAbs(V));
                }
            }
            while (U.Equals(BigInteger.One) || U.Equals(qMinusOne));

            return null;
        }

        private ECFieldElement CheckSqrt(ECFieldElement z)
        {
            return z.Square().Equals(this) ? z : null;
        }

        private BigInteger[] LucasSequence(
            BigInteger	P,
            BigInteger	Q,
            BigInteger	k)
        {
            // TODO Research and apply "common-multiplicand multiplication here"

            int n = k.BitLength;
            int s = k.GetLowestSetBit();

            Debug.Assert(k.TestBit(s));

            BigInteger Uh = BigInteger.One;
            BigInteger Vl = BigInteger.Two;
            BigInteger Vh = P;
            BigInteger Ql = BigInteger.One;
            BigInteger Qh = BigInteger.One;

            for (int j = n - 1; j >= s + 1; --j)
            {
                Ql = ModMult(Ql, Qh);

                if (k.TestBit(j))
                {
                    Qh = ModMult(Ql, Q);
                    Uh = ModMult(Uh, Vh);
                    Vl = ModReduce(Vh.Multiply(Vl).Subtract(P.Multiply(Ql)));
                    Vh = ModReduce(Vh.Multiply(Vh).Subtract(Qh.ShiftLeft(1)));
                }
                else
                {
                    Qh = Ql;
                    Uh = ModReduce(Uh.Multiply(Vl).Subtract(Ql));
                    Vh = ModReduce(Vh.Multiply(Vl).Subtract(P.Multiply(Ql)));
                    Vl = ModReduce(Vl.Multiply(Vl).Subtract(Ql.ShiftLeft(1)));
                }
            }

            Ql = ModMult(Ql, Qh);
            Qh = ModMult(Ql, Q);
            Uh = ModReduce(Uh.Multiply(Vl).Subtract(Ql));
            Vl = ModReduce(Vh.Multiply(Vl).Subtract(P.Multiply(Ql)));
            Ql = ModMult(Ql, Qh);

            for (int j = 1; j <= s; ++j)
            {
                Uh = ModMult(Uh, Vl);
                Vl = ModReduce(Vl.Multiply(Vl).Subtract(Ql.ShiftLeft(1)));
                Ql = ModMult(Ql, Ql);
            }

            return new BigInteger[] { Uh, Vl };
        }

        protected virtual BigInteger ModAdd(BigInteger x1, BigInteger x2)
        {
            BigInteger x3 = x1.Add(x2);
            if (x3.CompareTo(q) >= 0)
            {
                x3 = x3.Subtract(q);
            }
            return x3;
        }

        protected virtual BigInteger ModDouble(BigInteger x)
        {
            BigInteger _2x = x.ShiftLeft(1);
            if (_2x.CompareTo(q) >= 0)
            {
                _2x = _2x.Subtract(q);
            }
            return _2x;
        }

        protected virtual BigInteger ModHalf(BigInteger x)
        {
            if (x.TestBit(0))
            {
                x = q.Add(x);
            }
            return x.ShiftRight(1);
        }

        protected virtual BigInteger ModHalfAbs(BigInteger x)
        {
            if (x.TestBit(0))
            {
                x = q.Subtract(x);
            }
            return x.ShiftRight(1);
        }

        protected virtual BigInteger ModInverse(BigInteger x)
        {
            return BigIntegers.ModOddInverse(q, x);
        }

        protected virtual BigInteger ModMult(BigInteger x1, BigInteger x2)
        {
            return ModReduce(x1.Multiply(x2));
        }

        protected virtual BigInteger ModReduce(BigInteger x)
        {
            if (r == null)
            {
                x = x.Mod(q);
            }
            else
            {
                bool negative = x.SignValue < 0;
                if (negative)
                {
                    x = x.Abs();
                }
                int qLen = q.BitLength;
                if (r.SignValue > 0)
                {
                    BigInteger qMod = BigInteger.One.ShiftLeft(qLen);
                    bool rIsOne = r.Equals(BigInteger.One);
                    while (x.BitLength > (qLen + 1))
                    {
                        BigInteger u = x.ShiftRight(qLen);
                        BigInteger v = x.Remainder(qMod);
                        if (!rIsOne)
                        {
                            u = u.Multiply(r);
                        }
                        x = u.Add(v);
                    }
                }
                else
                {
                    int d = ((qLen - 1) & 31) + 1;
                    BigInteger mu = r.Negate();
                    BigInteger u = mu.Multiply(x.ShiftRight(qLen - d));
                    BigInteger quot = u.ShiftRight(qLen + d);
                    BigInteger v = quot.Multiply(q);
                    BigInteger bk1 = BigInteger.One.ShiftLeft(qLen + d);
                    v = v.Remainder(bk1);
                    x = x.Remainder(bk1);
                    x = x.Subtract(v);
                    if (x.SignValue < 0)
                    {
                        x = x.Add(bk1);
                    }
                }
                while (x.CompareTo(q) >= 0)
                {
                    x = x.Subtract(q);
                }
                if (negative && x.SignValue != 0)
                {
                    x = q.Subtract(x);
                }
            }
            return x;
        }

        protected virtual BigInteger ModSubtract(BigInteger x1, BigInteger x2)
        {
            BigInteger x3 = x1.Subtract(x2);
            if (x3.SignValue < 0)
            {
                x3 = x3.Add(q);
            }
            return x3;
        }

        public override bool Equals(
            object obj)
        {
            if (obj == this)
                return true;

            FpFieldElement other = obj as FpFieldElement;

            if (other == null)
                return false;

            return Equals(other);
        }

        public virtual bool Equals(
            FpFieldElement other)
        {
            return q.Equals(other.q) && base.Equals(other);
        }

        public override int GetHashCode()
        {
            return q.GetHashCode() ^ base.GetHashCode();
        }
    }

    public abstract class AbstractF2mFieldElement
        :   ECFieldElement
    {
        public virtual ECFieldElement HalfTrace()
        {
            int m = FieldSize;
            if ((m & 1) == 0)
                throw new InvalidOperationException("Half-trace only defined for odd m");

            //ECFieldElement ht = this;
            //for (int i = 1; i < m; i += 2)
            //{
            //    ht = ht.SquarePow(2).Add(this);
            //}

            int n = (m + 1) >> 1;
            int k = 31 - Integers.NumberOfLeadingZeros(n);
            int nk = 1;

            ECFieldElement ht = this;
            while (k > 0)
            {
                ht = ht.SquarePow(nk << 1).Add(ht);
                nk = n >> --k;
                if (0 != (nk & 1))
                {
                    ht = ht.SquarePow(2).Add(this);
                }
            }

            return ht;
        }

        public virtual bool HasFastTrace
        {
            get { return false; }
        }

        public virtual int Trace()
        {
            int m = FieldSize;

            //ECFieldElement tr = this;
            //for (int i = 1; i < m; ++i)
            //{
            //    tr = tr.Square().Add(this);
            //}

            int k = 31 - Integers.NumberOfLeadingZeros(m);
            int mk = 1;

            ECFieldElement tr = this;
            while (k > 0)
            {
                tr = tr.SquarePow(mk).Add(tr);
                mk = m >> --k;
                if (0 != (mk & 1))
                {
                    tr = tr.Square().Add(this);
                }
            }

            if (tr.IsZero)
                return 0;
            if (tr.IsOne)
                return 1;
            throw new InvalidOperationException("Internal error in trace calculation");
        }
    }

    /**
     * Class representing the Elements of the finite field
     * <code>F<sub>2<sup>m</sup></sub></code> in polynomial basis (PB)
     * representation. Both trinomial (Tpb) and pentanomial (Ppb) polynomial
     * basis representations are supported. Gaussian normal basis (GNB)
     * representation is not supported.
     */
    public class F2mFieldElement
        :   AbstractF2mFieldElement
    {
        /**
         * Indicates gaussian normal basis representation (GNB). Number chosen
         * according to X9.62. GNB is not implemented at present.
         */
        public const int Gnb = 1;

        /**
         * Indicates trinomial basis representation (Tpb). Number chosen
         * according to X9.62.
         */
        public const int Tpb = 2;

        /**
         * Indicates pentanomial basis representation (Ppb). Number chosen
         * according to X9.62.
         */
        public const int Ppb = 3;

        /**
         * Tpb or Ppb.
         */
        private int representation;

        /**
         * The exponent <code>m</code> of <code>F<sub>2<sup>m</sup></sub></code>.
         */
        private int m;

        private int[] ks;

        /**
         * The <code>LongArray</code> holding the bits.
         */
        internal LongArray x;

        internal F2mFieldElement(int m, int[] ks, LongArray x)
        {
            this.m = m;
            this.representation = (ks.Length == 1) ? Tpb : Ppb;
            this.ks = ks;
            this.x = x;
        }

        public override int BitLength
        {
            get { return x.Degree(); }
        }

        public override bool IsOne
        {
            get { return x.IsOne(); }
        }

        public override bool IsZero
        {
            get { return x.IsZero(); }
        }

        public override bool TestBitZero()
        {
            return x.TestBitZero();
        }

        public override BigInteger ToBigInteger()
        {
            return x.ToBigInteger();
        }

        public override string FieldName
        {
            get { return "F2m"; }
        }

        public override int FieldSize
        {
            get { return m; }
        }

        /**
        * Checks, if the ECFieldElements <code>a</code> and <code>b</code>
        * are elements of the same field <code>F<sub>2<sup>m</sup></sub></code>
        * (having the same representation).
        * @param a field element.
        * @param b field element to be compared.
        * @throws ArgumentException if <code>a</code> and <code>b</code>
        * are not elements of the same field
        * <code>F<sub>2<sup>m</sup></sub></code> (having the same
        * representation).
        */
        public static void CheckFieldElements(
            ECFieldElement	a,
            ECFieldElement	b)
        {
            if (!(a is F2mFieldElement) || !(b is F2mFieldElement))
            {
                throw new ArgumentException("Field elements are not "
                    + "both instances of F2mFieldElement");
            }

            F2mFieldElement aF2m = (F2mFieldElement)a;
            F2mFieldElement bF2m = (F2mFieldElement)b;

            if (aF2m.representation != bF2m.representation)
            {
                // Should never occur
                throw new ArgumentException("One of the F2m field elements has incorrect representation");
            }

            if ((aF2m.m != bF2m.m) || !Arrays.AreEqual(aF2m.ks, bF2m.ks))
            {
                throw new ArgumentException("Field elements are not elements of the same field F2m");
            }
        }

        public override ECFieldElement Add(
            ECFieldElement b)
        {
            // No check performed here for performance reasons. Instead the
            // elements involved are checked in ECPoint.F2m
            // checkFieldElements(this, b);
            LongArray iarrClone = this.x.Copy();
            F2mFieldElement bF2m = (F2mFieldElement)b;
            iarrClone.AddShiftedByWords(bF2m.x, 0);
            return new F2mFieldElement(m, ks, iarrClone);
        }

        public override ECFieldElement AddOne()
        {
            return new F2mFieldElement(m, ks, x.AddOne());
        }

        public override ECFieldElement Subtract(
            ECFieldElement b)
        {
            // Addition and subtraction are the same in F2m
            return Add(b);
        }

        public override ECFieldElement Multiply(
            ECFieldElement b)
        {
            // Right-to-left comb multiplication in the LongArray
            // Input: Binary polynomials a(z) and b(z) of degree at most m-1
            // Output: c(z) = a(z) * b(z) mod f(z)

            // No check performed here for performance reasons. Instead the
            // elements involved are checked in ECPoint.F2m
            // checkFieldElements(this, b);
            return new F2mFieldElement(m, ks, x.ModMultiply(((F2mFieldElement)b).x, m, ks));
        }

        public override ECFieldElement MultiplyMinusProduct(ECFieldElement b, ECFieldElement x, ECFieldElement y)
        {
            return MultiplyPlusProduct(b, x, y);
        }

        public override ECFieldElement MultiplyPlusProduct(ECFieldElement b, ECFieldElement x, ECFieldElement y)
        {
            LongArray ax = this.x, bx = ((F2mFieldElement)b).x, xx = ((F2mFieldElement)x).x, yx = ((F2mFieldElement)y).x;

            LongArray ab = ax.Multiply(bx, m, ks);
            LongArray xy = xx.Multiply(yx, m, ks);

            if (ab == ax || ab == bx)
            {
                ab = (LongArray)ab.Copy();
            }

            ab.AddShiftedByWords(xy, 0);
            ab.Reduce(m, ks);

            return new F2mFieldElement(m, ks, ab);
        }

        public override ECFieldElement Divide(
            ECFieldElement b)
        {
            // There may be more efficient implementations
            ECFieldElement bInv = b.Invert();
            return Multiply(bInv);
        }

        public override ECFieldElement Negate()
        {
            // -x == x holds for all x in F2m
            return this;
        }

        public override ECFieldElement Square()
        {
            return new F2mFieldElement(m, ks, x.ModSquare(m, ks));
        }

        public override ECFieldElement SquareMinusProduct(ECFieldElement x, ECFieldElement y)
        {
            return SquarePlusProduct(x, y);
        }

        public override ECFieldElement SquarePlusProduct(ECFieldElement x, ECFieldElement y)
        {
            LongArray ax = this.x, xx = ((F2mFieldElement)x).x, yx = ((F2mFieldElement)y).x;

            LongArray aa = ax.Square(m, ks);
            LongArray xy = xx.Multiply(yx, m, ks);

            if (aa == ax)
            {
                aa = (LongArray)aa.Copy();
            }

            aa.AddShiftedByWords(xy, 0);
            aa.Reduce(m, ks);

            return new F2mFieldElement(m, ks, aa);
        }

        public override ECFieldElement SquarePow(int pow)
        {
            return pow < 1 ? this : new F2mFieldElement(m, ks, x.ModSquareN(pow, m, ks));
        }

        public override ECFieldElement Invert()
        {
            return new F2mFieldElement(this.m, this.ks, this.x.ModInverse(m, ks));
        }

        public override ECFieldElement Sqrt()
        {
            return (x.IsZero() || x.IsOne()) ? this : SquarePow(m - 1);
        }

        /**
            * @return the representation of the field
            * <code>F<sub>2<sup>m</sup></sub></code>, either of
            * {@link F2mFieldElement.Tpb} (trinomial
            * basis representation) or
            * {@link F2mFieldElement.Ppb} (pentanomial
            * basis representation).
            */
        public int Representation
        {
            get { return this.representation; }
        }

        /**
            * @return the degree <code>m</code> of the reduction polynomial
            * <code>f(z)</code>.
            */
        public int M
        {
            get { return this.m; }
        }

        /**
            * @return Tpb: The integer <code>k</code> where <code>x<sup>m</sup> +
            * x<sup>k</sup> + 1</code> represents the reduction polynomial
            * <code>f(z)</code>.<br/>
            * Ppb: The integer <code>k1</code> where <code>x<sup>m</sup> +
            * x<sup>k3</sup> + x<sup>k2</sup> + x<sup>k1</sup> + 1</code>
            * represents the reduction polynomial <code>f(z)</code>.<br/>
            */
        public int K1
        {
            get { return this.ks[0]; }
        }

        /**
            * @return Tpb: Always returns <code>0</code><br/>
            * Ppb: The integer <code>k2</code> where <code>x<sup>m</sup> +
            * x<sup>k3</sup> + x<sup>k2</sup> + x<sup>k1</sup> + 1</code>
            * represents the reduction polynomial <code>f(z)</code>.<br/>
            */
        public int K2
        {
            get { return this.ks.Length >= 2 ? this.ks[1] : 0; }
        }

        /**
            * @return Tpb: Always set to <code>0</code><br/>
            * Ppb: The integer <code>k3</code> where <code>x<sup>m</sup> +
            * x<sup>k3</sup> + x<sup>k2</sup> + x<sup>k1</sup> + 1</code>
            * represents the reduction polynomial <code>f(z)</code>.<br/>
            */
        public int K3
        {
            get { return this.ks.Length >= 3 ? this.ks[2] : 0; }
        }

        public override bool Equals(
            object obj)
        {
            if (obj == this)
                return true;

            F2mFieldElement other = obj as F2mFieldElement;

            if (other == null)
                return false;

            return Equals(other);
        }

        public virtual bool Equals(
            F2mFieldElement other)
        {
            return ((this.m == other.m)
                && (this.representation == other.representation)
                && Arrays.AreEqual(this.ks, other.ks)
                && (this.x.Equals(other.x)));
        }

        public override int GetHashCode()
        {
            return x.GetHashCode() ^ m ^ Arrays.GetHashCode(ks);
        }
    }
}
