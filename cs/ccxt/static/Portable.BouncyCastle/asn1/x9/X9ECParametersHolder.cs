using Org.BouncyCastle.Math.EC;

namespace Org.BouncyCastle.Asn1.X9
{
	public abstract class X9ECParametersHolder
	{
        private ECCurve m_curve;
        private X9ECParameters m_parameters;

        public ECCurve Curve
        {
            get
            {
                lock (this)
                {
                    if (m_curve == null)
                    {
                        m_curve = CreateCurve();
                    }

                    return m_curve;
                }
            }
        }

        public X9ECParameters Parameters
		{
			get
			{
                lock (this)
                {
                    if (m_parameters == null)
                    {
                        m_parameters = CreateParameters();
                    }

                    return m_parameters;
                }
            }
        }

        protected virtual ECCurve CreateCurve()
        {
            return CreateParameters().Curve;
        }

        protected abstract X9ECParameters CreateParameters();
	}
}
