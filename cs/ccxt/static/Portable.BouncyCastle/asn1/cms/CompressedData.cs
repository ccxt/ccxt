using System;

using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Cms
{
    /**
     * RFC 3274 - CMS Compressed Data.
     * <pre>
     * CompressedData ::= Sequence {
     *  version CMSVersion,
     *  compressionAlgorithm CompressionAlgorithmIdentifier,
     *  encapContentInfo EncapsulatedContentInfo
     * }
     * </pre>
     */
    public class CompressedData
        : Asn1Encodable
    {
        private DerInteger			version;
        private AlgorithmIdentifier	compressionAlgorithm;
        private ContentInfo			encapContentInfo;

		public CompressedData(
            AlgorithmIdentifier	compressionAlgorithm,
            ContentInfo			encapContentInfo)
        {
            this.version = new DerInteger(0);
            this.compressionAlgorithm = compressionAlgorithm;
            this.encapContentInfo = encapContentInfo;
        }

		public CompressedData(
            Asn1Sequence seq)
        {
            this.version = (DerInteger) seq[0];
            this.compressionAlgorithm = AlgorithmIdentifier.GetInstance(seq[1]);
            this.encapContentInfo = ContentInfo.GetInstance(seq[2]);
        }

		/**
         * return a CompressedData object from a tagged object.
         *
         * @param ato the tagged object holding the object we want.
         * @param explicitly true if the object is meant to be explicitly
         *              tagged false otherwise.
         * @exception ArgumentException if the object held by the
         *          tagged object cannot be converted.
         */
        public static CompressedData GetInstance(
            Asn1TaggedObject ato,
            bool explicitly)
        {
            return GetInstance(Asn1Sequence.GetInstance(ato, explicitly));
        }

        /**
         * return a CompressedData object from the given object.
         *
         * @param _obj the object we want converted.
         * @exception ArgumentException if the object cannot be converted.
         */
        public static CompressedData GetInstance(
            object obj)
        {
            if (obj == null || obj is CompressedData)
                return (CompressedData)obj;

			if (obj is Asn1Sequence)
                return new CompressedData((Asn1Sequence) obj);

            throw new ArgumentException("Invalid CompressedData: " + Platform.GetTypeName(obj));
        }

		public DerInteger Version
		{
			get { return version; }
		}

		public AlgorithmIdentifier CompressionAlgorithmIdentifier
		{
			get { return compressionAlgorithm; }
		}

		public ContentInfo EncapContentInfo
		{
			get { return encapContentInfo; }
		}

		public override Asn1Object ToAsn1Object()
        {
			return new BerSequence(version, compressionAlgorithm, encapContentInfo);
        }
    }
}
