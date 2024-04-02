using System;

using Org.BouncyCastle.Asn1.X500;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.IsisMtt.X509
{
	/**
	* Attribute to indicate that the certificate holder may sign in the name of a
	* third person.
	* <p>
	* ISIS-MTT PROFILE: The corresponding ProcurationSyntax contains either the
	* name of the person who is represented (subcomponent thirdPerson) or a
	* reference to his/her base certificate (in the component signingFor,
	* subcomponent certRef), furthermore the optional components country and
	* typeSubstitution to indicate the country whose laws apply, and respectively
	* the type of procuration (e.g. manager, procuration, custody).
	* </p>
	* <p>
	* ISIS-MTT PROFILE: The GeneralName MUST be of type directoryName and MAY only
	* contain: - RFC3039 attributes, except pseudonym (countryName, commonName,
	* surname, givenName, serialNumber, organizationName, organizationalUnitName,
	* stateOrProvincename, localityName, postalAddress) and - SubjectDirectoryName
	* attributes (title, dateOfBirth, placeOfBirth, gender, countryOfCitizenship,
	* countryOfResidence and NameAtBirth).
	* </p>
	* <pre>
	*               ProcurationSyntax ::= SEQUENCE {
	*                 country [1] EXPLICIT PrintableString(SIZE(2)) OPTIONAL,
	*                 typeOfSubstitution [2] EXPLICIT DirectoryString (SIZE(1..128)) OPTIONAL,
	*                 signingFor [3] EXPLICIT SigningFor 
	*               }
	*               
	*               SigningFor ::= CHOICE 
	*               { 
	*                 thirdPerson GeneralName,
	*                 certRef IssuerSerial 
	*               }
	* </pre>
	* 
	*/
	public class ProcurationSyntax
		: Asn1Encodable
	{
		private readonly string				country;
		private readonly DirectoryString	typeOfSubstitution;
		private readonly GeneralName		thirdPerson;
		private readonly IssuerSerial		certRef;

		public static ProcurationSyntax GetInstance(object obj)
		{
			if (obj == null || obj is ProcurationSyntax)
				return (ProcurationSyntax) obj;

			if (obj is Asn1Sequence seq)
				return new ProcurationSyntax(seq);

            throw new ArgumentException("unknown object in factory: " + Platform.GetTypeName(obj), "obj");
		}

		/**
		* Constructor from Asn1Sequence.
		* <p/>
		* The sequence is of type ProcurationSyntax:
		* <p/>
		* <pre>
		*               ProcurationSyntax ::= SEQUENCE {
		*                 country [1] EXPLICIT PrintableString(SIZE(2)) OPTIONAL,
		*                 typeOfSubstitution [2] EXPLICIT DirectoryString (SIZE(1..128)) OPTIONAL,
		*                 signingFor [3] EXPLICIT SigningFor
		*               }
		* <p/>
		*               SigningFor ::= CHOICE
		*               {
		*                 thirdPerson GeneralName,
		*                 certRef IssuerSerial
		*               }
		* </pre>
		*
		* @param seq The ASN.1 sequence.
		*/
		private ProcurationSyntax(Asn1Sequence seq)
		{
			if (seq.Count < 1 || seq.Count > 3)
				throw new ArgumentException("Bad sequence size: " + seq.Count);

			var e = seq.GetEnumerator();

			while (e.MoveNext())
			{
				Asn1TaggedObject o = Asn1TaggedObject.GetInstance(e.Current);
				switch (o.TagNo)
				{
				case 1:
					country = DerPrintableString.GetInstance(o, true).GetString();
					break;
				case 2:
					typeOfSubstitution = DirectoryString.GetInstance(o, true);
					break;
				case 3:
					Asn1Object signingFor = o.GetObject();
					if (signingFor is Asn1TaggedObject)
					{
						thirdPerson = GeneralName.GetInstance(signingFor);
					}
					else
					{
						certRef = IssuerSerial.GetInstance(signingFor);
					}
					break;
				default:
					throw new ArgumentException("Bad tag number: " + o.TagNo);
				}
			}
		}

		/**
		* Constructor from a given details.
		* <p/>
		* <p/>
		* Either <code>generalName</code> or <code>certRef</code> MUST be
		* <code>null</code>.
		*
		* @param country            The country code whose laws apply.
		* @param typeOfSubstitution The type of procuration.
		* @param certRef            Reference to certificate of the person who is represented.
		*/
		public ProcurationSyntax(
			string			country,
			DirectoryString	typeOfSubstitution,
			IssuerSerial	certRef)
		{
			this.country = country;
			this.typeOfSubstitution = typeOfSubstitution;
			this.thirdPerson = null;
			this.certRef = certRef;
		}

		/**
		 * Constructor from a given details.
		 * <p/>
		 * <p/>
		 * Either <code>generalName</code> or <code>certRef</code> MUST be
		 * <code>null</code>.
		 *
		 * @param country            The country code whose laws apply.
		 * @param typeOfSubstitution The type of procuration.
		 * @param thirdPerson        The GeneralName of the person who is represented.
		 */
		public ProcurationSyntax(
			string			country,
			DirectoryString	typeOfSubstitution,
			GeneralName		thirdPerson)
		{
			this.country = country;
			this.typeOfSubstitution = typeOfSubstitution;
			this.thirdPerson = thirdPerson;
			this.certRef = null;
		}

		public virtual string Country
		{
			get { return country; }
		}

		public virtual DirectoryString TypeOfSubstitution
		{
			get { return typeOfSubstitution; }
		}

		public virtual GeneralName ThirdPerson
		{
			get { return thirdPerson; }
		}

		public virtual IssuerSerial CertRef
		{
			get { return certRef; }
		}

		/**
		* Produce an object suitable for an Asn1OutputStream.
		* <p/>
		* Returns:
		* <p/>
		* <pre>
		*               ProcurationSyntax ::= SEQUENCE {
		*                 country [1] EXPLICIT PrintableString(SIZE(2)) OPTIONAL,
		*                 typeOfSubstitution [2] EXPLICIT DirectoryString (SIZE(1..128)) OPTIONAL,
		*                 signingFor [3] EXPLICIT SigningFor
		*               }
		* <p/>
		*               SigningFor ::= CHOICE
		*               {
		*                 thirdPerson GeneralName,
		*                 certRef IssuerSerial
		*               }
		* </pre>
		*
		* @return an Asn1Object
		*/
		public override Asn1Object ToAsn1Object()
		{
            Asn1EncodableVector v = new Asn1EncodableVector();

            if (country != null)
            {
                v.Add(new DerTaggedObject(true, 1, new DerPrintableString(country, true)));
            }

            v.AddOptionalTagged(true, 2, typeOfSubstitution);

            if (thirdPerson != null)
            {
                v.Add(new DerTaggedObject(true, 3, thirdPerson));
            }
            else
            {
                v.Add(new DerTaggedObject(true, 3, certRef));
            }

            return new DerSequence(v);
		}
	}
}
