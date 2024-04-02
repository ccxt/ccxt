using System;

using Org.BouncyCastle.Asn1.X500;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.IsisMtt.X509
{
	/**
	* Some other restriction regarding the usage of this certificate.
	* <p/>
	* <pre>
	*  RestrictionSyntax ::= DirectoryString (SIZE(1..1024))
	* </pre>
	*/
	public class Restriction
		: Asn1Encodable
	{
		private readonly DirectoryString restriction;

		public static Restriction GetInstance(object obj)
		{
			if (obj is Restriction)
				return (Restriction) obj;

			if (obj is IAsn1String)
				return new Restriction(DirectoryString.GetInstance(obj));

            throw new ArgumentException("Unknown object in GetInstance: " + Platform.GetTypeName(obj), "obj");
		}

		/**
		* Constructor from DirectoryString.
		* <p/>
		* The DirectoryString is of type RestrictionSyntax:
		* <p/>
		* <pre>
		*      RestrictionSyntax ::= DirectoryString (SIZE(1..1024))
		* </pre>
		*
		* @param restriction A IAsn1String.
		*/
		private Restriction(DirectoryString restriction)
		{
			this.restriction = restriction;
		}

		/**
		* Constructor from a given details.
		*
		* @param restriction The description of the restriction.
		*/
		public Restriction(string restriction)
		{
			this.restriction = new DirectoryString(restriction);
		}

		public virtual DirectoryString RestrictionString
		{
			get { return restriction; }
		}

		/**
		* Produce an object suitable for an Asn1OutputStream.
		* <p/>
		* Returns:
		* <p/>
		* <pre>
		*      RestrictionSyntax ::= DirectoryString (SIZE(1..1024))
		* <p/>
		* </pre>
		*
		* @return an Asn1Object
		*/
		public override Asn1Object ToAsn1Object()
		{
			return restriction.ToAsn1Object();
		}
	}
}
