using System;

using Org.BouncyCastle.Asn1.X500;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.IsisMtt.X509
{
	/**
	* Names of authorities which are responsible for the administration of title
	* registers.
	* 
	* <pre>
	*             NamingAuthority ::= SEQUENCE 
	*             {
	*               namingAuthorityID OBJECT IDENTIFIER OPTIONAL,
	*               namingAuthorityUrl IA5String OPTIONAL,
	*               namingAuthorityText DirectoryString(SIZE(1..128)) OPTIONAL
	*             }
	* </pre>
	* @see Org.BouncyCastle.Asn1.IsisMtt.X509.AdmissionSyntax
	* 
	*/
	public class NamingAuthority
		: Asn1Encodable
	{
		/**
		* Profession OIDs should always be defined under the OID branch of the
		* responsible naming authority. At the time of this writing, the work group
		* �Recht, Wirtschaft, Steuern� (�Law, Economy, Taxes�) is registered as the
		* first naming authority under the OID id-isismtt-at-namingAuthorities.
		*/
		public static readonly DerObjectIdentifier IdIsisMttATNamingAuthoritiesRechtWirtschaftSteuern
			= new DerObjectIdentifier(IsisMttObjectIdentifiers.IdIsisMttATNamingAuthorities + ".1");

		private readonly DerObjectIdentifier	namingAuthorityID;
		private readonly string					namingAuthorityUrl;
		private readonly DirectoryString		namingAuthorityText;

		public static NamingAuthority GetInstance(object obj)
		{
			if (obj == null || obj is NamingAuthority)
				return (NamingAuthority) obj;

			if (obj is Asn1Sequence seq)
				return new NamingAuthority(seq);

            throw new ArgumentException("unknown object in factory: " + Platform.GetTypeName(obj), "obj");
		}

		public static NamingAuthority GetInstance(Asn1TaggedObject obj, bool isExplicit)
		{
			return GetInstance(Asn1Sequence.GetInstance(obj, isExplicit));
		}

		/**
		* Constructor from Asn1Sequence.
		* <p/>
		* <p/>
		* <pre>
		*             NamingAuthority ::= SEQUENCE
		*             {
		*               namingAuthorityID OBJECT IDENTIFIER OPTIONAL,
		*               namingAuthorityUrl IA5String OPTIONAL,
		*               namingAuthorityText DirectoryString(SIZE(1..128)) OPTIONAL
		*             }
		* </pre>
		*
		* @param seq The ASN.1 sequence.
		*/
		private NamingAuthority(Asn1Sequence seq)
		{
			if (seq.Count > 3)
				throw new ArgumentException("Bad sequence size: " + seq.Count);

			var e = seq.GetEnumerator();

			if (e.MoveNext())
			{
				Asn1Encodable o = e.Current;
				if (o is DerObjectIdentifier oid)
				{
					namingAuthorityID = oid;
				}
				else if (o is DerIA5String ia5)
				{
					namingAuthorityUrl = ia5.GetString();
				}
				else if (o is IAsn1String)
				{
					namingAuthorityText = DirectoryString.GetInstance(o);
				}
				else
				{
                    throw new ArgumentException("Bad object encountered: " + Platform.GetTypeName(o));
				}
			}

			if (e.MoveNext())
			{
				Asn1Encodable o = e.Current;
				if (o is DerIA5String ia5)
				{
					namingAuthorityUrl = ia5.GetString();
				}
				else if (o is IAsn1String)
				{
					namingAuthorityText = DirectoryString.GetInstance(o);
				}
				else
				{
                    throw new ArgumentException("Bad object encountered: " + Platform.GetTypeName(o));
				}
			}

			if (e.MoveNext())
			{
				Asn1Encodable o = e.Current;
				if (o is IAsn1String)
				{
					namingAuthorityText = DirectoryString.GetInstance(o);
				}
				else
				{
                    throw new ArgumentException("Bad object encountered: " + Platform.GetTypeName(o));
				}
			}
		}

		/**
		* @return Returns the namingAuthorityID.
		*/
		public virtual DerObjectIdentifier NamingAuthorityID
		{
			get { return namingAuthorityID; }
		}

		/**
		* @return Returns the namingAuthorityText.
		*/
		public virtual DirectoryString NamingAuthorityText
		{
			get { return namingAuthorityText; }
		}

		/**
		* @return Returns the namingAuthorityUrl.
		*/
		public virtual string NamingAuthorityUrl
		{
			get { return namingAuthorityUrl; }
		}

		/**
		* Constructor from given details.
		* <p/>
		* All parameters can be combined.
		*
		* @param namingAuthorityID   ObjectIdentifier for naming authority.
		* @param namingAuthorityUrl  URL for naming authority.
		* @param namingAuthorityText Textual representation of naming authority.
		*/
		public NamingAuthority(
			DerObjectIdentifier	namingAuthorityID,
			string				namingAuthorityUrl,
			DirectoryString		namingAuthorityText)
		{
			this.namingAuthorityID = namingAuthorityID;
			this.namingAuthorityUrl = namingAuthorityUrl;
			this.namingAuthorityText = namingAuthorityText;
		}

		/**
		* Produce an object suitable for an Asn1OutputStream.
		* <p/>
		* Returns:
		* <p/>
		* <pre>
		*             NamingAuthority ::= SEQUENCE
		*             {
		*               namingAuthorityID OBJECT IDENTIFIER OPTIONAL,
		*               namingAuthorityUrl IA5String OPTIONAL,
		*               namingAuthorityText DirectoryString(SIZE(1..128)) OPTIONAL
		*             }
		* </pre>
		*
		* @return an Asn1Object
		*/
		public override Asn1Object ToAsn1Object()
		{
			Asn1EncodableVector v = new Asn1EncodableVector();
            v.AddOptional(namingAuthorityID);

			if (namingAuthorityUrl != null)
			{
				v.Add(new DerIA5String(namingAuthorityUrl, true));
			}

            v.AddOptional(namingAuthorityText);
			return new DerSequence(v);
		}
	}
}
