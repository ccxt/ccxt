using System;

namespace Org.BouncyCastle.Asn1.X509
{
    /**
     * Implementation of <code>IetfAttrSyntax</code> as specified by RFC3281.
     */
    public class IetfAttrSyntax
        : Asn1Encodable
    {
        public const int ValueOctets	= 1;
        public const int ValueOid		= 2;
        public const int ValueUtf8		= 3;

		internal readonly GeneralNames	policyAuthority;
        internal readonly Asn1EncodableVector values = new Asn1EncodableVector();

		internal int valueChoice = -1;

		/**
         *
         */
        public IetfAttrSyntax(
			Asn1Sequence seq)
        {
            int i = 0;

            if (seq[0] is Asn1TaggedObject)
            {
                policyAuthority = GeneralNames.GetInstance(((Asn1TaggedObject)seq[0]), false);
                i++;
            }
            else if (seq.Count == 2)
            { // VOMS fix
                policyAuthority = GeneralNames.GetInstance(seq[0]);
                i++;
            }

			if (!(seq[i] is Asn1Sequence))
            {
                throw new ArgumentException("Non-IetfAttrSyntax encoding");
            }

			seq = (Asn1Sequence) seq[i];

			foreach (Asn1Object obj in seq)
			{
                int type;

                if (obj is DerObjectIdentifier)
                {
                    type = ValueOid;
                }
                else if (obj is DerUtf8String)
                {
                    type = ValueUtf8;
                }
                else if (obj is DerOctetString)
                {
                    type = ValueOctets;
                }
                else
                {
                    throw new ArgumentException("Bad value type encoding IetfAttrSyntax");
                }

				if (valueChoice < 0)
                {
                    valueChoice = type;
                }

				if (type != valueChoice)
                {
                    throw new ArgumentException("Mix of value types in IetfAttrSyntax");
                }

				values.Add(obj);
            }
        }

		public GeneralNames PolicyAuthority
		{
			get { return policyAuthority; }
		}

		public int ValueType
		{
			get { return valueChoice; }
		}

		public object[] GetValues()
        {
            if (this.ValueType == ValueOctets)
            {
                Asn1OctetString[] tmp = new Asn1OctetString[values.Count];

				for (int i = 0; i != tmp.Length; i++)
                {
                    tmp[i] = (Asn1OctetString) values[i];
                }

				return tmp;
            }

			if (this.ValueType == ValueOid)
            {
                DerObjectIdentifier[] tmp = new DerObjectIdentifier[values.Count];

                for (int i = 0; i != tmp.Length; i++)
                {
                    tmp[i] = (DerObjectIdentifier) values[i];
                }

				return tmp;
            }

			{
				DerUtf8String[] tmp = new DerUtf8String[values.Count];

				for (int i = 0; i != tmp.Length; i++)
				{
					tmp[i] = (DerUtf8String) values[i];
				}

				return tmp;
			}
        }

		/**
         *
         * <pre>
         *
         *  IetfAttrSyntax ::= Sequence {
         *    policyAuthority [0] GeneralNames OPTIONAL,
         *    values Sequence OF CHOICE {
         *      octets OCTET STRING,
         *      oid OBJECT IDENTIFIER,
         *      string UTF8String
         *    }
         *  }
         *
         * </pre>
         */
        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector();
            v.AddOptionalTagged(true, 0, policyAuthority);
            v.Add(new DerSequence(values));
            return new DerSequence(v);
        }
    }
}
