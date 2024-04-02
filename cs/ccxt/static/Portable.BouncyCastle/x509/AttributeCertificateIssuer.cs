using System;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities.Collections;

namespace Org.BouncyCastle.X509
{
	/**
	 * Carrying class for an attribute certificate issuer.
	 */
	public class AttributeCertificateIssuer
		//: CertSelector, Selector
		: ISelector<X509Certificate>
	{
		internal readonly Asn1Encodable form;

		/**
		 * Set the issuer directly with the ASN.1 structure.
		 *
		 * @param issuer The issuer
		 */
		public AttributeCertificateIssuer(
			AttCertIssuer issuer)
		{
			form = issuer.Issuer;
		}

		public AttributeCertificateIssuer(
			X509Name principal)
		{
//			form = new V2Form(GeneralNames.GetInstance(new DerSequence(new GeneralName(principal))));
			form = new V2Form(new GeneralNames(new GeneralName(principal)));
		}

		private object[] GetNames()
		{
			GeneralNames name;
			if (form is V2Form)
			{
				name = ((V2Form)form).IssuerName;
			}
			else
			{
				name = (GeneralNames)form;
			}

            GeneralName[] names = name.GetNames();

            int count = 0;
            for (int i = 0; i != names.Length; i++)
            {
                if (names[i].TagNo == GeneralName.DirectoryName)
                {
                    ++count;
                }
            }

            object[] result = new object[count];

            int pos = 0;
            for (int i = 0; i != names.Length; i++)
			{
				if (names[i].TagNo == GeneralName.DirectoryName)
				{
                    result[pos++] = X509Name.GetInstance(names[i].Name);
				}
			}

            return result;
        }

		/// <summary>Return any principal objects inside the attribute certificate issuer object.</summary>
		/// <returns>An array of IPrincipal objects (usually X509Principal).</returns>
		public X509Name[] GetPrincipals()
		{
			object[] p = this.GetNames();

            int count = 0;
            for (int i = 0; i != p.Length; i++)
            {
                if (p[i] is X509Name)
                {
                    ++count;
                }
            }

            X509Name[] result = new X509Name[count];

            int pos = 0;
			for (int i = 0; i != p.Length; i++)
			{
				if (p[i] is X509Name)
				{
					result[pos++] = (X509Name)p[i];
				}
			}

            return result;
		}

		private bool MatchesDN(
			X509Name		subject,
			GeneralNames	targets)
		{
			GeneralName[] names = targets.GetNames();

			for (int i = 0; i != names.Length; i++)
			{
				GeneralName gn = names[i];

				if (gn.TagNo == GeneralName.DirectoryName)
				{
					try
					{
						if (X509Name.GetInstance(gn.Name).Equivalent(subject))
						{
							return true;
						}
					}
					catch (Exception)
					{
					}
				}
			}

			return false;
		}

		public object Clone()
		{
			return new AttributeCertificateIssuer(AttCertIssuer.GetInstance(form));
		}

		public bool Match(X509Certificate x509Cert)
		{
			if (x509Cert == null)
				return false;

			if (form is V2Form)
			{
				V2Form issuer = (V2Form) form;
				if (issuer.BaseCertificateID != null)
				{
					return issuer.BaseCertificateID.Serial.HasValue(x509Cert.SerialNumber)
						&& MatchesDN(x509Cert.IssuerDN, issuer.BaseCertificateID.Issuer);
				}

				return MatchesDN(x509Cert.SubjectDN, issuer.IssuerName);
			}

			return MatchesDN(x509Cert.SubjectDN, (GeneralNames) form);
		}

		public override bool Equals(
			object obj)
		{
			if (obj == this)
			{
				return true;
			}

			if (!(obj is AttributeCertificateIssuer))
			{
				return false;
			}

			AttributeCertificateIssuer other = (AttributeCertificateIssuer)obj;

			return this.form.Equals(other.form);
		}

		public override int GetHashCode()
		{
			return this.form.GetHashCode();
		}
	}
}
