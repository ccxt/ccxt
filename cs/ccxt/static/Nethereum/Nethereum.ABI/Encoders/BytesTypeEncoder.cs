using System;
using System.Linq;
using Nethereum.ABI.Util;
using Nethereum.Util;

namespace Nethereum.ABI.Encoders
{
    public class BytesTypeEncoder : ITypeEncoder
    {
        private readonly IntTypeEncoder _intTypeEncoder;

        public BytesTypeEncoder()
        {
            _intTypeEncoder = new IntTypeEncoder();
        }

        public byte[] Encode(object value)
        {
            //default to false, this is a byte array we are not responsible for endianism
            return Encode(value, false);
        }

        public byte[] EncodePacked(object value)
        {
            if (!(value is byte[]))
                throw new Exception("byte[] value expected for type 'bytes'");
            return (byte[])value;
        }

        public byte[] Encode(object value, bool checkEndian)
        {
            if (!(value is byte[]))
                throw new Exception("byte[] value expected for type 'bytes'");
            var bb = (byte[]) value;

            if (bb.Length == 0)
            {
                var ret = new byte[] { };
                return ByteUtil.Merge(_intTypeEncoder.EncodeInt(bb.Length), ret);
            }
            else
            {

                var ret = new byte[((bb.Length - 1) / 32 + 1) * 32]; // padding 32 bytes
                //It should always be Big Endian.
                if (BitConverter.IsLittleEndian && checkEndian)
                    bb = bb.Reverse().ToArray();

                Array.Copy(bb, 0, ret, 0, bb.Length);

                return ByteUtil.Merge(_intTypeEncoder.EncodeInt(bb.Length), ret);
            }
        }
    }
}