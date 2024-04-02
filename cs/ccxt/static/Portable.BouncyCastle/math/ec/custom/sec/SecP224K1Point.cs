using System;

using Org.BouncyCastle.Math.Raw;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecP224K1Point
        : AbstractFpPoint
    {
        internal SecP224K1Point(ECCurve curve, ECFieldElement x, ECFieldElement y)
            : base(curve, x, y)
        {
        }

        internal SecP224K1Point(ECCurve curve, ECFieldElement x, ECFieldElement y, ECFieldElement[] zs)
            : base(curve, x, y, zs)
        {
        }

        protected override ECPoint Detach()
        {
            return new SecP224K1Point(null, AffineXCoord, AffineYCoord);
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

            SecP224K1FieldElement X1 = (SecP224K1FieldElement)this.RawXCoord, Y1 = (SecP224K1FieldElement)this.RawYCoord;
            SecP224K1FieldElement X2 = (SecP224K1FieldElement)b.RawXCoord, Y2 = (SecP224K1FieldElement)b.RawYCoord;

            SecP224K1FieldElement Z1 = (SecP224K1FieldElement)this.RawZCoords[0];
            SecP224K1FieldElement Z2 = (SecP224K1FieldElement)b.RawZCoords[0];

            uint c;
            uint[] tt1 = Nat224.CreateExt();
            uint[] t2 = Nat224.Create();
            uint[] t3 = Nat224.Create();
            uint[] t4 = Nat224.Create();

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
                SecP224K1Field.Square(Z1.x, S2);

                U2 = t2;
                SecP224K1Field.Multiply(S2, X2.x, U2);

                SecP224K1Field.Multiply(S2, Z1.x, S2);
                SecP224K1Field.Multiply(S2, Y2.x, S2);
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
                SecP224K1Field.Square(Z2.x, S1);

                U1 = tt1;
                SecP224K1Field.Multiply(S1, X1.x, U1);

                SecP224K1Field.Multiply(S1, Z2.x, S1);
                SecP224K1Field.Multiply(S1, Y1.x, S1);
            }

            uint[] H = Nat224.Create();
            SecP224K1Field.Subtract(U1, U2, H);

            uint[] R = t2;
            SecP224K1Field.Subtract(S1, S2, R);

            // Check if b == this or b == -this
            if (Nat224.IsZero(H))
            {
                if (Nat224.IsZero(R))
                {
                    // this == b, i.e. this must be doubled
                    return this.Twice();
                }

                // this == -b, i.e. the result is the point at infinity
                return curve.Infinity;
            }

            uint[] HSquared = t3;
            SecP224K1Field.Square(H, HSquared);

            uint[] G = Nat224.Create();
            SecP224K1Field.Multiply(HSquared, H, G);

            uint[] V = t3;
            SecP224K1Field.Multiply(HSquared, U1, V);

            SecP224K1Field.Negate(G, G);
            Nat224.Mul(S1, G, tt1);

            c = Nat224.AddBothTo(V, V, G);
            SecP224K1Field.Reduce32(c, G);

            SecP224K1FieldElement X3 = new SecP224K1FieldElement(t4);
            SecP224K1Field.Square(R, X3.x);
            SecP224K1Field.Subtract(X3.x, G, X3.x);

            SecP224K1FieldElement Y3 = new SecP224K1FieldElement(G);
            SecP224K1Field.Subtract(V, X3.x, Y3.x);
            SecP224K1Field.MultiplyAddToExt(Y3.x, R, tt1);
            SecP224K1Field.Reduce(tt1, Y3.x);

            SecP224K1FieldElement Z3 = new SecP224K1FieldElement(H);
            if (!Z1IsOne)
            {
                SecP224K1Field.Multiply(Z3.x, Z1.x, Z3.x);
            }
            if (!Z2IsOne)
            {
                SecP224K1Field.Multiply(Z3.x, Z2.x, Z3.x);
            }

            ECFieldElement[] zs = new ECFieldElement[] { Z3 };

            return new SecP224K1Point(curve, X3, Y3, zs);
        }

        public override ECPoint Twice()
        {
            if (this.IsInfinity)
                return this;

            ECCurve curve = this.Curve;

            SecP224K1FieldElement Y1 = (SecP224K1FieldElement)this.RawYCoord;
            if (Y1.IsZero)
                return curve.Infinity;

            SecP224K1FieldElement X1 = (SecP224K1FieldElement)this.RawXCoord, Z1 = (SecP224K1FieldElement)this.RawZCoords[0];

            uint c;

            uint[] Y1Squared = Nat224.Create();
            SecP224K1Field.Square(Y1.x, Y1Squared);

            uint[] T = Nat224.Create();
            SecP224K1Field.Square(Y1Squared, T);

            uint[] M = Nat224.Create();
            SecP224K1Field.Square(X1.x, M);
            c = Nat224.AddBothTo(M, M, M);
            SecP224K1Field.Reduce32(c, M);

            uint[] S = Y1Squared;
            SecP224K1Field.Multiply(Y1Squared, X1.x, S);
            c = Nat.ShiftUpBits(7, S, 2, 0);
            SecP224K1Field.Reduce32(c, S);

            uint[] t1 = Nat224.Create();
            c = Nat.ShiftUpBits(7, T, 3, 0, t1);
            SecP224K1Field.Reduce32(c, t1);

            SecP224K1FieldElement X3 = new SecP224K1FieldElement(T);
            SecP224K1Field.Square(M, X3.x);
            SecP224K1Field.Subtract(X3.x, S, X3.x);
            SecP224K1Field.Subtract(X3.x, S, X3.x);

            SecP224K1FieldElement Y3 = new SecP224K1FieldElement(S);
            SecP224K1Field.Subtract(S, X3.x, Y3.x);
            SecP224K1Field.Multiply(Y3.x, M, Y3.x);
            SecP224K1Field.Subtract(Y3.x, t1, Y3.x);

            SecP224K1FieldElement Z3 = new SecP224K1FieldElement(M);
            SecP224K1Field.Twice(Y1.x, Z3.x);
            if (!Z1.IsOne)
            {
                SecP224K1Field.Multiply(Z3.x, Z1.x, Z3.x);
            }

            return new SecP224K1Point(curve, X3, Y3, new ECFieldElement[] { Z3 });
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

            return new SecP224K1Point(Curve, RawXCoord, RawYCoord.Negate(), RawZCoords);
        }
    }
}
