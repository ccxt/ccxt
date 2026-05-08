using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Parameters
{
    public abstract class DsaKeyParameters
		: AsymmetricKeyParameter
    {
		private readonly DsaParameters parameters;

		protected DsaKeyParameters(
            bool			isPrivate,
            DsaParameters	parameters)
			: base(isPrivate)
        {
			// Note: parameters may be null
            this.parameters = parameters;
        }

		public DsaParameters Parameters
        {
            get { return parameters; }
        }

		public override bool Equals(
			object obj)
		{
			if (obj == this)
				return true;

			DsaKeyParameters other = obj as DsaKeyParameters;

			if (other == null)
				return false;

			return Equals(other);
		}

		protected bool Equals(
			DsaKeyParameters other)
		{
			return Platform.Equals(parameters, other.parameters)
				&& base.Equals(other);
		}

		public override int GetHashCode()
		{
			int hc = base.GetHashCode();

			if (parameters != null)
			{
				hc ^= parameters.GetHashCode();
			}

			return hc;
		}
    }
}
