using System;

namespace Org.BouncyCastle.Math.Field
{
    internal class PrimeField
        : IFiniteField
    {
        protected readonly BigInteger characteristic;

        internal PrimeField(BigInteger characteristic)
        {
            this.characteristic = characteristic;
        }

        public virtual BigInteger Characteristic
        {
            get { return characteristic; }
        }

        public virtual int Dimension
        {
            get { return 1; }
        }

        public override bool Equals(object obj)
        {
            if (this == obj)
            {
                return true;
            }
            PrimeField other = obj as PrimeField;
            if (null == other)
            {
                return false;
            }
            return characteristic.Equals(other.characteristic);
        }

        public override int GetHashCode()
        {
            return characteristic.GetHashCode();
        }
    }
}
