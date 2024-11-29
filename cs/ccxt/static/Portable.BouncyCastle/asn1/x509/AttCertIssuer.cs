using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.X509
{
    public class AttCertIssuer
        : Asn1Encodable, IAsn1Choice
    {
        internal readonly Asn1Encodable	obj;
        internal readonly Asn1Object	choiceObj;

		public static AttCertIssuer GetInstance(
			object obj)
		{
			if (obj is AttCertIssuer)
			{
				return (AttCertIssuer)obj;
			}
			else if (obj is V2Form)
			{
				return new AttCertIssuer(V2Form.GetInstance(obj));
			}
			else if (obj is GeneralNames)
			{
				return new AttCertIssuer((GeneralNames)obj);
			}
			else if (obj is Asn1TaggedObject)
			{
				return new AttCertIssuer(V2Form.GetInstance((Asn1TaggedObject)obj, false));
			}
			else if (obj is Asn1Sequence)
			{
				return new AttCertIssuer(GeneralNames.GetInstance(obj));
			}

            throw new ArgumentException("unknown object in factory: " + Platform.GetTypeName(obj), "obj");
		}

		public static AttCertIssuer GetInstance(
			Asn1TaggedObject	obj,
			bool				isExplicit)
		{
			return GetInstance(obj.GetObject()); // must be explictly tagged
		}

		/// <summary>
		/// Don't use this one if you are trying to be RFC 3281 compliant.
		/// Use it for v1 attribute certificates only.
		/// </summary>
		/// <param name="names">Our GeneralNames structure</param>
		public AttCertIssuer(
			GeneralNames names)
		{
			obj = names;
			choiceObj = obj.ToAsn1Object();
		}

		public AttCertIssuer(
            V2Form v2Form)
        {
            obj = v2Form;
            choiceObj = new DerTaggedObject(false, 0, obj);
        }

		public Asn1Encodable Issuer
		{
			get { return obj; }
		}

		/**
         * Produce an object suitable for an Asn1OutputStream.
         * <pre>
         *  AttCertIssuer ::= CHOICE {
         *       v1Form   GeneralNames,  -- MUST NOT be used in this
         *                               -- profile
         *       v2Form   [0] V2Form     -- v2 only
         *  }
         * </pre>
         */
        public override Asn1Object ToAsn1Object()
        {
            return choiceObj;
        }
    }
}
