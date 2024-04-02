using System;

using Org.BouncyCastle.Math.Raw;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecT571K1Point
        : AbstractF2mPoint
    {
        internal SecT571K1Point(ECCurve curve, ECFieldElement x, ECFieldElement y)
            : base(curve, x, y)
        {
        }

        internal SecT571K1Point(ECCurve curve, ECFieldElement x, ECFieldElement y, ECFieldElement[] zs)
            : base(curve, x, y, zs)
        {
        }

        protected override ECPoint Detach()
        {
            return new SecT571K1Point(null, this.AffineXCoord, this.AffineYCoord);
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

            SecT571FieldElement X1 = (SecT571FieldElement)this.RawXCoord;
            SecT571FieldElement X2 = (SecT571FieldElement)b.RawXCoord;

            if (X1.IsZero)
            {
                if (X2.IsZero)
                    return curve.Infinity;

                return b.Add(this);
            }

            SecT571FieldElement L1 = (SecT571FieldElement)this.RawYCoord, Z1 = (SecT571FieldElement)this.RawZCoords[0];
            SecT571FieldElement L2 = (SecT571FieldElement)b.RawYCoord, Z2 = (SecT571FieldElement)b.RawZCoords[0];

            ulong[] t1 = Nat576.Create64();
            ulong[] t2 = Nat576.Create64();
            ulong[] t3 = Nat576.Create64();
            ulong[] t4 = Nat576.Create64();

            ulong[] Z1Precomp = Z1.IsOne ? null : SecT571Field.PrecompMultiplicand(Z1.x);
            ulong[] U2, S2;
            if (Z1Precomp == null)
            {
                U2 = X2.x;
                S2 = L2.x;
            }
            else
            {
                SecT571Field.MultiplyPrecomp(X2.x, Z1Precomp, U2 = t2);
                SecT571Field.MultiplyPrecomp(L2.x, Z1Precomp, S2 = t4);
            }

            ulong[] Z2Precomp = Z2.IsOne ? null : SecT571Field.PrecompMultiplicand(Z2.x);
            ulong[] U1, S1;
            if (Z2Precomp == null)
            {
                U1 = X1.x;
                S1 = L1.x;
            }
            else
            {
                SecT571Field.MultiplyPrecomp(X1.x, Z2Precomp, U1 = t1);
                SecT571Field.MultiplyPrecomp(L1.x, Z2Precomp, S1 = t3);
            }

            ulong[] A = t3;
            SecT571Field.Add(S1, S2, A);

            ulong[] B = t4;
            SecT571Field.Add(U1, U2, B);

            if (Nat576.IsZero64(B))
            {
                if (Nat576.IsZero64(A))
                    return Twice();

                return curve.Infinity;
            }

            SecT571FieldElement X3, L3, Z3;
            if (X2.IsZero)
            {
                // TODO This can probably be optimized quite a bit
                ECPoint p = this.Normalize();
                X1 = (SecT571FieldElement)p.XCoord;
                ECFieldElement Y1 = p.YCoord;

                ECFieldElement Y2 = L2;
                ECFieldElement L = Y1.Add(Y2).Divide(X1);

                X3 = (SecT571FieldElement)L.Square().Add(L).Add(X1);
                if (X3.IsZero)
                {
                    return new SecT571K1Point(curve, X3, curve.B);
                }

                ECFieldElement Y3 = L.Multiply(X1.Add(X3)).Add(X3).Add(Y1);
                L3 = (SecT571FieldElement)Y3.Divide(X3).Add(X3);
                Z3 = (SecT571FieldElement)curve.FromBigInteger(BigInteger.One);
            }
            else
            {
                SecT571Field.Square(B, B);

                ulong[] APrecomp = SecT571Field.PrecompMultiplicand(A);

                ulong[] AU1 = t1;
                ulong[] AU2 = t2;

                SecT571Field.MultiplyPrecomp(U1, APrecomp, AU1);
                SecT571Field.MultiplyPrecomp(U2, APrecomp, AU2);

                X3 = new SecT571FieldElement(t1);
                SecT571Field.Multiply(AU1, AU2, X3.x);

                if (X3.IsZero)
                {
                    return new SecT571K1Point(curve, X3, curve.B);
                }

                Z3 = new SecT571FieldElement(t3);
                SecT571Field.MultiplyPrecomp(B, APrecomp, Z3.x);

                if (Z2Precomp != null)
                {
                    SecT571Field.MultiplyPrecomp(Z3.x, Z2Precomp, Z3.x);
                }

                //L3 = AU2.Add(B).SquarePlusProduct(ABZ2, L1.Add(Z1));
                ulong[] tt = Nat576.CreateExt64();

                SecT571Field.Add(AU2, B, t4);
                SecT571Field.SquareAddToExt(t4, tt);

                SecT571Field.Add(L1.x, Z1.x, t4);
                SecT571Field.MultiplyAddToExt(t4, Z3.x, tt);

                L3 = new SecT571FieldElement(t4);
                SecT571Field.Reduce(tt, L3.x);

                if (Z1Precomp != null)
                {
                    SecT571Field.MultiplyPrecomp(Z3.x, Z1Precomp, Z3.x);
                }
            }

            return new SecT571K1Point(curve, X3, L3, new ECFieldElement[] { Z3 });
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
            ECFieldElement Z1Sq = Z1IsOne ? Z1 : Z1.Square();
            ECFieldElement T;
            if (Z1IsOne)
            {
                T = L1.Square().Add(L1);
            }
            else
            {
                T = L1.Add(Z1).Multiply(L1);
            }

            if (T.IsZero)
            {
                return new SecT571K1Point(curve, T, curve.B);
            }

            ECFieldElement X3 = T.Square();
            ECFieldElement Z3 = Z1IsOne ? T : T.Multiply(Z1Sq);

            ECFieldElement t1 = L1.Add(X1).Square();
            ECFieldElement t2 = Z1IsOne ? Z1 : Z1Sq.Square();
            ECFieldElement L3 = t1.Add(T).Add(Z1Sq).Multiply(t1).Add(t2).Add(X3).Add(Z3);

            return new SecT571K1Point(curve, X3, L3, new ECFieldElement[] { Z3 });
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

            // NOTE: TwicePlus() only optimized for lambda-affine argument
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

            ECFieldElement T = L1Sq.Add(L1Z1);
            ECFieldElement L2plus1 = L2.AddOne();
            ECFieldElement A = L2plus1.Multiply(Z1Sq).Add(L1Sq).MultiplyPlusProduct(T, X1Sq, Z1Sq);
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
                return new SecT571K1Point(curve, A, curve.B);
            }

            ECFieldElement X3 = A.Square().Multiply(X2Z1Sq);
            ECFieldElement Z3 = A.Multiply(B).Multiply(Z1Sq);
            ECFieldElement L3 = A.Add(B).Square().MultiplyPlusProduct(T, L2plus1, Z3);

            return new SecT571K1Point(curve, X3, L3, new ECFieldElement[] { Z3 });
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
            return new SecT571K1Point(Curve, X, L.Add(Z), new ECFieldElement[] { Z });
        }
    }
}
