using System.IO;

using Org.BouncyCastle.Utilities.IO;

namespace Org.BouncyCastle.Asn1
{
    public abstract class BerGenerator
        : Asn1Generator
    {
        private bool      _tagged = false;
        private bool      _isExplicit;
        private int          _tagNo;

        protected BerGenerator(
            Stream outStream)
            : base(outStream)
        {
        }

        protected BerGenerator(
            Stream outStream,
            int tagNo,
            bool isExplicit)
            : base(outStream)
        {
            _tagged = true;
            _isExplicit = isExplicit;
            _tagNo = tagNo;
        }

		public override void AddObject(Asn1Encodable obj)
		{
            obj.EncodeTo(Out);
		}

        public override void AddObject(Asn1Object obj)
        {
            obj.EncodeTo(Out);
        }

        public override Stream GetRawOutputStream()
        {
            return Out;
        }

		public override void Close()
		{
			WriteBerEnd();
		}

        private void WriteHdr(
            int tag)
        {
            Out.WriteByte((byte) tag);
            Out.WriteByte(0x80);
        }

        protected void WriteBerHeader(
            int tag)
        {
            if (_tagged)
            {
                int tagNum = _tagNo | Asn1Tags.ContextSpecific;

                if (_isExplicit)
                {
                    WriteHdr(tagNum | Asn1Tags.Constructed);
                    WriteHdr(tag);
                }
                else
                {
                    if ((tag & Asn1Tags.Constructed) != 0)
                    {
                        WriteHdr(tagNum | Asn1Tags.Constructed);
                    }
                    else
                    {
                        WriteHdr(tagNum);
                    }
                }
            }
            else
            {
                WriteHdr(tag);
            }
        }

		protected void WriteBerBody(
            Stream contentStream)
        {
			Streams.PipeAll(contentStream, Out);
        }

		protected void WriteBerEnd()
        {
            Out.WriteByte(0x00);
            Out.WriteByte(0x00);

            if (_tagged && _isExplicit)  // write extra end for tag header
            {
                Out.WriteByte(0x00);
                Out.WriteByte(0x00);
            }
        }
    }
}
