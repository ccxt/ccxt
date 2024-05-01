using System;

namespace Org.BouncyCastle.Math.EC.Multiplier
{
    public interface IPreCompCallback
    {
        PreCompInfo Precompute(PreCompInfo existing);
    }
}
