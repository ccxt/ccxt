using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Math.Field
{
    internal class GenericPolynomialExtensionField
        : IPolynomialExtensionField
    {
        protected readonly IFiniteField subfield;
        protected readonly IPolynomial minimalPolynomial;

        internal GenericPolynomialExtensionField(IFiniteField subfield, IPolynomial polynomial)
        {
            this.subfield = subfield;
            this.minimalPolynomial = polynomial;
        }

        public virtual BigInteger Characteristic
        {
            get { return subfield.Characteristic; }
        }

        public virtual int Dimension
        {
            get { return subfield.Dimension * minimalPolynomial.Degree; }
        }

        public virtual IFiniteField Subfield
        {
            get { return subfield; }
        }

        public virtual int Degree
        {
            get { return minimalPolynomial.Degree; }
        }

        public virtual IPolynomial MinimalPolynomial
        {
            get { return minimalPolynomial; }
        }

        public override bool Equals(object obj)
        {
            if (this == obj)
            {
                return true;
            }
            GenericPolynomialExtensionField other = obj as GenericPolynomialExtensionField;
            if (null == other)
            {
                return false;
            }
            return subfield.Equals(other.subfield) && minimalPolynomial.Equals(other.minimalPolynomial);
        }

        public override int GetHashCode()
        {
            return subfield.GetHashCode() ^ Integers.RotateLeft(minimalPolynomial.GetHashCode(), 16);
        }
    }
}
