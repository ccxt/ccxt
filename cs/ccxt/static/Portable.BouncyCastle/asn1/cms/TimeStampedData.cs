using System;

namespace Org.BouncyCastle.Asn1.Cms
{
	public class TimeStampedData
		: Asn1Encodable
	{
		private DerInteger version;
		private DerIA5String dataUri;
		private MetaData metaData;
		private Asn1OctetString content;
		private Evidence temporalEvidence;

		public TimeStampedData(DerIA5String dataUri, MetaData metaData, Asn1OctetString content,
			Evidence temporalEvidence)
		{
			this.version = new DerInteger(1);
			this.dataUri = dataUri;
			this.metaData = metaData;
			this.content = content;
			this.temporalEvidence = temporalEvidence;
		}

		private TimeStampedData(Asn1Sequence seq)
		{
			this.version = DerInteger.GetInstance(seq[0]);
			
			int index = 1;
			if (seq[index] is DerIA5String)
			{
				this.dataUri = DerIA5String.GetInstance(seq[index++]);
			}
			if (seq[index] is MetaData || seq[index] is Asn1Sequence)
			{
				this.metaData = MetaData.GetInstance(seq[index++]);
			}
			if (seq[index] is Asn1OctetString)
			{
				this.content = Asn1OctetString.GetInstance(seq[index++]);
			}
			this.temporalEvidence = Evidence.GetInstance(seq[index]);
		}

		public static TimeStampedData GetInstance(object obj)
		{
			if (obj is TimeStampedData)
				return (TimeStampedData)obj;

			if (obj != null)
				return new TimeStampedData(Asn1Sequence.GetInstance(obj));

			return null;
		}

		public virtual DerIA5String DataUri
		{
			get { return dataUri; }
		}

		public MetaData MetaData
		{
			get { return metaData; }
		}

		public Asn1OctetString Content
		{
			get { return content; }
		}

		public Evidence TemporalEvidence
		{
			get { return temporalEvidence; }
		}

		/**
		 * <pre>
		 * TimeStampedData ::= SEQUENCE {
		 *   version              INTEGER { v1(1) },
		 *   dataUri              IA5String OPTIONAL,
		 *   metaData             MetaData OPTIONAL,
		 *   content              OCTET STRING OPTIONAL,
		 *   temporalEvidence     Evidence
		 * }
		 * </pre>
		 * @return
		 */
		public override Asn1Object ToAsn1Object()
		{
			Asn1EncodableVector v = new Asn1EncodableVector(version);
			v.AddOptional(dataUri, metaData, content);
			v.Add(temporalEvidence);
			return new BerSequence(v);
		}
	}
}
