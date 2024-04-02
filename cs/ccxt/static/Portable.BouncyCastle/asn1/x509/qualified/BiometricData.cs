using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.X509.Qualified
{
    /**
    * The BiometricData object.
    * <pre>
    * BiometricData  ::=  SEQUENCE {
    *       typeOfBiometricData  TypeOfBiometricData,
    *       hashAlgorithm        AlgorithmIdentifier,
    *       biometricDataHash    OCTET STRING,
    *       sourceDataUri        IA5String OPTIONAL  }
    * </pre>
    */
    public class BiometricData
        : Asn1Encodable
    {
        private readonly TypeOfBiometricData typeOfBiometricData;
        private readonly AlgorithmIdentifier hashAlgorithm;
        private readonly Asn1OctetString     biometricDataHash;
        private readonly DerIA5String        sourceDataUri;

        public static BiometricData GetInstance(
            object obj)
        {
            if (obj == null || obj is BiometricData)
            {
                return (BiometricData)obj;
            }

            if (obj is Asn1Sequence)
            {
				return new BiometricData(Asn1Sequence.GetInstance(obj));
            }

			throw new ArgumentException("unknown object in GetInstance: " + Platform.GetTypeName(obj), "obj");
		}

		private BiometricData(
			Asn1Sequence seq)
        {
			typeOfBiometricData = TypeOfBiometricData.GetInstance(seq[0]);
			hashAlgorithm = AlgorithmIdentifier.GetInstance(seq[1]);
			biometricDataHash = Asn1OctetString.GetInstance(seq[2]);

			if (seq.Count > 3)
			{
				sourceDataUri = DerIA5String.GetInstance(seq[3]);
			}
        }

		public BiometricData(
            TypeOfBiometricData	typeOfBiometricData,
            AlgorithmIdentifier	hashAlgorithm,
            Asn1OctetString		biometricDataHash,
            DerIA5String		sourceDataUri)
        {
            this.typeOfBiometricData = typeOfBiometricData;
            this.hashAlgorithm = hashAlgorithm;
            this.biometricDataHash = biometricDataHash;
            this.sourceDataUri = sourceDataUri;
        }

        public BiometricData(
            TypeOfBiometricData	typeOfBiometricData,
            AlgorithmIdentifier	hashAlgorithm,
            Asn1OctetString		biometricDataHash)
        {
            this.typeOfBiometricData = typeOfBiometricData;
            this.hashAlgorithm = hashAlgorithm;
            this.biometricDataHash = biometricDataHash;
            this.sourceDataUri = null;
        }

        public TypeOfBiometricData TypeOfBiometricData
        {
			get { return typeOfBiometricData; }
        }

		public AlgorithmIdentifier HashAlgorithm
		{
			get { return hashAlgorithm; }
		}

		public Asn1OctetString BiometricDataHash
		{
			get { return biometricDataHash; }
		}

		public DerIA5String SourceDataUri
		{
			get { return sourceDataUri; }
		}

        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector(typeOfBiometricData, hashAlgorithm, biometricDataHash);
            v.AddOptional(sourceDataUri);
            return new DerSequence(v);
        }
    }
}
