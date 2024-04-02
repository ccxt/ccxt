using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.IsisMtt.X509
{
	/**
	* A declaration of majority.
	* <p/>
	* <pre>
	*           DeclarationOfMajoritySyntax ::= CHOICE
	*           {
	*             notYoungerThan [0] IMPLICIT INTEGER,
	*             fullAgeAtCountry [1] IMPLICIT SEQUENCE
	*             {
	*               fullAge BOOLEAN DEFAULT TRUE,
	*               country PrintableString (SIZE(2))
	*             }
	*             dateOfBirth [2] IMPLICIT GeneralizedTime
	*           }
	* </pre>
	* <p/>
	* fullAgeAtCountry indicates the majority of the owner with respect to the laws
	* of a specific country.
	*/
	public class DeclarationOfMajority
		: Asn1Encodable, IAsn1Choice
	{
		public enum Choice
		{
			NotYoungerThan = 0,
			FullAgeAtCountry = 1,
			DateOfBirth = 2
		};

		private readonly Asn1TaggedObject declaration;

		public DeclarationOfMajority(
			int notYoungerThan)
		{
			declaration = new DerTaggedObject(false, 0, new DerInteger(notYoungerThan));
		}

		public DeclarationOfMajority(
			bool	fullAge,
			string	country)
		{
			if (country.Length > 2)
				throw new ArgumentException("country can only be 2 characters");

			DerPrintableString countryString = new DerPrintableString(country, true);

			DerSequence seq;
			if (fullAge)
			{
				seq = new DerSequence(countryString);
			}
			else
			{
				seq = new DerSequence(DerBoolean.False, countryString);
			}

			this.declaration = new DerTaggedObject(false, 1, seq);
		}

		public DeclarationOfMajority(
			DerGeneralizedTime dateOfBirth)
		{
			this.declaration = new DerTaggedObject(false, 2, dateOfBirth);
		}

		public static DeclarationOfMajority GetInstance(
			object obj)
		{
			if (obj == null || obj is DeclarationOfMajority)
			{
				return (DeclarationOfMajority) obj;
			}

			if (obj is Asn1TaggedObject)
			{
				return new DeclarationOfMajority((Asn1TaggedObject) obj);
			}

            throw new ArgumentException("unknown object in factory: " + Platform.GetTypeName(obj), "obj");
		}

		private DeclarationOfMajority(
			Asn1TaggedObject o)
		{
			if (o.TagNo > 2)
				throw new ArgumentException("Bad tag number: " + o.TagNo);

			this.declaration = o;
		}

		/**
		* Produce an object suitable for an Asn1OutputStream.
		* <p/>
		* Returns:
		* <p/>
		* <pre>
		*           DeclarationOfMajoritySyntax ::= CHOICE
		*           {
		*             notYoungerThan [0] IMPLICIT INTEGER,
		*             fullAgeAtCountry [1] IMPLICIT SEQUENCE
		*             {
		*               fullAge BOOLEAN DEFAULT TRUE,
		*               country PrintableString (SIZE(2))
		*             }
		*             dateOfBirth [2] IMPLICIT GeneralizedTime
		*           }
		* </pre>
		*
		* @return an Asn1Object
		*/
		public override Asn1Object ToAsn1Object()
		{
			return declaration;
		}

		public Choice Type
		{
			get { return (Choice) declaration.TagNo; }
		}

		/**
		* @return notYoungerThan if that's what we are, -1 otherwise
		*/
		public virtual int NotYoungerThan
		{
			get
			{
				switch ((Choice) declaration.TagNo)
				{
					case Choice.NotYoungerThan:
                        return DerInteger.GetInstance(declaration, false).IntValueExact;
					default:
						return -1;
				}
			}
		}

		public virtual Asn1Sequence FullAgeAtCountry
		{
			get
			{
				switch ((Choice) declaration.TagNo)
				{
					case Choice.FullAgeAtCountry:
						return Asn1Sequence.GetInstance(declaration, false);
					default:
						return null;
				}
			}
		}

		public virtual DerGeneralizedTime DateOfBirth
		{
			get
			{
				switch ((Choice) declaration.TagNo)
				{
					case Choice.DateOfBirth:
						return DerGeneralizedTime.GetInstance(declaration, false);
					default:
						return null;
				}
			}
		}
	}
}
