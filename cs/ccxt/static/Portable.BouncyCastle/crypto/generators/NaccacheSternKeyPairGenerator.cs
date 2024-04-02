using System;
using System.Collections.Generic;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Crypto.Generators
{
	/**
	 * Key generation parameters for NaccacheStern cipher. For details on this cipher, please see
	 *
	 * http://www.gemplus.com/smart/rd/publications/pdf/NS98pkcs.pdf
	 */
	public class NaccacheSternKeyPairGenerator
		: IAsymmetricCipherKeyPairGenerator
	{
		private static readonly int[] smallPrimes =
		{
			3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67,
			71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149,
			151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233,
			239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331,
			337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431,
			433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523,
			541, 547, 557
		};

		private NaccacheSternKeyGenerationParameters param;

		/*
		 * (non-Javadoc)
		 *
		 * @see org.bouncycastle.crypto.AsymmetricCipherKeyPairGenerator#init(org.bouncycastle.crypto.KeyGenerationParameters)
		 */
		public void Init(KeyGenerationParameters parameters)
		{
			this.param = (NaccacheSternKeyGenerationParameters)parameters;
		}

		/*
		 * (non-Javadoc)
		 *
		 * @see org.bouncycastle.crypto.AsymmetricCipherKeyPairGenerator#generateKeyPair()
		 */
		public AsymmetricCipherKeyPair GenerateKeyPair()
		{
			int strength = param.Strength;
			SecureRandom rand = param.Random;
			int certainty = param.Certainty;

			var smallPrimes = FindFirstPrimes(param.CountSmallPrimes);

			smallPrimes = PermuteList(smallPrimes, rand);

			BigInteger u = BigInteger.One;
			BigInteger v = BigInteger.One;

			for (int i = 0; i < smallPrimes.Count / 2; i++)
			{
				u = u.Multiply((BigInteger)smallPrimes[i]);
			}
			for (int i = smallPrimes.Count / 2; i < smallPrimes.Count; i++)
			{
				v = v.Multiply((BigInteger)smallPrimes[i]);
			}

			BigInteger sigma = u.Multiply(v);

			// n = (2 a u _p + 1 ) ( 2 b v _q + 1)
			// -> |n| = strength
			// |2| = 1 in bits
			// -> |a| * |b| = |n| - |u| - |v| - |_p| - |_q| - |2| -|2|
			// remainingStrength = strength - sigma.bitLength() - _p.bitLength() -
			// _q.bitLength() - 1 -1
			int remainingStrength = strength - sigma.BitLength - 48;
			BigInteger a = GeneratePrime(remainingStrength / 2 + 1, certainty, rand);
			BigInteger b = GeneratePrime(remainingStrength / 2 + 1, certainty, rand);

			BigInteger _p;
			BigInteger _q;
			BigInteger p;
			BigInteger q;

			long tries = 0;

			BigInteger _2au = a.Multiply(u).ShiftLeft(1);
			BigInteger _2bv = b.Multiply(v).ShiftLeft(1);

			for (;;)
			{
				tries++;

				_p = GeneratePrime(24, certainty, rand);

				p = _p.Multiply(_2au).Add(BigInteger.One);

				if (!p.IsProbablePrime(certainty, true))
					continue;

				for (;;)
				{
					_q = GeneratePrime(24, certainty, rand);

					if (_p.Equals(_q))
						continue;

					q = _q.Multiply(_2bv).Add(BigInteger.One);

					if (q.IsProbablePrime(certainty, true))
						break;
				}

				if (!sigma.Gcd(_p.Multiply(_q)).Equals(BigInteger.One))
				{
                    //Console.WriteLine("sigma.gcd(_p.mult(_q)) != 1!\n _p: " + _p +"\n _q: "+ _q );
					continue;
				}

				if (p.Multiply(q).BitLength < strength)
				{
					continue;
				}
				break;
			}

			BigInteger n = p.Multiply(q);
			BigInteger phi_n = p.Subtract(BigInteger.One).Multiply(q.Subtract(BigInteger.One));
			BigInteger g;
			tries = 0;

			for (;;)
			{
				// TODO After the first loop, just regenerate one randomly-selected gPart each time?
				var gParts = new List<BigInteger>();
				for (int ind = 0; ind != smallPrimes.Count; ind++)
				{
					BigInteger i = smallPrimes[ind];
					BigInteger e = phi_n.Divide(i);

					for (;;)
					{
						tries++;

						g = GeneratePrime(strength, certainty, rand);

						if (!g.ModPow(e, n).Equals(BigInteger.One))
						{
							gParts.Add(g);
							break;
						}
					}
				}
				g = BigInteger.One;
				for (int i = 0; i < smallPrimes.Count; i++)
				{
					BigInteger gPart = (BigInteger) gParts[i];
					BigInteger smallPrime = (BigInteger) smallPrimes[i];
					g = g.Multiply(gPart.ModPow(sigma.Divide(smallPrime), n)).Mod(n);
				}

				// make sure that g is not divisible by p_i or q_i
				bool divisible = false;
				for (int i = 0; i < smallPrimes.Count; i++)
				{
					if (g.ModPow(phi_n.Divide((BigInteger)smallPrimes[i]), n).Equals(BigInteger.One))
					{
						divisible = true;
						break;
					}
				}

				if (divisible)
				{
					continue;
				}

				// make sure that g has order > phi_n/4

				//if (g.ModPow(phi_n.Divide(BigInteger.ValueOf(4)), n).Equals(BigInteger.One))
				if (g.ModPow(phi_n.ShiftRight(2), n).Equals(BigInteger.One))
				{
					continue;
				}

				if (g.ModPow(phi_n.Divide(_p), n).Equals(BigInteger.One))
				{
					continue;
				}
				if (g.ModPow(phi_n.Divide(_q), n).Equals(BigInteger.One))
				{
					continue;
				}
				if (g.ModPow(phi_n.Divide(a), n).Equals(BigInteger.One))
				{
					continue;
				}
				if (g.ModPow(phi_n.Divide(b), n).Equals(BigInteger.One))
				{
					continue;
				}
				break;
			}

			return new AsymmetricCipherKeyPair(new NaccacheSternKeyParameters(false, g, n, sigma.BitLength),
				new NaccacheSternPrivateKeyParameters(g, n, sigma.BitLength, smallPrimes, phi_n));
		}

		private static BigInteger GeneratePrime(int bitLength, int certainty, SecureRandom rand)
		{
			return new BigInteger(bitLength, certainty, rand);
		}

		/**
		 * Generates a permuted ArrayList from the original one. The original List
		 * is not modified
		 *
		 * @param arr
		 *            the ArrayList to be permuted
		 * @param rand
		 *            the source of Randomness for permutation
		 * @return a new IList with the permuted elements.
		 */
		private static IList<T> PermuteList<T>(IList<T> arr, SecureRandom rand)
		{
            // TODO Create a utility method for generating permutation of first 'n' integers

            var retval = new List<T>(arr.Count);

			foreach (var element in arr)
			{
				int index = rand.Next(retval.Count + 1);
				retval.Insert(index, element);
			}

			return retval;
		}

		/**
		 * Finds the first 'count' primes starting with 3
		 *
		 * @param count
		 *            the number of primes to find
		 * @return a vector containing the found primes as Integer
		 */
		private static IList<BigInteger> FindFirstPrimes(int count)
		{
			var primes = new List<BigInteger>(count);

			for (int i = 0; i != count; i++)
			{
				primes.Add(BigInteger.ValueOf(smallPrimes[i]));
			}

			return primes;
		}

	}
}
