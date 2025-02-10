using System;

namespace Org.BouncyCastle.Math.Field
{
    public interface IFiniteField
    {
        BigInteger Characteristic { get; }

        int Dimension { get; }
    }
}
