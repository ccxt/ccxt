using System;

using Org.BouncyCastle.Asn1.Cms;
using Org.BouncyCastle.Utilities.Collections;
using Org.BouncyCastle.X509;

namespace Org.BouncyCastle.Cms
{
	public class OriginatorInformation
	{
		private readonly OriginatorInfo originatorInfo;

		internal OriginatorInformation(OriginatorInfo originatorInfo)
		{
			this.originatorInfo = originatorInfo;
		}

		/**
		* Return the certificates stored in the underlying OriginatorInfo object.
		*
		* @return a Store of X509CertificateHolder objects.
		*/
		public virtual IStore<X509Certificate> GetCertificates()
		{
			return CmsSignedHelper.Instance.GetCertificates(originatorInfo.Certificates);
		}

		/**
		* Return the CRLs stored in the underlying OriginatorInfo object.
		*
		* @return a Store of X509CRLHolder objects.
		*/
		public virtual IStore<X509Crl> GetCrls()
		{
			return CmsSignedHelper.Instance.GetCrls(originatorInfo.Crls);
		}

		/**
		* Return the underlying ASN.1 object defining this SignerInformation object.
		*
		* @return a OriginatorInfo.
		*/
		public virtual OriginatorInfo ToAsn1Structure()
		{
			return originatorInfo;
		}
	}
}
