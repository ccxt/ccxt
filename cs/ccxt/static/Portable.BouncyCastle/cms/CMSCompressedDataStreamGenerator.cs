using System;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Cms;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.IO;
using Org.BouncyCastle.Utilities.Zlib;

namespace Org.BouncyCastle.Cms
{
	/**
	* General class for generating a compressed CMS message stream.
	* <p>
	* A simple example of usage.
	* </p>
	* <pre>
	*      CMSCompressedDataStreamGenerator gen = new CMSCompressedDataStreamGenerator();
	*
	*      Stream cOut = gen.Open(outputStream, CMSCompressedDataStreamGenerator.ZLIB);
	*
	*      cOut.Write(data);
	*
	*      cOut.Close();
	* </pre>
	*/
	public class CmsCompressedDataStreamGenerator
	{
		public const string ZLib = "1.2.840.113549.1.9.16.3.8";

		private int _bufferSize;
		
		/**
		* base constructor
		*/
		public CmsCompressedDataStreamGenerator()
		{
		}

		/**
		* Set the underlying string size for encapsulated data
		*
		* @param bufferSize length of octet strings to buffer the data.
		*/
		public void SetBufferSize(
			int bufferSize)
		{
			_bufferSize = bufferSize;
		}

		public Stream Open(
			Stream	outStream,
			string	compressionOID)
		{
			return Open(outStream, CmsObjectIdentifiers.Data.Id, compressionOID);
		}

		public Stream Open(
			Stream	outStream,
			string	contentOID,
			string	compressionOID)
		{
			BerSequenceGenerator sGen = new BerSequenceGenerator(outStream);

			sGen.AddObject(CmsObjectIdentifiers.CompressedData);

			//
			// Compressed Data
			//
			BerSequenceGenerator cGen = new BerSequenceGenerator(
				sGen.GetRawOutputStream(), 0, true);

			// CMSVersion
			cGen.AddObject(new DerInteger(0));

			// CompressionAlgorithmIdentifier
			cGen.AddObject(new AlgorithmIdentifier(new DerObjectIdentifier(ZLib)));

			//
			// Encapsulated ContentInfo
			//
			BerSequenceGenerator eiGen = new BerSequenceGenerator(cGen.GetRawOutputStream());

			eiGen.AddObject(new DerObjectIdentifier(contentOID));

			Stream octetStream = CmsUtilities.CreateBerOctetOutputStream(
				eiGen.GetRawOutputStream(), 0, true, _bufferSize);

			return new CmsCompressedOutputStream(
				new ZOutputStream(octetStream, JZlib.Z_DEFAULT_COMPRESSION), sGen, cGen, eiGen);
		}

		private class CmsCompressedOutputStream
			: BaseOutputStream
		{
			private ZOutputStream _out;
			private BerSequenceGenerator _sGen;
			private BerSequenceGenerator _cGen;
			private BerSequenceGenerator _eiGen;

			internal CmsCompressedOutputStream(
				ZOutputStream			outStream,
				BerSequenceGenerator	sGen,
				BerSequenceGenerator	cGen,
				BerSequenceGenerator	eiGen)
			{
				_out = outStream;
				_sGen = sGen;
				_cGen = cGen;
				_eiGen = eiGen;
			}

			public override void Write(byte[] buffer, int offset, int count)
			{
				_out.Write(buffer, offset, count);
			}

			public override void WriteByte(byte value)
			{
				_out.WriteByte(value);
			}

            protected override void Dispose(bool disposing)
            {
                if (disposing)
                {
                    Platform.Dispose(_out);

                    // TODO Parent context(s) should really be be closed explicitly

                    _eiGen.Close();
				    _cGen.Close();
				    _sGen.Close();
                }
                base.Dispose(disposing);
            }
		}
	}
}
