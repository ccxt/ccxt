using System;

using Org.BouncyCastle.Math;
using Org.BouncyCastle.Math.EC;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.X9
{
    /**
     * ASN.1 def for Elliptic-Curve Curve structure. See
     * X9.62, for further details.
     */
    public class X9Curve
        : Asn1Encodable
    {
        private readonly ECCurve curve;
        private readonly byte[] seed;
        private readonly DerObjectIdentifier fieldIdentifier;

        public X9Curve(
            ECCurve curve)
            : this(curve, null)
        {
        }

        public X9Curve(
            ECCurve	curve,
            byte[]	seed)
        {
            if (curve == null)
                throw new ArgumentNullException("curve");

            this.curve = curve;
            this.seed = Arrays.Clone(seed);

            if (ECAlgorithms.IsFpCurve(curve))
            {
                this.fieldIdentifier = X9ObjectIdentifiers.PrimeField;
            }
            else if (ECAlgorithms.IsF2mCurve(curve))
            {
                this.fieldIdentifier = X9ObjectIdentifiers.CharacteristicTwoField;
            }
            else
            {
                throw new ArgumentException("This type of ECCurve is not implemented");
            }
        }

        public X9Curve(
            X9FieldID		fieldID,
            BigInteger      order,
            BigInteger      cofactor,
            Asn1Sequence	seq)
        {
            if (fieldID == null)
                throw new ArgumentNullException("fieldID");
            if (seq == null)
                throw new ArgumentNullException("seq");

            this.fieldIdentifier = fieldID.Identifier;

            if (fieldIdentifier.Equals(X9ObjectIdentifiers.PrimeField))
            {
                BigInteger p = ((DerInteger)fieldID.Parameters).Value;
                BigInteger A = new BigInteger(1, Asn1OctetString.GetInstance(seq[0]).GetOctets());
                BigInteger B = new BigInteger(1, Asn1OctetString.GetInstance(seq[1]).GetOctets());
                curve = new FpCurve(p, A, B, order, cofactor);
            }
            else if (fieldIdentifier.Equals(X9ObjectIdentifiers.CharacteristicTwoField)) 
            {
                // Characteristic two field
                DerSequence parameters = (DerSequence)fieldID.Parameters;
                int m = ((DerInteger)parameters[0]).IntValueExact;
                DerObjectIdentifier representation = (DerObjectIdentifier)parameters[1];

                int k1 = 0;
                int k2 = 0;
                int k3 = 0;
                if (representation.Equals(X9ObjectIdentifiers.TPBasis)) 
                {
                    // Trinomial basis representation
                    k1 = ((DerInteger)parameters[2]).IntValueExact;
                }
                else 
                {
                    // Pentanomial basis representation
                    DerSequence pentanomial = (DerSequence) parameters[2];
                    k1 = ((DerInteger)pentanomial[0]).IntValueExact;
                    k2 = ((DerInteger)pentanomial[1]).IntValueExact;
                    k3 = ((DerInteger)pentanomial[2]).IntValueExact;
                }
                BigInteger A = new BigInteger(1, Asn1OctetString.GetInstance(seq[0]).GetOctets());
                BigInteger B = new BigInteger(1, Asn1OctetString.GetInstance(seq[1]).GetOctets());
                curve = new F2mCurve(m, k1, k2, k3, A, B, order, cofactor);
            }
            else
            {
                throw new ArgumentException("This type of ECCurve is not implemented");
            }

            if (seq.Count == 3)
            {
                seed = ((DerBitString)seq[2]).GetBytes();
            }
        }

        public ECCurve Curve
        {
            get { return curve; }
        }

        public byte[] GetSeed()
        {
            return Arrays.Clone(seed);
        }

        /**
         * Produce an object suitable for an Asn1OutputStream.
         * <pre>
         *  Curve ::= Sequence {
         *      a               FieldElement,
         *      b               FieldElement,
         *      seed            BIT STRING      OPTIONAL
         *  }
         * </pre>
         */
        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector();

            if (fieldIdentifier.Equals(X9ObjectIdentifiers.PrimeField)
                || fieldIdentifier.Equals(X9ObjectIdentifiers.CharacteristicTwoField)) 
            { 
                v.Add(new X9FieldElement(curve.A).ToAsn1Object());
                v.Add(new X9FieldElement(curve.B).ToAsn1Object());
            } 

            if (seed != null)
            {
                v.Add(new DerBitString(seed));
            }

            return new DerSequence(v);
        }
    }
}
