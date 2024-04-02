using System;

using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.IsisMtt.X509
{
	/**
	* An Admissions structure.
	* <p/>
	* <pre>
	*            Admissions ::= SEQUENCE
	*            {
	*              admissionAuthority [0] EXPLICIT GeneralName OPTIONAL
	*              namingAuthority [1] EXPLICIT NamingAuthority OPTIONAL
	*              professionInfos SEQUENCE OF ProfessionInfo
	*            }
	* <p/>
	* </pre>
	*
	* @see Org.BouncyCastle.Asn1.IsisMtt.X509.AdmissionSyntax
	* @see Org.BouncyCastle.Asn1.IsisMtt.X509.ProfessionInfo
	* @see Org.BouncyCastle.Asn1.IsisMtt.X509.NamingAuthority
	*/
	public class Admissions
		: Asn1Encodable
	{
		private readonly GeneralName		admissionAuthority;
		private readonly NamingAuthority	namingAuthority;
		private readonly Asn1Sequence		professionInfos;

		public static Admissions GetInstance(object obj)
		{
			if (obj == null || obj is Admissions)
				return (Admissions)obj;

			if (obj is Asn1Sequence seq)
				return new Admissions(seq);

            throw new ArgumentException("unknown object in factory: " + Platform.GetTypeName(obj), "obj");
		}

		/**
		* Constructor from Asn1Sequence.
		* <p/>
		* The sequence is of type ProcurationSyntax:
		* <p/>
		* <pre>
		*            Admissions ::= SEQUENCE
		*            {
		*              admissionAuthority [0] EXPLICIT GeneralName OPTIONAL
		*              namingAuthority [1] EXPLICIT NamingAuthority OPTIONAL
		*              professionInfos SEQUENCE OF ProfessionInfo
		*            }
		* </pre>
		*
		* @param seq The ASN.1 sequence.
		*/
		private Admissions(Asn1Sequence seq)
		{
			if (seq.Count > 3)
				throw new ArgumentException("Bad sequence size: " + seq.Count);

			var e = seq.GetEnumerator();

			e.MoveNext();
			Asn1Encodable o = e.Current;
			if (o is Asn1TaggedObject tagged1)
			{
				switch (tagged1.TagNo)
				{
				case 0:
					admissionAuthority = GeneralName.GetInstance((Asn1TaggedObject)o, true);
					break;
				case 1:
					namingAuthority = NamingAuthority.GetInstance((Asn1TaggedObject)o, true);
					break;
				default:
					throw new ArgumentException("Bad tag number: " + ((Asn1TaggedObject)o).TagNo);
				}
				e.MoveNext();
				o = e.Current;
			}
			if (o is Asn1TaggedObject tagged2)
			{
				switch (tagged2.TagNo)
				{
				case 1:
					namingAuthority = NamingAuthority.GetInstance((Asn1TaggedObject)o, true);
					break;
				default:
					throw new ArgumentException("Bad tag number: " + ((Asn1TaggedObject)o).TagNo);
				}
				e.MoveNext();
				o = e.Current;
			}
			professionInfos = Asn1Sequence.GetInstance(o);
			if (e.MoveNext())
			{
                throw new ArgumentException("Bad object encountered: " + Platform.GetTypeName(e.Current));
			}
		}

		/**
		* Constructor from a given details.
		* <p/>
		* Parameter <code>professionInfos</code> is mandatory.
		*
		* @param admissionAuthority The admission authority.
		* @param namingAuthority    The naming authority.
		* @param professionInfos    The profession infos.
		*/
		public Admissions(
			GeneralName			admissionAuthority,
			NamingAuthority		namingAuthority,
			ProfessionInfo[]	professionInfos)
		{
			this.admissionAuthority = admissionAuthority;
			this.namingAuthority = namingAuthority;
			this.professionInfos = new DerSequence(professionInfos);
		}

		public virtual GeneralName AdmissionAuthority
		{
			get { return admissionAuthority; }
		}

		public virtual NamingAuthority NamingAuthority
		{
			get { return namingAuthority; }
		}

		public ProfessionInfo[] GetProfessionInfos()
		{
			ProfessionInfo[] infos = new ProfessionInfo[professionInfos.Count];
			int count = 0;
			foreach (Asn1Encodable ae in professionInfos)
			{
				infos[count++] = ProfessionInfo.GetInstance(ae);
			}
			return infos;
		}

		/**
		* Produce an object suitable for an Asn1OutputStream.
		* <p/>
		* Returns:
		* <p/>
		* <pre>
		*       Admissions ::= SEQUENCE
		*       {
		*         admissionAuthority [0] EXPLICIT GeneralName OPTIONAL
		*         namingAuthority [1] EXPLICIT NamingAuthority OPTIONAL
		*         professionInfos SEQUENCE OF ProfessionInfo
		*       }
		* <p/>
		* </pre>
		*
		* @return an Asn1Object
		*/
		public override Asn1Object ToAsn1Object()
		{
			Asn1EncodableVector v = new Asn1EncodableVector();
            v.AddOptionalTagged(true, 0, admissionAuthority);
            v.AddOptionalTagged(true, 1, namingAuthority);
			v.Add(professionInfos);
			return new DerSequence(v);
		}
	}
}
