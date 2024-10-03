using System;

using Org.BouncyCastle.Math;
using Org.BouncyCastle.Math.EC;
using Org.BouncyCastle.Math.Field;

namespace Org.BouncyCastle.Asn1.X9
{
    /**
     * ASN.1 def for Elliptic-Curve ECParameters structure. See
     * X9.62, for further details.
     */
    public class X9ECParameters
        : Asn1Encodable
    {
        private X9FieldID	fieldID;
        private ECCurve		curve;
        private X9ECPoint	g;
        private BigInteger	n;
        private BigInteger	h;
        private byte[]		seed;

		public static X9ECParameters GetInstance(object obj)
		{
			if (obj is X9ECParameters)
				return (X9ECParameters)obj;

            if (obj != null)
				return new X9ECParameters(Asn1Sequence.GetInstance(obj));

            return null;
		}

        public X9ECParameters(
            Asn1Sequence seq)
        {
            if (!(seq[0] is DerInteger)
                || !((DerInteger)seq[0]).HasValue(1))
            {
                throw new ArgumentException("bad version in X9ECParameters");
            }

            this.n = ((DerInteger)seq[4]).Value;

            if (seq.Count == 6)
            {
                this.h = ((DerInteger)seq[5]).Value;
            }

            X9Curve x9c = new X9Curve(
                X9FieldID.GetInstance(seq[1]), n, h,
                Asn1Sequence.GetInstance(seq[2]));

            this.curve = x9c.Curve;
            object p = seq[3];

            if (p is X9ECPoint)
            {
                this.g = (X9ECPoint)p;
            }
            else
            {
                this.g = new X9ECPoint(curve, (Asn1OctetString)p);
            }

            this.seed = x9c.GetSeed();
        }

        public X9ECParameters(
            ECCurve curve,
            X9ECPoint g,
            BigInteger n)
            : this(curve, g, n, null, null)
        {
        }

        public X9ECParameters(
            ECCurve     curve,
            X9ECPoint   g,
            BigInteger  n,
            BigInteger  h)
            : this(curve, g, n, h, null)
        {
        }

        public X9ECParameters(
            ECCurve     curve,
            X9ECPoint   g,
            BigInteger  n,
            BigInteger  h,
            byte[]      seed)
        {
            this.curve = curve;
            this.g = g;
            this.n = n;
            this.h = h;
            this.seed = seed;

            if (ECAlgorithms.IsFpCurve(curve))
            {
                this.fieldID = new X9FieldID(curve.Field.Characteristic);
            }
            else if (ECAlgorithms.IsF2mCurve(curve))
            {
                IPolynomialExtensionField field = (IPolynomialExtensionField)curve.Field;
                int[] exponents = field.MinimalPolynomial.GetExponentsPresent();
                if (exponents.Length == 3)
                {
                    this.fieldID = new X9FieldID(exponents[2], exponents[1]);
                }
                else if (exponents.Length == 5)
                {
                    this.fieldID = new X9FieldID(exponents[4], exponents[1], exponents[2], exponents[3]);
                }
                else
                {
                    throw new ArgumentException("Only trinomial and pentomial curves are supported");
                }
            }
            else
            {
                throw new ArgumentException("'curve' is of an unsupported type");
            }
        }

        public ECCurve Curve
        {
            get { return curve; }
        }

        public ECPoint G
        {
            get { return g.Point; }
        }

        public BigInteger N
        {
            get { return n; }
        }

        public BigInteger H
        {
            get { return h; }
        }

        public byte[] GetSeed()
        {
            return seed;
        }

        /**
         * Return the ASN.1 entry representing the Curve.
         *
         * @return the X9Curve for the curve in these parameters.
         */
        public X9Curve CurveEntry
        {
            get { return new X9Curve(curve, seed); }
        }

        /**
         * Return the ASN.1 entry representing the FieldID.
         *
         * @return the X9FieldID for the FieldID in these parameters.
         */
        public X9FieldID FieldIDEntry
        {
            get { return fieldID; }
        }

        /**
         * Return the ASN.1 entry representing the base point G.
         *
         * @return the X9ECPoint for the base point in these parameters.
         */
        public X9ECPoint BaseEntry
        {
            get { return g; }
        }

        /**
         * Produce an object suitable for an Asn1OutputStream.
         * <pre>
         *  ECParameters ::= Sequence {
         *      version         Integer { ecpVer1(1) } (ecpVer1),
         *      fieldID         FieldID {{FieldTypes}},
         *      curve           X9Curve,
         *      base            X9ECPoint,
         *      order           Integer,
         *      cofactor        Integer OPTIONAL
         *  }
         * </pre>
         */
        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector(
                new DerInteger(BigInteger.One),
                fieldID,
                new X9Curve(curve, seed),
                g,
                new DerInteger(n));

            if (h != null)
            {
                v.Add(new DerInteger(h));
            }

            return new DerSequence(v);
        }
    }
}
