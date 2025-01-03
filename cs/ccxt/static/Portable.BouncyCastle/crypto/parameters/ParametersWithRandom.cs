using System;

using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Crypto.Parameters
{
    public class ParametersWithRandom
		: ICipherParameters
    {
        private readonly ICipherParameters	parameters;
		private readonly SecureRandom		random;

		public ParametersWithRandom(
            ICipherParameters	parameters,
            SecureRandom		random)
        {
			if (parameters == null)
				throw new ArgumentNullException("parameters");
			if (random == null)
				throw new ArgumentNullException("random");

			this.parameters = parameters;
			this.random = random;
		}

		public ParametersWithRandom(
            ICipherParameters parameters)
			: this(parameters, new SecureRandom())
        {
		}

		public SecureRandom Random
        {
			get { return random; }
        }

		public ICipherParameters Parameters
        {
            get { return parameters; }
        }
    }
}
