using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Cms;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities.Collections;
using Org.BouncyCastle.Utilities.IO;
using Org.BouncyCastle.X509;

namespace Org.BouncyCastle.Cms
{
    internal class CmsUtilities
    {
		// TODO Is there a .NET equivalent to this?
//		private static readonly Runtime RUNTIME = Runtime.getRuntime();

		internal static int MaximumMemory
		{
			get
			{
				// TODO Is there a .NET equivalent to this?
				long maxMem = int.MaxValue;//RUNTIME.maxMemory();

				if (maxMem > int.MaxValue)
				{
					return int.MaxValue;
				}

				return (int)maxMem;
			}
		}

		internal static ContentInfo ReadContentInfo(
			byte[] input)
		{
			// enforce limit checking as from a byte array
			return ReadContentInfo(new Asn1InputStream(input));
		}

		internal static ContentInfo ReadContentInfo(
			Stream input)
		{
			// enforce some limit checking
			return ReadContentInfo(new Asn1InputStream(input, MaximumMemory));
		}

		private static ContentInfo ReadContentInfo(
			Asn1InputStream aIn)
		{
			try
			{
				return ContentInfo.GetInstance(aIn.ReadObject());
			}
			catch (IOException e)
			{
				throw new CmsException("IOException reading content.", e);
			}
			catch (InvalidCastException e)
			{
				throw new CmsException("Malformed content.", e);
			}
			catch (ArgumentException e)
			{
				throw new CmsException("Malformed content.", e);
			}
		}

		internal static byte[] StreamToByteArray(Stream inStream)
        {
			return Streams.ReadAll(inStream);
        }

		internal static byte[] StreamToByteArray(Stream inStream, int limit)
        {
			return Streams.ReadAllLimited(inStream, limit);
        }

		internal static List<Asn1TaggedObject> GetAttributeCertificatesFromStore(
			IStore<X509V2AttributeCertificate> attrCertStore)
		{
			var result = new List<Asn1TaggedObject>();
			if (attrCertStore != null)
            {
				result.AddRange(
					attrCertStore.EnumerateMatches(null)
								 .Select(c => new DerTaggedObject(false, 2, c.AttributeCertificate)));
            }
			return result;
		}

		internal static List<X509CertificateStructure> GetCertificatesFromStore(IStore<X509Certificate> certStore)
		{
			var result = new List<X509CertificateStructure>();
			if (certStore != null)
            {
				result.AddRange(
					certStore.EnumerateMatches(null)
					         .Select(c => c.CertificateStructure));
			}
			return result;
		}

		internal static List<CertificateList> GetCrlsFromStore(IStore<X509Crl> crlStore)
		{
			var result = new List<CertificateList>();
			if (crlStore != null)
			{
				result.AddRange(
					crlStore.EnumerateMatches(null)
					        .Select(c => c.CertificateList));
			}
			return result;
		}

		internal static Asn1Set CreateBerSetFromList(IEnumerable<Asn1Encodable> elements)
		{
			Asn1EncodableVector v = new Asn1EncodableVector();

			foreach (Asn1Encodable element in elements)
			{
				v.Add(element);
			}

			return new BerSet(v);
		}

		internal static Asn1Set CreateDerSetFromList(IEnumerable<Asn1Encodable> elements)
		{
			Asn1EncodableVector v = new Asn1EncodableVector();

			foreach (Asn1Encodable element in elements)
			{
				v.Add(element);
			}

			return new DerSet(v);
		}

		internal static Stream CreateBerOctetOutputStream(Stream s, int tagNo, bool isExplicit, int bufferSize)
		{
			BerOctetStringGenerator octGen = new BerOctetStringGenerator(s, tagNo, isExplicit);
			return octGen.GetOctetOutputStream(bufferSize);
		}

		internal static TbsCertificateStructure GetTbsCertificateStructure(X509Certificate cert)
		{
			return TbsCertificateStructure.GetInstance(Asn1Object.FromByteArray(cert.GetTbsCertificate()));
		}

		internal static IssuerAndSerialNumber GetIssuerAndSerialNumber(X509Certificate cert)
		{
			TbsCertificateStructure tbsCert = GetTbsCertificateStructure(cert);
			return new IssuerAndSerialNumber(tbsCert.Issuer, tbsCert.SerialNumber.Value);
		}
	}
}
