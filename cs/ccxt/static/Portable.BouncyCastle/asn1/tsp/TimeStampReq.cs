using System;

using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Tsp
{
	public class TimeStampReq
		: Asn1Encodable
	{
		private readonly DerInteger				version;
		private readonly MessageImprint			messageImprint;
		private readonly DerObjectIdentifier	tsaPolicy;
		private readonly DerInteger				nonce;
		private readonly DerBoolean				certReq;
		private readonly X509Extensions			extensions;

        public static TimeStampReq GetInstance(object obj)
        {
            if (obj is TimeStampReq)
                return (TimeStampReq)obj;
            if (obj == null)
                return null;
            return new TimeStampReq(Asn1Sequence.GetInstance(obj));
        }

        private TimeStampReq(
			Asn1Sequence seq)
		{
			int nbObjects = seq.Count;
			int seqStart = 0;

			// version
			version = DerInteger.GetInstance(seq[seqStart++]);

			// messageImprint
			messageImprint = MessageImprint.GetInstance(seq[seqStart++]);

			for (int opt = seqStart; opt < nbObjects; opt++)
			{
				// tsaPolicy
				if (seq[opt] is DerObjectIdentifier)
				{
					tsaPolicy = DerObjectIdentifier.GetInstance(seq[opt]);
				}
				// nonce
				else if (seq[opt] is DerInteger)
				{
					nonce = DerInteger.GetInstance(seq[opt]);
				}
				// certReq
				else if (seq[opt] is DerBoolean)
				{
					certReq = DerBoolean.GetInstance(seq[opt]);
				}
				// extensions
				else if (seq[opt] is Asn1TaggedObject)
				{
					Asn1TaggedObject tagged = (Asn1TaggedObject) seq[opt];
					if (tagged.TagNo == 0)
					{
						extensions = X509Extensions.GetInstance(tagged, false);
					}
				}
			}
		}

		public TimeStampReq(
			MessageImprint		messageImprint,
			DerObjectIdentifier	tsaPolicy,
			DerInteger			nonce,
			DerBoolean			certReq,
			X509Extensions		extensions)
		{
			// default
			this.version = new DerInteger(1);

			this.messageImprint = messageImprint;
			this.tsaPolicy = tsaPolicy;
			this.nonce = nonce;
			this.certReq = certReq;
			this.extensions = extensions;
		}

		public DerInteger Version
		{
			get { return version; }
		}

		public MessageImprint MessageImprint
		{
			get { return messageImprint; }
		}

		public DerObjectIdentifier ReqPolicy
		{
			get { return tsaPolicy; }
		}

		public DerInteger Nonce
		{
			get { return nonce; }
		}

		public DerBoolean CertReq
		{
			get { return certReq; }
		}

		public X509Extensions Extensions
		{
			get { return extensions; }
		}

		/**
		 * <pre>
		 * TimeStampReq ::= SEQUENCE  {
		 *  version                      INTEGER  { v1(1) },
		 *  messageImprint               MessageImprint,
		 *    --a hash algorithm OID and the hash value of the data to be
		 *    --time-stamped
		 *  reqPolicy             TSAPolicyId              OPTIONAL,
		 *  nonce                 INTEGER                  OPTIONAL,
		 *  certReq               BOOLEAN                  DEFAULT FALSE,
		 *  extensions            [0] IMPLICIT Extensions  OPTIONAL
		 * }
		 * </pre>
		 */
        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector(version, messageImprint);
            v.AddOptional(tsaPolicy, nonce);

            if (certReq != null && certReq.IsTrue)
            {
                v.Add(certReq);
            }

            v.AddOptionalTagged(false, 0, extensions);
            return new DerSequence(v);
        }
	}
}
