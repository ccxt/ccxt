using System;

using Org.BouncyCastle.Crypto.Prng.Drbg;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Crypto.Prng
{
    /**
     * Builder class for making SecureRandom objects based on SP 800-90A Deterministic Random Bit Generators (DRBG).
     */
    public class SP800SecureRandomBuilder
    {
        private readonly SecureRandom mRandom;
        private readonly IEntropySourceProvider mEntropySourceProvider;

        private byte[] mPersonalizationString = null;
        private int mSecurityStrength = 256;
        private int mEntropyBitsRequired = 256;

        /**
         * Basic constructor, creates a builder using an EntropySourceProvider based on the default SecureRandom with
         * predictionResistant set to false.
         * <p>
         * Any SecureRandom created from a builder constructed like this will make use of input passed to SecureRandom.setSeed() if
         * the default SecureRandom does for its generateSeed() call.
         * </p>
         */
        public SP800SecureRandomBuilder()
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
        public SP800SecureRandomBuilder(SecureRandom entropySource, bool predictionResistant)
        {
            this.mRandom = entropySource;
            this.mEntropySourceProvider = new BasicEntropySourceProvider(entropySource, predictionResistant);
        }

        /**
         * Create a builder which makes creates the SecureRandom objects from a specified entropy source provider.
         * <p>
         * <b>Note:</b> If this constructor is used any calls to setSeed() in the resulting SecureRandom will be ignored.
         * </p>
         * @param entropySourceProvider a provider of EntropySource objects.
         */
        public SP800SecureRandomBuilder(IEntropySourceProvider entropySourceProvider)
        {
            this.mRandom = null;
            this.mEntropySourceProvider = entropySourceProvider;
        }

        /**
         * Set the personalization string for DRBG SecureRandoms created by this builder
         * @param personalizationString  the personalisation string for the underlying DRBG.
         * @return the current builder.
         */
        public SP800SecureRandomBuilder SetPersonalizationString(byte[] personalizationString)
        {
            this.mPersonalizationString = personalizationString;
            return this;
        }

        /**
         * Set the security strength required for DRBGs used in building SecureRandom objects.
         *
         * @param securityStrength the security strength (in bits)
         * @return the current builder.
         */
        public SP800SecureRandomBuilder SetSecurityStrength(int securityStrength)
        {
            this.mSecurityStrength = securityStrength;
            return this;
        }

        /**
         * Set the amount of entropy bits required for seeding and reseeding DRBGs used in building SecureRandom objects.
         *
         * @param entropyBitsRequired the number of bits of entropy to be requested from the entropy source on each seed/reseed.
         * @return the current builder.
         */
        public SP800SecureRandomBuilder SetEntropyBitsRequired(int entropyBitsRequired)
        {
            this.mEntropyBitsRequired = entropyBitsRequired;
            return this;
        }

        /**
         * Build a SecureRandom based on a SP 800-90A Hash DRBG.
         *
         * @param digest digest algorithm to use in the DRBG underneath the SecureRandom.
         * @param nonce  nonce value to use in DRBG construction.
         * @param predictionResistant specify whether the underlying DRBG in the resulting SecureRandom should reseed on each request for bytes.
         * @return a SecureRandom supported by a Hash DRBG.
         */
        public SP800SecureRandom BuildHash(IDigest digest, byte[] nonce, bool predictionResistant)
        {
            return new SP800SecureRandom(mRandom, mEntropySourceProvider.Get(mEntropyBitsRequired),
                new HashDrbgProvider(digest, nonce, mPersonalizationString, mSecurityStrength), predictionResistant);
        }

        /**
         * Build a SecureRandom based on a SP 800-90A CTR DRBG.
         *
         * @param cipher the block cipher to base the DRBG on.
         * @param keySizeInBits key size in bits to be used with the block cipher.
         * @param nonce nonce value to use in DRBG construction.
         * @param predictionResistant  specify whether the underlying DRBG in the resulting SecureRandom should reseed on each request for bytes.
         * @return  a SecureRandom supported by a CTR DRBG.
         */
        public SP800SecureRandom BuildCtr(IBlockCipher cipher, int keySizeInBits, byte[] nonce, bool predictionResistant)
        {
            return new SP800SecureRandom(mRandom, mEntropySourceProvider.Get(mEntropyBitsRequired),
                new CtrDrbgProvider(cipher, keySizeInBits, nonce, mPersonalizationString, mSecurityStrength), predictionResistant);
        }

        /**
         * Build a SecureRandom based on a SP 800-90A HMAC DRBG.
         *
         * @param hMac HMAC algorithm to use in the DRBG underneath the SecureRandom.
         * @param nonce  nonce value to use in DRBG construction.
         * @param predictionResistant specify whether the underlying DRBG in the resulting SecureRandom should reseed on each request for bytes.
         * @return a SecureRandom supported by a HMAC DRBG.
         */
        public SP800SecureRandom BuildHMac(IMac hMac, byte[] nonce, bool predictionResistant)
        {
            return new SP800SecureRandom(mRandom, mEntropySourceProvider.Get(mEntropyBitsRequired),
                new HMacDrbgProvider(hMac, nonce, mPersonalizationString, mSecurityStrength), predictionResistant);
        }

        private class HashDrbgProvider
            :   IDrbgProvider
        {
            private readonly IDigest mDigest;
            private readonly byte[] mNonce;
            private readonly byte[] mPersonalizationString;
            private readonly int mSecurityStrength;

            public HashDrbgProvider(IDigest digest, byte[] nonce, byte[] personalizationString, int securityStrength)
            {
                this.mDigest = digest;
                this.mNonce = nonce;
                this.mPersonalizationString = personalizationString;
                this.mSecurityStrength = securityStrength;
            }

            public ISP80090Drbg Get(IEntropySource entropySource)
            {
                return new HashSP800Drbg(mDigest, mSecurityStrength, entropySource, mPersonalizationString, mNonce);
            }
        }

        private class HMacDrbgProvider
            :   IDrbgProvider
        {
            private readonly IMac mHMac;
            private readonly byte[] mNonce;
            private readonly byte[] mPersonalizationString;
            private readonly int mSecurityStrength;

            public HMacDrbgProvider(IMac hMac, byte[] nonce, byte[] personalizationString, int securityStrength)
            {
                this.mHMac = hMac;
                this.mNonce = nonce;
                this.mPersonalizationString = personalizationString;
                this.mSecurityStrength = securityStrength;
            }

            public ISP80090Drbg Get(IEntropySource entropySource)
            {
                return new HMacSP800Drbg(mHMac, mSecurityStrength, entropySource, mPersonalizationString, mNonce);
            }
        }

        private class CtrDrbgProvider
            :   IDrbgProvider
        {
            private readonly IBlockCipher mBlockCipher;
            private readonly int mKeySizeInBits;
            private readonly byte[] mNonce;
            private readonly byte[] mPersonalizationString;
            private readonly int mSecurityStrength;

            public CtrDrbgProvider(IBlockCipher blockCipher, int keySizeInBits, byte[] nonce, byte[] personalizationString, int securityStrength)
            {
                this.mBlockCipher = blockCipher;
                this.mKeySizeInBits = keySizeInBits;
                this.mNonce = nonce;
                this.mPersonalizationString = personalizationString;
                this.mSecurityStrength = securityStrength;
            }

            public ISP80090Drbg Get(IEntropySource entropySource)
            {
                return new CtrSP800Drbg(mBlockCipher, mKeySizeInBits, mSecurityStrength, entropySource, mPersonalizationString, mNonce);
            }
        }
    }
}
