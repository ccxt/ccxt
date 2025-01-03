using System;
using System.IO;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1
{
    /**
     * Der PrintableString object.
     */
    public class DerPrintableString
        : DerStringBase
    {
        internal class Meta : Asn1UniversalType
        {
            internal static readonly Asn1UniversalType Instance = new Meta();

            private Meta() : base(typeof(DerPrintableString), Asn1Tags.PrintableString) {}

            internal override Asn1Object FromImplicitPrimitive(DerOctetString octetString)
            {
                return CreatePrimitive(octetString.GetOctets());
            }
        }

		/**
         * return a printable string from the passed in object.
         *
         * @exception ArgumentException if the object cannot be converted.
         */
        public static DerPrintableString GetInstance(object obj)
        {
            if (obj == null || obj is DerPrintableString)
            {
                return (DerPrintableString)obj;
            }
            else if (obj is IAsn1Convertible)
            {
                Asn1Object asn1Object = ((IAsn1Convertible)obj).ToAsn1Object();
                if (asn1Object is DerPrintableString)
                    return (DerPrintableString)asn1Object;
            }
            else if (obj is byte[])
            {
                try
                {
                    return (DerPrintableString)Meta.Instance.FromByteArray((byte[])obj);
                }
                catch (IOException e)
                {
                    throw new ArgumentException("failed to construct printable string from byte[]: " + e.Message);
                }
            }

            throw new ArgumentException("illegal object in GetInstance: " + Platform.GetTypeName(obj));
        }

        /**
         * return a printable string from a tagged object.
         *
         * @param taggedObject the tagged object holding the object we want
         * @param declaredExplicit true if the object is meant to be explicitly tagged false otherwise.
         * @exception ArgumentException if the tagged object cannot be converted.
         */
        public static DerPrintableString GetInstance(Asn1TaggedObject taggedObject, bool declaredExplicit)
        {
            return (DerPrintableString)Meta.Instance.GetContextInstance(taggedObject, declaredExplicit);
        }

        private readonly byte[] m_contents;

		public DerPrintableString(string str)
			: this(str, false)
		{
		}

		/**
		* Constructor with optional validation.
		*
		* @param string the base string to wrap.
		* @param validate whether or not to check the string.
		* @throws ArgumentException if validate is true and the string
		* contains characters that should not be in a PrintableString.
		*/
		public DerPrintableString(string str, bool validate)
		{
			if (str == null)
				throw new ArgumentNullException("str");
			if (validate && !IsPrintableString(str))
				throw new ArgumentException("string contains illegal characters", "str");

            m_contents = Strings.ToAsciiByteArray(str);
		}

        public DerPrintableString(byte[] contents)
            : this(contents, true)
        {
        }

        internal DerPrintableString(byte[] contents, bool clone)
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
            return new PrimitiveEncoding(Asn1Tags.Universal, Asn1Tags.PrintableString, m_contents);
        }

        internal override IAsn1Encoding GetEncodingImplicit(int encoding, int tagClass, int tagNo)
        {
            return new PrimitiveEncoding(tagClass, tagNo, m_contents);
        }

        protected override bool Asn1Equals(
			Asn1Object asn1Object)
		{
            DerPrintableString that = asn1Object as DerPrintableString;
            return null != that
                && Arrays.AreEqual(this.m_contents, that.m_contents);
        }

        protected override int Asn1GetHashCode()
        {
            return Arrays.GetHashCode(m_contents);
        }

        /**
		 * return true if the passed in String can be represented without
		 * loss as a PrintableString, false otherwise.
		 *
		 * @return true if in printable set, false otherwise.
		 */
        public static bool IsPrintableString(string str)
		{
			foreach (char ch in str)
			{
				if (ch > 0x007f)
					return false;

				if (char.IsLetterOrDigit(ch))
					continue;

//				if (char.IsPunctuation(ch))
//					continue;

				switch (ch)
				{
					case ' ':
					case '\'':
					case '(':
					case ')':
					case '+':
					case '-':
					case '.':
					case ':':
					case '=':
					case '?':
					case '/':
					case ',':
						continue;
				}

				return false;
			}

			return true;
		}

        internal static DerPrintableString CreatePrimitive(byte[] contents)
        {
            return new DerPrintableString(contents, false);
        }
    }
}
