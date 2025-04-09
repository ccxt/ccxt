using System;
using System.IO;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1
{
    /**
     * Der BMPString object.
     */
    public class DerBmpString
		: DerStringBase
    {
        internal class Meta : Asn1UniversalType
        {
            internal static readonly Asn1UniversalType Instance = new Meta();

            private Meta() : base(typeof(DerBmpString), Asn1Tags.BmpString) {}

            internal override Asn1Object FromImplicitPrimitive(DerOctetString octetString)
            {
                return CreatePrimitive(octetString.GetOctets());
            }
        }

		/**
         * return a BMP string from the given object.
         *
         * @param obj the object we want converted.
         * @exception ArgumentException if the object cannot be converted.
         */
        public static DerBmpString GetInstance(object obj)
        {
            if (obj == null || obj is DerBmpString)
            {
                return (DerBmpString)obj;
            }
            else if (obj is IAsn1Convertible)
            {
                Asn1Object asn1Object = ((IAsn1Convertible)obj).ToAsn1Object();
                if (asn1Object is DerBmpString)
                    return (DerBmpString)asn1Object;
            }
            else if (obj is byte[])
            {
                try
                {
                    return (DerBmpString)Meta.Instance.FromByteArray((byte[])obj);
                }
                catch (IOException e)
                {
                    throw new ArgumentException("failed to construct BMP string from byte[]: " + e.Message);
                }
            }

            throw new ArgumentException("illegal object in GetInstance: " + Platform.GetTypeName(obj));
        }

        /**
         * return a BMP string from a tagged object.
         *
         * @param taggedObject the tagged object holding the object we want
         * @param declaredExplicit true if the object is meant to be explicitly tagged false otherwise.
         * @exception ArgumentException if the tagged object cannot be converted.
         */
        public static DerBmpString GetInstance(Asn1TaggedObject taggedObject, bool declaredExplicit)
        {
            return (DerBmpString)Meta.Instance.GetContextInstance(taggedObject, declaredExplicit);
        }

        private readonly string m_str;

        internal DerBmpString(byte[] contents)
        {
			if (null == contents)
				throw new ArgumentNullException("contents");

            int byteLen = contents.Length;
            if (0 != (byteLen & 1))
                throw new ArgumentException("malformed BMPString encoding encountered", "contents");

            int charLen = byteLen / 2;
            char[] cs = new char[charLen];

            for (int i = 0; i != charLen; i++)
            {
                cs[i] = (char)((contents[2 * i] << 8) | (contents[2 * i + 1] & 0xff));
            }

            m_str = new string(cs);
        }

        internal DerBmpString(char[] str)
        {
            if (str == null)
                throw new ArgumentNullException("str");

            m_str = new string(str);
        }

        /**
         * basic constructor
         */
        public DerBmpString(string str)
        {
			if (str == null)
				throw new ArgumentNullException("str");

            m_str = str;
        }

        public override string GetString()
        {
            return m_str;
        }

        protected override bool Asn1Equals(Asn1Object asn1Object)
        {
            DerBmpString that = asn1Object as DerBmpString;
            return null != that
                && this.m_str.Equals(that.m_str);
        }

        protected override int Asn1GetHashCode()
        {
            return m_str.GetHashCode();
        }

        internal override IAsn1Encoding GetEncoding(int encoding)
        {
            return new PrimitiveEncoding(Asn1Tags.Universal, Asn1Tags.BmpString, GetContents());
        }

        internal override IAsn1Encoding GetEncodingImplicit(int encoding, int tagClass, int tagNo)
        {
            return new PrimitiveEncoding(tagClass, tagNo, GetContents());
        }

        private byte[] GetContents()
        {
            char[] c = m_str.ToCharArray();
            byte[] b = new byte[c.Length * 2];

            for (int i = 0; i != c.Length; i++)
            {
                b[2 * i] = (byte)(c[i] >> 8);
                b[2 * i + 1] = (byte)c[i];
            }

            return b;
        }

        internal static DerBmpString CreatePrimitive(byte[] contents)
        {
            return new DerBmpString(contents);
        }

        internal static DerBmpString CreatePrimitive(char[] str)
        {
            // TODO[asn1] Asn1InputStream has a validator/converter that should be unified in this class somehow
            return new DerBmpString(str);
        }
    }
}
