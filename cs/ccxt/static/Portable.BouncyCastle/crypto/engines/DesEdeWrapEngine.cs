using System;

using Org.BouncyCastle.Crypto.Digests;
using Org.BouncyCastle.Crypto.Modes;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Engines
{
    /**
    * Wrap keys according to
    * <a href="http://www.ietf.org/internet-drafts/draft-ietf-smime-key-wrap-01.txt">
    * draft-ietf-smime-key-wrap-01.txt</a>.
    * <p>
    * Note:
    * <ul>
    * <li>this is based on a draft, and as such is subject to change - don't use this class for anything requiring long term storage.</li>
    * <li>if you are using this to wrap triple-des keys you need to set the
    * parity bits on the key and, if it's a two-key triple-des key, pad it
    * yourself.</li>
    * </ul>
	* </p>
    */
    public class DesEdeWrapEngine
		: IWrapper
    {
        /** Field engine */
        private CbcBlockCipher engine;
        /** Field param */
        private KeyParameter param;
        /** Field paramPlusIV */
        private ParametersWithIV paramPlusIV;
        /** Field iv */
        private byte[] iv;
        /** Field forWrapping */
        private bool forWrapping;
        /** Field IV2           */
        private static readonly byte[] IV2 = { (byte) 0x4a, (byte) 0xdd, (byte) 0xa2,
                                            (byte) 0x2c, (byte) 0x79, (byte) 0xe8,
                                            (byte) 0x21, (byte) 0x05 };

		//
        // checksum digest
        //
        private readonly IDigest sha1 = new Sha1Digest();
        private readonly byte[] digest = new byte[20];

		/**
        * Method init
        *
        * @param forWrapping
        * @param param
        */
        public virtual void Init(
			bool				forWrapping,
			ICipherParameters	parameters)
        {
            this.forWrapping = forWrapping;
            this.engine = new CbcBlockCipher(new DesEdeEngine());

			SecureRandom sr;
			if (parameters is ParametersWithRandom)
			{
				ParametersWithRandom pr = (ParametersWithRandom) parameters;
				parameters = pr.Parameters;
				sr = pr.Random;
			}
			else
			{
				sr = new SecureRandom();
			}

			if (parameters is KeyParameter)
            {
                this.param = (KeyParameter) parameters;
                if (this.forWrapping)
				{
                    // Hm, we have no IV but we want to wrap ?!?
                    // well, then we have to create our own IV.
                    this.iv = new byte[8];
					sr.NextBytes(iv);

					this.paramPlusIV = new ParametersWithIV(this.param, this.iv);
                }
            }
            else if (parameters is ParametersWithIV)
            {
				if (!forWrapping)
					throw new ArgumentException("You should not supply an IV for unwrapping");

				this.paramPlusIV = (ParametersWithIV) parameters;
                this.iv = this.paramPlusIV.GetIV();
                this.param = (KeyParameter) this.paramPlusIV.Parameters;

				if (this.iv.Length != 8)
					throw new ArgumentException("IV is not 8 octets", "parameters");
            }
        }

		/**
        * Method GetAlgorithmName
        *
        * @return
        */
        public virtual string AlgorithmName
        {
            get { return "DESede"; }
        }

		/**
        * Method wrap
        *
        * @param in
        * @param inOff
        * @param inLen
        * @return
        */
        public virtual byte[] Wrap(
			byte[]	input,
			int		inOff,
			int		length)
        {
            if (!forWrapping)
            {
                throw new InvalidOperationException("Not initialized for wrapping");
            }

			byte[] keyToBeWrapped = new byte[length];
            Array.Copy(input, inOff, keyToBeWrapped, 0, length);

            // Compute the CMS Key Checksum, (section 5.6.1), call this CKS.
            byte[] CKS = CalculateCmsKeyChecksum(keyToBeWrapped);

            // Let WKCKS = WK || CKS where || is concatenation.
            byte[] WKCKS = new byte[keyToBeWrapped.Length + CKS.Length];
            Array.Copy(keyToBeWrapped, 0, WKCKS, 0, keyToBeWrapped.Length);
            Array.Copy(CKS, 0, WKCKS, keyToBeWrapped.Length, CKS.Length);

            // Encrypt WKCKS in CBC mode using KEK as the key and IV as the
            // initialization vector. Call the results TEMP1.

			int blockSize = engine.GetBlockSize();

			if (WKCKS.Length % blockSize != 0)
                throw new InvalidOperationException("Not multiple of block length");

			engine.Init(true, paramPlusIV);

            byte [] TEMP1 = new byte[WKCKS.Length];

			for (int currentBytePos = 0; currentBytePos != WKCKS.Length; currentBytePos += blockSize)
			{
                engine.ProcessBlock(WKCKS, currentBytePos, TEMP1, currentBytePos);
            }

            // Let TEMP2 = IV || TEMP1.
            byte[] TEMP2 = new byte[this.iv.Length + TEMP1.Length];
            Array.Copy(this.iv, 0, TEMP2, 0, this.iv.Length);
            Array.Copy(TEMP1, 0, TEMP2, this.iv.Length, TEMP1.Length);

            // Reverse the order of the octets in TEMP2 and call the result TEMP3.
            byte[] TEMP3 = reverse(TEMP2);

			// Encrypt TEMP3 in CBC mode using the KEK and an initialization vector
            // of 0x 4a dd a2 2c 79 e8 21 05. The resulting cipher text is the desired
            // result. It is 40 octets long if a 168 bit key is being wrapped.
            ParametersWithIV param2 = new ParametersWithIV(this.param, IV2);
            this.engine.Init(true, param2);

            for (int currentBytePos = 0; currentBytePos != TEMP3.Length; currentBytePos += blockSize)
			{
                engine.ProcessBlock(TEMP3, currentBytePos, TEMP3, currentBytePos);
            }

            return TEMP3;
        }

		/**
        * Method unwrap
        *
        * @param in
        * @param inOff
        * @param inLen
        * @return
        * @throws InvalidCipherTextException
        */
        public virtual byte[] Unwrap(
			byte[]	input,
			int		inOff,
			int		length)
        {
            if (forWrapping)
            {
                throw new InvalidOperationException("Not set for unwrapping");
            }
            if (input == null)
            {
                throw new InvalidCipherTextException("Null pointer as ciphertext");
            }

			int blockSize = engine.GetBlockSize();
			
            if (length % blockSize != 0)
            {
                throw new InvalidCipherTextException("Ciphertext not multiple of " + blockSize);
            }

			/*
            // Check if the length of the cipher text is reasonable given the key
            // type. It must be 40 bytes for a 168 bit key and either 32, 40, or
            // 48 bytes for a 128, 192, or 256 bit key. If the length is not supported
            // or inconsistent with the algorithm for which the key is intended,
            // return error.
            //
            // we do not accept 168 bit keys. it has to be 192 bit.
            int lengthA = (estimatedKeyLengthInBit / 8) + 16;
            int lengthB = estimatedKeyLengthInBit % 8;
            if ((lengthA != keyToBeUnwrapped.Length) || (lengthB != 0)) {
                throw new XMLSecurityException("empty");
            }
            */

            // Decrypt the cipher text with TRIPLedeS in CBC mode using the KEK
            // and an initialization vector (IV) of 0x4adda22c79e82105. Call the output TEMP3.
            ParametersWithIV param2 = new ParametersWithIV(this.param, IV2);
            this.engine.Init(false, param2);

            byte [] TEMP3 = new byte[length];

			for (int currentBytePos = 0; currentBytePos != TEMP3.Length; currentBytePos += blockSize)
			{
				engine.ProcessBlock(input, inOff + currentBytePos, TEMP3, currentBytePos);
            }

            // Reverse the order of the octets in TEMP3 and call the result TEMP2.
            byte[] TEMP2 = reverse(TEMP3);

			// Decompose TEMP2 into IV, the first 8 octets, and TEMP1, the remaining octets.
            this.iv = new byte[8];
            byte[] TEMP1 = new byte[TEMP2.Length - 8];
            Array.Copy(TEMP2, 0, this.iv, 0, 8);
            Array.Copy(TEMP2, 8, TEMP1, 0, TEMP2.Length - 8);

            // Decrypt TEMP1 using TRIPLedeS in CBC mode using the KEK and the IV
            // found in the previous step. Call the result WKCKS.
            this.paramPlusIV = new ParametersWithIV(this.param, this.iv);
            this.engine.Init(false, this.paramPlusIV);

            byte[] WKCKS = new byte[TEMP1.Length];

            for (int currentBytePos = 0; currentBytePos != WKCKS.Length; currentBytePos += blockSize)
			{
                engine.ProcessBlock(TEMP1, currentBytePos, WKCKS, currentBytePos);
            }

            // Decompose WKCKS. CKS is the last 8 octets and WK, the wrapped key, are
            // those octets before the CKS.
            byte[] result = new byte[WKCKS.Length - 8];
            byte[] CKStoBeVerified = new byte[8];
            Array.Copy(WKCKS, 0, result, 0, WKCKS.Length - 8);
            Array.Copy(WKCKS, WKCKS.Length - 8, CKStoBeVerified, 0, 8);

            // Calculate a CMS Key Checksum, (section 5.6.1), over the WK and compare
            // with the CKS extracted in the above step. If they are not equal, return error.
            if (!CheckCmsKeyChecksum(result, CKStoBeVerified)) {
                throw new InvalidCipherTextException(
                    "Checksum inside ciphertext is corrupted");
            }

            // WK is the wrapped key, now extracted for use in data decryption.
            return result;
        }

		/**
        * Some key wrap algorithms make use of the Key Checksum defined
        * in CMS [CMS-Algorithms]. This is used to provide an integrity
        * check value for the key being wrapped. The algorithm is
        *
        * - Compute the 20 octet SHA-1 hash on the key being wrapped.
        * - Use the first 8 octets of this hash as the checksum value.
        *
        * @param key
        * @return
        * @throws Exception
        * @see http://www.w3.org/TR/xmlenc-core/#sec-CMSKeyChecksum
        */
        private byte[] CalculateCmsKeyChecksum(
            byte[] key)
        {
			sha1.BlockUpdate(key, 0, key.Length);
            sha1.DoFinal(digest, 0);

            byte[] result = new byte[8];
			Array.Copy(digest, 0, result, 0, 8);
			return result;
        }

		/**
        * @param key
        * @param checksum
        * @return
        * @see http://www.w3.org/TR/xmlenc-core/#sec-CMSKeyChecksum
        */
        private bool CheckCmsKeyChecksum(
            byte[]	key,
            byte[]	checksum)
        {
			return Arrays.ConstantTimeAreEqual(CalculateCmsKeyChecksum(key), checksum);
        }

		private static byte[] reverse(byte[] bs)
		{
			byte[] result = new byte[bs.Length];
			for (int i = 0; i < bs.Length; i++) 
			{
				result[i] = bs[bs.Length - (i + 1)];
			}
			return result;
		}
    }
}
