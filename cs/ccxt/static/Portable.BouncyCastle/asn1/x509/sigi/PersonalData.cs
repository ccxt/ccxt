using System;

using Org.BouncyCastle.Asn1.X500;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.X509.SigI
{
	/**
	* Contains personal data for the otherName field in the subjectAltNames
	* extension.
	* <p/>
	* <pre>
	*     PersonalData ::= SEQUENCE {
	*       nameOrPseudonym NameOrPseudonym,
	*       nameDistinguisher [0] INTEGER OPTIONAL,
	*       dateOfBirth [1] GeneralizedTime OPTIONAL,
	*       placeOfBirth [2] DirectoryString OPTIONAL,
	*       gender [3] PrintableString OPTIONAL,
	*       postalAddress [4] DirectoryString OPTIONAL
	*       }
	* </pre>
	*
	* @see org.bouncycastle.asn1.x509.sigi.NameOrPseudonym
	* @see org.bouncycastle.asn1.x509.sigi.SigIObjectIdentifiers
	*/
	public class PersonalData
		: Asn1Encodable
	{
		private readonly NameOrPseudonym	nameOrPseudonym;
		private readonly BigInteger			nameDistinguisher;
		private readonly DerGeneralizedTime	dateOfBirth;
		private readonly DirectoryString	placeOfBirth;
		private readonly string				gender;
		private readonly DirectoryString	postalAddress;

		public static PersonalData GetInstance(
			object obj)
		{
			if (obj == null || obj is PersonalData)
			{
				return (PersonalData) obj;
			}

			if (obj is Asn1Sequence)
			{
				return new PersonalData((Asn1Sequence) obj);
			}

            throw new ArgumentException("unknown object in factory: " + Platform.GetTypeName(obj), "obj");
		}

		/**
		* Constructor from Asn1Sequence.
		* <p/>
		* The sequence is of type NameOrPseudonym:
		* <p/>
		* <pre>
		*     PersonalData ::= SEQUENCE {
		*       nameOrPseudonym NameOrPseudonym,
		*       nameDistinguisher [0] INTEGER OPTIONAL,
		*       dateOfBirth [1] GeneralizedTime OPTIONAL,
		*       placeOfBirth [2] DirectoryString OPTIONAL,
		*       gender [3] PrintableString OPTIONAL,
		*       postalAddress [4] DirectoryString OPTIONAL
		*       }
		* </pre>
		*
		* @param seq The ASN.1 sequence.
		*/
		private PersonalData(Asn1Sequence seq)
		{
			if (seq.Count < 1)
				throw new ArgumentException("Bad sequence size: " + seq.Count);

			var e = seq.GetEnumerator();
			e.MoveNext();

			nameOrPseudonym = NameOrPseudonym.GetInstance(e.Current);

			while (e.MoveNext())
			{
				Asn1TaggedObject o = Asn1TaggedObject.GetInstance(e.Current);
				int tag = o.TagNo;
				switch (tag)
				{
				case 0:
					nameDistinguisher = DerInteger.GetInstance(o, false).Value;
					break;
				case 1:
					dateOfBirth = DerGeneralizedTime.GetInstance(o, false);
					break;
				case 2:
					placeOfBirth = DirectoryString.GetInstance(o, true);
					break;
				case 3:
					gender = DerPrintableString.GetInstance(o, false).GetString();
					break;
				case 4:
					postalAddress = DirectoryString.GetInstance(o, true);
					break;
				default:
					throw new ArgumentException("Bad tag number: " + o.TagNo);
				}
			}
		}

		/**
		* Constructor from a given details.
		*
		* @param nameOrPseudonym  Name or pseudonym.
		* @param nameDistinguisher Name distinguisher.
		* @param dateOfBirth      Date of birth.
		* @param placeOfBirth     Place of birth.
		* @param gender           Gender.
		* @param postalAddress    Postal Address.
		*/
		public PersonalData(
			NameOrPseudonym		nameOrPseudonym,
			BigInteger			nameDistinguisher,
			DerGeneralizedTime	dateOfBirth,
			DirectoryString		placeOfBirth,
			string				gender,
			DirectoryString		postalAddress)
		{
			this.nameOrPseudonym = nameOrPseudonym;
			this.dateOfBirth = dateOfBirth;
			this.gender = gender;
			this.nameDistinguisher = nameDistinguisher;
			this.postalAddress = postalAddress;
			this.placeOfBirth = placeOfBirth;
		}

		public NameOrPseudonym NameOrPseudonym
		{
			get { return nameOrPseudonym; }
		}

		public BigInteger NameDistinguisher
		{
			get { return nameDistinguisher; }
		}

		public DerGeneralizedTime DateOfBirth
		{
			get { return dateOfBirth; }
		}

		public DirectoryString PlaceOfBirth
		{
			get { return placeOfBirth; }
		}

		public string Gender
		{
			get { return gender; }
		}

		public DirectoryString PostalAddress
		{
			get { return postalAddress; }
		}

		/**
		* Produce an object suitable for an Asn1OutputStream.
		* <p/>
		* Returns:
		* <p/>
		* <pre>
		*     PersonalData ::= SEQUENCE {
		*       nameOrPseudonym NameOrPseudonym,
		*       nameDistinguisher [0] INTEGER OPTIONAL,
		*       dateOfBirth [1] GeneralizedTime OPTIONAL,
		*       placeOfBirth [2] DirectoryString OPTIONAL,
		*       gender [3] PrintableString OPTIONAL,
		*       postalAddress [4] DirectoryString OPTIONAL
		*       }
		* </pre>
		*
		* @return an Asn1Object
		*/
        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector(nameOrPseudonym);

            if (null != nameDistinguisher)
            {
                v.Add(new DerTaggedObject(false, 0, new DerInteger(nameDistinguisher)));
            }

            v.AddOptionalTagged(false, 1, dateOfBirth);
            v.AddOptionalTagged(true, 2, placeOfBirth);

            if (null != gender)
            {
                v.Add(new DerTaggedObject(false, 3, new DerPrintableString(gender, true)));
            }

            v.AddOptionalTagged(true, 4, postalAddress);
            return new DerSequence(v);
        }
	}
}
