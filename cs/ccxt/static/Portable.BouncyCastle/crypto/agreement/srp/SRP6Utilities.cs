using System;

using Org.BouncyCastle.Math;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Agreement.Srp
{
	public class Srp6Utilities
	{
		public static BigInteger CalculateK(IDigest digest, BigInteger N, BigInteger g)
		{
			return HashPaddedPair(digest, N, N, g);
		}

	    public static BigInteger CalculateU(IDigest digest, BigInteger N, BigInteger A, BigInteger B)
	    {
	    	return HashPaddedPair(digest, N, A, B);
	    }

		public static BigInteger CalculateX(IDigest digest, BigInteger N, byte[] salt, byte[] identity, byte[] password)
	    {
	        byte[] output = new byte[digest.GetDigestSize()];

	        digest.BlockUpdate(identity, 0, identity.Length);
	        digest.Update((byte)':');
	        digest.BlockUpdate(password, 0, password.Length);
	        digest.DoFinal(output, 0);

	        digest.BlockUpdate(salt, 0, salt.Length);
	        digest.BlockUpdate(output, 0, output.Length);
	        digest.DoFinal(output, 0);

	        return new BigInteger(1, output);
	    }

		public static BigInteger GeneratePrivateValue(IDigest digest, BigInteger N, BigInteger g, SecureRandom random)
	    {
			int minBits = System.Math.Min(256, N.BitLength / 2);
	        BigInteger min = BigInteger.One.ShiftLeft(minBits - 1);
	        BigInteger max = N.Subtract(BigInteger.One);

	        return BigIntegers.CreateRandomInRange(min, max, random);
	    }

		public static BigInteger ValidatePublicValue(BigInteger N, BigInteger val)
		{
		    val = val.Mod(N);

	        // Check that val % N != 0
	        if (val.Equals(BigInteger.Zero))
	            throw new CryptoException("Invalid public value: 0");

		    return val;
		}

        /** 
         * Computes the client evidence message (M1) according to the standard routine:
         * M1 = H( A | B | S )
         * @param digest The Digest used as the hashing function H
         * @param N Modulus used to get the pad length
         * @param A The public client value
         * @param B The public server value
         * @param S The secret calculated by both sides
         * @return M1 The calculated client evidence message
         */
        public static BigInteger CalculateM1(IDigest digest, BigInteger N, BigInteger A, BigInteger B, BigInteger S)
        {
            BigInteger M1 = HashPaddedTriplet(digest, N, A, B, S);
            return M1;
        }

        /** 
         * Computes the server evidence message (M2) according to the standard routine:
         * M2 = H( A | M1 | S )
         * @param digest The Digest used as the hashing function H
         * @param N Modulus used to get the pad length
         * @param A The public client value
         * @param M1 The client evidence message
         * @param S The secret calculated by both sides
         * @return M2 The calculated server evidence message
         */
        public static BigInteger CalculateM2(IDigest digest, BigInteger N, BigInteger A, BigInteger M1, BigInteger S)
        {
            BigInteger M2 = HashPaddedTriplet(digest, N, A, M1, S);
            return M2;
        }

        /**
         * Computes the final Key according to the standard routine: Key = H(S)
         * @param digest The Digest used as the hashing function H
         * @param N Modulus used to get the pad length
         * @param S The secret calculated by both sides
         * @return
         */
        public static BigInteger CalculateKey(IDigest digest, BigInteger N, BigInteger S)
        {
            int padLength = (N.BitLength + 7) / 8;
            byte[] _S = GetPadded(S, padLength);
            digest.BlockUpdate(_S, 0, _S.Length);

            byte[] output = new byte[digest.GetDigestSize()];
            digest.DoFinal(output, 0);
            return new BigInteger(1, output);
        }

        private static BigInteger HashPaddedTriplet(IDigest digest, BigInteger N, BigInteger n1, BigInteger n2, BigInteger n3)
        {
            int padLength = (N.BitLength + 7) / 8;

            byte[] n1_bytes = GetPadded(n1, padLength);
            byte[] n2_bytes = GetPadded(n2, padLength);
            byte[] n3_bytes = GetPadded(n3, padLength);

            digest.BlockUpdate(n1_bytes, 0, n1_bytes.Length);
            digest.BlockUpdate(n2_bytes, 0, n2_bytes.Length);
            digest.BlockUpdate(n3_bytes, 0, n3_bytes.Length);

            byte[] output = new byte[digest.GetDigestSize()];
            digest.DoFinal(output, 0);

            return new BigInteger(1, output);
        }

        private static BigInteger HashPaddedPair(IDigest digest, BigInteger N, BigInteger n1, BigInteger n2)
		{
	    	int padLength = (N.BitLength + 7) / 8;

	    	byte[] n1_bytes = GetPadded(n1, padLength);
	    	byte[] n2_bytes = GetPadded(n2, padLength);

	        digest.BlockUpdate(n1_bytes, 0, n1_bytes.Length);
	        digest.BlockUpdate(n2_bytes, 0, n2_bytes.Length);

	        byte[] output = new byte[digest.GetDigestSize()];
	        digest.DoFinal(output, 0);

	        return new BigInteger(1, output);
		}

		private static byte[] GetPadded(BigInteger n, int length)
		{
			byte[] bs = BigIntegers.AsUnsignedByteArray(n);
			if (bs.Length < length)
			{
				byte[] tmp = new byte[length];
				Array.Copy(bs, 0, tmp, length - bs.Length, bs.Length);
				bs = tmp;
			}
			return bs;
		}
	}
}
