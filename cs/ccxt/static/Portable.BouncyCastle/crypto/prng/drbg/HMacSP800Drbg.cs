using System;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Prng.Drbg
{
	/**
	 * A SP800-90A HMAC DRBG.
	 */
	public class HMacSP800Drbg
        :   ISP80090Drbg
	{
	    private readonly static long RESEED_MAX = 1L << (48 - 1);
		private readonly static int MAX_BITS_REQUEST = 1 << (19 - 1);

        private readonly byte[]         mK;
        private readonly byte[]         mV;
        private readonly IEntropySource mEntropySource;
        private readonly IMac           mHMac;
        private readonly int            mSecurityStrength;

        private long mReseedCounter;

        /**
	     * Construct a SP800-90A Hash DRBG.
	     * <p>
	     * Minimum entropy requirement is the security strength requested.
	     * </p>
	     * @param hMac Hash MAC to base the DRBG on.
	     * @param securityStrength security strength required (in bits)
	     * @param entropySource source of entropy to use for seeding/reseeding.
	     * @param personalizationString personalization string to distinguish this DRBG (may be null).
	     * @param nonce nonce to further distinguish this DRBG (may be null).
	     */
	    public HMacSP800Drbg(IMac hMac, int securityStrength, IEntropySource entropySource, byte[] personalizationString, byte[] nonce)
	    {
	        if (securityStrength > DrbgUtilities.GetMaxSecurityStrength(hMac))
	            throw new ArgumentException("Requested security strength is not supported by the derivation function");
	        if (entropySource.EntropySize < securityStrength)
	            throw new ArgumentException("Not enough entropy for security strength required");

            mHMac = hMac;
            mSecurityStrength = securityStrength;
	        mEntropySource = entropySource;

            byte[] entropy = GetEntropy();
	        byte[] seedMaterial = Arrays.ConcatenateAll(entropy, nonce, personalizationString);

            mK = new byte[hMac.GetMacSize()];
	        mV = new byte[mK.Length];
	        Arrays.Fill(mV, (byte)1);

            hmac_DRBG_Update(seedMaterial);

            mReseedCounter = 1;
	    }

        private void hmac_DRBG_Update(byte[] seedMaterial)
	    {
	        hmac_DRBG_Update_Func(seedMaterial, (byte)0x00);
	        if (seedMaterial != null)
	        {
	            hmac_DRBG_Update_Func(seedMaterial, (byte)0x01);
	        }
	    }

	    private void hmac_DRBG_Update_Func(byte[] seedMaterial, byte vValue)
	    {
	        mHMac.Init(new KeyParameter(mK));

            mHMac.BlockUpdate(mV, 0, mV.Length);
            mHMac.Update(vValue);

	        if (seedMaterial != null)
	        {
                mHMac.BlockUpdate(seedMaterial, 0, seedMaterial.Length);
	        }

            mHMac.DoFinal(mK, 0);

            mHMac.Init(new KeyParameter(mK));
            mHMac.BlockUpdate(mV, 0, mV.Length);

            mHMac.DoFinal(mV, 0);
	    }

	    /**
	     * Return the block size (in bits) of the DRBG.
	     *
	     * @return the number of bits produced on each round of the DRBG.
	     */
	    public int BlockSize
	    {
			get { return mV.Length * 8; }
	    }

	    /**
	     * Populate a passed in array with random data.
	     *
	     * @param output output array for generated bits.
	     * @param additionalInput additional input to be added to the DRBG in this step.
	     * @param predictionResistant true if a reseed should be forced, false otherwise.
	     *
	     * @return number of bits generated, -1 if a reseed required.
	     */
	    public int Generate(byte[] output, int outputOff, int outputLen, byte[] additionalInput,
			bool predictionResistant)
	    {
#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
			return Generate(output.AsSpan(outputOff, outputLen), additionalInput, predictionResistant);
#else
			int numberOfBits = outputLen * 8;

            if (numberOfBits > MAX_BITS_REQUEST)
	            throw new ArgumentException("Number of bits per request limited to " + MAX_BITS_REQUEST, "output");

            if (mReseedCounter > RESEED_MAX)
	            return -1;

            if (predictionResistant)
	        {
	            Reseed(additionalInput);
	            additionalInput = null;
	        }

	        // 2.
	        if (additionalInput != null)
	        {
	            hmac_DRBG_Update(additionalInput);
	        }

            // 3.
	        byte[] rv = new byte[outputLen];

            int m = outputLen / mV.Length;

            mHMac.Init(new KeyParameter(mK));

	        for (int i = 0; i < m; i++)
	        {
	            mHMac.BlockUpdate(mV, 0, mV.Length);
                mHMac.DoFinal(mV, 0);

                Array.Copy(mV, 0, rv, i * mV.Length, mV.Length);
	        }

            if (m * mV.Length < rv.Length)
	        {
                mHMac.BlockUpdate(mV, 0, mV.Length);
                mHMac.DoFinal(mV, 0);

	            Array.Copy(mV, 0, rv, m * mV.Length, rv.Length - (m * mV.Length));
	        }

            hmac_DRBG_Update(additionalInput);

	        mReseedCounter++;

	        Array.Copy(rv, 0, output, outputOff, outputLen);

            return numberOfBits;
#endif
	    }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public int Generate(Span<byte> output, byte[] additionalInput, bool predictionResistant)
        {
			int outputLen = output.Length;
            int numberOfBits = outputLen * 8;

            if (numberOfBits > MAX_BITS_REQUEST)
                throw new ArgumentException("Number of bits per request limited to " + MAX_BITS_REQUEST, "output");

            if (mReseedCounter > RESEED_MAX)
                return -1;

            if (predictionResistant)
            {
                Reseed(additionalInput);
                additionalInput = null;
            }

            // 2.
            if (additionalInput != null)
            {
                hmac_DRBG_Update(additionalInput);
            }

            // 3.
            int m = outputLen / mV.Length;

            mHMac.Init(new KeyParameter(mK));

            for (int i = 0; i < m; i++)
            {
                mHMac.BlockUpdate(mV, 0, mV.Length);
                mHMac.DoFinal(mV, 0);

				mV.CopyTo(output[(i * mV.Length)..]);
            }

			int remaining = outputLen - m * mV.Length;
            if (remaining > 0)
            {
                mHMac.BlockUpdate(mV, 0, mV.Length);
                mHMac.DoFinal(mV, 0);

				mV[..remaining].CopyTo(output[(m * mV.Length)..]);
            }

            hmac_DRBG_Update(additionalInput);

            mReseedCounter++;

            return numberOfBits;
        }
#endif

        /**
	      * Reseed the DRBG.
	      *
	      * @param additionalInput additional input to be added to the DRBG in this step.
	      */
        public void Reseed(byte[] additionalInput)
	    {
	        byte[] entropy = GetEntropy();
	        byte[] seedMaterial = Arrays.Concatenate(entropy, additionalInput);

	        hmac_DRBG_Update(seedMaterial);

	        mReseedCounter = 1;
	    }

        private byte[] GetEntropy()
	    {
	        byte[] entropy = mEntropySource.GetEntropy();
	        if (entropy.Length < (mSecurityStrength + 7) / 8)
	            throw new InvalidOperationException("Insufficient entropy provided by entropy source");
	        return entropy;
	    }
	}
}
