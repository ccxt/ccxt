namespace Org.BouncyCastle.Math.EC.Multiplier
{
    /**
    * Class holding precomputation data for the WNAF (Window Non-Adjacent Form)
    * algorithm.
    */
    public class WNafPreCompInfo
        : PreCompInfo
    {
        internal volatile int m_promotionCountdown = 4;

        protected int m_confWidth = -1;

        /**
         * Array holding the precomputed <code>ECPoint</code>s used for a Window
         * NAF multiplication.
         */
        protected ECPoint[] m_preComp = null;

        /**
         * Array holding the negations of the precomputed <code>ECPoint</code>s used
         * for a Window NAF multiplication.
         */
        protected ECPoint[] m_preCompNeg = null;

        /**
         * Holds an <code>ECPoint</code> representing Twice(this). Used for the
         * Window NAF multiplication to create or extend the precomputed values.
         */
        protected ECPoint m_twice = null;

        protected int m_width = -1;

        internal int DecrementPromotionCountdown()
        {
            int t = m_promotionCountdown;
            if (t > 0)
            {
                m_promotionCountdown = --t;
            }
            return t;
        }

        internal int PromotionCountdown
        {
            get { return m_promotionCountdown; }
            set { this.m_promotionCountdown = value; }
        }

        public virtual bool IsPromoted
        {
            get { return m_promotionCountdown <= 0; }
        }

        public virtual int ConfWidth
        {
            get { return m_confWidth; }
            set { this.m_confWidth = value; }
        }

        public virtual ECPoint[] PreComp
        {
            get { return m_preComp; }
            set { this.m_preComp = value; }
        }

        public virtual ECPoint[] PreCompNeg
        {
            get { return m_preCompNeg; }
            set { this.m_preCompNeg = value; }
        }

        public virtual ECPoint Twice
        {
            get { return m_twice; }
            set { this.m_twice = value; }
        }

        public virtual int Width
        {
            get { return m_width; }
            set { this.m_width = value; }
        }
    }
}
