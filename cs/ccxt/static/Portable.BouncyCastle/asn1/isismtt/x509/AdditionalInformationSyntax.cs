using System;

using Org.BouncyCastle.Asn1.X500;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.IsisMtt.X509
{
	/**
	* Some other information of non-restrictive nature regarding the usage of this
	* certificate.
	* 
	* <pre>
	*    AdditionalInformationSyntax ::= DirectoryString (SIZE(1..2048))
	* </pre>
	*/
	public class AdditionalInformationSyntax
		: Asn1Encodable
	{
		private readonly DirectoryString information;

		public static AdditionalInformationSyntax GetInstance(
			object obj)
		{
			if (obj is AdditionalInformationSyntax)
				return (AdditionalInformationSyntax) obj;

			if (obj is IAsn1String)
				return new AdditionalInformationSyntax(DirectoryString.GetInstance(obj));

            throw new ArgumentException("Unknown object in GetInstance: " + Platform.GetTypeName(obj), "obj");
		}

		private AdditionalInformationSyntax(
			DirectoryString information)
		{
			this.information = information;
		}

		/**
		* Constructor from a given details.
		*
		* @param information The describtion of the information.
		*/
		public AdditionalInformationSyntax(
			string information)
		{
			this.information = new DirectoryString(information);
		}

		public virtual DirectoryString Information
		{
			get { return information; }
		}

		/**
		* Produce an object suitable for an Asn1OutputStream.
		* <p/>
		* Returns:
		* <p/>
		* <pre>
		*   AdditionalInformationSyntax ::= DirectoryString (SIZE(1..2048))
		* </pre>
		*
		* @return an Asn1Object
		*/
		public override Asn1Object ToAsn1Object()
		{
			return information.ToAsn1Object();
		}
	}
}
