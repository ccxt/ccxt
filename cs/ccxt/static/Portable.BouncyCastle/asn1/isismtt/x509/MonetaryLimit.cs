using System;

using Org.BouncyCastle.Math;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.IsisMtt.X509
{
	/**
	* Monetary limit for transactions. The QcEuMonetaryLimit QC statement MUST be
	* used in new certificates in place of the extension/attribute MonetaryLimit
	* since January 1, 2004. For the sake of backward compatibility with
	* certificates already in use, components SHOULD support MonetaryLimit (as well
	* as QcEuLimitValue).
	* <p/>
	* Indicates a monetary limit within which the certificate holder is authorized
	* to act. (This value DOES NOT express a limit on the liability of the
	* certification authority).
	* <p/>
	* <pre>
	*    MonetaryLimitSyntax ::= SEQUENCE
	*    {
	*      currency PrintableString (SIZE(3)),
	*      amount INTEGER,
	*      exponent INTEGER
	*    }
	* </pre>
	* <p/>
	* currency must be the ISO code.
	* <p/>
	* value = amount�10*exponent
	*/
	public class MonetaryLimit
		: Asn1Encodable
	{
		private readonly DerPrintableString	currency;
		private readonly DerInteger			amount;
		private readonly DerInteger			exponent;

		public static MonetaryLimit GetInstance(
			object obj)
		{
			if (obj == null || obj is MonetaryLimit)
			{
				return (MonetaryLimit) obj;
			}

			if (obj is Asn1Sequence)
			{
				return new MonetaryLimit(Asn1Sequence.GetInstance(obj));
			}

            throw new ArgumentException("unknown object in factory: " + Platform.GetTypeName(obj), "obj");
		}

		private MonetaryLimit(
			Asn1Sequence seq)
		{
			if (seq.Count != 3)
				throw new ArgumentException("Bad sequence size: " + seq.Count);

			currency = DerPrintableString.GetInstance(seq[0]);
			amount = DerInteger.GetInstance(seq[1]);
			exponent = DerInteger.GetInstance(seq[2]);
		}

		/**
		* Constructor from a given details.
		* <p/>
		* <p/>
		* value = amount�10^exponent
		*
		* @param currency The currency. Must be the ISO code.
		* @param amount   The amount
		* @param exponent The exponent
		*/
		public MonetaryLimit(
			string	currency,
			int		amount,
			int		exponent)
		{
			this.currency = new DerPrintableString(currency, true);
			this.amount = new DerInteger(amount);
			this.exponent = new DerInteger(exponent);
		}

		public virtual string Currency
		{
			get { return currency.GetString(); }
		}

		public virtual BigInteger Amount
		{
			get { return amount.Value; }
		}

		public virtual BigInteger Exponent
		{
			get { return exponent.Value; }
		}

		/**
		* Produce an object suitable for an Asn1OutputStream.
		* <p/>
		* Returns:
		* <p/>
		* <pre>
		*    MonetaryLimitSyntax ::= SEQUENCE
		*    {
		*      currency PrintableString (SIZE(3)),
		*      amount INTEGER,
		*      exponent INTEGER
		*    }
		* </pre>
		*
		* @return an Asn1Object
		*/
		public override Asn1Object ToAsn1Object()
		{
			return new DerSequence(currency, amount, exponent);
		}
	}
}
