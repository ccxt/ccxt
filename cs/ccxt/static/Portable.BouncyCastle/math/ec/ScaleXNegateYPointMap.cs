using System;

namespace Org.BouncyCastle.Math.EC
{
    public class ScaleXNegateYPointMap
        : ECPointMap
    {
        protected readonly ECFieldElement scale;

        public ScaleXNegateYPointMap(ECFieldElement scale)
        {
            this.scale = scale;
        }

        public virtual ECPoint Map(ECPoint p)
        {
            return p.ScaleXNegateY(scale);
        }
    }
}
