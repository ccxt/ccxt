using System;

using Org.BouncyCastle.Crypto.Macs;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Parameters
{
    /**
     * Parameter class for the HkdfBytesGenerator class.
     */
    public class HkdfParameters
        : IDerivationParameters
    {
        private readonly byte[] ikm;
        private readonly bool skipExpand;
        private readonly byte[] salt;
        private readonly byte[] info;

        private HkdfParameters(byte[] ikm, bool skip, byte[] salt, byte[] info)
        {
            if (ikm == null)
                throw new ArgumentNullException("ikm");

            this.ikm = Arrays.Clone(ikm);
            this.skipExpand = skip;

            if (salt == null || salt.Length == 0)
            {
                this.salt = null;
            }
            else
            {
                this.salt = Arrays.Clone(salt);
            }

            if (info == null)
            {
                this.info = new byte[0];
            }
            else
            {
                this.info = Arrays.Clone(info);
            }
        }

        /**
         * Generates parameters for HKDF, specifying both the optional salt and
         * optional info. Step 1: Extract won't be skipped.
         *
         * @param ikm  the input keying material or seed
         * @param salt the salt to use, may be null for a salt for hashLen zeros
         * @param info the info to use, may be null for an info field of zero bytes
         */
        public HkdfParameters(byte[] ikm, byte[] salt, byte[] info)
            : this(ikm, false, salt, info)
        {
        }

        /**
         * Factory method that makes the HKDF skip the extract part of the key
         * derivation function.
         *
         * @param ikm  the input keying material or seed, directly used for step 2:
         *             Expand
         * @param info the info to use, may be null for an info field of zero bytes
         * @return HKDFParameters that makes the implementation skip step 1
         */
        public static HkdfParameters SkipExtractParameters(byte[] ikm, byte[] info)
        {
            return new HkdfParameters(ikm, true, null, info);
        }

        public static HkdfParameters DefaultParameters(byte[] ikm)
        {
            return new HkdfParameters(ikm, false, null, null);
        }

        /**
         * Returns the input keying material or seed.
         *
         * @return the keying material
         */
        public virtual byte[] GetIkm()
        {
            return Arrays.Clone(ikm);
        }

        /**
         * Returns if step 1: extract has to be skipped or not
         *
         * @return true for skipping, false for no skipping of step 1
         */
        public virtual bool SkipExtract
        {
            get { return skipExpand; }
        }

        /**
         * Returns the salt, or null if the salt should be generated as a byte array
         * of HashLen zeros.
         *
         * @return the salt, or null
         */
        public virtual byte[] GetSalt()
        {
            return Arrays.Clone(salt);
        }

        /**
         * Returns the info field, which may be empty (null is converted to empty).
         *
         * @return the info field, never null
         */
        public virtual byte[] GetInfo()
        {
            return Arrays.Clone(info);
        }
    }
}
