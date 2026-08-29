using System;

namespace Org.BouncyCastle.Math.EC.Endo
{
    public class GlvTypeAEndomorphism
        :   GlvEndomorphism
    {
        protected readonly GlvTypeAParameters m_parameters;
        protected readonly ECPointMap m_pointMap;

        public GlvTypeAEndomorphism(ECCurve curve, GlvTypeAParameters parameters)
        {
            /*
             * NOTE: 'curve' MUST only be used to create a suitable ECFieldElement. Due to the way
             * ECCurve configuration works, 'curve' will not be the actual instance of ECCurve that the
             * endomorphism is being used with.
             */

            this.m_parameters = parameters;
            this.m_pointMap = new ScaleYNegateXPointMap(curve.FromBigInteger(parameters.I));
        }

        public virtual BigInteger[] DecomposeScalar(BigInteger k)
        {
            return EndoUtilities.DecomposeScalar(m_parameters.SplitParams, k);
        }

        public virtual ECPointMap PointMap
        {
            get { return m_pointMap; }
        }

        public virtual bool HasEfficientPointMap
        {
            get { return true; }
        }
    }
}
