using System;

using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Parameters
{
	public class RsaKeyParameters
		: AsymmetricKeyParameter
    {
        // Hexadecimal value of the product of the 131 smallest odd primes from 3 to 743
        private static readonly BigInteger SmallPrimesProduct = new BigInteger(
                  "8138e8a0fcf3a4e84a771d40fd305d7f4aa59306d7251de54d98af8fe95729a1f"
                + "73d893fa424cd2edc8636a6c3285e022b0e3866a565ae8108eed8591cd4fe8d2"
                + "ce86165a978d719ebf647f362d33fca29cd179fb42401cbaf3df0c614056f9c8"
                + "f3cfd51e474afb6bc6974f78db8aba8e9e517fded658591ab7502bd41849462f",
            16);

        private static BigInteger Validate(BigInteger modulus)
        {
            if ((modulus.IntValue & 1) == 0)
                throw new ArgumentException("RSA modulus is even", "modulus");
            if (!modulus.Gcd(SmallPrimesProduct).Equals(BigInteger.One))
                throw new ArgumentException("RSA modulus has a small prime factor");

            int maxBitLength = AsInteger("Org.BouncyCastle.Rsa.MaxSize", 15360);

            int modBitLength = modulus.BitLength;
            if (maxBitLength < modBitLength)
            {
                throw new ArgumentException("modulus value out of range");
            }
        
            // TODO: add additional primePower/Composite test - expensive!!

            return modulus;
        }

        private readonly BigInteger modulus;
        private readonly BigInteger exponent;

		public RsaKeyParameters(
            bool		isPrivate,
            BigInteger	modulus,
            BigInteger	exponent)
			: base(isPrivate)
        {
			if (modulus == null)
				throw new ArgumentNullException("modulus");
			if (exponent == null)
				throw new ArgumentNullException("exponent");
			if (modulus.SignValue <= 0)
				throw new ArgumentException("Not a valid RSA modulus", "modulus");
			if (exponent.SignValue <= 0)
				throw new ArgumentException("Not a valid RSA exponent", "exponent");
            if (!isPrivate && (exponent.IntValue & 1) == 0)
                throw new ArgumentException("RSA publicExponent is even", "exponent");

            this.modulus = Validate(modulus);
			this.exponent = exponent;
        }

		public BigInteger Modulus
        {
            get { return modulus; }
        }

		public BigInteger Exponent
        {
            get { return exponent; }
        }

		public override bool Equals(
			object obj)
        {
            RsaKeyParameters kp = obj as RsaKeyParameters;

			if (kp == null)
			{
				return false;
			}

			return kp.IsPrivate == this.IsPrivate
				&& kp.Modulus.Equals(this.modulus)
				&& kp.Exponent.Equals(this.exponent);
        }

		public override int GetHashCode()
        {
            return modulus.GetHashCode() ^ exponent.GetHashCode() ^ IsPrivate.GetHashCode();
        }

        internal static int AsInteger(string envVariable, int defaultValue)
        {
            string v = Platform.GetEnvironmentVariable(envVariable);

            if (v == null)
            {
                return defaultValue;
            }

            return int.Parse(v);
        }
    }
}
