using System;

using Org.BouncyCastle.Math.EC.Multiplier;

namespace Org.BouncyCastle.Math.EC.Endo
{
    public class EndoPreCompInfo
        : PreCompInfo
    {
        protected ECEndomorphism m_endomorphism;

        protected ECPoint m_mappedPoint;

        public virtual ECEndomorphism Endomorphism
        {
            get { return m_endomorphism; }
            set { this.m_endomorphism = value; }
        }

        public virtual ECPoint MappedPoint
        {
            get { return m_mappedPoint; }
            set { this.m_mappedPoint = value; }
        }
    }
}
