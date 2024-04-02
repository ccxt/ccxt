using System;
using System.Collections.Generic;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Cmp;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Cms;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.X509;

namespace Org.BouncyCastle.Cmp
{
    public class CertificateConfirmationContentBuilder
    {
        private static readonly DefaultSignatureAlgorithmIdentifierFinder sigAlgFinder = new DefaultSignatureAlgorithmIdentifierFinder();

        private readonly DefaultDigestAlgorithmIdentifierFinder digestAlgFinder;
        private readonly IList<X509Certificate> acceptedCerts = new List<X509Certificate>();
        private readonly IList<BigInteger> acceptedReqIds = new List<BigInteger>();

        public CertificateConfirmationContentBuilder()
            : this(new DefaultDigestAlgorithmIdentifierFinder())
        {
        }

        public CertificateConfirmationContentBuilder(DefaultDigestAlgorithmIdentifierFinder digestAlgFinder)
        {
            this.digestAlgFinder = digestAlgFinder;
        }

        public CertificateConfirmationContentBuilder AddAcceptedCertificate(X509Certificate certHolder,
            BigInteger certReqId)
        {
            acceptedCerts.Add(certHolder);
            acceptedReqIds.Add(certReqId);
            return this;
        }

        public CertificateConfirmationContent Build()
        {
            Asn1EncodableVector v = new Asn1EncodableVector();
            for (int i = 0; i != acceptedCerts.Count; i++)
            {
                X509Certificate cert = acceptedCerts[i];
                BigInteger reqId = acceptedReqIds[i];


                AlgorithmIdentifier algorithmIdentifier = sigAlgFinder.Find(cert.SigAlgName);

                AlgorithmIdentifier digAlg = digestAlgFinder.Find(algorithmIdentifier);
                if (null == digAlg)
                    throw new CmpException("cannot find algorithm for digest from signature");

                byte[] digest = DigestUtilities.CalculateDigest(digAlg.Algorithm, cert.GetEncoded());

                v.Add(new CertStatus(digest, reqId));
            }

            return new CertificateConfirmationContent(CertConfirmContent.GetInstance(new DerSequence(v)),
                digestAlgFinder);
        }
    }
}
