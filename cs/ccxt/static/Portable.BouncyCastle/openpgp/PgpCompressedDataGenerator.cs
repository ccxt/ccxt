using System;
using System.IO;

using Org.BouncyCastle.Bzip2;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Zlib;

namespace Org.BouncyCastle.Bcpg.OpenPgp
{
	/// <remarks>Class for producing compressed data packets.</remarks>
	public class PgpCompressedDataGenerator
		: IStreamGenerator
	{
		private readonly CompressionAlgorithmTag algorithm;
		private readonly int compression;

		private Stream dOut;
		private BcpgOutputStream pkOut;

		public PgpCompressedDataGenerator(
			CompressionAlgorithmTag algorithm)
			: this(algorithm, JZlib.Z_DEFAULT_COMPRESSION)
		{
		}

		public PgpCompressedDataGenerator(
			CompressionAlgorithmTag	algorithm,
			int						compression)
		{
			switch (algorithm)
			{
				case CompressionAlgorithmTag.Uncompressed:
				case CompressionAlgorithmTag.Zip:
				case CompressionAlgorithmTag.ZLib:
				case CompressionAlgorithmTag.BZip2:
					break;
				default:
					throw new ArgumentException("unknown compression algorithm", "algorithm");
			}

			if (compression != JZlib.Z_DEFAULT_COMPRESSION)
			{
				if ((compression < JZlib.Z_NO_COMPRESSION) || (compression > JZlib.Z_BEST_COMPRESSION))
				{
					throw new ArgumentException("unknown compression level: " + compression);
				}
			}

			this.algorithm = algorithm;
			this.compression = compression;
		}

		/// <summary>
		/// <p>
		/// Return an output stream which will save the data being written to
		/// the compressed object.
		/// </p>
		/// <p>
		/// The stream created can be closed off by either calling Close()
		/// on the stream or Close() on the generator. Closing the returned
		/// stream does not close off the Stream parameter <c>outStr</c>.
		/// </p>
		/// </summary>
		/// <param name="outStr">Stream to be used for output.</param>
		/// <returns>A Stream for output of the compressed data.</returns>
		/// <exception cref="ArgumentNullException"></exception>
		/// <exception cref="InvalidOperationException"></exception>
		/// <exception cref="IOException"></exception>
		public Stream Open(
			Stream outStr)
		{
			if (dOut != null)
				throw new InvalidOperationException("generator already in open state");
			if (outStr == null)
				throw new ArgumentNullException("outStr");

			this.pkOut = new BcpgOutputStream(outStr, PacketTag.CompressedData);

			DoOpen();

			return new WrappedGeneratorStream(this, dOut);
		}

		/// <summary>
		/// <p>
		/// Return an output stream which will compress the data as it is written to it.
		/// The stream will be written out in chunks according to the size of the passed in buffer.
		/// </p>
		/// <p>
		/// The stream created can be closed off by either calling Close()
		/// on the stream or Close() on the generator. Closing the returned
		/// stream does not close off the Stream parameter <c>outStr</c>.
		/// </p>
		/// <p>
		/// <b>Note</b>: if the buffer is not a power of 2 in length only the largest power of 2
		/// bytes worth of the buffer will be used.
		/// </p>
		/// <p>
		/// <b>Note</b>: using this may break compatibility with RFC 1991 compliant tools.
		/// Only recent OpenPGP implementations are capable of accepting these streams.
		/// </p>
		/// </summary>
		/// <param name="outStr">Stream to be used for output.</param>
		/// <param name="buffer">The buffer to use.</param>
		/// <returns>A Stream for output of the compressed data.</returns>
		/// <exception cref="ArgumentNullException"></exception>
		/// <exception cref="InvalidOperationException"></exception>
		/// <exception cref="IOException"></exception>
		/// <exception cref="PgpException"></exception>
		public Stream Open(
			Stream	outStr,
			byte[]	buffer)
		{
			if (dOut != null)
				throw new InvalidOperationException("generator already in open state");
			if (outStr == null)
				throw new ArgumentNullException("outStr");
			if (buffer == null)
				throw new ArgumentNullException("buffer");

			this.pkOut = new BcpgOutputStream(outStr, PacketTag.CompressedData, buffer);

			DoOpen();

			return new WrappedGeneratorStream(this, dOut);
		}

		private void DoOpen()
		{
			pkOut.WriteByte((byte) algorithm);

			switch (algorithm)
			{
				case CompressionAlgorithmTag.Uncompressed:
					dOut = pkOut;
					break;
				case CompressionAlgorithmTag.Zip:
					dOut = new SafeZOutputStream(pkOut, compression, true);
					break;
				case CompressionAlgorithmTag.ZLib:
					dOut = new SafeZOutputStream(pkOut, compression, false);
					break;
				case CompressionAlgorithmTag.BZip2:
					dOut = new SafeCBZip2OutputStream(pkOut);
					break;
				default:
					// Constructor should guard against this possibility
					throw new InvalidOperationException();
			}
		}

		/// <summary>Close the compressed object.</summary>summary>
		public void Close()
		{
			if (dOut != null)
			{
				if (dOut != pkOut)
				{
                    Platform.Dispose(dOut);
				}
				dOut = null;

				pkOut.Finish();
				pkOut.Flush();
				pkOut = null;
			}
		}

		private class SafeCBZip2OutputStream : CBZip2OutputStream
		{
			public SafeCBZip2OutputStream(Stream output)
				: base(output)
			{
			}

            protected override void Dispose(bool disposing)
            {
                Detach(disposing);
            }
		}

		private class SafeZOutputStream : ZOutputStream
		{
			public SafeZOutputStream(Stream output, int level, bool nowrap)
				: base(output, level, nowrap)
			{
			}

            protected override void Dispose(bool disposing)
            {
				Detach(disposing);
            }
		}
	}
}
