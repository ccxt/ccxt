using System;

namespace Org.BouncyCastle.Math.EC
{
    public class ScaleYPointMap
        : ECPointMap
    {
        protected readonly ECFieldElement scale;

        public ScaleYPointMap(ECFieldElement scale)
        {
            this.scale = scale;
        }

        public virtual ECPoint Map(ECPoint p)
        {
            return p.ScaleY(scale);
        }
    }
}
