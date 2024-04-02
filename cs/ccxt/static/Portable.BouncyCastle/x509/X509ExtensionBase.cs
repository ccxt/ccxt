using System;
using System.Collections.Generic;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.X509;

namespace Org.BouncyCastle.X509
{
	public abstract class X509ExtensionBase
		: IX509Extension
	{
		protected abstract X509Extensions GetX509Extensions();

		protected virtual ISet<string> GetExtensionOids(bool critical)
		{
			X509Extensions extensions = GetX509Extensions();
			if (extensions == null)
				return null;

			var set = new HashSet<string>();
			foreach (DerObjectIdentifier oid in extensions.ExtensionOids)
			{
				X509Extension ext = extensions.GetExtension(oid);
				if (ext.IsCritical == critical)
				{
					set.Add(oid.Id);
				}
			}
			return set;
		}

		/// <summary>
		/// Get non critical extensions.
		/// </summary>
		/// <returns>A set of non critical extension oids.</returns>
		public virtual ISet<string> GetNonCriticalExtensionOids()
		{
			return GetExtensionOids(false);
		}

		/// <summary>
		/// Get any critical extensions.
		/// </summary>
		/// <returns>A sorted list of critical entension.</returns>
		public virtual ISet<string> GetCriticalExtensionOids()
		{
			return GetExtensionOids(true);
		}

		public virtual Asn1OctetString GetExtensionValue(DerObjectIdentifier oid)
		{
			return GetX509Extensions()?.GetExtension(oid)?.Value;
		}
	}
}
