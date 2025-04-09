using System;

using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Crypto.Prng
{
    /**
     * An EntropySourceProvider where entropy generation is based on a SecureRandom output using SecureRandom.generateSeed().
     */
    public class BasicEntropySourceProvider
        :   IEntropySourceProvider
    {
        private readonly SecureRandom   mSecureRandom;
        private readonly bool           mPredictionResistant;

        /**
         * Create a entropy source provider based on the passed in SecureRandom.
         *
         * @param secureRandom the SecureRandom to base EntropySource construction on.
         * @param isPredictionResistant boolean indicating if the SecureRandom is based on prediction resistant entropy or not (true if it is).
         */
        public BasicEntropySourceProvider(SecureRandom secureRandom, bool isPredictionResistant)
        {
            mSecureRandom = secureRandom;
            mPredictionResistant = isPredictionResistant;
        }

        /**
         * Return an entropy source that will create bitsRequired bits of entropy on
         * each invocation of getEntropy().
         *
         * @param bitsRequired size (in bits) of entropy to be created by the provided source.
         * @return an EntropySource that generates bitsRequired bits of entropy on each call to its getEntropy() method.
         */
        public IEntropySource Get(int bitsRequired)
        {
            return new BasicEntropySource(mSecureRandom, mPredictionResistant, bitsRequired);
        }

        private class BasicEntropySource
            :   IEntropySource
        {
            private readonly SecureRandom   mSecureRandom;
            private readonly bool           mPredictionResistant;
            private readonly int            mEntropySize;

            internal BasicEntropySource(SecureRandom secureRandom, bool predictionResistant, int entropySize)
            {
                this.mSecureRandom = secureRandom;
                this.mPredictionResistant = predictionResistant;
                this.mEntropySize = entropySize;
            }

            bool IEntropySource.IsPredictionResistant
            {
                get { return mPredictionResistant; }
            }

            byte[] IEntropySource.GetEntropy()
            {
                // TODO[FIPS] Not all SecureRandom implementations are considered valid entropy sources
                return SecureRandom.GetNextBytes(mSecureRandom, (mEntropySize + 7) / 8);
            }

            int IEntropySource.EntropySize
            {
                get { return mEntropySize; }
            }
        }
    }
}
