using System;

using Org.BouncyCastle.Asn1.X500;

namespace Org.BouncyCastle.Asn1.Esf
{
	/**
	* Signer-Location attribute (RFC3126).
	*
	* <pre>
	*   SignerLocation ::= SEQUENCE {
	*       countryName        [0] DirectoryString OPTIONAL,
	*       localityName       [1] DirectoryString OPTIONAL,
	*       postalAddress      [2] PostalAddress OPTIONAL }
	*
	*   PostalAddress ::= SEQUENCE SIZE(1..6) OF DirectoryString
	* </pre>
	*/
	public class SignerLocation
		: Asn1Encodable
	{
        private DirectoryString countryName;
        private DirectoryString localityName;
        private Asn1Sequence postalAddress;

		public SignerLocation(Asn1Sequence seq)
		{
			foreach (Asn1TaggedObject obj in seq)
			{
				switch (obj.TagNo)
				{
				case 0:
					this.countryName = DirectoryString.GetInstance(obj, true);
					break;
				case 1:
                    this.localityName = DirectoryString.GetInstance(obj, true);
					break;
				case 2:
					bool isExplicit = obj.IsExplicit();	// handle erroneous implicitly tagged sequences
					this.postalAddress = Asn1Sequence.GetInstance(obj, isExplicit);
					if (postalAddress != null && postalAddress.Count > 6)
						throw new ArgumentException("postal address must contain less than 6 strings");
					break;
				default:
					throw new ArgumentException("illegal tag");
				}
			}
		}

        private SignerLocation(
            DirectoryString countryName,
            DirectoryString localityName,
            Asn1Sequence postalAddress)
        {
            if (postalAddress != null && postalAddress.Count > 6)
                throw new ArgumentException("postal address must contain less than 6 strings");

            this.countryName = countryName;
            this.localityName = localityName;
            this.postalAddress = postalAddress;
        }

        public SignerLocation(
            DirectoryString countryName,
            DirectoryString localityName,
            DirectoryString[] postalAddress)
            : this(countryName, localityName, new DerSequence(postalAddress))
        {
        }

        public SignerLocation(
            DerUtf8String countryName,
            DerUtf8String localityName,
            Asn1Sequence postalAddress)
            : this(DirectoryString.GetInstance(countryName), DirectoryString.GetInstance(localityName), postalAddress)
        {
        }

        public static SignerLocation GetInstance(object obj)
		{
			if (obj == null || obj is SignerLocation)
				return (SignerLocation) obj;

			return new SignerLocation(Asn1Sequence.GetInstance(obj));
		}

        public DirectoryString Country
        {
            get { return countryName; }
        }

        public DirectoryString Locality
        {
            get { return localityName; }
        }

        public DirectoryString[] GetPostal()
        {
            if (postalAddress == null)
                return null;

            DirectoryString[] dirStrings = new DirectoryString[postalAddress.Count];
            for (int i = 0; i != dirStrings.Length; i++)
            {
                dirStrings[i] = DirectoryString.GetInstance(postalAddress[i]);
            }

            return dirStrings;
        }

		public Asn1Sequence PostalAddress
		{
			get { return postalAddress; }
		}

		/**
		* <pre>
		*   SignerLocation ::= SEQUENCE {
		*       countryName        [0] DirectoryString OPTIONAL,
		*       localityName       [1] DirectoryString OPTIONAL,
		*       postalAddress      [2] PostalAddress OPTIONAL }
		*
		*   PostalAddress ::= SEQUENCE SIZE(1..6) OF DirectoryString
		*
		*   DirectoryString ::= CHOICE {
		*         teletexString           TeletexString (SIZE (1..MAX)),
		*         printableString         PrintableString (SIZE (1..MAX)),
		*         universalString         UniversalString (SIZE (1..MAX)),
		*         utf8String              UTF8String (SIZE (1.. MAX)),
		*         bmpString               BMPString (SIZE (1..MAX)) }
		* </pre>
		*/
		public override Asn1Object ToAsn1Object()
		{
			Asn1EncodableVector v = new Asn1EncodableVector();
            v.AddOptionalTagged(true, 0, countryName);
            v.AddOptionalTagged(true, 1, localityName);
            v.AddOptionalTagged(true, 2, postalAddress);
			return new DerSequence(v);
		}
	}
}
