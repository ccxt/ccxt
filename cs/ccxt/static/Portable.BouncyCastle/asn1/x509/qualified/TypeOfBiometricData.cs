using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.X509.Qualified
{
    /**
    * The TypeOfBiometricData object.
    * <pre>
    * TypeOfBiometricData ::= CHOICE {
    *   predefinedBiometricType   PredefinedBiometricType,
    *   biometricDataOid          OBJECT IDENTIFIER }
    *
    * PredefinedBiometricType ::= INTEGER {
    *   picture(0),handwritten-signature(1)}
    *   (picture|handwritten-signature)
    * </pre>
    */
    public class TypeOfBiometricData
        : Asn1Encodable, IAsn1Choice
    {
        public const int Picture				= 0;
        public const int HandwrittenSignature	= 1;

		internal Asn1Encodable obj;

		public static TypeOfBiometricData GetInstance(
			object obj)
        {
            if (obj == null || obj is TypeOfBiometricData)
            {
                return (TypeOfBiometricData) obj;
            }

			if (obj is DerInteger)
            {
                DerInteger predefinedBiometricTypeObj = DerInteger.GetInstance(obj);
                int predefinedBiometricType = predefinedBiometricTypeObj.IntValueExact;

				return new TypeOfBiometricData(predefinedBiometricType);
            }

			if (obj is DerObjectIdentifier)
            {
                DerObjectIdentifier BiometricDataOid = DerObjectIdentifier.GetInstance(obj);
                return new TypeOfBiometricData(BiometricDataOid);
            }

			throw new ArgumentException("unknown object in GetInstance: " + Platform.GetTypeName(obj), "obj");
		}

		public TypeOfBiometricData(
			int predefinedBiometricType)
        {
            if (predefinedBiometricType == Picture || predefinedBiometricType == HandwrittenSignature)
            {
                obj = new DerInteger(predefinedBiometricType);
            }
            else
            {
                throw new ArgumentException("unknow PredefinedBiometricType : " + predefinedBiometricType);
            }
        }

		public TypeOfBiometricData(
			DerObjectIdentifier biometricDataOid)
        {
            obj = biometricDataOid;
        }

		public bool IsPredefined
		{
			get { return obj is DerInteger; }
		}

		public int PredefinedBiometricType
		{
            get { return ((DerInteger)obj).IntValueExact; }
		}

		public DerObjectIdentifier BiometricDataOid
		{
			get { return (DerObjectIdentifier) obj; }
		}

		public override Asn1Object ToAsn1Object()
        {
            return obj.ToAsn1Object();
        }
    }
}
