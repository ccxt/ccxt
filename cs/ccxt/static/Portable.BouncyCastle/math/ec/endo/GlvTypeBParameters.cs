using System;

namespace Org.BouncyCastle.Math.EC.Endo
{
    public class GlvTypeBParameters
    {
        protected readonly BigInteger m_beta, m_lambda;
        protected readonly ScalarSplitParameters m_splitParams;

        public GlvTypeBParameters(BigInteger beta, BigInteger lambda, ScalarSplitParameters splitParams)
        {
            this.m_beta = beta;
            this.m_lambda = lambda;
            this.m_splitParams = splitParams;
        }

        public virtual BigInteger Beta
        {
            get { return m_beta; }
        }

        public virtual BigInteger Lambda
        {
            get { return m_lambda; }
        }

        public virtual ScalarSplitParameters SplitParams
        {
            get { return m_splitParams; }
        }
    }
}
