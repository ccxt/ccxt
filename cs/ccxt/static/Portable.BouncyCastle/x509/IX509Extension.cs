using System;
using System.Collections.Generic;

using Org.BouncyCastle.Asn1;

namespace Org.BouncyCastle.X509
{
	public interface IX509Extension
	{
		/// <summary>
		/// Get all critical extension values, by oid
		/// </summary>
		/// <returns>IDictionary with string (OID) keys and Asn1OctetString values</returns>
		ISet<string> GetCriticalExtensionOids();

		/// <summary>
		/// Get all non-critical extension values, by oid
		/// </summary>
		/// <returns>IDictionary with string (OID) keys and Asn1OctetString values</returns>
		ISet<string> GetNonCriticalExtensionOids();

		Asn1OctetString GetExtensionValue(DerObjectIdentifier oid);
	}
}
