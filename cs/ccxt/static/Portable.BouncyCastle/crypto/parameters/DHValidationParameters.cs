using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Parameters
{
    public class DHValidationParameters
    {
        private readonly byte[] seed;
        private readonly int counter;

		public DHValidationParameters(
            byte[]	seed,
            int		counter)
        {
			if (seed == null)
				throw new ArgumentNullException("seed");

			this.seed = (byte[]) seed.Clone();
            this.counter = counter;
        }

		public byte[] GetSeed()
        {
            return (byte[]) seed.Clone();
        }

		public int Counter
        {
            get { return counter; }
        }

		public override bool Equals(
            object obj)
        {
			if (obj == this)
				return true;

			DHValidationParameters other = obj as DHValidationParameters;

			if (other == null)
				return false;

			return Equals(other);
		}

		protected bool Equals(
			DHValidationParameters other)
		{
			return counter == other.counter
				&& Arrays.AreEqual(this.seed, other.seed);
		}

		public override int GetHashCode()
        {
			return counter.GetHashCode() ^ Arrays.GetHashCode(seed);
		}
    }
}
