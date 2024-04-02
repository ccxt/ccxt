using System;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Pkcs;

namespace Org.BouncyCastle.Pkcs
{
	public class Pkcs12StoreBuilder
	{
		private DerObjectIdentifier	keyAlgorithm = PkcsObjectIdentifiers.PbeWithShaAnd3KeyTripleDesCbc;
		private DerObjectIdentifier	certAlgorithm = PkcsObjectIdentifiers.PbewithShaAnd40BitRC2Cbc;
		private DerObjectIdentifier keyPrfAlgorithm = null;
		private bool useDerEncoding = false;

		public Pkcs12StoreBuilder()
		{
		}

		public Pkcs12Store Build()
		{
			return new Pkcs12Store(keyAlgorithm, keyPrfAlgorithm, certAlgorithm, useDerEncoding);
		}

		public Pkcs12StoreBuilder SetCertAlgorithm(DerObjectIdentifier certAlgorithm)
		{
			this.certAlgorithm = certAlgorithm;
			return this;
		}

		public Pkcs12StoreBuilder SetKeyAlgorithm(DerObjectIdentifier keyAlgorithm)
		{
			this.keyAlgorithm = keyAlgorithm;
			return this;
		}

		// Specify a PKCS#5 Scheme 2 encryption for keys
		public Pkcs12StoreBuilder SetKeyAlgorithm(DerObjectIdentifier keyAlgorithm, DerObjectIdentifier keyPrfAlgorithm)
		{
			this.keyAlgorithm = keyAlgorithm;
			this.keyPrfAlgorithm = keyPrfAlgorithm;
			return this;
		}
		public Pkcs12StoreBuilder SetUseDerEncoding(bool useDerEncoding)
		{
			this.useDerEncoding = useDerEncoding;
			return this;
		}
	}
}
