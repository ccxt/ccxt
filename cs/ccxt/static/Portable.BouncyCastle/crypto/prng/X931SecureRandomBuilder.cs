using System;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities.Date;

namespace Org.BouncyCastle.Crypto.Prng
{
    public class X931SecureRandomBuilder
    {
        private readonly SecureRandom mRandom;          // JDK 1.1 complains on final.

        private IEntropySourceProvider mEntropySourceProvider;
        private byte[] mDateTimeVector;

        /**
         * Basic constructor, creates a builder using an EntropySourceProvider based on the default SecureRandom with
         * predictionResistant set to false.
         * <p>
         * Any SecureRandom created from a builder constructed like this will make use of input passed to SecureRandom.setSeed() if
         * the default SecureRandom does for its generateSeed() call.
         * </p>
         */
        public X931SecureRandomBuilder()
            : this(new SecureRandom(), false)
        {
        }

        /**
         * Construct a builder with an EntropySourceProvider based on the passed in SecureRandom and the passed in value
         * for prediction resistance.
         * <p>
         * Any SecureRandom created from a builder constructed like this will make use of input passed to SecureRandom.setSeed() if
         * the passed in SecureRandom does for its generateSeed() call.
         * </p>
         * @param entropySource
         * @param predictionResistant
         */
        public X931SecureRandomBuilder(SecureRandom entropySource, bool predictionResistant)
        {
            this.mRandom = entropySource;
            this.mEntropySourceProvider = new BasicEntropySourceProvider(mRandom, predictionResistant);
        }

        /**
         * Create a builder which makes creates the SecureRandom objects from a specified entropy source provider.
         * <p>
         * <b>Note:</b> If this constructor is used any calls to setSeed() in the resulting SecureRandom will be ignored.
         * </p>
         * @param entropySourceProvider a provider of EntropySource objects.
         */
        public X931SecureRandomBuilder(IEntropySourceProvider entropySourceProvider)
        {
            this.mRandom = null;
            this.mEntropySourceProvider = entropySourceProvider;
        }

        public X931SecureRandomBuilder SetDateTimeVector(byte[] dateTimeVector)
        {
            this.mDateTimeVector = dateTimeVector;
            return this;
        }

        /**
         * Construct a X9.31 secure random generator using the passed in engine and key. If predictionResistant is true the
         * generator will be reseeded on each request.
         *
         * @param engine a block cipher to use as the operator.
         * @param key the block cipher key to initialise engine with.
         * @param predictionResistant true if engine to be reseeded on each use, false otherwise.
         * @return a SecureRandom.
         */
        public X931SecureRandom Build(IBlockCipher engine, KeyParameter key, bool predictionResistant)
        {
            if (mDateTimeVector == null)
            {
                mDateTimeVector = new byte[engine.GetBlockSize()];
                Pack.UInt64_To_BE((ulong)DateTimeUtilities.CurrentUnixMs(), mDateTimeVector, 0);
            }

            engine.Init(true, key);

            return new X931SecureRandom(mRandom, new X931Rng(engine, mDateTimeVector, mEntropySourceProvider.Get(engine.GetBlockSize() * 8)), predictionResistant);
        }
    }
}
