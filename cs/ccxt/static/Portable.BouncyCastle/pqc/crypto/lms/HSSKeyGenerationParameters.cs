using System;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Pqc.Crypto.Lms
{
    public class HSSKeyGenerationParameters
        : KeyGenerationParameters
    {
        private LMSParameters[] lmsParameters;

        /**
         * Base constructor - parameters and a source of randomness.
         *
         * @param lmsParameters array of LMS parameters, one per level in the hierarchy (up to 8 levels).
         * @param random   the random byte source.
         */
        public HSSKeyGenerationParameters(
            LMSParameters[] lmsParameters,
            SecureRandom random)
            :base(random, LmsUtils.CalculateStrength(lmsParameters[0]))
        {
            if (lmsParameters.Length == 0 || lmsParameters.Length > 8)  // RFC 8554, Section 6.
            {
                throw new ArgumentException("lmsParameters length should be between 1 and 8 inclusive");
            }
            this.lmsParameters = lmsParameters;
        }

        public int GetDepth()
        {
            return lmsParameters.Length;
        }

        public LMSParameters[] GetLmsParameters()
        {
            return lmsParameters;
        }
    }
}