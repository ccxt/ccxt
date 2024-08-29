using System;

namespace Org.BouncyCastle.Math.EC
{
    public abstract class AbstractECLookupTable
        : ECLookupTable
    {
        public abstract ECPoint Lookup(int index);
        public abstract int Size { get; }

        public virtual ECPoint LookupVar(int index)
        {
            return Lookup(index);
        }
    }
}
