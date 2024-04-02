using System;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Pkcs;
using Org.BouncyCastle.Asn1.X509;

namespace Org.BouncyCastle.Pkcs
{
	/**
	 * Utility class for reencoding PKCS#12 files to definite length.
	 */
	public class Pkcs12Utilities
	{
		/**
		 * Just re-encode the outer layer of the PKCS#12 file to definite length encoding.
		 *
		 * @param berPKCS12File - original PKCS#12 file
		 * @return a byte array representing the DER encoding of the PFX structure
		 * @throws IOException
		 */
		public static byte[] ConvertToDefiniteLength(
			byte[] berPkcs12File)
		{
            Pfx pfx = Pfx.GetInstance(berPkcs12File);

			return pfx.GetEncoded(Asn1Encodable.Der);
		}

		/**
		* Re-encode the PKCS#12 structure to definite length encoding at the inner layer
		* as well, recomputing the MAC accordingly.
		*
		* @param berPKCS12File - original PKCS12 file.
		* @param provider - provider to use for MAC calculation.
		* @return a byte array representing the DER encoding of the PFX structure.
		* @throws IOException on parsing, encoding errors.
		*/
		public static byte[] ConvertToDefiniteLength(
			byte[]	berPkcs12File,
			char[]	passwd)
		{
            Pfx pfx = Pfx.GetInstance(berPkcs12File);

			ContentInfo info = pfx.AuthSafe;

			Asn1OctetString content = Asn1OctetString.GetInstance(info.Content);
			Asn1Object obj = Asn1Object.FromByteArray(content.GetOctets());

			info = new ContentInfo(info.ContentType, new DerOctetString(obj.GetEncoded(Asn1Encodable.Der)));

			MacData mData = pfx.MacData;

			try
			{
				int itCount = mData.IterationCount.IntValue;
				byte[] data = Asn1OctetString.GetInstance(info.Content).GetOctets();
				byte[] res = Pkcs12Store.CalculatePbeMac(
                    mData.Mac.AlgorithmID.Algorithm, mData.GetSalt(), itCount, passwd, false, data);

				AlgorithmIdentifier algId = new AlgorithmIdentifier(
                    mData.Mac.AlgorithmID.Algorithm, DerNull.Instance);
				DigestInfo dInfo = new DigestInfo(algId, res);

				mData = new MacData(dInfo, mData.GetSalt(), itCount);
			}
			catch (Exception e)
			{
				throw new IOException("error constructing MAC: " + e.ToString());
			}

			pfx = new Pfx(info, mData);

			return pfx.GetEncoded(Asn1Encodable.Der);
		}
	}
}