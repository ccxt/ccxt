using System;
using System.IO;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1
{
    /**
     * IA5String object - this is an Ascii string.
     */
    public class DerIA5String
        : DerStringBase
    {
        internal class Meta : Asn1UniversalType
        {
            internal static readonly Asn1UniversalType Instance = new Meta();

            private Meta() : base(typeof(DerIA5String), Asn1Tags.IA5String) {}

            internal override Asn1Object FromImplicitPrimitive(DerOctetString octetString)
            {
                return CreatePrimitive(octetString.GetOctets());
            }
        }

        /**
         * return an IA5 string from the passed in object
         *
         * @exception ArgumentException if the object cannot be converted.
         */
        public static DerIA5String GetInstance(object obj)
        {
            if (obj == null || obj is DerIA5String)
            {
                return (DerIA5String)obj;
            }
            else if (obj is IAsn1Convertible)
            {
                Asn1Object asn1Object = ((IAsn1Convertible)obj).ToAsn1Object();
                if (asn1Object is DerIA5String)
                    return (DerIA5String)asn1Object;
            }
            else if (obj is byte[])
            {
                try
                {
                    return (DerIA5String)Meta.Instance.FromByteArray((byte[])obj);
                }
                catch (IOException e)
                {
                    throw new ArgumentException("failed to construct IA5 string from byte[]: " + e.Message);
                }
            }

            throw new ArgumentException("illegal object in GetInstance: " + Platform.GetTypeName(obj));
        }

        /**
         * return an IA5 string from a tagged object.
         *
         * @param taggedObject the tagged object holding the object we want
         * @param declaredExplicit true if the object is meant to be explicitly tagged false otherwise.
         * @exception ArgumentException if the tagged object cannot be converted.
         */
        public static DerIA5String GetInstance(Asn1TaggedObject taggedObject, bool declaredExplicit)
        {
            return (DerIA5String)Meta.Instance.GetContextInstance(taggedObject, declaredExplicit);
        }

        private readonly byte[] m_contents;

		public DerIA5String(string str)
			: this(str, false)
		{
		}

		/**
		* Constructor with optional validation.
		*
		* @param string the base string to wrap.
		* @param validate whether or not to check the string.
		* @throws ArgumentException if validate is true and the string
		* contains characters that should not be in an IA5String.
		*/
		public DerIA5String(string str, bool validate)
		{
			if (str == null)
				throw new ArgumentNullException("str");
			if (validate && !IsIA5String(str))
				throw new ArgumentException("string contains illegal characters", "str");

			m_contents = Strings.ToAsciiByteArray(str);
		}

        public DerIA5String(byte[] contents)
            : this(contents, true)
        {
        }

        internal DerIA5String(byte[] contents, bool clone)
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
            return new PrimitiveEncoding(Asn1Tags.Universal, Asn1Tags.IA5String, m_contents);
        }

        internal override IAsn1Encoding GetEncodingImplicit(int encoding, int tagClass, int tagNo)
        {
            return new PrimitiveEncoding(tagClass, tagNo, m_contents);
        }

        protected override bool Asn1Equals(Asn1Object asn1Object)
        {
            DerIA5String that = asn1Object as DerIA5String;
            return null != that
                && Arrays.AreEqual(this.m_contents, that.m_contents);
        }

        protected override int Asn1GetHashCode()
        {
            return Arrays.GetHashCode(m_contents);
        }

        /**
		 * return true if the passed in String can be represented without
		 * loss as an IA5String, false otherwise.
		 *
		 * @return true if in printable set, false otherwise.
		 */
        public static bool IsIA5String(string str)
		{
			foreach (char ch in str)
			{
				if (ch > 0x007f)
					return false;
			}

			return true;
		}

        internal static DerIA5String CreatePrimitive(byte[] contents)
        {
            return new DerIA5String(contents, false);
        }
    }
}
