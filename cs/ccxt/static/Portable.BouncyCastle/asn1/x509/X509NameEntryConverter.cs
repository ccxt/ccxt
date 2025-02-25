using System;
using System.Globalization;
using System.IO;
using System.Text;

using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Asn1.X509
{
    /**
     * It turns out that the number of standard ways the fields in a DN should be
     * encoded into their ASN.1 counterparts is rapidly approaching the
     * number of machines on the internet. By default the X509Name class
     * will produce UTF8Strings in line with the current recommendations (RFC 3280).
     * <p>
     * An example of an encoder look like below:
     * <pre>
     * public class X509DirEntryConverter
     *     : X509NameEntryConverter
     * {
     *     public Asn1Object GetConvertedValue(
     *         DerObjectIdentifier  oid,
     *         string               value)
     *     {
     *         if (str.Length() != 0 &amp;&amp; str.charAt(0) == '#')
     *         {
     *             return ConvertHexEncoded(str, 1);
     *         }
     *         if (oid.Equals(EmailAddress))
     *         {
     *             return new DerIA5String(str);
     *         }
     *         else if (CanBePrintable(str))
     *         {
     *             return new DerPrintableString(str);
     *         }
     *         else if (CanBeUTF8(str))
     *         {
     *             return new DerUtf8String(str);
     *         }
     *         else
     *         {
     *             return new DerBmpString(str);
     *         }
     *     }
     * }
	 * </pre>
	 * </p>
     */
    public abstract class X509NameEntryConverter
    {
        /**
         * Convert an inline encoded hex string rendition of an ASN.1
         * object back into its corresponding ASN.1 object.
         *
         * @param str the hex encoded object
         * @param off the index at which the encoding starts
         * @return the decoded object
         */
        protected Asn1Object ConvertHexEncoded(
            string	hexString,
            int		offset)
        {
            return Asn1Object.FromByteArray(Hex.DecodeStrict(hexString, offset, hexString.Length - offset));
        }

		/**
         * return true if the passed in string can be represented without
         * loss as a PrintableString, false otherwise.
         */
        protected bool CanBePrintable(
            string str)
        {
			return DerPrintableString.IsPrintableString(str);
        }

		/**
         * Convert the passed in string value into the appropriate ASN.1
         * encoded object.
         *
         * @param oid the oid associated with the value in the DN.
         * @param value the value of the particular DN component.
         * @return the ASN.1 equivalent for the value.
         */
        public abstract Asn1Object GetConvertedValue(DerObjectIdentifier oid, string value);
    }
}
