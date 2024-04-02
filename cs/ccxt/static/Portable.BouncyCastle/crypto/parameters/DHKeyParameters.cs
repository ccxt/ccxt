using System;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Pkcs;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Parameters
{
    public class DHKeyParameters
		: AsymmetricKeyParameter
    {
        private readonly DHParameters parameters;
		private readonly DerObjectIdentifier algorithmOid;

		protected DHKeyParameters(
            bool			isPrivate,
            DHParameters	parameters)
			: this(isPrivate, parameters, PkcsObjectIdentifiers.DhKeyAgreement)
        {
        }

		protected DHKeyParameters(
            bool				isPrivate,
            DHParameters		parameters,
			DerObjectIdentifier	algorithmOid)
			: base(isPrivate)
        {
			// TODO Should we allow parameters to be null?
            this.parameters = parameters;
			this.algorithmOid = algorithmOid;
        }

		public DHParameters Parameters
        {
            get { return parameters; }
        }

		public DerObjectIdentifier AlgorithmOid
		{
			get { return algorithmOid; }
		}

		public override bool Equals(
			object obj)
        {
			if (obj == this)
				return true;

			DHKeyParameters other = obj as DHKeyParameters;

			if (other == null)
				return false;

			return Equals(other);
        }

		protected bool Equals(
			DHKeyParameters other)
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
