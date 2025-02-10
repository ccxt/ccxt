using System.IO;

namespace Org.BouncyCastle.Asn1
{
    public abstract class Asn1Generator
    {
		private Stream _out;

		protected Asn1Generator(
			Stream outStream)
        {
            _out = outStream;
        }

		protected Stream Out
		{
			get { return _out; }
		}

		public abstract void AddObject(Asn1Encodable obj);

        public abstract void AddObject(Asn1Object obj);

        public abstract Stream GetRawOutputStream();

		public abstract void Close();
    }
}
