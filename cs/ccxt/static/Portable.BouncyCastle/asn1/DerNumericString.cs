using System;
using System.IO;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1
{
    /**
     * Der NumericString object - this is an ascii string of characters {0,1,2,3,4,5,6,7,8,9, }.
     */
    public class DerNumericString
        : DerStringBase
    {
        internal class Meta : Asn1UniversalType
        {
            internal static readonly Asn1UniversalType Instance = new Meta();

            private Meta() : base(typeof(DerNumericString), Asn1Tags.NumericString) {}

            internal override Asn1Object FromImplicitPrimitive(DerOctetString octetString)
            {
                return CreatePrimitive(octetString.GetOctets());
            }
        }

        /**
         * return a numeric string from the passed in object
         *
         * @exception ArgumentException if the object cannot be converted.
         */
        public static DerNumericString GetInstance(object obj)
        {
            if (obj == null || obj is DerNumericString)
            {
                return (DerNumericString)obj;
            }
            else if (obj is IAsn1Convertible)
            {
                Asn1Object asn1Object = ((IAsn1Convertible)obj).ToAsn1Object();
                if (asn1Object is DerNumericString)
                    return (DerNumericString)asn1Object;
            }
            else if (obj is byte[])
            {
                try
                {
                    return (DerNumericString)Meta.Instance.FromByteArray((byte[])obj);
                }
                catch (IOException e)
                {
                    throw new ArgumentException("failed to construct numeric string from byte[]: " + e.Message);
                }
            }

            throw new ArgumentException("illegal object in GetInstance: " + Platform.GetTypeName(obj));
        }

        /**
         * return a numeric string from a tagged object.
         *
         * @param taggedObject the tagged object holding the object we want
         * @param declaredExplicit true if the object is meant to be explicitly tagged false otherwise.
         * @exception ArgumentException if the tagged object cannot be converted.
         */
        public static DerNumericString GetInstance(Asn1TaggedObject taggedObject, bool declaredExplicit)
        {
            return (DerNumericString)Meta.Instance.GetContextInstance(taggedObject, declaredExplicit);
        }

        private readonly byte[] m_contents;

        public DerNumericString(string str)
            : this(str, false)
        {
        }

        /**
		* Constructor with optional validation.
		*
		* @param string the base string to wrap.
		* @param validate whether or not to check the string.
		* @throws ArgumentException if validate is true and the string
		* contains characters that should not be in a NumericString.
		*/
        public DerNumericString(string str, bool validate)
        {
            if (str == null)
                throw new ArgumentNullException("str");
            if (validate && !IsNumericString(str))
                throw new ArgumentException("string contains illegal characters", "str");

            m_contents = Strings.ToAsciiByteArray(str);
        }

        public DerNumericString(byte[] contents)
            : this(contents, true)
		{
		}

        internal DerNumericString(byte[] contents, bool clone)
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
            return new PrimitiveEncoding(Asn1Tags.Universal, Asn1Tags.NumericString, m_contents);
        }

        internal override IAsn1Encoding GetEncodingImplicit(int encoding, int tagClass, int tagNo)
        {
            return new PrimitiveEncoding(tagClass, tagNo, m_contents);
        }

        protected override bool Asn1Equals(Asn1Object asn1Object)
		{
			DerNumericString that = asn1Object as DerNumericString;
            return null != that
                && Arrays.AreEqual(this.m_contents, that.m_contents);
        }

        protected override int Asn1GetHashCode()
        {
            return Arrays.GetHashCode(m_contents);
        }

        /**
		 * Return true if the string can be represented as a NumericString ('0'..'9', ' ')
		 *
		 * @param str string to validate.
		 * @return true if numeric, fale otherwise.
		 */
        public static bool IsNumericString(string str)
		{
			foreach (char ch in str)
			{
				if (ch > 0x007f || (ch != ' ' && !char.IsDigit(ch)))
					return false;
			}

			return true;
		}

        internal static bool IsNumericString(byte[] contents)
        {
            for (int i = 0; i < contents.Length; ++i)
            {
                switch (contents[i])
                {
                case 0x20:
                case 0x30:
                case 0x31:
                case 0x32:
                case 0x33:
                case 0x34:
                case 0x35:
                case 0x36:
                case 0x37:
                case 0x38:
                case 0x39:
                    break;
                default:
                    return false;
                }
            }

            return true;
        }

        internal static DerNumericString CreatePrimitive(byte[] contents)
        {
            // TODO Validation - sort out exception types
            //if (!IsNumericString(contents))

            return new DerNumericString(contents, false);
        }
    }
}
