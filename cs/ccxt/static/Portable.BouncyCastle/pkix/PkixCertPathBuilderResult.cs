using System;
using System.Text;

using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Pkix;

namespace Org.BouncyCastle.Pkix
{
	/// <summary>
	/// Summary description for PkixCertPathBuilderResult.
	/// </summary>
	public class PkixCertPathBuilderResult
		: PkixCertPathValidatorResult//, ICertPathBuilderResult
	{
		private PkixCertPath certPath;
		
		public PkixCertPathBuilderResult(
			PkixCertPath			certPath,
			TrustAnchor				trustAnchor,
			PkixPolicyNode			policyTree,
			AsymmetricKeyParameter	subjectPublicKey)
			: base(trustAnchor, policyTree, subjectPublicKey)
		{			
			if (certPath == null)
				throw new ArgumentNullException("certPath");

			this.certPath = certPath;
		}

		public PkixCertPath CertPath
		{
            get { return certPath; }
		}

		public override string ToString()
		{
			StringBuilder sb = new StringBuilder();
			sb.AppendLine("SimplePKIXCertPathBuilderResult: [");
			sb.Append("  Certification Path: ").Append(CertPath).AppendLine();
			sb.Append("  Trust Anchor: ").Append(TrustAnchor.TrustedCert.IssuerDN).AppendLine();
			sb.Append("  Subject Public Key: ").Append(SubjectPublicKey).AppendLine();
			return sb.ToString();
		}
	}
}
