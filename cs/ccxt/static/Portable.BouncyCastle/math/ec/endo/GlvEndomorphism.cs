using System;

namespace Org.BouncyCastle.Math.EC.Endo
{
    public interface GlvEndomorphism
        :   ECEndomorphism
    {
        BigInteger[] DecomposeScalar(BigInteger k);
    }
}
