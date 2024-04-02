using System;

using Org.BouncyCastle.Asn1.X500;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.X509.SigI
{
	/**
	* Structure for a name or pseudonym.
	* 
	* <pre>
	*       NameOrPseudonym ::= CHOICE {
	*     	   surAndGivenName SEQUENCE {
	*     	     surName DirectoryString,
	*     	     givenName SEQUENCE OF DirectoryString 
	*         },
	*     	   pseudonym DirectoryString 
	*       }
	* </pre>
	* 
	* @see org.bouncycastle.asn1.x509.sigi.PersonalData
	* 
	*/
	public class NameOrPseudonym
		: Asn1Encodable, IAsn1Choice
	{
		private readonly DirectoryString	pseudonym;
		private readonly DirectoryString	surname;
		private readonly Asn1Sequence		givenName;

		public static NameOrPseudonym GetInstance(
			object obj)
		{
			if (obj == null || obj is NameOrPseudonym)
			{
				return (NameOrPseudonym)obj;
			}

			if (obj is IAsn1String)
			{
				return new NameOrPseudonym(DirectoryString.GetInstance(obj));
			}

			if (obj is Asn1Sequence)
			{
				return new NameOrPseudonym((Asn1Sequence) obj);
			}

            throw new ArgumentException("unknown object in factory: " + Platform.GetTypeName(obj), "obj");
		}

		/**
		* Constructor from DERString.
		* <p/>
		* The sequence is of type NameOrPseudonym:
		* <p/>
		* <pre>
		*       NameOrPseudonym ::= CHOICE {
		*     	   surAndGivenName SEQUENCE {
		*     	     surName DirectoryString,
		*     	     givenName SEQUENCE OF DirectoryString
		*         },
		*     	   pseudonym DirectoryString
		*       }
		* </pre>
		* @param pseudonym pseudonym value to use.
		*/
		public NameOrPseudonym(
			DirectoryString pseudonym)
		{
			this.pseudonym = pseudonym;
		}

		/**
		* Constructor from Asn1Sequence.
		* <p/>
		* The sequence is of type NameOrPseudonym:
		* <p/>
		* <pre>
		*       NameOrPseudonym ::= CHOICE {
		*     	   surAndGivenName SEQUENCE {
		*     	     surName DirectoryString,
		*     	     givenName SEQUENCE OF DirectoryString
		*         },
		*     	   pseudonym DirectoryString
		*       }
		* </pre>
		*
		* @param seq The ASN.1 sequence.
		*/
		private NameOrPseudonym(
			Asn1Sequence seq)
		{
			if (seq.Count != 2)
				throw new ArgumentException("Bad sequence size: " + seq.Count);

			if (!(seq[0] is IAsn1String))
                throw new ArgumentException("Bad object encountered: " + Platform.GetTypeName(seq[0]));

			surname = DirectoryString.GetInstance(seq[0]);
			givenName = Asn1Sequence.GetInstance(seq[1]);
		}

		/**
		* Constructor from a given details.
		*
		* @param pseudonym The pseudonym.
		*/
		public NameOrPseudonym(
			string pseudonym)
			: this(new DirectoryString(pseudonym))
		{
		}

		/**
		 * Constructor from a given details.
		 *
		 * @param surname   The surname.
		 * @param givenName A sequence of directory strings making up the givenName
		 */
		public NameOrPseudonym(
			DirectoryString	surname,
			Asn1Sequence	givenName)
		{
			this.surname = surname;
			this.givenName = givenName;
		}

		public DirectoryString Pseudonym
		{
			get { return pseudonym; }
		}

		public DirectoryString Surname
		{
			get { return surname; }
		}

		public DirectoryString[] GetGivenName()
		{
			DirectoryString[] items = new DirectoryString[givenName.Count];
			int count = 0;
			foreach (object o in givenName)
			{
				items[count++] = DirectoryString.GetInstance(o);
			}
			return items;
		}

		/**
		* Produce an object suitable for an Asn1OutputStream.
		* <p/>
		* Returns:
		* <p/>
		* <pre>
		*       NameOrPseudonym ::= CHOICE {
		*     	   surAndGivenName SEQUENCE {
		*     	     surName DirectoryString,
		*     	     givenName SEQUENCE OF DirectoryString
		*         },
		*     	   pseudonym DirectoryString
		*       }
		* </pre>
		*
		* @return an Asn1Object
		*/
		public override Asn1Object ToAsn1Object()
		{
			if (pseudonym != null)
			{
				return pseudonym.ToAsn1Object();
			}

			return new DerSequence(surname, givenName);
		}
	}
}
