using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.X509
{
    /**
     * Generator for Version 2 TbsCertList structures.
     * <pre>
     *  TbsCertList  ::=  Sequence  {
     *       version                 Version OPTIONAL,
     *                                    -- if present, shall be v2
     *       signature               AlgorithmIdentifier,
     *       issuer                  Name,
     *       thisUpdate              Time,
     *       nextUpdate              Time OPTIONAL,
     *       revokedCertificates     Sequence OF Sequence  {
     *            userCertificate         CertificateSerialNumber,
     *            revocationDate          Time,
     *            crlEntryExtensions      Extensions OPTIONAL
     *                                          -- if present, shall be v2
     *                                 }  OPTIONAL,
     *       crlExtensions           [0]  EXPLICIT Extensions OPTIONAL
     *                                          -- if present, shall be v2
     *                                 }
     * </pre>
     *
     * <b>Note: This class may be subject to change</b>
     */
    public class V2TbsCertListGenerator
    {
        private DerInteger			version = new DerInteger(1);
        private AlgorithmIdentifier	signature;
        private X509Name			issuer;
        private Time				thisUpdate, nextUpdate;
        private X509Extensions		extensions;
        private List<Asn1Sequence>  crlEntries;

		public V2TbsCertListGenerator()
        {
        }

		public void SetSignature(
            AlgorithmIdentifier signature)
        {
            this.signature = signature;
        }

		public void SetIssuer(
            X509Name issuer)
        {
            this.issuer = issuer;
        }

		public void SetThisUpdate(
            DerUtcTime thisUpdate)
        {
            this.thisUpdate = new Time(thisUpdate);
        }

		public void SetNextUpdate(
            DerUtcTime nextUpdate)
        {
            this.nextUpdate = (nextUpdate != null)
				?	new Time(nextUpdate)
				:	null;
        }

		public void SetThisUpdate(
            Time thisUpdate)
        {
            this.thisUpdate = thisUpdate;
        }

		public void SetNextUpdate(
            Time nextUpdate)
        {
            this.nextUpdate = nextUpdate;
        }

		public void AddCrlEntry(Asn1Sequence crlEntry)
		{
			if (crlEntries == null)
			{
                crlEntries = new List<Asn1Sequence>();
			}

			crlEntries.Add(crlEntry);
		}

		public void AddCrlEntry(DerInteger userCertificate, DerUtcTime revocationDate, int reason)
		{
			AddCrlEntry(userCertificate, new Time(revocationDate), reason);
		}

		public void AddCrlEntry(DerInteger userCertificate, Time revocationDate, int reason)
		{
			AddCrlEntry(userCertificate, revocationDate, reason, null);
		}

		public void AddCrlEntry(DerInteger userCertificate, Time revocationDate, int reason,
			DerGeneralizedTime invalidityDate)
		{
            var extOids = new List<DerObjectIdentifier>();
            var extValues = new List<X509Extension>();

			if (reason != 0)
			{
				CrlReason crlReason = new CrlReason(reason);

				try
				{
					extOids.Add(X509Extensions.ReasonCode);
					extValues.Add(new X509Extension(false, new DerOctetString(crlReason.GetEncoded())));
				}
				catch (IOException e)
				{
					throw new ArgumentException("error encoding reason: " + e);
				}
			}

			if (invalidityDate != null)
			{
				try
				{
					extOids.Add(X509Extensions.InvalidityDate);
					extValues.Add(new X509Extension(false, new DerOctetString(invalidityDate.GetEncoded())));
				}
				catch (IOException e)
				{
					throw new ArgumentException("error encoding invalidityDate: " + e);
				}
			}

			if (extOids.Count != 0)
			{
				AddCrlEntry(userCertificate, revocationDate, new X509Extensions(extOids, extValues));
			}
			else
			{
				AddCrlEntry(userCertificate, revocationDate, null);
			}
		}

		public void AddCrlEntry(DerInteger userCertificate, Time revocationDate, X509Extensions extensions)
		{
			Asn1EncodableVector v = new Asn1EncodableVector(userCertificate, revocationDate);

			if (extensions != null)
			{
				v.Add(extensions);
			}

			AddCrlEntry(new DerSequence(v));
		}

		public void SetExtensions(
            X509Extensions extensions)
        {
            this.extensions = extensions;
        }

		public TbsCertificateList GenerateTbsCertList()
        {
            if ((signature == null) || (issuer == null) || (thisUpdate == null))
            {
                throw new InvalidOperationException("Not all mandatory fields set in V2 TbsCertList generator.");
            }

			Asn1EncodableVector v = new Asn1EncodableVector(
				version, signature, issuer, thisUpdate);

			if (nextUpdate != null)
            {
                v.Add(nextUpdate);
            }

			// Add CRLEntries if they exist
            if (crlEntries != null)
            {
				v.Add(new DerSequence(crlEntries.ToArray()));
            }

			if (extensions != null)
            {
                v.Add(new DerTaggedObject(0, extensions));
            }

			return new TbsCertificateList(new DerSequence(v));
        }
    }
}
