using System;

using Org.BouncyCastle.Asn1.Crmf;
using Org.BouncyCastle.Asn1.X509;

namespace Org.BouncyCastle.Asn1.Cmp
{
	public class RevRepContentBuilder
	{
		private readonly Asn1EncodableVector status = new Asn1EncodableVector();
		private readonly Asn1EncodableVector revCerts = new Asn1EncodableVector();
		private readonly Asn1EncodableVector crls = new Asn1EncodableVector();

		public virtual RevRepContentBuilder Add(PkiStatusInfo status)
		{
			this.status.Add(status);
			return this;
		}

		public virtual RevRepContentBuilder Add(PkiStatusInfo status, CertId certId)
		{
			if (this.status.Count != this.revCerts.Count)
				throw new InvalidOperationException("status and revCerts sequence must be in common order");

			this.status.Add(status);
			this.revCerts.Add(certId);
			return this;
		}

		public virtual RevRepContentBuilder AddCrl(CertificateList crl)
		{
			this.crls.Add(crl);
			return this;
		}

		public virtual RevRepContent Build()
		{
			Asn1EncodableVector v = new Asn1EncodableVector();

			v.Add(new DerSequence(status));

			if (revCerts.Count != 0)
			{
				v.Add(new DerTaggedObject(true, 0, new DerSequence(revCerts)));
			}

			if (crls.Count != 0)
			{
				v.Add(new DerTaggedObject(true, 1, new DerSequence(crls)));
			}

			return RevRepContent.GetInstance(new DerSequence(v));
		}
	}
}
