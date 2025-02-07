using System;

using Org.BouncyCastle.Math.Raw;

namespace Org.BouncyCastle.Math.EC.Custom.GM
{
    internal class SM2P256V1Point
        : AbstractFpPoint
    {
        internal SM2P256V1Point(ECCurve curve, ECFieldElement x, ECFieldElement y)
            : base(curve, x, y)
        {
        }

        internal SM2P256V1Point(ECCurve curve, ECFieldElement x, ECFieldElement y, ECFieldElement[] zs)
            : base(curve, x, y, zs)
        {
        }

        protected override ECPoint Detach()
        {
            return new SM2P256V1Point(null, AffineXCoord, AffineYCoord);
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

            SM2P256V1FieldElement X1 = (SM2P256V1FieldElement)this.RawXCoord, Y1 = (SM2P256V1FieldElement)this.RawYCoord;
            SM2P256V1FieldElement X2 = (SM2P256V1FieldElement)b.RawXCoord, Y2 = (SM2P256V1FieldElement)b.RawYCoord;

            SM2P256V1FieldElement Z1 = (SM2P256V1FieldElement)this.RawZCoords[0];
            SM2P256V1FieldElement Z2 = (SM2P256V1FieldElement)b.RawZCoords[0];

            uint c;
            uint[] tt1 = Nat256.CreateExt();
            uint[] t2 = Nat256.Create();
            uint[] t3 = Nat256.Create();
            uint[] t4 = Nat256.Create();

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
                SM2P256V1Field.Square(Z1.x, S2);

                U2 = t2;
                SM2P256V1Field.Multiply(S2, X2.x, U2);

                SM2P256V1Field.Multiply(S2, Z1.x, S2);
                SM2P256V1Field.Multiply(S2, Y2.x, S2);
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
                SM2P256V1Field.Square(Z2.x, S1);

                U1 = tt1;
                SM2P256V1Field.Multiply(S1, X1.x, U1);

                SM2P256V1Field.Multiply(S1, Z2.x, S1);
                SM2P256V1Field.Multiply(S1, Y1.x, S1);
            }

            uint[] H = Nat256.Create();
            SM2P256V1Field.Subtract(U1, U2, H);

            uint[] R = t2;
            SM2P256V1Field.Subtract(S1, S2, R);

            // Check if b == this or b == -this
            if (Nat256.IsZero(H))
            {
                if (Nat256.IsZero(R))
                {
                    // this == b, i.e. this must be doubled
                    return this.Twice();
                }

                // this == -b, i.e. the result is the point at infinity
                return curve.Infinity;
            }

            uint[] HSquared = t3;
            SM2P256V1Field.Square(H, HSquared);

            uint[] G = Nat256.Create();
            SM2P256V1Field.Multiply(HSquared, H, G);

            uint[] V = t3;
            SM2P256V1Field.Multiply(HSquared, U1, V);

            SM2P256V1Field.Negate(G, G);
            Nat256.Mul(S1, G, tt1);

            c = Nat256.AddBothTo(V, V, G);
            SM2P256V1Field.Reduce32(c, G);

            SM2P256V1FieldElement X3 = new SM2P256V1FieldElement(t4);
            SM2P256V1Field.Square(R, X3.x);
            SM2P256V1Field.Subtract(X3.x, G, X3.x);

            SM2P256V1FieldElement Y3 = new SM2P256V1FieldElement(G);
            SM2P256V1Field.Subtract(V, X3.x, Y3.x);
            SM2P256V1Field.MultiplyAddToExt(Y3.x, R, tt1);
            SM2P256V1Field.Reduce(tt1, Y3.x);

            SM2P256V1FieldElement Z3 = new SM2P256V1FieldElement(H);
            if (!Z1IsOne)
            {
                SM2P256V1Field.Multiply(Z3.x, Z1.x, Z3.x);
            }
            if (!Z2IsOne)
            {
                SM2P256V1Field.Multiply(Z3.x, Z2.x, Z3.x);
            }

            ECFieldElement[] zs = new ECFieldElement[]{ Z3 };

            return new SM2P256V1Point(curve, X3, Y3, zs);
        }

        public override ECPoint Twice()
        {
            if (this.IsInfinity)
                return this;

            ECCurve curve = this.Curve;

            SM2P256V1FieldElement Y1 = (SM2P256V1FieldElement)this.RawYCoord;
            if (Y1.IsZero)
                return curve.Infinity;

            SM2P256V1FieldElement X1 = (SM2P256V1FieldElement)this.RawXCoord, Z1 = (SM2P256V1FieldElement)this.RawZCoords[0];

            uint c;
            uint[] t1 = Nat256.Create();
            uint[] t2 = Nat256.Create();

            uint[] Y1Squared = Nat256.Create();
            SM2P256V1Field.Square(Y1.x, Y1Squared);

            uint[] T = Nat256.Create();
            SM2P256V1Field.Square(Y1Squared, T);

            bool Z1IsOne = Z1.IsOne;

            uint[] Z1Squared = Z1.x;
            if (!Z1IsOne)
            {
                Z1Squared = t2;
                SM2P256V1Field.Square(Z1.x, Z1Squared);
            }

            SM2P256V1Field.Subtract(X1.x, Z1Squared, t1);

            uint[] M = t2;
            SM2P256V1Field.Add(X1.x, Z1Squared, M);
            SM2P256V1Field.Multiply(M, t1, M);
            c = Nat256.AddBothTo(M, M, M);
            SM2P256V1Field.Reduce32(c, M);

            uint[] S = Y1Squared;
            SM2P256V1Field.Multiply(Y1Squared, X1.x, S);
            c = Nat.ShiftUpBits(8, S, 2, 0);
            SM2P256V1Field.Reduce32(c, S);

            c = Nat.ShiftUpBits(8, T, 3, 0, t1);
            SM2P256V1Field.Reduce32(c, t1);

            SM2P256V1FieldElement X3 = new SM2P256V1FieldElement(T);
            SM2P256V1Field.Square(M, X3.x);
            SM2P256V1Field.Subtract(X3.x, S, X3.x);
            SM2P256V1Field.Subtract(X3.x, S, X3.x);

            SM2P256V1FieldElement Y3 = new SM2P256V1FieldElement(S);
            SM2P256V1Field.Subtract(S, X3.x, Y3.x);
            SM2P256V1Field.Multiply(Y3.x, M, Y3.x);
            SM2P256V1Field.Subtract(Y3.x, t1, Y3.x);

            SM2P256V1FieldElement Z3 = new SM2P256V1FieldElement(M);
            SM2P256V1Field.Twice(Y1.x, Z3.x);
            if (!Z1IsOne)
            {
                SM2P256V1Field.Multiply(Z3.x, Z1.x, Z3.x);
            }

            return new SM2P256V1Point(curve, X3, Y3, new ECFieldElement[]{ Z3 });
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

            return new SM2P256V1Point(Curve, RawXCoord, RawYCoord.Negate(), RawZCoords);
        }
    }
}
