using System;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.X509;

namespace Org.BouncyCastle.X509
{
	/**
	 * A holding class for constructing an X509 Key Usage extension.
	 *
	 * <pre>
	 *    id-ce-keyUsage OBJECT IDENTIFIER ::=  { id-ce 15 }
	 *
	 *    KeyUsage ::= BIT STRING {
	 *         digitalSignature        (0),
	 *         nonRepudiation          (1),
	 *         keyEncipherment         (2),
	 *         dataEncipherment        (3),
	 *         keyAgreement            (4),
	 *         keyCertSign             (5),
	 *         cRLSign                 (6),
	 *         encipherOnly            (7),
	 *         decipherOnly            (8) }
	 * </pre>
	 */
	public class X509KeyUsage
		: Asn1Encodable
	{
		public const int DigitalSignature = 1 << 7;
		public const int NonRepudiation   = 1 << 6;
		public const int KeyEncipherment  = 1 << 5;
		public const int DataEncipherment = 1 << 4;
		public const int KeyAgreement     = 1 << 3;
		public const int KeyCertSign      = 1 << 2;
		public const int CrlSign          = 1 << 1;
		public const int EncipherOnly     = 1 << 0;
		public const int DecipherOnly     = 1 << 15;

		private readonly int usage;

		/**
		 * Basic constructor.
		 *
		 * @param usage - the bitwise OR of the Key Usage flags giving the
		 * allowed uses for the key.
		 * e.g. (X509KeyUsage.keyEncipherment | X509KeyUsage.dataEncipherment)
		 */
		public X509KeyUsage(
			int usage)
		{
			this.usage = usage;
		}

		public override Asn1Object ToAsn1Object()
		{
			return new KeyUsage(usage);
		}
	}
}
