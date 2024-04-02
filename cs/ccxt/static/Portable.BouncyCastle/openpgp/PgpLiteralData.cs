using System;
using System.IO;

using Org.BouncyCastle.Utilities.Date;

namespace Org.BouncyCastle.Bcpg.OpenPgp
{
	/// <summary>Class for processing literal data objects.</summary>
    public class PgpLiteralData
		: PgpObject
    {
        public const char Binary = 'b';
        public const char Text = 't';
		public const char Utf8 = 'u';

		/// <summary>The special name indicating a "for your eyes only" packet.</summary>
        public const string Console = "_CONSOLE";

		private readonly LiteralDataPacket data;

		public PgpLiteralData(
            BcpgInputStream bcpgInput)
        {
            Packet packet = bcpgInput.ReadPacket();
            if (!(packet is LiteralDataPacket))
                throw new IOException("unexpected packet in stream: " + packet);

            this.data = (LiteralDataPacket)packet;
        }

		/// <summary>The format of the data stream - Binary or Text</summary>
        public int Format
        {
            get { return data.Format; }
        }

		/// <summary>The file name that's associated with the data stream.</summary>
        public string FileName
        {
			get { return data.FileName; }
        }

		/// Return the file name as an unintrepreted byte array.
		public byte[] GetRawFileName()
		{
			return data.GetRawFileName();
		}

		/// <summary>The modification time for the file.</summary>
        public DateTime ModificationTime
        {
			get { return DateTimeUtilities.UnixMsToDateTime(data.ModificationTime); }
        }

		/// <summary>The raw input stream for the data stream.</summary>
        public Stream GetInputStream()
        {
            return data.GetInputStream();
        }

		/// <summary>The input stream representing the data stream.</summary>
        public Stream GetDataStream()
        {
            return GetInputStream();
        }
    }
}
