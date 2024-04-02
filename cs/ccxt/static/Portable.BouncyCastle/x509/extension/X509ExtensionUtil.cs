using System;

using Org.BouncyCastle.Asn1;

namespace Org.BouncyCastle.X509.Extension
{
	public class X509ExtensionUtilities
	{
		public static Asn1Object FromExtensionValue(Asn1OctetString extensionValue)
		{
			return Asn1Object.FromByteArray(extensionValue.GetOctets());
		}

		/// <summary>
		/// Extract the value of the given extension, if it exists.
		/// </summary>
		/// <param name="extensions">The extensions object.</param>
		/// <param name="oid">The object identifier to obtain.</param>
		/// <returns>Asn1Object</returns>
		/// <exception cref="Exception">if the extension cannot be read.</exception>
		public static Asn1Object FromExtensionValue(IX509Extension extensions, DerObjectIdentifier oid)
		{
			Asn1OctetString extensionValue = extensions.GetExtensionValue(oid);
			return extensionValue == null ? null : FromExtensionValue(extensionValue);	
		}
	}
}
