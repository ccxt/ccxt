using System;
using System.IO;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1
{
    public class DerGeneralString
        : DerStringBase
    {
        internal class Meta : Asn1UniversalType 
        {
            internal static readonly Asn1UniversalType Instance = new Meta();

            private Meta() : base(typeof(DerGeneralString), Asn1Tags.GeneralString) {}

            internal override Asn1Object FromImplicitPrimitive(DerOctetString octetString)
            {
                return CreatePrimitive(octetString.GetOctets());
            }
        }

        public static DerGeneralString GetInstance(object obj)
        {
            if (obj == null || obj is DerGeneralString)
            {
                return (DerGeneralString) obj;
            }
            else if (obj is IAsn1Convertible)
            {
                Asn1Object asn1Object = ((IAsn1Convertible)obj).ToAsn1Object();
                if (asn1Object is DerGeneralString)
                    return (DerGeneralString)asn1Object;
            }
            else if (obj is byte[])
            {
                try
                {
                    return (DerGeneralString)Meta.Instance.FromByteArray((byte[])obj);
                }
                catch (IOException e)
                {
                    throw new ArgumentException("failed to construct general string from byte[]: " + e.Message);
                }
            }

            throw new ArgumentException("illegal object in GetInstance: " + Platform.GetTypeName(obj));
        }

        public static DerGeneralString GetInstance(Asn1TaggedObject taggedObject, bool declaredExplicit)
        {
            return (DerGeneralString)Meta.Instance.GetContextInstance(taggedObject, declaredExplicit);
        }

        private readonly byte[] m_contents;

		public DerGeneralString(string str)
        {
			if (str == null)
				throw new ArgumentNullException("str");

			m_contents = Strings.ToAsciiByteArray(str);
        }

        public DerGeneralString(byte[] contents)
            : this(contents, true)
        {
        }

        internal DerGeneralString(byte[] contents, bool clone)
        {
            if (null == contents)
                throw new ArgumentNullException("contents");

            m_contents = clone ? Arrays.Clone(contents) : contents;
        }

        public override string GetString()
        {
            return Strings.FromAsciiByteArray(m_contents);
        }

		public byte[] GetOctets()
        {
            return Arrays.Clone(m_contents);
        }

        internal override IAsn1Encoding GetEncoding(int encoding)
        {
            return new PrimitiveEncoding(Asn1Tags.Universal, Asn1Tags.GeneralString, m_contents);
        }

        internal override IAsn1Encoding GetEncodingImplicit(int encoding, int tagClass, int tagNo)
        {
            return new PrimitiveEncoding(tagClass, tagNo, m_contents);
        }

        protected override bool Asn1Equals(Asn1Object asn1Object)
        {
            DerGeneralString that = asn1Object as DerGeneralString;
            return null != that
                && Arrays.AreEqual(this.m_contents, that.m_contents);
        }

        protected override int Asn1GetHashCode()
        {
            return Arrays.GetHashCode(m_contents);
        }

        internal static DerGeneralString CreatePrimitive(byte[] contents)
        {
            return new DerGeneralString(contents, false);
        }
    }
}
