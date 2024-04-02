using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.X509.Qualified
{
    /**
    * The Iso4217CurrencyCode object.
    * <pre>
    * Iso4217CurrencyCode  ::=  CHOICE {
    *       alphabetic              PrintableString (SIZE 3), --Recommended
    *       numeric              INTEGER (1..999) }
    * -- Alphabetic or numeric currency code as defined in ISO 4217
    * -- It is recommended that the Alphabetic form is used
    * </pre>
    */
    public class Iso4217CurrencyCode
        : Asn1Encodable, IAsn1Choice
    {
        internal const int AlphabeticMaxSize = 3;
        internal const int NumericMinSize = 1;
        internal const int NumericMaxSize = 999;

		internal Asn1Encodable	obj;
//        internal int			numeric;

		public static Iso4217CurrencyCode GetInstance(
            object obj)
        {
            if (obj == null || obj is Iso4217CurrencyCode)
            {
                return (Iso4217CurrencyCode) obj;
            }

			if (obj is DerInteger)
            {
                DerInteger numericobj = DerInteger.GetInstance(obj);
                int numeric = numericobj.IntValueExact;
                return new Iso4217CurrencyCode(numeric);
            }

			if (obj is DerPrintableString)
            {
                DerPrintableString alphabetic = DerPrintableString.GetInstance(obj);
                return new Iso4217CurrencyCode(alphabetic.GetString());
            }

			throw new ArgumentException("unknown object in GetInstance: " + Platform.GetTypeName(obj), "obj");
        }

		public Iso4217CurrencyCode(
            int numeric)
        {
            if (numeric > NumericMaxSize || numeric < NumericMinSize)
            {
                throw new ArgumentException("wrong size in numeric code : not in (" + NumericMinSize + ".." + NumericMaxSize + ")");
            }

			obj = new DerInteger(numeric);
        }

		public Iso4217CurrencyCode(
            string alphabetic)
        {
            if (alphabetic.Length > AlphabeticMaxSize)
            {
                throw new ArgumentException("wrong size in alphabetic code : max size is " + AlphabeticMaxSize);
            }

			obj = new DerPrintableString(alphabetic);
        }

		public bool IsAlphabetic { get { return obj is DerPrintableString; } }

		public string Alphabetic { get { return ((DerPrintableString) obj).GetString(); } }

        public int Numeric { get { return ((DerInteger)obj).IntValueExact; } }

		public override Asn1Object ToAsn1Object()
        {
            return obj.ToAsn1Object();
        }
    }
}
