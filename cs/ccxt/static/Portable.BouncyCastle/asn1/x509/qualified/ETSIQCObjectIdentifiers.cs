using System;

using Org.BouncyCastle.Asn1;

namespace Org.BouncyCastle.Asn1.X509.Qualified
{
	public abstract class EtsiQCObjectIdentifiers
	{
		//
		// base id
		//
		public static readonly DerObjectIdentifier IdEtsiQcs                 = new DerObjectIdentifier("0.4.0.1862.1");

		public static readonly DerObjectIdentifier IdEtsiQcsQcCompliance     = new DerObjectIdentifier(IdEtsiQcs+".1");
		public static readonly DerObjectIdentifier IdEtsiQcsLimitValue       = new DerObjectIdentifier(IdEtsiQcs+".2");
		public static readonly DerObjectIdentifier IdEtsiQcsRetentionPeriod  = new DerObjectIdentifier(IdEtsiQcs+".3");
		public static readonly DerObjectIdentifier IdEtsiQcsQcSscd           = new DerObjectIdentifier(IdEtsiQcs+".4");
	}
}
