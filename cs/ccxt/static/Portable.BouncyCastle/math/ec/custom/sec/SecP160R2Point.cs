using System;

using Org.BouncyCastle.Math.Raw;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecP160R2Point
        : AbstractFpPoint
    {
        internal SecP160R2Point(ECCurve curve, ECFieldElement x, ECFieldElement y)
            : base(curve, x, y)
        {
        }

        internal SecP160R2Point(ECCurve curve, ECFieldElement x, ECFieldElement y, ECFieldElement[] zs)
            : base(curve, x, y, zs)
        {
        }

        protected override ECPoint Detach()
        {
            return new SecP160R2Point(null, AffineXCoord, AffineYCoord);
        }

        public override ECPoint Add(ECPoint b)
        {
            if (this.IsInfinity)
                return b;
            if (b.IsInfinity)
                return this;
            if (this == b)
                return Twice();

            ECCurve curve = this.Curve;

            SecP160R2FieldElement X1 = (SecP160R2FieldElement)this.RawXCoord, Y1 = (SecP160R2FieldElement)this.RawYCoord;
            SecP160R2FieldElement X2 = (SecP160R2FieldElement)b.RawXCoord, Y2 = (SecP160R2FieldElement)b.RawYCoord;

            SecP160R2FieldElement Z1 = (SecP160R2FieldElement)this.RawZCoords[0];
            SecP160R2FieldElement Z2 = (SecP160R2FieldElement)b.RawZCoords[0];

            uint c;
            uint[] tt1 = Nat160.CreateExt();
            uint[] t2 = Nat160.Create();
            uint[] t3 = Nat160.Create();
            uint[] t4 = Nat160.Create();

            bool Z1IsOne = Z1.IsOne;
            uint[] U2, S2;
            if (Z1IsOne)
            {
                U2 = X2.x;
                S2 = Y2.x;
            }
            else
            {
                S2 = t3;
                SecP160R2Field.Square(Z1.x, S2);

                U2 = t2;
                SecP160R2Field.Multiply(S2, X2.x, U2);

                SecP160R2Field.Multiply(S2, Z1.x, S2);
                SecP160R2Field.Multiply(S2, Y2.x, S2);
            }

            bool Z2IsOne = Z2.IsOne;
            uint[] U1, S1;
            if (Z2IsOne)
            {
                U1 = X1.x;
                S1 = Y1.x;
            }
            else
            {
                S1 = t4;
                SecP160R2Field.Square(Z2.x, S1);

                U1 = tt1;
                SecP160R2Field.Multiply(S1, X1.x, U1);

                SecP160R2Field.Multiply(S1, Z2.x, S1);
                SecP160R2Field.Multiply(S1, Y1.x, S1);
            }

            uint[] H = Nat160.Create();
            SecP160R2Field.Subtract(U1, U2, H);

            uint[] R = t2;
            SecP160R2Field.Subtract(S1, S2, R);

            // Check if b == this or b == -this
            if (Nat160.IsZero(H))
            {
                if (Nat160.IsZero(R))
                {
                    // this == b, i.e. this must be doubled
                    return this.Twice();
                }

                // this == -b, i.e. the result is the point at infinity
                return curve.Infinity;
            }

            uint[] HSquared = t3;
            SecP160R2Field.Square(H, HSquared);

            uint[] G = Nat160.Create();
            SecP160R2Field.Multiply(HSquared, H, G);

            uint[] V = t3;
            SecP160R2Field.Multiply(HSquared, U1, V);

            SecP160R2Field.Negate(G, G);
            Nat160.Mul(S1, G, tt1);

            c = Nat160.AddBothTo(V, V, G);
            SecP160R2Field.Reduce32(c, G);

            SecP160R2FieldElement X3 = new SecP160R2FieldElement(t4);
            SecP160R2Field.Square(R, X3.x);
            SecP160R2Field.Subtract(X3.x, G, X3.x);

            SecP160R2FieldElement Y3 = new SecP160R2FieldElement(G);
            SecP160R2Field.Subtract(V, X3.x, Y3.x);
            SecP160R2Field.MultiplyAddToExt(Y3.x, R, tt1);
            SecP160R2Field.Reduce(tt1, Y3.x);

            SecP160R2FieldElement Z3 = new SecP160R2FieldElement(H);
            if (!Z1IsOne)
            {
                SecP160R2Field.Multiply(Z3.x, Z1.x, Z3.x);
            }
            if (!Z2IsOne)
            {
                SecP160R2Field.Multiply(Z3.x, Z2.x, Z3.x);
            }

            ECFieldElement[] zs = new ECFieldElement[]{ Z3 };

            return new SecP160R2Point(curve, X3, Y3, zs);
        }

        public override ECPoint Twice()
        {
            if (this.IsInfinity)
                return this;

            ECCurve curve = this.Curve;

            SecP160R2FieldElement Y1 = (SecP160R2FieldElement)this.RawYCoord;
            if (Y1.IsZero)
                return curve.Infinity;

            SecP160R2FieldElement X1 = (SecP160R2FieldElement)this.RawXCoord, Z1 = (SecP160R2FieldElement)this.RawZCoords[0];

            uint c;
            uint[] t1 = Nat160.Create();
            uint[] t2 = Nat160.Create();

            uint[] Y1Squared = Nat160.Create();
            SecP160R2Field.Square(Y1.x, Y1Squared);

            uint[] T = Nat160.Create();
            SecP160R2Field.Square(Y1Squared, T);

            bool Z1IsOne = Z1.IsOne;

            uint[] Z1Squared = Z1.x;
            if (!Z1IsOne)
            {
                Z1Squared = t2;
                SecP160R2Field.Square(Z1.x, Z1Squared);
            }

            SecP160R2Field.Subtract(X1.x, Z1Squared, t1);

            uint[] M = t2;
            SecP160R2Field.Add(X1.x, Z1Squared, M);
            SecP160R2Field.Multiply(M, t1, M);
            c = Nat160.AddBothTo(M, M, M);
            SecP160R2Field.Reduce32(c, M);

            uint[] S = Y1Squared;
            SecP160R2Field.Multiply(Y1Squared, X1.x, S);
            c = Nat.ShiftUpBits(5, S, 2, 0);
            SecP160R2Field.Reduce32(c, S);

            c = Nat.ShiftUpBits(5, T, 3, 0, t1);
            SecP160R2Field.Reduce32(c, t1);

            SecP160R2FieldElement X3 = new SecP160R2FieldElement(T);
            SecP160R2Field.Square(M, X3.x);
            SecP160R2Field.Subtract(X3.x, S, X3.x);
            SecP160R2Field.Subtract(X3.x, S, X3.x);

            SecP160R2FieldElement Y3 = new SecP160R2FieldElement(S);
            SecP160R2Field.Subtract(S, X3.x, Y3.x);
            SecP160R2Field.Multiply(Y3.x, M, Y3.x);
            SecP160R2Field.Subtract(Y3.x, t1, Y3.x);

            SecP160R2FieldElement Z3 = new SecP160R2FieldElement(M);
            SecP160R2Field.Twice(Y1.x, Z3.x);
            if (!Z1IsOne)
            {
                SecP160R2Field.Multiply(Z3.x, Z1.x, Z3.x);
            }

            return new SecP160R2Point(curve, X3, Y3, new ECFieldElement[]{ Z3 });
        }

        public override ECPoint TwicePlus(ECPoint b)
        {
            if (this == b)
                return ThreeTimes();
            if (this.IsInfinity)
                return b;
            if (b.IsInfinity)
                return Twice();

            ECFieldElement Y1 = this.RawYCoord;
            if (Y1.IsZero)
                return b;

            return Twice().Add(b);
        }

        public override ECPoint ThreeTimes()
        {
            if (this.IsInfinity || this.RawYCoord.IsZero)
                return this;

            // NOTE: Be careful about recursions between TwicePlus and ThreeTimes
            return Twice().Add(this);
        }

        public override ECPoint Negate()
        {
            if (IsInfinity)
                return this;

            return new SecP160R2Point(Curve, this.RawXCoord, this.RawYCoord.Negate(), this.RawZCoords);
        }
    }
}
