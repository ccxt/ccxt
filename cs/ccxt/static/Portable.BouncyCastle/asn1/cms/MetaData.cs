using System;

namespace Org.BouncyCastle.Asn1.Cms
{
	public class MetaData
		: Asn1Encodable
	{
		private DerBoolean hashProtected;
		private DerUtf8String fileName;
		private DerIA5String  mediaType;
		private Attributes otherMetaData;

		public MetaData(
			DerBoolean		hashProtected,
			DerUtf8String	fileName,
			DerIA5String	mediaType,
			Attributes		otherMetaData)
		{
			this.hashProtected = hashProtected;
			this.fileName = fileName;
			this.mediaType = mediaType;
			this.otherMetaData = otherMetaData;
		}

		private MetaData(Asn1Sequence seq)
		{
			this.hashProtected = DerBoolean.GetInstance(seq[0]);

			int index = 1;

			if (index < seq.Count && seq[index] is DerUtf8String)
			{
				this.fileName = DerUtf8String.GetInstance(seq[index++]);
			}
			if (index < seq.Count && seq[index] is DerIA5String)
			{
				this.mediaType = DerIA5String.GetInstance(seq[index++]);
			}
			if (index < seq.Count)
			{
				this.otherMetaData = Attributes.GetInstance(seq[index++]);
			}
		}

		public static MetaData GetInstance(object obj)
		{
			if (obj is MetaData)
				return (MetaData)obj;

			if (obj != null)
				return new MetaData(Asn1Sequence.GetInstance(obj));

			return null;
		}

		/**
		 * <pre>
		 * MetaData ::= SEQUENCE {
		 *   hashProtected        BOOLEAN,
		 *   fileName             UTF8String OPTIONAL,
		 *   mediaType            IA5String OPTIONAL,
		 *   otherMetaData        Attributes OPTIONAL
		 * }
		 * </pre>
		 * @return
		 */
		public override Asn1Object ToAsn1Object()
		{
			Asn1EncodableVector v = new Asn1EncodableVector(hashProtected);
			v.AddOptional(fileName, mediaType, otherMetaData);
			return new DerSequence(v);
		}

		public virtual bool IsHashProtected
		{
			get { return hashProtected.IsTrue; }
		}

		public virtual DerUtf8String FileName
		{
			get { return fileName; }
		}

		public virtual DerIA5String MediaType
		{
			get { return mediaType; }
		}

		public virtual Attributes OtherMetaData
		{
			get { return otherMetaData; }
		}
	}
}
