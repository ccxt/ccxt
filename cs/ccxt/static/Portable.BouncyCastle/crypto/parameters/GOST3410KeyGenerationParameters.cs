using System;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.CryptoPro;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Crypto.Parameters
{
	public class Gost3410KeyGenerationParameters
		: KeyGenerationParameters
	{
		private readonly Gost3410Parameters parameters;
		private readonly DerObjectIdentifier publicKeyParamSet;

		public Gost3410KeyGenerationParameters(
			SecureRandom random,
			Gost3410Parameters parameters)
			: base(random, parameters.P.BitLength - 1)
		{
			this.parameters = parameters;
		}

		public Gost3410KeyGenerationParameters(
			SecureRandom		random,
			DerObjectIdentifier	publicKeyParamSet)
			: this(random, LookupParameters(publicKeyParamSet))
		{
			this.publicKeyParamSet = publicKeyParamSet;
		}

		public Gost3410Parameters Parameters
		{
			get { return parameters; }
		}

		public DerObjectIdentifier PublicKeyParamSet
		{
			get { return publicKeyParamSet; }
		}

		private static Gost3410Parameters LookupParameters(
			DerObjectIdentifier publicKeyParamSet)
		{
			if (publicKeyParamSet == null)
				throw new ArgumentNullException("publicKeyParamSet");

			Gost3410ParamSetParameters p = Gost3410NamedParameters.GetByOid(publicKeyParamSet);

			if (p == null)
				throw new ArgumentException("OID is not a valid CryptoPro public key parameter set", "publicKeyParamSet");

			return new Gost3410Parameters(p.P, p.Q, p.A);
		}
	}
}
