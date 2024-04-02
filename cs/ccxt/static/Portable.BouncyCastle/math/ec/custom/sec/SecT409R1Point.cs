using System;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecT409R1Point
        : AbstractF2mPoint
    {
        internal SecT409R1Point(ECCurve curve, ECFieldElement x, ECFieldElement y)
            : base(curve, x, y)
        {
        }

        internal SecT409R1Point(ECCurve curve, ECFieldElement x, ECFieldElement y, ECFieldElement[] zs)
            : base(curve, x, y, zs)
        {
        }

        protected override ECPoint Detach()
        {
            return new SecT409R1Point(null, AffineXCoord, AffineYCoord);
        }

        public override ECFieldElement YCoord
        {
            get
            {
                ECFieldElement X = RawXCoord, L = RawYCoord;

                if (this.IsInfinity || X.IsZero)
                    return L;

                // Y is actually Lambda (X + Y/X) here; convert to affine value on the fly
                ECFieldElement Y = L.Add(X).Multiply(X);

                ECFieldElement Z = RawZCoords[0];
                if (!Z.IsOne)
                {
                    Y = Y.Divide(Z);
                }

                return Y;
            }
        }

        protected internal override bool CompressionYTilde
        {
            get
            {
                ECFieldElement X = this.RawXCoord;
                if (X.IsZero)
                    return false;

                ECFieldElement Y = this.RawYCoord;

                // Y is actually Lambda (X + Y/X) here
                return Y.TestBitZero() != X.TestBitZero();
            }
        }

        public override ECPoint Add(ECPoint b)
        {
            if (this.IsInfinity)
                return b;
            if (b.IsInfinity)
                return this;

            ECCurve curve = this.Curve;

            ECFieldElement X1 = this.RawXCoord;
            ECFieldElement X2 = b.RawXCoord;

            if (X1.IsZero)
            {
                if (X2.IsZero)
                    return curve.Infinity;

                return b.Add(this);
            }

            ECFieldElement L1 = this.RawYCoord, Z1 = this.RawZCoords[0];
            ECFieldElement L2 = b.RawYCoord, Z2 = b.RawZCoords[0];

            bool Z1IsOne = Z1.IsOne;
            ECFieldElement U2 = X2, S2 = L2;
            if (!Z1IsOne)
            {
                U2 = U2.Multiply(Z1);
                S2 = S2.Multiply(Z1);
            }

            bool Z2IsOne = Z2.IsOne;
            ECFieldElement U1 = X1, S1 = L1;
            if (!Z2IsOne)
            {
                U1 = U1.Multiply(Z2);
                S1 = S1.Multiply(Z2);
            }

            ECFieldElement A = S1.Add(S2);
            ECFieldElement B = U1.Add(U2);

            if (B.IsZero)
            {
                if (A.IsZero)
                    return Twice();

                return curve.Infinity;
            }

            ECFieldElement X3, L3, Z3;
            if (X2.IsZero)
            {
                // TODO This can probably be optimized quite a bit
                ECPoint p = this.Normalize();
                X1 = p.XCoord;
                ECFieldElement Y1 = p.YCoord;

                ECFieldElement Y2 = L2;
                ECFieldElement L = Y1.Add(Y2).Divide(X1);

                X3 = L.Square().Add(L).Add(X1).AddOne();
                if (X3.IsZero)
                {
                    return new SecT409R1Point(curve, X3, curve.B.Sqrt());
                }

                ECFieldElement Y3 = L.Multiply(X1.Add(X3)).Add(X3).Add(Y1);
                L3 = Y3.Divide(X3).Add(X3);
                Z3 = curve.FromBigInteger(BigInteger.One);
            }
            else
            {
                B = B.Square();

                ECFieldElement AU1 = A.Multiply(U1);
                ECFieldElement AU2 = A.Multiply(U2);

                X3 = AU1.Multiply(AU2);
                if (X3.IsZero)
                {
                    return new SecT409R1Point(curve, X3, curve.B.Sqrt());
                }

                ECFieldElement ABZ2 = A.Multiply(B);
                if (!Z2IsOne)
                {
                    ABZ2 = ABZ2.Multiply(Z2);
                }

                L3 = AU2.Add(B).SquarePlusProduct(ABZ2, L1.Add(Z1));

                Z3 = ABZ2;
                if (!Z1IsOne)
                {
                    Z3 = Z3.Multiply(Z1);
                }
            }

            return new SecT409R1Point(curve, X3, L3, new ECFieldElement[] { Z3 });
        }

        public override ECPoint Twice()
        {
            if (this.IsInfinity)
                return this;

            ECCurve curve = this.Curve;

            ECFieldElement X1 = this.RawXCoord;
            if (X1.IsZero)
            {
                // A point with X == 0 is its own additive inverse
                return curve.Infinity;
            }

            ECFieldElement L1 = this.RawYCoord, Z1 = this.RawZCoords[0];

            bool Z1IsOne = Z1.IsOne;
            ECFieldElement L1Z1 = Z1IsOne ? L1 : L1.Multiply(Z1);
            ECFieldElement Z1Sq = Z1IsOne ? Z1 : Z1.Square();
            ECFieldElement T = L1.Square().Add(L1Z1).Add(Z1Sq);
            if (T.IsZero)
            {
                return new SecT409R1Point(curve, T, curve.B.Sqrt());
            }

            ECFieldElement X3 = T.Square();
            ECFieldElement Z3 = Z1IsOne ? T : T.Multiply(Z1Sq);

            ECFieldElement X1Z1 = Z1IsOne ? X1 : X1.Multiply(Z1);
            ECFieldElement L3 = X1Z1.SquarePlusProduct(T, L1Z1).Add(X3).Add(Z3);

            return new SecT409R1Point(curve, X3, L3, new ECFieldElement[] { Z3 });
        }

        public override ECPoint TwicePlus(ECPoint b)
        {
            if (this.IsInfinity)
                return b;
            if (b.IsInfinity)
                return Twice();

            ECCurve curve = this.Curve;

            ECFieldElement X1 = this.RawXCoord;
            if (X1.IsZero)
            {
                // A point with X == 0 is its own additive inverse
                return b;
            }

            ECFieldElement X2 = b.RawXCoord, Z2 = b.RawZCoords[0];
            if (X2.IsZero || !Z2.IsOne)
            {
                return Twice().Add(b);
            }

            ECFieldElement L1 = this.RawYCoord, Z1 = this.RawZCoords[0];
            ECFieldElement L2 = b.RawYCoord;

            ECFieldElement X1Sq = X1.Square();
            ECFieldElement L1Sq = L1.Square();
            ECFieldElement Z1Sq = Z1.Square();
            ECFieldElement L1Z1 = L1.Multiply(Z1);

            ECFieldElement T = Z1Sq.Add(L1Sq).Add(L1Z1);
            ECFieldElement A = L2.Multiply(Z1Sq).Add(L1Sq).MultiplyPlusProduct(T, X1Sq, Z1Sq);
            ECFieldElement X2Z1Sq = X2.Multiply(Z1Sq);
            ECFieldElement B = X2Z1Sq.Add(T).Square();

            if (B.IsZero)
            {
                if (A.IsZero)
                    return b.Twice();

                return curve.Infinity;
            }

            if (A.IsZero)
            {
                return new SecT409R1Point(curve, A, curve.B.Sqrt());
            }

            ECFieldElement X3 = A.Square().Multiply(X2Z1Sq);
            ECFieldElement Z3 = A.Multiply(B).Multiply(Z1Sq);
            ECFieldElement L3 = A.Add(B).Square().MultiplyPlusProduct(T, L2.AddOne(), Z3);

            return new SecT409R1Point(curve, X3, L3, new ECFieldElement[] { Z3 });
        }

        public override ECPoint Negate()
        {
            if (this.IsInfinity)
                return this;

            ECFieldElement X = this.RawXCoord;
            if (X.IsZero)
                return this;

            // L is actually Lambda (X + Y/X) here
            ECFieldElement L = this.RawYCoord, Z = this.RawZCoords[0];
            return new SecT409R1Point(Curve, X, L.Add(Z), new ECFieldElement[] { Z });
        }
    }
}
