using System;
using System.IO;

namespace Org.BouncyCastle.Bcpg.Attr
{
    /// <remarks>Basic type for a image attribute packet.</remarks>
    public class ImageAttrib
        : UserAttributeSubpacket
    {
        public enum Format : byte
        {
            Jpeg = 1
        }

        private static readonly byte[] Zeroes = new byte[12];

        private int     hdrLength;
        private int     _version;
        private int     _encoding;
        private byte[]  imageData;

        public ImageAttrib(byte[] data)
            : this(false, data)
        {
        }

        public ImageAttrib(bool forceLongLength, byte[] data)
            : base(UserAttributeSubpacketTag.ImageAttribute, forceLongLength, data)
        {
            hdrLength = ((data[1] & 0xff) << 8) | (data[0] & 0xff);
            _version = data[2] & 0xff;
            _encoding = data[3] & 0xff;

            imageData = new byte[data.Length - hdrLength];
            Array.Copy(data, hdrLength, imageData, 0, imageData.Length);
        }

        public ImageAttrib(
            Format	imageType,
            byte[]	imageData)
            : this(ToByteArray(imageType, imageData))
        {
        }

        private static byte[] ToByteArray(
            Format	imageType,
            byte[]	imageData)
        {
            MemoryStream bOut = new MemoryStream();
            bOut.WriteByte(0x10); bOut.WriteByte(0x00); bOut.WriteByte(0x01);
            bOut.WriteByte((byte) imageType);
            bOut.Write(Zeroes, 0, Zeroes.Length);
            bOut.Write(imageData, 0, imageData.Length);
            return bOut.ToArray();
        }

        public virtual int Version
        {
            get { return _version; }
        }

        public virtual int Encoding
        {
            get { return _encoding; }
        }

        public virtual byte[] GetImageData()
        {
            return imageData;
        }
    }
}
