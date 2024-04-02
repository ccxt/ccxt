using System;

using Org.BouncyCastle.Asn1.Cmp;
using Org.BouncyCastle.Asn1.Cms;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Tsp
{
	public class TimeStampResp
		: Asn1Encodable
	{
		private readonly PkiStatusInfo	pkiStatusInfo;
		private readonly ContentInfo	timeStampToken;

        public static TimeStampResp GetInstance(object obj)
        {
            if (obj is TimeStampResp)
                return (TimeStampResp)obj;
            if (obj == null)
                return null;
            return new TimeStampResp(Asn1Sequence.GetInstance(obj));
        }

        private TimeStampResp(
			Asn1Sequence seq)
		{
			this.pkiStatusInfo = PkiStatusInfo.GetInstance(seq[0]);

			if (seq.Count > 1)
			{
				this.timeStampToken = ContentInfo.GetInstance(seq[1]);
			}
		}

		public TimeStampResp(
			PkiStatusInfo	pkiStatusInfo,
			ContentInfo		timeStampToken)
		{
			this.pkiStatusInfo = pkiStatusInfo;
			this.timeStampToken = timeStampToken;
		}

		public PkiStatusInfo Status
		{
			get { return pkiStatusInfo; }
		}

		public ContentInfo TimeStampToken
		{
			get { return timeStampToken; }
		}

		/**
		 * <pre>
		 * TimeStampResp ::= SEQUENCE  {
		 *   status                  PkiStatusInfo,
		 *   timeStampToken          TimeStampToken     OPTIONAL  }
		 * </pre>
		 */
        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector(pkiStatusInfo);
            v.AddOptional(timeStampToken);
            return new DerSequence(v);
        }
	}
}
