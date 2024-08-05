using System.IO;

namespace Org.BouncyCastle.Asn1
{
	public abstract class Asn1Encodable
		: IAsn1Convertible
    {
		public const string Der = "DER";
		public const string Ber = "BER";

        public virtual void EncodeTo(Stream output)
        {
            ToAsn1Object().EncodeTo(output);
        }

        public virtual void EncodeTo(Stream output, string encoding)
        {
            ToAsn1Object().EncodeTo(output, encoding);
        }

		public byte[] GetEncoded()
        {
            MemoryStream bOut = new MemoryStream();
            ToAsn1Object().EncodeTo(bOut);
            return bOut.ToArray();
        }

        public byte[] GetEncoded(string encoding)
        {
            MemoryStream bOut = new MemoryStream();
            ToAsn1Object().EncodeTo(bOut, encoding);
            return bOut.ToArray();
        }

        /**
		* Return the DER encoding of the object, null if the DER encoding can not be made.
		*
		* @return a DER byte array, null otherwise.
		*/
        public byte[] GetDerEncoded()
		{
			try
			{
				return GetEncoded(Der);
			}
			catch (IOException)
			{
				return null;
			}
		}

		public sealed override int GetHashCode()
		{
			return ToAsn1Object().CallAsn1GetHashCode();
		}

		public sealed override bool Equals(
			object obj)
		{
			if (obj == this)
				return true;

			IAsn1Convertible other = obj as IAsn1Convertible;

			if (other == null)
				return false;

			Asn1Object o1 = ToAsn1Object();
			Asn1Object o2 = other.ToAsn1Object();

			return o1 == o2 || (null != o2 && o1.CallAsn1Equals(o2));
		}

		public abstract Asn1Object ToAsn1Object();
    }
}
