using System;

using Org.BouncyCastle.Asn1.X500;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.IsisMtt.X509
{
	/**
	* Professions, specializations, disciplines, fields of activity, etc.
	* 
	* <pre>
	*               ProfessionInfo ::= SEQUENCE 
	*               {
	*                 namingAuthority [0] EXPLICIT NamingAuthority OPTIONAL,
	*                 professionItems SEQUENCE OF DirectoryString (SIZE(1..128)),
	*                 professionOids SEQUENCE OF OBJECT IDENTIFIER OPTIONAL,
	*                 registrationNumber PrintableString(SIZE(1..128)) OPTIONAL,
	*                 addProfessionInfo OCTET STRING OPTIONAL 
	*               }
	* </pre>
	* 
	* @see Org.BouncyCastle.Asn1.IsisMtt.X509.AdmissionSyntax
	*/
	public class ProfessionInfo
		: Asn1Encodable
	{
		/**
		* Rechtsanw�ltin
		*/
		public static readonly DerObjectIdentifier Rechtsanwltin = new DerObjectIdentifier(
			NamingAuthority.IdIsisMttATNamingAuthoritiesRechtWirtschaftSteuern + ".1");

		/**
		* Rechtsanwalt
		*/
		public static readonly DerObjectIdentifier Rechtsanwalt = new DerObjectIdentifier(
			NamingAuthority.IdIsisMttATNamingAuthoritiesRechtWirtschaftSteuern + ".2");

		/**
		* Rechtsbeistand
		*/
		public static readonly DerObjectIdentifier Rechtsbeistand = new DerObjectIdentifier(
			NamingAuthority.IdIsisMttATNamingAuthoritiesRechtWirtschaftSteuern + ".3");

		/**
		* Steuerberaterin
		*/
		public static readonly DerObjectIdentifier Steuerberaterin = new DerObjectIdentifier(
			NamingAuthority.IdIsisMttATNamingAuthoritiesRechtWirtschaftSteuern + ".4");

		/**
		* Steuerberater
		*/
		public static readonly DerObjectIdentifier Steuerberater = new DerObjectIdentifier(
			NamingAuthority.IdIsisMttATNamingAuthoritiesRechtWirtschaftSteuern + ".5");

		/**
		* Steuerbevollm�chtigte
		*/
		public static readonly DerObjectIdentifier Steuerbevollmchtigte = new DerObjectIdentifier(
			NamingAuthority.IdIsisMttATNamingAuthoritiesRechtWirtschaftSteuern + ".6");

		/**
		* Steuerbevollm�chtigter
		*/
		public static readonly DerObjectIdentifier Steuerbevollmchtigter = new DerObjectIdentifier(
			NamingAuthority.IdIsisMttATNamingAuthoritiesRechtWirtschaftSteuern + ".7");

		/**
		* Notarin
		*/
		public static readonly DerObjectIdentifier Notarin = new DerObjectIdentifier(
			NamingAuthority.IdIsisMttATNamingAuthoritiesRechtWirtschaftSteuern + ".8");

		/**
		* Notar
		*/
		public static readonly DerObjectIdentifier Notar = new DerObjectIdentifier(
			NamingAuthority.IdIsisMttATNamingAuthoritiesRechtWirtschaftSteuern + ".9");

		/**
		* Notarvertreterin
		*/
		public static readonly DerObjectIdentifier Notarvertreterin = new DerObjectIdentifier(
			NamingAuthority.IdIsisMttATNamingAuthoritiesRechtWirtschaftSteuern + ".10");

		/**
		* Notarvertreter
		*/
		public static readonly DerObjectIdentifier Notarvertreter = new DerObjectIdentifier(
			NamingAuthority.IdIsisMttATNamingAuthoritiesRechtWirtschaftSteuern + ".11");

		/**
		* Notariatsverwalterin
		*/
		public static readonly DerObjectIdentifier Notariatsverwalterin = new DerObjectIdentifier(
			NamingAuthority.IdIsisMttATNamingAuthoritiesRechtWirtschaftSteuern + ".12");

		/**
		* Notariatsverwalter
		*/
		public static readonly DerObjectIdentifier Notariatsverwalter = new DerObjectIdentifier(
			NamingAuthority.IdIsisMttATNamingAuthoritiesRechtWirtschaftSteuern + ".13");

		/**
		* Wirtschaftspr�ferin
		*/
		public static readonly DerObjectIdentifier Wirtschaftsprferin = new DerObjectIdentifier(
			NamingAuthority.IdIsisMttATNamingAuthoritiesRechtWirtschaftSteuern + ".14");

		/**
		* Wirtschaftspr�fer
		*/
		public static readonly DerObjectIdentifier Wirtschaftsprfer = new DerObjectIdentifier(
			NamingAuthority.IdIsisMttATNamingAuthoritiesRechtWirtschaftSteuern + ".15");

		/**
		* Vereidigte Buchpr�ferin
		*/
		public static readonly DerObjectIdentifier VereidigteBuchprferin = new DerObjectIdentifier(
			NamingAuthority.IdIsisMttATNamingAuthoritiesRechtWirtschaftSteuern + ".16");

		/**
		* Vereidigter Buchpr�fer
		*/
		public static readonly DerObjectIdentifier VereidigterBuchprfer = new DerObjectIdentifier(
			NamingAuthority.IdIsisMttATNamingAuthoritiesRechtWirtschaftSteuern + ".17");

		/**
		* Patentanw�ltin
		*/
		public static readonly DerObjectIdentifier Patentanwltin = new DerObjectIdentifier(
			NamingAuthority.IdIsisMttATNamingAuthoritiesRechtWirtschaftSteuern + ".18");

		/**
		* Patentanwalt
		*/
		public static readonly DerObjectIdentifier Patentanwalt = new DerObjectIdentifier(
			NamingAuthority.IdIsisMttATNamingAuthoritiesRechtWirtschaftSteuern + ".19");

		private readonly NamingAuthority	namingAuthority;
		private readonly Asn1Sequence		professionItems;
		private readonly Asn1Sequence		professionOids;
		private readonly string				registrationNumber;
		private readonly Asn1OctetString	addProfessionInfo;

		public static ProfessionInfo GetInstance(object obj)
		{
			if (obj == null || obj is ProfessionInfo)
				return (ProfessionInfo) obj;

			if (obj is Asn1Sequence seq)
				return new ProfessionInfo(seq);

            throw new ArgumentException("unknown object in factory: " + Platform.GetTypeName(obj), "obj");
		}

		/**
		* Constructor from Asn1Sequence.
		* <p/>
		* <p/>
		* <pre>
		*               ProfessionInfo ::= SEQUENCE
		*               {
		*                 namingAuthority [0] EXPLICIT NamingAuthority OPTIONAL,
		*                 professionItems SEQUENCE OF DirectoryString (SIZE(1..128)),
		*                 professionOids SEQUENCE OF OBJECT IDENTIFIER OPTIONAL,
		*                 registrationNumber PrintableString(SIZE(1..128)) OPTIONAL,
		*                 addProfessionInfo OCTET STRING OPTIONAL
		*               }
		* </pre>
		*
		* @param seq The ASN.1 sequence.
		*/
		private ProfessionInfo(Asn1Sequence seq)
		{
			if (seq.Count > 5)
				throw new ArgumentException("Bad sequence size: " + seq.Count);

			var e = seq.GetEnumerator();

			e.MoveNext();
			Asn1Encodable o = e.Current;

			if (o is Asn1TaggedObject ato)
			{
				if (ato.TagNo != 0)
					throw new ArgumentException("Bad tag number: " + ato.TagNo);

				namingAuthority = NamingAuthority.GetInstance(ato, true);
				e.MoveNext();
				o = e.Current;
			}

			professionItems = Asn1Sequence.GetInstance(o);

			if (e.MoveNext())
			{
				o = e.Current;
				if (o is Asn1Sequence sequence)
				{
					professionOids = sequence;
				}
				else if (o is DerPrintableString printable)
				{
					registrationNumber = printable.GetString();
				}
				else if (o is Asn1OctetString octets)
				{
					addProfessionInfo = octets;
				}
				else
				{
                    throw new ArgumentException("Bad object encountered: " + Platform.GetTypeName(o));
				}
			}

			if (e.MoveNext())
			{
				o = e.Current;
				if (o is DerPrintableString printable)
				{
					registrationNumber = printable.GetString();
				}
				else if (o is Asn1OctetString octets)
				{
					addProfessionInfo = octets;
				}
				else
				{
                    throw new ArgumentException("Bad object encountered: " + Platform.GetTypeName(o));
				}
			}

			if (e.MoveNext())
			{
				o = e.Current;
				if (o is Asn1OctetString octets)
				{
					addProfessionInfo = octets;
				}
				else
				{
                    throw new ArgumentException("Bad object encountered: " + Platform.GetTypeName(o));
				}
			}
		}

		/**
		* Constructor from given details.
		* <p/>
		* <code>professionItems</code> is mandatory, all other parameters are
		* optional.
		*
		* @param namingAuthority    The naming authority.
		* @param professionItems    Directory strings of the profession.
		* @param professionOids     DERObjectIdentfier objects for the
		*                           profession.
		* @param registrationNumber Registration number.
		* @param addProfessionInfo  Additional infos in encoded form.
		*/
		public ProfessionInfo(
			NamingAuthority			namingAuthority,
			DirectoryString[]		professionItems,
			DerObjectIdentifier[]	professionOids,
			string					registrationNumber,
			Asn1OctetString			addProfessionInfo)
		{
			this.namingAuthority = namingAuthority;
			this.professionItems = new DerSequence(professionItems);
			if (professionOids != null)
			{
				this.professionOids = new DerSequence(professionOids);
			}
			this.registrationNumber = registrationNumber;
			this.addProfessionInfo = addProfessionInfo;
		}

		/**
		* Produce an object suitable for an Asn1OutputStream.
		* <p/>
		* Returns:
		* <p/>
		* <pre>
		*               ProfessionInfo ::= SEQUENCE
		*               {
		*                 namingAuthority [0] EXPLICIT NamingAuthority OPTIONAL,
		*                 professionItems SEQUENCE OF DirectoryString (SIZE(1..128)),
		*                 professionOids SEQUENCE OF OBJECT IDENTIFIER OPTIONAL,
		*                 registrationNumber PrintableString(SIZE(1..128)) OPTIONAL,
		*                 addProfessionInfo OCTET STRING OPTIONAL
		*               }
		* </pre>
		*
		* @return an Asn1Object
		*/
        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector();
            v.AddOptionalTagged(true, 0, namingAuthority);
            v.Add(professionItems);
            v.AddOptional(professionOids);

            if (registrationNumber != null)
            {
                v.Add(new DerPrintableString(registrationNumber, true));
            }

            v.AddOptional(addProfessionInfo);
            return new DerSequence(v);
        }

		/**
		* @return Returns the addProfessionInfo.
		*/
		public virtual Asn1OctetString AddProfessionInfo
		{
			get { return addProfessionInfo; }
		}

		/**
		* @return Returns the namingAuthority.
		*/
		public virtual NamingAuthority NamingAuthority
		{
			get { return namingAuthority; }
		}

		/**
		* @return Returns the professionItems.
		*/
		public virtual DirectoryString[] GetProfessionItems()
		{
			DirectoryString[] result = new DirectoryString[professionItems.Count];

			for (int i = 0; i < professionItems.Count; ++i)
			{
				result[i] = DirectoryString.GetInstance(professionItems[i]);
			}

			return result;
		}

		/**
		* @return Returns the professionOids.
		*/
		public virtual DerObjectIdentifier[] GetProfessionOids()
		{
			if (professionOids == null)
			{
				return new DerObjectIdentifier[0];
			}

			DerObjectIdentifier[] result = new DerObjectIdentifier[professionOids.Count];

			for (int i = 0; i < professionOids.Count; ++i)
			{
				result[i] = DerObjectIdentifier.GetInstance(professionOids[i]);
			}

			return result;
		}

		/**
		* @return Returns the registrationNumber.
		*/
		public virtual string RegistrationNumber
		{
			get { return registrationNumber; }
		}
	}
}
